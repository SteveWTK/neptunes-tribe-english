"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Loader2,
  Zap,
  Globe,
  Trophy,
  Camera,
  ChevronRight,
  Leaf,
  Users,
  Calendar,
  ExternalLink,
  MapPin,
  Star,
  Award,
  Settings,
  RefreshCw,
} from "lucide-react";
import SeasonProgressBar from "@/components/season/SeasonProgressBar";
import DisplayNamePrompt from "@/components/profile/DisplayNamePrompt";
import DashboardTour, {
  shouldShowDashboardTour,
} from "@/components/onboarding/DashboardTour";

// IUCN Status configuration for species journey display
const IUCN_LEVELS = [
  { code: "EX", label: "Extinct", color: "#000000" },
  { code: "EW", label: "Extinct in Wild", color: "#1f2937" },
  { code: "CR", label: "Critically Endangered", color: "#dc2626" },
  { code: "EN", label: "Endangered", color: "#f97316" },
  { code: "VU", label: "Vulnerable", color: "#eab308" },
  { code: "NT", label: "Near Threatened", color: "#84cc16" },
  { code: "LC", label: "Least Concern", color: "#22c55e" },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Data states
  const [journey, setJourney] = useState(null);
  const [userChallenges, setUserChallenges] = useState([]);
  const [recentObservations, setRecentObservations] = useState([]);
  const [ecoNews, setEcoNews] = useState([]);
  const [communityStats, setCommunityStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsDisplayName, setNeedsDisplayName] = useState(false);
  const [displayNameDismissed, setDisplayNameDismissed] = useState(false);
  const [userName, setUserName] = useState(null);
  const [showTour, setShowTour] = useState(false);
  const [activeIucnTooltip, setActiveIucnTooltip] = useState(null);

  // Fetch all dashboard data
  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch in parallel for performance
        const [
          journeyRes,
          challengesRes,
          observationsRes,
          newsRes,
          statsRes,
          leaderboardRes,
          profileRes,
        ] = await Promise.all([
          fetch("/api/user/journey"),
          fetch("/api/challenges/user"),
          fetch("/api/observations?limit=6"),
          fetch("/api/eco-news?limit=3"),
          fetch("/api/stats/community"),
          fetch("/api/leaderboard/naturalists?limit=3"),
          fetch("/api/user/profile"),
        ]);

        // Process journey
        if (journeyRes.ok) {
          const journeyData = await journeyRes.json();
          setJourney(journeyData.journey);
        }

        // Process challenges
        if (challengesRes.ok) {
          const challengesData = await challengesRes.json();
          setUserChallenges(challengesData.activeChallenges || []);
        }

        // Process observations
        if (observationsRes.ok) {
          const obsData = await observationsRes.json();
          setRecentObservations(obsData.observations || []);
        }

        // Process news
        if (newsRes.ok) {
          const newsData = await newsRes.json();
          setEcoNews(Array.isArray(newsData) ? newsData.slice(0, 3) : []);
        }

        // Process community stats
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setCommunityStats(statsData.stats);
        }

        // Process leaderboard
        if (leaderboardRes.ok) {
          const leaderboardData = await leaderboardRes.json();
          setLeaderboard(
            (leaderboardData.leaderboard || []).map((entry) => ({
              rank: entry.rank,
              name: entry.userName,
              points: entry.totalPoints,
              avatar: entry.speciesAvatar?.avatar_image_url || entry.userImage,
            }))
          );
        }

        // Process profile to check if display name is needed and get user name
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setNeedsDisplayName(profileData.needsDisplayName || false);
          // Use name from database (more up-to-date than session)
          if (profileData.user?.name) {
            setUserName(profileData.user.name);
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  // Get active unpredictable challenges (filter out expired ones)
  const unpredictableChallenges = userChallenges.filter((c) => {
    if (!c.unpredictable_challenge_id) return false;
    // Filter out expired challenges
    if (c.expires_at && new Date(c.expires_at) <= new Date()) return false;
    return true;
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Check if dashboard tour should be shown (after data loads)
  useEffect(() => {
    if (!loading && session && shouldShowDashboardTour()) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => setShowTour(true), 300);
      return () => clearTimeout(timer);
    }
  }, [loading, session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600 dark:text-accent-400" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Helper function to get IUCN status index
  const getStatusIndex = (status) => {
    return IUCN_LEVELS.findIndex((l) => l.code === status);
  };

  const currentStatusIndex = journey
    ? getStatusIndex(journey.current_iucn_status)
    : 0;
  const currentLevel = journey ? IUCN_LEVELS[currentStatusIndex] : null;
  const startingStatusIndex = journey
    ? getStatusIndex(journey.starting_iucn_status)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
      {/* 1. Season Progress Bar */}
      <div data-tour="season-progress">
        <SeasonProgressBar />
      </div>

      {/* Display Name Prompt (shown if user hasn't set their name) */}
      {needsDisplayName && !displayNameDismissed && (
        <DisplayNamePrompt
          onComplete={() => setNeedsDisplayName(false)}
          onDismiss={() => setDisplayNameDismissed(true)}
        />
      )}

      {/* Dashboard Tour for new users */}
      {showTour && <DashboardTour onComplete={() => setShowTour(false)} />}

      <div data-tour="user-dashboard" className="max-w-7xl mx-auto px-4 py-6">
        {/* 2. Species Avatar Hero Section - Combined welcome + species status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {journey ? (
            <div
              className="rounded-2xl overflow-hidden shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${currentLevel?.color}dd 0%, ${currentLevel?.color}99 100%)`,
              }}
            >
              <div className="px-6 py-6 lg:py-3 text-white">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Avatar and Welcome */}
                  <div
                    data-tour="species-avatar"
                    className="flex items-center gap-4 flex-1"
                  >
                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-3 border-white/50 shadow-lg">
                      {journey.species_avatar?.avatar_image_url ? (
                        <img
                          src={journey.species_avatar.avatar_image_url}
                          alt={journey.species_avatar.common_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Leaf className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl lg:text-3xl font-bold mb-1">
                        Welcome back,{" "}
                        {(userName || session.user.name)?.split(" ")[0] ||
                          "Explorer"}
                        !
                      </h1>
                      <p className="text-white/90 text-lg">
                        Protecting the{" "}
                        <span className="font-semibold">
                          {journey.species_avatar?.common_name}
                        </span>
                      </p>
                      <p className="text-white/70 text-sm italic">
                        {journey.species_avatar?.scientific_name}
                      </p>
                    </div>
                  </div>

                  {/* Stats and Status */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:items-end">
                    {/* Current Status Badge */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                      <div className="text-xs text-white/80 mb-1">
                        Current Status
                      </div>
                      <div className="font-bold text-lg">
                        {currentLevel?.label}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {journey.total_points?.toLocaleString() || 0}
                        </div>
                        <div className="text-xs text-white/80">Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {journey.observations_count || 0}
                        </div>
                        <div className="text-xs text-white/80">
                          Observations
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div data-tour="status-level" className="mt-6">
                  <div className="flex justify-between text-xs text-white/80 mb-2">
                    <span>Recovery Progress</span>
                    {journey.next_level_threshold && (
                      <span>
                        {(
                          journey.next_level_threshold.points_required -
                          journey.total_points
                        ).toLocaleString()}{" "}
                        pts to{" "}
                        {
                          IUCN_LEVELS.find(
                            (l) =>
                              l.code === journey.next_level_threshold.to_status
                          )?.label
                        }
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {IUCN_LEVELS.slice(startingStatusIndex).map((level, i) => {
                      const actualIndex = startingStatusIndex + i;
                      const isPast = actualIndex > currentStatusIndex;
                      const isCurrent = actualIndex === currentStatusIndex;
                      const isComplete = actualIndex < currentStatusIndex;

                      return (
                        <div key={level.code} className="flex-1 relative">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              isCurrent ? "ring-2 ring-white ring-offset-1" : ""
                            }`}
                            style={{
                              backgroundColor:
                                isComplete || isCurrent
                                  ? "rgba(255,255,255,0.9)"
                                  : "rgba(255,255,255,0.3)",
                              opacity: isPast ? 0.4 : 1,
                            }}
                          >
                            {isCurrent && (
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${journey.level_progress || 0}%`,
                                  backgroundColor: "rgba(255,255,255,0.5)",
                                }}
                              />
                            )}
                          </div>
                          {/* Mobile: Code with click tooltip / Desktop: Full label */}
                          <div className="text-center mt-1">
                            {/* Mobile view - clickable code with tooltip */}
                            <button
                              onClick={() =>
                                setActiveIucnTooltip(
                                  activeIucnTooltip === level.code
                                    ? null
                                    : level.code
                                )
                              }
                              className={`md:hidden text-[10px] font-medium ${
                                isPast ? "text-white/50" : "text-white/90"
                              } hover:text-white transition-colors`}
                            >
                              {level.code}
                            </button>
                            {/* Desktop view - full label */}
                            <span
                              className={`hidden md:inline text-[9px] font-medium leading-tight ${
                                isPast ? "text-white/50" : "text-white/90"
                              }`}
                            >
                              {level.label.split(" ").map((word, wi) => (
                                <span key={wi} className="block">
                                  {word}
                                </span>
                              ))}
                            </span>
                          </div>
                          {/* Mobile tooltip */}
                          {activeIucnTooltip === level.code && (
                            <div
                              className="md:hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10"
                              onClick={() => setActiveIucnTooltip(null)}
                            >
                              <div className="bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                {level.label}
                              </div>
                              <div className="w-2 h-2 bg-white rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Link
                    href="/journey"
                    className="text-sm text-white/90 hover:text-white font-medium flex items-center gap-1"
                  >
                    View Full Journey <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/select-avatar"
                    className="text-sm text-white/70 hover:text-white/90 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Change Avatar
                  </Link>
                  <Link
                    data-tour="settings-link"
                    href="/profile"
                    className="ml-auto p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    title="Profile & Settings"
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* No avatar yet - prompt to select */
            <div className="bg-gradient-to-br from-accent-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white text-center">
              <Leaf className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                Welcome,{" "}
                {(userName || session.user.name)?.split(" ")[0] || "Explorer"}!
              </h1>
              <p className="text-white/90 text-lg mb-6 max-w-md mx-auto">
                Choose an endangered species to protect and begin your
                conservation journey!
              </p>
              <Link
                href="/select-avatar"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-accent-600 font-bold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
              >
                Choose Your Species
                <ChevronRight className="w-5 h-5" />
              </Link>
              <div className="mt-4">
                <Link
                  data-tour="settings-link"
                  href="/profile"
                  className="text-sm text-white/70 hover:text-white/90 flex items-center gap-1 justify-center"
                >
                  <Settings className="w-4 h-4" />
                  Profile & Settings
                </Link>
              </div>
            </div>
          )}
        </motion.div>

        {/* 3. Quick Actions - Main activity links */}
        <motion.div
          data-tour="quick-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <Link
            data-tour="eight-worlds"
            href="/worlds"
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] flex items-center gap-4 group"
          >
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900 transition-colors">
              <Star className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <span className="text-lg font-semibold text-gray-800 dark:text-white block">
                Worlds & Adventures
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Learn and earn points
              </span>
            </div>
          </Link>
          <Link
            data-tour="observations"
            href="/observations/create"
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] flex items-center gap-4 group"
          >
            <div className="w-14 h-14 bg-accent-100 dark:bg-accent-900/50 rounded-xl flex items-center justify-center group-hover:bg-accent-200 dark:group-hover:bg-accent-900 transition-colors">
              <Camera className="w-7 h-7 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <span className="text-lg font-semibold text-gray-800 dark:text-white block">
                New Observation
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Log wildlife sightings
              </span>
            </div>
          </Link>
        </motion.div>

        {/* 4. Active Bonus Challenges (when there is one) */}
        {unpredictableChallenges.length > 0 && (
          <motion.div
            data-tour="special-challenges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" />
              Active Bonus Challenge
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
                    className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-200 dark:border-amber-700 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="inline-block px-2 py-0.5 bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 rounded-full text-xs font-medium mb-2">
                          Time Limited
                        </span>
                        <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                          {challenge?.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {challenge?.description}
                        </p>
                      </div>
                      {hoursRemaining !== null && (
                        <div className="text-right flex-shrink-0 ml-4">
                          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
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
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <Trophy className="w-4 h-4" />
                        {challenge?.points_reward} pts
                      </span>
                    </div>

                    <div className="h-3 bg-amber-100 dark:bg-amber-900/50 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
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
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Submit Observation
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Two-column layout for stats on desktop */}
        <div
          data-tour="community"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* 5. Community Stats */}
          <motion.div
            data-tour="community-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5"
          >
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
              <Users className="w-6 h-6 text-accent-600 dark:text-accent-400" />
              Community Stats
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {communityStats?.totalObservations?.toLocaleString() || "--"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Observations
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {communityStats?.speciesIdentified?.toLocaleString() || "--"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Species
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {communityStats?.activeNaturalists?.toLocaleString() || "--"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Naturalists
                </div>
              </div>
            </div>
          </motion.div>

          {/* 6. Leaderboard */}
          <motion.div
            data-tour="leaderboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-lg">
                <Award className="w-6 h-6 text-yellow-500" />
                Top Naturalists
              </h3>
              <Link
                href="/leaderboard"
                className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {leaderboard.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"
                        : index === 1
                        ? "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                    }`}
                  >
                    {user.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white text-sm">
                      {user.name}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {user.points.toLocaleString()} pts
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 7. Recent Observations */}
        {recentObservations.length > 0 && (
          <motion.div
            data-tour="recent-observations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {recentObservations.slice(0, 6).map((obs) => (
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
          </motion.div>
        )}

        {/* 8. Wildlife Map Preview (Static to avoid MapBox reloads) */}
        <motion.div
          data-tour="wildlife-map"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
              Wildlife Map
            </h2>
            <Link
              href="/eco-map"
              className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium flex items-center gap-1"
            >
              Full Map <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Static map preview - links to full map page */}
          <Link
            href="/eco-map"
            className="block bg-gradient-to-br from-gray-50 to-gray-100 dark:from-primary-900/20 dark:to-primary-950/20 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
          >
            <div className="relative h-54 lg:h-64 flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('/images/map-preview.jpg')] bg-cover bg-center opacity-30 dark:opacity-20" />
              <div className="relative text-center p-6">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                {/* <img
                  src="/maps/mapbox-globe.png"
                  alt="Wildlife Map"
                  className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform"
                /> */}
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Explore Wildlife Sightings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  View observations from naturalists around the world on our
                  interactive map
                </p>
                <span className="inline-flex items-center gap-1 mt-4 text-accent-600 dark:text-accent-400 font-medium">
                  Open Map <ExternalLink className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* 9. Eco News Section */}
        {ecoNews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                Eco News
              </h2>
              <Link
                href="/eco-news"
                className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ecoNews.map((item, index) => (
                <div
                  key={item.id || index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {item.type === "news"
                        ? "📰"
                        : item.type === "blog"
                        ? "✍️"
                        : "🎓"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {item.summary}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.published_date).toLocaleDateString()}
                        </span>
                        {item.source_url && (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-accent-600 dark:text-accent-400 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Read
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
