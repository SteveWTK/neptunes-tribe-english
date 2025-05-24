"use client";

import { useState } from "react";

export default function SupportButtons() {
  const [loading, setLoading] = useState(false);

  const handleStripeCheckout = async (priceType, priceId = null) => {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "content-type": "application.json" },
        body: JSON.stringify({
          priceType,
          ...(priceId && { priceId }),
        }),
      });

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Stripe checkout error:", err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 justify-center items-center mb-8">
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-2xl w-fit"
        onClick={() => handleStripeCheckout("subscription")}
        disabled={loading}
      >
        {loading ? "redirecting..." : "Subscribe (monthly / yearly)"}
      </button>

      <button
        className="bg-green-600 text-white px-4 py-2 rounded-2xl w-fit"
        onClick={() =>
          handleStripeCheckout(
            "one_time",
            process.env.NEXT_PUBLIC_STRIPE_ONE_TIME_PRICE_ID
          )
        }
        disabled={loading}
      >
        {loading ? "Redirecting..." : "One-Time Support"}
      </button>
    </div>
  );
}
