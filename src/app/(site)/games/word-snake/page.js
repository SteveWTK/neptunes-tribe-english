"use client";

import { useState, useEffect } from "react";
import WordSnakeGame from "@/components/WordSnakeGame";
import { Loader2, BookmarkCheck, Library, Zap } from "lucide-react";
import Link from "next/link";

export default function WordSnakePage() {
  const [vocabularySource, setVocabularySource] = useState("default"); // 'default' or 'personal'
  const [personalClues, setPersonalClues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameKey, setGameKey] = useState(0); // Force re-render when source changes

  // Fetch personal vocabulary clues
  useEffect(() => {
    if (vocabularySource === "personal") {
      fetchPersonalClues();
    }
  }, [vocabularySource]);

  const fetchPersonalClues = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vocabulary/word-snake");

      if (response.status === 401) {
        setError("Please log in to use your personal vocabulary");
        setVocabularySource("default");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch vocabulary");
      }

      const data = await response.json();
      setPersonalClues(data.clues || []);
      setError(null);
      setGameKey((prev) => prev + 1); // Force game restart with new clues
    } catch (err) {
      console.error("Error fetching personal clues:", err);
      setError(err.message);
      setVocabularySource("default");
    } finally {
      setLoading(false);
    }
  };

  const handleSourceChange = (source) => {
    setVocabularySource(source);
    setGameKey((prev) => prev + 1); // Restart game with new source
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50 dark:from-primary-900 dark:to-primary-800 py-8">
      {/* Challenge Mode Banner */}
      <div className="max-w-4xl mx-auto px-4 mb-4">
        <Link href="/games/challenge">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl p-4 shadow-lg cursor-pointer transition-all transform hover:scale-[1.02]">
            <div className="flex items-center justify-center gap-3">
              <Zap className="w-6 h-6" />
              <span className="font-bold text-lg">Try Challenge Mode!</span>
              <span className="text-sm opacity-90">Combine Memory Match & Word Snake</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Vocabulary Source Selector */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Practice with:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleSourceChange("default")}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-medium text-sm transition-colors ${
                vocabularySource === "default"
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              <Library className="w-4 h-4" />
              <span>Default Words</span>
            </button>
            <button
              onClick={() => handleSourceChange("personal")}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-medium text-sm transition-colors ${
                vocabularySource === "personal"
                  ? "bg-accent-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BookmarkCheck className="w-4 h-4" />
              )}
              <span>My Practice List</span>
            </button>
          </div>
        </div>

        {/* Error/Info Messages */}
        {error && (
          <div className="mt-3 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        {vocabularySource === "personal" && personalClues.length === 0 && !loading && !error && (
          <div className="mt-3 text-center text-sm text-yellow-600 dark:text-yellow-400">
            Your practice list is empty. Save some words from lessons first!
          </div>
        )}
        {vocabularySource === "personal" && personalClues.length > 0 && (
          <div className="mt-3 text-center text-sm text-green-600 dark:text-green-400">
            Playing with {personalClues.length} words from your practice list
          </div>
        )}
      </div>

      {/* Word Snake Game */}
      {!loading && (
        <WordSnakeGame
          key={gameKey}
          customClues={vocabularySource === "personal" ? personalClues : null}
        />
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading your vocabulary...
          </p>
        </div>
      )}
    </div>
  );
}
