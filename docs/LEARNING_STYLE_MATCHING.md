# Learning Style Matching System

## Problem Identified

### The Naming Mismatch ⚠️

**Student JSON** (`student_logins.json`):
```json
{
  "preferred_modules": ["Visual", "Aural", "Read/Write", "Kinesthetic"]
}
```

**Module Sections** (`content_structure.sections`):
```typescript
{
  learning_style_tags: ['visual', 'auditory', 'reading_writing', 'kinesthetic']
}
```

### Issues:
1. ❌ "Aural" vs "auditory" (different names!)
2. ❌ "Read/Write" vs "reading_writing" (different format!)
3. ❌ Title Case vs lowercase
4. ❌ "General Module" has no mapping

---

## Solution: Learning Style Matcher

### Mapping Table

| Student Preference | Module Tag | Match? |
|-------------------|------------|---------|
| `"Visual"` | `'visual'` | ✅ |
| `"Aural"` | `'auditory'` | ✅ (mapped) |
| `"Read/Write"` | `'reading_writing'` | ✅ (mapped) |
| `"Kinesthetic"` | `'kinesthetic'` | ✅ |
| `"General Module"` | `all` | ✅ (show all) |

---

## Usage Examples

### Example 1: Basic Filtering

```typescript
import { filterSectionsByPreferences } from '@/lib/utils/learning-style-matcher';

// Student data
const student = {
  name: "Aiden Austria",
  preferred_modules: ["Aural", "Read/Write"] // From JSON
};

// Module sections
const allSections = module.content_structure.sections;

// Filter sections matching student preferences
const relevantSections = filterSectionsByPreferences(
  allSections,
  student.preferred_modules
);

// Result: Only sections with 'auditory' or 'reading_writing' tags
console.log(`Showing ${relevantSections.length} of ${allSections.length} sections`);
```

**Output:**
```
Section 1: ✅ Matched (tags: ['auditory', 'reading_writing'])
Section 2: ❌ Skipped (tags: ['visual', 'kinesthetic'])
Section 3: ✅ Matched (tags: ['reading_writing'])
```

---

### Example 2: In Module Viewer Component

```typescript
// components/vark-modules/personalized-module-viewer.tsx

import { useMemo } from 'react';
import { filterSectionsByPreferences } from '@/lib/utils/learning-style-matcher';

interface Props {
  module: VARKModule;
  studentPreferences: string[]; // From logged-in student
}

export function PersonalizedModuleViewer({ module, studentPreferences }: Props) {
  // Filter sections based on student preferences
  const filteredSections = useMemo(() => {
    return filterSectionsByPreferences(
      module.content_structure.sections,
      studentPreferences
    );
  }, [module.content_structure.sections, studentPreferences]);

  return (
    <div>
      <h2>{module.title}</h2>
      <p>Showing {filteredSections.length} personalized sections</p>
      
      {filteredSections.map(section => (
        <SectionCard key={section.id} section={section} />
      ))}
    </div>
  );
}
```

---

### Example 3: With Relevance Sorting

```typescript
import { getRelevantSections } from '@/lib/utils/learning-style-matcher';

const student = {
  preferred_modules: ["Visual", "Aural", "Read/Write"] // Trimodal
};

// Get sections filtered AND sorted by relevance
const sections = getRelevantSections(
  allSections,
  student.preferred_modules,
  {
    filterStrict: false,    // Show all, but prioritize matches
    sortByRelevance: true   // Best matches first
  }
);

// Sections with more matching tags appear first!
```

**Result:**
```
Section 1: Score 1.00 (matches all 3 preferences) ⭐⭐⭐
Section 2: Score 0.67 (matches 2 of 3)           ⭐⭐
Section 3: Score 0.33 (matches 1 of 3)           ⭐
Section 4: Score 0.00 (no matches)               
```

---

### Example 4: Statistics Dashboard

