"use client";
import { useState, useEffect } from "react";
import {
  BookmarkCheck,
  Trash2,
  Loader2,
  Trophy,
  Target,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";

export default function PersonalVocabularyPage() {
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, alphabetical, most-practiced
  const [filterBy, setFilterBy] = useState("all"); // all, needs-practice, with-images

  useEffect(() => {
    fetchVocabulary();
  }, []);

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vocabulary/personal");
      if (!response.ok) {
        if (response.status === 401) {
          setError("Please log in to view your vocabulary");
          return;
        }
        throw new Error("Failed to fetch vocabulary");
      }
      const data = await response.json();
      setVocabulary(data.vocabulary || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching vocabulary:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this word from your practice list?")) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/vocabulary/personal?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setVocabulary((prev) => prev.filter((word) => word.id !== id));
    } catch (err) {
      console.error("Error deleting word:", err);
      alert("Failed to remove word. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter and sort vocabulary
  const getFilteredAndSortedVocabulary = () => {
    let filtered = [...vocabulary];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (word) =>
          word.en.toLowerCase().includes(search) ||
          word.pt.toLowerCase().includes(search)
      );
    }

    // Apply category filter
    if (filterBy === "needs-practice") {
      filtered = filtered.filter((word) => (word.timesPracticed || 0) < 3);
    } else if (filterBy === "with-images") {
      filtered = filtered.filter((word) => word.enImage || word.ptImage);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.en.localeCompare(b.en);
        case "most-practiced":
          return (b.timesPracticed || 0) - (a.timesPracticed || 0);
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  };

  const filteredVocabulary = getFilteredAndSortedVocabulary();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading your vocabulary...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl max-w-md">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link
            href="/login"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookmarkCheck className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-900 dark:text-white">
              My Practice Vocabulary
            </h1>
          </div>
          {/* <p className="text-gray-600 dark:text-gray-400 mb-6">
            Words you saved from lessons for extra practice
          </p> */}

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/games/memory-match"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-2xl hover:shadow-lg transition-all font-medium"
            >
              <Target className="w-4 h-4" />
              <span>Practice with Memory Match</span>
            </Link>
            <button
              onClick={fetchVocabulary}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Vocabulary List */}
        {vocabulary.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <BookmarkCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No words saved yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start adding words from lesson activities to build your practice
              list!
            </p>
            <Link
              href="/worlds"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-colors font-medium"
            >
              Explore Worlds
            </Link>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vocabulary in English or Portuguese..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Filter and Sort Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Filter Dropdown */}
                <div className="flex items-center gap-2 flex-1">
                  <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Words ({vocabulary.length})</option>
                    <option value="needs-practice">
                      Needs Practice (
                      {
                        vocabulary.filter((w) => (w.timesPracticed || 0) < 3)
                          .length
                      }
                      )
                    </option>
                    <option value="with-images">
                      With Images (
                      {vocabulary.filter((w) => w.enImage || w.ptImage).length})
                    </option>
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 flex-1">
                  <ArrowUpDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="alphabetical">Alphabetical (A-Z)</option>
                    <option value="most-practiced">Most Practiced</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              {(searchTerm || filterBy !== "all") && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredVocabulary.length} of {vocabulary.length}{" "}
                  words
                </div>
              )}
            </div>
          </>
        )}

        {vocabulary.length > 0 && (
          <>
            {/* Stats */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Words
                </p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {vocabulary.length}
                </p>
              </div>
              <div className="bg-accent-50 dark:bg-accent-900/20 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Practices
                </p>
                <p className="text-3xl font-bold text-accent-600 dark:text-accent-400">
                  {vocabulary.reduce((sum, word) => sum + (word.timesPracticed || 0), 0)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  With Images
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {vocabulary.filter((word) => word.enImage || word.ptImage).length}
                </p>
              </div>
            </div> */}

            {/* Vocabulary Grid */}
            {filteredVocabulary.length === 0 ? (
              <div className="text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No words found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVocabulary.map((word) => {
                  const needsPractice = (word.timesPracticed || 0) < 3;
                  return (
                    <div
                      key={word.id}
                      className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow relative ${
                        needsPractice
                          ? "ring-2 ring-yellow-400 dark:ring-yellow-600"
                          : ""
                      }`}
                    >
                      {needsPractice && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full">
                            Needs Practice
                          </span>
                        </div>
                      )}
                      {/* Word Pair */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          {word.enImage && (
                            <img
                              src={word.enImage}
                              alt={word.en}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              English
                            </div>
                            <div className="font-semibold text-lg text-primary-900 dark:text-primary-100">
                              {word.en}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {word.ptImage && (
                            <img
                              src={word.ptImage}
                              alt={word.pt}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Português
                            </div>
                            <div className="font-semibold text-lg text-emerald-700 dark:text-emerald-400">
                              {word.pt}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats & Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Trophy className="w-3 h-3" />
                          <span>Practiced {word.timesPracticed || 0}x</span>
                        </div>
                        <button
                          onClick={() => handleDelete(word.id)}
                          disabled={deletingId === word.id}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          {deletingId === word.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
