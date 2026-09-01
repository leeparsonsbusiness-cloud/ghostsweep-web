import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken, getUserUnlockedAudits } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token;
    const directEmail = body.email;

    if (!token && !directEmail) {
      return NextResponse.json(
        { success: false, error: "Authentication token is required." },
        { status: 400 }
      );
    }

    let email = directEmail ? directEmail.trim().toLowerCase() : "";

    if (token) {
      const verification = verifyMagicToken(token);
      if (!verification.valid || !verification.email) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired login link." },
          { status: 401 }
        );
      }
      email = verification.email;
    }

    const unlockedAudits = getUserUnlockedAudits(email);

    const response = NextResponse.json({
      success: true,
      email,
      unlockedAudits,
      message: `Signed in as ${email}`,
    });

    // Set HTTP-only session cookie
    response.cookies.set({
      name: "gs_session",
      value: email,
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
