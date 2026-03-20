"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Species Selection Modal
 * Allows users to choose a species to save for an adventure
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSelect - Selection handler (speciesId, adventureId, worldId)
 * @param {Array} props.species - Array of species options with {id, common_name, scientific_name, avatar_image_url, iucn_status, description, habitat}
 * @param {string} props.adventureName - Name of the adventure
 * @param {string} props.adventureId - ID of the adventure
 * @param {string} props.worldId - ID of the world/biome
 * @param {string} props.worldName - Name of the world/biome
 */
export default function SpeciesSelectionModal({
  isOpen,
  onClose,
  onSelect,
  species = [],
  adventureName = "",
  adventureId = "",
  worldId = "",
  worldName = "",
}) {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = async () => {
    if (!selectedSpeciesId) {
      toast.error("Please select a species to save");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSelect(selectedSpeciesId, adventureId, worldId);
      // Modal will be closed by parent component after successful selection
    } catch (error) {
      console.error("Error selecting species:", error);
      toast.error("Failed to start adventure. Please try again.");
      setIsSubmitting(false);
    }
  };

  const selectedSpecies = species.find((s) => s.id === selectedSpeciesId);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Choose a Species to Save
                </h2>
                <p className="text-white/90 text-sm">
                  {adventureName} • {worldName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Intro Text */}
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-medium mb-1">Your Mission:</p>
                    <p>
                      Select one endangered species from this habitat. As you complete each lesson in the adventure, you'll move the species up through IUCN conservation levels from <span className="font-semibold text-red-600 dark:text-red-400">Critically Endangered</span> to <span className="font-semibold text-green-600 dark:text-green-400">Least Concern</span>, symbolically saving them!
                    </p>
                  </div>
                </div>
              </div>

              {/* Species Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {species.map((sp) => {
                  const isSelected = selectedSpeciesId === sp.id;

                  return (
                    <motion.button
                      key={sp.id}
                      onClick={() => setSelectedSpeciesId(sp.id)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
                        isSelected
                          ? "border-accent-500 shadow-lg scale-105"
                          : "border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-md"
                      }`}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Selection Indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 z-10 w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Check className="w-5 h-5 text-white" />
                        </motion.div>
                      )}

                      {/* Image */}
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                        {sp.avatar_image_url ? (
                          <img
                            src={sp.avatar_image_url}
                            alt={sp.common_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-4xl">🐾</span>
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* IUCN Status Badge */}
                        <div className="absolute top-2 left-2">
                          <div className="bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold">
                            {sp.iucn_status || "CR"}
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 bg-white dark:bg-gray-800">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                          {sp.common_name}
                        </h3>
                        {sp.scientific_name && (
                          <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-2">
                            {sp.scientific_name}
                          </p>
                        )}
                        {sp.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                            {sp.description}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Empty State */}
              {species.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    No species available for this adventure yet.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Check back soon or try another adventure!
                  </p>
                </div>
              )}
            </div>

            {/* Footer with selection details and action */}
            {selectedSpecies && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedSpecies.avatar_image_url}
                      alt={selectedSpecies.common_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-accent-500"
                    />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        You'll be saving:
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {selectedSpecies.common_name}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSelect}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Starting Adventure...</span>
                      </>
                    ) : (
                      <>
                        <span>Start Adventure</span>
                        <Check className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
