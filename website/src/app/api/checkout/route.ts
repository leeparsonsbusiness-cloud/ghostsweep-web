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
    const amount = isUnlimited ? 999 : 399; // $9.99 or $3.99
    const planName = isUnlimited ? "GhostSweep Unlimited Plan" : "GhostSweep Standard Plan";
    const planDesc = isUnlimited
      ? "Unlimited monthly Instagram forensic account searches & deep intelligence reports."
      : "Monthly Instagram forensic account audits & deep intelligence reports.";

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

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: planName,
                description: planDesc,
                images: ["https://ghostsweep.info/og-image.png"],
              },
              unit_amount: amount,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
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
