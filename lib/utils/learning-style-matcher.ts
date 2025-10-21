/**
 * Learning Style Matcher
 * Filters module sections based on student's preferred learning styles
 */

import { VARKModuleContentSection } from '@/types/vark-module';

/**
 * Mapping between student preferences and module learning style tags
 * 
 * Student JSON uses: "Visual", "Aural", "Read/Write", "Kinesthetic", "General Module"
 * Module sections use: 'visual', 'auditory', 'reading_writing', 'kinesthetic', 'everyone'
 * 
 * Special tags:
 * - 'everyone': Section is shown to ALL students regardless of their preferences
 * - 'General Module': Student preference to see all sections
 */
export const LEARNING_STYLE_MAP: Record<string, string> = {
  'Visual': 'visual',
  'Aural': 'auditory',
  'Read/Write': 'reading_writing',
  'Kinesthetic': 'kinesthetic',
  'General Module': 'all', // Special case: show all sections
  'Everyone': 'everyone' // Special tag for sections visible to all
};

/**
 * Reverse mapping for display purposes
 */
export const LEARNING_STYLE_DISPLAY: Record<string, string> = {
  'visual': 'Visual',
  'auditory': 'Aural',
  'reading_writing': 'Read/Write',
  'kinesthetic': 'Kinesthetic'
};

/**
 * Convert student preferred modules to module tag format
 * 
 * @param preferredModules - Array from student JSON ["Visual", "Aural", etc.]
 * @returns Normalized array ['visual', 'auditory', etc.]
 */
export function normalizePreferredModules(preferredModules: string[]): string[] {
  return preferredModules.map(pref => LEARNING_STYLE_MAP[pref] || pref.toLowerCase());
}

/**
 * Match mode for filtering sections
 * - 'OR': Section matches if ANY tag matches student preferences
 * - 'AND': Section matches only if ALL student preferences are in section tags (default)
 */
export type MatchMode = 'OR' | 'AND';

/**
 * Check if a section matches student's learning preferences
 * 
 * @param section - Module content section
 * @param studentPreferences - Student's preferred modules from JSON
 * @param matchMode - 'OR' (any match) or 'AND' (all match). Default: 'AND'
 * @returns true if section matches student's preferences
 */
export function sectionMatchesPreferences(
  section: VARKModuleContentSection,
  studentPreferences: string[],
  matchMode: MatchMode = 'AND'
): boolean {
  // ✅ PRIORITY 1: If section is tagged as "everyone", ALWAYS show it
  if (section.learning_style_tags && section.learning_style_tags.includes('everyone')) {
    return true;
  }

  // PRIORITY 2: If student has "General Module", show ALL sections
  if (studentPreferences.includes('General Module')) {
    return true;
  }

  // Normalize student preferences
  const normalizedPrefs = normalizePreferredModules(studentPreferences);

  // PRIORITY 3: If section has no learning style tags, show it (universal content)
  if (!section.learning_style_tags || section.learning_style_tags.length === 0) {
    return true;
  }

  if (matchMode === 'AND') {
    // AND mode: Section must have ALL of student's preferences
    // Every student preference must be found in section tags
    const allMatch = normalizedPrefs.every(pref =>
      section.learning_style_tags.includes(pref)
    );
    return allMatch;
  } else {
    // OR mode (default): Section matches if ANY tag matches
    // At least one student preference must be found in section tags
    const anyMatch = section.learning_style_tags.some(tag =>
      normalizedPrefs.includes(tag)
    );
    return anyMatch;
  }
}

/**
 * Filter sections based on student's learning preferences
 * 
 * @param sections - All module sections
 * @param studentPreferences - Student's preferred modules from JSON
 * @param matchMode - 'OR' (any match) or 'AND' (all match). Default: 'AND'
 * @returns Filtered sections that match student's preferences
 */
