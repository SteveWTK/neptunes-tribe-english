"use client";

import React, { createContext, useContext, useMemo } from "react";
import { defaultConfig } from "../../config/defaultConfig";
import { themes } from "../../config/themes";

// Create context
const AppConfigContext = createContext(null);

/**
 * Deep merge utility for config objects
 */
function deepMerge(target, source) {
  const output = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }

  return output;
}

/**
 * Provider component that wraps the app and provides config
 *
 * @param {Object} config - App-specific config from inspire.config.js
 * @param {React.ReactNode} children
 */
export function AppConfigProvider({ config = {}, children }) {
  // Merge app config with defaults
  const mergedConfig = useMemo(() => {
    const merged = deepMerge(defaultConfig, config);

    // Attach the resolved theme object
    merged.resolvedTheme = themes[merged.theme] || themes.nature;

    return merged;
  }, [config]);

  return (
    <AppConfigContext.Provider value={mergedConfig}>
      {children}
    </AppConfigContext.Provider>
  );
}

/**
 * Hook to access the app configuration
 *
 * @returns {Object} The merged app configuration
 * @throws {Error} If used outside of AppConfigProvider
 *
 * @example
 * const config = useAppConfig();
 * console.log(config.appName); // "Habitat English"
 * console.log(config.contentPins.singular); // "observation"
 */
export function useAppConfig() {
  const context = useContext(AppConfigContext);

  if (!context) {
    // Return default config if no provider (for backwards compatibility)
    console.warn(
      "useAppConfig: No AppConfigProvider found. Using default config. " +
      "Wrap your app with <AppConfigProvider config={yourConfig}> for custom configuration."
    );
    return { ...defaultConfig, resolvedTheme: themes.nature };
  }

  return context;
}

/**
 * Hook to get just the theme configuration
 *
 * @returns {Object} The resolved theme object
 */
export function useTheme() {
  const config = useAppConfig();
  return config.resolvedTheme;
}

/**
 * Hook to check if a feature is enabled
 *
 * @param {string} featureName - Name of the feature to check
 * @returns {boolean} Whether the feature is enabled
 *
 * @example
 * const hasDarkMode = useFeature('darkMode');
 */
export function useFeature(featureName) {
  const config = useAppConfig();
  return config.features?.[featureName] ?? false;
}

export default AppConfigContext;
