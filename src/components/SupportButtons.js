// components\SupportButtons.js
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SupportButtons() {
  const [loading, setLoading] = useState(false);
  const [showSubscriptionOptions, setShowSubscriptionOptions] = useState(false);
  const [showOneTimeOptions, setShowOneTimeOptions] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  const supportButtonClass =
    "font-semibold rounded-2xl px-3 py-1.5 w-60 bg-gradient-to-b from-primary-200 to-primary-400 hover:from-primary-300 hover:to-primary-500 dark:from-primary-50 dark:to-primary-200 dark:hover:from-primary-100 dark:hover:to-primary-300 text-primary-950 dark:text-primary-950 disabled:opacity-50 disabled:cursor-not-allowed";

  const handleStripeCheckout = async (priceType, options = {}) => {
    // Check if user is authenticated
    if (status === "loading") {
      return; // Still loading
    }

    if (!session) {
      alert("Please sign in to support us!");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceType,
          ...options,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Request failed: ${res.status} - ${errorText}`);
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Stripe checkout error:", err);
      alert(`Something went wrong: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || status === "loading";

  return (
    <div className="space-y-6">
      {/* Main buttons */}
      <div className="flex flex-col gap-4 md:flex-row md:gap-8 lg:gap-12 xl:gap-16 justify-center items-center">
        <div className="flex flex-col items-center gap-2">
          <button
            className={supportButtonClass}
            onClick={() => setShowSubscriptionOptions(!showSubscriptionOptions)}
            disabled={isDisabled}
          >
            {loading ? "Loading..." : "Subscribe (Premium)"}
          </button>

          {/* Subscription Options */}
          {showSubscriptionOptions && (
            <div className="flex flex-col gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleStripeCheckout("subscription", {
                    subscriptionInterval: "monthly",
                  })
                }
                disabled={isDisabled}
                className="w-48"
              >
                Monthly Subscription
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleStripeCheckout("subscription", {
                    subscriptionInterval: "yearly",
                  })
                }
                disabled={isDisabled}
                className="w-48"
              >
                Yearly Subscription (Save 50%)
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            className={supportButtonClass}
            onClick={() => setShowOneTimeOptions(!showOneTimeOptions)}
            disabled={isDisabled}
          >
            {loading ? "Loading..." : "One-Time Support"}
          </button>

          {/* One-time Options */}
          {showOneTimeOptions && (
            <div className="flex flex-col gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleStripeCheckout("one_time", { oneTimeAmount: 25 })
                }
                disabled={isDisabled}
                className="w-48"
              >
                Support with £7.50
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleStripeCheckout("one_time", { oneTimeAmount: 50 })
                }
                disabled={isDisabled}
                className="w-48"
              >
                Support with £15
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleStripeCheckout("one_time", { oneTimeAmount: 100 })
                }
                disabled={isDisabled}
                className="w-48"
              >
                Support with £30
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";

// export default function SupportButtons() {
//   const [loading, setLoading] = useState(false);
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   const supportButtonClass =
//     "font-semibold rounded-2xl px-3 py-1.5 w-60 bg-gradient-to-b from-primary-200 to-primary-400 hover:from-primary-300 hover:to-primary-500 dark:from-primary-50 dark:to-primary-200 dark:hover:from-primary-100 dark:hover:to-primary-300 text-primary-950 dark:text-primary-950 disabled:opacity-50 disabled:cursor-not-allowed";

//   const handleStripeCheckout = async (priceType, customAmount = null) => {
//     // Check if user is authenticated
//     if (status === "loading") {
//       return; // Still loading
//     }

//     if (!session) {
//       alert("Please sign in to support us!");
//       router.push("/auth/signin");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("/api/create-checkout-session", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           priceType,
//           customAmount,
//         }),
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         throw new Error(`Request failed: ${res.status} - ${errorText}`);
//       }

//       const { url } = await res.json();
//       window.location.href = url;
//     } catch (err) {
//       console.error("Stripe checkout error:", err);
//       alert(`Something went wrong: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isDisabled = loading || status === "loading";

//   return (
//     <div className="flex flex-col gap-4 md:flex-row md:gap-8 lg:gap-12 xl:gap-16 justify-center items-center mb-8">
//       <button
//         className={supportButtonClass}
//         onClick={() => handleStripeCheckout("subscription")}
//         disabled={isDisabled}
//       >
//         {loading ? "Redirecting..." : "Subscribe (monthly / yearly)"}
//       </button>

//       <button
//         className={supportButtonClass}
//         onClick={() => handleStripeCheckout("one_time")}
//         disabled={isDisabled}
//       >
//         {loading ? "Redirecting..." : "One-Time Support"}
//       </button>
//     </div>
//   );
// }
