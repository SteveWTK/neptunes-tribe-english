"use client";
import { useState, useEffect } from "react";
import {
  Trophy,
  RefreshCw,
  Check,
  X,
  Target,
  Loader2,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { toast } from "sonner";
import confetti from "canvas-confetti";

function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Confetti celebration function
function celebrateWithConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

export default function MemoryMatchGame() {
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vocabularySource, setVocabularySource] = useState("all"); // 'all' or 'personal'
  const [gridSize, setGridSize] = useState("3x4");
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Fetch vocabulary based on selected source
  useEffect(() => {
    async function fetchVocabulary() {
      try {
        setLoading(true);
        setGameStarted(false);

        const endpoint =
          vocabularySource === "personal"
            ? "/api/vocabulary/personal"
            : "/api/vocabulary/memory-match";

        const response = await fetch(endpoint);

        if (!response.ok) {
          if (response.status === 401 && vocabularySource === "personal") {
            setError("Please log in to use your personal vocabulary");
            setVocabulary([]);
            setLoading(false);
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
        // Fallback vocabulary if API fails (only for 'all' mode)
        if (vocabularySource === "all") {
          setVocabulary([
            { id: 1, en: "river", pt: "rio" },
            { id: 2, en: "beach", pt: "praia" },
            { id: 3, en: "crab", pt: "caranguejo" },
            { id: 4, en: "dolphin", pt: "golfinho" },
            { id: 5, en: "eagle", pt: "águia" },
            { id: 6, en: "anteater", pt: "tamanduá" },
            { id: 7, en: "jaguar", pt: "onça" },
            { id: 8, en: "forest", pt: "floresta" },
          ]);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchVocabulary();
  }, [vocabularySource]);

  const initializeGame = () => {
    if (!vocabulary || vocabulary.length === 0) return;

    const size = gridSize === "3x4" ? 6 : 8;
    const shuffledVocab = shuffle([...vocabulary]);
    const selectedWords = shuffledVocab.slice(0, size);

    const pairs = selectedWords.flatMap((word) => [
      {
        id: word.id || word.en,
        text: word.en,
        image: word.enImage,
        lang: "en",
        matched: false,
        isImage: !!word.enImage,
      },
      {
        id: word.id || word.en,
        text: word.pt,
        image: word.ptImage,
        lang: "pt",
        matched: false,
        isImage: !!word.ptImage,
      },
    ]);

    setCards(shuffle(pairs));
    setFlipped([]);
    setMatched([]);
    setMatchedIndices([]);
    setMatchedPairs([]);
    setAttempts(0);
    setCorrectMatches(0);
    setIsComplete(false);
    setShowSuccess(false);
    setShowError(false);
    setGameStarted(true);
  };

  useEffect(() => {
    if (vocabulary && vocabulary.length > 0 && !gameStarted) {
      initializeGame();
    }
  }, [vocabulary, gridSize]);

  const handleFlip = (index) => {
    const cardIsMatched = matched.some(
      (matchedId) => cards[index].id === matchedId
    );

    if (flipped.length === 2 || flipped.includes(index) || cardIsMatched) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setAttempts((prev) => prev + 1);

      const [first, second] = newFlipped.map((i) => cards[i]);

      if (first.id === second.id && first.lang !== second.lang) {
        setMatched((m) => [...m, first.id]);
        setMatchedIndices((m) => [...m, ...newFlipped]);
        setCorrectMatches((prev) => prev + 1);
        setShowSuccess(true);

        const englishCard = first.lang === "en" ? first : second;
        const portugueseCard = first.lang === "pt" ? first : second;
        setMatchedPairs((prev) => [
          ...prev,
          { id: first.id, en: englishCard.text, pt: portugueseCard.text },
        ]);

        setTimeout(() => {
          setFlipped([]);
          setShowSuccess(false);
        }, 800);

        if (matched.length + 1 === cards.length / 2) {
          setTimeout(() => {
            setIsComplete(true);
            celebrateWithConfetti(); // 🎉 Trigger confetti!
            toast.success("Fantastic! All pairs matched!", {
              description: `You completed the game in ${attempts + 1} attempts`,
              duration: 5000,
            });
          }, 1000);
        }
      } else {
        setShowError(true);
        setTimeout(() => {
          setFlipped([]);
          setShowError(false);
        }, 1200);
      }
    }
  };

  const handleRestart = () => {
    initializeGame();
  };

  const handleGridSizeChange = (size) => {
    setGridSize(size);
    setGameStarted(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading vocabulary...
        </p>
      </div>
    );
  }

  if (!vocabulary || vocabulary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
        {/* Vocabulary Source Selector - also shown in empty state */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Practice with:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setVocabularySource("all")}
              className={`px-4 py-2 rounded-2xl font-medium text-sm transition-colors ${
                vocabularySource === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              All Vocabulary
            </button>
            <button
              onClick={() => setVocabularySource("personal")}
              className={`px-4 py-2 rounded-2xl font-medium text-sm transition-colors ${
                vocabularySource === "personal"
                  ? "bg-accent-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              My Practice List
            </button>
          </div>
        </div>

        <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl max-w-md">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {vocabularySource === "personal"
              ? "Your practice list is empty."
              : "No vocabulary available yet."}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            {vocabularySource === "personal"
              ? "Save words from lesson activities to build your personal practice list!"
              : "Complete some lessons to build your vocabulary bank!"}
          </p>
          {vocabularySource === "personal" && (
            <Link
              href="/worlds"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Go to Lessons
            </Link>
          )}
        </div>
      </div>
    );
  }

  const gridCols =
    gridSize === "3x4" ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-4";
  const cardSize =
    gridSize === "3x4"
      ? "h-22 w-26 sm:h-22 sm:w-26"
      : "h-16 w-16 sm:h-20 sm:w-24";

  return (
    <div className="flex flex-col items-center gap-6 p-4 min-h-screen">
      {/* Challenge Mode Banner */}
      {/* <div className="w-full max-w-4xl mt-4">
        <Link href="/games/challenge">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl p-4 shadow-lg cursor-pointer transition-all transform hover:scale-[1.02]">
            <div className="flex items-center justify-center gap-3">
              <Zap className="w-6 h-6" />
              <span className="font-bold text-lg">Try Challenge Mode!</span>
              <span className="text-sm opacity-90">Combine Memory Match & Word Snake</span>
            </div>
          </div>
        </Link>
      </div> */}

      <div className="text-center px-4 mt-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-900 dark:text-white mb-2">
          Memory Match Challenge
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Match English words with their Portuguese translations
        </p>
      </div>

      {/* Vocabulary Source Selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Practice with:
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setVocabularySource("all")}
            className={`px-4 py-2 rounded-2xl font-medium text-sm transition-colors ${
              vocabularySource === "all"
                ? "bg-primary-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            All Vocabulary
          </button>
          <button
            onClick={() => setVocabularySource("personal")}
            className={`px-4 py-2 rounded-2xl font-medium text-sm transition-colors ${
              vocabularySource === "personal"
                ? "bg-accent-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            My Practice List
          </button>
        </div>
      </div>

      {!gameStarted && vocabulary.length > 0 && (
        <div className="flex gap-2 sm:gap-4 mb-4">
          <button
            onClick={() => handleGridSizeChange("3x4")}
            className={`px-3 sm:px-4 py-2 rounded-2xl font-medium text-sm sm:text-base transition-colors ${
              gridSize === "3x4"
                ? "bg-gradient-to-br from-primary-500 to-accent-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            3x4 (12 cards)
          </button>
          <button
            onClick={() => handleGridSizeChange("4x4")}
            className={`px-3 sm:px-4 py-2 rounded-2xl font-medium text-sm sm:text-base transition-colors ${
              gridSize === "4x4"
                ? "bg-gradient-to-br from-primary-500 to-accent-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            4x4 (16 cards)
          </button>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
          <div className="bg-accent-500 bg-opacity-50 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <Check className="w-6 h-6" />
            <span className="font-bold">Perfect Match!</span>
          </div>
        </div>
      )}

      {showError && (
        <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-pulse">
          <div className="bg-[#dc2626] bg-opacity-50 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <X className="w-6 h-6" />
            <span className="font-bold">Try Again!</span>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-center gap-10 w-full max-w-7xl">
        {/* Game Grid */}
        <div className={`grid ${gridCols} gap-2 sm:gap-3 px-2 sm:px-0 pt-4`}>
          {cards.map((card, i) => {
            const isFlipped = flipped.includes(i) || matchedIndices.includes(i);
            const isMatched = matchedIndices.includes(i);

            return (
              <button
                key={i}
                onClick={() => handleFlip(i)}
                disabled={isFlipped}
                className={`${cardSize} relative rounded-xl shadow-md font-medium text-sm transition-all duration-500 transform-gpu ${
                  isMatched
                    ? "scale-95 opacity-90"
                    : isFlipped
                    ? "preserve-3d rotate-y-180"
                    : "preserve-3d hover:scale-105"
                }`}
                style={{
                  transformStyle: isMatched ? "flat" : "preserve-3d",
                  transform: isMatched
                    ? "none"
                    : isFlipped
                    ? "rotateY(180deg)"
                    : "rotateY(0deg)",
                }}
              >
                {isMatched ? (
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded-xl p-1 ${"bg-gradient-to-br from-accent-600 to-accent-800 text-white"}`}
                  >
                    {card.isImage && card.image ? (
                      <img
                        src={card.image}
                        alt={card.text || "Memory card"}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-center font-semibold text-xs sm:text-sm">
                        {card.text}
                      </span>
                    )}
                    <Check className="absolute top-1 right-1 w-4 h-4" />
                  </div>
                ) : (
                  <>
                    {/* Front face */}
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-xl backface-hidden bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-500 dark:to-primary-700 text-white"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <Target className="w-6 h-6 sm:w-8 sm:h-8 text-[#dc2626]" />
                    </div>
                    {/* Back face */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center rounded-xl p-1 rotate-y-180 backface-hidden ${
                        card.lang === "en"
                          ? "bg-primary-800 text-primary-100"
                          : "bg-emerald-800 text-primary-100"
                      }`}
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      {card.isImage && card.image ? (
                        <img
                          src={card.image}
                          alt={card.text || "Memory card"}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-center font-semibold text-xs sm:text-sm">
                          {card.text}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Matched Pairs Display */}
        {matchedPairs.length > 0 && (
          <div className="flex-shrink-0 w-full lg:w-auto">
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto lg:mx-0">
              {/* English column */}
              <div className="space-y-2">
                <div className="text-xs text-center text-gray-500 dark:text-gray-400 font-semibold mb-1">
                  English
                </div>
                {matchedPairs.map((pair, idx) => (
                  <div
                    key={`en-${idx}`}
                    className="bg-fieldtalk-400 text-primary-900 dark:text-primary-50 px-3 py-2 rounded-lg text-center text-xs sm:text-sm font-semibold animate-slideIn shadow-md"
                    style={{
                      animationDelay: `${idx * 0.1}s`,
                    }}
                  >
                    {pair.en}
                  </div>
                ))}
              </div>
              {/* Portuguese column */}
              <div className="space-y-2">
                <div className="text-xs text-center text-gray-500 dark:text-gray-400 font-semibold mb-1">
                  Português
                </div>
                {matchedPairs.map((pair, idx) => (
                  <div
                    key={`pt-${idx}`}
                    className="bg-attention-400 text-primary-900 dark:text-primary-50 px-3 py-2 rounded-lg text-center text-xs sm:text-sm font-semibold animate-slideIn shadow-md"
                    style={{
                      animationDelay: `${idx * 0.1}s`,
                    }}
                  >
                    {pair.pt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {isComplete ? (
        <div className="text-center space-y-4 animate-fadeIn">
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-8 rounded-xl shadow-xl">
            <Trophy className="w-20 h-20 mx-auto mb-4 animate-bounce" />
            <h3 className="text-3xl font-bold mb-2">Congratulations!</h3>
            <p className="text-xl mb-4">
              You matched all pairs in {attempts} attempts!
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-6 py-3 bg-white text-accent-600 rounded-lg font-bold hover:bg-orange-50 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Play Again
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-4 sm:gap-8 text-center">
            <div className="bg-gray-50 dark:bg-accent-900/20 px-3 sm:px-4 py-2 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Attempts
              </p>
              <p className="text-xl sm:text-2xl font-bold text-accent-600 dark:text-accent-400">
                {attempts}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-accent-900/20 px-3 sm:px-4 py-2 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Matches
              </p>
              <p className="text-xl sm:text-2xl font-bold text-accent-600 dark:text-accent-400">
                {correctMatches}/{cards.length / 2}
              </p>
            </div>
          </div>

          {gameStarted && (
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-2 bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-300 rounded-2xl hover:bg-primary-300 dark:hover:bg-primary-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              New Game
            </button>
          )}
        </>
      )}
    </div>
  );
}

// "use client";
// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";

// // Mock data for now (later, fetch from Supabase)
// const mockWords = [
//   { id: "1", en: "whale", pt: "baleia" },
//   { id: "2", en: "rainforest", pt: "floresta tropical" },
//   { id: "3", en: "frog", pt: "rã" },
//   { id: "4", en: "ocean", pt: "oceano" },
//   { id: "5", en: "bee", pt: "abelha" },
//   { id: "6", en: "desert", pt: "deserto" },
// ];

// // Shuffle helper
// function shuffle(array) {
//   return array.sort(() => Math.random() - 0.5);
// }

// export default function MemoryMatch() {
//   const [cards, setCards] = useState([]);
//   const [flipped, setFlipped] = useState([]);
//   const [matched, setMatched] = useState([]);
//   const [won, setWon] = useState(false);

//   useEffect(() => {
//     const pairs = mockWords.flatMap((w) => [
//       { id: w.id, text: w.en, lang: "en" },
//       { id: w.id, text: w.pt, lang: "pt" },
//     ]);
//     setCards(shuffle(pairs));
//   }, []);

//   useEffect(() => {
//     if (matched.length === mockWords.length) {
//       setWon(true);
//     }
//   }, [matched]);

//   const handleFlip = (index) => {
//     if (flipped.length === 2 || flipped.includes(index)) return;
//     const newFlipped = [...flipped, index];
//     setFlipped(newFlipped);

//     if (newFlipped.length === 2) {
//       const [first, second] = newFlipped.map((i) => cards[i]);
//       if (first.id === second.id && first.lang !== second.lang) {
//         setMatched((m) => [...m, first.id]);
//       }
//       setTimeout(() => setFlipped([]), 1000);
//     }
//   };

//   const handleRestart = () => {
//     const pairs = mockWords.flatMap((w) => [
//       { id: w.id, text: w.en, lang: "en" },
//       { id: w.id, text: w.pt, lang: "pt" },
//     ]);
//     setCards(shuffle(pairs));
//     setMatched([]);
//     setFlipped([]);
//     setWon(false);
//   };

//   return (
//     <div className="flex flex-col items-center gap-6 p-6">
//       <h2 className="text-3xl font-bold text-green-700 dark:text-green-300">
//         🌿 Eco Memory Match
//       </h2>

//       {won ? (
//         <div className="flex flex-col items-center gap-4">
//           <p className="text-xl font-semibold text-green-600 dark:text-green-300">
//             🎉 You matched them all!
//           </p>
//           <button
//             onClick={handleRestart}
//             className="px-6 py-3 rounded-xl bg-green-600 text-white font-medium shadow-md hover:bg-green-700 transition"
//           >
//             Play Again
//           </button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//           {cards.map((card, i) => {
//             const isFlipped = flipped.includes(i) || matched.includes(card.id);
//             return (
//               <motion.button
//                 key={i}
//                 onClick={() => handleFlip(i)}
//                 className="w-28 h-20 rounded-2xl shadow-lg font-medium text-lg"
//                 initial={false}
//                 animate={{ rotateY: isFlipped ? 180 : 0 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 <div
//                   className={`w-full h-full flex items-center justify-center rounded-2xl backface-hidden ${
//                     isFlipped
//                       ? "bg-green-200 text-gray-800"
//                       : "bg-gray-700 text-white"
//                   }`}
//                 >
//                   {isFlipped ? card.text : "❓"}
//                 </div>
//               </motion.button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
