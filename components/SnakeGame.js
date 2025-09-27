"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";

/**
 * Neptune's Tribe — Eco Snake
 * Features added in this version:
 * 1) Level-up transition with a short pause between levels
 * 2) Per-level themes (vocab + colors): Beach → Field → Forest (loops)
 * 3) Speed modes: Calm / Fast / Urgent
 * 4) Challenge option: same color for trash & nature (learn-by-words only)
 * 5) Tailwind-powered animated items rendered as absolutely positioned <div>s
 *    over the canvas (snake & background remain on canvas for performance)
 */

const GRID_SIZE = 20;
const TILE = 25; // px per tile
const CANVAS = GRID_SIZE * TILE;

// Theme presets (rotate with levels)
const THEMES = {
  beach: {
    label: "Beach",
    bg: "#e3e286", // sand
    trashWords: ["can", "plastic", "bag", "wrapper", "bottle", "straw", "cup"],
    natureWords: ["turtle", "shell", "starfish", "seaweed", "crab", "dune"],
    trashClass: "bg-red-500",
    natureClass: "bg-blue-700",
    blindClass: "bg-purple-700",
  },
  field: {
    label: "Field",
    bg: "#d9f5cc", // soft grass
    trashWords: ["packet", "foil", "straw", "cup", "lid", "wrapper"],
    natureWords: ["bee", "flower", "clover", "butterfly", "ladybird"],
    trashClass: "bg-orange-500",
    natureClass: "bg-emerald-700",
    blindClass: "bg-purple-700",
  },
  forest: {
    label: "Forest",
    bg: "#cde3c1", // forest light
    trashWords: ["can", "bottle", "plastic", "bag", "foil"],
    natureWords: ["mushroom", "moss", "fern", "owl", "deer"],
    trashClass: "bg-rose-500",
    natureClass: "bg-green-800",
    blindClass: "bg-purple-700",
  },
};

const THEME_KEYS = ["beach", "field", "forest"];
const themeKeyForLevel = (level) => THEME_KEYS[(level - 1) % THEME_KEYS.length];

// Speed modes (ms per tick before level scaling)
const SPEED_MODES = {
  calm: 220,
  fast: 150, // default (close to your current)
  urgent: 110,
};

const computeSpeed = (mode, level) => {
  const base = SPEED_MODES[mode] ?? 150;
  const reduction = Math.min(80, (level - 1) * 10); // -10ms per level, cap 80ms
  return Math.max(60, base - reduction); // never faster than 60ms/tick
};

