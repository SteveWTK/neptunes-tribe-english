/**
 * Visual Effects Components
 *
 * This module provides visual enhancement tools for games and interactive content.
 *
 * INSTALLATION:
 * npm install pixi.js @rive-app/react-webgl2
 *
 * QUICK START:
 *
 * 1. For particle effects (Pixi.js):
 *    ```jsx
 *    import { PixiEffectsProvider, usePixiEffects } from '@/components/effects';
 *
 *    function MyGame() {
 *      const { triggerCelebration, triggerCollect } = usePixiEffects();
 *      // ...
 *    }
 *
 *    <PixiEffectsProvider width={500} height={500}>
 *      <MyGame />
 *    </PixiEffectsProvider>
 *    ```
 *
 * 2. For character animations (Rive):
 *    ```jsx
 *    import { RiveCharacter } from '@/components/effects';
 *
 *    const characterRef = useRef();
 *
 *    <RiveCharacter
 *      ref={characterRef}
 *      src="/animations/companion.riv"
 *      className="w-24 h-24"
 *    />
 *
 *    // Trigger animations:
 *    characterRef.current?.triggerCorrect();
 *    characterRef.current?.triggerCelebrate();
 *    ```
 *
 * 3. For enhanced Word Snake:
 *    ```jsx
 *    import { WordSnakeWithEffects } from '@/components/effects';
 *
 *    <WordSnakeWithEffects customClues={myClues} />
 *    ```
 */

export {
  PixiEffectsProvider,
  usePixiEffects,
} from "./PixiEffectsProvider";

export { default as RiveCharacter } from "./RiveCharacter";

export { default as WordSnakeWithEffects } from "./WordSnakeWithEffects";
