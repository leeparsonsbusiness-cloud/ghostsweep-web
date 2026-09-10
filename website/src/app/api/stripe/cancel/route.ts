import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserByEmail, setUserPlan } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || req.cookies.get("gs_session")?.value;

    if (!email) {
      return NextResponse.json({ success: false, error: "Please sign in to cancel your subscription." }, { status: 401 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ success: false, error: "Stripe configuration missing." }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20" as any,
    });

    const user = getUserByEmail(email);
    let customerId = user?.stripe_customer_id;

    if (!customerId) {
      const customers = await stripe.customers.list({ email: email.toLowerCase(), limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    if (!customerId) {
      return NextResponse.json({ success: false, error: "No subscription found for this account." }, { status: 404 });
    }

    // Find active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 5,
    });

    if (subscriptions.data.length === 0) {
      setUserPlan(email, "free");
      return NextResponse.json({ success: true, message: "No active subscription to cancel. Plan set to free." });
    }

    // Cancel active subscriptions at period end (allows user access until end of paid billing cycle)
    for (const sub of subscriptions.data) {
      await stripe.subscriptions.update(sub.id, {
        cancel_at_period_end: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your subscription has been cancelled. You will retain access until the end of your current billing period.",
    });
  } catch (err: any) {
    console.error("[Stripe Cancel] Exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
