import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { headers } from "next/headers";
import { buffer } from "micro";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Disable Next.js body parsing for raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const rawBody = await req.text();
  const signature = headers().get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle different event types
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Retrieve metadata or customer to find user
    const customerEmail = session.customer_details?.email;
    const customerId = session.customer;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Find the Supabase user via email or metadata
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", customerEmail)
      .single();

    if (user) {
      const isSupport = session.mode === "payment";

      await supabase
        .from("users")
        .update({
          is_premium: !isSupport,
          is_supporter: isSupport,
          stripe_customer_id: customerId,
        })
        .eq("id", user.id);
    }
  }

  return new NextResponse("Webhook received", { status: 200 });
}

// import { createClient } from "@supabase/supabase-js";
// import { NextResponse } from "next/server";
// import Stripe from "stripe";

// export const config = {
//   api: {
//     bodyparser: false,
//   },
// };

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// export async function POST(req) {
//   const sig = req.headers.get("stripe-signature");
//   const buf = await buffer(req);

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       buf,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.error("Webhook verification failed:", err.message);
//     return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;

//     const email = session.customer_email || session.customer_details?.email;

//     const amount = session.amount_total / 100;

//     console.log(`✅ Payment completed for ${email}: $${amount}`);

//     const { error } = await supabase
//       .from("users")
//       .update({ is_premium: true })
//       .eq("email", email);

//     if (error) {
//       console.error("Supabase update error:", error.message);
//       return new NextResponse("Database error", { status: 500 });
//     }
//   }

//   return NextResponse.json({ received: true });
// }
