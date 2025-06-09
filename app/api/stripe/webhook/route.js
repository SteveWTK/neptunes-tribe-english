import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

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

  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, supabase);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object, supabase);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, supabase);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object, supabase);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling webhook ${event.type}:`, error);
    return new NextResponse(`Webhook handler failed: ${error.message}`, {
      status: 500,
    });
  }

  return new NextResponse(null, { status: 200 });
}

async function handleCheckoutCompleted(session, supabase) {
  const supabaseId = session.metadata?.supabase_id;

  if (!supabaseId) {
    console.warn("No Supabase ID found in session metadata.");
    return;
  }

  // Mark user as supporter for any completed checkout
  const { error: supporterError } = await supabase
    .from("users")
    .update({ is_supporter: true })
    .eq("id", supabaseId);

  if (supporterError) {
    console.error("Failed to mark user as supporter:", supporterError.message);
    throw supporterError;
  }

  console.log(`User ${supabaseId} marked as supporter.`);

  // If it's a subscription, handle subscription-specific logic
  if (session.mode === "subscription" && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription
    );
    await updateUserSubscription(supabaseId, subscription, supabase);
  }
}

async function handleSubscriptionUpdate(subscription, supabase) {
  const customerId = subscription.customer;

  // Find user by Stripe customer ID
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (userError || !user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  await updateUserSubscription(user.id, subscription, supabase);
}

async function handleSubscriptionDeleted(subscription, supabase) {
  const customerId = subscription.customer;

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (userError || !user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  const { error } = await supabase
    .from("users")
    .update({
      is_premium: false,
      stripe_subscription_status: "canceled",
      role: "free",
    })
    .eq("id", user.id);

  if (error) {
    console.error("Failed to update user subscription status:", error.message);
    throw error;
  }

  console.log(`User ${user.id} subscription canceled.`);
}

async function handlePaymentSucceeded(invoice, supabase) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription
    );
    const customerId = subscription.customer;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (userError || !user) {
      console.error("User not found for customer:", customerId);
      return;
    }

    await updateUserSubscription(user.id, subscription, supabase);
  }
}

async function handlePaymentFailed(invoice, supabase) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription
    );
    const customerId = subscription.customer;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (userError || !user) {
      console.error("User not found for customer:", customerId);
      return;
    }

    // Handle failed payment - you might want to send an email or update status
    console.log(`Payment failed for user ${user.id}`);
  }
}

async function updateUserSubscription(userId, subscription, supabase) {
  const isActive = ["active", "trialing"].includes(subscription.status);

  const updateData = {
    is_premium: isActive,
    stripe_subscription_status: subscription.status,
    role: isActive ? "premium" : "free",
    is_supporter: true, // Keep supporter status regardless of subscription status
  };

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId);

  if (error) {
    console.error("Failed to update user subscription:", error.message);
    throw error;
  }

  console.log(`User ${userId} subscription updated:`, updateData);
}

// import { NextResponse } from "next/server";
// import Stripe from "stripe";
// import { createClient } from "@supabase/supabase-js";

// export const config = {
//   api: {
//     bodyParser: false, // Required for Stripe signature verification
//   },
// };

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export async function POST(req) {
//   const sig = req.headers.get("stripe-signature");
//   const body = await req.text(); // Important for signature validation

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message);
//     return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   // Initialize Supabase client for database write
//   const supabase = createClient(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_SERVICE_ROLE_KEY
//   );

//   switch (event.type) {
//     case "checkout.session.completed":
//       const session = event.data.object;

//       const supabaseId = session.metadata?.supabase_id;

//       if (!supabaseId) {
//         console.warn("No Supabase ID found in session metadata.");
//         break;
//       }

//       const { error } = await supabase
//         .from("users")
//         .update({ is_supporter: true })
//         .eq("id", supabaseId);

//       if (error) {
//         console.error("Failed to mark user as supporter:", error.message);
//       } else {
//         console.log(`User ${supabaseId} marked as supporter.`);
//       }

//       break;

//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   return new NextResponse(null, { status: 200 });
// }
