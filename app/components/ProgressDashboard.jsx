"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import EcoMapProgress from "./EcoMapProgress";

const XP_PER_LEVEL = 500;
const MAX_LEVEL = 8;

// Mock achievements
const mockAchievements = [
  { title: "First Steps", description: "Completed your first activity!" },
  { title: "3-Day Streak!", description: "Practiced 3 days in a row!" },
  { title: "Level Up!", description: "Reached level 2!" },
];

export default function ProgressDashboard({ user }) {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(1); // mock streak
  const [achievements, setAchievements] = useState(mockAchievements);
  const firstName = user.name.split(" ").at(0);

  // Load mock data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("mockProgress");
    if (stored) {
      const { xp, level, streak } = JSON.parse(stored);
      setXp(xp || 0);
      setLevel(level || 1);
      setStreak(streak || 1);
    }
  }, []);

  // Save mock data to localStorage
  useEffect(() => {
    localStorage.setItem("mockProgress", JSON.stringify({ xp, level, streak }));
  }, [xp, level, streak]);

  // Handle fake XP gain
  const gainXP = (amount = 20) => {
    const totalXP = xp + amount;
    if (totalXP >= XP_PER_LEVEL) {
      const nextLevel = Math.min(level + 1, MAX_LEVEL);
      setLevel(nextLevel);
      setXp(totalXP - XP_PER_LEVEL);
      setAchievements((prev) => [
        ...prev,
        {
          title: `Level ${nextLevel}!`,
          description: `You reached level ${nextLevel}`,
        },
      ]);
    } else {
      setXp(totalXP);
    }
  };

  const xpPercent = Math.min((xp / XP_PER_LEVEL) * 100, 100);

  return (
    <>
      <h1 className="text-xl text-gray-800 dark:text-accent-50 font-light mb-6 ml-2 lg:ml-6 xl:ml-24">
        {`Welcome, ${firstName}!`}
      </h1>
      <EcoMapProgress />
      <div className="max-w-xl mx-auto p-6  text-accent-100 bg-primary-950 shadow-md rounded-xl border border-accent-50 space-y-6">
        <h2 className="text-2xl font-medium text-center">🏆 Your Progress</h2>

        {/* Badge Display */}
        <div className="flex justify-center">
          <Image
            src={`/badges/level${level}.png`}
            width={100}
            height={100}
            alt={`Level ${level} badge`}
            className="rounded-full shadow-md"
          />
        </div>

        {/* Level and XP Progress Bar */}
        <div className="text-center">
          <p className="text-lg font-semibold">Level {level}</p>
          <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-teal-500 transition-all duration-700 ease-in-out"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {xp} / {XP_PER_LEVEL} XP
          </p>
        </div>

        {/* Streak */}
        <div className="text-center">
          🔥 <span className="font-medium">{streak}-day streak</span>
        </div>

        {/* Achievements */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Achievements</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {achievements.map((a, i) => (
              <li key={i}>
                <span className="font-medium">{a.title}</span>: {a.description}
              </li>
            ))}
          </ul>
        </div>

        {/* Button to simulate XP gain */}
        <div className="text-center">
          <button
            onClick={() => gainXP(25)}
            className="mt-4 px-4 py-2 bg-accent-600 text-white rounded hover:bg-accent-700 transition"
          >
            Gain XP
          </button>
        </div>
      </div>
    </>
  );
}
