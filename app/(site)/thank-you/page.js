// app/thank-you/page.js
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ThankYouPage() {
  const params = useSearchParams();
  const name = params.get("name");
  const email = params.get("email");

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold mb-4">
        Thank you{name ? `, ${name}` : ""}!
      </h1>
      <p className="text-lg mb-6">
        We have received your information and will review your donation as soon
        as possible.
        {email && (
          <>
            <br />A confirmation of your{" "}
            <strong>Premium Founding Member</strong> Status will be sent to{" "}
            <br /> <strong>{email}</strong>.
          </>
        )}
      </p>

      <Link
        href="/content"
        className="inline-block mt-4 bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition"
      >
        Explore Units
      </Link>

      <p className="mt-8 text-sm text-gray-500">
        Your support helps keep Neptune&apos;s Tribe free and accessible to
        everyone. Thank you for being part of the journey.
      </p>
    </main>
  );
}
