import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
});

export async function POST(request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies }
  );

  const {
    priceType = "subscription",
    priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
  } = await req.json();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return new NextResponse("Not authenticated", { status: 401 });
  }

  // Try to find existing Stripe customer
  const existingCustomers = await stripe.customers.list({
    email: user.email,
    limit: 1,
  });

  const customer =
    existingCustomers.data[0] ||
    (await stripe.customers.create({
      email: user.email,
      metadata: { supabase_id: user.id },
    }));

  const session = await stripe.checkout.sessions.create({
    mode: priceType === "one_time" ? "payment" : "subscription",
    payment_method_types: ["card"],
    customer: customer.id,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { supabase_id: user.id }, // ✅ Add Supabase user ID to metadata
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
