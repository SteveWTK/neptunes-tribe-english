import { createClient } from "@supabase/supabase-js";
import { buffer } from "micro";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyparser: false,
  },
};

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];
  const rawBody = await buffer(req);
}

let event;

try {
  event = stripe.webhooks.constructEvent(
    rawBody,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );
} catch (err) {
  return res.status(400).send(`webhook Error: $(err.message)`);
}

if (event.type === "checkout.session.completed") {
  const amount = event.data.object.amount_total / 100;

  const { data, error } = await supabase.rpc("increment_support_progress", {
    increment_amount: amount,
  });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ success: true });
}
