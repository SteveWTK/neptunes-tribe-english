import { buffer } from "micro";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const supabaseId = session.metadata?.supabase_id;

    if (!supabaseId) {
      console.warn("No Supabase ID found in session metadata.");
    } else {
      const { error } = await supabase
        .from("users")
        .update({ is_supporter: true })
        .eq("id", supabaseId);

      if (error) {
        console.error("Failed to mark user as supporter:", error.message);
      } else {
        console.log(`User ${supabaseId} marked as supporter.`);
      }
    }
  }

  res.status(200).end();
}
