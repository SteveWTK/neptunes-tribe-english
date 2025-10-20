"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GAME_VARIANTS,
  getThemeForLevel,
  getThemeKeyForLevel,
} from "@/data/snakeGameThemes";

/**
 * Neptune's Tribe — Eco Snake (v5)
 * New in v5:
 *  - Mobile touch controls (D-pad style buttons)
 *  - Modular theme system with game variants
 *  - Themes imported from external config file
 *
 * Previous features:
 *  - Start button (game doesn't run until started)
 *  - Countdown loop bug fixed using a score threshold (nextThreshold)
 *  - 3-2-1 circular countdown animation
 *  - Pixel-crisp borders on snake segments (retro vibe)
 *  - Themes, practice/challenge modes, particles, toasts, audio
 */

const GRID_SIZE = 20;
const TILE = 25; // px per tile
const CANVAS = GRID_SIZE * TILE;

// Speed modes (ms per tick before level scaling)
const SPEED_MODES = {
  calm: 240,
  fast: 160, // default middle
  urgent: 110,
};

const computeSpeed = (mode, level) => {
  const base = SPEED_MODES[mode] ?? 160;
  const reduction = Math.min(90, (level - 1) * 10); // -10ms per level, cap 90ms
  return Math.max(60, base - reduction); // never faster than 60ms/tick
};

// Spawn bias: returns probability of TRASH based on level (more nature later)
const trashProbabilityForLevel = (level) => {
  if (level <= 2) return 0.75;
  if (level <= 4) return 0.6;
  if (level <= 6) return 0.5;
  if (level <= 8) return 0.45;
  return 0.4;
};

const MAX_ITEMS = 14;

