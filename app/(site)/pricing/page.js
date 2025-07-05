"use client";

import PricingTiers from "@/components/PricingTiers";
import { Badge } from "@/components/ui/badge";
import { Users, Award, Globe2, TrendingUp } from "lucide-react";

export default function PricingPage() {
  return (
    <main className="pt-12 px-4">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-16">
        <Badge className="mb-4 bg-accent-900 dark:bg-accent-100">
          Learn English • Protect Our Planet
        </Badge>
        <h1 className="text-5xl font-bold mb-6 bg-primary-900 dark:bg-primary-50 bg-clip-text text-transparent">
          Join Neptune&apos;s Tribe
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          Master English while exploring the world&apos;s most amazing
          ecosystems. Your subscription doesn&apos;t just unlock premium
          features—it directly funds ocean conservation and environmental
          protection projects worldwide.
        </p>
        <section className="my-2 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t py-2">
          <p className="flex items-center justify-center gap-2">
            <span className="text-lg">🌍</span>
            25% of all subscriptions go to verified eco-charities • Cancel
            anytime • 30-day money-back guarantee
          </p>
        </section>
      </section>

      {/* Social Proof */}
      <section className="max-w-4xl mx-auto mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold">1,000+</div>
            <div className="text-sm text-muted-foreground">Active Learners</div>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <Globe2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold">50+</div>
            <div className="text-sm text-muted-foreground">
              Countries Covered
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold">95%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold">£5,000+</div>
            <div className="text-sm text-muted-foreground">
              Donated to Charity
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <PricingTiers />

      {/* Impact Section */}
      <section className="mt-20 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-2xl p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Your Learning Creates Real Impact
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Every subscription directly supports both education and
            environmental conservation
          </p>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">🌊</span>
                Ocean Conservation
              </h3>
              <p className="text-sm text-muted-foreground">
                25% of all revenue goes directly to verified ocean conservation
                charities. We partner with organizations protecting marine
                ecosystems worldwide.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">📚</span>
                Educational Access
              </h3>
              <p className="text-sm text-muted-foreground">
                Premium subscriptions help us provide free access to underserved
                communities and continuously develop better learning content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to make a difference?</h2>
        <p className="text-muted-foreground mb-8">
          Start your journey today with our free Explorer plan, or go Premium to
          unlock everything
        </p>
      </section>

      {/* Footer Note */}
      <section className="mt-12 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t pt-8">
        <p className="flex items-center justify-center gap-2">
          <span className="text-lg">🌍</span>
          25% of all subscriptions go to verified eco-charities • Cancel anytime
          • 30-day money-back guarantee
        </p>
      </section>
    </main>
  );
}

// app/(site)/pricing/page.js
// "use client";

// import PricingTiers from "@/components/PricingTiers";

// export default function PricingPage() {
//   return (
//     <main className="pt-12 px-4">
//       <section className="max-w-3xl mx-auto text-center mb-10">
//         <h1 className="text-4xl font-bold mb-4">Join Neptune’s Tribe</h1>
//         <p className="text-lg text-muted-foreground">
//           Neptune’s Tribe blends language learning with a mission to protect the
//           environment. Your subscription helps build features and support
//           real-world ecological projects.
//         </p>
//       </section>

//       <PricingTiers />

//       <section className="mt-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
//         🌍 25% of all subscriptions go to eco-related charities. Thank you for
//         supporting the planet.
//       </section>
//     </main>
//   );
// }

// "use client";

// import PricingClient from "./PricingClient";

// export default function PricingPage() {
//   return <PricingClient />;
// }

// import dynamic from "next/dynamic";

// const PricingClient = dynamic(() => import("./PricingClient"), { ssr: false });

// export default function PricingPage() {
//   return <PricingClient />;
// }

// "use client";

// import SupportNeptunesTribe from "@/components/SupportNeptunesTribe";
// import SupportUsSectionStripeAndPix from "@/components/SupportUsSectionStripeAndPix";

// export default function About() {
//   return (
//     <div className="relative w-screen h-full pt-4 pb-12 bg-gradient-to-br from-primary-100 to-primary-300 dark:from-primary-700 dark:to-primary-950 dark:bg-primary-200">
//       <SupportNeptunesTribe />
//     </div>
//   );
// }
