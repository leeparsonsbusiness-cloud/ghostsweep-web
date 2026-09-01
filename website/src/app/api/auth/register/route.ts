import { NextRequest, NextResponse } from "next/server";
import { registerUser, getUserUnlockedAudits } from "@/lib/db";

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

    const regRes = registerUser(email, password);
    if (!regRes.success || !regRes.user) {
      return NextResponse.json(
        { success: false, error: regRes.error || "Failed to create account." },
        { status: 400 }
      );
    }

    const unlockedAudits = getUserUnlockedAudits(email);

    const response = NextResponse.json({
      success: true,
      user: {
        id: regRes.user.id,
        email: regRes.user.email,
      },
      unlockedAudits,
      message: `Account created successfully for ${email}!`,
    });

    response.cookies.set("gs_session", email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Register API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create account." },
      { status: 500 }
    );
  }
}
