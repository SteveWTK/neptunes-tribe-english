"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Zap, Clock, X, ChevronRight } from "lucide-react";

/**
 * Challenge Notification Indicator (Red Dot in Header)
 * Shows when there's an active unpredictable challenge
 */
export default function ChallengeNotification() {
  const { data: session } = useSession();
  const router = useRouter();

  const [hasNotification, setHasNotification] = useState(false);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch challenges
  const fetchChallenges = useCallback(async () => {
    if (!session) return;

    try {
      const response = await fetch("/api/challenges/user");
      const data = await response.json();

      if (response.ok) {
        setHasNotification(data.hasNewNotification);
        setActiveChallenges(data.activeChallenges || []);
      }
    } catch (err) {
      console.error("Error fetching challenges:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchChallenges();

    // Check for new challenges every 5 minutes
    const interval = setInterval(fetchChallenges, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchChallenges]);

  // Mark notification as shown when popup opens
  const handleClick = async () => {
    setShowPopup(!showPopup);

    if (hasNotification) {
      try {
        await fetch("/api/challenges/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark_notification_shown" }),
        });
        setHasNotification(false);
      } catch (err) {
        console.error("Error marking notification:", err);
      }
    }
  };

  // Navigate to challenge on eco-map
  const viewChallenge = (challenge) => {
    setShowPopup(false);
    // Navigate to eco-map with challenge highlight
    router.push(`/worlds?challenge=${challenge.id}`);
  };

  // Calculate time remaining
  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!session || loading) return null;

  // No active challenges
  if (activeChallenges.length === 0 && !hasNotification) return null;

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        onClick={handleClick}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Challenges"
      >
        <Zap className="w-5 h-5 text-gray-600" />

        {/* Red Dot */}
        {hasNotification && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
          />
        )}

        {/* Pulse animation for new notification */}
        {hasNotification && (
          <motion.span
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"
          />
        )}
      </button>

      {/* Popup */}
      <AnimatePresence>
        {showPopup && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPopup(false)}
            />

            {/* Popup Content */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">Active Challenges</span>
                </div>
                <button
                  onClick={() => setShowPopup(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Challenges List */}
              <div className="max-h-[300px] overflow-y-auto">
                {activeChallenges.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">No active challenges right now.</p>
                    <p className="text-xs mt-1">Check back later!</p>
                  </div>
                ) : (
                  activeChallenges.map((userChallenge) => {
                    const challenge =
                      userChallenge.unpredictable_challenge ||
                      userChallenge.ngo_challenge;
                    const isUnpredictable = !!userChallenge.unpredictable_challenge;
                    const timeRemaining = getTimeRemaining(userChallenge.expires_at);

                    return (
                      <button
                        key={userChallenge.id}
                        onClick={() => viewChallenge(userChallenge)}
                        className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            {/* Type Badge */}
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${
                                isUnpredictable
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {isUnpredictable ? "⚡ Bonus Challenge" : "🌍 NGO Challenge"}
                            </span>

                            {/* Title */}
                            <h4 className="font-medium text-gray-800 mb-1">
                              {challenge?.title}
                            </h4>

                            {/* Progress */}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>
                                {userChallenge.progress_count}/{userChallenge.target_count}
                              </span>

                              {timeRemaining && (
                                <span className="flex items-center gap-1 text-amber-600">
                                  <Clock className="w-3 h-3" />
                                  {timeRemaining}
                                </span>
                              )}
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isUnpredictable ? "bg-amber-500" : "bg-green-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (userChallenge.progress_count / userChallenge.target_count) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowPopup(false);
                    router.push("/challenges");
                  }}
                  className="w-full py-2 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  View All Challenges →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
