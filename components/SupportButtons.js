"use client";

import { useState } from "react";

export default function SupportButtons() {
  const [loading, setLoading] = useState(false);

  const supportButtonClass =
    "font-semibold rounded-2xl px-3 py-1.5 w-60 bg-gradient-to-b from-primary-200 to-primary-400 hover:from-primary-300 hover:to-primary-500 dark:from-primary-50 dark:to-primary-200 dark:hover:from-primary-100 dark:hover:to-primary-300 text-primary-950 dark:text-primary-950";

  const handleStripeCheckout = async (priceType, priceId = null) => {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceType,
          ...(priceId && { priceId }),
        }),
      });

      if (!res.ok) {
        const errorText = await res.text(); // read raw error
        throw new Error(`Request failed: ${res.status} - ${errorText}`);
      }

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
    <div className="flex flex-col  gap-4 md:flex-row md:gap-8 lg:gap-12 xl:gap-16 justify-center items-center mb-8">
      <button
        className={supportButtonClass}
        onClick={() => handleStripeCheckout("subscription")}
        disabled={loading}
      >
        {loading ? "redirecting..." : "Subscribe (monthly / yearly)"}
      </button>

      <button
        className={supportButtonClass}
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
