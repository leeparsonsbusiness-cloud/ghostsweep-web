import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken, getUserUnlockedAudits, getOrCreateUser } from "@/lib/db";
import { verifySessionToken, createSessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token;
    const directEmail = body.email;

    let email = directEmail ? directEmail.trim().toLowerCase() : "";
    let unlockedAudits: string[] = [];

    // 1. Check if token is a stateless JWT session token
    if (token && token.includes(".")) {
      const session = verifySessionToken(token);
      if (session.valid && session.email) {
        email = session.email;
        unlockedAudits = session.unlockedAudits || getUserUnlockedAudits(email);
      }
    }

    // 2. Check if token is a magic link token
    if (!email && token) {
      const verification = verifyMagicToken(token);
      if (verification.valid && verification.email) {
        email = verification.email;
        unlockedAudits = getUserUnlockedAudits(email);
      }
    }

    // 3. Fallback to directEmail
    if (!email && directEmail && directEmail.includes("@")) {
      email = directEmail.trim().toLowerCase();
      unlockedAudits = getUserUnlockedAudits(email);
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session token." },
        { status: 401 }
      );
    }

    const user = getOrCreateUser(email);
    const sessionJwt = createSessionToken({
      email,
      userId: user.id,
      unlockedAudits,
    });

    const response = NextResponse.json({
      success: true,
      email,
      token: sessionJwt,
      unlockedAudits,
      message: `Signed in as ${email}`,
    });

    response.cookies.set({
      name: "gs_session",
      value: sessionJwt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Auth verify error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to verify authentication token" },
      { status: 500 }
    );
  }
}
