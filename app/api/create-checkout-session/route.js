// app/api/create-checkout-session/route.js

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, stripe_customer_id")
      .eq("email", session.user.email)
      .single();

    if (userError || !user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const {
      priceType,
      subscriptionInterval,
      tierLevel,
      oneTimeAmount,
      currency = "USD", // Default to USD
    } = await req.json();

    let lineItems;
    let mode;

    if (priceType === "subscription") {
      const priceId = getSubscriptionPriceId(
        subscriptionInterval,
        tierLevel,
        currency
      );

      if (!priceId) {
        return new NextResponse("Invalid subscription configuration", {
          status: 400,
        });
      }

      lineItems = [{ price: priceId, quantity: 1 }];
      mode = "subscription";
    } else if (priceType === "one_time") {
      const priceId = getOneTimePriceId(oneTimeAmount, currency);

      if (priceId) {
        // Use predefined price
        lineItems = [{ price: priceId, quantity: 1 }];
      } else {
        // Create dynamic price for custom amounts
        lineItems = [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: "One-time Support - Neptune's Tribe",
                description: "Thank you for supporting Neptune's Tribe!",
              },
              unit_amount: Math.round(oneTimeAmount * 100),
            },
            quantity: 1,
          },
        ];
      }
      mode = "payment";
    } else {
      return new NextResponse("Invalid price type", { status: 400 });
    }

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name,
        metadata: { supabase_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: getPaymentMethods(currency),
      mode: mode,
      line_items: lineItems,
      metadata: {
        supabase_id: user.id,
        price_type: priceType,
        currency: currency,
        ...(subscriptionInterval && {
          subscription_interval: subscriptionInterval,
        }),
        ...(tierLevel && { tier_level: tierLevel }),
        ...(oneTimeAmount && { one_time_amount: oneTimeAmount.toString() }),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return new NextResponse(`Error: ${err.message}`, { status: 500 });
  }
}

// Helper functions
function getSubscriptionPriceId(interval, tier, currency) {
  const priceIds = {
    USD: {
      premium: {
        monthly: process.env.STRIPE_USD_PREMIUM_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_USD_PREMIUM_YEARLY_PRICE_ID,
      },
      enterprise: {
        monthly: process.env.STRIPE_USD_ENTERPRISE_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_USD_ENTERPRISE_YEARLY_PRICE_ID,
      },
    },
    BRL: {
      premium: {
        monthly: process.env.STRIPE_BRL_PREMIUM_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_BRL_PREMIUM_YEARLY_PRICE_ID,
      },
      enterprise: {
        monthly: process.env.STRIPE_BRL_ENTERPRISE_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_BRL_ENTERPRISE_YEARLY_PRICE_ID,
      },
    },
  };

  return priceIds[currency]?.[tier]?.[interval];
}

function getOneTimePriceId(amount, currency) {
  const priceIds = {
    USD: {
      5: process.env.STRIPE_USD_SUPPORT_5_PRICE_ID,
      15: process.env.STRIPE_USD_SUPPORT_15_PRICE_ID,
      25: process.env.STRIPE_USD_SUPPORT_25_PRICE_ID,
    },
    BRL: {
      25: process.env.STRIPE_BRL_SUPPORT_25_PRICE_ID,
      75: process.env.STRIPE_BRL_SUPPORT_75_PRICE_ID,
      125: process.env.STRIPE_BRL_SUPPORT_125_PRICE_ID,
    },
  };

  return priceIds[currency]?.[amount];
}

function getPaymentMethods(currency) {
  if (currency === "BRL") {
    return ["card", "boleto"]; // PIX is enabled via payment method configuration
  }
  return ["card"];
}

// // app\api\create-checkout-session\route.js
// import { NextResponse } from "next/server";
// import Stripe from "stripe";
// import { auth } from "@/lib/auth"; // NextAuth v5 import
// import { createClient } from "@supabase/supabase-js";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export async function POST(req) {
//   try {
//     // Get the user session (NextAuth v5)
//     const session = await auth();

//     if (!session?.user?.email) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     // Get user from Supabase
//     const supabase = createClient(
//       process.env.SUPABASE_URL,
//       process.env.SUPABASE_SERVICE_ROLE_KEY
//     );

//     const { data: user, error: userError } = await supabase
//       .from("users")
//       .select("id, stripe_customer_id")
//       .eq("email", session.user.email)
//       .single();