```typescript
import { getSectionMatchStats } from '@/lib/utils/learning-style-matcher';

const stats = getSectionMatchStats(
  module.content_structure.sections,
  student.preferred_modules
);

console.log(stats);
// Output:
{
  totalSections: 15,
  matchingSections: 10,
  nonMatchingSections: 5,
  matchPercentage: 67,
  scoreDistribution: [
    { id: 'sec-1', title: 'Intro', score: 1.0, tags: ['visual', 'auditory'] },
    { id: 'sec-2', title: 'Quiz', score: 0.5, tags: ['kinesthetic'] },
    ...
  ]
}
```

---

## Real-World Scenarios

### Scenario 1: Unimodal Student

**Student:**
```json
{
  "name": "Aaron Buena",
  "preferred_modules": ["Read/Write"],
  "type": "Unimodal"
}
```

**Filtering Result:**
```typescript
// Original: 15 sections
// Filtered: 8 sections (only 'reading_writing' tagged)
// Hidden: 7 sections (visual/auditory/kinesthetic only)
```

---

### Scenario 2: Multimodal Student

**Student:**
```json
{
  "name": "Joseph Encinas",
  "preferred_modules": ["Visual", "Aural", "Read/Write", "Kinesthetic"],
  "type": "Multimodal"
}
```

**Filtering Result:**
```typescript
// Original: 15 sections
// Filtered: 15 sections (matches ALL tags!)
// Hidden: 0 sections
```

---

### Scenario 3: General Module Student

**Student:**
```json
{
  "name": "Ronnie Barrosa",
  "preferred_modules": ["General Module"],
  "type": null
}
```

**Filtering Result:**
```typescript
// Original: 15 sections
// Filtered: 15 sections (ALL sections shown)
// Hidden: 0 sections (General = show everything)
```

---

## Implementation Strategies

### Strategy 1: Strict Filtering (Recommended for Personalization)

```typescript
// ONLY show sections matching student preferences
const sections = filterSectionsByPreferences(
  allSections,
  studentPreferences
);
// ✅ Personalized experience
// ❌ Some content might be hidden
```

**Best for:**
- Students with clear learning style preferences
- Focused learning experience
- Reducing cognitive overload

---

### Strategy 2: Soft Sorting (Recommended for Discovery)

```typescript
// Show ALL sections, but prioritize matches
const sections = getRelevantSections(
  allSections,
  studentPreferences,
  {
    filterStrict: false,    // Don't hide anything
    sortByRelevance: true   // Just reorder
  }
);
// ✅ All content accessible
// ✅ Best matches appear first
// ❌ Longer list to scroll
```

**Best for:**
- Exploratory learning
- Students wanting full content access
- Teachers reviewing modules

---

### Strategy 3: Hybrid (Best of Both Worlds)

```typescript
// Show matches prominently, others collapsed
const matchingSections = filterSectionsByPreferences(allSections, prefs);
const otherSections = allSections.filter(s => !matchingSections.includes(s));

return (
  <>
    <h3>📌 Recommended for You</h3>
    {matchingSections.map(s => <SectionCard section={s} />)}
    
    <details>
      <summary>👀 View All Other Sections ({otherSections.length})</summary>
      {otherSections.map(s => <SectionCard section={s} dimmed />)}
    </details>
  </>
);
```

**Best for:**
- Balance between personalization and discovery
- Allow students to see "other" content if interested
- Progressive disclosure UI pattern

---

## API Integration Example

```typescript
// On student login
import { filterSectionsByPreferences } from '@/lib/utils/learning-style-matcher';

export async function getPersonalizedModule(
  moduleId: string,
  studentUsername: string
) {
  // 1. Get student data
  const student = await getStudentByUsername(studentUsername);
  // student.preferred_modules = ["Visual", "Aural"]
  
  // 2. Get module data
  const module = await getModuleById(moduleId);
  
  // 3. Filter sections
  const personalizedSections = filterSectionsByPreferences(
    module.content_structure.sections,
    student.preferred_modules
  );
  
  // 4. Return personalized module
  return {
    ...module,
    content_structure: {
      ...module.content_structure,
      sections: personalizedSections
    },
    _original_section_count: module.content_structure.sections.length,
    _personalized_section_count: personalizedSections.length
  };
}
```

