import { NextRequest, NextResponse } from "next/server";
import { registerUserAsync, getUserUnlockedAuditsAsync, getUserPlanAndUsageAsync, isBlockedEmail } from "@/lib/db";
import { createSessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email ? body.email.trim().toLowerCase() : "";
    const password = body.password ? body.password.trim() : "";

    if (!email || (!email.includes("@") && email !== "dev")) {
      return NextResponse.json(
        { success: false, error: "A valid email address or username is required." },
        { status: 400 }
      );
    }

    if (isBlockedEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Nah shorty.", blocked: true },
        { status: 403 }
      );
    }

    const regRes = await registerUserAsync(email, password);
    if (!regRes.success || !regRes.user) {
      return NextResponse.json(
        { success: false, error: regRes.error || "Failed to create account." },
        { status: 400 }
      );
    }

    const [unlockedAudits, usage] = await Promise.all([
      getUserUnlockedAuditsAsync(email),
      getUserPlanAndUsageAsync(email),
    ]);

    // Generate cryptographically signed stateless JWT session token
    const token = createSessionToken({
      email: regRes.user.email,
      userId: regRes.user.id,
      unlockedAudits,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: regRes.user.id,
        email: regRes.user.email,
        plan: usage.plan,
      },
      plan: usage.plan,
      unlockedAudits,
      message: `Account created successfully for ${email}!`,
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
    console.error("Register API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Registration failed." },
      { status: 500 }
    );
  }
}
