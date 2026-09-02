import { NextRequest, NextResponse } from "next/server";
import { getUserAuditHistory, recordAuditHistory, normalizeTargetUsername } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || req.cookies.get("gs_session")?.value;

    if (!email) {
      return NextResponse.json({ success: true, history: [] });
    }

    const history = getUserAuditHistory(email);
    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email || req.cookies.get("gs_session")?.value;
    const rawTarget = body.username;

    if (!email || !rawTarget) {
      return NextResponse.json({ success: false, error: "Missing email or username" }, { status: 400 });
    }

    const cleanTarget = normalizeTargetUsername(rawTarget);
    recordAuditHistory(email, {
      username: cleanTarget,
      name: body.name || cleanTarget,
      avatar: body.avatar,
      targetType: body.targetType || "following",
    });

    const updatedHistory = getUserAuditHistory(email);
    return NextResponse.json({ success: true, history: updatedHistory });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
