"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * Claim callback page
 * Handles the transfer of guest data to a newly signed-in Google account.
 */
export default function ClaimCallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [transferStatus, setTransferStatus] = useState("loading"); // loading, success, error, no-claim
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      // Not logged in, redirect to login
      router.push("/login");
      return;
    }

    // If user is still a guest, something went wrong
    if (session.user?.role === "guest") {
      setTransferStatus("error");
      setError("Google sign-in did not complete. Please try again.");
      return;
    }

    // Complete the claim
    const completeClaim = async () => {
      try {
        const response = await fetch("/api/guest-access/complete-claim", {
          method: "POST",
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 400 && data.error === "No pending guest claim found") {
            // No pending claim - this is a normal Google sign-in, redirect to post-login
            setTransferStatus("no-claim");
            setTimeout(() => {
              router.push("/auth/post-login");
            }, 1000);
            return;
          }
          throw new Error(data.error || "Failed to transfer account");
        }

        setTransferStatus("success");

        // Redirect to journey after a brief success message
        setTimeout(() => {
          router.push("/auth/post-login");
        }, 2000);
      } catch (err) {
        console.error("Error completing claim:", err);
        setTransferStatus("error");
        setError(err.message || "Something went wrong. Please try again.");
      }
    };

    completeClaim();
  }, [session, status, router]);

  if (status === "loading" || transferStatus === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
        <Loader2 className="w-10 h-10 animate-spin text-accent-600 dark:text-accent-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Transferring your progress...
        </p>
      </div>
    );
  }

  if (transferStatus === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Account Created!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your progress has been transferred to your new account. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  if (transferStatus === "no-claim") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600 dark:text-accent-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-300">
          Redirecting to your adventure...
        </p>
      </div>
    );
  }

  if (transferStatus === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Something Went Wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || "We couldn't transfer your progress. Please try again."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/claim-account")}
              className="w-full py-3 px-6 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/auth/post-login")}
              className="w-full py-3 px-6 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Continue Without Transfer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
