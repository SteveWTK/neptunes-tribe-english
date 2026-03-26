/**
 * Game Constants
 *
 * Centralized configuration values for the game mechanics.
 * Change values here to update them across the entire application.
 */

/**
 * Minimum XP required in a single lesson to advance the species IUCN status.
 * Users must earn at least this much XP to count the lesson as "completed"
 * for species progression purposes.
 */
export const XP_THRESHOLD_FOR_IUCN_ADVANCE = 100;

/**
 * IUCN status progression order (from most endangered to least concern)
 * CR = Critically Endangered
 * EN = Endangered
 * VU = Vulnerable
 * NT = Near Threatened
 * LC = Least Concern
 */
export const IUCN_PROGRESSION = ["CR", "EN", "VU", "NT", "LC"];

/**
 * Human-readable labels for IUCN statuses
 */
export const IUCN_STATUS_LABELS = {
  CR: "Critically Endangered",
  EN: "Endangered",
  VU: "Vulnerable",
  NT: "Near Threatened",
  LC: "Least Concern",
};

/**
 * Number of lessons required to complete an adventure and fully save a species
 */
export const LESSONS_PER_ADVENTURE = 5;
