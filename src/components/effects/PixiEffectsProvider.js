"use client";

/**
 * PixiEffectsProvider - Provides a shared Pixi.js context for visual effects
 *
 * This is a proof-of-concept for adding particle effects and visual enhancements
 * to games like Word Snake without modifying the core game logic.
 *
 * Usage:
 * 1. Wrap your game component with <PixiEffectsProvider>
 * 2. Use the usePixiEffects() hook to trigger effects
 *
 * @example
 * ```jsx
 * import { PixiEffectsProvider, usePixiEffects } from './effects/PixiEffectsProvider';
 *
 * function MyGame() {
 *   const { triggerCelebration, triggerCollect } = usePixiEffects();
 *
 *   const onCorrectAnswer = () => {
 *     triggerCollect(x, y, 'correct');
 *     triggerCelebration();
 *   };
 * }
 *
 * // In parent:
 * <PixiEffectsProvider width={500} height={500}>
 *   <MyGame />
 * </PixiEffectsProvider>
 * ```
 */

import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";

// Lazy load Pixi to reduce initial bundle
let Application, Container, Graphics;
let pixiLoaded = false;
let pixiLoadFailed = false;

const loadPixi = async () => {
  if (pixiLoaded) return true;
  if (pixiLoadFailed) return false;

  try {
    const pixi = await import("pixi.js");
    Application = pixi.Application;
    Container = pixi.Container;
    Graphics = pixi.Graphics;
    pixiLoaded = true;
    return true;
  } catch (e) {
    console.warn("Pixi.js not installed. To enable effects, run: npm install pixi.js");
    pixiLoadFailed = true;
    return false;
  }
};

const PixiEffectsContext = createContext(null);

export function usePixiEffects() {
  const context = useContext(PixiEffectsContext);
  if (!context) {
    // Return no-op functions if not wrapped in provider
    return {
      triggerCelebration: () => {},
      triggerCollect: () => {},
      triggerTrail: () => {},
      triggerShake: () => {},
      isReady: false,
    };
  }
  return context;
}

// Particle class for the effect system
class Particle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = options.vx || (Math.random() - 0.5) * 8;
    this.vy = options.vy || (Math.random() - 0.5) * 8 - 4;
    this.gravity = options.gravity ?? 0.2;
    this.life = options.life || 1;
    this.decay = options.decay || 0.02;
    this.size = options.size || 6 + Math.random() * 6;
    this.color = options.color || this.randomColor();
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    this.type = options.type || "square";
  }

  randomColor() {
    const colors = [
      0x22c55e, // green
      0x3b82f6, // blue
      0xeab308, // yellow
      0xf97316, // orange
      0xec4899, // pink
      0x8b5cf6, // purple
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life -= this.decay;
    this.rotation += this.rotationSpeed;
    this.vx *= 0.99;
    return this.life > 0;
  }
}

export function PixiEffectsProvider({
  children,
  width = 500,
  height = 500,
  className = "",
}) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const particlesRef = useRef([]);
  const graphicsRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize Pixi application
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const loaded = await loadPixi();
      if (!mounted || !containerRef.current) return;

      // If Pixi failed to load, just mark as ready (effects will be no-ops)
      if (!loaded) {
        setIsReady(true);
        return;
      }

      // Create Pixi application
      const app = new Application();
      await app.init({
        width,
        height,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // Clear any existing canvas
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(app.canvas);

      // Create graphics object for drawing particles
      const graphics = new Graphics();
      app.stage.addChild(graphics);
      graphicsRef.current = graphics;
      appRef.current = app;

      // Animation loop
      app.ticker.add(() => {
        if (!graphicsRef.current) return;

        const g = graphicsRef.current;
        g.clear();

        // Update and draw particles
        particlesRef.current = particlesRef.current.filter((p) => {
          const alive = p.update();
          if (alive) {
            g.circle(p.x, p.y, p.size * p.life);
            g.fill({ color: p.color, alpha: p.life });
          }
          return alive;
        });
      });

      setIsReady(true);
    };

    init();

    return () => {
      mounted = false;
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [width, height]);

  // Effect triggers (no-op if Pixi not loaded)
  const triggerCelebration = useCallback((centerX, centerY) => {
    if (!appRef.current) return; // Pixi not loaded

    const cx = centerX ?? width / 2;
    const cy = centerY ?? height / 2;

    // Create burst of particles
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50 + Math.random() * 0.5;
      const speed = 4 + Math.random() * 6;
      particlesRef.current.push(
        new Particle(cx, cy, {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          gravity: 0.15,
          life: 1,
          decay: 0.015,
          size: 4 + Math.random() * 4,
        })
      );
    }
  }, [width, height]);

  const triggerCollect = useCallback((x, y, type = "correct") => {
    if (!appRef.current) return; // Pixi not loaded

    const count = type === "correct" ? 12 : 6;
    const colors =
      type === "correct"
        ? [0x22c55e, 0x16a34a, 0x15803d] // greens
        : type === "wrong"
          ? [0xef4444, 0xdc2626, 0xb91c1c] // reds
          : [0xfbbf24, 0xf59e0b, 0xd97706]; // ambers for eraser

    for (let i = 0; i < count; i++) {
      particlesRef.current.push(
        new Particle(x, y, {
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 2,
          gravity: 0.1,
          life: 1,
          decay: 0.03,
          size: 3 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      );
    }
  }, []);

  const triggerTrail = useCallback((x, y, color = 0x3b82f6) => {
    if (!appRef.current) return; // Pixi not loaded

    // Single particle for trail effect
    particlesRef.current.push(
      new Particle(x, y, {
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        gravity: 0,
        life: 0.6,
        decay: 0.04,
        size: 4,
        color,
      })
    );
  }, []);

  const triggerShake = useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.style.animation = "none";
    containerRef.current.offsetHeight; // Trigger reflow
    containerRef.current.style.animation = "shake 0.3s ease-out";
  }, []);

  const value = {
    triggerCelebration,
    triggerCollect,
    triggerTrail,
    triggerShake,
    isReady,
  };

  return (
    <PixiEffectsContext.Provider value={value}>
      <div className={`relative ${className}`} style={{ width, height }}>
        {children}
        <div
          ref={containerRef}
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            width,
            height,
          }}
        />
        <style jsx global>{`
          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }
            20% {
              transform: translateX(-4px);
            }
            40% {
              transform: translateX(4px);
            }
            60% {
              transform: translateX(-3px);
            }
            80% {
              transform: translateX(3px);
            }
          }
        `}</style>
      </div>
    </PixiEffectsContext.Provider>
  );
}

export default PixiEffectsProvider;
