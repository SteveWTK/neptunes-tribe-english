"use client";

import { useState } from "react";
import { User, X, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DisplayNamePrompt({ onComplete, onDismiss }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Please enter a display name");
      return;
    }

    if (displayName.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update name");
      }

      setIsOpen(false);
      onComplete?.(displayName.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-accent-500 to-blue-500 text-white"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            {!isEditing ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">Set your display name</p>
                    <p className="text-sm text-white/80">
                      This is how you&apos;ll appear on leaderboards and to other naturalists
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-1.5 bg-white text-accent-600 font-medium rounded-lg hover:bg-white/90 transition-colors"
                  >
                    Set Name
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="Dismiss"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name (e.g., NatureExplorer)"
                    className="w-full px-3 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                    autoFocus
                    maxLength={50}
                    disabled={loading}
                  />
                  {error && (
                    <p className="text-xs text-red-200 mt-1">{error}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-white text-accent-600 font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
