"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-3xl font-bold mb-4 text-green-600">
        🎉 Thanks for confirming your email!
      </h1>
      <p className="text-gray-700 dark:text-gray-300">
        Redirecting to the login page...
      </p>
    </div>
  );
}
