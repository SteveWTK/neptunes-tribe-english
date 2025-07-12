// components/GreenScaleProgress.js - Enhanced with Environmental Challenges & Species Adoption
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trophy,
  Star,
  Target,
  Calendar,
  Users,
  Clock,
  Award,
  Heart,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function GreenScaleProgress({
  userProgress = {},
  completedUnitsByEcosystem = {},
  totalUnitsCompleted = 0,
  lastActivityDate = null,
}) {
  const { data: session } = useSession();
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [userChallengeProgress, setUserChallengeProgress] = useState({});
  const [adoptedSpecies, setAdoptedSpecies] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [loading, setLoading] = useState(false);

  // Define ecosystem categories with their criteria
  const ecosystems = [
    {
      id: "marine",
      name: "Marine Guardian",
      icon: "🌊",
      color: "blue",
      description: "Protect marine life and ocean ecosystems",
      unitsCompleted: completedUnitsByEcosystem.marine || 0,
      levels: [
        { name: "Tide Pool Explorer", requirement: 1, badge: "🐚" },
        { name: "Coral Protector", requirement: 3, badge: "🪸" },
        { name: "Deep Sea Guardian", requirement: 6, badge: "🐋" },
        { name: "Marine Master", requirement: 10, badge: "🌊" },
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
      id: "polar",
      name: "Polar Defender",
      icon: "❄️",
      color: "cyan",
      description: "Champion polar regions and ice habitats",
      unitsCompleted: completedUnitsByEcosystem.polar || 0,
      levels: [
        { name: "Ice Walker", requirement: 1, badge: "🧊" },
        { name: "Penguin Friend", requirement: 3, badge: "🐧" },
        { name: "Polar Guardian", requirement: 6, badge: "🐻‍❄️" },
        { name: "Polar Master", requirement: 10, badge: "❄️" },
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
    {
      id: "mountains",
      name: "Mountain Guardian",
      icon: "🏔️",
      color: "gray",
      description: "Protect mountain ecosystems and alpine wildlife",
      unitsCompleted: completedUnitsByEcosystem.mountains || 0,
      levels: [
        { name: "Valley Explorer", requirement: 1, badge: "⛰️" },
        { name: "Peak Climber", requirement: 3, badge: "🏔️" },
        { name: "Alpine Guardian", requirement: 6, badge: "🦅" },
        { name: "Mountain Master", requirement: 10, badge: "🏔️" },
      ],
    },
    {
      id: "freshwater",
      name: "Freshwater Protector",
      icon: "💧",
      color: "teal",
      description: "Safeguard rivers, lakes, and freshwater ecosystems",
      unitsCompleted: completedUnitsByEcosystem.freshwater || 0,
      levels: [
        { name: "Stream Walker", requirement: 1, badge: "💧" },
        { name: "River Guardian", requirement: 3, badge: "🏞️" },
        { name: "Lake Protector", requirement: 6, badge: "🦆" },
        { name: "Freshwater Master", requirement: 10, badge: "🌊" },
      ],
    },
  ];

  // Fetch challenge and species data
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.email) return;

      setLoading(true);
      try {
        // Fetch active challenges
        const challengesResponse = await fetch("/api/challenges/active");
        if (challengesResponse.ok) {
          const challenges = await challengesResponse.json();
          setActiveChallenges(challenges);
        }

        // Fetch user's challenge progress and adopted species
        const userProgressResponse = await fetch(
          "/api/user/challenge-progress"
        );
        if (userProgressResponse.ok) {
          const progressData = await userProgressResponse.json();
          setUserChallengeProgress(progressData.challengeProgress || {});
          setAdoptedSpecies(progressData.adoptedSpecies || []);
        }

        // Fetch global leaderboard
        const leaderboardResponse = await fetch("/api/leaderboard?type=global");
        if (leaderboardResponse.ok) {
          const leaderboardData = await leaderboardResponse.json();
          setLeaderboard(leaderboardData);
        }
      } catch (error) {
        console.error("Error fetching challenge data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.email]);

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

  // Get challenge type emoji and color
  const getChallengeStyle = (type) => {
    const styles = {
      oil_spill: {
        emoji: "🛢️",
        color: "bg-gray-800 text-white",
        urgency: "high",
      },
      wildfire: {
        emoji: "🔥",
        color: "bg-red-600 text-white",
        urgency: "critical",
      },
      ice_melt: {
        emoji: "🧊",
        color: "bg-blue-600 text-white",
        urgency: "high",
      },
      coral_bleaching: {
        emoji: "🪸",
        color: "bg-orange-600 text-white",
        urgency: "high",
      },
    };
    return (
      styles[type] || {
        emoji: "🌍",
        color: "bg-green-600 text-white",
        urgency: "medium",
      }
    );
  };

  // Calculate days remaining for challenge
  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Species adoption component
  const SpeciesAdoptionSection = () => (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Your Adopted Species
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Species you&apos;ve helped protect through environmental action
          </p>
        </div>

        {adoptedSpecies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {adoptedSpecies.map((species, index) => (
              <motion.div
                key={species.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm text-center"
              >
                <div className="text-3xl mb-2">{species.species_emoji}</div>
                <p className="text-sm font-medium">{species.species_name}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {species.ecosystem}
                </p>
                <div className="mt-2">
                  <Badge className="text-xs bg-green-100 text-green-800">
                    Adopted {new Date(species.adopted_at).toLocaleDateString()}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🥺</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No species adopted yet. Complete more environmental challenges to
              start adopting species!
            </p>
            <div className="grid grid-cols-3 gap-4 text-center max-w-md mx-auto">
              <div>
                <div className="text-2xl mb-1">🐧</div>
                <p className="text-xs">2 units to adopt</p>
              </div>
              <div>
                <div className="text-2xl mb-1">🐋</div>
                <p className="text-xs">5 units to adopt</p>
              </div>
              <div>
                <div className="text-2xl mb-1">🐅</div>
                <p className="text-xs">3 units to adopt</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

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
                ⚠️ You haven&apos:t completed a unit in {daysSinceActivity}{" "}
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

      {/* Active Environmental Challenges */}
      {activeChallenges.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            Active Environmental Challenges
            <Badge className="bg-red-100 text-red-800 animate-pulse">
              URGENT
            </Badge>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {activeChallenges.map((challenge) => {
              const style = getChallengeStyle(challenge.challenge_type);
              const userContribution =
                userChallengeProgress[challenge.challenge_id]
                  ?.units_contributed || 0;
              const progressPercentage =
                (challenge.total_contributions / challenge.units_required) *
                100;
              const userPercentage =
                (userContribution / challenge.units_required) * 100;
              const daysRemaining = getDaysRemaining(challenge.end_date);

              return (
                <motion.div
                  key={challenge.challenge_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border-l-4 border-red-500"
                >
                  <div className="flex items-center justify-between mb-3 relative group">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{style.emoji}</span>
                      <div>
                        <h4 className="font-semibold cursor-help">
                          {challenge.challenge_name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                          {challenge.challenge_type.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    {/* Elegant description tooltip */}
                    {challenge.description && (
                      <div className="absolute left-0 top-full mt-2 w-72 bg-gray-900 text-white text-sm p-3 rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none">
                        <div className="absolute -top-2 left-6 w-4 h-4 bg-gray-900 transform rotate-45"></div>
                        {challenge.description}
                      </div>
                    )}

                    {daysRemaining !== null && (
                      <div
                        className={`text-center ${
                          daysRemaining <= 2
                            ? "text-red-600"
                            : "text-orange-600"
                        }`}
                      >
                        <Clock className="w-4 h-4 mx-auto" />
                        <span className="text-xs font-bold">
                          {daysRemaining > 0 ? `${daysRemaining}d` : "EXPIRED"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Global progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Global Progress</span>
                      <span>
                        {challenge.total_contributions}/
                        {challenge.units_required}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500 relative"
                        style={{
                          width: `${Math.min(100, progressPercentage)}%`,
                        }}
                      >
                        {progressPercentage >= 100 && (
                          <span className="absolute right-2 top-0 text-white text-xs">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{Math.round(progressPercentage)}% complete</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {challenge.participants_count || 0} heroes
                      </span>
                    </div>
                  </div>

                  {/* User contribution */}
                  {userContribution > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-green-600 font-medium">
                          Your Contribution
                        </span>
                        <span className="text-green-600 font-medium">
                          {userContribution} units
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, userPercentage)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Challenge status and action buttons */}
                  <div className="flex justify-between items-center">
                    <Badge
                      className={
                        progressPercentage >= 100
                          ? "bg-green-100 text-green-800"
                          : style.color
                      }
                    >
                      {progressPercentage >= 100
                        ? "✅ COMPLETED"
                        : progressPercentage >= 75
                        ? "🔥 ALMOST THERE"
                        : progressPercentage >= 50
                        ? "⚡ HALFWAY"
                        : progressPercentage >= 25
                        ? "💪 PROGRESS"
                        : "🆘 NEEDS HELP"}
                    </Badge>

                    {/* Always show Help Now button, but change text if user has contributed */}
                    <a
                      href={`/units?ecosystem=${
                        challenge.target_ecosystem || "all"
                      }`}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      {userContribution > 0 ? "Help More!" : "Help Now!"}
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Global leaderboard toggle */}
          <div className="text-center">
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Trophy className="w-4 h-4" />
              {showLeaderboard ? "Hide" : "Show"} Global Impact
            </button>
          </div>

          {/* Global leaderboard */}
          <AnimatePresence>
            {showLeaderboard && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-4"
              >
                <h4 className="font-semibold mb-3 text-center">
                  🌍 Global Environmental Impact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leaderboard.slice(0, 6).map((challenge, index) => (
                    <div
                      key={challenge.challenge_id}
                      className="bg-white dark:bg-gray-800 p-3 rounded"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {challenge.challenge_name}
                        </span>
                        <Badge
                          className={
                            challenge.completion_percentage >= 100
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {Math.round(challenge.completion_percentage)}%
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {challenge.participants_count} participants worldwide
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Ecosystem Badges */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Environmental Mastery
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

                  {/* Ecosystem challenge link */}
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

      {/* Species Adoption Section */}
      <SpeciesAdoptionSection />
    </div>
  );
}

// components/GreenScaleProgress.js - Enhanced with Environmental Challenges & Species Adoption
// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Trophy,
//   Star,
//   Target,
//   Calendar,
//   Users,
//   Clock,
//   Award,
//   Heart,
// } from "lucide-react";
// import { useSession } from "next-auth/react";

// export default function GreenScaleProgress({
//   userProgress = {},
//   completedUnitsByEcosystem = {},
//   totalUnitsCompleted = 0,
//   lastActivityDate = null,
// }) {
//   const { data: session } = useSession();
//   const [activeChallenges, setActiveChallenges] = useState([]);
//   const [userChallengeProgress, setUserChallengeProgress] = useState({});
//   const [adoptedSpecies, setAdoptedSpecies] = useState([]);
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [showLeaderboard, setShowLeaderboard] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // Define ecosystem categories with their criteria
//   const ecosystems = [
//     {
//       id: "marine",
//       name: "Marine Defender",
//       icon: "🌊",
//       color: "indigo",
//       description: "Protect marine life and ocean ecosystems",
//       unitsCompleted: completedUnitsByEcosystem.ocean || 0,
//       levels: [
//         { name: "Tide Pool Explorer", requirement: 1, badge: "🐚" },
//         { name: "Coral Protector", requirement: 3, badge: "🪸" },
//         { name: "Deep Sea Guardian", requirement: 6, badge: "🐋" },
//         { name: "Ocean Master", requirement: 10, badge: "🌊" },
//       ],
//     },
//     {
//       id: "forest",
//       name: "Forest Protector",
//       icon: "🌳",
//       color: "emerald",
//       description: "Safeguard forests and woodland creatures",
//       unitsCompleted: completedUnitsByEcosystem.forest || 0,
//       levels: [
//         { name: "Seedling Tender", requirement: 1, badge: "🌱" },
//         { name: "Tree Hugger", requirement: 3, badge: "🌳" },
//         { name: "Forest Ranger", requirement: 6, badge: "🦉" },
//         { name: "Woodland Master", requirement: 10, badge: "🍃" },
//       ],
//     },
//     {
//       id: "polar",
//       name: "Polar Guardian",
//       icon: "❄️",
//       color: "cyan",
//       description: "Champion polar regions and ice habitats",
//       unitsCompleted: completedUnitsByEcosystem.arctic || 0,
//       levels: [
//         { name: "Ice Walker", requirement: 1, badge: "🧊" },
//         { name: "Penguin Friend", requirement: 3, badge: "🐧" },
//         { name: "Polar Guardian", requirement: 6, badge: "🐻‍❄️" },
//         { name: "Arctic Master", requirement: 10, badge: "❄️" },
//       ],
//     },
//     {
//       id: "grassland",
//       name: "Grassland Keeper",
//       icon: "🌾",
//       color: "yellow",
//       description: "Preserve savannas and prairie ecosystems",
//       unitsCompleted: completedUnitsByEcosystem.grassland || 0,
//       levels: [
//         { name: "Prairie Walker", requirement: 1, badge: "🌾" },
//         { name: "Savanna Scout", requirement: 3, badge: "🦓" },
//         { name: "Grassland Guardian", requirement: 6, badge: "🦁" },
//         { name: "Plains Master", requirement: 10, badge: "🌅" },
//       ],
//     },
//     {
//       id: "freshwater",
//       name: "Freshwater Custodian",
//       icon: "💧",
//       color: "sky",
//       description: "Protext our rivers and lakes",
//       unitsCompleted: completedUnitsByEcosystem.freshwater || 0,
//       levels: [
//         { name: "Prairie Walker", requirement: 1, badge: "🌾" },
//         { name: "Savanna Scout", requirement: 3, badge: "🦓" },
//         { name: "Grassland Guardian", requirement: 6, badge: "🦁" },
//         { name: "Plains Master", requirement: 10, badge: "🌅" },
//       ],
//     },
//     {
//       id: "mountain",
//       name: "Mountain Gatekeeper",
//       icon: "🌄",
//       color: "accent",
//       description: "Preserve savannas and prairie ecosystems",
//       unitsCompleted: completedUnitsByEcosystem.mountain || 0,
//       levels: [
//         { name: "Prairie Walker", requirement: 1, badge: "🌾" },
//         { name: "Savanna Scout", requirement: 3, badge: "🦓" },
//         { name: "Grassland Guardian", requirement: 6, badge: "🦁" },
//         { name: "Plains Master", requirement: 10, badge: "🌅" },
//       ],
//     },
//   ];

//   // Fetch challenge and species data
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!session?.user?.email) return;

//       setLoading(true);
//       try {
//         // Fetch active challenges
//         const challengesResponse = await fetch("/api/challenges/active");
//         if (challengesResponse.ok) {
//           const challenges = await challengesResponse.json();
//           setActiveChallenges(challenges);
//         }

//         // Fetch user's challenge progress and adopted species
//         const userProgressResponse = await fetch(
//           "/api/user/challenge-progress"
//         );
//         if (userProgressResponse.ok) {
//           const progressData = await userProgressResponse.json();
//           setUserChallengeProgress(progressData.challengeProgress || {});
//           setAdoptedSpecies(progressData.adoptedSpecies || []);
//         }

//         // Fetch global leaderboard
//         const leaderboardResponse = await fetch("/api/leaderboard?type=global");
//         if (leaderboardResponse.ok) {
//           const leaderboardData = await leaderboardResponse.json();
//           setLeaderboard(leaderboardData);
//         }
//       } catch (error) {
//         console.error("Error fetching challenge data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [session?.user?.email]);

//   // Calculate current Green Scale level (overall progress)
//   const getGreenScaleLevel = () => {
//     if (totalUnitsCompleted >= 50)
//       return { level: 5, name: "Eco Champion", badge: "🏆", color: "gold" };
//     if (totalUnitsCompleted >= 30)
//       return {
//         level: 4,
//         name: "Environmental Hero",
//         badge: "⭐",
//         color: "purple",
//       };
//     if (totalUnitsCompleted >= 25)
//       return { level: 3, name: "Green Warrior", badge: "🛡️", color: "green" };
//     if (totalUnitsCompleted >= 10)
//       return { level: 2, name: "Eco Explorer", badge: "🌱", color: "blue" };
//     if (totalUnitsCompleted >= 5)
//       return { level: 1, name: "Nature Friend", badge: "🍃", color: "green" };
//     return { level: 0, name: "New Recruit", badge: "🌿", color: "gray" };
//   };

//   // Calculate days since last activity
//   const getDaysSinceActivity = () => {
//     if (!lastActivityDate) return 0;
//     const now = new Date();
//     const lastActivity = new Date(lastActivityDate);
//     const diffTime = Math.abs(now - lastActivity);
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   };

//   // Check if user is at risk of losing progress
//   const isAtRisk = () => {
//     const daysSince = getDaysSinceActivity();
//     return daysSince >= 7; // At risk after 7 days
//   };

//   const currentGreenScale = getGreenScaleLevel();
//   const daysSinceActivity = getDaysSinceActivity();

//   // Get current level for each ecosystem
//   const getEcosystemLevel = (ecosystem) => {
//     const completed = ecosystem.unitsCompleted;
//     for (let i = ecosystem.levels.length - 1; i >= 0; i--) {
//       if (completed >= ecosystem.levels[i].requirement) {
//         return { ...ecosystem.levels[i], index: i };
//       }
//     }
//     return null;
//   };

//   // Get challenge type emoji and color
//   const getChallengeStyle = (type) => {
//     const styles = {
//       oil_spill: {
//         emoji: "🛢️",
//         color: "bg-gray-800 text-white",
//         urgency: "high",
//       },
//       wildfire: {
//         emoji: "🔥",
//         color: "bg-red-600 text-white",
//         urgency: "critical",
//       },
//       ice_melt: {
//         emoji: "🧊",
//         color: "bg-blue-600 text-white",
//         urgency: "high",
//       },
//       coral_bleaching: {
//         emoji: "🪸",
//         color: "bg-orange-600 text-white",
//         urgency: "high",
//       },
//     };
//     return (
//       styles[type] || {
//         emoji: "🌍",
//         color: "bg-green-600 text-white",
//         urgency: "medium",
//       }
//     );
//   };

//   // Calculate days remaining for challenge
//   const getDaysRemaining = (endDate) => {
//     if (!endDate) return null;
//     const now = new Date();
//     const end = new Date(endDate);
//     const diffTime = end - now;
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   };

//   // Species adoption component
//   const SpeciesAdoptionSection = () => (
//     <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
//       <CardContent className="p-6">
//         <div className="text-center mb-4">
//           <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
//             <Heart className="w-5 h-5 text-red-500" />
//             Your Adopted Species
//           </h3>
//           <p className="text-gray-600 dark:text-gray-300 text-sm">
//             Species you&apos;ve helped protect through environmental action
//           </p>
//         </div>

//         {adoptedSpecies.length > 0 ? (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {adoptedSpecies.map((species, index) => (
//               <motion.div
//                 key={species.id}
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: index * 0.1 }}
//                 className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm text-center"
//               >
//                 <div className="text-3xl mb-2">{species.species_emoji}</div>
//                 <p className="text-sm font-medium">{species.species_name}</p>
//                 <p className="text-xs text-gray-500 capitalize">
//                   {species.ecosystem}
//                 </p>
//                 <div className="mt-2">
//                   <Badge className="text-xs bg-green-100 text-green-800">
//                     Adopted {new Date(species.adopted_at).toLocaleDateString()}
//                   </Badge>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <div className="text-6xl mb-4">🥺</div>
//             <p className="text-gray-600 dark:text-gray-400 mb-4">
//               No species adopted yet. Complete more environmental challenges to
//               start adopting species!
//             </p>
//             <div className="grid grid-cols-3 gap-4 text-center max-w-md mx-auto">
//               <div>
//                 <div className="text-2xl mb-1">🐧</div>
//                 <p className="text-xs">2 units to adopt</p>
//               </div>
//               <div>
//                 <div className="text-2xl mb-1">🐋</div>
//                 <p className="text-xs">5 units to adopt</p>
//               </div>
//               <div>
//                 <div className="text-2xl mb-1">🐅</div>
//                 <p className="text-xs">3 units to adopt</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );

//   return (
//     <div className="space-y-6">
//       {/* Overall Green Scale Status */}
//       <Card
//         className={`border-2 ${
//           isAtRisk() ? "border-red-200" : "border-green-200"
//         }`}
//       >
//         <CardHeader className="text-center">
//           <div className="flex items-center justify-center gap-3 mb-2">
//             <span className="text-4xl">{currentGreenScale.badge}</span>
//             <div>
//               <CardTitle className="text-2xl">
//                 {currentGreenScale.name}
//               </CardTitle>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Green Scale Level {currentGreenScale.level}
//               </p>
//             </div>
//           </div>

//           {isAtRisk() && (
//             <motion.div
//               className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 rounded-lg p-3 mt-3"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//             >
//               <p className="text-orange-800 dark:text-orange-200 text-sm">
//                 ⚠️ You haven&apos;t completed a unit in {daysSinceActivity}{" "}
//                 days. Complete a challenge soon to maintain your Green Scale!
//               </p>
//             </motion.div>
//           )}
//         </CardHeader>

//         <CardContent>
//           <div className="text-center mb-4">
//             <div className="text-3xl font-bold text-green-600 mb-1">
//               {totalUnitsCompleted}
//             </div>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               Total Environmental Actions
//             </p>
//           </div>

//           {/* Progress to next level */}
//           <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
//             <div
//               className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
//               style={{
//                 width: `${Math.min(100, (totalUnitsCompleted / 50) * 100)}%`,
//               }}
//             />
//           </div>
//           <p className="text-xs text-gray-500 text-center">
//             {totalUnitsCompleted < 50
//               ? `${50 - totalUnitsCompleted} more actions to reach Eco Champion`
//               : "Maximum level achieved! 🎉"}
//           </p>
//         </CardContent>
//       </Card>

//       {/* Active Environmental Challenges */}
//       {activeChallenges.length > 0 && (
//         <div>
//           <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//             <Target className="w-5 h-5 text-red-500" />
//             Active Environmental Challenges
//             <Badge className="bg-red-100 text-red-800 animate-pulse">
//               URGENT
//             </Badge>
//           </h3>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
//             {activeChallenges.map((challenge) => {
//               const style = getChallengeStyle(challenge.challenge_type);
//               const userContribution =
//                 userChallengeProgress[challenge.challenge_id]
//                   ?.units_contributed || 0;
//               const progressPercentage =
//                 (challenge.total_contributions / challenge.units_required) *
//                 100;
//               const userPercentage =
//                 (userContribution / challenge.units_required) * 100;
//               const daysRemaining = getDaysRemaining(challenge.end_date);

//               return (
//                 <motion.div
//                   key={challenge.challenge_id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border-l-4 border-red-500"
//                 >
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-3">
//                       <span className="text-2xl">{style.emoji}</span>
//                       <div>
//                         <h4 className="font-semibold">
//                           {challenge.challenge_name}
//                         </h4>
//                         <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
//                           {challenge.challenge_type.replace("_", " ")}
//                         </p>
//                       </div>
//                     </div>

//                     {daysRemaining !== null && (
//                       <div
//                         className={`text-center ${
//                           daysRemaining <= 2
//                             ? "text-red-600"
//                             : "text-orange-600"
//                         }`}
//                       >
//                         <Clock className="w-4 h-4 mx-auto" />
//                         <span className="text-xs font-bold">
//                           {daysRemaining > 0 ? `${daysRemaining}d` : "EXPIRED"}
//                         </span>
//                       </div>
//                     )}
//                   </div>

//                   {/* Global progress */}
//                   <div className="mb-3">
//                     <div className="flex justify-between text-sm mb-1">
//                       <span>Global Progress</span>
//                       <span>
//                         {challenge.total_contributions}/
//                         {challenge.units_required}
//                       </span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-3">
//                       <div
//                         className="bg-blue-600 h-3 rounded-full transition-all duration-500 relative"
//                         style={{
//                           width: `${Math.min(100, progressPercentage)}%`,
//                         }}
//                       >
//                         {progressPercentage >= 100 && (
//                           <span className="absolute right-2 top-0 text-white text-xs">
//                             ✓
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                     <div className="flex justify-between text-xs text-gray-500 mt-1">
//                       <span>{Math.round(progressPercentage)}% complete</span>
//                       <span className="flex items-center gap-1">
//                         <Users className="w-3 h-3" />
//                         {challenge.participants_count} heroes
//                       </span>
//                     </div>
//                   </div>

//                   {/* User contribution */}
//                   {userContribution > 0 && (
//                     <div className="mb-3">
//                       <div className="flex justify-between text-sm mb-1">
//                         <span className="text-green-600 font-medium">
//                           Your Contribution
//                         </span>
//                         <span className="text-green-600 font-medium">
//                           {userContribution} units
//                         </span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div
//                           className="bg-green-500 h-2 rounded-full transition-all duration-500"
//                           style={{ width: `${Math.min(100, userPercentage)}%` }}
//                         />
//                       </div>
//                     </div>
//                   )}

//                   {/* Challenge status */}
//                   <div className="flex justify-between items-center">
//                     <Badge
//                       className={
//                         progressPercentage >= 100
//                           ? "bg-green-100 text-green-800"
//                           : style.color
//                       }
//                     >
//                       {progressPercentage >= 100
//                         ? "✅ COMPLETED"
//                         : progressPercentage >= 75
//                         ? "🔥 ALMOST THERE"
//                         : progressPercentage >= 50
//                         ? "⚡ HALFWAY"
//                         : progressPercentage >= 25
//                         ? "💪 PROGRESS"
//                         : "🆘 NEEDS HELP"}
//                     </Badge>

//                     {userContribution === 0 && (
//                       <a
//                         href={`/units?ecosystem=${challenge.target_ecosystem}`}
//                         className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
//                       >
//                         Help Now!
//                       </a>
//                     )}
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>

//           {/* Global leaderboard toggle */}
//           <div className="text-center">
//             <button
//               onClick={() => setShowLeaderboard(!showLeaderboard)}
//               className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
//             >
//               <Trophy className="w-4 h-4" />
//               {showLeaderboard ? "Hide" : "Show"} Global Impact
//             </button>
//           </div>

//           {/* Global leaderboard */}
//           <AnimatePresence>
//             {showLeaderboard && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: "auto" }}
//                 exit={{ opacity: 0, height: 0 }}
//                 className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-4"
//               >
//                 <h4 className="font-semibold mb-3 text-center">
//                   🌍 Global Environmental Impact
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {leaderboard.slice(0, 6).map((challenge, index) => (
//                     <div
//                       key={challenge.challenge_id}
//                       className="bg-white dark:bg-gray-800 p-3 rounded"
//                     >
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm font-medium">
//                           {challenge.challenge_name}
//                         </span>
//                         <Badge
//                           className={
//                             challenge.completion_percentage >= 100
//                               ? "bg-green-100 text-green-800"
//                               : "bg-blue-100 text-blue-800"
//                           }
//                         >
//                           {Math.round(challenge.completion_percentage)}%
//                         </Badge>
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1">
//                         {challenge.participants_count} participants worldwide
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       )}

//       {/* Ecosystem Badges */}
//       <div>
//         <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//           <Trophy className="w-5 h-5" />
//           Environmental Mastery
//         </h3>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {ecosystems.map((ecosystem) => {
//             const currentLevel = getEcosystemLevel(ecosystem);
//             const nextLevel = currentLevel
//               ? ecosystem.levels[currentLevel.index + 1]
//               : ecosystem.levels[0];

//             return (
//               <Card
//                 key={ecosystem.id}
//                 className="hover:shadow-lg transition-shadow"
//               >
//                 <CardContent className="p-4">
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-3">
//                       <span className="text-2xl">{ecosystem.icon}</span>
//                       <div>
//                         <h4 className="font-semibold">{ecosystem.name}</h4>
//                         <p className="text-xs text-gray-600 dark:text-gray-400">
//                           {ecosystem.description}
//                         </p>
//                       </div>
//                     </div>

//                     {currentLevel && (
//                       <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
//                         {currentLevel.badge} {currentLevel.name}
//                       </Badge>
//                     )}
//                   </div>

//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span>Progress: {ecosystem.unitsCompleted} units</span>
//                       {nextLevel && (
//                         <span className="text-gray-500">
//                           Next: {nextLevel.name} ({nextLevel.requirement} units)
//                         </span>
//                       )}
//                     </div>

//                     <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                       <div
//                         className={`h-2 rounded-full transition-all duration-500 bg-${ecosystem.color}-500`}
//                         style={{
//                           width: nextLevel
//                             ? `${Math.min(
//                                 100,
//                                 (ecosystem.unitsCompleted /
//                                   nextLevel.requirement) *
//                                   100
//                               )}%`
//                             : "100%",
//                         }}
//                       />
//                     </div>
//                   </div>

//                   {/* Ecosystem challenge link */}
//                   <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
//                     <p className="text-gray-600 dark:text-gray-400">
//                       💡 Complete {ecosystem.name.toLowerCase()} units to
//                       advance!
//                     </p>
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       </div>

//       {/* Species Adoption Section */}
//       <SpeciesAdoptionSection />
//     </div>
//   );
// }
