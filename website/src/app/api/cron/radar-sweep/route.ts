import { NextRequest, NextResponse } from "next/server";
import { ApifyClient } from "apify-client";
import { 
  getAllActiveTargetsDueForScan, 
  updateTrackedTarget, 
  recordFollowsSnapshot, 
  recordActivityEvents,
  RadarActivityEvent 
} from "@/lib/db";
import { classifyAccount } from "@/lib/classifier";

export const maxDuration = 300; // 5 minutes for cron execution
export const dynamic = "force-dynamic";

/**
 * Automated DolphinRadar Background Sweep
 * Triggered periodically (e.g. every 6-12 hours) via Vercel Cron or on-demand
 */
export async function GET(req: NextRequest) {
  return handleRadarSweep(req);
}

export async function POST(req: NextRequest) {
  return handleRadarSweep(req);
}

async function handleRadarSweep(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const urlSecret = req.nextUrl.searchParams.get("secret");

    // Verify authorization if CRON_SECRET is configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && urlSecret !== cronSecret) {
      // In development, allow testing without secret
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "APIFY_API_TOKEN is not configured" },
        { status: 500 }
      );
    }

    const targets = getAllActiveTargetsDueForScan();
    console.log(`[Radar Cron] Starting radar sweep for ${targets.length} active target(s)...`);

    if (targets.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No targets currently due for radar scan.",
        scannedCount: 0,
        totalNewFollows: 0,
        totalUnfollows: 0,
      });
    }

    const apifyClient = new ApifyClient({ token: token.trim() });
    const actorId = process.env.APIFY_ACTOR_ID || "scraping_solutions/instagram-scraper-followers-following-no-cookies";

    let totalNewFollows = 0;
    let totalUnfollows = 0;
    const sweepResults: any[] = [];

    // Process targets sequentially or in small batches to preserve memory
    for (const target of targets) {
      try {
        console.log(`[Radar Cron] Scanning @${target.targetUsername} (Owner: ${target.userEmail})...`);

        const input = {
          Account: [target.targetUsername],
          usernames: [target.targetUsername],
          dataToScrape: "Followings",
          resultsLimit: 500,
        };

        const run = await apifyClient.actor(actorId).call(input, { waitSecs: 60 });
        if (!run || !run.defaultDatasetId) {
          console.warn(`[Radar Cron] Failed run for @${target.targetUsername}`);
          continue;
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
          console.warn(`[Radar Cron] No follows returned for @${target.targetUsername}`);
          continue;
        }

        // Run Snapshot Diff
        const diff = recordFollowsSnapshot(target.targetUsername, "following", currentList);

        const now = new Date();
        const nowIso = now.toISOString();
        const timeFormatted = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        const events: RadarActivityEvent[] = [];

        // Classify and create events for new follows
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
            targetUsername: target.targetUsername,
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

        // Create events for unfollows
        diff.unfollowed.forEach((uname) => {
          events.push({
            id: `ev_uf_${Date.now()}_${uname}`,
            targetUsername: target.targetUsername,
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
          recordActivityEvents(target.targetUsername, events);
        }

        const newDetectedCount = (target.totalNewFollowsDetected || 0) + diff.newFollows.length;
        const newUnfollowedCount = (target.totalUnfollowsDetected || 0) + diff.unfollowed.length;
        const nextScanAt = new Date(now.getTime() + target.frequencyHours * 60 * 60 * 1000).toISOString();

        updateTrackedTarget(target.userEmail, target.targetUsername, {
          lastScannedAt: nowIso,
          nextScanAt,
          totalNewFollowsDetected: newDetectedCount,
          totalUnfollowsDetected: newUnfollowedCount,
          lastKnownFollowingCount: currentList.length,
        });

        totalNewFollows += diff.newFollows.length;
        totalUnfollows += diff.unfollowed.length;

        sweepResults.push({
          target: target.targetUsername,
          owner: target.userEmail,
          isBaseline: diff.isBaseline,
          newFollows: diff.newFollows.length,
          unfollowed: diff.unfollowed.length,
        });
      } catch (err: any) {
        console.error(`[Radar Cron] Error scanning @${target.targetUsername}:`, err.message);
      }
    }

    console.log(`[Radar Cron] Sweep complete. ${targets.length} targets checked, ${totalNewFollows} new follows, ${totalUnfollows} unfollows.`);

    return NextResponse.json({
      success: true,
      scannedCount: targets.length,
      totalNewFollows,
      totalUnfollows,
      results: sweepResults,
    });
  } catch (error: any) {
    console.error("[Radar Cron] Fatal error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Radar sweep failed." },
      { status: 500 }
    );
  }
}
