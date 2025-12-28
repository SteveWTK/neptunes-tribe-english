/**
 * Utility functions for glossary feature
 */

/**
 * Parse text and identify glossary terms
 * Supports both single words and multi-word phrases
 * Prioritizes longer phrases over shorter ones to avoid conflicts
 *
 * @param {string} text - The text to parse
 * @param {Array} glossaryTerms - Array of glossary objects with { term, translation_pt, notes, etc. }
 * @returns {Array} - Array of text segments, some marked as glossary terms
 */
export function parseTextWithGlossary(text, glossaryTerms) {
  if (!text || !glossaryTerms || glossaryTerms.length === 0) {
    return [{ type: 'text', content: text }];
  }

  // Sort terms by length (longest first) to match phrases before individual words
  const sortedTerms = [...glossaryTerms].sort((a, b) =>
    b.term.length - a.term.length
  );

  // Create a map for quick lookup
  const termMap = new Map();
  sortedTerms.forEach(term => {
    termMap.set(term.term.toLowerCase(), term);
  });

  // Create regex pattern that matches all terms (word boundaries for whole words)
  // Escape special regex characters in terms
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const pattern = sortedTerms
    .map(term => `\\b${escapeRegex(term.term)}\\b`)
    .join('|');

  if (!pattern) {
    return [{ type: 'text', content: text }];
  }

  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);

  // Build segments array
  const segments = [];
  const matchedIndices = new Set(); // Track which parts are already matched

  parts.forEach((part, index) => {
    if (!part) return; // Skip empty strings

    const lowerPart = part.toLowerCase();
    const glossaryEntry = termMap.get(lowerPart);

    if (glossaryEntry && !matchedIndices.has(index)) {
      segments.push({
        type: 'glossary',
        content: part, // Keep original case
        term: glossaryEntry.term,
        translation: glossaryEntry.translation_pt,
        translation_es: glossaryEntry.translation_es,
        translation_fr: glossaryEntry.translation_fr,
        notes: glossaryEntry.notes,
        glossaryId: glossaryEntry.id,
      });
      matchedIndices.add(index);
    } else {
      segments.push({
        type: 'text',
        content: part,
      });
    }
  });

  return segments;
}

/**
 * Filter glossary terms by difficulty level
 *
 * @param {Array} glossaryTerms - Array of glossary objects
 * @param {string} userLevel - User's current level ('Beginner', 'Intermediate', 'Advanced')
 * @returns {Array} - Filtered glossary terms
 */
export function filterGlossaryByLevel(glossaryTerms, userLevel) {
  if (!glossaryTerms || !userLevel) return glossaryTerms;

  // Map levels to numeric values for comparison
  const levelMap = {
    'Beginner': 1,
    'Intermediate': 2,
    'Advanced': 3,
  };

  const userLevelNum = levelMap[userLevel] || 1;

  return glossaryTerms.filter(term => {
    // Always include terms marked as 'all'
    if (!term.difficulty_level || term.difficulty_level === 'all') {
      return true;
    }

    // Include terms at or below user's level
    const termLevelNum = levelMap[term.difficulty_level] || 1;
    return termLevelNum <= userLevelNum;
  });
}

/**
 * Fetch glossary terms from Supabase
 *
 * @param {Object} supabase - Supabase client
 * @param {string} userLevel - User's current level (optional)
 * @returns {Promise<Array>} - Array of glossary terms
 */
export async function fetchGlossaryTerms(supabase, userLevel = null) {
  try {
    let query = supabase
      .from('glossary')
      .select('*')
      .order('term', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching glossary:', error);
      return [];
    }

    // Filter by level if provided
    if (userLevel) {
      return filterGlossaryByLevel(data || [], userLevel);
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchGlossaryTerms:', error);
    return [];
  }
}
