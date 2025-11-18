"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllCluesProgressive,
  getSpeedForLevel,
  getDifficultyForLevel,
} from "@/data/wordSnakeClues";

/**
 * Word Snake Game - Educational word-building game
 * Students collect letters to spell environmental vocabulary words
 */

const GRID_SIZE = 20;
const TILE = 25;
const CANVAS = GRID_SIZE * TILE;

export default function WordSnakeGame() {
  const canvasRef = useRef(null);
  const particlesRef = useRef(null);

  // Game state
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [letters, setLetters] = useState([]); // {x, y, letter, isCorrect, isEraser}
  const [collectedWord, setCollectedWord] = useState("");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(9);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(180);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showFact, setShowFact] = useState(false);

  // Get all clues progressively
  const allClues = useMemo(() => getAllCluesProgressive(), []);
  const currentClue = allClues[level - 1] || allClues[0];
  const targetWord = currentClue.answer;
  const difficulty = getDifficultyForLevel(level);

  // Next letter needed
  const nextLetter = targetWord[collectedWord.length] || "";
  const wordComplete = collectedWord === targetWord.replace(/ /g, "");

  // Word display with spaces
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

  // Audio context
  const audioCtxRef = useRef(null);
  const getAudio = () => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const ctx =
      typeof window !== "undefined"
        ? new (window.AudioContext || window.webkitAudioContext)()
        : null;
    audioCtxRef.current = ctx;
    return ctx;
  };

  /** Keyboard controls */
  useEffect(() => {
    const onKey = (e) => {
      // Prevent default behavior for arrow keys to avoid page scrolling during gameplay
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
      }

      if (!isStarted || gameOver || isPaused) return;

      switch (e.key) {
        case "ArrowUp":
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case "Backspace":
          e.preventDefault();
          handleBackspace();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [direction, isStarted, gameOver, isPaused, collectedWord]);

  /** Mobile controls handler */
  const handleDirectionChange = (newDir) => {
    if (newDir.x !== 0 && direction.x === 0) {
      setDirection(newDir);
    } else if (newDir.y !== 0 && direction.y === 0) {
      setDirection(newDir);
    }
  };

  /** Backspace - remove last letter */
  const handleBackspace = useCallback(() => {
    if (collectedWord.length > 0) {
      setCollectedWord((prev) => prev.slice(0, -1));
      setSnake((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
      beep("undo");
    }
  }, [collectedWord]);

  /** Movement loop */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (
      !isStarted ||
      gameOver ||
      isPaused ||
      (direction.x === 0 && direction.y === 0)
    )
      return;

    const id = setInterval(() => {
      moveSnake();
      draw(ctx);
    }, speed);

    return () => clearInterval(id);
  }, [speed, gameOver, isPaused, isStarted, snake, direction, collectedWord]);

  /** Letter spawning */
  useEffect(() => {
    if (!isStarted || gameOver || isPaused) return;
    const id = setInterval(() => {
      if (letters.length < 8 && !wordComplete) spawnLetter();
    }, 3000);
    return () => clearInterval(id);
  }, [gameOver, isPaused, isStarted, letters.length, wordComplete, nextLetter]);

  /** Speed adjustment */
  useEffect(() => {
    setSpeed(getSpeedForLevel(level));
  }, [level]);

  /** Timer */
  useEffect(() => {
    if (!isStarted || gameOver || isPaused) return;
    const id = setInterval(() => {
      setTimeElapsed((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isStarted, gameOver, isPaused]);

  /** Hint after 30 seconds */
  useEffect(() => {
    if (timeElapsed === 30 && !showHint) {
      setShowHint(true);
    }
  }, [timeElapsed, showHint]);

  /** Level up countdown */
  useEffect(() => {
    if (!showLevelUp) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 700);
      return () => clearTimeout(t);
    } else {
      setShowLevelUp(false);
      setIsPaused(false);
      setShowFact(false);
    }
  }, [countdown, showLevelUp]);

  /** Word completion check */
  useEffect(() => {
    if (wordComplete && !showLevelUp && !isPaused && isStarted) {
      handleWordComplete();
    }
  }, [wordComplete, showLevelUp, isPaused, isStarted]);

  const handleWordComplete = () => {
    setScore((s) => s + 100 + Math.max(0, 60 - timeElapsed) * 2); // Time bonus
    setIsPaused(true);
    setShowLevelUp(true);
    setShowFact(true);
    setCountdown(3);
    spawnConfetti();
    beep("level");

    // Reset for next level
    setTimeout(() => {
      if (level < allClues.length) {
        setLevel((l) => l + 1);
        setCollectedWord("");
        setSnake([{ x: 10, y: 10 }]);
        setDirection({ x: 0, y: 0 });
        setLetters([]);
        setTimeElapsed(0);
        setShowHint(false);
      } else {
        // Game complete!
        setGameOver(true);
      }
    }, 3000);
  };

  const moveSnake = () => {
    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    // Wall collision
    const hitWall =
      newHead.x < 0 ||
      newHead.y < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y >= GRID_SIZE;

    // Self collision
    const hitSelf = snake.some((s) => s.x === newHead.x && s.y === newHead.y);

    if (hitWall || hitSelf) {
      setGameOver(true);
      beep("gameover");
      return;
    }

    let nextSnake = [newHead, ...snake];

    // Check letter collision
    const collided = letters.find(
      (l) => l.x === newHead.x && l.y === newHead.y
    );

    if (collided) {
      setLetters((prev) => prev.filter((l) => l !== collided));

      if (collided.isEraser) {
        // Eraser power-up
        handleBackspace();
        beep("collect");
      } else if (collided.isCorrect) {
        // Correct letter
        setCollectedWord((prev) => prev + collided.letter);
        setScore((s) => s + 10);
        beep("collect");
        // Snake grows (keep tail)
      } else {
        // Wrong letter - add to snake but mark as mistake
        setCollectedWord((prev) => prev + collided.letter);
        beep("miss");
        // Snake still grows
      }
    } else {
      // Normal move - drop tail
      nextSnake.pop();
    }

    setSnake(nextSnake);
  };

  const spawnLetter = () => {
    if (letters.length >= 10) return;

    // 70% chance for correct letter, 20% random, 10% eraser
    const rand = Math.random();
    let letter, isCorrect, isEraser;

    if (rand < 0.1 && collectedWord.length > 0) {
      // Eraser
      letter = "⌫";
      isEraser = true;
      isCorrect = false;
    } else if (rand < 0.8) {
      // Correct next letter
      letter = nextLetter;
      isCorrect = true;
      isEraser = false;
    } else {
      // Random distractor letter
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      letter = alphabet[Math.floor(Math.random() * alphabet.length)];
      isCorrect = letter === nextLetter;
      isEraser = false;
    }

    let pos;
    let clash = true;
    let safeGuard = 0;

    while (clash && safeGuard < 100) {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      clash =
        snake.some((s) => s.x === pos.x && s.y === pos.y) ||
        letters.some((l) => l.x === pos.x && l.y === pos.y);
      safeGuard++;
    }

    setLetters((prev) => [...prev, { ...pos, letter, isCorrect, isEraser }]);
  };

  const draw = (ctx) => {
    ctx.clearRect(0, 0, CANVAS, CANVAS);

    // Draw grid (subtle)
    ctx.strokeStyle = "#e0f2e9";
    ctx.lineWidth = 0.5;
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

    // Draw snake with letters
    snake.forEach((seg, index) => {
      const x = seg.x * TILE;
      const y = seg.y * TILE;

      // Wooden tile background
      const gradient = ctx.createLinearGradient(x, y, x + TILE, y + TILE);
      gradient.addColorStop(0, "#8b7355");
      gradient.addColorStop(1, "#6b5844");

      ctx.fillStyle = gradient;
      ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);

      // Border
      ctx.strokeStyle = "#4a3a2a";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);

      // Letter on segment
      if (index < collectedWord.length) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(collectedWord[index], x + TILE / 2, y + TILE / 2);
      }
    });
  };

  const beep = (type) => {
    if (muted) return;
    const ctx = getAudio();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    let freq = 440,
      dur = 0.08;
    if (type === "collect") freq = 600;
    if (type === "miss") freq = 300;
    if (type === "undo") freq = 400;
    if (type === "level") {
      freq = 700;
      dur = 0.2;
    }
    if (type === "gameover") {
      freq = 200;
      dur = 0.4;
    }
    o.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.start(now);
    o.stop(now + dur + 0.02);
  };

  // Confetti (reusing from original snake game)
  const confettiState = useRef({ running: false, particles: [], raf: 0 });

  const spawnConfetti = () => {
    const canvas = particlesRef.current;
    if (!canvas) return;
    const cx = CANVAS / 2,
      cy = CANVAS / 2;
    const colors = ["#22c55e", "#10b981", "#059669", "#84cc16", "#65a30d"];
    const parts = [];
    for (let i = 0; i < 80; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 3;
      parts.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2,
        life: 60 + Math.random() * 30,
        color: colors[(Math.random() * colors.length) | 0],
        size: 2 + Math.random() * 3,
      });
    }
    confettiState.current.particles = parts;
    if (!confettiState.current.running) {
      confettiState.current.running = true;
      confettiLoop();
    }
  };

  const confettiLoop = () => {
    const canvas = particlesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const step = () => {
      const state = confettiState.current;
      if (!state.running) return;
      ctx.clearRect(0, 0, CANVAS, CANVAS);
      state.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 1;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      state.particles = state.particles.filter(
        (p) => p.life > 0 && p.y < CANVAS + 10
      );
      if (state.particles.length === 0) {
        state.running = false;
        ctx.clearRect(0, 0, CANVAS, CANVAS);
        return;
      }
      state.raf = requestAnimationFrame(step);
    };
    confettiState.current.raf = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => {
      if (confettiState.current.raf)
        cancelAnimationFrame(confettiState.current.raf);
    };
  }, []);

  const handleRestart = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: 0 });
    setLetters([]);
    setCollectedWord("");
    setScore(0);
    setLevel(1);
    setSpeed(180);
    setTimeElapsed(0);
    setShowHint(false);
    setGameOver(false);
    setIsStarted(false);
  };

  // Difficulty badge color
  const difficultyColor = {
    beginner: "bg-green-500",
    intermediate: "bg-yellow-500",
    advanced: "bg-orange-500",
    expert: "bg-red-500",
  };

  return (
    <div className="flex flex-col items-center pt-8 font-sans max-w-4xl mx-auto px-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2 text-primary-800 dark:text-primary-200">
          🐍 Word Snake
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Spell environmental words by collecting letters in order!
        </p>
      </div>

      {/* Game info */}
      <div className="w-full mb-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-semibold">Level:</span> {level}
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold text-white ${difficultyColor[difficulty]}`}
          >
            {difficulty}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Score:</span> {score}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Time:</span> {timeElapsed}s
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={muted}
            onChange={() => setMuted((m) => !m)}
          />
          Mute
        </label>
      </div>

      {/* Clue section */}
      <div className="w-full bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-6 mb-4 border-2 border-primary-200 dark:border-primary-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide text-primary-600 dark:text-primary-400 font-semibold mb-1">
              🎯 Clue
            </div>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
              {currentClue.clue}
            </p>
          </div>
          {showHint && (
            <div className="ml-4 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2 rounded-lg">
              <div className="text-xs text-yellow-800 dark:text-yellow-200 font-semibold">
                💡 Hint
              </div>
              <div className="text-sm text-yellow-900 dark:text-yellow-100">
                {currentClue.hint}
              </div>
            </div>
          )}
        </div>

        {/* Word display */}
        <div className="flex items-center gap-2 flex-wrap">
          {displayWord.split("").map((char, i) => (
            <div
              key={i}
              className={`w-8 h-10 flex items-center justify-center rounded font-bold text-lg ${
                char === "_"
                  ? "bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600"
                  : char === " "
                  ? "w-4"
                  : "bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-md"
              }`}
            >
              {char !== "_" && char !== " " && char}
            </div>
          ))}
        </div>

        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
          Press{" "}
          <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border">
            Backspace
          </kbd>{" "}
          or collect ⌫ to undo last letter
        </div>
      </div>

      {/* Game canvas */}
      <motion.div
        className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
        style={{ width: CANVAS, height: CANVAS, border: "3px solid #059669" }}
      >
        {/* Main canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS}
          height={CANVAS}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
          }}
        />

        {/* Particles */}
        <canvas
          ref={particlesRef}
          width={CANVAS}
          height={CANVAS}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            pointerEvents: "none",
          }}
        />

        {/* Letter tiles */}
        {letters.map((item, idx) => (
          <div
            key={`${item.x}-${item.y}-${idx}`}
            className={`absolute flex items-center justify-center text-white text-xl font-bold rounded-lg shadow-lg transition-all ${
              item.isEraser
                ? "bg-gradient-to-br from-purple-500 to-purple-700 animate-pulse"
                : item.isCorrect
                ? "bg-gradient-to-br from-green-500 to-green-700"
                : "bg-gradient-to-br from-gray-500 to-gray-700"
            }`}
            style={{
              top: item.y * TILE,
              left: item.x * TILE,
              width: TILE,
              height: TILE,
              zIndex: 2,
            }}
          >
            {item.letter}
          </div>
        ))}

        {/* Level up overlay */}
        {showLevelUp && (
          <div className="absolute inset-0 z-[10] flex items-center justify-center bg-black/60">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-white text-center p-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-2xl max-w-md"
            >
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Word Complete!</h2>
              <div className="text-5xl font-bold my-4">{targetWord}</div>
              {showFact && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mt-4 text-sm">
                  <div className="font-semibold mb-2">💡 Did you know?</div>
                  <p>{currentClue.fact}</p>
                </div>
              )}
              {countdown > 0 && (
                <div className="text-6xl font-bold mt-4">{countdown}</div>
              )}
            </motion.div>
          </div>
        )}

        {/* Start overlay */}
        {!isStarted && !gameOver && (
          <div className="absolute inset-0 z-[10] bg-black/70 flex flex-col items-center justify-center text-white p-8">
            <h2 className="text-3xl font-bold mb-4">Word Snake</h2>
            <p className="mb-2 text-center">Collect letters to spell words!</p>
            <p className="mb-6 text-sm text-center opacity-80">
              Use arrow keys to move. Collect the right letters in order.
            </p>
            <button
              onClick={() => setIsStarted(true)}
              className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 font-bold"
            >
              Start Game
            </button>
          </div>
        )}

        {/* Game over */}
        {gameOver && (
          <div className="absolute inset-0 z-[10] bg-black/70 flex flex-col items-center justify-center text-white p-8">
            <h2 className="text-3xl font-bold mb-3">Game Over!</h2>
            <p className="mb-2">
              Final Score: <span className="font-bold text-2xl">{score}</span>
            </p>
            <p className="mb-6">Level Reached: {level}</p>
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 font-bold"
            >
              Play Again
            </button>
          </div>
        )}
      </motion.div>

      {/* Mobile controls */}
      <div className="mt-6 md:hidden">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => handleDirectionChange({ x: 0, y: -1 })}
            className="w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-2xl shadow-lg"
            disabled={!isStarted || gameOver || isPaused}
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handleDirectionChange({ x: -1, y: 0 })}
              className="w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-2xl shadow-lg"
              disabled={!isStarted || gameOver || isPaused}
            >
              ◀
            </button>
            <button
              onClick={() => handleDirectionChange({ x: 0, y: 1 })}
              className="w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-2xl shadow-lg"
              disabled={!isStarted || gameOver || isPaused}
            >
              ▼
            </button>
            <button
              onClick={() => handleDirectionChange({ x: 1, y: 0 })}
              className="w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-2xl shadow-lg"
              disabled={!isStarted || gameOver || isPaused}
            >
              ▶
            </button>
          </div>
          <button
            onClick={handleBackspace}
            className="w-auto px-6 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-lg mt-2"
            disabled={
              !isStarted || gameOver || isPaused || collectedWord.length === 0
            }
          >
            ⌫ Undo
          </button>
        </div>
      </div>
    </div>
  );
}
