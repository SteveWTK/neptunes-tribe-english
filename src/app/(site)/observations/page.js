"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  Loader2,
  Filter,
  Globe,
  Building,
  ChevronDown,
  Leaf,
  Camera,
} from "lucide-react";

export default function ObservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Filters
  const [viewMode, setViewMode] = useState("public"); // public, school, mine
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const limit = 12;

  // Fetch observations
  const fetchObservations = useCallback(
    async (reset = false) => {
      const currentOffset = reset ? 0 : offset;

      try {
        setLoading(true);
        setError(null);

        let url;
        if (viewMode === "mine") {
          url = `/api/observations?limit=${limit}&offset=${currentOffset}`;
        } else {
          url = `/api/observations/feed?limit=${limit}&offset=${currentOffset}`;
          if (viewMode === "school") {
            url += "&schoolOnly=true";
          }
          if (speciesFilter) {
            url += `&species=${encodeURIComponent(speciesFilter)}`;
          }
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch observations");
        }

        if (reset) {
          setObservations(data.observations);
          setOffset(limit);
        } else {
          setObservations((prev) => [...prev, ...data.observations]);
          setOffset((prev) => prev + limit);
        }

        setHasMore(data.observations.length === limit);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [offset, viewMode, speciesFilter]
  );

  // Initial fetch
  useEffect(() => {
    fetchObservations(true);
  }, [viewMode, speciesFilter]);

  // Handle like
  const handleLike = async (observationId) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch(`/api/observations/${observationId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        setObservations((prev) =>
          prev.map((obs) =>
            obs.id === observationId
              ? {
                  ...obs,
                  likes_count: obs.user_has_liked
                    ? obs.likes_count - 1
                    : obs.likes_count + 1,
                  user_has_liked: !obs.user_has_liked,
                }
              : obs
          )
        );
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-primary-900">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600 dark:text-accent-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-600 dark:from-green-900 dark:via-green-900 dark:to-green-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Wildlife Observations</h1>
              <p className="text-accent-100">
                Discover amazing wildlife spotted by our global community
              </p>
            </div>

            {session && (
              <Link
                href="/observations/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-accent-700 font-semibold rounded-xl hover:bg-accent-50 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                New Observation
              </Link>
            )}
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setViewMode("public")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                viewMode === "public"
                  ? "bg-white text-accent-700"
                  : "bg-accent-500/30 text-white hover:bg-accent-500/50"
              }`}
            >
              <Globe className="w-4 h-4" />
              Global Feed
            </button>
            {session && (
              <>
                <button
                  onClick={() => setViewMode("school")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    viewMode === "school"
                      ? "bg-white text-accent-700"
                      : "bg-accent-500/30 text-white hover:bg-accent-500/50"
                  }`}
                >
                  <Building className="w-4 h-4" />
                  My School
                </button>
                <button
                  onClick={() => setViewMode("mine")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    viewMode === "mine"
                      ? "bg-white text-accent-700"
                      : "bg-accent-500/30 text-white hover:bg-accent-500/50"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  My Observations
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </button>

        {showFilters && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Species
                </label>
                <input
                  type="text"
                  value={speciesFilter}
                  onChange={(e) => setSpeciesFilter(e.target.value)}
                  placeholder="Search species..."
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Observations Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {observations.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              No observations yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {viewMode === "mine"
                ? "Start exploring nature and share your first observation!"
                : "Be the first to share a wildlife observation!"}
            </p>
            {session && (
              <Link
                href="/observations/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 text-white font-semibold rounded-xl hover:bg-accent-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Observation
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {observations.map((obs) => (
              <ObservationCard
                key={obs.id}
                observation={obs}
                onLike={() => handleLike(obs.id)}
                isLoggedIn={!!session}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && observations.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => fetchObservations(false)}
              disabled={loading}
              className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Observation Card Component
function ObservationCard({ observation, onLike, isLoggedIn }) {
  const router = useRouter();

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/observations/${observation.id}`)}
    >
      {/* Image */}
      <div className="aspect-square relative">
        <img
          src={observation.photo_url}
          alt={observation.title}
          className="w-full h-full object-cover"
        />

        {/* Confidence badge */}
        {observation.ai_confidence && (
          <div
            className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              observation.ai_confidence === "high"
                ? "bg-green-500/90 text-white"
                : observation.ai_confidence === "medium"
                ? "bg-yellow-500/90 text-white"
                : "bg-gray-500/90 text-white"
            }`}
          >
            {observation.ai_confidence === "high"
              ? "Verified"
              : observation.ai_confidence === "medium"
              ? "Likely"
              : "Uncertain"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-1 truncate">
          {observation.ai_species_name || observation.title}
        </h3>

        {observation.ai_scientific_name && (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic truncate mb-2">
            {observation.ai_scientific_name}
          </p>
        )}

        {/* Location & Date */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
          {observation.location_name && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3" />
              {observation.location_name.split(",")[0]}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(observation.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* User & Engagement */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {observation.user?.image ? (
              <img
                src={observation.user.image}
                alt={observation.user.name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-accent-100 dark:bg-accent-900 flex items-center justify-center">
                <span className="text-xs text-accent-700 dark:text-accent-300 font-medium">
                  {observation.user?.name?.[0] || "?"}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[100px]">
              {observation.user?.name || "Anonymous"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className={`flex items-center gap-1 text-sm ${
                observation.user_has_liked
                  ? "text-red-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-red-500"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  observation.user_has_liked ? "fill-current" : ""
                }`}
              />
              {observation.likes_count || 0}
            </button>
            <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-4 h-4" />
              {observation.comments_count || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
