"use client";
import React, { useRef, useEffect, useState } from "react";

const SnakeGame = () => {
  const canvasRef = useRef(null);

  // Game state
  const gridSize = 20;
  const tileSize = 25;
  const canvasSize = gridSize * tileSize;

  const trashWords = ["can", "plastic", "bag", "wrapper", "bottle"];
  const natureWords = ["turtle", "shell", "starfish", "seaweed", "crab"];

  const [snake, setSnake] = useState([{ x: 8, y: 8 }]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [speed, setSpeed] = useState(150);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const moveInterval = setInterval(() => {
      if (!gameOver) {
        moveSnake();
        drawGame(ctx);
      }
    }, speed);

    return () => clearInterval(moveInterval);
  }, [snake, direction, gameOver, speed]);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      if (!gameOver) {
        spawnItem();
      }
    }, 3000);

    return () => clearInterval(wordInterval);
  }, [items, gameOver]);

  useEffect(() => {
    if (score > 0 && score % 10 === 0) {
      setLevel((prev) => prev + 1);
      setSpeed((prev) => Math.max(50, prev - 20));
      setItems([]);
    }
  }, [score]);

  useEffect(() => {
    const handleKeyDown = (e) => {
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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  const moveSnake = () => {
    const newHead = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };

    if (
      newHead.x < 0 ||
      newHead.y < 0 ||
      newHead.x >= gridSize ||
      newHead.y >= gridSize ||
      snake.some(
        (segment) => segment.x === newHead.x && segment.y === newHead.y
      )
    ) {
      setGameOver(true);
      return;
    }

    let newSnake = [newHead, ...snake];

    const collidedItem = items.find(
      (i) => i.x === newHead.x && i.y === newHead.y
    );

    if (collidedItem) {
      if (collidedItem.type === "trash") {
        setScore((prev) => prev + 1);
        setItems(items.filter((i) => i !== collidedItem));
      } else {
        setGameOver(true);
        return;
      }
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  const spawnItem = () => {
    const type = Math.random() > 0.5 ? "trash" : "nature";
    const wordList = type === "trash" ? trashWords : natureWords;
    const word = wordList[Math.floor(Math.random() * wordList.length)];

    let position;
    let isOnSnakeOrItem = true;

    while (isOnSnakeOrItem) {
      position = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };

      isOnSnakeOrItem =
        snake.some((s) => s.x === position.x && s.y === position.y) ||
        items.some((i) => i.x === position.x && i.y === position.y);
    }

    setItems((prev) => [...prev, { ...position, type, word }]);
  };

  const drawGame = (ctx) => {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = "#e8d6bf";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.fillStyle = "#007f5f";
    snake.forEach((segment) => {
      ctx.fillRect(
        segment.x * tileSize,
        segment.y * tileSize,
        tileSize,
        tileSize
      );
    });
  };

  const handleRestart = () => {
    setSnake([{ x: 8, y: 8 }]);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setLevel(1);
    setSpeed(150);
    setGameOver(false);
    setItems([]);
    spawnItem();
  };

  return (
    <div className="flex flex-col items-center pt-8 font-sans">
      <h1 className="text-2xl mb-4">🐍 Eco Cleanup Snake Game</h1>
      <div
        className="relative"
        style={{ width: canvasSize, height: canvasSize }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{ position: "absolute", zIndex: 0, border: "2px solid #333" }}
        />
        {items.map((item, index) => (
          <div
            key={index}
            className={`absolute flex items-center justify-center text-white text-xs font-semibold rounded w-[${tileSize}px] h-[${tileSize}px] transition-all duration-300
              ${
                item.type === "trash"
                  ? "bg-red-500 animate-pulse"
                  : "bg-primary-700 animate-bounce"
              }`}
            style={{
              top: `${item.y * tileSize}px`,
              left: `${item.x * tileSize}px`,
              zIndex: 10,
            }}
          >
            {item.word}
          </div>
        ))}
      </div>
      <div className="mt-4 text-lg">
        Score: <span className="font-bold">{score}</span>
      </div>
      <div className="text-lg">
        Level: <span className="font-bold">{level}</span>
      </div>
      {gameOver && (
        <div className="mt-4 text-red-700 text-center">
          <h2 className="text-xl font-bold">Game Over!</h2>
          <p className="text-base">Final score: {score}</p>
          <button
            onClick={handleRestart}
            className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;

// "use client";
// import React, { useRef, useEffect, useState } from "react";

// const SnakeGame = () => {
//   const canvasRef = useRef(null);

//   // Game state
//   const gridSize = 20;
//   const tileSize = 25;
//   const canvasSize = gridSize * tileSize;

//   const trashWords = ["can", "plastic", "bag", "wrapper", "bottle"];
//   const natureWords = ["turtle", "shell", "starfish", "seaweed"];

//   const [snake, setSnake] = useState([{ x: 8, y: 8 }]);
//   const [direction, setDirection] = useState({ x: 1, y: 0 });
//   const [items, setItems] = useState([]);
//   // will hold the current trash/nature item
//   const [score, setScore] = useState(0);
//   const [gameOver, setGameOver] = useState(false);

//   // Snake movement and rendering
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     const moveInterval = setInterval(() => {
//       if (!gameOver) {
//         moveSnake();
//         drawGame(ctx);
//       }
//     }, 150);

//     return () => clearInterval(moveInterval);
//   }, [snake, direction, gameOver]);

//   // Word spawning every 3 seconds
//   useEffect(() => {
//     const wordInterval = setInterval(() => {
//       if (!gameOver) {
//         spawnItem();
//       }
//     }, 3000);

//     return () => clearInterval(wordInterval);
//   }, [items, gameOver]); // ✅ include items here

//   // Handle keyboard arrow input
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

//   // Move snake one step forward
//   const moveSnake = () => {
//     const newHead = {
//       x: snake[0].x + direction.x,
//       y: snake[0].y + direction.y,
//     };

//     // Wall collision check
//     if (
//       newHead.x < 0 ||
//       newHead.y < 0 ||
//       newHead.x >= gridSize ||
//       newHead.y >= gridSize
//     ) {
//       setGameOver(true);
//       return;
//     }

//     // Self-collision check
//     if (
//       snake.some(
//         (segment) => segment.x === newHead.x && segment.y === newHead.y
//       )
//     ) {
//       setGameOver(true);
//       return;
//     }

//     let newSnake = [newHead, ...snake];

//     // Collision with item
//     const collidedItem = items.find(
//       (i) => i.x === newHead.x && i.y === newHead.y
//     );

//     if (collidedItem) {
//       if (collidedItem.type === "trash") {
//         setScore(score + 1);
//         setItems(items.filter((i) => i !== collidedItem)); // Remove it
//       } else {
//         setGameOver(true); // Hit nature
//         return;
//       }
//     } else {
//       // No collision: snake moves normally, so remove tail
//       newSnake.pop();
//     }

//     setSnake(newSnake);
//   };

//   // Generate a new item
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

//   // Draw everything on canvas
//   const drawGame = (ctx) => {
//     ctx.clearRect(0, 0, canvasSize, canvasSize);

//     // Background
//     ctx.fillStyle = "#e3e286";
//     ctx.fillRect(0, 0, canvasSize, canvasSize);

//     // Snake
//     ctx.fillStyle = "#007f5f";
//     snake.forEach((segment) => {
//       ctx.fillRect(
//         segment.x * tileSize,
//         segment.y * tileSize,
//         tileSize,
//         tileSize
//       );
//     });

//     // Item
//     items.forEach((item) => {
//       ctx.fillStyle = item.type === "trash" ? "#ff6b6b" : "#2c7a7b";
//       ctx.fillRect(item.x * tileSize, item.y * tileSize, tileSize, tileSize);

//       ctx.fillStyle = "#fff";
//       ctx.font = "12px Arial";
//       ctx.textAlign = "center";
//       ctx.fillText(
//         item.word,
//         item.x * tileSize + tileSize / 2,
//         item.y * tileSize + tileSize / 1.5
//       );
//     });
//   };

//   // Restart game
//   const handleRestart = () => {
//     setSnake([{ x: 8, y: 8 }]);
//     setDirection({ x: 1, y: 0 });
//     setScore(0);
//     setGameOver(false);
//     spawnItem();
//   };

//   return (
//     <div className="flex flex-col items-center pt-8 font-sans">
//       <h1 className="text-2xl mb-4">🐍 Eco Cleanup Snake Game</h1>
//       <canvas
//         ref={canvasRef}
//         width={canvasSize}
//         height={canvasSize}
//         style={{ border: "2px solid #333", backgroundColor: "#f7f6f3" }}
//       />
//       <div className="mt-4 text-lg">
//         Score: <span className="font-bold">{score}</span>
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
