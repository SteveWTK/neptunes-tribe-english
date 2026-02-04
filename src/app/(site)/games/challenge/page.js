"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { MemoryMatchLesson } from "@inspire/shared";
import WordSnakeGame from "@/components/WordSnakeGame";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useLanguage } from "@/lib/contexts/LanguageContext";

/**
 * Challenge Mode - Combined Memory Match and Word Snake experience
 * Players alternate between games, building up their score
 */

export default function ChallengePage() {
  const { data: session, status } = useSession();
  const { lang } = useLanguage();
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

  const t = {
    en: {
      failedToLoadVocabulary: "Failed to load personal vocabulary",
      memoryMatchComplete: "Memory Match complete! Time for Word Snake!",
      youEarnedPoints: (score) => `You earned ${score} points`,
      wordSnakeComplete: "Word Snake complete! Back to Memory Match!",
      challengeModeComplete: "Challenge Mode Complete!",
      finalScore: (totalScore) => `Final score: ${totalScore} points`,
      confirmQuit: "Are you sure you want to quit the challenge? Your progress will be lost.",
      loading: "Loading...",
      challengeMode: "Challenge Mode",
      testYourSkills: "Test your skills in both Memory Match and Word Snake!",
      complete3Rounds: "Complete 3 rounds of each game to finish the challenge",
      memoryMatch: "Memory Match",
      matchVocabularyPairs: "Match vocabulary pairs to test your memory and earn points",
      wordSnake: "Word Snake",
      collectLetters: "Collect letters to spell words and avoid obstacles",
      chooseYourVocabulary: "Choose Your Vocabulary",
      startWithAllVocabulary: "Start with All Vocabulary",
      startWithMyPracticeList: "Start with My Practice List",
      signInToUse: "Sign in to use your personal practice list",
      signIn: "Sign In",
      challengeRules: "Challenge Rules",
      rule1: "Complete 3 rounds each of Memory Match and Word Snake",
      rule2: "Games alternate - finish one to unlock the next",
      rule3: "Your total score accumulates across all rounds",
      rule4: "Beat your high score and master the vocabulary!",
      roundOf6: (n) => `Round ${n} of 6`,
      totalScore: "Total Score",
      memory: "Memory",
      snake: "Snake",
      quitChallenge: "Quit Challenge",
      completeAsManyWords: "Complete as many words as you can! Click the button below when you\u2019re ready to move on.",
      completeThisRound: "Complete This Round & Continue",
    },
    pt: {
      failedToLoadVocabulary: "Falha ao carregar vocabul\u00e1rio pessoal",
      memoryMatchComplete: "Memory Match conclu\u00eddo! Hora do Word Snake!",
      youEarnedPoints: (score) => `Voc\u00ea ganhou ${score} pontos`,
      wordSnakeComplete: "Word Snake conclu\u00eddo! Volte para o Memory Match!",
      challengeModeComplete: "Modo Desafio Conclu\u00eddo!",
      finalScore: (totalScore) => `Pontua\u00e7\u00e3o final: ${totalScore} pontos`,
      confirmQuit: "Tem certeza que deseja sair do desafio? Seu progresso ser\u00e1 perdido.",
      loading: "Carregando...",
      challengeMode: "Modo Desafio",
      testYourSkills: "Teste suas habilidades em Memory Match e Word Snake!",
      complete3Rounds: "Complete 3 rodadas de cada jogo para terminar o desafio",
      memoryMatch: "Memory Match",
      matchVocabularyPairs: "Combine pares de vocabul\u00e1rio para testar sua mem\u00f3ria e ganhar pontos",
      wordSnake: "Word Snake",
      collectLetters: "Colete letras para soletrar palavras e evite obst\u00e1culos",
      chooseYourVocabulary: "Escolha Seu Vocabul\u00e1rio",
      startWithAllVocabulary: "Comece com Todo o Vocabul\u00e1rio",
      startWithMyPracticeList: "Comece com Minha Lista de Pr\u00e1tica",
      signInToUse: "Fa\u00e7a login para usar sua lista de pr\u00e1tica pessoal",
      signIn: "Entrar",
      challengeRules: "Regras do Desafio",
      rule1: "Complete 3 rodadas de Memory Match e Word Snake",
      rule2: "Jogos se alternam - termine um para desbloquear o pr\u00f3ximo",
      rule3: "Sua pontua\u00e7\u00e3o total acumula em todas as rodadas",
      rule4: "Supere seu recorde e domine o vocabul\u00e1rio!",
      roundOf6: (n) => `Rodada ${n} de 6`,
      totalScore: "Pontua\u00e7\u00e3o Total",
      memory: "Memory",
      snake: "Snake",
      quitChallenge: "Sair do Desafio",
      completeAsManyWords: "Complete o m\u00e1ximo de palavras poss\u00edvel! Clique no bot\u00e3o abaixo quando estiver pronto para continuar.",
      completeThisRound: "Completar Esta Rodada e Continuar",
    },
    th: {
      failedToLoadVocabulary: "\u0e42\u0e2b\u0e25\u0e14\u0e04\u0e33\u0e28\u0e31\u0e1e\u0e17\u0e4c\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27\u0e25\u0e49\u0e21\u0e40\u0e2b\u0e25\u0e27",
      memoryMatchComplete: "Memory Match \u0e40\u0e2a\u0e23\u0e47\u0e08\u0e2a\u0e21\u0e1a\u0e39\u0e23\u0e13\u0e4c! \u0e16\u0e36\u0e07\u0e40\u0e27\u0e25\u0e32 Word Snake!",
      youEarnedPoints: (score) => `\u0e04\u0e38\u0e13\u0e44\u0e14\u0e49\u0e23\u0e31\u0e1a ${score} \u0e04\u0e30\u0e41\u0e19\u0e19`,
      wordSnakeComplete: "Word Snake \u0e40\u0e2a\u0e23\u0e47\u0e08\u0e2a\u0e21\u0e1a\u0e39\u0e23\u0e13\u0e4c! \u0e01\u0e25\u0e31\u0e1a\u0e44\u0e1b Memory Match!",
      challengeModeComplete: "\u0e42\u0e2b\u0e21\u0e14\u0e17\u0e49\u0e32\u0e17\u0e32\u0e22\u0e40\u0e2a\u0e23\u0e47\u0e08\u0e2a\u0e21\u0e1a\u0e39\u0e23\u0e13\u0e4c!",
      finalScore: (totalScore) => `\u0e04\u0e30\u0e41\u0e19\u0e19\u0e23\u0e27\u0e21: ${totalScore} \u0e04\u0e30\u0e41\u0e19\u0e19`,
      confirmQuit: "\u0e04\u0e38\u0e13\u0e41\u0e19\u0e48\u0e43\u0e08\u0e2b\u0e23\u0e37\u0e2d\u0e27\u0e48\u0e32\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e2d\u0e2d\u0e01\u0e08\u0e32\u0e01\u0e01\u0e32\u0e23\u0e17\u0e49\u0e32\u0e17\u0e32\u0e22? \u0e04\u0e27\u0e32\u0e21\u0e01\u0e49\u0e32\u0e27\u0e2b\u0e19\u0e49\u0e32\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13\u0e08\u0e30\u0e2b\u0e32\u0e22\u0e44\u0e1b",
      loading: "\u0e01\u0e33\u0e25\u0e31\u0e07\u0e42\u0e2b\u0e25\u0e14...",
      challengeMode: "\u0e42\u0e2b\u0e21\u0e14\u0e17\u0e49\u0e32\u0e17\u0e32\u0e22",
      testYourSkills: "\u0e17\u0e14\u0e2a\u0e2d\u0e1a\u0e17\u0e31\u0e01\u0e29\u0e30\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13\u0e43\u0e19 Memory Match \u0e41\u0e25\u0e30 Word Snake!",
      complete3Rounds: "\u0e08\u0e1a 3 \u0e23\u0e2d\u0e1a\u0e02\u0e2d\u0e07\u0e41\u0e15\u0e48\u0e25\u0e30\u0e40\u0e01\u0e21\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e08\u0e1a\u0e01\u0e32\u0e23\u0e17\u0e49\u0e32\u0e17\u0e32\u0e22",
      memoryMatch: "Memory Match",
      matchVocabularyPairs: "\u0e08\u0e31\u0e1a\u0e04\u0e39\u0e48\u0e04\u0e33\u0e28\u0e31\u0e1e\u0e17\u0e4c\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e17\u0e14\u0e2a\u0e2d\u0e1a\u0e04\u0e27\u0e32\u0e21\u0e08\u0e33\u0e41\u0e25\u0e30\u0e23\u0e31\u0e1a\u0e04\u0e30\u0e41\u0e19\u0e19",
      wordSnake: "Word Snake",
      collectLetters: "\u0e2a\u0e30\u0e2a\u0e21\u0e15\u0e31\u0e27\u0e2d\u0e31\u0e01\u0e29\u0e23\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e2a\u0e30\u0e01\u0e14\u0e04\u0e33\u0e41\u0e25\u0e30\u0e2b\u0e25\u0e35\u0e01\u0e40\u0e25\u0e35\u0e48\u0e22\u0e07\u0e2d\u0e38\u0e1b\u0e2a\u0e23\u0e23\u0e04",
      chooseYourVocabulary: "\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e04\u0e33\u0e28\u0e31\u0e1e\u0e17\u0e4c\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13",
      startWithAllVocabulary: "\u0e40\u0e23\u0e34\u0e48\u0e21\u0e14\u0e49\u0e27\u0e22\u0e04\u0e33\u0e28\u0e31\u0e1e\u0e17\u0e4c\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14",
      startWithMyPracticeList: "\u0e40\u0e23\u0e34\u0e48\u0e21\u0e14\u0e49\u0e27\u0e22\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e1d\u0e36\u0e01\u0e02\u0e2d\u0e07\u0e09\u0e31\u0e19",
      signInToUse: "\u0e40\u0e02\u0e49\u0e32\u0e2a\u0e39\u0e48\u0e23\u0e30\u0e1a\u0e1a\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e43\u0e0a\u0e49\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e1d\u0e36\u0e01\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13",
      signIn: "\u0e40\u0e02\u0e49\u0e32\u0e2a\u0e39\u0e48\u0e23\u0e30\u0e1a\u0e1a",
      challengeRules: "\u0e01\u0e0e\u0e01\u0e32\u0e23\u0e17\u0e49\u0e32\u0e17\u0e32\u0e22",
      rule1: "\u0e08\u0e1a 3 \u0e23\u0e2d\u0e1a\u0e02\u0e2d\u0e07 Memory Match \u0e41\u0e25\u0e30 Word Snake",
      rule2: "\u0e40\u0e01\u0e21\u0e2a\u0e25\u0e31\u0e1a\u0e01\u0e31\u0e19 - \u0e08\u0e1a\u0e40\u0e01\u0e21\u0e2b\u0e19\u0e36\u0e48\u0e07\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e1b\u0e25\u0e14\u0e25\u0e47\u0e2d\u0e01\u0e40\u0e01\u0e21\u0e16\u0e31\u0e14\u0e44\u0e1b",
      rule3: "\u0e04\u0e30\u0e41\u0e19\u0e19\u0e23\u0e27\u0e21\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13\u0e2a\u0e30\u0e2a\u0e21\u0e08\u0e32\u0e01\u0e17\u0e38\u0e01\u0e23\u0e2d\u0e1a",
      rule4: "\u0e17\u0e33\u0e25\u0e32\u0e22\u0e2a\u0e16\u0e34\u0e15\u0e34\u0e2a\u0e39\u0e07\u0e2a\u0e38\u0e14\u0e41\u0e25\u0e30\u0e40\u0e0a\u0e35\u0e48\u0e22\u0e27\u0e0a\u0e32\u0e0d\u0e04\u0e33\u0e28\u0e31\u0e1e\u0e17\u0e4c!",
      roundOf6: (n) => `\u0e23\u0e2d\u0e1a ${n} \u0e08\u0e32\u0e01 6`,
      totalScore: "\u0e04\u0e30\u0e41\u0e19\u0e19\u0e23\u0e27\u0e21",
      memory: "Memory",
      snake: "Snake",
      quitChallenge: "\u0e2d\u0e2d\u0e01\u0e08\u0e32\u0e01\u0e01\u0e32\u0e23\u0e17\u0e49\u0e32\u0e17\u0e32\u0e22",
      completeAsManyWords: "\u0e17\u0e33\u0e04\u0e33\u0e43\u0e2b\u0e49\u0e44\u0e14\u0e49\u0e21\u0e32\u0e01\u0e17\u0e35\u0e48\u0e2a\u0e38\u0e14! \u0e04\u0e25\u0e34\u0e01\u0e1b\u0e38\u0e48\u0e21\u0e14\u0e49\u0e32\u0e19\u0e25\u0e48\u0e32\u0e07\u0e40\u0e21\u0e37\u0e48\u0e2d\u0e04\u0e38\u0e13\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e08\u0e30\u0e44\u0e1b\u0e15\u0e48\u0e2d",
      completeThisRound: "\u0e08\u0e1a\u0e23\u0e2d\u0e1a\u0e19\u0e35\u0e49\u0e41\u0e25\u0e30\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e15\u0e48\u0e2d",
    },
  };

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
      toast.error(t[lang].failedToLoadVocabulary);
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
      toast.success(t[lang].memoryMatchComplete, {
        description: t[lang].youEarnedPoints(score),
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
        toast.success(t[lang].wordSnakeComplete, {
          description: t[lang].youEarnedPoints(score),
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

    toast.success(t[lang].challengeModeComplete, {
      description: t[lang].finalScore(totalScore),
      duration: 5000,
    });

    setCurrentGame(null);
  };

  const handleQuitChallenge = () => {
    if (
      confirm(t[lang].confirmQuit)
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
          <p className="text-gray-600 dark:text-gray-400">{t[lang].loading}</p>
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
                  {t[lang].challengeMode}
                </h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
                  {t[lang].testYourSkills}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {t[lang].complete3Rounds}
                </p>
              </div>

              {/* Game Preview Cards */}
              <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-green-200 dark:border-green-800">
                  <div className="text-6xl mb-4">🎴</div>
                  <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                    {t[lang].memoryMatch}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t[lang].matchVocabularyPairs}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-purple-200 dark:border-purple-800">
                  <div className="text-6xl mb-4">🐍</div>
                  <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                    {t[lang].wordSnake}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t[lang].collectLetters}
                  </p>
                </div>
              </div>

              {/* Start Options */}
              <div className="max-w-md mx-auto space-y-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                  {t[lang].chooseYourVocabulary}
                </h2>

                <button
                  onClick={() => handleStartChallenge("default")}
                  className="w-full px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <div className="text-3xl mb-2">📚</div>
                  {t[lang].startWithAllVocabulary}
                </button>

                {session?.user ? (
                  <button
                    onClick={() => handleStartChallenge("personal")}
                    disabled={isLoading}
                    className="w-full px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-3xl mb-2">⭐</div>
                    {isLoading ? t[lang].loading : t[lang].startWithMyPracticeList}
                  </button>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {t[lang].signInToUse}
                    </p>
                    <button
                      onClick={() =>
                        (window.location.href = "/api/auth/signin")
                      }
                      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      {t[lang].signIn}
                    </button>
                  </div>
                )}
              </div>

              {/* Rules */}
              <div className="mt-12 max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                  {t[lang].challengeRules}
                </h3>
                <ul className="text-left text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {t[lang].rule1}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {t[lang].rule2}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {t[lang].rule3}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {t[lang].rule4}
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
                      {t[lang].challengeMode}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t[lang].roundOf6(gamesCompleted + 1)}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t[lang].totalScore}
                      </div>
                      <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        {totalScore}
                      </div>
                    </div>

                    <div className="h-12 w-px bg-gray-300 dark:bg-gray-700"></div>

                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        🎴 {t[lang].memory}
                      </div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {memoryRounds}/3
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        🐍 {t[lang].snake}
                      </div>
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {snakeRounds}/3
                      </div>
                    </div>

                    <button
                      onClick={handleQuitChallenge}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      {t[lang].quitChallenge}
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Game */}
              {currentGame === "memory" && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <MemoryMatchLesson
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
                      {t[lang].completeAsManyWords}
                    </p>
                    <button
                      onClick={handleSkipSnakeRound}
                      className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
                    >
                      {t[lang].completeThisRound}
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
