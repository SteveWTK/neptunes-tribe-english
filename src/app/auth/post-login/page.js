"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

/**
 * Post-login redirect page
 * Checks if user has selected an avatar and redirects accordingly:
 * - No avatar → /select-avatar
 * - Has avatar → /worlds
 */
export default function PostLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      // Not logged in, redirect to login
      router.push("/login");
      return;
    }

    // Guest users skip avatar selection entirely
    if (session.user?.is_guest) {
      router.push("/dashboard");
      return;
    }

    // Check if user has an avatar
    const checkAndRedirect = async () => {
      try {
        const response = await fetch("/api/user/journey");
        const data = await response.json();

        if (data.hasSelectedAvatar) {
          // User has an avatar, go to dashboard
          router.push("/dashboard");
        } else {
          // No avatar selected, go to avatar selection
          router.push("/select-avatar");
        }
      } catch (error) {
        console.error("Error checking journey:", error);
        // Default to dashboard if check fails
        router.push("/dashboard");
      }
    };

    checkAndRedirect();
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
      <Loader2 className="w-8 h-8 animate-spin text-accent-600 dark:text-accent-400 mb-4" />
      <p className="text-gray-600 dark:text-gray-300">
        Setting up your experience...
      </p>
    </div>
  );
}
