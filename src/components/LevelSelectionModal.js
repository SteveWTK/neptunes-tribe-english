"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sparkles,
  BookOpen,
  Target,
  Award,
  Loader2,
} from "lucide-react";
import { getAllLevels } from "@/config/levelsConfig";
import { useLanguage } from "@/lib/contexts/LanguageContext";

// Translations for the level selection modal
const translations = {
  en: {
    title: "Choose Your Starting Level",
    subtitle:
      "Select a difficulty level that matches your English proficiency. You can change this anytime.",
    selectLevel: "Select Level",
    continueButton: "Continue",
    starting: "Starting...",
    recommended: "Recommended for beginners",
    levelSelected: "You selected:",
  },
  pt: {
    title: "Escolha Seu Nível Inicial",
    subtitle:
      "Selecione um nível de dificuldade que corresponda ao seu conhecimento de inglês. Você pode mudar isso a qualquer momento.",
    selectLevel: "Selecionar Nível",
    continueButton: "Continuar",
    starting: "Iniciando...",
    recommended: "Recomendado para iniciantes",
    levelSelected: "Você selecionou:",
  },
  th: {
    title: "เลือกระดับเริ่มต้นของคุณ",
    subtitle:
      "เลือกระดับความยากที่ตรงกับความสามารถภาษาอังกฤษของคุณ คุณสามารถเปลี่ยนได้ทุกเมื่อ",
    selectLevel: "เลือกระดับ",
    continueButton: "ดำเนินการต่อ",
    starting: "กำลังเริ่ม...",
    recommended: "แนะนำสำหรับผู้เริ่มต้น",
    levelSelected: "คุณเลือก:",
  },
};

// Icon mapping for levels (fallback icons if not in config)
const LEVEL_ICONS = {
  1: BookOpen,
  2: Target,
  3: Award,
};

/**
 * DEFAULT_LEVEL_ID - The default level to pre-select
 * Change this value to set a different default starting level
 * Options: "beginner", "intermediate", "advanced" (or any level id from levelsConfig)
 */
const DEFAULT_LEVEL_ID = "beginner";

/**
 * LevelSelectionModal - Allows new users to choose their starting difficulty level
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler (optional, for accessibility)
 * @param {Function} props.onSelect - Selection handler (receives levelId, levelValue)
 * @param {boolean} props.isSubmitting - Whether the selection is being processed
 */
export default function LevelSelectionModal({
  isOpen,
  onClose,
  onSelect,
  isSubmitting = false,
}) {
  const { lang } = useLanguage();
  const t = translations[lang] || translations.en;
  const allLevels = getAllLevels();

  // Pre-select the default level
  const defaultLevel =
    allLevels.find((l) => l.id === DEFAULT_LEVEL_ID) || allLevels[0];
  const [selectedLevelId, setSelectedLevelId] = useState(
    defaultLevel?.id || null
  );

  const selectedLevel = allLevels.find((l) => l.id === selectedLevelId);

  const handleContinue = () => {
    if (!selectedLevel) return;
    onSelect(selectedLevel.id, selectedLevel.value);
  };

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
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 px-6 py-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {t.title}
              </h2>
              <p className="text-white/90 text-sm md:text-base max-w-md mx-auto">
                {t.subtitle}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {allLevels.map((level, index) => {
                  const isSelected = selectedLevelId === level.id;
                  const IconComponent = LEVEL_ICONS[level.order] || BookOpen;
                  const isFirstLevel = index === 0;

                  return (
                    <motion.button
                      key={level.id}
                      onClick={() => setSelectedLevelId(level.id)}
                      className={`w-full text-left rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? "border-transparent shadow-lg scale-[1.02]"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
                      }`}
                      style={{
                        borderColor: isSelected
                          ? level.color?.primary
                          : undefined,
                      }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={`p-4 md:p-5 ${
                          isSelected
                            ? `linear-gradient(135deg, ${
                                level.color?.primary || "#f0fdf4"
                              } 0%, white 100%)`
                            : "bg-white dark:bg-gray-800"
                        }`}
                        style={{
                          backgroundImage: isSelected
                            ? `linear-gradient(135deg, ${
                                level.color?.dark || "#f0fdf4"
                              } 0%, ${level.color?.dark || "#f0fdf4"})`
                            : undefined,
                        }}
                      >
                        <div className="flex items-start gap-4">
                          {/* Level Icon */}
                          <div
                            className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all ${
                              isSelected ? "shadow-md" : ""
                            }`}
                            style={{
                              backgroundColor: isSelected
                                ? level.color?.primary
                                : level.color?.light || "#f0fdf4",
                              color: isSelected
                                ? "white"
                                : level.color?.primary || "#10b981",
                            }}
                          >
                            {level.icon ? (
                              <span className="text-2xl">{level.icon}</span>
                            ) : (
                              <IconComponent className="w-6 h-6 md:w-7 md:h-7" />
                            )}
                          </div>

                          {/* Level Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                {level.displayName}
                              </h3>
                              {isFirstLevel && (
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                                  {t.recommended}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                              {level.description}
                            </p>

                            {/* Characteristics */}
                            {/* {level.characteristics && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {level.characteristics.slice(0, 3).map((char, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md"
                                  >
                                    {char}
                                  </span>
                                ))}
                              </div>
                            )} */}
                          </div>

                          {/* Selection Indicator */}
                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                                style={{
                                  backgroundColor: level.color?.primary,
                                }}
                              >
                                <Check className="w-5 h-5 text-white" />
                              </motion.div>
                            ) : (
                              <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            {selectedLevel && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: selectedLevel.color?.primary }}
                    >
                      {selectedLevel.icon || selectedLevel.order}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t.levelSelected}
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {selectedLevel.displayName}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleContinue}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t.starting}</span>
                      </>
                    ) : (
                      <>
                        <span>{t.continueButton}</span>
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
