import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { unlockAudit, getOrCreateUser, normalizeTargetUsername } from "@/lib/db";

export interface CheckoutRequest {
  email: string;
  target_username: string;
  type?: "following" | "followers";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutRequest;
    const email = body.email ? body.email.trim().toLowerCase() : "";
    const rawTarget = body.target_username || "alex.creator";
    const targetUsername = normalizeTargetUsername(rawTarget);
    const auditType = body.type || "following";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // Ensure user exists in SQLite DB
    const user = getOrCreateUser(email);

    const origin = req.nextUrl.origin || req.headers.get("origin") || req.headers.get("referer") || "http://localhost:3000";
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // If live Stripe Secret Key is present, initialize Stripe Checkout Session
    if (stripeSecretKey && stripeSecretKey.startsWith("sk_")) {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2026-08-26.dahlia" as any,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `GhostSweep Intelligence Audit: @${targetUsername}`,
                description: `Full forensic chronological audit list & demographic intelligence report for @${targetUsername}.`,
                images: ["https://ghostsweep.info/og-image.png"],
              },
              unit_amount: 199, // $1.99
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        customer_email: email,
        metadata: {
          user_id: user.id,
          email: email,
          target_username: targetUsername,
          type: auditType,
        },
        success_url: `${origin}/?unlocked=true&username=${encodeURIComponent(targetUsername)}&email=${encodeURIComponent(email)}`,
        cancel_url: `${origin}/?cancelled=true&username=${encodeURIComponent(targetUsername)}`,
      });

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        url: session.url,
      });
    }

    // Fallback Sandbox / Dev Mode (Instant $1.99 unlock execution without requiring live Stripe keys)
    unlockAudit(email, targetUsername);

    return NextResponse.json({
      success: true,
      unlocked: true,
      email,
      target_username: targetUsername,
      message: "Report unlocked successfully.",
      redirectUrl: `/?unlocked=true&username=${encodeURIComponent(targetUsername)}&email=${encodeURIComponent(email)}`,
    });
  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
