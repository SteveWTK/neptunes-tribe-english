"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { getLevelByValue } from "@/config/levelsConfig";
import { Trophy, TrendingUp } from "lucide-react";

/**
 * LevelIndicator - Shows user's current difficulty level
 *
 * Displays the user's current learning level with:
 * - Level icon and name
 * - Color-coded badge matching level theme
 * - Tooltip with level description
 *
 * @param {Object} props
 * @param {string} props.variant - Display variant: "badge" (compact), "card" (detailed), or "inline" (text only)
 * @param {string} props.className - Additional CSS classes
 */
export default function LevelIndicator({ variant = "badge", className = "" }) {
  const { user } = useAuth();
  const [userLevel, setUserLevel] = useState(null);
  const [levelConfig, setLevelConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserLevel = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("users")
          .select("current_level")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user level:", error);
          setLoading(false);
          return;
        }

        const level = data?.current_level || "Beginner";
        setUserLevel(level);

        // Get level configuration from levelsConfig
        const config = getLevelByValue(level);
        setLevelConfig(config);
      } catch (error) {
        console.error("Error in fetchUserLevel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLevel();
  }, [user]);

  if (loading || !levelConfig) {
    return null;
  }

  // Badge variant - compact display
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-sm ${className}`}
        style={{ backgroundColor: levelConfig.color.primary }}
        title={levelConfig.description}
      >
        <span className="text-base">{levelConfig.icon}</span>
        <span>{levelConfig.shortName}</span>
      </div>
    );
  }

  // Card variant - detailed display
  if (variant === "card") {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-4 ${className}`}
        style={{ borderColor: levelConfig.color.primary }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
            style={{ backgroundColor: levelConfig.color.primary }}
          >
            {levelConfig.icon}
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Your Level
            </div>
            <div className="font-bold text-gray-900 dark:text-white">
              {levelConfig.displayName}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {levelConfig.description}
        </p>
      </div>
    );
  }

  // Inline variant - simple text with icon
  if (variant === "inline") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-sm font-medium ${className}`}
        style={{ color: levelConfig.color.primary }}
      >
        <span>{levelConfig.icon}</span>
        <span>{levelConfig.shortName}</span>
      </span>
    );
  }

  return null;
}
