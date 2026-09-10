import { NextRequest, NextResponse } from "next/server";
import { ApifyClient } from "apify-client";
import { 
  normalizeTargetUsername, 
  recordFollowsSnapshot, 
  recordActivityEvents, 
  updateTrackedTarget, 
  RadarActivityEvent,
  isAuditUnlocked
} from "@/lib/db";
import { classifyAccount } from "@/lib/classifier";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * POST /api/user/targets/[username]/scan
 * Trigger an immediate on-demand radar diff scan for a specific target
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const rawUsername = params.username;
    if (!rawUsername) {
      return NextResponse.json({ success: false, error: "Username parameter is required" }, { status: 400 });
    }

    const cleanUsername = normalizeTargetUsername(rawUsername);
    const body = await req.json().catch(() => ({}));
    const email = body.email || req.cookies.get("gs_session")?.value;

    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      return NextResponse.json({ success: false, error: "APIFY_API_TOKEN not configured" }, { status: 500 });
    }

    const apifyClient = new ApifyClient({ token: token.trim() });
    const actorId = process.env.APIFY_ACTOR_ID || "scraping_solutions/instagram-scraper-followers-following-no-cookies";

    const input = {
      Account: [cleanUsername],
      usernames: [cleanUsername],
      dataToScrape: "Followings",
      resultsLimit: 500,
    };

    const run = await apifyClient.actor(actorId).call(input, { waitSecs: 60 });
    if (!run || !run.defaultDatasetId) {
      return NextResponse.json({ success: false, error: "Failed to scrape Instagram account." }, { status: 502 });
    }

    const dataset = await apifyClient.dataset(run.defaultDatasetId).listItems();
    const items = dataset.items || [];
    let follows = items;
    if (items.length === 1 && Array.isArray((items[0] as any).following)) {
      follows = (items[0] as any).following;
    } else if (items.length === 1 && Array.isArray((items[0] as any).data)) {
      follows = (items[0] as any).data;
    }

    const currentList = follows.map((item: any) =>
      (item.username || item.handle || "").replace(/^@/, "").trim().toLowerCase()
    ).filter(Boolean);

    if (currentList.length === 0) {
      return NextResponse.json({ success: false, error: "No public follows visible for this profile." }, { status: 400 });
    }

    // Run snapshot diff
    const diff = recordFollowsSnapshot(cleanUsername, "following", currentList);
    const now = new Date();
    const nowIso = now.toISOString();
    const timeFormatted = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const events: RadarActivityEvent[] = [];

    diff.newFollows.forEach((uname, idx) => {
      const rawItem: any = follows.find((f: any) => (f.username || f.handle || "").toLowerCase().replace(/^@/, "") === uname) || {};
      const classified = classifyAccount({
        username: uname,
        name: String(rawItem.fullName || rawItem.name || uname),
        avatar: String(rawItem.profilePicUrlHD || rawItem.profilePicUrl || ""),
        bio: String(rawItem.biography || rawItem.bio || ""),
        isVerified: Boolean(rawItem.isVerified || rawItem.verified),
        postCount: Number(rawItem.postsCount || 10),
        followersCount: Number(rawItem.followersCount || 500),
        followingCount: Number(rawItem.followingCount || 500),
        followsYou: false,
        chronologicalRank: idx,
        isNewFollow: true,
        detectedAt: "Today",
      });


      events.push({
        id: `ev_nf_${Date.now()}_${uname}`,
        targetUsername: cleanUsername,
        eventType: "NEW_FOLLOW",
        subjectUsername: uname,
        subjectName: classified.name,
        subjectAvatar: classified.avatar,
        subjectGender: classified.gender,
        isBrand: Boolean(classified.isBrand),
        isVerified: Boolean(classified.isVerified),
        detectedAt: nowIso,
        timeWindowFormatted: `Detected today at ${timeFormatted}`,
      });
    });

    diff.unfollowed.forEach((uname) => {
      events.push({
        id: `ev_uf_${Date.now()}_${uname}`,
        targetUsername: cleanUsername,
        eventType: "UNFOLLOW",
        subjectUsername: uname,
        subjectName: uname,
        subjectAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(uname)}&background=0284c7&color=fff`,
        subjectGender: "other",
        isBrand: false,
        isVerified: false,
        detectedAt: nowIso,
        timeWindowFormatted: `Detected today at ${timeFormatted}`,
      });
    });

    if (events.length > 0) {
      recordActivityEvents(cleanUsername, events);
    }

    if (email) {
      updateTrackedTarget(email, cleanUsername, {
        lastScannedAt: nowIso,
        lastKnownFollowingCount: currentList.length,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        targetUsername: cleanUsername,
        isBaseline: diff.isBaseline,
        baselineCount: diff.baselineCount,
        newFollowsCount: diff.newFollows.length,
        unfollowedCount: diff.unfollowed.length,
        newFollows: diff.newFollows,
        unfollowed: diff.unfollowed,
        scannedAt: nowIso,
      },
    });
  } catch (err: any) {
    console.error("[Target Scan POST] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
