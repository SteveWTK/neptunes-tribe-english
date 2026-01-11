"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import AvatarSelection from "@/components/journey/AvatarSelection";

export default function SelectAvatarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/select-avatar");
    }
  }, [status, router]);

  // Check if user already has a journey
  useEffect(() => {
    if (session) {
      const checkJourney = async () => {
        try {
          const response = await fetch("/api/user/journey");
          const data = await response.json();

          if (data.hasSelectedAvatar) {
            // Already has avatar, redirect to worlds
            router.push("/worlds");
          }
        } catch (err) {
          console.error("Error checking journey:", err);
        }
      };

      checkJourney();
    }
  }, [session, router]);

  if (status === "loading") {
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
      <AvatarSelection
        onComplete={(data) => {
          router.push("/worlds");
        }}
      />
    </div>
  );
}