export default function SnakeGame() {
  const canvasRef = useRef(null);

  // Core game state
  const [snake, setSnake] = useState([{ x: 8, y: 8 }]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [items, setItems] = useState([]); // {x,y,type,word}
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Meta / UX state
  const [level, setLevel] = useState(1);
  const [speedMode, setSpeedMode] = useState("fast");
  const [speed, setSpeed] = useState(computeSpeed("fast", 1));
  const [isPaused, setIsPaused] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [colorAssist, setColorAssist] = useState(true); // true: different colors, false: same color

  // Active theme derived from level
  const themeKey = useMemo(() => themeKeyForLevel(level), [level]);
  const theme = THEMES[themeKey];

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

  /** Movement + render loop (stops when paused or gameOver) */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (gameOver || isPaused) return;

    const id = setInterval(() => {
      moveSnake();
      draw(ctx);
    }, speed);

    return () => clearInterval(id);
  }, [speed, gameOver, isPaused, snake, direction, themeKey]);

  /** Word spawning loop (every 3s, stops when paused or gameOver) */
  useEffect(() => {
    if (gameOver || isPaused) return;
    const id = setInterval(() => {
      spawnItem();
    }, 3000);
    return () => clearInterval(id);
  }, [gameOver, isPaused, themeKey, items.length]);

  /** Recompute speed when level or mode changes */
  useEffect(() => {
    setSpeed(computeSpeed(speedMode, level));
  }, [speedMode, level]);

  /** Auto level-up every 10 points with a short breather */
  useEffect(() => {
    if (score > 0 && score % 10 === 0 && !gameOver && !isPaused) {
      setLevel((prev) => prev + 1);
      setItems([]); // clear screen
      setIsPaused(true);
      setShowLevelUp(true);
      const t = setTimeout(() => {
        setShowLevelUp(false);
        setIsPaused(false);
      }, 1500); // breather duration
      return () => clearTimeout(t);
    }
  }, [score, gameOver, isPaused]);

  /** Core mechanics */
  const moveSnake = () => {
    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    // Wall or self collision → game over
    const hitWall =
      newHead.x < 0 ||
      newHead.y < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y >= GRID_SIZE;
    const hitSelf = snake.some((s) => s.x === newHead.x && s.y === newHead.y);
    if (hitWall || hitSelf) {
      setGameOver(true);
      return;
    }

    let nextSnake = [newHead, ...snake];

    // Check item collision
    const collided = items.find((i) => i.x === newHead.x && i.y === newHead.y);
    if (collided) {
      if (collided.type === "trash") {
        setScore((p) => p + 1); // grow (keep tail)
        setItems((prev) => prev.filter((i) => i !== collided));
      } else {
        // nature → game over
        setGameOver(true);
        return;
      }
    } else {
      // normal move → drop tail
      nextSnake.pop();
    }

    setSnake(nextSnake);
  };

  const spawnItem = () => {
    const type = Math.random() > 0.5 ? "trash" : "nature";
    const wordList = type === "trash" ? theme.trashWords : theme.natureWords;
    const word = wordList[Math.floor(Math.random() * wordList.length)];

    let pos;
    let clash = true;
    while (clash) {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      clash =
        snake.some((s) => s.x === pos.x && s.y === pos.y) ||
        items.some((i) => i.x === pos.x && i.y === pos.y);
    }

    setItems((prev) => [...prev, { ...pos, type, word }]);
  };

  /** Render snake & background (items are DOM overlays for Tailwind animations) */
  const draw = (ctx) => {
    // Background (theme-based)
    ctx.clearRect(0, 0, CANVAS, CANVAS);
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, CANVAS, CANVAS);

    // Snake
    ctx.fillStyle = "#0f766e"; // teal-ish
    snake.forEach((seg) => {
      ctx.fillRect(seg.x * TILE, seg.y * TILE, TILE, TILE);
    });
  };

  const handleRestart = () => {
    setSnake([{ x: 8, y: 8 }]);
    setDirection({ x: 1, y: 0 });
    setItems([]);
    setScore(0);
    setLevel(1);
    setSpeedMode(speedMode); // keep current mode
    setSpeed(computeSpeed(speedMode, 1));
    setIsPaused(false);
    setShowLevelUp(false);
    setGameOver(false);
  };

  // Helpers for item chips
  const itemBgClass = (item) => {
    if (!colorAssist) return theme.blindClass; // challenge mode
    return item.type === "trash" ? theme.trashClass : theme.natureClass;
  };
  const itemAnimClass = (item) =>
    item.type === "trash" ? "animate-pulse" : "animate-bounce";

  return (
    <div className="flex flex-col items-center pt-8 font-sans">
      <h1 className="text-2xl mb-3">🐍 Eco Cleanup Snake</h1>

      {/* Controls */}
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

        <div className="text-sm opacity-80">
          Level <span className="font-semibold">{level}</span> · Theme:{" "}
          <span className="font-semibold">{theme.label}</span>
        </div>
      </div>

      {/* Game stage */}
      <div className="relative" style={{ width: CANVAS, height: CANVAS }}>
        <canvas
          ref={canvasRef}
          width={CANVAS}
          height={CANVAS}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            border: "2px solid #333",
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
              zIndex: 10,
            }}
            title={item.word}
          >
            <span className="px-0.5">{item.word}</span>
          </div>
        ))}

        {/* Level-up overlay */}
        {showLevelUp && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
            <div className="text-white text-3xl font-extrabold drop-shadow">
              Level {level - 1} → {level}
              <div className="text-base font-medium mt-2 text-center">
                Get ready…
              </div>
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {gameOver && (
          <div className="absolute inset-0 z-30 bg-black/60 flex flex-col items-center justify-center text-white">
            <h2 className="text-3xl font-extrabold mb-2">Game Over</h2>
            <p className="mb-3">Final score: {score}</p>
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* HUD */}
      <div className="mt-4 flex gap-6 text-lg">
        <div>
          Score: <span className="font-bold">{score}</span>
        </div>
        <div>
          Tick: <span className="font-mono text-base">{speed}ms</span>
        </div>
      </div>
    </div>
  );
}

// "use client";
// import React, { useRef, useEffect, useState } from "react";

// const SnakeGame = () => {
//   const canvasRef = useRef(null);

//   // Game state
//   const gridSize = 20;
//   const tileSize = 25;
//   const canvasSize = gridSize * tileSize;

//   const trashWords = ["can", "plastic", "bag", "wrapper", "bottle"];
//   const natureWords = ["turtle", "shell", "starfish", "seaweed", "crab"];

//   const [snake, setSnake] = useState([{ x: 8, y: 8 }]);
//   const [direction, setDirection] = useState({ x: 1, y: 0 });
//   const [items, setItems] = useState([]);
//   const [score, setScore] = useState(0);
//   const [gameOver, setGameOver] = useState(false);
//   const [level, setLevel] = useState(1);
//   const [speed, setSpeed] = useState(150);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     const moveInterval = setInterval(() => {
//       if (!gameOver) {
//         moveSnake();
//         drawGame(ctx);
//       }
//     }, speed);

//     return () => clearInterval(moveInterval);
//   }, [snake, direction, gameOver, speed]);

//   useEffect(() => {
//     const wordInterval = setInterval(() => {
//       if (!gameOver) {
//         spawnItem();
//       }
//     }, 3000);

