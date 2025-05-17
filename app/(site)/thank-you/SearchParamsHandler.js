// app/(site)/thank-you/SearchParamsHandler.js
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function SearchParamsHandler() {
  const params = useSearchParams();
  // const lang = params.get("lang");
  const name = params.get("name");
  const email = params.get("email");

  // useEffect(() => {
  //   console.log("LANG received:", lang);
  //   // maybe do something useful with lang
  // }, [lang]);

  const { lang } = useLanguage();

  const t = {
    en: {
      thankyouHeader: "Thank you",
      reviewMessage: "We have received your information.",
      emailMessage: "A confirmation will be sent as soon as possible to",
      yourSupportMessage: "",
      supportMessage:
        "Your support will help us build Neptune's Tribe and make it available to people throughout the world",
      exploreUnits: "Explore our Units",
    },
    pt: {
      thankyouHeader: "Obrigado",
      reviewMessage: "Recebemos suas informações.",
      emailMessage: "Uma confirmação será enviada o mais breve possível a",
      supportMessage:
        "Seu apoio nos ajudará a construir a Neptune's Tribe e torná-la disponível para pessoas em todo o mundo",

      exploreUnits: "Explore nosso Material",
    },
  };

  const copy = t[lang];

  return (
    <div className="text-center py-6">
      {/* {lang && <p className="mt-4 italic">Language: {lang}</p>} */}
      <h1 className="text-3xl font-semibold mb-4">
        {copy.thankyouHeader}
        {name ? `, ${name}` : ""}!
      </h1>
      <p className="text-lg mb-6">
        {copy.reviewMessage}{" "}
        {email && (
          <>
            {copy.emailMessage}
            <br /> <strong>{email}</strong>.
          </>
        )}
      </p>

      <Link
        href="/content"
        className="inline-block mt-4 bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition"
      >
        {copy.exploreUnits}
      </Link>

      <p className="mt-8 text-sm text-gray-500">{copy.supportMessage}</p>
    </div>
  );
}

// "use client";

// export const dynamic = "force-dynamic";

// import { useSearchParams } from "next/navigation";
// import Link from "next/link";

// export default function ThankYouPage() {
//   const params = useSearchParams();
//   const name = params.get("name");
//   const email = params.get("email");

//   return (
//     <main className="max-w-3xl mx-auto px-4 py-16 text-center">
//       <h1 className="text-3xl font-semibold mb-4">
//         Thank you{name ? `, ${name}` : ""}!
//       </h1>
//       <p className="text-lg mb-6">
//         We have received your information and will review your donation as soon
//         as possible.
//         {email && (
//           <>
//             <br />A confirmation of your{" "}
//             <strong>Premium Founding Member</strong> Status will be sent to{" "}
//             <br /> <strong>{email}</strong>.
//           </>
//         )}
//       </p>

//       <Link
//         href="/content"
//         className="inline-block mt-4 bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition"
//       >
//         Explore Units
//       </Link>

//       <p className="mt-8 text-sm text-gray-500">
//         Your support helps keep Neptune&apos;s Tribe free and accessible to
//         everyone. Thank you for being part of the journey.
//       </p>
//     </main>
//   );
// }
