"use client";

// import SnakeGame from "@/components/SnakeGame";
import SnakeGame3Lives from "@/components/SnakeGame3Lives";

export default function EcoSnakeGame() {
  return (
    <div className="m-8 flex flex-col justify-start items-center">
      {/* <h1 className="text-center, font-sans">🐍 Eco Cleanup Snake Game</h1> */}
      <SnakeGame3Lives />
    </div>
  );
}
