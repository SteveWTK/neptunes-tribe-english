"use client";

import WordSnakeGame from "@/components/WordSnakeGame";

export default function WordSnakePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50 dark:from-primary-900 dark:to-primary-800 py-8">
      <WordSnakeGame />
    </div>
  );
}
