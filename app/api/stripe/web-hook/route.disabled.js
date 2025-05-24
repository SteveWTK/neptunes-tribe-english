import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const config = {
  api: {
    bodyparser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email = session.customer_email || session.customer_details?.email;

    const amount = session.amount_total / 100;

    console.log(`✅ Payment completed for ${email}: $${amount}`);

    const { error } = await supabase
      .from("users")
      .update({ is_premium: true })
      .eq("email", email);

    if (error) {
      console.error("Supabase update error:", error.message);
      return new NextResponse("Database error", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
