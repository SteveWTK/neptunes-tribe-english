"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { BookmarkPlus, BookmarkCheck, X } from "lucide-react";
import { toast } from "sonner";

export default function GlossaryTooltip({
  term,
  translation,
  notes,
  children,
  onSave,
  isSaved = false,
  selectedLanguage = "pt",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  // Track if component is mounted (for portal)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Calculate tooltip position
  useEffect(() => {
    if (isOpen && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // For fixed positioning with portal, use viewport coordinates directly
      // getBoundingClientRect() already gives us viewport-relative positions
      let top = triggerRect.bottom + 8;
      let left = triggerRect.left;

      // Adjust if tooltip goes off right edge
      if (left + tooltipRect.width > viewportWidth) {
        left = viewportWidth - tooltipRect.width - 16;
      }

      // Adjust if tooltip goes off left edge
      if (left < 16) {
        left = 16;
      }

      // If tooltip goes off bottom, show above the trigger
      if (triggerRect.bottom + tooltipRect.height + 8 > viewportHeight) {
        top = triggerRect.top - tooltipRect.height - 8;
      }

      setPosition({ top, left });
    }
  }, [isOpen]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved || !onSave) return;

    setIsSaving(true);
    try {
      await onSave(term, translation);
    } catch (error) {
      console.error("Error saving word:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getTranslationText = () => {
    if (typeof translation === "string") {
      return translation;
    }
    return translation?.[selectedLanguage] || translation?.pt || "";
  };

  const tooltipContent = isOpen && mounted ? (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
          <div className="bg-white dark:bg-gray-800 border-2 border-teal-200 dark:border-teal-700 rounded-lg shadow-xl max-w-sm min-w-[180px]">
            {/* Header with close button */}
            <div className="flex items-start justify-between p-3 border-b border-teal-100 dark:border-teal-800">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                  {term}
                </h4>
                <p className="text-teal-700 dark:text-teal-300 text-sm mt-1">
                  {getTranslationText()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notes section */}
            {/* {notes && notes.trim().length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                  Notes:
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {notes}
                </p>
              </div>
            )} */}

            {/* Save button */}
            <div className="p-3">
              <button
                onClick={handleSaveClick}
                disabled={isSaved || isSaving}
                className={`w-full flex items-center justify-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isSaved
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default"
                    : "bg-primary-600 hover:bg-primary-700 text-white active:scale-95"
                }`}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Saved to Practice List</span>
                  </>
                ) : isSaving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
  ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        onClick={handleClick}
        className="glossary-term cursor-pointer relative inline-block transition-all duration-200 hover:border-b-2 hover:border-teal-600"
      >
        {children}
      </span>

      {mounted && tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
}
