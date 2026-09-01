import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, createMagicToken, getUserUnlockedAudits } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    getOrCreateUser(email);
    const token = createMagicToken(email);
    const unlockedAudits = getUserUnlockedAudits(email);

    // In a production environment, send email via Resend/Postmark/SendGrid
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const magicUrl = `${origin}/?auth_token=${token}&email=${encodeURIComponent(email)}`;
    console.log(`[GhostSweep Magic Link] Generated for ${email}: ${magicUrl}`);

    return NextResponse.json({
      success: true,
      token,
      magicUrl,
      unlockedCount: unlockedAudits.length,
      message: `Authentication link generated for ${email}.`,
    });
  } catch (err: any) {
    console.error("Magic link error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate sign-in link" },
      { status: 500 }
    );
  }
}
