"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear, parseISO, startOfDay, endOfDay } from "date-fns";

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
  { value: "custom", label: "Custom period" },
];

/**
 * DateRangePicker - Date range selector with presets, custom range, and comparison mode
 *
 * @param {Object} dateRange - { start: Date, end: Date }
 * @param {Function} onChange - Callback with new date range
 * @param {string} compareMode - 'previous_period' | 'same_period_last_year' | 'custom'
 * @param {Function} onCompareModeChange - Callback when compare mode changes
 * @param {Object} customCompareRange - { start: Date, end: Date } for custom comparison
 * @param {Function} onCustomCompareRangeChange - Callback for custom comparison range
 */
export default function DateRangePicker({
  dateRange,
  onChange,
  compareMode = "previous_period",
  onCompareModeChange,
  customCompareRange,
  onCustomCompareRangeChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState("Last 30 days");
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [customCompareStart, setCustomCompareStart] = useState("");
  const [customCompareEnd, setCustomCompareEnd] = useState("");
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

  // Sync custom date inputs when dateRange changes from preset
  useEffect(() => {
    if (dateRange.start && dateRange.end && !showCustomRange) {
      setCustomStart(format(dateRange.start, "yyyy-MM-dd"));
      setCustomEnd(format(dateRange.end, "yyyy-MM-dd"));
    }
  }, [dateRange, showCustomRange]);

  // Sync custom compare inputs when customCompareRange changes
  useEffect(() => {
    if (customCompareRange?.start && customCompareRange?.end) {
      setCustomCompareStart(format(customCompareRange.start, "yyyy-MM-dd"));
      setCustomCompareEnd(format(customCompareRange.end, "yyyy-MM-dd"));
    }
  }, [customCompareRange]);

  const handlePresetClick = (preset) => {
    const { start, end } = preset.getValue();
    setActivePreset(preset.label);
    setShowCustomRange(false);
    onChange({ start, end });
    setIsOpen(false);
  };

  const handleCustomRangeToggle = () => {
    setShowCustomRange(true);
    setActivePreset(null);
  };

  const handleCustomRangeApply = () => {
    if (customStart && customEnd) {
      const start = startOfDay(parseISO(customStart));
      const end = endOfDay(parseISO(customEnd));
      if (start <= end) {
        setActivePreset(null);
        onChange({ start, end });
        setIsOpen(false);
        setShowCustomRange(false);
      }
    }
  };

  const handleCompareModeChange = (mode) => {
    onCompareModeChange?.(mode);
  };

  const handleCustomCompareApply = () => {
    if (customCompareStart && customCompareEnd && onCustomCompareRangeChange) {
      const start = startOfDay(parseISO(customCompareStart));
      const end = endOfDay(parseISO(customCompareEnd));
      if (start <= end) {
        onCustomCompareRangeChange({ start, end });
      }
    }
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
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
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
            {/* Custom Range Toggle */}
            <button
              onClick={handleCustomRangeToggle}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                showCustomRange
                  ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span>Custom range...</span>
              {showCustomRange && <Check className="w-4 h-4" />}
            </button>
          </div>

          {/* Custom Date Range Inputs */}
          {showCustomRange && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Custom Date Range
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400 w-12">From</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400 w-12">To</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleCustomRangeApply}
                  disabled={!customStart || !customEnd}
                  className="mt-1 w-full px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Apply Range
                </button>
              </div>
            </div>
          )}

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

          {/* Custom Compare Period Inputs */}
          {compareMode === "custom" && onCustomCompareRangeChange && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Custom Comparison Period
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400 w-12">From</label>
                  <input
                    type="date"
                    value={customCompareStart}
                    onChange={(e) => setCustomCompareStart(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400 w-12">To</label>
                  <input
                    type="date"
                    value={customCompareEnd}
                    onChange={(e) => setCustomCompareEnd(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleCustomCompareApply}
                  disabled={!customCompareStart || !customCompareEnd}
                  className="mt-1 w-full px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Apply Comparison
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
