import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { cookies: () => cookieStore }
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

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { supabase_id: user.id },
  });

  const session = await stripe.checkout.sessions.create({
    mode: priceType === "one_time" ? "payment" : "subscription",
    payment_method_types: ["card"],
    customer: customer.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
