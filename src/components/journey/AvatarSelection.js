"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, AlertTriangle, Leaf, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// IUCN Status colors and labels
const IUCN_STATUS = {
  EX: { label: "Extinct", color: "bg-black", textColor: "text-white" },
  EW: {
    label: "Extinct in Wild",
    color: "bg-gray-800",
    textColor: "text-white",
  },
  CR: {
    label: "Critically Endangered",
    color: "bg-red-600",
    textColor: "text-white",
  },
  EN: { label: "Endangered", color: "bg-orange-500", textColor: "text-white" },
  VU: { label: "Vulnerable", color: "bg-yellow-500", textColor: "text-black" },
  NT: {
    label: "Near Threatened",
    color: "bg-lime-400",
    textColor: "text-black",
  },
  LC: {
    label: "Least Concern",
    color: "bg-green-500",
    textColor: "text-white",
  },
};

export default function AvatarSelection({ onComplete, isChangingAvatar = false }) {
  const router = useRouter();
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch available avatars
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await fetch("/api/species-avatars");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch avatars");
        }

        setAvatars(data.avatars);
      } catch (err) {
        console.error("Error fetching avatars:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  const handleSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setConfirming(true);
  };

  const handleConfirm = async () => {
    if (!selectedAvatar) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/user/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speciesAvatarId: selectedAvatar.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start journey");
      }

      // Call onComplete callback or redirect
      if (onComplete) {
        onComplete(data);
      } else {
        router.push("/worlds");
      }
    } catch (err) {
      console.error("Error starting journey:", err);
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600 dark:text-accent-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
          {isChangingAvatar ? "Change Your Species" : "Choose Your Species"}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {isChangingAvatar
            ? "Select a new endangered species to protect. Your previous progress will be reset."
            : "Select an endangered species to protect. Your journey will be to help them recover from their current conservation status to \"Least Concern\"."}
        </p>
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {avatars.map((avatar) => {
          const status = IUCN_STATUS[avatar.iucn_status];
          const isSelected = selectedAvatar?.id === avatar.id;

          return (
            <motion.button
              key={avatar.id}
              onClick={() => handleSelect(avatar)}
              className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                isSelected
                  ? "border-accent-500 bg-accent-50 dark:bg-accent-900/30 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-accent-300 dark:hover:border-accent-600 hover:shadow-md"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Avatar Image Placeholder */}
              <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-accent-100 to-blue-100 dark:from-accent-900/50 dark:to-blue-900/50 mb-3 flex items-center justify-center overflow-hidden">
                {avatar.avatar_image_url ? (
                  <img
                    src={avatar.avatar_image_url}
                    alt={avatar.common_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Leaf className="w-16 h-16 text-accent-400" />
                )}
              </div>

              {/* Species Name */}
              <h3 className="font-bold text-gray-800 dark:text-white mb-1">
                {avatar.common_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-2">
                {avatar.scientific_name}
              </p>

              {/* IUCN Status Badge */}
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.textColor}`}
              >
                <AlertTriangle className="w-3 h-3" />
                {status.label}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirming && selectedAvatar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !submitting && setConfirming(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                {/* Avatar Image */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-100 to-blue-100 dark:from-accent-900/50 dark:to-blue-900/50 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  {selectedAvatar.avatar_image_url ? (
                    <img
                      src={selectedAvatar.avatar_image_url}
                      alt={selectedAvatar.common_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Leaf className="w-12 h-12 text-accent-400" />
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {selectedAvatar.common_name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 italic mb-4">
                  {selectedAvatar.scientific_name}
                </p>

                {/* Status */}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    IUCN_STATUS[selectedAvatar.iucn_status].color
                  } ${IUCN_STATUS[selectedAvatar.iucn_status].textColor}`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Starting Status:{" "}
                  {IUCN_STATUS[selectedAvatar.iucn_status].label}
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {selectedAvatar.description}
                </p>
              </div>

              {/* Fun Fact */}
              {selectedAvatar.fun_fact && (
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-4 flex gap-3">
                  <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    <strong>Fun fact:</strong> {selectedAvatar.fun_fact}
                  </p>
                </div>
              )}

              {/* Conservation Note */}
              {selectedAvatar.conservation_note && (
                <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4 mb-6 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    {selectedAvatar.conservation_note}
                  </p>
                </div>
              )}

              {/* Warning */}
              <div className={`text-center text-sm mb-6 ${isChangingAvatar ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"}`}>
                {isChangingAvatar ? (
                  <>
                    <strong>Warning:</strong> Changing your species will reset all your progress.
                    You will start fresh with {selectedAvatar.common_name} at {IUCN_STATUS[selectedAvatar.iucn_status].label} status.
                  </>
                ) : (
                  <>
                    <strong>Note:</strong> Your mission is to help this species recover!
                  </>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirming(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Choose Different
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className={`flex-1 px-4 py-3 ${isChangingAvatar ? "bg-amber-500 hover:bg-amber-600" : "bg-accent-600 hover:bg-accent-700"} text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isChangingAvatar ? "Switching..." : "Starting..."}
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {isChangingAvatar ? "Switch Species" : "Start My Journey"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
