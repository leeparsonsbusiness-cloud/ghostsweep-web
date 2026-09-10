import { NextRequest, NextResponse } from "next/server";
import { getTargetActivityEvents, normalizeTargetUsername } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/targets/[username]/activity
 * Fetch chronological activity event timeline for a monitored target
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const rawUsername = params.username;
    if (!rawUsername) {
      return NextResponse.json({ success: false, error: "Username parameter is required" }, { status: 400 });
    }

    const cleanUsername = normalizeTargetUsername(rawUsername);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const events = getTargetActivityEvents(cleanUsername, limit);

    return NextResponse.json({
      success: true,
      data: {
        targetUsername: cleanUsername,
        totalEvents: events.length,
        events,
      },
    });
  } catch (err: any) {
    console.error("[Target Activity GET] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
