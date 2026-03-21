"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

/**
 * Post-login redirect page
 * Checks if user has an active journey and redirects accordingly:
 * - New user (no journey) → /worlds/forests?selectSpecies=true (auto-open species modal)
 * - Returning user (has journey) → /worlds/{current_world_id} (their current adventure)
 * - Guest users → /dashboard
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

    // Check user's journey status and redirect appropriately
    const checkAndRedirect = async () => {
      try {
        const response = await fetch("/api/user/journey");
        const data = await response.json();

        if (data.hasSelectedAvatar && data.journey) {
          // Returning user with active journey - go to their current world
          const worldId = data.journey.current_world_id || "forests";
          router.push(`/worlds/${worldId}`);
        } else {
          // New user - go to forests world with auto-open species modal
          router.push("/worlds/forests?selectSpecies=true");
        }
      } catch (error) {
        console.error("Error checking journey:", error);
        // Default to forests with species selection if check fails
        router.push("/worlds/forests?selectSpecies=true");
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
