"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, ChevronRight, Leaf, Loader2 } from "lucide-react";
import Link from "next/link";

/**
 * Saved Species Collection Component
 * Displays all species the user has saved through completing adventures
 *
 * @param {Object} props
 * @param {string} props.userId - User ID (optional, for viewing other users' collections if public)
 * @param {boolean} props.compact - Compact view (default: false)
 * @param {number} props.limit - Limit number of species shown (default: unlimited)
 * @param {Function} props.onSpeciesClick - Optional click handler for species
 */
export default function SavedSpeciesCollection({
  userId = null,
  compact = false,
  limit = null,
  onSpeciesClick = null,
}) {
  const [completedSpecies, setCompletedSpecies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompletedSpecies();
  }, [userId]);

  const fetchCompletedSpecies = async () => {
    try {
      setLoading(true);
      const url = userId
        ? `/api/species/completed?userId=${userId}`
        : "/api/species/completed";

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setCompletedSpecies(data.completedSpecies || []);
        setStats(data.stats);
      } else {
        setError(data.error || "Failed to load saved species");
      }
    } catch (err) {
      console.error("Error fetching completed species:", err);
      setError("Failed to load saved species");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const displayedSpecies = limit
    ? completedSpecies.slice(0, limit)
    : completedSpecies;

  if (compact) {
    // Compact view for dashboard overview
    return (
      <div>
        {/* Header with stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Saved Species
            </h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent-600">
              {stats?.totalSpeciesSaved || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Species
            </div>
          </div>
        </div>

        {/* Species Grid - Compact */}
        {displayedSpecies.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {displayedSpecies.map((species, index) => (
              <motion.button
                key={species.id}
                onClick={() => onSpeciesClick?.(species)}
                className="aspect-square rounded-lg overflow-hidden border-2 border-green-500 hover:border-green-600 hover:scale-105 transition-all relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                {species.species_avatar?.avatar_image_url ? (
                  <img
                    src={species.species_avatar.avatar_image_url}
                    alt={species.species_avatar.common_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                {/* Tooltip on hover */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                  <p className="text-white text-xs font-semibold text-center line-clamp-2">
                    {species.species_avatar.common_name}
                  </p>
                </div>
                {/* Saved badge */}
                <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                  <Trophy className="w-3 h-3" />
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              No species saved yet
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Complete adventures to save endangered species!
            </p>
          </div>
        )}

        {/* View All Link */}
        {completedSpecies.length > (limit || 0) && (
          <Link
            href="/dashboard/saved-species"
            className="flex items-center justify-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mt-3 font-medium"
          >
            <span>View all {completedSpecies.length} species</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    );
  }

  // Full view for dedicated page
  return (
    <div>
      {/* Header with stats */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-accent-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Saved Species Collection
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {stats?.totalSpeciesSaved || 0} species saved •{" "}
              {stats?.totalPoints || 0} points earned
            </p>
          </div>
        </div>
      </div>

      {/* Species Grid - Full */}
      {displayedSpecies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayedSpecies.map((species, index) => (
            <motion.div
              key={species.id}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Image */}
              <div className="aspect-square relative bg-gray-100 dark:bg-gray-700">
                {species.species_avatar?.avatar_image_url ? (
                  <img
                    src={species.species_avatar.avatar_image_url}
                    alt={species.species_avatar.common_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
                  {species.final_iucn_status}
                </div>
                {/* Trophy Badge */}
                <div className="absolute top-2 left-2 bg-accent-600 text-white rounded-full p-1.5 shadow-lg">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {species.species_avatar.common_name}
                </h3>
                {species.species_avatar.scientific_name && (
                  <p className="text-xs italic text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                    {species.species_avatar.scientific_name}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span className="capitalize">{species.adventure_id.replace("-", " ")}</span>
                  <span>{new Date(species.completed_at).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Leaf className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Species Saved Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start an adventure and complete lessons to save endangered species!
          </p>
          <Link
            href="/worlds"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
          >
            <span>Explore Worlds</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
