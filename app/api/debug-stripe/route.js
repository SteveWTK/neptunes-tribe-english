import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    envVars: {
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,

      // Subscription prices
      monthlyPriceId:
        process.env.STRIPE_SUBSCRIPTION_MONTHLY_PRICE_ID || "NOT SET",
      yearlyPriceId:
        process.env.STRIPE_SUBSCRIPTION_YEARLY_PRICE_ID || "NOT SET",

      // One-time prices
      oneTime25PriceId: process.env.STRIPE_ONE_TIME_25_PRICE_ID || "NOT SET",
      oneTime50PriceId: process.env.STRIPE_ONE_TIME_50_PRICE_ID || "NOT SET",
      oneTime100PriceId: process.env.STRIPE_ONE_TIME_100_PRICE_ID || "NOT SET",

      // Check if they exist
      hasMonthlyPrice: !!process.env.STRIPE_SUBSCRIPTION_MONTHLY_PRICE_ID,
      hasYearlyPrice: !!process.env.STRIPE_SUBSCRIPTION_YEARLY_PRICE_ID,
      hasOneTime25Price: !!process.env.STRIPE_ONE_TIME_25_PRICE_ID,
      hasOneTime50Price: !!process.env.STRIPE_ONE_TIME_50_PRICE_ID,
      hasOneTime100Price: !!process.env.STRIPE_ONE_TIME_100_PRICE_ID,
    },
  });
}

// app/api/debug-stripe/route.js
// import { NextResponse } from "next/server";
// import { auth } from "@/lib/auth";

// export async function GET() {
//   try {
//     const session = await auth();

//     const debug = {
//       hasSession: !!session,
//       userEmail: session?.user?.email || "No email",
//       envVars: {
//         hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
//         hasSubscriptionPrice: !!process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
//         hasOneTimePrice: !!process.env.STRIPE_ONE_TIME_PRICE_ID,
//         hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
//         subscriptionPriceId:
//           process.env.STRIPE_SUBSCRIPTION_PRICE_ID || "NOT SET",
//         oneTimePriceId: process.env.STRIPE_ONE_TIME_PRICE_ID || "NOT SET",
//       },
//     };

//     return NextResponse.json(debug);
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
