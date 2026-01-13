"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Loader2,
  Trophy,
  Medal,
  Award,
  Crown,
  ChevronLeft,
  Camera,
  TrendingUp,
  Globe,
  Building,
  Users,
  Leaf,
} from "lucide-react";

const IUCN_BADGES = {
  CR: { label: "Critically Endangered", color: "bg-red-500", emoji: "🔴" },
  EN: { label: "Endangered", color: "bg-orange-500", emoji: "🟠" },
  VU: { label: "Vulnerable", color: "bg-yellow-500", emoji: "🟡" },
  NT: { label: "Near Threatened", color: "bg-blue-500", emoji: "🔵" },
  LC: { label: "Least Concern", color: "bg-green-500", emoji: "🟢" },
};

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("global");
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/leaderboard/naturalists?filter=${filter}&limit=50`
        );
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
          setCurrentUserRank(data.currentUserRank);
          setTotalUsers(data.total || 0);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [filter]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBg = (rank, isCurrentUser) => {
    if (isCurrentUser) return "bg-accent-50 dark:bg-accent-900/30 border-accent-300 dark:border-accent-700";
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-300 dark:border-gray-600";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-700";
      default:
        return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Naturalist Leaderboard</h1>
              <p className="text-amber-100">
                Top wildlife observers and species protectors
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalUsers}</div>
              <div className="text-sm text-amber-100">Total Naturalists</div>
            </div>
            {currentUserRank && (
              <div className="text-center">
                <div className="text-2xl font-bold">#{currentUserRank.rank}</div>
                <div className="text-sm text-amber-100">Your Rank</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("global")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              filter === "global"
                ? "bg-accent-600 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <Globe className="w-4 h-4" />
            Global
          </button>
          {session && (
            <button
              onClick={() => setFilter("school")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "school"
                  ? "bg-accent-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Building className="w-4 h-4" />
              My School
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent-600 dark:text-accent-400" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No naturalists yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to start your species journey!
            </p>
            <Link
              href="/select-avatar"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 text-white font-medium rounded-lg hover:bg-accent-700 transition-colors"
            >
              <Leaf className="w-5 h-5" />
              Choose Your Species
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* Second Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center pt-8"
                >
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-300 mx-auto bg-gray-100 dark:bg-gray-700">
                      {leaderboard[1]?.speciesAvatar?.avatar_image_url ? (
                        <img
                          src={leaderboard[1].speciesAvatar.avatar_image_url}
                          alt={leaderboard[1].speciesAvatar.common_name}
                          className="w-full h-full object-cover"
                        />
                      ) : leaderboard[1]?.userImage ? (
                        <img
                          src={leaderboard[1].userImage}
                          alt={leaderboard[1].userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-700">
                      2
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white mt-4 truncate">
                    {leaderboard[1]?.userName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {leaderboard[1]?.totalPoints?.toLocaleString()} pts
                  </p>
                </motion.div>

                {/* First Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="relative inline-block">
                    <Crown className="w-8 h-8 text-yellow-500 absolute -top-6 left-1/2 -translate-x-1/2" />
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400 mx-auto bg-yellow-50 dark:bg-yellow-900/30 shadow-lg">
                      {leaderboard[0]?.speciesAvatar?.avatar_image_url ? (
                        <img
                          src={leaderboard[0].speciesAvatar.avatar_image_url}
                          alt={leaderboard[0].speciesAvatar.common_name}
                          className="w-full h-full object-cover"
                        />
                      ) : leaderboard[0]?.userImage ? (
                        <img
                          src={leaderboard[0].userImage}
                          alt={leaderboard[0].userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf className="w-10 h-10 text-yellow-500" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-yellow-900">
                      1
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white mt-4 truncate">
                    {leaderboard[0]?.userName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {leaderboard[0]?.totalPoints?.toLocaleString()} pts
                  </p>
                  {leaderboard[0]?.speciesAvatar && (
                    <p className="text-xs text-accent-600 dark:text-accent-400">
                      {leaderboard[0].speciesAvatar.common_name}
                    </p>
                  )}
                </motion.div>

                {/* Third Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center pt-12"
                >
                  <div className="relative inline-block">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-amber-400 mx-auto bg-amber-50 dark:bg-amber-900/30">
                      {leaderboard[2]?.speciesAvatar?.avatar_image_url ? (
                        <img
                          src={leaderboard[2].speciesAvatar.avatar_image_url}
                          alt={leaderboard[2].speciesAvatar.common_name}
                          className="w-full h-full object-cover"
                        />
                      ) : leaderboard[2]?.userImage ? (
                        <img
                          src={leaderboard[2].userImage}
                          alt={leaderboard[2].userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf className="w-6 h-6 text-amber-500" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center font-bold text-amber-900 text-sm">
                      3
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white mt-4 truncate">
                    {leaderboard[2]?.userName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {leaderboard[2]?.totalPoints?.toLocaleString()} pts
                  </p>
                </motion.div>
              </div>
            )}

            {/* Full Leaderboard List */}
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${getRankBg(
                    entry.rank,
                    entry.isCurrentUser
                  )}`}
                >
                  {/* Rank */}
                  <div className="w-12 text-center flex-shrink-0">
                    {getRankIcon(entry.rank) || (
                      <span className="text-xl font-bold text-gray-400 dark:text-gray-500">
                        {entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    {entry.speciesAvatar?.avatar_image_url ? (
                      <img
                        src={entry.speciesAvatar.avatar_image_url}
                        alt={entry.speciesAvatar.common_name}
                        className="w-full h-full object-cover"
                      />
                    ) : entry.userImage ? (
                      <img
                        src={entry.userImage}
                        alt={entry.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                        {entry.userName}
                        {entry.isCurrentUser && (
                          <span className="ml-2 text-xs bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      {entry.speciesAvatar && (
                        <span className="flex items-center gap-1">
                          {IUCN_BADGES[entry.currentStatus]?.emoji}
                          {entry.speciesAvatar.common_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {entry.observationsCount} obs
                      </span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-xl font-bold text-gray-800 dark:text-white">
                      <TrendingUp className="w-5 h-5 text-accent-500" />
                      {entry.totalPoints?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      points
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Current User Rank (if not in list) */}
            {currentUserRank && !leaderboard.find((e) => e.isCurrentUser) && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Your position:
                </p>
                <div
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 ${getRankBg(
                    currentUserRank.rank,
                    true
                  )}`}
                >
                  <div className="w-12 text-center flex-shrink-0">
                    <span className="text-xl font-bold text-accent-600 dark:text-accent-400">
                      {currentUserRank.rank}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    {currentUserRank.speciesAvatar?.avatar_image_url ? (
                      <img
                        src={currentUserRank.speciesAvatar.avatar_image_url}
                        alt={currentUserRank.speciesAvatar.common_name}
                        className="w-full h-full object-cover"
                      />
                    ) : currentUserRank.userImage ? (
                      <img
                        src={currentUserRank.userImage}
                        alt={currentUserRank.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-accent-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {currentUserRank.userName}
                      <span className="ml-2 text-xs bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      {currentUserRank.speciesAvatar && (
                        <span>
                          {IUCN_BADGES[currentUserRank.currentStatus]?.emoji}{" "}
                          {currentUserRank.speciesAvatar.common_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {currentUserRank.observationsCount} obs
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-xl font-bold text-accent-600 dark:text-accent-400">
                      <TrendingUp className="w-5 h-5" />
                      {currentUserRank.totalPoints?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      points
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
