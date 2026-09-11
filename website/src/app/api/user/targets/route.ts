import { NextRequest, NextResponse } from "next/server";
import { ApifyClient } from "apify-client";
import { 
  addTrackedTarget, 
  getTrackedTargets, 
  removeTrackedTarget, 
  getUserPlanAndUsage, 
  getUserPlanAndUsageAsync,
  recordFollowsSnapshot,
  normalizeTargetUsername,
  isVipEmail
} from "@/lib/db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * GET /api/user/targets
 * Fetch list of all monitored targets for the user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || req.cookies.get("gs_session")?.value;

    if (!email) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const targets = getTrackedTargets(email);
    const planInfo = await getUserPlanAndUsageAsync(email);
    const isVip = isVipEmail(email);
    const maxTargets = isVip || planInfo.plan === "unlimited" ? 999 : planInfo.plan === "standard" ? 3 : 1;

    return NextResponse.json({
      success: true,
      data: {
        targets,
        plan: planInfo.plan,
        maxTargets,
        activeCount: targets.filter((t) => t.status === "active").length,
      },
    });
  } catch (err: any) {
    console.error("[Targets GET] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/user/targets
 * Add a target to active radar tracking & initialize baseline snapshot
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawTarget = body.targetUsername || body.username;
    const email = body.email || req.cookies.get("gs_session")?.value;
    const frequencyHours = body.frequencyHours || 12;
    const targetType = body.targetType || "following";

    if (!email) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    if (!rawTarget) {
      return NextResponse.json({ success: false, error: "Target Instagram username is required" }, { status: 400 });
    }

    const cleanTarget = normalizeTargetUsername(rawTarget);

    // Add target to DB
    const addResult = addTrackedTarget(email, cleanTarget, frequencyHours, targetType);
    if (!addResult.success || !addResult.target) {
      return NextResponse.json({ success: false, error: addResult.error }, { status: 403 });
    }

    // Initialize baseline snapshot if Apify token exists
    const token = process.env.APIFY_API_TOKEN;
    if (token) {
      try {
        const apifyClient = new ApifyClient({ token: token.trim() });
        const actorId = process.env.APIFY_ACTOR_ID || "scraping_solutions/instagram-scraper-followers-following-no-cookies";

        const input = {
          Account: [cleanTarget],
          usernames: [cleanTarget],
          dataToScrape: "Followings",
          resultsLimit: 500,
        };

        const run = await apifyClient.actor(actorId).call(input, { waitSecs: 45 });
        if (run?.defaultDatasetId) {
          const dataset = await apifyClient.dataset(run.defaultDatasetId).listItems();
          const items = dataset.items || [];
          let follows = items;
          if (items.length === 1 && Array.isArray((items[0] as any).following)) {
            follows = (items[0] as any).following;
          }

          const currentList = follows.map((item: any) =>
            (item.username || item.handle || "").replace(/^@/, "").trim().toLowerCase()
          ).filter(Boolean);

          if (currentList.length > 0) {
            recordFollowsSnapshot(cleanTarget, "following", currentList);
          }
        }
      } catch (scrapeErr: any) {
        console.warn(`[Targets POST] Baseline scrape warning for @${cleanTarget}:`, scrapeErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Radar tracking activated for @${cleanTarget}`,
      data: addResult.target,
    });
  } catch (err: any) {
    console.error("[Targets POST] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/user/targets
 * Remove an account from active radar tracking
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawTarget = searchParams.get("targetUsername") || searchParams.get("username");
    const email = searchParams.get("email") || req.cookies.get("gs_session")?.value;

    if (!email) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    if (!rawTarget) {
      return NextResponse.json({ success: false, error: "Target username is required" }, { status: 400 });
    }

    const cleanTarget = normalizeTargetUsername(rawTarget);
    const removed = removeTrackedTarget(email, cleanTarget);

    return NextResponse.json({
      success: removed,
      message: removed ? `Removed @${cleanTarget} from tracking` : `Target @${cleanTarget} not found`,
    });
  } catch (err: any) {
    console.error("[Targets DELETE] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
