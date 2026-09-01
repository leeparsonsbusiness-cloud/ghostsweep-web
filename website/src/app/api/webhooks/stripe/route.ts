import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { unlockAudit, getOrCreateUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const rawBody = await req.text();
    let event: Stripe.Event;

    if (stripeSecretKey && webhookSecret) {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2026-08-26.dahlia" as any,
      });
      const signature = req.headers.get("stripe-signature");
      if (!signature) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
      }
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      event = JSON.parse(rawBody) as Stripe.Event;
    }

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};
      const targetUsername = metadata.target_username;
      const email = session.customer_details?.email || metadata.email;
      const customerId = typeof session.customer === "string" ? session.customer : undefined;

      if (email && targetUsername) {
        getOrCreateUser(email, customerId);
        unlockAudit(email, targetUsername);
        console.log(`[Stripe Webhook] Successfully unlocked audit for target: @${targetUsername}, user: ${email}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[Stripe Webhook Error]:", err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }
}
