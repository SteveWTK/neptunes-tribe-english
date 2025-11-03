"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Word Snake Lesson Component
 * Inline version of Word Snake game for use within lesson flows
 * Accepts custom clues from lesson content instead of using preset clue file
 *
 * @param {Array} clues - Array of word clues {clue, answer, hint, fact}
 * @param {Function} onComplete - Callback when all words completed
 * @param {String} difficulty - "easy" or "hard" mode
 *   - easy: Only correct letters appear, no wrong letters, no erasers
 *   - hard: Includes distractor letters and eraser tiles
 */

const GRID_SIZE = 20;
const TILE = 25;
const CANVAS = GRID_SIZE * TILE;
const BASE_SPEED = 200; // Starting speed (higher = slower)
const SPEED_DECREASE_PER_WORD = 15; // Speed increase per word completed

export default function WordSnakeLesson({
  clues = [],
  onComplete,
  difficulty = "easy", // Default to easy mode
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef(null);

  // Touch tracking for swipe gestures
  const touchStartRef = useRef(null);

  // Game state
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [letters, setLetters] = useState([]); // {x, y, letter, isCorrect, isEraser}
  const [collectedWord, setCollectedWord] = useState("");
  const [score, setScore] = useState(0);
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [muted, setMuted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showFact, setShowFact] = useState(false);

  // Calculate speed based on words completed (gets faster each word)
  const speed = Math.max(
    80,
    BASE_SPEED - currentClueIndex * SPEED_DECREASE_PER_WORD
  );

  // Refs to access current values without triggering re-renders
  const collectedWordRef = useRef("");
  const snakeRef = useRef(snake);

  // Get current clue
  const currentClue = clues[currentClueIndex] || {
    clue: "No clue available",
    answer: "TEST",
    hint: "",
    fact: "",
  };
  const targetWord = currentClue.answer;

  // Calculate next letter needed (without spaces)
  const normalizedTarget = targetWord.replace(/\s+/g, "");
  const normalizedCollected = collectedWord.replace(/\s+/g, "");
  const nextLetter = normalizedTarget[normalizedCollected.length] || "";

  // Word display with spaces (crossword style)
  const displayWord = useMemo(() => {
    let result = "";
    let collectedIndex = 0;

    for (let i = 0; i < targetWord.length; i++) {
      if (targetWord[i] === " ") {
        result += " ";
      } else {
        result += collectedWord[collectedIndex] || "_";
        collectedIndex++;
      }
    }
    return result;
  }, [targetWord, collectedWord]);

  // Check if all clues completed
  const allCompleted = currentClueIndex >= clues.length;

  // Keep refs updated
  useEffect(() => {
    collectedWordRef.current = collectedWord;
  }, [collectedWord]);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  // Timer for hints
  useEffect(() => {
    if (!isStarted || isPaused || gameOver || showLevelUp) return;
    const timer = setInterval(() => {
      setTimeElapsed((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, isPaused, gameOver, showLevelUp]);

  // Show hint after 30 seconds
  useEffect(() => {
    if (timeElapsed >= 30 && !showHint && currentClue.hint) {
      setShowHint(true);
    }
  }, [timeElapsed, showHint, currentClue.hint]);

  // Handle key presses
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isStarted || isPaused || gameOver || showLevelUp) {
        if (e.key === " " && !isStarted) {
          startGame();
        }
        return;
      }

      // Direction controls
      if (e.key === "ArrowUp" && direction.y === 0) {
        setDirection({ x: 0, y: -1 });
      } else if (e.key === "ArrowDown" && direction.y === 0) {
        setDirection({ x: 0, y: 1 });
      } else if (e.key === "ArrowLeft" && direction.x === 0) {
        setDirection({ x: -1, y: 0 });
      } else if (e.key === "ArrowRight" && direction.x === 0) {
        setDirection({ x: 1, y: 0 });
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleBackspace();
      } else if (e.key === "p" || e.key === "P") {
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isStarted, isPaused, gameOver, showLevelUp, direction]);

  const startGame = () => {
    setIsStarted(true);
    setDirection({ x: 1, y: 0 });
    setCountdown(3);
  };

  const togglePause = () => {
    setIsPaused((p) => !p);
  };

  const handleBackspace = () => {
    if (collectedWord.length > 0) {
      const removed = collectedWord[collectedWord.length - 1];
      setCollectedWord((prev) => prev.slice(0, -1));

      // If we removed a space, also remove the letter before it
      if (removed === " " && collectedWord.length > 1) {
        setCollectedWord((prev) => prev.slice(0, -1));
      }
    }
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: 0 });
    setLetters([]);
    setCollectedWord("");
    setGameOver(false);
    setIsStarted(false);
    setIsPaused(false);
    setShowHint(false);
    setTimeElapsed(0);
    setShowFact(false);
  };

  const nextWord = () => {
    const nextIndex = currentClueIndex + 1;

    if (nextIndex >= clues.length) {
      // All words completed - close all modals and set completion state
      setShowLevelUp(false);
      setShowFact(false);
      setIsPaused(false);
      setGameOver(true);
      // Move to next clue index to trigger allCompleted
      setCurrentClueIndex(nextIndex);
      return;
    }

    // Move to next word
    setCurrentClueIndex(nextIndex);
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: 0 });
    setLetters([]);
    setCollectedWord("");
    setShowLevelUp(false);
    setShowHint(false);
    setTimeElapsed(0);
    setShowFact(false);
    setIsStarted(false);
    setIsPaused(false);
  };

  // Snake movement
  useEffect(() => {
    if (!isStarted || isPaused || gameOver || showLevelUp || countdown > 0)
      return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (
          prevSnake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check letter collision
        const collided = letters.find(
          (l) => l.x === newHead.x && l.y === newHead.y
        );

        if (collided) {
          if (collided.isEraser) {
            // Eraser power-up (only in hard mode)
            setLetters((prev) => prev.filter((l) => l !== collided));
            handleBackspace();
            playSound("powerup");
            return [newHead, ...prevSnake];
          } else if (collided.isCorrect) {
            // Check if this is the NEXT expected letter in sequence
            const normalizedTarget = targetWord.replace(/\s+/g, "");
            const normalizedCollected = collectedWord.replace(/\s+/g, "");
            const expectedNextLetter = normalizedTarget[normalizedCollected.length];

            // In EASY mode, only accept if it's the exact next letter needed
            if (difficulty === "easy" && collided.letter !== expectedNextLetter) {
              // Wrong order! Play error sound, don't pick up
              playSound("wrong");
              return [newHead, ...prevSnake.slice(0, -1)]; // Don't grow
            }

            // Correct letter in correct order - remove it and add to word
            setLetters((prev) => prev.filter((l) => l !== collided));

            let newWord = collectedWord + collided.letter;

            // Auto-add space for multi-word answers
            const normalizedNewCollected = newWord.replace(/\s+/g, "");

            if (targetWord.includes(" ")) {
              const targetSpacePositions = [];
              for (let i = 0; i < targetWord.length; i++) {
                if (targetWord[i] === " ") {
                  targetSpacePositions.push(i);
                }
              }

              targetSpacePositions.forEach((pos) => {
                const normalizedPos =
                  pos -
                  (targetWord.substring(0, pos).match(/\s/g) || []).length;
                if (
                  normalizedNewCollected.length === normalizedPos &&
                  !newWord.includes(" ")
                ) {
                  newWord += " ";
                }
              });
            }

            setCollectedWord(newWord);
            setScore((s) => s + 10);
            playSound("collect");
            return [newHead, ...prevSnake];
          } else {
            // Wrong letter (only in hard mode)
            if (difficulty === "easy") {
              // EASY MODE: Play wrong sound but DON'T pick up the letter or grow snake
              playSound("wrong");
              // Letter stays on board, snake doesn't grow
              return [newHead, ...prevSnake.slice(0, -1)]; // Don't grow
            } else {
              // HARD MODE: Pick up wrong letter, add to word, lose points
              setLetters((prev) => prev.filter((l) => l !== collided));
              setCollectedWord((prev) => prev + collided.letter);
              setScore((s) => Math.max(0, s - 5));
              playSound("wrong");
              return [newHead, ...prevSnake];
            }
          }
        }

        // Normal movement (shrink tail)
        return [newHead, ...prevSnake.slice(0, -1)];
      });
    }, speed);

    return () => clearInterval(interval);
  }, [
    isStarted,
    isPaused,
    gameOver,
    showLevelUp,
    countdown,
    direction,
    letters,
    collectedWord,
    speed,
  ]);

  // Check if word is complete
  useEffect(() => {
    if (
      collectedWord.replace(/\s+/g, "") === targetWord.replace(/\s+/g, "") &&
      !showLevelUp &&
      isStarted
    ) {
      const timeBonus = Math.max(0, 100 - timeElapsed);
      setScore((s) => s + timeBonus + 50);
      setShowFact(true);
      setShowLevelUp(true);
      setIsPaused(true);
      playSound("complete");
      createConfetti();

      // Move to next word after celebration
      setTimeout(() => {
        setShowLevelUp(false);
        setShowFact(false);
        setIsPaused(false);
        nextWord();
      }, 3000); // 3 second delay to show the celebration
    }
  }, [collectedWord, targetWord, timeElapsed, showLevelUp, isStarted]);

  // Spawn letters periodically
  useEffect(() => {
    if (!isStarted || isPaused || gameOver) return;

    const interval = setInterval(() => {
      setLetters((currentLetters) => {
        // Check if we already have enough letters
        if (currentLetters.length >= 12) return currentLetters;

        // Calculate current progress using ref
        const currentCollected = collectedWordRef.current.replace(/\s+/g, "");
        const currentTarget = targetWord.replace(/\s+/g, "");

        // Check if word is complete
        if (currentCollected === currentTarget) return currentLetters;

        // Calculate next letter needed
        const currentNextLetter = currentTarget[currentCollected.length] || "";
        if (!currentNextLetter) return currentLetters;

        let letter, isCorrect, isEraser;

        if (difficulty === "easy") {
          // EASY MODE: Only spawn correct letters (no distractors, no erasers)
          letter = currentNextLetter;
          isCorrect = true;
          isEraser = false;
        } else {
          // HARD MODE: 70% correct letter, 20% random letter, 10% eraser
          const rand = Math.random();

          if (rand < 0.1 && currentCollected.length > 0) {
            // Eraser (10%)
            letter = "⌫";
            isEraser = true;
            isCorrect = false;
          } else if (rand < 0.3) {
            // Random distractor letter (20%)
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            letter = alphabet[Math.floor(Math.random() * alphabet.length)];
            isCorrect = false;
            isEraser = false;
          } else {
            // Correct next letter (70%)
            letter = currentNextLetter;
            isCorrect = true;
            isEraser = false;
          }
        }

        // Find empty position using ref for snake
        let pos;
        let clash = true;
        let safeGuard = 0;

        while (clash && safeGuard < 100) {
          pos = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          };

          // Check collision with snake using ref
          const snakeCollision = snakeRef.current.some(
            (s) => s.x === pos.x && s.y === pos.y
          );
          const letterCollision = currentLetters.some(
            (l) => l.x === pos.x && l.y === pos.y
          );
          clash = snakeCollision || letterCollision;
          safeGuard++;
        }

        if (safeGuard >= 100) return currentLetters;

        // Add new letter
        return [...currentLetters, { ...pos, letter, isCorrect, isEraser }];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isStarted, isPaused, gameOver, targetWord, difficulty]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Sound effects (simple beeps using Web Audio API)
  const playSound = (type) => {
    if (muted) return;
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.value = 0.1;

    switch (type) {
      case "collect":
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        break;
      case "wrong":
        oscillator.frequency.value = 200;
        oscillator.type = "sawtooth";
        break;
      case "powerup":
        oscillator.frequency.value = 1000;
        oscillator.type = "square";
        break;
      case "complete":
        oscillator.frequency.value = 1200;
        oscillator.type = "sine";
        break;
      default:
        oscillator.frequency.value = 440;
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // Confetti effect
  const createConfetti = () => {
    const canvas = particlesRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: CANVAS / 2,
        y: CANVAS / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        life: 60,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, CANVAS, CANVAS);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life--;

        if (p.life > 0) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life / 60;
          ctx.fillRect(p.x, p.y, 4, 4);
        } else {
          particles.splice(i, 1);
        }
      });

      if (particles.length > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS, CANVAS);

    // Draw grid background (subtle)
    ctx.strokeStyle = "#e5e7eb20";
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * TILE, 0);
      ctx.lineTo(i * TILE, CANVAS);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * TILE);
      ctx.lineTo(CANVAS, i * TILE);
      ctx.stroke();
    }

    // Draw letters
    letters.forEach((letter) => {
      const x = letter.x * TILE;
      const y = letter.y * TILE;

      if (letter.isEraser) {
        // Eraser power-up (purple gradient)
        const gradient = ctx.createRadialGradient(
          x + TILE / 2,
          y + TILE / 2,
          2,
          x + TILE / 2,
          y + TILE / 2,
          TILE / 2
        );
        gradient.addColorStop(0, "#a855f7");
        gradient.addColorStop(1, "#7c3aed");
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(letter.letter, x + TILE / 2, y + TILE / 2);
      } else {
        // Letter tile (wooden style)
        const gradient = ctx.createLinearGradient(x, y, x, y + TILE);
        gradient.addColorStop(0, letter.isCorrect ? "#d4a574" : "#999");
        gradient.addColorStop(1, letter.isCorrect ? "#b8885d" : "#666");
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);

        // Letter shadow
        ctx.fillStyle = "#00000033";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(letter.letter, x + TILE / 2 + 1, y + TILE / 2 + 1);

        // Letter
        ctx.fillStyle = "#ffffff";
        ctx.fillText(letter.letter, x + TILE / 2, y + TILE / 2);
      }
    });

    // Draw snake
    snake.forEach((segment, i) => {
      const x = segment.x * TILE;
      const y = segment.y * TILE;

      if (i === 0) {
        // Head (teal)
        ctx.fillStyle = "#14b8a6";
        ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);

        // Eyes
        ctx.fillStyle = "#ffffff";
        const eyeSize = 3;
        const eyeOffset = 6;

        if (direction.x === 1) {
          // Right
          ctx.fillRect(x + TILE - eyeOffset, y + 5, eyeSize, eyeSize);
          ctx.fillRect(x + TILE - eyeOffset, y + TILE - 8, eyeSize, eyeSize);
        } else if (direction.x === -1) {
          // Left
          ctx.fillRect(x + eyeOffset - eyeSize, y + 5, eyeSize, eyeSize);
          ctx.fillRect(x + eyeOffset - eyeSize, y + TILE - 8, eyeSize, eyeSize);
        } else if (direction.y === 1) {
          // Down
          ctx.fillRect(x + 5, y + TILE - eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(x + TILE - 8, y + TILE - eyeOffset, eyeSize, eyeSize);
        } else {
          // Up or stationary
          ctx.fillRect(x + 5, y + eyeOffset - eyeSize, eyeSize, eyeSize);
          ctx.fillRect(x + TILE - 8, y + eyeOffset - eyeSize, eyeSize, eyeSize);
        }
      } else {
        // Body segments showing collected letters
        const letterIndex = i - 1;
        const displayWord = collectedWord.replace(/\s+/g, "");
        const letter = displayWord[letterIndex] || "";

        ctx.fillStyle = "#0d9488";
        ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);

        if (letter) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(letter, x + TILE / 2, y + TILE / 2);
        }
      }
    });
  }, [snake, letters, direction, collectedWord]);

  // Touch gesture handlers for swipe controls
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    if (!isStarted || isPaused || gameOver || showLevelUp) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Minimum swipe distance (30px) and max time (300ms) for a valid swipe
    const minSwipeDistance = 30;
    const maxSwipeTime = 300;

    if (deltaTime > maxSwipeTime) {
      touchStartRef.current = null;
      return;
    }

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine swipe direction based on the larger delta
    if (absX > absY && absX > minSwipeDistance) {
      // Horizontal swipe
      if (deltaX > 0 && direction.x === 0) {
        setDirection({ x: 1, y: 0 }); // Right
      } else if (deltaX < 0 && direction.x === 0) {
        setDirection({ x: -1, y: 0 }); // Left
      }
    } else if (absY > absX && absY > minSwipeDistance) {
      // Vertical swipe
      if (deltaY > 0 && direction.y === 0) {
        setDirection({ x: 0, y: 1 }); // Down
      } else if (deltaY < 0 && direction.y === 0) {
        setDirection({ x: 0, y: -1 }); // Up
      }
    }

    touchStartRef.current = null;
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
  };

  if (allCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl text-center font-bold text-green-900 dark:text-green-100 mb-2">
          All Words Completed!
        </h2>
        {/* <p className="text-lg text-green-700 dark:text-green-300 mb-4">
          You&apos;ve mastered all {clues.length} words!
        </p> */}
        {/* <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-6">
          Final Score: {score}
        </div> */}
        {/* {onComplete && (
          <button
            onClick={() => {
              // Ensure all modals are closed before completing
              setShowFact(false);
              setShowLevelUp(false);
              setIsPaused(false);
              onComplete({ score, wordsCompleted: clues.length });
            }}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-105"
          >
            Continue to Next Step
          </button>
        )} */}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl">
      {/* Header */}
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Word Snake Challenge
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Word {currentClueIndex + 1} of {clues.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {score}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              points
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentClueIndex + 1) / clues.length) * 100}%`,
            }}
          />
        </div>

        {/* Clue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-4">
          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 lg:mb-2">
            CLUE:
          </div>
          <div className="text-xl font-medium text-gray-900 dark:text-white mb-4">
            {currentClue.clue}
          </div>

          {showHint && currentClue.hint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg"
            >
              💡 Hint: {currentClue.hint}
            </motion.div>
          )}

          {/* Collected word display - Crossword style */}
          <div className="mt-4 hidden lg:block">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              YOUR ANSWER:
            </div>
            <div className="flex flex-wrap gap-1 justify-center">
              {displayWord.split("").map((char, i) => (
                <div
                  key={i}
                  className={`w-8 h-10 flex items-center justify-center rounded font-bold text-lg ${
                    char === "_"
                      ? "bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600"
                      : char === " "
                      ? "w-4"
                      : "bg-gradient-to-br from-primary-400 to-accent-600 text-white shadow-md"
                  }`}
                >
                  {char !== "_" && char !== " " && char}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS}
          height={CANVAS}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-2xl border-4 border-white dark:border-gray-700 touch-none"
        />
        <canvas
          ref={particlesRef}
          width={CANVAS}
          height={CANVAS}
          className="absolute top-0 left-0 pointer-events-none rounded-2xl"
        />

        {/* Countdown */}
        <AnimatePresence>
          {countdown > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl"
            >
              <div className="text-8xl font-bold text-white">{countdown}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl"
            >
              <div className="text-center text-white">
                <div className="text-4xl font-bold mb-4">Game Over!</div>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Screen */}
        <AnimatePresence>
          {!isStarted && !gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl"
            >
              <div className="text-center text-white">
                <div className="text-4xl font-bold mb-4">Ready?</div>
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold"
                >
                  Start Game
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pause Screen */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl"
            >
              <div className="text-center text-white">
                <div className="text-4xl font-bold mb-4">Paused</div>
                <button
                  onClick={togglePause}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold"
                >
                  Resume
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Backspace Button - Small floating button for undo */}
        {isStarted && !gameOver && collectedWord.length > 0 && (
          <button
            onClick={handleBackspace}
            className="md:hidden absolute bottom-4 right-4 w-12 h-12 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg z-20 active:scale-95 transition-all"
            aria-label="Backspace"
          >
            ⌫
          </button>
        )}
      </div>

      {/* Controls Info */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <span className="hidden md:inline">
          Use arrow keys to move • Backspace to undo • P to pause
        </span>
        <span className="md:hidden">
          Swipe on the game board to move the snake
        </span>
      </div>

      {/* Educational Fact Modal */}
      <AnimatePresence>
        {showFact && currentClue.fact && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowFact(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  Correct!
                </h3>
                <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white mb-4">
                  {targetWord}
                </div>
              </div>

              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6">
                <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-2">
                  DID YOU KNOW?
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {currentClue.fact}
                </p>
              </div>

              {/* {currentClueIndex + 1 < clues.length ? (
                <button
                  onClick={nextWord}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white rounded-lg font-semibold"
                >
                  Next Word
                </button>
              ) : (
                <button
                  onClick={setShowFact(false)}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white rounded-lg font-semibold"
                >
                  All Words Completed
                </button>
              )} */}

              <button
                onClick={nextWord}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white rounded-lg font-semibold"
              >
                {currentClueIndex + 1 < clues.length
                  ? "Next Word"
                  : "All Words Completed"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
