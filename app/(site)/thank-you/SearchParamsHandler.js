"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // You could verify the session here if needed
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Processing...</p>
        </div>
      </div>
    );
  }

  if (canceled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md mx-auto text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            No worries! Your payment was cancelled and no charges were made.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="h-full py-12 flex items-center justify-center bg-white dark:bg-primary-800">
        <div className="flex flex-col items-center w-64 sm:w-96 lg:w-148 h-auto ml-4 mr-4 text-center p-6 bg-white dark:bg-primary-800 rounded-lg shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Thank You for Your Support!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your payment has been processed successfully. Welcome to
            Neptune&apos;s Tribe!
          </p>
          {sessionId && (
            <p className="text-xs text-gray-500 mb-4 break-all">
              Session ID: {sessionId}
            </p>
          )}
          <div className="w-48 flex flex-col items-center justify-center gap-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/units")}
              className="w-full"
            >
              Go to units
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Thank You</h1>
        <Button onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

// "use client";

// import { useSearchParams } from "next/navigation";
// import { useEffect } from "react";
// import Link from "next/link";
// import { useLanguage } from "@/lib/contexts/LanguageContext";

// export default function SearchParamsHandler() {
//   const params = useSearchParams();
//   // const lang = params.get("lang");
//   const name = params.get("name");
//   const email = params.get("email");

//   // useEffect(() => {
//   //   console.log("LANG received:", lang);
//   //   // maybe do something useful with lang
//   // }, [lang]);

//   const { lang } = useLanguage();

//   const t = {
//     en: {
//       thankyouHeader: "Thank you",
//       reviewMessage: "We have received your information.",
//       emailMessage: "A confirmation will be sent as soon as possible to",
//       yourSupportMessage: "",
//       supportMessage:
//         "Your support will help us build Neptune's Tribe and make it available to people throughout the world",
//       exploreUnits: "Explore our Units",
//     },
//     pt: {
//       thankyouHeader: "Obrigado",
//       reviewMessage: "Recebemos suas informações.",
//       emailMessage: "Uma confirmação será enviada o mais breve possível a",
//       supportMessage:
//         "Seu apoio nos ajudará a construir a Neptune's Tribe e torná-la disponível para pessoas em todo o mundo",

//       exploreUnits: "Explore nosso Material",
//     },
//   };

//   const copy = t[lang];

//   return (
//     <div className="text-center py-6">
//       {/* {lang && <p className="mt-4 italic">Language: {lang}</p>} */}
//       <h1 className="text-3xl font-semibold mb-4">
//         {copy.thankyouHeader}
//         {name ? `, ${name}` : ""}!
//       </h1>
//       <p className="text-lg mb-6">
//         {copy.reviewMessage}{" "}
//         {email && (
//           <>
//             {copy.emailMessage}
//             <br /> <strong>{email}</strong>.
//           </>
//         )}
//       </p>

//       <Link
//         href="/content"
//         className="inline-block mt-4 bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition"
//       >
//         {copy.exploreUnits}
//       </Link>

//       <p className="mt-8 text-sm text-gray-500">{copy.supportMessage}</p>
//     </div>
//   );
// }
