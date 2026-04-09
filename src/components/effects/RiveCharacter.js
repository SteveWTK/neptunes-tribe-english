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
} from "react";

// Lazy load Rive to avoid SSR issues and reduce initial bundle
let useRive, useStateMachineInput;
let riveLoaded = false;

const loadRive = async () => {
  if (riveLoaded) return true;
  try {
    const rive = await import("@rive-app/react-webgl2");
    useRive = rive.useRive;
    useStateMachineInput = rive.useStateMachineInput;
    riveLoaded = true;
    return true;
  } catch (e) {
    console.warn("Rive not installed. Run: npm install @rive-app/react-webgl2");
    return false;
  }
};

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [RiveComponent, setRiveComponent] = useState(null);
  const [riveInstance, setRiveInstance] = useState(null);
  const [inputs, setInputs] = useState({});

  // Load Rive dynamically
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const loaded = await loadRive();
      if (!mounted) return;

      if (!loaded) {
        setHasError(true);
        onError?.("Rive library not available");
        return;
      }

      // Now we can use the Rive hooks via a wrapper component
      setIsLoaded(true);
    };

    init();
    return () => {
      mounted = false;
    };
  }, [onError]);

  // Expose methods via ref
  useImperativeHandle(
    ref,
    () => ({
      triggerCorrect: () => {
        inputs.correct?.fire();
      },
      triggerWrong: () => {
        inputs.wrong?.fire();
      },
      triggerCelebrate: () => {
        inputs.celebrate?.fire();
      },
      setThinking: (value) => {
        if (inputs.thinking) {
          inputs.thinking.value = value;
        }
      },
      getRive: () => riveInstance,
    }),
    [inputs, riveInstance]
  );

  if (hasError) {
    return fallback || <div className={className}>Animation unavailable</div>;
  }

  if (!isLoaded) {
    return fallback || <div className={className}>Loading...</div>;
  }

  // Render the actual Rive component
  return (
    <RiveWrapper
      src={src}
      stateMachine={stateMachine}
      artboard={artboard}
      className={className}
      onLoad={onLoad}
      onInputsReady={setInputs}
      onRiveReady={setRiveInstance}
    />
  );
});

// Inner component that uses Rive hooks (only rendered after Rive is loaded)
function RiveWrapper({
  src,
  stateMachine,
  artboard,
  className,
  onLoad,
  onInputsReady,
  onRiveReady,
}) {
  // This will be null on first render before Rive loads
  if (!useRive) {
    return <div className={className}>Loading Rive...</div>;
  }

  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: stateMachine,
    artboard,
    autoplay: true,
    onLoad: () => {
      onLoad?.();
    },
  });

  // Get state machine inputs
  const correctInput = useStateMachineInput(rive, stateMachine, "correct");
  const wrongInput = useStateMachineInput(rive, stateMachine, "wrong");
  const celebrateInput = useStateMachineInput(rive, stateMachine, "celebrate");
  const thinkingInput = useStateMachineInput(rive, stateMachine, "thinking");

  useEffect(() => {
    onInputsReady({
      correct: correctInput,
      wrong: wrongInput,
      celebrate: celebrateInput,
      thinking: thinkingInput,
    });
  }, [correctInput, wrongInput, celebrateInput, thinkingInput, onInputsReady]);

  useEffect(() => {
    onRiveReady(rive);
  }, [rive, onRiveReady]);

  return <RiveComponent className={className} />;
}

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
