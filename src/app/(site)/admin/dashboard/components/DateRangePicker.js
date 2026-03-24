"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";

const PRESETS = [
  { label: "Today", getValue: () => ({ start: new Date(), end: new Date() }) },
  { label: "Last 7 days", getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: "Last 30 days", getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: "This month", getValue: () => ({ start: startOfMonth(new Date()), end: new Date() }) },
  { label: "Last month", getValue: () => {
    const lastMonth = subMonths(new Date(), 1);
    return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
  }},
  { label: "This year", getValue: () => ({ start: startOfYear(new Date()), end: new Date() }) },
];

const COMPARE_MODES = [
  { value: "previous_period", label: "Previous period" },
  { value: "same_period_last_year", label: "Same period last year" },
];

/**
 * DateRangePicker - Date range selector with presets and comparison mode
 *
 * @param {Object} dateRange - { start: Date, end: Date }
 * @param {Function} onChange - Callback with new date range
 * @param {string} compareMode - 'previous_period' | 'same_period_last_year'
 * @param {Function} onCompareModeChange - Callback when compare mode changes
 */
export default function DateRangePicker({
  dateRange,
  onChange,
  compareMode = "previous_period",
  onCompareModeChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState("Last 30 days");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePresetClick = (preset) => {
    const { start, end } = preset.getValue();
    setActivePreset(preset.label);
    onChange({ start, end });
    setIsOpen(false);
  };

  const handleCompareModeChange = (mode) => {
    onCompareModeChange?.(mode);
  };

  const formatDateRange = () => {
    if (!dateRange.start || !dateRange.end) return "Select date range";
    const startStr = format(dateRange.start, "MMM d, yyyy");
    const endStr = format(dateRange.end, "MMM d, yyyy");
    if (startStr === endStr) return startStr;
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Calendar className="w-4 h-4" />
        <span>{formatDateRange()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Presets */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <p className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Quick Select
            </p>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  activePreset === preset.label
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span>{preset.label}</span>
                {activePreset === preset.label && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* Compare Mode */}
          {onCompareModeChange && (
            <div className="p-2">
              <p className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Compare To
              </p>
              {COMPARE_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => handleCompareModeChange(mode.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    compareMode === mode.value
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span>{mode.label}</span>
                  {compareMode === mode.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}

          {/* Custom Date Range - future enhancement */}
          {/* <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Custom date range coming soon
            </p>
          </div> */}
        </div>
      )}
    </div>
  );
}