export default function SnakeGame({ variant = "eco_cleanup" }) {
  const canvasRef = useRef(null); // main canvas (snake)
  const particlesRef = useRef(null); // particles canvas

  // ===== Lives config =====
  const LIVES_MAX = 3;

  // Core game state
  const [snake, setSnake] = useState([{ x: 8, y: 8 }]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [items, setItems] = useState([]); // {x,y,type,word}
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0); // counts 'nature' hits (lives used)
  const [gameOver, setGameOver] = useState(false);

  // Meta / UX state
  const [isStarted, setIsStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [nextThreshold, setNextThreshold] = useState(10); // prevents repeated level-ups at same score
  const [speedMode, setSpeedMode] = useState("fast");
  const [speed, setSpeed] = useState(computeSpeed("fast", 1));
  const [isPaused, setIsPaused] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [countdown, setCountdown] = useState(0); // 3-2-1
  const [colorAssist, setColorAssist] = useState(true); // true: different colors, false: same color
  const [practiceMode, setPracticeMode] = useState(false);
  const [scorePop, setScorePop] = useState(false);
  const [muted, setMuted] = useState(false);

  // Score toasts [+1 ♻️]
  const [toasts, setToasts] = useState([]); // {id,x,y,label}
  const toastIdRef = useRef(0);

  // Background noise pattern cache
  const noisePatternRef = useRef(null);

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

  // Get current game variant configuration
  const gameVariant = GAME_VARIANTS[variant] || GAME_VARIANTS.eco_cleanup;

  // Active theme derived from level and variant
  const themeKey = useMemo(
    () => getThemeKeyForLevel(variant, level),
    [variant, level]
  );
  const theme = useMemo(
    () => getThemeForLevel(variant, level),
    [variant, level]
  );

  /** Keyboard controls */
  useEffect(() => {
    const onKey = (e) => {
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
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [direction]);

  /** Touch/click handlers for mobile controls */
  const handleDirectionChange = (newDir) => {
    if (newDir.x !== 0 && direction.x === 0) {
      setDirection(newDir);
    } else if (newDir.y !== 0 && direction.y === 0) {
      setDirection(newDir);
    }
  };

  /** Movement + render loop (runs only when started, not paused, not over) */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!isStarted || gameOver || isPaused) return;

    const id = setInterval(() => {
      moveSnake();
      draw(ctx);
    }, speed);

    return () => clearInterval(id);
  }, [speed, gameOver, isPaused, isStarted, snake, direction, themeKey]);

  /** Word spawning loop (every ~2.8s, only when started and active) */
  useEffect(() => {
    if (!isStarted || gameOver || isPaused) return;
    const id = setInterval(() => {
      if (items.length < MAX_ITEMS) spawnItem();
    }, 2800);
    return () => clearInterval(id);
  }, [gameOver, isPaused, isStarted, themeKey, items.length]);

  /** Recompute speed when level or mode changes */
  useEffect(() => {
    setSpeed(computeSpeed(speedMode, level));
  }, [speedMode, level]);

  /** Level-up detector using score threshold */
  useEffect(() => {
    if (!isStarted || gameOver) return;
    if (score >= nextThreshold && !showLevelUp && !isPaused) {
      setLevel((prev) => prev + 1);
      setNextThreshold((prev) => prev + 10);
      setItems([]); // clear screen
      setIsPaused(true);
      setShowLevelUp(true);
      setCountdown(3);
      spawnConfetti();
      beep("level");
    }
  }, [score, isStarted, gameOver, showLevelUp, isPaused]);

  /** Countdown effect independent of paused state */
  useEffect(() => {
    if (!showLevelUp) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 700);
      return () => clearTimeout(t);
    } else {
      setShowLevelUp(false);
      setIsPaused(false);
    }
  }, [countdown, showLevelUp]);

  /** Core mechanics */
  const moveSnake = () => {
    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    // Wall or self collision → still instant game over (keeps stakes high)
    const hitWall =
      newHead.x < 0 ||
      newHead.y < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y >= GRID_SIZE;
    const hitSelf = snake.some((s) => s.x === newHead.x && s.y === newHead.y);
    if (hitWall || hitSelf) {
      setGameOver(true);
      beep("gameover");
      return;
    }

    let nextSnake = [newHead, ...snake];

    // Check item collision
    const collided = items.find((i) => i.x === newHead.x && i.y === newHead.y);
    if (collided) {
      if (collided.type === "trash") {
        setScore((p) => p + 1); // grow (keep tail)
        setScorePop(true);
        setTimeout(() => setScorePop(false), 220);
        setItems((prev) => prev.filter((i) => i !== collided));

        // Score toast near head
        const id = toastIdRef.current++;
        setToasts((prev) => [
          ...prev,
          { id, x: newHead.x, y: newHead.y, label: "+1 ♻️" },
        ]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 750);

        beep("collect");
      } else {
        // Nature hit → use a life (unless in practice mode)
        if (practiceMode) {
          setMistakes((m) => m + 1);
          if (nextSnake.length > 3) nextSnake.pop();
          beep("miss");
          // Remove the nature item so it doesn't instantly re-hit
          setItems((prev) => prev.filter((i) => i !== collided));
        } else {
          setMistakes((m) => {
            const used = m + 1;
            // Remove the nature item to avoid double collisions
            setItems((prev) => prev.filter((i) => i !== collided));
            if (used >= LIVES_MAX) {
              setGameOver(true);
              beep("gameover");
            } else {
              // small penalty: shrink one segment if possible
              if (nextSnake.length > 3) nextSnake.pop();
              beep("miss");
            }
            return used;
          });
        }
      }
    } else {
      // normal move → drop tail
      nextSnake.pop();
    }

    if (!gameOver) setSnake(nextSnake);
  };

  const spawnItem = () => {
    if (items.length >= MAX_ITEMS) return;

    const trashProb = trashProbabilityForLevel(level);
    const type = Math.random() < trashProb ? "trash" : "nature";

    const wordList = type === "trash" ? theme.trashWords : theme.natureWords;
    const word = wordList[Math.floor(Math.random() * wordList.length)];

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
        items.some((i) => i.x === pos.x && i.y === pos.y);
      safeGuard++;
    }

    setItems((prev) => [...prev, { ...pos, type, word }]);
  };

  /** Background textures & snake render (items are DOM overlays) */
  const draw = (ctx) => {
    ctx.clearRect(0, 0, CANVAS, CANVAS);

    // Subtle noise overlay (pattern cached)
    if (!noisePatternRef.current) {
      noisePatternRef.current = createNoisePattern(ctx);
    }
    if (noisePatternRef.current) {
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = noisePatternRef.current;
      ctx.fillRect(0, 0, CANVAS, CANVAS);
      ctx.restore();
    }

    // Theme-specific flourish (e.g., beach shoreline shimmer band)
    if (themeKey === "beach") {
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS * 0.35);
      grad.addColorStop(0, "rgba(255,255,255,0.35)");
      grad.addColorStop(1, "rgba(255,255,255,0.0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS, CANVAS * 0.35);
    }

    // Snake — retro pixel borders
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#0f766e"; // body
    ctx.strokeStyle = "#0b3d38"; // dark border
    ctx.lineWidth = 1;
    snake.forEach((seg) => {
      const x = seg.x * TILE;
      const y = seg.y * TILE;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
    });
  };

  /** Create a tiny noise canvas pattern */
  const createNoisePattern = (ctx) => {
    const c = document.createElement("canvas");
    const s = 64;
    c.width = s;
    c.height = s;
    const g = c.getContext("2d");
    const img = g.createImageData(s, s);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 220 + Math.random() * 35;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = Math.random() * 55;
    }
    g.putImageData(img, 0, 0);
    return ctx.createPattern(c, "repeat");
  };

  /** Particles + audio helpers (unchanged from v4) ... */
  const confettiState = useRef({ running: false, particles: [], raf: 0 });
  const spawnConfetti = () => {
    const canvas = particlesRef.current;
    if (!canvas) return;
    const cx = CANVAS / 2,
      cy = CANVAS / 2;
    const colors = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#a855f7"];
    const parts = [];
    for (let i = 0; i < 90; i++) {
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
    if (type === "collect") freq = 520;
    if (type === "miss") freq = 220;
    if (type === "level") {
      freq = 660;
      dur = 0.18;
    }
    if (type === "gameover") {
      freq = 160;
      dur = 0.3;
    }
    o.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.start(now);
    o.stop(now + dur + 0.02);
  };

  // Helpers for item chips
  const itemBgClass = (item) => {
    if (!colorAssist) return theme.blindClass; // challenge mode
    return item.type === "trash" ? theme.trashClass : theme.natureClass;
  };
  const itemAnimClass = (item) =>
    item.type === "trash" ? "animate-pulse" : "animate-bounce";

  // ===== RENDER =====
  // Derived percentage for circular countdown ring (3 → 2 → 1)
  const countdownPct = countdown > 0 ? countdown / 3 : 0;
  const CIRC_R = 40;
  const CIRC_C = 2 * Math.PI * CIRC_R; // circumference

  const handleRestart = () => {
    setSnake([{ x: 8, y: 8 }]);
    setDirection({ x: 1, y: 0 });
    setItems([]);
    setScore(0);
    setMistakes(0);
    setLevel(1);
    setNextThreshold(10);
    setSpeedMode(speedMode);
    setSpeed(computeSpeed(speedMode, 1));
    setIsPaused(false);
    setShowLevelUp(false);
    setCountdown(0);
    setGameOver(false);
    setIsStarted(false);
  };

  // Lives display helper
  const livesLeft = Math.max(0, LIVES_MAX - mistakes);

  return (
    <div className="flex flex-col items-center pt-8 font-sans">
      <h1 className="text-2xl mb-3">🐍 {gameVariant.name}</h1>
      <p className="text-sm text-gray-600 mb-2">{gameVariant.instruction}</p>

      {/* Controls (available before start) */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">Speed:</label>
          <select
            className="border rounded px-2 py-1"
            value={speedMode}
            onChange={(e) => setSpeedMode(e.target.value)}
          >
            <option value="calm">Calm</option>
            <option value="fast">Fast</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!colorAssist}
            onChange={() => setColorAssist((v) => !v)}
          />
          Challenge: same color for all words
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={practiceMode}
            onChange={() => setPracticeMode((v) => !v)}
          />
          Practice mode (no game over on nature)
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={muted}
            onChange={() => setMuted((m) => !m)}
          />
          Mute
        </label>

        <div className="text-sm opacity-80">
          Level <span className="font-semibold">{level}</span> · Theme:{" "}
          <span className="font-semibold">{theme.label}</span>
        </div>
      </div>

      {/* Stage with animated background color */}
      <motion.div
        className="relative"
        style={{ width: CANVAS, height: CANVAS, border: "2px solid #333" }}
        animate={{ backgroundColor: theme.bg }}
        transition={{ duration: 0.6 }}
      >
        {/* Snake canvas (transparent bg) */}
        <canvas
          ref={canvasRef}
          width={CANVAS}
          height={CANVAS}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: "transparent",
          }}
        />

        {/* Particles canvas overlay */}
        <canvas
          ref={particlesRef}
          width={CANVAS}
          height={CANVAS}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* Animated items as overlays */}
        {items.map((item, idx) => (
          <div
            key={`${item.x}-${item.y}-${idx}`}
            className={`absolute flex items-center justify-center text-white text-[10px] leading-tight font-semibold rounded ${itemBgClass(
              item
            )} ${itemAnimClass(item)} transition-transform`}
            style={{
              top: item.y * TILE,
              left: item.x * TILE,
              width: TILE,
              height: TILE,
              borderRadius: 6,
              padding: 2,
              textAlign: "center",
              zIndex: 3,
            }}
            title={item.word}
          >
            <span className="px-0.5">{item.word}</span>
          </div>
        ))}

        {/* Score toasts near head */}
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -14, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ duration: 0.45 }}
              className="absolute text-xs font-bold text-green-700"
              style={{
                top: t.y * TILE + 4,
                left: t.x * TILE + 6,
                zIndex: 4,
                pointerEvents: "none",
              }}
            >
              {t.label}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Level-up overlay with circular countdown */}
        {(showLevelUp || countdown > 0) && (
          <div className="absolute inset-0 z-[5] flex items-center justify-center bg-black/45">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="text-white font-extrabold drop-shadow text-center flex flex-col items-center"
            >
              <div className="text-xl mb-2">Level up!</div>
              <svg width="120" height="120" className="mb-2">
                <circle
                  cx="60"
                  cy="60"
                  r={CIRC_R}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={CIRC_R}
                  stroke="#ffffff"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "60px 60px",
                    strokeDasharray: CIRC_C,
                    strokeDashoffset: CIRC_C * (1 - countdownPct),
                    transition: "stroke-dashoffset 0.7s linear",
                  }}
                />
                <text
                  x="50%"
                  y="54%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fontSize="34"
                  fill="#fff"
                >
                  {countdown > 0 ? countdown : "Go"}
                </text>
              </svg>
              <div className="text-sm">Get ready…</div>
            </motion.div>
          </div>
        )}

        {/* Start overlay */}
        {!isStarted && !gameOver && (
          <div className="absolute inset-0 z-[6] bg-black/55 flex flex-col items-center justify-center text-white">
            <h2 className="text-3xl font-extrabold mb-3">{gameVariant.name}</h2>
            <p className="mb-2 opacity-90 text-center px-4">
              {gameVariant.description}
            </p>
            <p className="mb-4 opacity-75 text-sm">
              Choose your options above, then start when ready.
            </p>
            <button
              onClick={() => setIsStarted(true)}
              className="px-5 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              Start Game
            </button>
          </div>
        )}

        {/* Game over overlay */}
        {gameOver && (
          <div className="absolute inset-0 z-[10] bg-black/60 flex flex-col items-center justify-center text-white">
            <h2 className="text-3xl font-extrabold mb-2">Game Over</h2>
            <p className="mb-1">Final score: {score}</p>
            <p className="mb-3 opacity-80">
              Lives left: {livesLeft} / {LIVES_MAX}
            </p>
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              Restart
            </button>
          </div>
        )}
      </motion.div>

      {/* HUD */}
      <div className="mt-4 flex gap-6 items-center text-lg">
        <div
          className={`transition-transform ${
            scorePop ? "scale-110" : "scale-100"
          }`}
        >
          Score: <span className="font-bold">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80">Lives:</span>
          <div className="flex gap-1">
            <p className="font-bold text-xl text-accent-100">{livesLeft}</p>
            {[...Array(LIVES_MAX)].map((_, i) => (
              <span
                key={i}
                className={`inline-block w-5 text-center ${
                  i < livesLeft ? "text-red-600" : "text-gray-400"
                }`}
              >
                ❤
              </span>
            ))}
          </div>
        </div>
        {practiceMode && (
          <div>
            Mistakes: <span className="font-bold">{mistakes}</span>
          </div>
        )}
        <div>
          Tick: <span className="font-mono text-base">{speed}ms</span>
        </div>
      </div>

      {/* Mobile Controls - D-pad style */}
      <div className="mt-6 md:hidden">
        <div className="flex flex-col items-center gap-2">
          {/* Up button */}
          <button
            onClick={() => handleDirectionChange({ x: 0, y: -1 })}
            className="w-16 h-16 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg font-bold text-2xl shadow-lg flex items-center justify-center"
            disabled={!isStarted || gameOver || isPaused}
          >
            ▲
          </button>

          {/* Left, Down, Right buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleDirectionChange({ x: -1, y: 0 })}
              className="w-16 h-16 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg font-bold text-2xl shadow-lg flex items-center justify-center"
              disabled={!isStarted || gameOver || isPaused}
            >
              ◀
            </button>
            <button
              onClick={() => handleDirectionChange({ x: 0, y: 1 })}
              className="w-16 h-16 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg font-bold text-2xl shadow-lg flex items-center justify-center"
              disabled={!isStarted || gameOver || isPaused}
            >
              ▼
            </button>
            <button
              onClick={() => handleDirectionChange({ x: 1, y: 0 })}
              className="w-16 h-16 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg font-bold text-2xl shadow-lg flex items-center justify-center"
              disabled={!isStarted || gameOver || isPaused}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
