import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserByEmail } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || req.cookies.get("gs_session")?.value;

    if (!email) {
      return NextResponse.json({ success: false, error: "Please sign in to manage your subscription." }, { status: 401 });
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

    // Look up customer in Stripe by email if not cached
    if (!customerId) {
      const customers = await stripe.customers.list({ email: email.toLowerCase(), limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    if (!customerId) {
      return NextResponse.json({
        success: false,
        error: "No active paid subscription found for this account.",
      }, { status: 404 });
    }

    const origin = req.headers.get("origin") || "https://www.ghostsweeper.info";
    const returnUrl = `${origin}/history`;

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return NextResponse.json({ success: true, url: session.url });
    } catch (portalErr: any) {
      console.warn("[Stripe Portal Error]:", portalErr.message);
      // If Customer Portal is not enabled in Dashboard yet, direct to cancel endpoint fallback
      return NextResponse.json({
        success: true,
        fallback: true,
        message: "Portal is pending dashboard activation.",
        cancelUrl: `/api/stripe/cancel?email=${encodeURIComponent(email)}`,
      });
    }
  } catch (err: any) {
    console.error("[Stripe Portal] Exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
