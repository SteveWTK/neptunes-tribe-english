"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Loader2,
  ChevronLeft,
  Trophy,
  Camera,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Leaf,
  Award,
  Zap,
  ArrowRight,
  Star,
} from "lucide-react";

const IUCN_STATUS = {
  CR: {
    label: "Critically Endangered",
    color: "bg-red-500",
    textColor: "text-white",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    order: 1,
  },
  EN: {
    label: "Endangered",
    color: "bg-orange-500",
    textColor: "text-white",
    bgLight: "bg-orange-100 dark:bg-orange-900/30",
    order: 2,
  },
  VU: {
    label: "Vulnerable",
    color: "bg-yellow-500",
    textColor: "text-black",
    bgLight: "bg-yellow-100 dark:bg-yellow-900/30",
    order: 3,
  },
  NT: {
    label: "Near Threatened",
    color: "bg-blue-500",
    textColor: "text-white",
    bgLight: "bg-blue-100 dark:bg-blue-900/30",
    order: 4,
  },
  LC: {
    label: "Least Concern",
    color: "bg-green-500",
    textColor: "text-white",
    bgLight: "bg-green-100 dark:bg-green-900/30",
    order: 5,
  },
};

const STATUS_ORDER = ["CR", "EN", "VU", "NT", "LC"];

