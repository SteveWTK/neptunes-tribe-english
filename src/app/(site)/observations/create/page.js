"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import CreateObservationForm from "@/components/observations/CreateObservationForm";

function CreateObservationContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const challengeId = searchParams.get("challenge");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/observations/create");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 dark:from-primary-900 dark:to-primary-950 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back link */}
        <Link
          href="/observations"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-white" />
          Back to observations
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            New Observation
          </h1>
          <p className="text-gray-600 dark:text-gray-100">
            Share what you&apos;ve discovered in nature
          </p>
        </div>

        {/* Form */}
        <CreateObservationForm
          challengeId={challengeId}
          onSuccess={(data) => {
            // Redirect to observation detail or feed
            router.push("/observations");
          }}
        />
      </div>
    </div>
  );
}

export default function CreateObservationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
          <Loader2 className="w-8 h-8 animate-spin text-accent-600 dark:text-accent-400" />
        </div>
      }
    >
      <CreateObservationContent />
    </Suspense>
  );
}
