"use client";

import { X, Filter } from "lucide-react";

/**
 * FilterBar - Multi-filter component with dropdowns
 *
 * @param {Object} filters - Current filter values
 * @param {Function} onChange - Callback when a filter changes
 * @param {Object} options - Available options for each filter
 * @param {Function} onReset - Callback to reset all filters
 */
export default function FilterBar({
  filters,
  onChange,
  options = {},
  onReset,
}) {
  const handleFilterChange = (key, value) => {
    onChange({ ...filters, [key]: value || null });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== null && v !== "all");

  const SelectFilter = ({ filterKey, label, filterOptions, placeholder }) => (
    <div className="relative">
      <select
        value={filters[filterKey] || ""}
        onChange={(e) => handleFilterChange(filterKey, e.target.value)}
        className="appearance-none w-full md:w-auto px-4 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
      >
        <option value="">{placeholder || `All ${label}`}</option>
        {filterOptions?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        {/* User Type Filter */}
        {options.userTypes && (
          <SelectFilter
            filterKey="userType"
            label="User Type"
            filterOptions={options.userTypes}
            placeholder="All Users"
          />
        )}

        {/* World Filter */}
        {options.worlds && (
          <SelectFilter
            filterKey="worldId"
            label="World"
            filterOptions={options.worlds}
            placeholder="All Worlds"
          />
        )}

        {/* Adventure Filter */}
        {options.adventures && (
          <SelectFilter
            filterKey="adventureId"
            label="Adventure"
            filterOptions={options.adventures}
            placeholder="All Adventures"
          />
        )}

        {/* Campaign Filter */}
        {options.campaigns && (
          <SelectFilter
            filterKey="campaignId"
            label="Campaign"
            filterOptions={options.campaigns}
            placeholder="All Campaigns"
          />
        )}

        {/* Device Type Filter */}
        {options.devices && (
          <SelectFilter
            filterKey="deviceType"
            label="Device"
            filterOptions={options.devices}
            placeholder="All Devices"
          />
        )}

        {/* Conversion Status Filter */}
        {options.conversionStatus && (
          <SelectFilter
            filterKey="conversionStatus"
            label="Conversion"
            filterOptions={options.conversionStatus}
            placeholder="All Status"
          />
        )}

        {/* Upgrade Source Filter */}
        {options.upgradeSources && (
          <SelectFilter
            filterKey="upgradeSource"
            label="Source"
            filterOptions={options.upgradeSources}
            placeholder="All Sources"
          />
        )}

        {/* Reset Button */}
        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
