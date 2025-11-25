"use client";

import SnakeGame from "@/components/SnakeGame";
import { GAME_VARIANTS } from "@/data/snakeGameThemes";
import { useState } from "react";

export default function EcoSnakeGame() {
  const [selectedVariant, setSelectedVariant] = useState("eco_cleanup");

  return (
    <div className="m-4 flex flex-col justify-start items-center">
      {/* Variant Selector */}
      <div className="p-2 rounded-xl">
        <h2 className="text-lg font-semibold mb-3">Choose Game Mode:</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(GAME_VARIANTS).map(([key, variant]) => (
            <button
              key={key}
              onClick={() => setSelectedVariant(key)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedVariant === key
                  ? "bg-teal-900 text-white shadow-lg"
                  : "bg-primary-800 border-2 border-gray-300 hover:border-teal-400"
              }`}
            >
              <div className="font-semibold">{variant.name}</div>
              <div className="text-xs opacity-80">{variant.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Game Component */}
      <SnakeGame key={selectedVariant} variant={selectedVariant} />
    </div>
  );
}
