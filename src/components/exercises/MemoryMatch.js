"use client";
import { useState, useEffect } from "react";
import { Trophy, RefreshCw, Check, X, Target, BookmarkPlus, BookmarkCheck } from "lucide-react";
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

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
}

export default function MemoryMatch({
  vocabulary,
  onComplete,
  lessonId,
  vocabularySource = null,
  onGameComplete = null,
}) {
  // Create a unique storage key for this lesson's memory match game
  const storageKey = `memoryMatch_${lessonId || "default"}`;

  // Load saved state from localStorage
  const loadSavedState = () => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load saved game state:", e);
        return null;
      }
    }
    return null;
  };

  const savedState = loadSavedState();

  const [gridSize, setGridSize] = useState(savedState?.gridSize || "3x4");
  const [cards, setCards] = useState(savedState?.cards || []);
  const [flipped, setFlipped] = useState(savedState?.flipped || []);
  const [matched, setMatched] = useState(savedState?.matched || []);
  const [matchedIndices, setMatchedIndices] = useState(
    savedState?.matchedIndices || []
  );
  const [matchedPairs, setMatchedPairs] = useState(
    savedState?.matchedPairs || []
  );
  const [attempts, setAttempts] = useState(savedState?.attempts || 0);
  const [correctMatches, setCorrectMatches] = useState(
    savedState?.correctMatches || 0
  );
  const [isComplete, setIsComplete] = useState(savedState?.isComplete || false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [gameStarted, setGameStarted] = useState(
    savedState?.gameStarted || false
  );
  const [savedWords, setSavedWords] = useState(new Set());
  const [savingWord, setSavingWord] = useState(null);
  const [fetchedVocabulary, setFetchedVocabulary] = useState([]);
  const [isLoadingVocabulary, setIsLoadingVocabulary] = useState(false);

  // Fetch vocabulary if vocabularySource is provided
  useEffect(() => {
    if (vocabularySource && !vocabulary?.length) {
      fetchVocabularyBySource();
    }
  }, [vocabularySource]);

  const fetchVocabularyBySource = async () => {
    setIsLoadingVocabulary(true);
    try {
      if (vocabularySource === "personal") {
        const response = await fetch("/api/vocabulary/personal");
        if (response.ok) {
          const data = await response.json();
          const formattedVocab = (data.vocabulary || []).map((word) => ({
            id: word.id,
            en: word.english,
            pt: word.portuguese,
            enImage: word.english_image,
            ptImage: word.portuguese_image,
          }));
          setFetchedVocabulary(formattedVocab);
        }
      } else if (vocabularySource === "default") {
        const response = await fetch("/api/vocabulary/memory-match");
        if (response.ok) {
          const data = await response.json();
          setFetchedVocabulary(data.vocabulary || []);
        }
      }
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      toast.error("Failed to load vocabulary");
    } finally {
      setIsLoadingVocabulary(false);
    }
  };

  // Use fetched vocabulary if available, otherwise use prop vocabulary
  const activeVocabulary = fetchedVocabulary.length > 0 ? fetchedVocabulary : vocabulary;

  const initializeGame = () => {
    const vocabToUse = activeVocabulary;
    if (!vocabToUse || vocabToUse.length === 0) return;

    const size = gridSize === "3x4" ? 6 : 8;
    const shuffledVocab = shuffle([...vocabToUse]);
    const selectedWords = shuffledVocab.slice(0, size);

    const pairs = selectedWords.flatMap((word) => [
      {
        id: word.id || word.english || word.en,
        text: word.english || word.en,
        image: word.enImage || word.image, // Support image for English side
        lang: "en",
        matched: false,
        isImage: !!(
          word.enImage ||
          (word.image && !word.pt && !word.portuguese && !word.translation)
        ),
      },
      {
        id: word.id || word.english || word.en,
        text: word.translation || word.portuguese || word.pt,
        image: word.ptImage, // Support image for Portuguese side
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
    // Clear saved state when starting new game
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
  };

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (gameStarted && typeof window !== "undefined") {
      const stateToSave = {
        gridSize,
        cards,
        flipped,
        matched,
        matchedIndices,
        matchedPairs,
        attempts,
        correctMatches,
        isComplete,
        gameStarted,
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }
  }, [
    cards,
    flipped,
    matched,
    matchedIndices,
    matchedPairs,
    attempts,
    correctMatches,
    isComplete,
    gameStarted,
    gridSize,
    storageKey,
  ]);

  useEffect(() => {
    if (activeVocabulary && activeVocabulary.length > 0 && !gameStarted && !savedState) {
      initializeGame();
    }
  }, [activeVocabulary, gridSize, fetchedVocabulary]);

  const handleFlip = (index) => {
    // Check if card is already matched by comparing the specific card's ID
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

        // Add to matched pairs for display
        const englishCard = first.lang === "en" ? first : second;
        const portugueseCard = first.lang === "pt" ? first : second;
        setMatchedPairs((prev) => [
          ...prev,
          {
            id: first.id,
            en: englishCard.text,
            pt: portugueseCard.text,
            enImage: englishCard.image,
            ptImage: portugueseCard.image,
          },
        ]);

        setTimeout(() => {
          // Only clear the flipped array, matched cards stay visible
          setFlipped([]);
          setShowSuccess(false);
        }, 800);

        if (matched.length + 1 === cards.length / 2) {
          setTimeout(() => {
            setIsComplete(true);
            celebrateWithConfetti(); // 🎉 Trigger confetti!
            toast.success("Congratulations! All pairs matched!", {
              description: `Completed in ${attempts + 1} attempts`,
              duration: 5000,
            });
            const score = Math.max(50, 100 - attempts * 2);
            if (onComplete) {
              onComplete(score);
            }
            if (onGameComplete) {
              onGameComplete(score);
            }
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
    // Clear saved state when restarting
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
    initializeGame();
  };

  const handleGridSizeChange = (size) => {
    setGridSize(size);
    setGameStarted(false);
  };

  const handleSaveToPersonalList = async (pair) => {
    console.log("🔍 Attempting to save word:", pair);
    setSavingWord(pair.id);
    setSaveError(null);

    try {
      const payload = {
        english: pair.en,
        portuguese: pair.pt,
        englishImage: pair.enImage || null,
        portugueseImage: pair.ptImage || null,
        lessonId: lessonId || null,
        stepType: "memory_match",
      };

      console.log("📤 Sending payload:", payload);

      const response = await fetch("/api/vocabulary/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📥 Response status:", response.status);

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (response.status === 401) {
        setSaveError("Please log in to save words");
        toast.error("Please log in to save words to your practice list");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to save word");
      }

      if (data.success) {
        setSavedWords((prev) => new Set([...prev, pair.id]));
        toast.success(`"${pair.en}" saved to your practice list!`, {
          description: "You can practice it later in games",
          duration: 3000,
        });
        console.log("✅ Word saved successfully");
      } else if (data.alreadyExists) {
        setSavedWords((prev) => new Set([...prev, pair.id]));
        toast.info(`"${pair.en}" is already in your practice list`);
      }
    } catch (error) {
      console.error("❌ Error saving word:", error);
      setSaveError(error.message);
      toast.error(`Failed to save word: ${error.message}`);
    } finally {
      setSavingWord(null);
    }
  };

  if (!vocabulary || vocabulary.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 dark:text-gray-400">
          No vocabulary available for this lesson.
        </p>
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
    <div className="flex flex-col items-center gap-6 p-1">
      <div className="text-center px-4">
        <h3 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white mb-2">
          Memory Match Challenge
        </h3>
        {/* <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Combine as palavras em inglês com suas traduções em português
        </p> */}
      </div>

      {!gameStarted && (
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
        <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-pulse transition delay-150 duration-300 ease-in-out">
          <div className="bg-[#dc2626] bg-opacity-50 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <X className="w-6 h-6" />
            <span className="font-bold">Try Again!</span>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-center lg:items-start gap-10 w-full max-w-7xl">
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
                {/* For matched cards, show the vocabulary/image directly without transform */}
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
                    {/* Front face - Target icon */}
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-xl backface-hidden bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-500 dark:to-primary-700 text-white"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <Target className="w-6 h-6 sm:w-8 sm:h-8 text-[#dc2626]" />
                    </div>
                    {/* Back face - Vocabulary or Image */}
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
          <div className="flex-shrink-0 w-full lg:w-80 lg:sticky lg:top-4">
            <div className="text-xs text-center lg:text-left text-gray-500 dark:text-gray-400 font-semibold mb-3">
              Matched Pairs ({matchedPairs.length})
            </div>
            <div className="space-y-2 max-w-md mx-auto lg:mx-0 lg:max-h-[600px] lg:overflow-y-auto lg:pr-2 custom-scrollbar">
              {matchedPairs.map((pair, idx) => (
                <div
                  key={`pair-${idx}`}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md animate-slideIn"
                  style={{
                    animationDelay: `${idx * 0.1}s`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex-1 bg-fieldtalk-400 text-primary-900 dark:text-primary-50 px-2 py-1 rounded text-center text-xs sm:text-sm font-semibold">
                      {pair.en}
                    </div>
                    <div className="text-gray-400">↔</div>
                    <div className="flex-1 bg-attention-400 text-primary-900 dark:text-primary-50 px-2 py-1 rounded text-center text-xs sm:text-sm font-semibold">
                      {pair.pt}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveToPersonalList(pair)}
                    disabled={savedWords.has(pair.id) || savingWord === pair.id}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      savedWords.has(pair.id)
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default"
                        : "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50"
                    }`}
                  >
                    {savedWords.has(pair.id) ? (
                      <>
                        <BookmarkCheck className="w-3 h-3" />
                        <span>Saved to Practice List</span>
                      </>
                    ) : savingWord === pair.id ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3 h-3" />
                        <span>Save for Practice</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
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
                Comece de Novo
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl">
          {/* Game Grid */}
        </div>
      )}

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

      {!isComplete && gameStarted && (
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-4 py-2 bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-300 rounded-2xl hover:bg-primary-300 dark:hover:bg-primary-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Comece de novo
        </button>
      )}
    </div>
  );
}
