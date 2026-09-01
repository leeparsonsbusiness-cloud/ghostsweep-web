import { NextRequest, NextResponse } from "next/server";
import { getUserUnlockedAudits } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const emailParam = searchParams.get("email");
  const sessionCookie = req.cookies.get("gs_session")?.value;
  const email = emailParam || sessionCookie;

  if (!email) {
    return NextResponse.json({
      success: true,
      authenticated: false,
      unlockedAudits: [],
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const unlockedAudits = getUserUnlockedAudits(cleanEmail);

  return NextResponse.json({
    success: true,
    authenticated: true,
    email: cleanEmail,
    unlockedAudits,
  });
}
