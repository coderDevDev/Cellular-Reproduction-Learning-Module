# Learning Style Matching - Quick Reference

## 🎯 The Problem

**Student JSON has:**
```json
"preferred_modules": ["Aural", "Read/Write"]
```

**Module sections have:**
```typescript
learning_style_tags: ['auditory', 'reading_writing']
```

**❌ They don't match directly!**

---

## ✅ The Solution

### Use the Matcher Utility

```typescript
import { filterSectionsByPreferences } from '@/lib/utils/learning-style-matcher';

// Student data from login
const student = {
  preferred_modules: ["Aural", "Read/Write"] // From student_logins.json
};

// Filter sections
const matchingSections = filterSectionsByPreferences(
  module.content_structure.sections,
  student.preferred_modules
);

// Done! ✅ Now you have only matching sections
```

---

## 📋 Mapping Reference

| Student Says | Module Has | Auto Mapped? |
|-------------|------------|--------------|
| `"Visual"` | `'visual'` | ✅ Yes |
| `"Aural"` | `'auditory'` | ✅ Yes |
| `"Read/Write"` | `'reading_writing'` | ✅ Yes |
| `"Kinesthetic"` | `'kinesthetic'` | ✅ Yes |
| `"General Module"` | (any/all) | ✅ Shows ALL |

---

## 🔥 Real Example

### Input:
```typescript
// Student: Aiden Austria
const studentPrefs = ["Aural", "Read/Write"];

// Module has 5 sections
const sections = [
  { id: 1, learning_style_tags: ['auditory', 'reading_writing'] },  // ✅
  { id: 2, learning_style_tags: ['visual', 'kinesthetic'] },        // ❌
  { id: 3, learning_style_tags: ['reading_writing'] },               // ✅
  { id: 4, learning_style_tags: ['auditory'] },                      // ✅
  { id: 5, learning_style_tags: [] }                                 // ✅ (universal)
];
```

### Output:
```typescript
const filtered = filterSectionsByPreferences(sections, studentPrefs);
// Result: [section 1, section 3, section 4, section 5]
// Removed: section 2 (visual/kinesthetic only)
```

---

## 📊 Three Strategies

### 1️⃣ Strict Filtering (Hide Non-Matches)
```typescript
const sections = filterSectionsByPreferences(allSections, prefs);
// Shows: ONLY matching sections
// Best for: Focused, personalized learning
```

### 2️⃣ Soft Sorting (Show All, Prioritize Matches)
```typescript
const sections = getRelevantSections(allSections, prefs, {
  filterStrict: false,
  sortByRelevance: true
});
// Shows: ALL sections, but best matches first
// Best for: Discovery + personalization
```

### 3️⃣ Hybrid (Recommended + Others)
```typescript
const recommended = filterSectionsByPreferences(allSections, prefs);
const others = allSections.filter(s => !recommended.includes(s));

<>
  <h3>📌 For You</h3>
  {recommended.map(...)}
  
  <details><summary>Other Sections</summary>
    {others.map(...)}
  </details>
</>
// Shows: Matches prominently, others collapsed
// Best for: Balance
```

---

## 🚀 Integration Examples

### In Module Viewer Component
```typescript
export function ModuleViewer({ module, currentStudent }) {
  const sections = useMemo(() => 
    filterSectionsByPreferences(
      module.content_structure.sections,
      currentStudent.preferred_modules
    ),
    [module, currentStudent]
  );

  return sections.map(section => <SectionCard {...section} />);
}
```

### In API/Backend
```typescript
export async function getPersonalizedModule(moduleId, studentId) {
  const module = await getModule(moduleId);
  const student = await getStudent(studentId);
  
  return {
    ...module,
    sections: filterSectionsByPreferences(
      module.content_structure.sections,
      student.preferred_modules
    )
  };
}
```

---

## 📈 Student Types

| Type | Example Prefs | Sections Shown |
|------|--------------|----------------|
| **Unimodal** | `["Read/Write"]` | ~40-60% of sections |
| **Bimodal** | `["Visual", "Aural"]` | ~60-80% of sections |
| **Trimodal** | `["Visual", "Aural", "Read/Write"]` | ~80-95% of sections |
| **Multimodal** | `["Visual", "Aural", "Read/Write", "Kinesthetic"]` | ~95-100% of sections |
| **General** | `["General Module"]` | 100% of sections |

---

## 🛠️ Available Functions

### Main Functions:
```typescript
// 1. Filter sections (most common)
filterSectionsByPreferences(sections, prefs)

// 2. Check if section matches
sectionMatchesPreferences(section, prefs)

// 3. Get match score (0 to 1)
getSectionMatchScore(section, prefs)

// 4. Sort by relevance
sortSectionsByRelevance(sections, prefs)

// 5. Filter + Sort (combo)
getRelevantSections(sections, prefs, options)

// 6. Get statistics
getSectionMatchStats(sections, prefs)
```

---

## ⚡ Quick Decision Tree

```
Student logs in
     ↓
Has preferred_modules?
     ↓
   YES → Filter sections
     ├─ "General Module"? → Show ALL
     ├─ Unimodal? → Show ~50%
     ├─ Bimodal? → Show ~70%
     └─ Multimodal? → Show ~95%
     ↓
   NO → Show ALL sections
```

---

## 💡 Key Insights

### ✅ Handles Automatically:
- Case differences (`"Visual"` vs `'visual'`)
- Name differences (`"Aural"` vs `'auditory'`)
- Format differences (`"Read/Write"` vs `'reading_writing'`)
- Special cases (`"General Module"` = show all)
- Empty tags (treated as universal content)

### ⚠️ Important Notes:
1. **Required sections** - Always consider showing these regardless of match
2. **Universal content** - Sections with no tags are shown to everyone
3. **Performance** - Use `useMemo` for filtering in React components
4. **UX** - Show count: "Showing 8 of 15 sections for your learning style"

---

## 🎯 Recommended Approach

**For Student Module Viewing:**
```typescript
// 1. Get student preferences
const prefs = currentStudent.preferred_modules;

// 2. Filter sections
const sections = filterSectionsByPreferences(
  module.content_structure.sections,
  prefs
);

// 3. Show count
console.log(`Personalized: ${sections.length} of ${module.content_structure.sections.length} sections`);

// 4. Render
return <SectionList sections={sections} />;
```

**That's it! Simple and effective.** ✨

---

## 📚 Files Created

1. **`lib/utils/learning-style-matcher.ts`** - All matching functions
2. **`docs/LEARNING_STYLE_MATCHING.md`** - Complete guide
3. **`docs/LEARNING_STYLE_MATCHING_QUICK_REFERENCE.md`** - This file!

---

## 🔥 One-Liner

```typescript
// The only line you need 90% of the time:
const sections = filterSectionsByPreferences(allSections, student.preferred_modules);
```

**Done!** 🎉