export function filterSectionsByPreferences(
  sections: VARKModuleContentSection[],
  studentPreferences: string[],
  matchMode: MatchMode = 'AND'
): VARKModuleContentSection[] {
  // If "General Module" or empty preferences, return all sections
  if (!studentPreferences || 
      studentPreferences.length === 0 || 
      studentPreferences.includes('General Module')) {
    return sections;
  }

  // Filter sections that match preferences
  return sections.filter(section =>
    sectionMatchesPreferences(section, studentPreferences, matchMode)
  );
}

/**
 * Get section match score (how well it matches student preferences)
 * Higher score = better match
 * 
 * @param section - Module content section
 * @param studentPreferences - Student's preferred modules
 * @returns Score from 0 to 1
 */
export function getSectionMatchScore(
  section: VARKModuleContentSection,
  studentPreferences: string[]
): number {
  // ✅ If section is tagged "everyone", perfect score (always relevant)
  if (section.learning_style_tags && section.learning_style_tags.includes('everyone')) {
    return 1;
  }

  // If "General Module", all sections score 1
  if (studentPreferences.includes('General Module')) {
    return 1;
  }

  // Normalize preferences
  const normalizedPrefs = normalizePreferredModules(studentPreferences);

  // If no tags, consider it universal (score 0.5)
  if (!section.learning_style_tags || section.learning_style_tags.length === 0) {
    return 0.5;
  }

  // Count matching tags
  const matchingTags = section.learning_style_tags.filter(tag =>
    normalizedPrefs.includes(tag)
  );

  // Score = (matching tags) / (total student preferences)
  // This gives higher scores to sections that match more of student's styles
  return matchingTags.length / normalizedPrefs.length;
}

/**
 * Sort sections by match score (best matches first)
 * 
 * @param sections - Module sections
 * @param studentPreferences - Student's preferred modules
 * @returns Sections sorted by relevance
 */
export function sortSectionsByRelevance(
  sections: VARKModuleContentSection[],
  studentPreferences: string[]
): VARKModuleContentSection[] {
  return [...sections].sort((a, b) => {
    const scoreA = getSectionMatchScore(a, studentPreferences);
    const scoreB = getSectionMatchScore(b, studentPreferences);
    return scoreB - scoreA; // Descending order (best first)
  });
}

/**
 * Filter AND sort sections by student preferences
 * 
 * @param sections - All module sections
 * @param studentPreferences - Student's preferred modules
 * @param options - Configuration options
 * @returns Filtered and sorted sections
 */
export function getRelevantSections(
  sections: VARKModuleContentSection[],
  studentPreferences: string[],
  options?: {
    filterStrict?: boolean; // If true, ONLY show matching sections
    sortByRelevance?: boolean; // If true, sort by match score
    matchMode?: MatchMode; // 'OR' or 'AND' matching. Default: 'OR'
  }
): VARKModuleContentSection[] {
  const { 
    filterStrict = false, 
    sortByRelevance = true,
    matchMode = 'AND'
  } = options || {};

  let result = sections;

  // Apply filtering if strict mode
  if (filterStrict) {
    result = filterSectionsByPreferences(result, studentPreferences, matchMode);
  }

  // Apply sorting by relevance
  if (sortByRelevance) {
    result = sortSectionsByRelevance(result, studentPreferences);
  }

  return result;
}

/**
 * Get statistics about section matching
 * 
 * @param sections - Module sections
 * @param studentPreferences - Student's preferred modules
 * @returns Statistics object
 */
export function getSectionMatchStats(
  sections: VARKModuleContentSection[],
  studentPreferences: string[]
) {
  const totalSections = sections.length;
  const matchingSections = filterSectionsByPreferences(sections, studentPreferences).length;
  const matchPercentage = (matchingSections / totalSections) * 100;

  const scoreDistribution = sections.map(section => ({
    id: section.id,
    title: section.title,
    score: getSectionMatchScore(section, studentPreferences),
    tags: section.learning_style_tags
  }));

  return {
    totalSections,
    matchingSections,
    nonMatchingSections: totalSections - matchingSections,
    matchPercentage: Math.round(matchPercentage),
    scoreDistribution
  };
}