//     return () => clearInterval(wordInterval);
//   }, [items, gameOver]);

//   useEffect(() => {
//     if (score > 0 && score % 10 === 0) {
//       setLevel((prev) => prev + 1);
//       setSpeed((prev) => Math.max(50, prev - 20));
//       setItems([]);
//     }
//   }, [score]);

//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       switch (e.key) {
//         case "ArrowUp":
//           if (direction.y === 0) setDirection({ x: 0, y: -1 });
//           break;
//         case "ArrowDown":
//           if (direction.y === 0) setDirection({ x: 0, y: 1 });
//           break;
//         case "ArrowLeft":
//           if (direction.x === 0) setDirection({ x: -1, y: 0 });
//           break;
//         case "ArrowRight":
//           if (direction.x === 0) setDirection({ x: 1, y: 0 });
//           break;
//         default:
//           break;
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [direction]);

//   const moveSnake = () => {
//     const newHead = {
//       x: snake[0].x + direction.x,
//       y: snake[0].y + direction.y,
//     };

//     if (
//       newHead.x < 0 ||
//       newHead.y < 0 ||
//       newHead.x >= gridSize ||
//       newHead.y >= gridSize ||
//       snake.some(
//         (segment) => segment.x === newHead.x && segment.y === newHead.y
//       )
//     ) {
//       setGameOver(true);
//       return;
//     }

//     let newSnake = [newHead, ...snake];

//     const collidedItem = items.find(
//       (i) => i.x === newHead.x && i.y === newHead.y
//     );

//     if (collidedItem) {
//       if (collidedItem.type === "trash") {
//         setScore((prev) => prev + 1);
//         setItems(items.filter((i) => i !== collidedItem));
//       } else {
//         setGameOver(true);
//         return;
//       }
//     } else {
//       newSnake.pop();
//     }

//     setSnake(newSnake);
//   };

//   const spawnItem = () => {
//     const type = Math.random() > 0.5 ? "trash" : "nature";
//     const wordList = type === "trash" ? trashWords : natureWords;
//     const word = wordList[Math.floor(Math.random() * wordList.length)];

//     let position;
//     let isOnSnakeOrItem = true;

//     while (isOnSnakeOrItem) {
//       position = {
//         x: Math.floor(Math.random() * gridSize),
//         y: Math.floor(Math.random() * gridSize),
//       };

//       isOnSnakeOrItem =
//         snake.some((s) => s.x === position.x && s.y === position.y) ||
//         items.some((i) => i.x === position.x && i.y === position.y);
//     }

//     setItems((prev) => [...prev, { ...position, type, word }]);
//   };

//   const drawGame = (ctx) => {
//     ctx.clearRect(0, 0, canvasSize, canvasSize);
//     ctx.fillStyle = "#e8d6bf";
//     ctx.fillRect(0, 0, canvasSize, canvasSize);

//     ctx.fillStyle = "#007f5f";
//     snake.forEach((segment) => {
//       ctx.fillRect(
//         segment.x * tileSize,
//         segment.y * tileSize,
//         tileSize,
//         tileSize
//       );
//     });
//   };

//   const handleRestart = () => {
//     setSnake([{ x: 8, y: 8 }]);
//     setDirection({ x: 1, y: 0 });
//     setScore(0);
//     setLevel(1);
//     setSpeed(150);
//     setGameOver(false);
//     setItems([]);
//     spawnItem();
//   };

//   return (
//     <div className="flex flex-col items-center pt-8 font-sans">
//       <h1 className="text-2xl mb-4">🐍 Eco Cleanup Snake Game</h1>
//       <div
//         className="relative"
//         style={{ width: canvasSize, height: canvasSize }}
//       >
//         <canvas
//           ref={canvasRef}
//           width={canvasSize}
//           height={canvasSize}
//           style={{ position: "absolute", zIndex: 0, border: "2px solid #333" }}
//         />
//         {items.map((item, index) => (
//           <div
//             key={index}
//             className={`absolute flex items-center justify-center text-white text-xs font-semibold rounded w-[${tileSize}px] h-[${tileSize}px] transition-all duration-300
//               ${
//                 item.type === "trash"
//                   ? "bg-red-500 animate-pulse"
//                   : "bg-primary-700 animate-bounce"
//               }`}
//             style={{
//               top: `${item.y * tileSize}px`,
//               left: `${item.x * tileSize}px`,
//               zIndex: 10,
//             }}
//           >
//             {item.word}
//           </div>
//         ))}
//       </div>
//       <div className="mt-4 text-lg">
//         Score: <span className="font-bold">{score}</span>
//       </div>
//       <div className="text-lg">
//         Level: <span className="font-bold">{level}</span>
//       </div>
//       {gameOver && (
//         <div className="mt-4 text-red-700 text-center">
//           <h2 className="text-xl font-bold">Game Over!</h2>
//           <p className="text-base">Final score: {score}</p>
//           <button
//             onClick={handleRestart}
//             className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
//           >
//             Play Again
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SnakeGame;
