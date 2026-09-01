import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, getUserUnlockedAudits } from "@/lib/db";

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

    const response = NextResponse.json({
      success: true,
      user: {
        id: authRes.user.id,
        email: authRes.user.email,
      },
      unlockedAudits,
      message: `Welcome back, ${email}!`,
    });

    response.cookies.set("gs_session", email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
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
