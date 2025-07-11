// components/GreenScaleProgress.js
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Target, Calendar } from "lucide-react";

export default function GreenScaleProgress({
  userProgress = {},
  completedUnitsByEcosystem = {},
  totalUnitsCompleted = 0,
  lastActivityDate = null,
}) {
  // Define ecosystem categories with their criteria
  const ecosystems = [
    {
      id: "ocean",
      name: "Ocean Guardian",
      icon: "🌊",
      color: "blue",
      description: "Protect marine life and ocean ecosystems",
      unitsCompleted: completedUnitsByEcosystem.ocean || 0,
      levels: [
        { name: "Tide Pool Explorer", requirement: 1, badge: "🐚" },
        { name: "Coral Protector", requirement: 3, badge: "🪸" },
        { name: "Deep Sea Guardian", requirement: 6, badge: "🐋" },
        { name: "Ocean Master", requirement: 10, badge: "🌊" },
      ],
    },
    {
      id: "forest",
      name: "Forest Protector",
      icon: "🌳",
      color: "green",
      description: "Safeguard forests and woodland creatures",
      unitsCompleted: completedUnitsByEcosystem.forest || 0,
      levels: [
        { name: "Seedling Tender", requirement: 1, badge: "🌱" },
        { name: "Tree Hugger", requirement: 3, badge: "🌳" },
        { name: "Forest Ranger", requirement: 6, badge: "🦉" },
        { name: "Woodland Master", requirement: 10, badge: "🍃" },
      ],
    },
    {
      id: "arctic",
      name: "Arctic Defender",
      icon: "❄️",
      color: "cyan",
      description: "Champion polar regions and ice habitats",
      unitsCompleted: completedUnitsByEcosystem.polar || 0,
      levels: [
        { name: "Ice Walker", requirement: 1, badge: "🧊" },
        { name: "Penguin Friend", requirement: 3, badge: "🐧" },
        { name: "Polar Guardian", requirement: 6, badge: "🐻‍❄️" },
        { name: "Arctic Master", requirement: 10, badge: "❄️" },
      ],
    },
    {
      id: "grassland",
      name: "Grassland Keeper",
      icon: "🌾",
      color: "yellow",
      description: "Preserve savannas and prairie ecosystems",
      unitsCompleted: completedUnitsByEcosystem.grassland || 0,
      levels: [
        { name: "Prairie Walker", requirement: 1, badge: "🌾" },
        { name: "Savanna Scout", requirement: 3, badge: "🦓" },
        { name: "Grassland Guardian", requirement: 6, badge: "🦁" },
        { name: "Plains Master", requirement: 10, badge: "🌅" },
      ],
    },
    // {
    //   id: "freshwater",
    //   name: "Warrior of Lakes and Rivers",
    //   icon: "🌾",
    //   color: "yellow",
    //   description: "Preserve savannas and prairie ecosystems",
    //   unitsCompleted: completedUnitsByEcosystem.grassland || 0,
    //   levels: [
    //     { name: "Prairie Walker", requirement: 1, badge: "🌾" },
    //     { name: "Savanna Scout", requirement: 3, badge: "🦓" },
    //     { name: "Grassland Guardian", requirement: 6, badge: "🦁" },
    //     { name: "Plains Master", requirement: 10, badge: "🌅" },
    //   ],
    // },
  ];

  // Calculate current Green Scale level (overall progress)
  const getGreenScaleLevel = () => {
    if (totalUnitsCompleted >= 50)
      return { level: 5, name: "Eco Champion", badge: "🏆", color: "gold" };
    if (totalUnitsCompleted >= 30)
      return {
        level: 4,
        name: "Environmental Hero",
        badge: "⭐",
        color: "purple",
      };
    if (totalUnitsCompleted >= 25)
      return { level: 3, name: "Green Warrior", badge: "🛡️", color: "green" };
    if (totalUnitsCompleted >= 10)
      return { level: 2, name: "Eco Explorer", badge: "🌱", color: "blue" };
    if (totalUnitsCompleted >= 5)
      return { level: 1, name: "Nature Friend", badge: "🍃", color: "green" };
    return { level: 0, name: "New Recruit", badge: "🌿", color: "gray" };
  };

  // Calculate days since last activity
  const getDaysSinceActivity = () => {
    if (!lastActivityDate) return 0;
    const now = new Date();
    const lastActivity = new Date(lastActivityDate);
    const diffTime = Math.abs(now - lastActivity);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Check if user is at risk of losing progress
  const isAtRisk = () => {
    const daysSince = getDaysSinceActivity();
    return daysSince >= 7; // At risk after 7 days
  };

  const currentGreenScale = getGreenScaleLevel();
  const daysSinceActivity = getDaysSinceActivity();

  // Get current level for each ecosystem
  const getEcosystemLevel = (ecosystem) => {
    const completed = ecosystem.unitsCompleted;
    for (let i = ecosystem.levels.length - 1; i >= 0; i--) {
      if (completed >= ecosystem.levels[i].requirement) {
        return { ...ecosystem.levels[i], index: i };
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Overall Green Scale Status */}
      <Card
        className={`border-2 ${
          isAtRisk() ? "border-red-200" : "border-green-200"
        }`}
      >
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">{currentGreenScale.badge}</span>
            <div>
              <CardTitle className="text-2xl">
                {currentGreenScale.name}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Green Scale Level {currentGreenScale.level}
              </p>
            </div>
          </div>

          {isAtRisk() && (
            <motion.div
              className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 rounded-lg p-3 mt-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-orange-800 dark:text-orange-200 text-sm">
                ⚠️ You haven@apos;t completed a unit in {daysSinceActivity}{" "}
                days. Complete a challenge soon to maintain your Green Scale!
              </p>
            </motion.div>
          )}
        </CardHeader>

        <CardContent>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {totalUnitsCompleted}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Environmental Actions
            </p>
          </div>

          {/* Progress to next level */}
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (totalUnitsCompleted / 50) * 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            {totalUnitsCompleted < 50
              ? `${50 - totalUnitsCompleted} more actions to reach Eco Champion`
              : "Maximum level achieved! 🎉"}
          </p>
        </CardContent>
      </Card>

      {/* Ecosystem Badges */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Environmental Challenges
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ecosystems.map((ecosystem) => {
            const currentLevel = getEcosystemLevel(ecosystem);
            const nextLevel = currentLevel
              ? ecosystem.levels[currentLevel.index + 1]
              : ecosystem.levels[0];

            return (
              <Card
                key={ecosystem.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{ecosystem.icon}</span>
                      <div>
                        <h4 className="font-semibold">{ecosystem.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {ecosystem.description}
                        </p>
                      </div>
                    </div>

                    {currentLevel && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {currentLevel.badge} {currentLevel.name}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {ecosystem.unitsCompleted} units</span>
                      {nextLevel && (
                        <span className="text-gray-500">
                          Next: {nextLevel.name} ({nextLevel.requirement} units)
                        </span>
                      )}
                    </div>

                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 bg-${ecosystem.color}-500`}
                        style={{
                          width: nextLevel
                            ? `${Math.min(
                                100,
                                (ecosystem.unitsCompleted /
                                  nextLevel.requirement) *
                                  100
                              )}%`
                            : "100%",
                        }}
                      />
                    </div>
                  </div>

                  {/* Challenge suggestion */}
                  <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                    <p className="text-gray-600 dark:text-gray-400">
                      💡 Complete {ecosystem.name.toLowerCase()} units to
                      advance!
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Species Adoption Preview */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
              <Star className="w-5 h-5" />
              Species Adoption Program
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Complete learning units to symbolically &quot;adopt&quot;
              endangered species and track conservation impact
            </p>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-1">🐧</div>
                <p className="text-xs">Adelie Penguin</p>
                <p className="text-xs text-gray-500">2 units to adopt</p>
              </div>
              <div>
                <div className="text-2xl mb-1">🐋</div>
                <p className="text-xs">Blue Whale</p>
                <p className="text-xs text-gray-500">5 units to adopt</p>
              </div>
              <div>
                <div className="text-2xl mb-1">🐅</div>
                <p className="text-xs">Sumatran Tiger</p>
                <p className="text-xs text-gray-500">3 units to adopt</p>
              </div>
            </div>

            <div className="mt-4">
              <Badge className="bg-blue-100 text-blue-800">
                Coming Soon! 🚀
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
