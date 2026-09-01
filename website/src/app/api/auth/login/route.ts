import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, getUserUnlockedAudits } from "@/lib/db";
import { createSessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email ? body.email.trim().toLowerCase() : "";
    const password = body.password ? body.password.trim() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const authRes = authenticateUser(email, password);
    if (!authRes.success || !authRes.user) {
      return NextResponse.json(
        { success: false, error: authRes.error || "Authentication failed." },
        { status: 401 }
      );
    }

    const unlockedAudits = getUserUnlockedAudits(email);

    // Generate cryptographically signed stateless JWT session token
    const token = createSessionToken({
      email: authRes.user.email,
      userId: authRes.user.id,
      unlockedAudits,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: authRes.user.id,
        email: authRes.user.email,
      },
      unlockedAudits,
      message: `Welcome back, ${email}!`,
    });

    // Set secure httpOnly cookie
    response.cookies.set("gs_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to sign in." },
      { status: 500 }
    );
  }
}
