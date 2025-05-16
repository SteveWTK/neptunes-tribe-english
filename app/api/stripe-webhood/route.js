import { incrementSupportProgress } from "@/lib/db";
import { buffer } from "micro";
import Stripe from "stripe";

export const config = { api: { bodyparser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];
  const but = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed", err.message);
    return res.status(400).send(`Webhook Error: $(err,message)`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await incrementSupportProgress();
  }
  res.status(200).json({ received: true });
}
