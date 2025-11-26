"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import MemoryMatch from "@/components/exercises/MemoryMatch";
import WordSnakeGame from "@/components/WordSnakeGame";
import confetti from "canvas-confetti";
import { toast } from "sonner";

/**
 * Challenge Mode - Combined Memory Match and Word Snake experience
 * Players alternate between games, building up their score
 */

export default function ChallengePage() {
  const { data: session, status } = useSession();
  const [currentGame, setCurrentGame] = useState(null); // 'memory' or 'snake'
  const [totalScore, setTotalScore] = useState(0);
  const [gamesCompleted, setGamesCompleted] = useState(0);
  const [memoryRounds, setMemoryRounds] = useState(0);
  const [snakeRounds, setSnakeRounds] = useState(0);
  const [vocabularySource, setVocabularySource] = useState("default");
  const [personalVocabulary, setPersonalVocabulary] = useState([]);
  const [personalClues, setPersonalClues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [currentRoundClues, setCurrentRoundClues] = useState([]);

  // Fetch personal vocabulary for challenge mode
  useEffect(() => {
    if (vocabularySource === "personal" && session?.user) {
      fetchPersonalVocabulary();
    }
  }, [vocabularySource, session]);

  const fetchPersonalVocabulary = async () => {
    setIsLoading(true);
    try {
      // Fetch vocabulary for Memory Match
      const vocabResponse = await fetch("/api/vocabulary/personal");
      if (vocabResponse.ok) {
        const vocabData = await vocabResponse.json();
        setPersonalVocabulary(vocabData.vocabulary || []);
      }

      // Fetch clues for Word Snake
      const cluesResponse = await fetch("/api/vocabulary/word-snake", {
        method: "POST",
      });
      if (cluesResponse.ok) {
        const cluesData = await cluesResponse.json();
        setPersonalClues(cluesData.clues || []);
      }
    } catch (error) {
      console.error("Error fetching personal vocabulary:", error);
      toast.error("Failed to load personal vocabulary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChallenge = (source) => {
    setVocabularySource(source);
    setCurrentGame("memory");
    setTotalScore(0);
    setGamesCompleted(0);
    setMemoryRounds(0);
    setSnakeRounds(0);
    setGameKey((prev) => prev + 1);
  };

  const handleGameComplete = (score) => {
    setTotalScore((prev) => prev + score);
    setGamesCompleted((prev) => prev + 1);

    if (currentGame === "memory") {
      setMemoryRounds((prev) => prev + 1);
      // Switch to Word Snake after Memory Match
      toast.success("Memory Match complete! Time for Word Snake!", {
        description: `You earned ${score} points`,
        duration: 3000,
      });
      setTimeout(() => {
        setCurrentGame("snake");
        setGameKey((prev) => prev + 1);
      }, 2000);
    } else if (currentGame === "snake") {
      setSnakeRounds((prev) => prev + 1);
      // Switch back to Memory Match or end challenge
      if (snakeRounds < 2) {
        toast.success("Word Snake complete! Back to Memory Match!", {
          description: `You earned ${score} points`,
          duration: 3000,
        });
        setTimeout(() => {
          setCurrentGame("memory");
          setGameKey((prev) => prev + 1);
        }, 2000);
      } else {
        // Challenge complete after 3 rounds of each game
        handleChallengeComplete();
      }
    }
  };

  const handleSkipSnakeRound = () => {
    // Allow player to manually complete a Word Snake round
    const currentScore = 50; // Base score for completing a round
    handleGameComplete(currentScore);
  };

  const handleChallengeComplete = () => {
    // Celebration
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50;
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
      });
    }, 250);

    toast.success("Challenge Mode Complete!", {
      description: `Final score: ${totalScore} points`,
      duration: 5000,
    });

    setCurrentGame(null);
  };

  const handleQuitChallenge = () => {
    if (
      confirm(
        "Are you sure you want to quit the challenge? Your progress will be lost."
      )
    ) {
      setCurrentGame(null);
      setTotalScore(0);
      setGamesCompleted(0);
      setMemoryRounds(0);
      setSnakeRounds(0);
    }
  };

  // Show login prompt if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!currentGame ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Header */}
              <div className="mb-12">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Challenge Mode
                </h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
                  Test your skills in both Memory Match and Word Snake!
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete 3 rounds of each game to finish the challenge
                </p>
              </div>

              {/* Game Preview Cards */}
              <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-green-200 dark:border-green-800">
                  <div className="text-6xl mb-4">🎴</div>
                  <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                    Memory Match
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Match vocabulary pairs to test your memory and earn points
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-purple-200 dark:border-purple-800">
                  <div className="text-6xl mb-4">🐍</div>
                  <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                    Word Snake
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Collect letters to spell words and avoid obstacles
                  </p>
                </div>
              </div>

              {/* Start Options */}
              <div className="max-w-md mx-auto space-y-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                  Choose Your Vocabulary
                </h2>

                <button
                  onClick={() => handleStartChallenge("default")}
                  className="w-full px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <div className="text-3xl mb-2">📚</div>
                  Start with All Vocabulary
                </button>

                {session?.user ? (
                  <button
                    onClick={() => handleStartChallenge("personal")}
                    disabled={isLoading}
                    className="w-full px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-3xl mb-2">⭐</div>
                    {isLoading ? "Loading..." : "Start with My Practice List"}
                  </button>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Sign in to use your personal practice list
                    </p>
                    <button
                      onClick={() =>
                        (window.location.href = "/api/auth/signin")
                      }
                      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>

              {/* Rules */}
              <div className="mt-12 max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                  Challenge Rules
                </h3>
                <ul className="text-left text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Complete 3 rounds each of Memory Match and Word Snake
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Games alternate - finish one to unlock the next
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Your total score accumulates across all rounds
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Beat your high score and master the vocabulary!
                  </li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* Score Header */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Challenge Mode
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Round {gamesCompleted + 1} of 6
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Score
                      </div>
                      <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        {totalScore}
                      </div>
                    </div>

                    <div className="h-12 w-px bg-gray-300 dark:bg-gray-700"></div>

                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        🎴 Memory
                      </div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {memoryRounds}/3
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        🐍 Snake
                      </div>
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {snakeRounds}/3
                      </div>
                    </div>

                    <button
                      onClick={handleQuitChallenge}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Quit Challenge
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Game */}
              {currentGame === "memory" && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <MemoryMatch
                    key={gameKey}
                    vocabularySource={vocabularySource}
                    onGameComplete={handleGameComplete}
                  />
                </div>
              )}

              {currentGame === "snake" && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <p className="text-yellow-800 dark:text-yellow-200 text-center mb-3">
                      Complete as many words as you can! Click the button below
                      when you&apos;re ready to move on.
                    </p>
                    <button
                      onClick={handleSkipSnakeRound}
                      className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
                    >
                      Complete This Round & Continue
                    </button>
                  </div>
                  <WordSnakeGame
                    key={gameKey}
                    customClues={
                      vocabularySource === "personal" ? personalClues : null
                    }
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