export default function JourneyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [journey, setJourney] = useState(null);
  const [challenges, setChallenges] = useState({
    active: [],
    completed: [],
    expired: [],
  });
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch journey, challenges, and points history in parallel
        const [journeyRes, challengesRes, historyRes] = await Promise.all([
          fetch("/api/user/journey"),
          fetch("/api/user/challenges-history"),
          fetch("/api/user/points-history"),
        ]);

        if (journeyRes.ok) {
          const data = await journeyRes.json();
          setJourney(data.journey);
        }

        if (challengesRes.ok) {
          const data = await challengesRes.json();
          setChallenges({
            active: data.activeChallenges || [],
            completed: data.completedChallenges || [],
            expired: data.expiredChallenges || [],
          });
        }

        if (historyRes.ok) {
          const data = await historyRes.json();
          setPointsHistory(data.history || []);
        }
      } catch (err) {
        console.error("Error fetching journey data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600 dark:text-accent-400" />
      </div>
    );
  }

  if (!session) return null;

  // No journey yet
  if (!journey) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Leaf className="w-20 h-20 text-accent-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Start Your Journey
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            Choose an endangered species to protect and begin your mission to help them recover!
          </p>
          <Link
            href="/select-avatar"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent-600 text-white font-bold rounded-xl hover:bg-accent-700 transition-colors text-lg"
          >
            Choose Your Species
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(journey.current_iucn_status);
  const startingStatusIndex = STATUS_ORDER.indexOf(journey.starting_iucn_status);
  const progressMade = currentStatusIndex - startingStatusIndex;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-600 via-accent-700 to-accent-800 dark:from-accent-800 dark:via-accent-900 dark:to-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Species Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 bg-white/10 flex-shrink-0">
              {journey.species_avatar?.avatar_image_url ? (
                <img
                  src={journey.species_avatar.avatar_image_url}
                  alt={journey.species_avatar.common_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Leaf className="w-12 h-12 text-white/60" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">
                {journey.species_avatar?.common_name || "Your Species"}
              </h1>
              <p className="text-accent-100 text-lg">
                {journey.species_avatar?.scientific_name}
              </p>

              {/* Current Status Badge */}
              <div className="mt-3 flex items-center gap-3">
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                    IUCN_STATUS[journey.current_iucn_status]?.color
                  } ${IUCN_STATUS[journey.current_iucn_status]?.textColor}`}
                >
                  {IUCN_STATUS[journey.current_iucn_status]?.label}
                </span>
                {progressMade > 0 && (
                  <span className="text-green-300 text-sm font-medium">
                    +{progressMade} status improvement{progressMade > 1 ? "s" : ""}!
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 md:gap-8">
              <div className="text-center">
                <div className="flex items-center gap-2 text-3xl font-bold">
                  <Trophy className="w-8 h-8 text-yellow-300" />
                  {journey.total_points?.toLocaleString() || 0}
                </div>
                <p className="text-sm text-accent-100">Total Points</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {journey.observations_count || 0}
                </div>
                <p className="text-sm text-accent-100">Observations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* IUCN Status Progress */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent-600 dark:text-accent-400" />
            Conservation Progress
          </h2>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div
              className="absolute top-6 left-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-1000"
              style={{
                width: `${((currentStatusIndex + 1) / STATUS_ORDER.length) * 100}%`,
              }}
            />

            {/* Status Milestones */}
            <div className="relative flex justify-between">
              {STATUS_ORDER.map((status, index) => {
                const isPast = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isFuture = index > currentStatusIndex;
                const wasStarting = index === startingStatusIndex;

                return (
                  <div key={status} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${
                        isCurrent
                          ? `${IUCN_STATUS[status].color} border-white dark:border-gray-800 shadow-lg scale-110`
                          : isPast
                          ? `${IUCN_STATUS[status].color} border-white dark:border-gray-800 opacity-80`
                          : "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {isPast && <CheckCircle className="w-6 h-6 text-white" />}
                      {isCurrent && <Star className="w-6 h-6 text-white" />}
                      {isFuture && (
                        <span className="text-gray-400 dark:text-gray-500 font-bold">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <p
                        className={`text-xs font-medium ${
                          isCurrent
                            ? "text-gray-800 dark:text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {IUCN_STATUS[status].label}
                      </p>
                      {wasStarting && (
                        <p className="text-[10px] text-accent-600 dark:text-accent-400 mt-1">
                          Started here
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Level Info */}
          {journey.next_level_threshold && (
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Points to next status
                </span>
                <span className="font-bold text-gray-800 dark:text-white">
                  {(
                    journey.next_level_threshold.points_required -
                    journey.total_points
                  ).toLocaleString()}{" "}
                  more
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (journey.total_points /
                        journey.next_level_threshold.points_required) *
                        100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Next: {IUCN_STATUS[journey.next_level_threshold.to_status]?.label}
              </p>
            </div>
          )}
        </motion.section>

        {/* Challenges Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-accent-600 dark:text-accent-400" />
            Challenges
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                <Zap className="w-6 h-6" />
                {challenges.active.length}
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">Active</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600 dark:text-green-400">
                <CheckCircle className="w-6 h-6" />
                {challenges.completed.length}
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">Completed</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-500 dark:text-gray-400">
                <Clock className="w-6 h-6" />
                {challenges.expired.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
            </div>
          </div>

          {/* Active Challenges */}
          {challenges.active.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Active Challenges
              </h3>
              <div className="space-y-3">
                {challenges.active.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 border-2 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-block px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-200 rounded-full text-xs font-medium mb-1">
                          {c.unpredictable_challenge ? "Bonus" : "NGO"}
                        </span>
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {c.unpredictable_challenge?.title ||
                            c.ngo_challenge?.title}
                        </h4>
                      </div>
                      {c.expires_at && (
                        <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {Math.max(
                            0,
                            Math.floor(
                              (new Date(c.expires_at) - new Date()) /
                                (1000 * 60 * 60)
                            )
                          )}
                          h left
                        </span>
                      )}
                    </div>
                    <div className="mt-2 h-2 bg-amber-200 dark:bg-amber-800 rounded-full">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (c.progress_count / c.target_count) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {c.progress_count}/{c.target_count} completed
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Challenges */}
          {challenges.completed.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Completed Challenges
              </h3>
              <div className="space-y-2">
                {challenges.completed.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-800 dark:text-white">
                        {c.unpredictable_challenge?.title ||
                          c.ngo_challenge?.title}
                      </span>
                    </div>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      +{c.points_earned || 0} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.section>

        {/* Recent Activity */}
        {pointsHistory.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-accent-600 dark:text-accent-400" />
              Recent Activity
            </h2>

            <div className="space-y-3">
              {pointsHistory.slice(0, 10).map((entry, index) => (
                <div
                  key={entry.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent-100 dark:bg-accent-900/50 rounded-full flex items-center justify-center">
                      {entry.source_type === "observation" ? (
                        <Camera className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                      ) : entry.source_type === "challenge" ? (
                        <Target className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                      ) : (
                        <Star className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 dark:text-white">
                        {entry.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-600 dark:text-green-400 font-bold">
                    +{entry.points_change}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
