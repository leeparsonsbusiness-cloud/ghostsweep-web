import { NextRequest, NextResponse } from "next/server";
import { getUserUnlockedAudits } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const emailParam = searchParams.get("email");
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const sessionCookie = req.cookies.get("gs_session")?.value;

  let email: string | null = null;
  let unlockedAudits: string[] = [];

  // 1. Check Bearer token or sessionCookie as JWT
  const tokenCandidate = bearerToken || sessionCookie;
  if (tokenCandidate && tokenCandidate.includes(".")) {
    const verified = verifySessionToken(tokenCandidate);
    if (verified.valid && verified.email) {
      email = verified.email;
      unlockedAudits = verified.unlockedAudits || [];
    }
  }

  // 2. Fallback to direct email
  if (!email) {
    if (emailParam && emailParam.includes("@")) {
      email = emailParam.trim().toLowerCase();
    } else if (sessionCookie && sessionCookie.includes("@") && !sessionCookie.includes(".")) {
      email = sessionCookie.trim().toLowerCase();
    }
  }

  if (!email) {
    return NextResponse.json({
      success: true,
      authenticated: false,
      unlockedAudits: [],
    });
  }

  // Fetch from DB storage if empty
  if (unlockedAudits.length === 0) {
    unlockedAudits = getUserUnlockedAudits(email);
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    email,
    unlockedAudits,
  });
}
