import React, { useState, useRef, useEffect } from "react";
import { Play, RotateCcw, Volume2, CheckCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/components/AuthProvider";

export default function InteractiveVocabGame({
  gameConfig,
  lessonId,
  onComplete,
}) {
  const { user } = useAuth();
  const { t } = useTranslation(user);
  // Create unique localStorage key for this lesson and component
  const STORAGE_KEY = `lesson-${lessonId}-interactiveGame-progress`;

  // Initialize state with localStorage data if available
  const [currentCommand, setCurrentCommand] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.currentCommand || 0;
        } catch (e) {
          console.error("Error loading saved progress:", e);
        }
      }
    }
    return 0;
  });

  const [score, setScore] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.score || 0;
        } catch {}
      }
    }
    return 0;
  });

  const [gameState, setGameState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.gameState || "ready";
        } catch {}
      }
    }
    return "ready";
  });

  const [ballPosition, setBallPosition] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.ballPosition || { x: 200, y: 350 };
        } catch {}
      }
    }
    return { x: 200, y: 350 };
  });

  const [showTranslation, setShowTranslation] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastClickCorrect, setLastClickCorrect] = useState(false);
  const [hasPlayedCommand, setHasPlayedCommand] = useState(false);
  const audioRef = useRef(null);

  // Save progress to localStorage whenever relevant state changes
  useEffect(() => {
    if (typeof window !== "undefined" && gameState !== "completed") {
      const progressData = {
        currentCommand,
        score,
        gameState,
        ballPosition,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
    }
  }, [currentCommand, score, gameState, ballPosition, STORAGE_KEY]);

  // Auto-play next command after correct answer
  useEffect(() => {
    if (gameState === "ready" && currentCommand > 0 && !hasPlayedCommand) {
      // Auto-play after a short delay when ready for next command
      const timer = setTimeout(() => {
        playCommand();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [gameState, currentCommand, hasPlayedCommand]);

  // Clear localStorage when game is completed or reset
  useEffect(() => {
    if (gameState === "completed") {
      if (typeof window !== "undefined") {
        // Delay clearing to allow final state to be saved
        setTimeout(() => {
          localStorage.removeItem(STORAGE_KEY);
        }, 2000);
      }
    }
  }, [gameState, STORAGE_KEY]);

  const commands = gameConfig.commands || [];
  const currentCmd = commands[currentCommand];

  const playCommand = async () => {
    setAudioLoading(true);
    setShowFeedback(false);

    try {
      const audioUrl = await generateCommandAudio(currentCmd);
      if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Failed to play command audio:", error);
    } finally {
      setAudioLoading(false);
      setGameState("playing");
      setHasPlayedCommand(true);
    }
  };

  const handleTargetClick = (targetId) => {
    if (gameState !== "playing") return;

    const isCorrect = targetId === currentCmd.target;
    setLastClickCorrect(isCorrect);
    setShowFeedback(true);

    if (isCorrect) {
      // Correct answer
      setScore((prev) => prev + 1);
      animateBallToTarget(targetId);

      setTimeout(() => {
        setShowFeedback(false);
        if (currentCommand + 1 < commands.length) {
          setCurrentCommand((prev) => prev + 1);
          setHasPlayedCommand(false); // Reset for next command
          setGameState("ready");
          // setBallPosition({ x: 200, y: 350 }); // Reset ball to center
        } else {
          setGameState("completed");
          if (onComplete) {
            const xpEarned =
              Math.round(((score + 1) / commands.length) * 50) + 20;
            onComplete(xpEarned);
          }
        }
      }, 2000);
    } else {
      // Wrong answer - show feedback then allow retry
      setTimeout(() => {
        setShowFeedback(false);
      }, 1500);
    }
  };

  const animateBallToTarget = (targetId) => {
    const targetPositions = {
      goalkeeper: { x: 200, y: 550 },
      "center-back": { x: 200, y: 480 },
      "left-back": { x: 100, y: 450 },
      "right-back": { x: 300, y: 450 },
      midfielder: { x: 200, y: 300 },
      "left-winger": { x: 60, y: 200 },
      "right-winger": { x: 340, y: 200 },
      striker: { x: 200, y: 120 },
      goal: { x: 200, y: 10 },
      "penalty-box": { x: 50, y: 87 },
      "centre-circle": { x: 50, y: 50 },
      "goal-posts": { x: 50, y: 97 },
      corner: { x: 25, y: 575 },
      "touch-line": { x: 92, y: 75 },
    };

    const target = targetPositions[targetId];
    if (target) {
      setBallPosition(target);
    }
  };

  const resetGame = () => {
    // Clear localStorage when resetting
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setCurrentCommand(0);
    setScore(0);
    setGameState("ready");
    setBallPosition({ x: 200, y: 350 });
    setShowFeedback(false);
    setShowTranslation(false);
    setHasPlayedCommand(false);
  };

  return (
    <div className="interactive-game-container">
      <div className="game-header mb-4">
        <div className="flex justify-between items-center">
          <div>
            {/* <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pass the Ball Game
            </h3> */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Command {currentCommand + 1} of {commands.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
            <p className="text-2xl font-bold text-accent-600">
              {score}/{commands.length}
            </p>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="game-controls mb-4 text-center">
        {gameState === "ready" && (
          <div>
            <button
              onClick={playCommand}
              disabled={audioLoading}
              data-autoplay-next={currentCommand > 0}
              className="bg-accent-600 text-white px-6 py-3 rounded-lg hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto transition-colors"
            >
              {audioLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              <span>
                {audioLoading ? t("loading") : t("listen_to_command")}
              </span>
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {t("click_where_ball_should_go")}
            </p>
          </div>
        )}

        {gameState === "playing" && (
          <div>
            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg mb-3">
              <p className="text-lg font-semibold text-primary-900 dark:text-white mb-2">
                &quot;{currentCmd.text}&quot;
              </p>
              <div className="flex justify-center space-x-3 mt-2">
                <button
                  onClick={playCommand}
                  disabled={audioLoading}
                  className="text-premium-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm flex items-center space-x-1 px-3 py-1 rounded hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  {audioLoading ? (
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                  <span>
                    {audioLoading ? t("loading") : t("Ouça novamente")}
                  </span>
                </button>
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm flex items-center space-x-1 px-3 py-1 rounded hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <span>
                    {showTranslation ? "Esconda" : "Mostre"} a tradução
                  </span>
                </button>
              </div>
              {showTranslation && (
                <p className="text-accent-800 dark:text-accent-400 font-bold italic mt-2">
                  {currentCmd.translation}
                </p>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Clique onde a bola deve ir!
            </p>

            {/* Feedback message */}
            {showFeedback && (
              <div
                className={`mt-3 p-3 rounded-lg ${
                  lastClickCorrect
                    ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                    : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                }`}
              >
                <p className="font-semibold">
                  {lastClickCorrect
                    ? `✅ ${currentCmd.success_message || t("great_pass")}`
                    : `❌ ${t("try_again_listen")}`}
                </p>
                {!lastClickCorrect && (
                  <button
                    onClick={playCommand}
                    disabled={audioLoading}
                    className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors flex items-center space-x-1 mx-auto"
                  >
                    {audioLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                    <span>
                      {audioLoading ? t("loading") : t("listen_again")}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {gameState === "completed" && (
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-lg">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                Great Job! 🎉
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t("you_completed")} {score} {t("out_of")} {commands.length}{" "}
                {t("commands_correctly")}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetGame}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t("play_again")}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Game Field */}
      <div className="game-field">
        <svg
          viewBox="0 0 400 600"
          className="w-full max-w-md mx-auto border-2 border-green-600 bg-gradient-to-b from-green-400 to-green-500 rounded-lg"
        >
          {/* Football pitch background */}
          <rect width="400" height="600" fill="url(#grassPattern)" />

          {/* Grass pattern */}
          <defs>
            <pattern
              id="grassPattern"
              x="0"
              y="0"
              width="400"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <rect width="400" height="30" fill="#4ade80" />
              <rect y="30" width="400" height="30" fill="#22c55e" />
            </pattern>
          </defs>

          {/* Field markings */}
          {/* Penalty area - defense */}
          <rect
            x="80"
            y="480"
            width="240"
            height="120"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          {/* Penalty area - attack */}
          <rect
            x="80"
            y="0"
            width="240"
            height="120"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          {/* Goal area - defense */}
          <rect
            x="160"
            y="540"
            width="80"
            height="60"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          {/* Goal area - attack */}
          <rect
            x="160"
            y="0"
            width="80"
            height="60"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          {/* Center circle */}
          <circle
            cx="200"
            cy="300"
            r="50"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          {/* Center line */}
          <line
            x1="0"
            y1="300"
            x2="400"
            y2="300"
            stroke="white"
            strokeWidth="2"
          />
          {/* Center spot */}
          <circle cx="200" cy="300" r="3" fill="white" />

          {/* Clickable targets */}
          {/* Goal */}
          <g onClick={() => handleTargetClick("goal")}>
            <rect
              x="160"
              y="0"
              width="80"
              height="30"
              fill="#fbbf24"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:fill-yellow-300 transition-colors"
            />
            <text
              x="200"
              y="20"
              textAnchor="middle"
              className="text-xs font-bold fill-black pointer-events-none"
            >
              GOAL
            </text>
          </g>

          {/* Striker */}
          <g onClick={() => handleTargetClick("striker")}>
            <circle
              cx="200"
              cy="120"
              r="25"
              fill="#ef4444"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:fill-red-400 transition-colors"
            />
            <text
              x="200"
              y="125"
              textAnchor="middle"
              className="text-sm font-bold fill-white pointer-events-none"
            >
              ST
            </text>
          </g>

          {/* Midfielder */}
          <g onClick={() => handleTargetClick("midfielder")}>
            <circle
              cx="200"
              cy="300"
              r="25"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-400 transition-colors"
            />
            <text
              x="200"
              y="305"
              textAnchor="middle"
              className="text-sm font-bold fill-white pointer-events-none"
            >
              MF
            </text>
          </g>

          {/* Left Winger */}
          <g onClick={() => handleTargetClick("left-winger")}>
            <circle
              cx="60"
              cy="200"
              r="25"
              fill="#8b5cf6"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:fill-purple-400 transition-colors"
            />
            <text
              x="60"
              y="205"
              textAnchor="middle"
              className="text-sm font-bold fill-white pointer-events-none"
            >
              LW
            </text>
          </g>

          {/* Right Winger */}
          <g onClick={() => handleTargetClick("right-winger")}>
            <circle
              cx="340"
              cy="200"
              r="25"
              fill="#8b5cf6"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:fill-purple-400 transition-colors"
            />
            <text
              x="340"
              y="205"
              textAnchor="middle"
              className="text-sm font-bold fill-white pointer-events-none"
            >
              RW
            </text>
          </g>

          {/* Center Back */}
          <g onClick={() => handleTargetClick("center-back")}>
            <circle
              cx="200"
              cy="480"
              r="25"
              fill="#10b981"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:fill-emerald-400 transition-colors"
            />
            <text
              x="200"
              y="485"
              textAnchor="middle"
              className="text-sm font-bold fill-white pointer-events-none"
            >
              CB
            </text>
          </g>

          {/* Left Back */}
          <g onClick={() => handleTargetClick("left-back")}>
            <circle
              cx="100"
              cy="450"
              r="25"
              fill="#10b981"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:fill-emerald-400 transition-colors"
            />
            <text
              x="100"
              y="455"
              textAnchor="middle"
              className="text-sm font-bold fill-white pointer-events-none"
            >
              LB
            </text>
          </g>

          {/* Right Back */}
          <g onClick={() => handleTargetClick("right-back")}>
            <circle
              cx="300"
              cy="450"
              r="25"
              fill="#10b981"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:fill-emerald-400 transition-colors"
            />
            <text
              x="300"
              y="455"
              textAnchor="middle"
              className="text-sm font-bold fill-white pointer-events-none"
            >
              RB
            </text>
          </g>

          {/* Goalkeeper */}
          <g onClick={() => handleTargetClick("goalkeeper")}>
            <circle
              cx="200"
              cy="550"
              r="25"
              fill="#f59e0b"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:fill-amber-400 transition-colors"
            />
            <text
              x="200"
              y="555"
              textAnchor="middle"
              className="text-sm font-bold fill-white pointer-events-none"
            >
              GK
            </text>
          </g>
          {/* corner */}
          {/* <g onClick={() => handleTargetClick("corner")}>
            <circle
              cx="25"
              cy="575"
              r="15"
              fill="#475569"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:fill-primary-600 transition-colors"
            />
            <text
              x="200"
              y="555"
              textAnchor="middle"
              className="text-sm font-bold fill-white pointer-events-none"
            ></text>
          </g> */}

          {/* Animated ball */}
          <g
            className="transition-all duration-1000 ease-in-out"
            transform={`translate(${ballPosition.x - 200}, ${ballPosition.y - 350})`}
          >
            <circle
              cx="200"
              cy="350"
              r="10"
              fill="white"
              stroke="black"
              strokeWidth="1"
            />
            {/* Ball pattern */}
            <path
              d="M 200 340 L 195 345 L 195 355 L 200 360 L 205 355 L 205 345 Z"
              fill="black"
              opacity="0.3"
            />
          </g>
        </svg>
      </div>

      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
}

async function generateCommandAudio(command) {
  if (!command) return null;

  // Try pre-recorded audio first
  if (command.audio_url && command.audio_url.startsWith("/audio/")) {
    try {
      const response = await fetch(command.audio_url, { method: "HEAD" });
      if (response.ok) {
        return command.audio_url;
      }
    } catch {
      console.log("Pre-recorded audio not found, falling back to TTS");
    }
  }

  // Generate with TTS
  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: command.text,
        englishVariant: "british",
        voiceGender: "female",
      }),
    });

    if (response.ok) {
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    }
  } catch (error) {
    console.error("TTS generation failed:", error);
  }

  return null;
}
