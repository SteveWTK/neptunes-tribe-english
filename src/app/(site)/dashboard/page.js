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
  Target,
  ChevronRight,
  Leaf,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  MapPin,
  Star,
  Award,
  Building,
  Settings,
} from "lucide-react";
import SpeciesJourneyWidget from "@/components/journey/SpeciesJourneyWidget";
import ObservationMarkersMap from "@/components/observations/ObservationMarkersMap";
import SeasonProgressBar from "@/components/season/SeasonProgressBar";
import DisplayNamePrompt from "@/components/profile/DisplayNamePrompt";
import DashboardTour, { shouldShowDashboardTour } from "@/components/onboarding/DashboardTour";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
      {/* Season Progress Bar */}
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
      {showTour && (
        <DashboardTour onComplete={() => setShowTour(false)} />
      )}

      {/* Header with user greeting and points */}
      <div>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* User avatar or species avatar */}
              <div
                data-tour="species-avatar"
                className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/50"
              >
                {journey?.species_avatar?.avatar_image_url ? (
                  <img
                    src={journey.species_avatar.avatar_image_url}
                    alt={journey.species_avatar.common_name}
                    className="w-full h-full object-cover"
                  />
                ) : session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Leaf className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">
                  Welcome back,{" "}
                  {(userName || session.user.name)?.split(" ")[0] || "Explorer"}
                  !
                </h1>
                {journey?.species_avatar && (
                  <p className="text-gray-600 dark:text-accent-100">
                    Protecting the {journey.species_avatar.common_name}
                  </p>
                )}
              </div>

              {/* Profile/Settings Link */}
              <Link
                data-tour="settings-link"
                href="/profile"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Profile & Settings"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-white" />
              </Link>
            </div>

            {/* Points display */}
            {/* <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-2 text-3xl font-bold">
                  <Trophy className="w-8 h-8 text-yellow-300" />
                  {journey?.total_points?.toLocaleString() || 0}
                </div>
                <p className="text-sm text-gray-600 dark:text-accent-100">
                  Total Points
                </p>
              </div>
              {journey && (
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {journey.observations_count || 0}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-accent-100">
                    Observations
                  </p>
                </div>
              )}
            </div> */}
          </div>
        </div>
      </div>

      {/* Season Progress Bar */}
      {/* <SeasonProgressBar /> */}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div data-tour="quick-actions" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                href="/worlds"
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:scale-105 flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-200 dark:group-hover:bg-purple-900 transition-colors">
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  Worlds and Adventures
                </span>
              </Link>
              <Link
                href="/observations/create"
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:scale-105 flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/50 rounded-full flex items-center justify-center mb-2 group-hover:bg-accent-200 dark:group-hover:bg-accent-900 transition-colors">
                  <Camera className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  New Observation
                </span>
              </Link>

              {/* <Link
                href="/observations"
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:scale-105 flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-900 transition-colors">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  Explore Feed
                </span>
              </Link>

              <Link
                href="/eco-map"
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:scale-105 flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-2 group-hover:bg-green-200 dark:group-hover:bg-green-900 transition-colors">
                  <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  Eco Map
                </span>
              </Link> */}
            </div>

            {/* Active Bonus Challenges */}
            {unpredictableChallenges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
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
                        className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-200 dark:border-amber-700 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="inline-block px-2 py-0.5 bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 rounded-full text-xs font-medium mb-2">
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
                              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
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

                        <div className="h-2 bg-amber-100 dark:bg-amber-900/50 rounded-full overflow-hidden mb-4">
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
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                        >
                          Submit Observation
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Recent Observations */}
            {recentObservations.length > 0 && (
              <motion.div
                data-tour="recent-observations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
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

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

            {/* Community Observations Map */}
            <motion.div
              data-tour="wildlife-map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <ObservationMarkersMap
                  compact={true}
                  showFilters={true}
                  initialFilter="global"
                  maxMarkers={50}
                />
              </div>
            </motion.div>

            {/* Eco News Section */}
            {ecoNews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                    Latest Eco News
                  </h2>
                  <Link
                    href="/eco-news"
                    className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {ecoNews.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">
                          {item.type === "news"
                            ? "📰"
                            : item.type === "blog"
                            ? "✍️"
                            : "🎓"}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {item.summary}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(
                                item.published_date
                              ).toLocaleDateString()}
                            </span>
                            {item.source_url && (
                              <a
                                href={item.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-accent-600 dark:text-accent-400 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Read more
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

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Species Journey Widget */}
            {journey && (
              <div data-tour="journey-widget">
                <SpeciesJourneyWidget />
              </div>
            )}

            {/* No avatar prompt */}
            {!journey && (
              <div className="bg-gradient-to-br from-accent-50 to-blue-50 dark:from-accent-900/30 dark:to-blue-900/30 rounded-xl shadow-sm p-6 text-center">
                <Leaf className="w-12 h-12 text-accent-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                  Start Your Journey
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Choose an endangered species to protect and help them recover!
                </p>
                <Link
                  href="/select-avatar"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 text-white font-medium rounded-lg hover:bg-accent-700 transition-colors"
                >
                  Choose Species
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Community Stats */}
            <div data-tour="community-stats" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                Community Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Total Observations
                  </span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {communityStats?.totalObservations?.toLocaleString() ||
                      "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Species Identified
                  </span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {communityStats?.speciesIdentified?.toLocaleString() ||
                      "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Active Naturalists
                  </span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {communityStats?.activeNaturalists?.toLocaleString() ||
                      "--"}
                  </span>
                </div>
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div data-tour="leaderboard" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Top Naturalists
              </h3>
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.points.toLocaleString()} points
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/leaderboard"
                className="block mt-3 text-center text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium"
              >
                View Full Leaderboard
              </Link>
            </div>

            {/* School section placeholder */}
            {/* TODO: Show school info if user belongs to a school */}
            {false && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Your School
                </h3>
                {/* School content would go here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
