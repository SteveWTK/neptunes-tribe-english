"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import AvatarSelection from "@/components/journey/AvatarSelection";

export default function SelectAvatarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [existingJourney, setExistingJourney] = useState(null);
  const [checkingJourney, setCheckingJourney] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/select-avatar");
    }
  }, [status, router]);

  // Check if user already has a journey (but don't redirect)
  useEffect(() => {
    if (session) {
      const checkJourney = async () => {
        try {
          const response = await fetch("/api/user/journey");
          const data = await response.json();

          if (data.hasSelectedAvatar && data.journey) {
            // Store existing journey info for the warning
            setExistingJourney(data.journey);
          }
        } catch (err) {
          console.error("Error checking journey:", err);
        } finally {
          setCheckingJourney(false);
        }
      };

      checkJourney();
    } else {
      setCheckingJourney(false);
    }
  }, [session]);

  if (status === "loading" || checkingJourney) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600 dark:text-accent-400" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
      {/* Warning banner if user already has a journey */}
      {existingJourney && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  You already have a species avatar
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  You are currently helping the{" "}
                  <strong>{existingJourney.species_avatar?.common_name}</strong>{" "}
                  with <strong>{existingJourney.total_points?.toLocaleString() || 0} points</strong> earned.
                  If you choose a new species, <strong>all your progress will be reset</strong> and
                  you will start fresh with the new species at its starting IUCN status.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <AvatarSelection
        onComplete={(data) => {
          router.push("/worlds");
        }}
        isChangingAvatar={!!existingJourney}
      />
    </div>
  );
}
