import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { unlockAudit, getOrCreateUser, normalizeTargetUsername, setUserPlan } from "@/lib/db";

export interface CheckoutRequest {
  email: string;
  target_username?: string;
  plan?: "standard" | "unlimited";
  type?: "following" | "followers";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutRequest;
    const email = body.email ? body.email.trim().toLowerCase() : "";
    const rawTarget = body.target_username || "theleeparsons";
    const targetUsername = normalizeTargetUsername(rawTarget);
    const plan = body.plan === "unlimited" ? "unlimited" : "standard";
    const isUnlimited = plan === "unlimited";
    const planName = isUnlimited 
      ? "GhostSweep Pro — 30 Searches / Week" 
      : "GhostSweep — Unlock the Truth";
    const planDesc = isUnlimited
      ? "30 deep Instagram profile searches per week + priority scraping engine. Recurring monthly subscription."
      : `Instant full report unlock for @${targetUsername} + 10 profile searches per week. One-time fee.`;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const user = getOrCreateUser(email);
    const origin = req.nextUrl.origin || req.headers.get("origin") || req.headers.get("referer") || "https://ghostsweep.info";
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // Live Stripe Checkout Session
    if (stripeSecretKey && stripeSecretKey.startsWith("sk_")) {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2026-08-26.dahlia" as any,
      });

      const lineItem: any = isUnlimited
        ? {
            price_data: {
              currency: "usd",
              product_data: {
                name: planName,
                description: planDesc,
                images: ["https://ghostsweep.info/og-image.png"],
              },
              unit_amount: 999,
              recurring: { interval: "month" },
            },
            quantity: 1,
          }
        : {
            price_data: {
              currency: "usd",
              product_data: {
                name: planName,
                description: planDesc,
                images: ["https://ghostsweep.info/og-image.png"],
              },
              unit_amount: 399,
            },
            quantity: 1,
          };

      const session = await stripe.checkout.sessions.create({
        line_items: [lineItem],
        mode: isUnlimited ? "subscription" : "payment",
        customer_email: email,
        metadata: {
          user_id: user.id,
          email: email,
          plan: plan,
          target_username: targetUsername,
        },
        success_url: `${origin}/?unlocked=true&username=${encodeURIComponent(targetUsername)}&email=${encodeURIComponent(email)}&plan=${plan}`,
        cancel_url: `${origin}/?cancelled=true&username=${encodeURIComponent(targetUsername)}`,
      });

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        url: session.url,
      });
    }

    // Fallback sandbox / dev unlock
    setUserPlan(email, plan);
    unlockAudit(email, targetUsername);

    return NextResponse.json({
      success: true,
      unlocked: true,
      email,
      plan,
      target_username: targetUsername,
      message: `${planName} activated successfully.`,
      redirectUrl: `/?unlocked=true&username=${encodeURIComponent(targetUsername)}&email=${encodeURIComponent(email)}&plan=${plan}`,
    });
  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
