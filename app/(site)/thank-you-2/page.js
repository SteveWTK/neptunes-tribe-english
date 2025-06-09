import { Suspense } from "react";
import SearchParamsHandler from "./SearchParamsHandler";

export const dynamic = "force-dynamic";

export default function ThankYouPage() {
  return (
    <div className="relative w-screen h-screen p-8 bg-gradient-to-br from-primary-100 to-primary-300 dark:from-primary-700 dark:to-primary-950 dark:bg-primary-200">
      <section className="max-w-3xl mx-auto  mt-10 p-6 rounded-2xl shadow-lg bg-white dark:bg-primary-900 border border-zinc-200 dark:border-zinc-700">
        <Suspense fallback={<p>Loading...</p>}>
          <SearchParamsHandler />
        </Suspense>
      </section>
    </div>
  );
}
