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

// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { auth, authOptions } from "@/lib/auth"; // adjust path as needed
// import Stripe from "stripe";
// import { supabase } from "@/lib/auth";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export async function POST(req) {
//   const session = await auth();

//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { email } = session.user;

//   // Fetch user from Supabase
//   const { data: user, error } = await supabase
//     .from("users")
//     .select("*")
//     .eq("email", email)
//     .single();

//   if (error || !user) {
//     return NextResponse.json({ error: "User not found" }, { status: 404 });
//   }

//   // Create or reuse Stripe customer
//   let customerId = user.stripe_customer_id;

//   if (!customerId) {
//     const customer = await stripe.customers.create({
//       email: user.email,
//       name: user.name,
//     });

//     customerId = customer.id;

//     // Save customer ID to Supabase
//     await supabase
//       .from("users")
//       .update({ stripe_customer_id: customerId })
//       .eq("id", user.id);
//   }

//   // Create the Stripe Checkout Session
//   const sessionCheckout = await stripe.checkout.sessions.create({
//     customer: customerId,
//     mode: "subscription",
//     payment_method_types: ["card"],
//     line_items: [
//       {
//         price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
//         quantity: 1,
//       },
//     ],
//     success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
//     cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
//   });

//   return NextResponse.json({ url: sessionCheckout.url });
// }
