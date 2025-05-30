import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false, // Required for Stripe signature verification
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text(); // Important for signature validation

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Initialize Supabase client for database write
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;

      const supabaseId = session.metadata?.supabase_id;

      if (!supabaseId) {
        console.warn("No Supabase ID found in session metadata.");
        break;
      }

      const { error } = await supabase
        .from("users")
        .update({ is_supporter: true })
        .eq("id", supabaseId);

      if (error) {
        console.error("Failed to mark user as supporter:", error.message);
      } else {
        console.log(`User ${supabaseId} marked as supporter.`);
      }

      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}