---

## Best Practices

### ✅ DO:
1. **Always normalize** student preferences before matching
2. **Handle "General Module"** specially (show all)
3. **Sort by relevance** for better UX
4. **Show statistics** (e.g., "8 of 15 sections match your style")
5. **Allow override** (let students view all if they want)

### ❌ DON'T:
1. **Hard-code** mappings directly in components
2. **Assume** case sensitivity matches
3. **Hide required sections** (check `is_required: true`)
4. **Ignore** sections with no tags (treat as universal)
5. **Force strict filtering** on all students

---

## Edge Cases Handled

### 1. Empty Learning Style Tags
```typescript
section.learning_style_tags = []; // or undefined
// ✅ Treated as UNIVERSAL - shown to all students
```

### 2. No Student Preferences
```typescript
student.preferred_modules = null; // or []
// ✅ Show ALL sections
```

### 3. Required Sections
```typescript
// Even if not matching preferences, show required sections
if (section.is_required) {
  return true; // Always include
}
```

### 4. Mixed Case Input
```typescript
// Works with any case
["VISUAL", "aural", "Read/Write"] → normalized correctly
```

---

## Performance Considerations

### Optimization 1: Memoization
```typescript
const filteredSections = useMemo(
  () => filterSectionsByPreferences(sections, preferences),
  [sections, preferences]
);
```

### Optimization 2: Early Return
```typescript
// If "General Module", skip processing
if (prefs.includes('General Module')) {
  return sections; // No filtering needed
}
```

### Optimization 3: Indexing
```typescript
// Pre-compute normalized preferences once
const normalizedPrefs = new Set(normalizePreferredModules(prefs));
// O(1) lookups instead of O(n)
```

---

## Testing

### Test Case 1: Exact Match
```typescript
const student = { preferred_modules: ["Visual"] };
const section = { learning_style_tags: ['visual'] };
expect(sectionMatchesPreferences(section, student.preferred_modules)).toBe(true);
```

### Test Case 2: Mapping Works
```typescript
const student = { preferred_modules: ["Aural"] }; // Student format
const section = { learning_style_tags: ['auditory'] }; // Module format
expect(sectionMatchesPreferences(section, student.preferred_modules)).toBe(true); // ✅
```

### Test Case 3: Partial Match
```typescript
const student = { preferred_modules: ["Visual", "Aural"] };
const section = { learning_style_tags: ['visual', 'kinesthetic'] };
expect(sectionMatchesPreferences(section, student.preferred_modules)).toBe(true); // At least 1 match
```

### Test Case 4: No Match
```typescript
const student = { preferred_modules: ["Visual"] };
const section = { learning_style_tags: ['auditory', 'kinesthetic'] };
expect(sectionMatchesPreferences(section, student.preferred_modules)).toBe(false);
```

---

## Summary

### ✅ Solution Provides:
1. **Automatic mapping** - Handles naming differences
2. **Flexible filtering** - Strict or soft modes
3. **Relevance scoring** - Priority ordering
4. **Statistics** - Track matching quality
5. **Edge case handling** - Robust and reliable

### 🎯 Key Function:
```typescript
filterSectionsByPreferences(sections, student.preferred_modules)
```

This is the **main function** you'll use 90% of the time!

---

## Quick Start

```typescript
// 1. Import
import { filterSectionsByPreferences } from '@/lib/utils/learning-style-matcher';

// 2. Get student data (from login)
const student = currentUser; // { preferred_modules: ["Visual", "Aural"] }

// 3. Filter module sections
const sections = filterSectionsByPreferences(
  module.content_structure.sections,
  student.preferred_modules
);

// 4. Render
sections.map(section => <SectionCard section={section} />)
```

**That's it!** 🎉

The system automatically:
- ✅ Maps "Aural" → "auditory"
- ✅ Maps "Read/Write" → "reading_writing"
- ✅ Handles "General Module" → shows all
- ✅ Normalizes case differences
- ✅ Returns matching sections

**Now your students see content tailored to their learning style!** 📚✨
