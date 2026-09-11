import { NextRequest, NextResponse } from "next/server";
import { recordAnalyticsEvent, pingActiveSession, AnalyticsEventType } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      event_type,
      session_id,
      path,
      referrer,
      device_type,
      target_username,
      metadata,
    } = body;

    if (!session_id) {
      return NextResponse.json({ success: false, error: "Missing session_id" }, { status: 400 });
    }

    const cleanType = (event_type || "PAGE_VIEW") as AnalyticsEventType;
    const cleanPath = path || "/";
    const cleanDevice = device_type || "mobile";
    const cleanRef = referrer || "direct";

    // 1. If HEARTBEAT or PAGE_VIEW, update active viewer session
    if (cleanType === "HEARTBEAT" || cleanType === "PAGE_VIEW") {
      await pingActiveSession(session_id, cleanPath, cleanDevice, cleanRef);
    }

    // 2. Record full event to database
    await recordAnalyticsEvent({
      event_type: cleanType,
      session_id,
      path: cleanPath,
      referrer: cleanRef,
      device_type: cleanDevice,
      target_username,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
