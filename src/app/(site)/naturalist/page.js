"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Zap,
  Globe,
  Trophy,
  Camera,
  Target,
  ChevronRight,
  Leaf,
} from "lucide-react";
import SpeciesJourneyWidget from "@/components/journey/SpeciesJourneyWidget";
import NGOChallengeCard from "@/components/challenges/NGOChallengeCard";

export default function NaturalistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [ngoChallenges, setNgoChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [recentObservations, setRecentObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [triggeringChallenge, setTriggeringChallenge] = useState(false);

  // Test function to trigger unpredictable challenge
  const triggerTestChallenge = async () => {
    setTriggeringChallenge(true);
    try {
      const response = await fetch("/api/challenges/assign-random", {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Challenge assigned: ${data.challenge?.title || "Success!"}`);
        // Refresh challenges
        const userResponse = await fetch("/api/challenges/user");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserChallenges(userData.activeChallenges || []);
        }
      } else {
        alert(`Error: ${data.error || "Failed to assign challenge"}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setTriggeringChallenge(false);
    }
  };

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch NGO challenges
        const ngoResponse = await fetch("/api/challenges/ngo");
        if (ngoResponse.ok) {
          const ngoData = await ngoResponse.json();
          setNgoChallenges(ngoData.challenges || []);
        }

        // Fetch user's challenges if logged in
        if (session) {
          const userResponse = await fetch("/api/challenges/user");
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserChallenges(userData.activeChallenges || []);
          }

          // Fetch user's recent observations
          const obsResponse = await fetch("/api/observations?limit=4");
          if (obsResponse.ok) {
            const obsData = await obsResponse.json();
            setRecentObservations(obsData.observations || []);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  // Get active unpredictable challenges
  const unpredictableChallenges = userChallenges.filter(
    (c) => c.unpredictable_challenge_id
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600 dark:text-accent-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 dark:from-gray-700 dark:via-gray-700 dark:to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Habitat Naturalist</h1>
          </div>
          <p className="text-accent-100 max-w-2xl">
            Observe wildlife, complete challenges, and help endangered species
            recover. Your observations contribute to real conservation research!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/observations/create"
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 bg-accent-100 dark:bg-accent-900/50 rounded-full flex items-center justify-center mb-3 group-hover:bg-accent-200 dark:group-hover:bg-accent-900 transition-colors">
                  <Camera className="w-7 h-7 text-accent-600 dark:text-accent-400" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-1">
                  New Observation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload wildlife photos
                </p>
              </Link>

              <Link
                href="/observations"
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-900 transition-colors">
                  <Globe className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-1">
                  Explore Feed
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  See community observations
                </p>
              </Link>
            </div>

            {/* Active Bonus Challenges */}
            {unpredictableChallenges.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-amber-500" />
                  Active Bonus Challenges
                </h2>
                <div className="space-y-4">
                  {unpredictableChallenges.map((userChallenge) => {
                    const challenge = userChallenge.unpredictable_challenge;
                    const expiresAt = userChallenge.expires_at
                      ? new Date(userChallenge.expires_at)
                      : null;
                    const now = new Date();
                    const hoursRemaining = expiresAt
                      ? Math.max(
                          0,
                          Math.floor((expiresAt - now) / (1000 * 60 * 60))
                        )
                      : null;

                    return (
                      <div
                        key={userChallenge.id}
                        className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 border-2 border-green-200 dark:border-primary-700 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-primary-800 text-green-700 dark:text-primary-200 rounded-full text-xs font-medium mb-2">
                              Time Limited
                            </span>
                            <h3 className="font-bold text-gray-800 dark:text-white">
                              {challenge?.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {challenge?.description}
                            </p>
                          </div>
                          {hoursRemaining !== null && (
                            <div className="text-right flex-shrink-0 ml-4">
                              <div className="text-2xl font-bold text-green-600 dark:text-gray-400">
                                {hoursRemaining}h
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                remaining
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Progress: {userChallenge.progress_count}/
                            {userChallenge.target_count}
                          </span>
                          <span className="flex items-center gap-1 text-green-600 dark:text-gray-400 font-medium">
                            <Trophy className="w-4 h-4" />
                            {challenge?.points_reward} pts
                          </span>
                        </div>

                        <div className="h-2 bg-green-100 dark:bg-primary-900/50 rounded-full overflow-hidden mb-4">
                          <div
                            className="h-full bg-accent-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                (userChallenge.progress_count /
                                  userChallenge.target_count) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>

                        <button
                          onClick={() =>
                            router.push(
                              `/observations/create?challenge=${userChallenge.id}`
                            )
                          }
                          className="w-full py-2 bg-green-500 hover:bg-green-600 dark:bg-accent-500 dark:hover:bg-accent-600 text-white font-medium rounded-lg transition-colors"
                        >
                          Submit Observation
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NGO Challenges */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Target className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                  NGO Challenges
                </h2>
                <Link
                  href="/naturalist/challenges"
                  className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {ngoChallenges.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm">
                  <Globe className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No NGO challenges available right now. Check back soon!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ngoChallenges.slice(0, 2).map((challenge) => (
                    <NGOChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onJoin={(c) => {
                        setNgoChallenges((prev) =>
                          prev.map((ch) =>
                            ch.id === c.ngo_challenge_id
                              ? { ...ch, user_progress: c }
                              : ch
                          )
                        );
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Observations */}
            {session && recentObservations.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Your Recent Observations
                  </h2>
                  <Link
                    href="/observations?view=mine"
                    className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {recentObservations.map((obs) => (
                    <Link
                      key={obs.id}
                      href={`/observations/${obs.id}`}
                      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-square">
                        <img
                          src={obs.photo_url}
                          alt={obs.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                          {obs.ai_species_name || obs.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(obs.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* DEV: Test trigger for unpredictable challenge */}
            {session && process.env.NODE_ENV === "development" && (
              <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2 font-medium">
                  Developer Testing
                </p>
                <button
                  onClick={triggerTestChallenge}
                  disabled={triggeringChallenge}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 dark:disabled:bg-amber-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {triggeringChallenge ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Trigger Unpredictable Challenge
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Species Journey Widget */}
            {session && <SpeciesJourneyWidget />}

            {/* Not logged in prompt */}
            {!session && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
                <Leaf className="w-12 h-12 text-accent-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                  Join the Community
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Sign in to track your progress, earn points, and help save
                  endangered species!
                </p>
                <Link
                  href="/auth/signin"
                  className="block w-full py-2 bg-accent-600 text-white font-medium rounded-lg hover:bg-accent-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3">
                Community Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Total Observations
                  </span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    --
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Species Identified
                  </span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    --
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Active Naturalists
                  </span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    --
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