//     if (userError || !user) {
//       console.error("User not found:", userError);
//       return new NextResponse("User not found", { status: 404 });
//     }

//     const {
//       priceType,
//       priceId,
//       customAmount,
//       subscriptionInterval, // 'monthly' or 'yearly'
//       oneTimeAmount, // for predefined one-time amounts
//     } = await req.json();

//     // Handle different pricing scenarios
//     let lineItems;
//     let mode;

//     if (priceType === "subscription") {
//       // Use specific price ID for subscription
//       const subscriptionPriceId = getSubscriptionPriceId(subscriptionInterval);

//       if (!subscriptionPriceId) {
//         return new NextResponse("Invalid subscription interval", {
//           status: 400,
//         });
//       }

//       lineItems = [
//         {
//           price: subscriptionPriceId,
//           quantity: 1,
//         },
//       ];
//       mode = "subscription";
//     } else if (priceType === "one_time") {
//       if (customAmount) {
//         // Create a custom price for one-time payments
//         lineItems = [
//           {
//             price_data: {
//               currency: "brl", // Brazilian Real
//               product_data: {
//                 name: "One-time Support - Neptune's Tribe",
//                 description: "Thank you for supporting Neptune's Tribe!",
//               },
//               unit_amount: Math.round(customAmount * 100), // Convert to cents
//             },
//             quantity: 1,
//           },
//         ];
//       } else if (oneTimeAmount) {
//         // Use predefined one-time amount price IDs
//         const oneTimePriceId = getOneTimePriceId(oneTimeAmount);

//         if (!oneTimePriceId) {
//           return new NextResponse("Invalid one-time amount", { status: 400 });
//         }

//         lineItems = [
//           {
//             price: oneTimePriceId,
//             quantity: 1,
//           },
//         ];
//       } else {
//         return new NextResponse("Missing amount for one-time payment", {
//           status: 400,
//         });
//       }
//       mode = "payment";
//     } else {
//       return new NextResponse("Invalid price type", { status: 400 });
//     }

//     // Create or get Stripe customer
//     let customerId = user.stripe_customer_id;

//     if (!customerId) {
//       const customer = await stripe.customers.create({
//         email: session.user.email,
//         name: session.user.name,
//         metadata: {
//           supabase_id: user.id,
//         },
//       });

//       customerId = customer.id;

//       // Update user with Stripe customer ID
//       await supabase
//         .from("users")
//         .update({ stripe_customer_id: customerId })
//         .eq("id", user.id);
//     }

//     const checkoutSession = await stripe.checkout.sessions.create({
//       customer: customerId,
//       payment_method_types: ["card"],
//       mode: mode,
//       line_items: lineItems,
//       metadata: {
//         supabase_id: user.id,
//         price_type: priceType,
//         ...(subscriptionInterval && {
//           subscription_interval: subscriptionInterval,
//         }),
//         ...(oneTimeAmount && { one_time_amount: oneTimeAmount.toString() }),
//         ...(customAmount && { custom_amount: customAmount.toString() }),
//       },
//       success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?success=true&session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?canceled=true`,
//       allow_promotion_codes: true,
//     });

//     return NextResponse.json({ url: checkoutSession.url });
//   } catch (err) {
//     console.error("Error creating checkout session:", err);
//     return new NextResponse(`Error: ${err.message}`, { status: 500 });
//   }
// }

// // Helper function to get subscription price IDs
// function getSubscriptionPriceId(interval) {
//   const priceIds = {
//     monthly: process.env.STRIPE_SUBSCRIPTION_MONTHLY_PRICE_ID,
//     yearly: process.env.STRIPE_SUBSCRIPTION_YEARLY_PRICE_ID,
//   };

//   console.log("Available subscription price IDs:", priceIds);
//   console.log("Requested interval:", interval);

//   return priceIds[interval];
// }

// // Helper function to get one-time price IDs
// function getOneTimePriceId(amount) {
//   const priceIds = {
//     25: process.env.STRIPE_ONE_TIME_25_PRICE_ID,
//     50: process.env.STRIPE_ONE_TIME_50_PRICE_ID,
//     100: process.env.STRIPE_ONE_TIME_100_PRICE_ID,
//   };

//   console.log("Available one-time price IDs:", priceIds);
//   console.log("Requested amount:", amount);

//   return priceIds[amount];
// }
