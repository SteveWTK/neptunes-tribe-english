import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const { priceType, priceId } = await req.json();

  const metadata = {
    supabase_id: "your_supabase_id_placeholder", // Replace dynamically if needed
  };

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: priceType === "subscription" ? "subscription" : "payment",
      line_items: [
        {
          price:
            priceId ||
            process.env[`STRIPE_${priceType.toUpperCase()}_PRICE_ID`],
          quantity: 1,
        },
      ],
      metadata,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/profile?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/profile?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return new NextResponse("Error creating checkout session", { status: 500 });
  }
}
