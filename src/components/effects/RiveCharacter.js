"use client";

/**
 * RiveCharacter - A wrapper for Rive animated characters
 *
 * This component provides an easy way to display and control Rive animations
 * for species companions (Neptune's Tribe) or coach characters (FieldTalk).
 *
 * SETUP:
 * 1. Install: npm install @rive-app/react-webgl2
 * 2. Create your .riv file in Rive editor (rive.app)
 * 3. Place the .riv file in /public/animations/
 * 4. Use this component with the appropriate state triggers
 *
 * STATE MACHINE SETUP IN RIVE:
 * Your .riv file should have a state machine with these trigger inputs:
 * - "correct" (trigger): Fire when user gets correct answer
 * - "wrong" (trigger): Fire when user gets wrong answer
 * - "celebrate" (trigger): Fire for celebrations
 * - "thinking" (boolean): Set to true when showing a question
 *
 * @example
 * ```jsx
 * import RiveCharacter from './effects/RiveCharacter';
 *
 * function GameComponent() {
 *   const characterRef = useRef();
 *
 *   const onCorrectAnswer = () => {
 *     characterRef.current?.triggerCorrect();
 *   };
 *
 *   return (
 *     <RiveCharacter
 *       ref={characterRef}
 *       src="/animations/turtle-companion.riv"
 *       stateMachine="MainStateMachine"
 *       className="w-32 h-32"
 *     />
 *   );
 * }
 * ```
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import dynamic from "next/dynamic";

/**
 * RiveCharacter - Main export
 *
 * This is a placeholder component that shows a fallback until Rive is installed.
 * Once @rive-app/react-webgl2 is installed, it will dynamically load the real component.
 */
const RiveCharacter = forwardRef(function RiveCharacter(
  {
    src,
    stateMachine = "State Machine 1",
    artboard,
    className = "",
    fallback = null,
    onLoad,
    onError,
  },
  ref
) {
  const [riveAvailable, setRiveAvailable] = useState(false);
  const [checkComplete, setCheckComplete] = useState(false);
  const inputsRef = useRef({});
  const riveRef = useRef(null);

  // Check if Rive is installed
  useEffect(() => {
    let mounted = true;

    const checkRive = async () => {
      try {
        // Try to import Rive to check if it's installed
        await import("@rive-app/react-webgl2");
        if (mounted) {
          setRiveAvailable(true);
        }
      } catch (e) {
        console.warn(
          "Rive not installed. To enable character animations, run: npm install @rive-app/react-webgl2"
        );
        if (mounted) {
          onError?.("Rive library not available");
        }
      } finally {
        if (mounted) {
          setCheckComplete(true);
        }
      }
    };

    checkRive();
    return () => {
      mounted = false;
    };
  }, [onError]);

  // Expose methods via ref
  useImperativeHandle(
    ref,
    () => ({
      triggerCorrect: () => {
        inputsRef.current.correct?.fire?.();
      },
      triggerWrong: () => {
        inputsRef.current.wrong?.fire?.();
      },
      triggerCelebrate: () => {
        inputsRef.current.celebrate?.fire?.();
      },
      setThinking: (value) => {
        if (inputsRef.current.thinking) {
          inputsRef.current.thinking.value = value;
        }
      },
      getRive: () => riveRef.current,
    }),
    []
  );

  const handleInputsReady = useCallback((inputs) => {
    inputsRef.current = inputs;
  }, []);

  const handleRiveReady = useCallback((rive) => {
    riveRef.current = rive;
  }, []);

  // Still checking if Rive is available
  if (!checkComplete) {
    return fallback || <div className={className} />;
  }

  // Rive not available - show fallback
  if (!riveAvailable) {
    return (
      fallback || (
        <div
          className={`${className} flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg`}
        >
          <span className="text-xs text-gray-400">Animation</span>
        </div>
      )
    );
  }

  // Rive is available - render the actual Rive component
  // Using dynamic import to load the Rive-specific component
  const RiveInner = dynamic(() => import("./RiveCharacterInner"), {
    ssr: false,
    loading: () => fallback || <div className={className} />,
  });

  return (
    <RiveInner
      src={src}
      stateMachine={stateMachine}
      artboard={artboard}
      className={className}
      onLoad={onLoad}
      onInputsReady={handleInputsReady}
      onRiveReady={handleRiveReady}
    />
  );
});

export default RiveCharacter;

/**
 * RIVE FILE CREATION GUIDE
 *
 * To create a species companion animation:
 *
 * 1. Go to rive.app and create a new file
 *
 * 2. Design your character with these layers:
 *    - Body (main shape)
 *    - Eyes (for expressions)
 *    - Mouth (optional, for reactions)
 *    - Extras (fins, wings, antennae, etc.)
 *
 * 3. Create these animations:
 *    - "idle": Subtle breathing/floating loop (2-3 seconds)
 *    - "happy": Quick bounce or wiggle (0.5 seconds)
 *    - "sad": Slight droop or shake (0.5 seconds)
 *    - "excited": Bigger celebration movement (1 second)
 *    - "thinking": Looking side to side or blinking (1.5 seconds)
 *
 * 4. Create a State Machine called "MainStateMachine":
 *    - Add trigger inputs: "correct", "wrong", "celebrate"
 *    - Add boolean input: "thinking"
 *    - Set "idle" as the default state
 *    - Add transitions:
 *      - idle -> happy (on "correct" trigger)
 *      - idle -> sad (on "wrong" trigger)
 *      - idle -> excited (on "celebrate" trigger)
 *      - idle -> thinking (when "thinking" is true)
 *      - All states -> idle (after animation completes)
 *
 * 5. Export as .riv file and place in /public/animations/
 *
 * Example species for Neptune's Tribe:
 * - turtle-companion.riv (Sea Turtle)
 * - dolphin-companion.riv (Dolphin)
 * - owl-companion.riv (Forest Owl)
 * - fox-companion.riv (Forest Fox)
 *
 * Example characters for FieldTalk:
 * - coach-character.riv (Football Coach)
 * - player-character.riv (Generic Player)
 * - referee-character.riv (Referee)
 */
