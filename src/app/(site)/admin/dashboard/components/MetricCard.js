"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * MetricCard - Displays a single metric with optional comparison change
 *
 * @param {string} label - The metric label
 * @param {number|string} value - The metric value
 * @param {number} change - Percentage change from previous period (optional)
 * @param {string} suffix - Suffix to append to value (e.g., "%")
 * @param {string} icon - Lucide icon component (optional)
 * @param {string} color - Accent color class (optional)
 */
export default function MetricCard({
  label,
  value,
  change,
  suffix = "",
  icon: Icon,
  color = "primary",
}) {
  const formatValue = (val) => {
    if (typeof val === "number") {
      return val.toLocaleString();
    }
    return val;
  };

  const getChangeColor = () => {
    if (change === undefined || change === null) return "";
    if (change > 0) return "text-green-600 dark:text-green-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-500 dark:text-gray-400";
  };

  const getChangeBgColor = () => {
    if (change === undefined || change === null) return "";
    if (change > 0) return "bg-green-100 dark:bg-green-900/30";
    if (change < 0) return "bg-red-100 dark:bg-red-900/30";
    return "bg-gray-100 dark:bg-gray-800";
  };

  const ChangeIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatValue(value)}
            {suffix && <span className="text-xl ml-0.5">{suffix}</span>}
          </p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
            <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        )}
      </div>

      {change !== undefined && change !== null && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getChangeBgColor()} ${getChangeColor()}`}
          >
            <ChangeIcon className="w-3 h-3" />
            {change > 0 ? "+" : ""}
            {change}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            vs previous period
          </span>
        </div>
      )}
    </div>
  );
}
