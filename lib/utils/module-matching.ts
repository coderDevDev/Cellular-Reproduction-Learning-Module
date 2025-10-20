/**
 * Utility functions for matching student preferred modules with content learning styles
 */

// Mapping from student preferred modules to content learning style tags
export const MODULE_TO_STYLE_MAP: Record<string, string> = {
  'Visual': 'visual',
  'Aural': 'auditory',
  'Read/Write': 'reading_writing',
  'Kinesthetic': 'kinesthetic',
  'General Module': 'general'
};

// Reverse mapping for display purposes
export const STYLE_TO_MODULE_MAP: Record<string, string> = {
  'visual': 'Visual',
  'auditory': 'Aural',
  'reading_writing': 'Read/Write',
  'kinesthetic': 'Kinesthetic',
  'general': 'General Module'
};

/**
 * Check if a student can access content based on their preferred modules
 * @param studentPreferredModules - Array of student's preferred modules (e.g., ["Visual", "Aural", "Read/Write"])
 * @param contentLearningStyles - Array of content's learning style tags (e.g., ["visual", "reading_writing", "auditory", "kinesthetic"])
 * @returns true if student has access (at least one match)
 */
export function canAccessContent(
  studentPreferredModules: string[] | undefined | null,
  contentLearningStyles: string[] | undefined | null
): boolean {
  // If no preferred modules set, show all content (backward compatibility)
  if (!studentPreferredModules || studentPreferredModules.length === 0) {
    return true;
  }

  // If content has no learning styles specified, show to all students
  if (!contentLearningStyles || contentLearningStyles.length === 0) {
    return true;
  }

  // Check if any of the student's preferred modules match the content's learning styles
  return studentPreferredModules.some(module => {
    const mappedStyle = MODULE_TO_STYLE_MAP[module];
    return mappedStyle && contentLearningStyles.includes(mappedStyle);
  });
}

/**
 * Get the learning styles array from preferred modules
 * @param preferredModules - Array of preferred modules
 * @returns Array of learning style strings
 */
export function mapModulesToStyles(preferredModules: string[]): string[] {
  return preferredModules
    .map(module => MODULE_TO_STYLE_MAP[module])
    .filter(Boolean); // Remove undefined values
}

/**
 * Get the preferred modules array from learning styles
 * @param learningStyles - Array of learning styles
 * @returns Array of module names
 */
export function mapStylesToModules(learningStyles: string[]): string[] {
  return learningStyles
    .map(style => STYLE_TO_MODULE_MAP[style])
    .filter(Boolean); // Remove undefined values
}

/**
 * Filter modules based on student's preferred modules
 * @param modules - Array of VARK modules
 * @param studentPreferredModules - Student's preferred modules
 * @returns Filtered array of modules
 */
export function filterModulesByPreference<T extends { target_learning_styles?: string[] }>(
  modules: T[],
  studentPreferredModules: string[] | undefined | null
): T[] {
  // If no preferred modules, return all modules
  if (!studentPreferredModules || studentPreferredModules.length === 0) {
    return modules;
  }

  return modules.filter(module =>
    canAccessContent(studentPreferredModules, module.target_learning_styles)
  );
}

/**
 * Get a badge color based on module type
 * @param moduleName - Module name
 * @returns Tailwind CSS classes for badge
 */
export function getModuleBadgeColor(moduleName: string): string {
  switch (moduleName) {
    case 'Visual':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Aural':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Read/Write':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Kinesthetic':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'General Module':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
