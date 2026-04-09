"use client";

/**
 * WordSnakeWithEffects - Example integration of Pixi effects with Word Snake
 *
 * This demonstrates how to wrap the existing WordSnakeGame with visual effects
 * without modifying the core game logic.
 *
 * USAGE:
 * Replace: import WordSnakeGame from '@/components/WordSnakeGame'
 * With:    import WordSnakeWithEffects from '@/components/effects/WordSnakeWithEffects'
 *
 * The effects will automatically trigger based on game events.
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { PixiEffectsProvider, usePixiEffects } from "./PixiEffectsProvider";

// Dynamically import the original game to avoid SSR issues
const WordSnakeGame = dynamic(() => import("../WordSnakeGame"), {
  ssr: false,
  loading: () => (
    <div className="w-[500px] h-[500px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Loading game...</span>
    </div>
  ),
});

// Inner component that has access to effects context
function WordSnakeWithEffectsInner({ customClues, onGameEvent }) {
  const { triggerCelebration, triggerCollect, triggerTrail, isReady } =
    usePixiEffects();
  const lastScoreRef = useRef(0);
  const lastLevelRef = useRef(1);

  // This is a proof-of-concept showing how to hook into game events
  // In a full implementation, you would modify WordSnakeGame to accept
  // callback props for onCorrectLetter, onWrongLetter, onLevelComplete, etc.

  // For now, we demonstrate the effect triggers:
  useEffect(() => {
    if (!isReady) return;

    // Demo: Trigger celebration on mount to show effects work
    const timer = setTimeout(() => {
      triggerCollect(250, 250, "correct");
    }, 1000);

    return () => clearTimeout(timer);
  }, [isReady, triggerCollect]);

  return (
    <WordSnakeGame
      customClues={customClues}
      // Future enhancement: Add these callback props to WordSnakeGame
      // onCorrectLetter={(x, y) => triggerCollect(x, y, 'correct')}
      // onWrongLetter={(x, y) => triggerCollect(x, y, 'wrong')}
      // onLevelComplete={() => triggerCelebration()}
      // onSnakeMove={(x, y) => triggerTrail(x, y)}
    />
  );
}

// Main export - wraps game with effects provider
export default function WordSnakeWithEffects({ customClues = null }) {
  return (
    <PixiEffectsProvider width={500} height={500} className="mx-auto">
      <WordSnakeWithEffectsInner customClues={customClues} />
    </PixiEffectsProvider>
  );
}

/**
 * INTEGRATION GUIDE
 *
 * To fully integrate effects with WordSnakeGame, add these callback props:
 *
 * 1. In WordSnakeGame.js, add props:
 *    ```
 *    export default function WordSnakeGame({
 *      customClues = null,
 *      onCorrectLetter,    // (x, y, letter) => void
 *      onWrongLetter,      // (x, y, letter) => void
 *      onEraserCollect,    // (x, y) => void
 *      onLevelComplete,    // (level, score) => void
 *      onGameOver,         // (finalScore) => void
 *      onSnakeMove,        // (headX, headY) => void
 *    }) {
 *    ```
 *
 * 2. Call callbacks at appropriate points:
 *    - After collecting correct letter: onCorrectLetter?.(head.x * TILE, head.y * TILE, letter)
 *    - After collecting wrong letter: onWrongLetter?.(head.x * TILE, head.y * TILE, letter)
 *    - After level completion: onLevelComplete?.(level, score)
 *    - In movement loop: onSnakeMove?.(head.x * TILE, head.y * TILE)
 *
 * 3. In this wrapper, connect to effects:
 *    ```
 *    <WordSnakeGame
 *      onCorrectLetter={(x, y) => {
 *        triggerCollect(x, y, 'correct');
 *        companionRef.current?.triggerCorrect();
 *      }}
 *      onLevelComplete={() => {
 *        triggerCelebration();
 *        companionRef.current?.triggerCelebrate();
 *      }}
 *      onSnakeMove={(x, y) => triggerTrail(x, y)}
 *    />
 *    ```
 *
 * THEMED EFFECTS
 *
 * For different worlds/ecosystems, customize particle colors:
 *
 * const worldThemes = {
 *   ocean: {
 *     trailColor: 0x0ea5e9,      // sky blue
 *     celebrationColors: [0x0ea5e9, 0x06b6d4, 0x22d3ee],
 *     ambientParticle: 'bubble',
 *   },
 *   forest: {
 *     trailColor: 0x22c55e,      // green
 *     celebrationColors: [0x22c55e, 0x84cc16, 0xeab308],
 *     ambientParticle: 'leaf',
 *   },
 *   coral: {
 *     trailColor: 0xf472b6,      // pink
 *     celebrationColors: [0xf472b6, 0xfb7185, 0xfda4af],
 *     ambientParticle: 'sparkle',
 *   },
 * };
 */
