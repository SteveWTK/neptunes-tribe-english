"use client";

/**
 * RiveCharacterInner - Stub component
 *
 * This is a placeholder that will be replaced when @rive-app/react-webgl2 is installed.
 *
 * TO ENABLE RIVE ANIMATIONS:
 * 1. Run: npm install @rive-app/react-webgl2
 * 2. Replace this file with the actual Rive implementation (see below)
 *
 * ACTUAL IMPLEMENTATION (uncomment after installing Rive):
 * ```
 * import { useEffect } from "react";
 * import { useRive, useStateMachineInput } from "@rive-app/react-webgl2";
 *
 * export default function RiveCharacterInner({
 *   src,
 *   stateMachine,
 *   artboard,
 *   className,
 *   onLoad,
 *   onInputsReady,
 *   onRiveReady,
 * }) {
 *   const { rive, RiveComponent } = useRive({
 *     src,
 *     stateMachines: stateMachine,
 *     artboard,
 *     autoplay: true,
 *     onLoad: () => onLoad?.(),
 *   });
 *
 *   const correctInput = useStateMachineInput(rive, stateMachine, "correct");
 *   const wrongInput = useStateMachineInput(rive, stateMachine, "wrong");
 *   const celebrateInput = useStateMachineInput(rive, stateMachine, "celebrate");
 *   const thinkingInput = useStateMachineInput(rive, stateMachine, "thinking");
 *
 *   useEffect(() => {
 *     onInputsReady?.({
 *       correct: correctInput,
 *       wrong: wrongInput,
 *       celebrate: celebrateInput,
 *       thinking: thinkingInput,
 *     });
 *   }, [correctInput, wrongInput, celebrateInput, thinkingInput, onInputsReady]);
 *
 *   useEffect(() => {
 *     onRiveReady?.(rive);
 *   }, [rive, onRiveReady]);
 *
 *   return <RiveComponent className={className} />;
 * }
 * ```
 */

import { useEffect } from "react";

export default function RiveCharacterInner({
  className,
  onLoad,
  onInputsReady,
  onRiveReady,
}) {
  // Stub - notify parent that we're "loaded" but with no real functionality
  useEffect(() => {
    onInputsReady?.({});
    onRiveReady?.(null);
    onLoad?.();
  }, [onLoad, onInputsReady, onRiveReady]);

  return (
    <div
      className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 rounded-lg`}
    >
      <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
        Install Rive for animations
      </span>
    </div>
  );
}
