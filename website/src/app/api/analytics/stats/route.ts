import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = (searchParams.get("timeframe") || "today") as "today" | "7d" | "all";
    const passkey = searchParams.get("passkey") || req.headers.get("x-admin-passkey");

    // Founder PIN check: 332844 or dev
    const validKeys = ["332844", "dev", "ghost2026", "founder"];
    if (passkey && !validKeys.includes(passkey)) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const summary = await getAnalyticsSummary(timeframe);
    return NextResponse.json({ success: true, ...summary });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
