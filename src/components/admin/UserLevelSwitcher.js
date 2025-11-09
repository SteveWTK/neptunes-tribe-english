"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { getAllLevels } from "@/config/levelsConfig";
import { RefreshCw, Eye, User, BarChart3 } from "lucide-react";

/**
 * UserLevelSwitcher - Admin tool to change user_type and current_level
 *
 * Allows platform_admin users to test the app from different user perspectives
 * to verify that adventures and lessons are appearing correctly for each
 * level and user type combination.
 */
export default function UserLevelSwitcher() {
  const { user } = useAuth();
  const [currentLevel, setCurrentLevel] = useState("");
  const [currentUserType, setCurrentUserType] = useState("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const levels = getAllLevels();
  const userTypes = [
    { value: "individual", label: "Individual Learner", icon: "👤" },
    { value: "school", label: "School Student", icon: "🏫" },
  ];

  useEffect(() => {
    loadUserSettings();
  }, [user]);

  async function loadUserSettings() {
    if (!user?.id && !user?.userId) return;

    try {
      const supabase = createClient();
      const userId = user.userId || user.id;

      const { data, error } = await supabase
        .from("users")
        .select("current_level, user_type, role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error loading user settings:", error);
        return;
      }

      setCurrentLevel(data.current_level || "Beginner");
      setCurrentUserType(data.user_type || "individual");

      // Only show switcher for platform_admin
      setShowSwitcher(data.role === "platform_admin");
    } catch (error) {
      console.error("Error in loadUserSettings:", error);
    }
  }

  async function updateLevel(newLevel) {
    if (!user?.id && !user?.userId) return;

    try {
      setUpdating(true);
      const supabase = createClient();
      const userId = user.userId || user.id;

      const { error } = await supabase
        .from("users")
        .update({ current_level: newLevel })
        .eq("id", userId);

      if (error) throw error;

      setCurrentLevel(newLevel);
      setMessage(`✅ Level changed to ${newLevel}. Refresh to see changes.`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating level:", error);
      setMessage("❌ Failed to update level");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUpdating(false);
    }
  }

  async function updateUserType(newType) {
    if (!user?.id && !user?.userId) return;

    try {
      setUpdating(true);
      const supabase = createClient();
      const userId = user.userId || user.id;

      const { error } = await supabase
        .from("users")
        .update({ user_type: newType })
        .eq("id", userId);

      if (error) throw error;

      setCurrentUserType(newType);
      setMessage(`✅ User type changed to ${newType}. Refresh to see changes.`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating user type:", error);
      setMessage("❌ Failed to update user type");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUpdating(false);
    }
  }

  function handleRefresh() {
    window.location.reload();
  }

  if (!showSwitcher) {
    return null;
  }

  // Debug log to verify state
  console.log("🔧 UserLevelSwitcher - isCollapsed:", isCollapsed);

  // Collapsed view - just the eye icon
  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 shadow-2xl border-2 border-primary-500 transition-all hover:scale-110"
          title="Open Admin View Switcher"
        >
          <Eye className="w-6 h-6" />
        </button>
      </div>
    );
  }

  // Expanded view - full panel
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-primary-500 p-4 max-w-sm">
        {/* Header with Collapse Button */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">
              Admin View Switcher
            </h3>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Collapse to icon only"
          >
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Current Settings Display */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
          <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">
            Currently viewing as:
          </div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {currentLevel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {currentUserType === "school"
                ? "School Student"
                : "Individual Learner"}
            </span>
          </div>
        </div>

        {/* Level Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty Level
          </label>
          <select
            value={currentLevel}
            onChange={(e) => updateLevel(e.target.value)}
            disabled={updating}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
          >
            {levels.map((level) => (
              <option key={level.id} value={level.value}>
                {level.icon} {level.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* User Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            User Type
          </label>
          <select
            value={currentUserType}
            onChange={(e) => updateUserType(e.target.value)}
            disabled={updating}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
          >
            {userTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-4 p-2 rounded bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-white">
            {message}
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh to Apply Changes
        </button>

        {/* Info Text */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          Only visible to platform_admin users
        </p>
      </div>
    </div>
  );
}
