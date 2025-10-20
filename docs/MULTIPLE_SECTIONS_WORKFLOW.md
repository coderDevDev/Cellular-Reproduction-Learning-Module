# ✅ Multiple Sections Workflow Guide

## 🎯 **How It Works**

Each section has its **own independent content**. Section 1's data is completely separate from Section 2's data.

---

## ✅ **Correct Workflow**

### **Step 1: Add First Section**

```
1. Click "Add Section" button
   ↓
2. Section 1 appears in left list
   ↓
3. Click on "Section 1"
   ↓
4. Section editor opens on right
   ↓
5. Type in Editor.js:
   [Header] Introduction to Cell Division
   [Paragraph] Cell division is the process...
   [Image] Upload diagram
   ↓
6. ✅ Data auto-saves to:
   formData.content_structure.sections[0].content_data.editorjs_data
```

### **Step 2: Add Second Section**

```
7. Click "Add Section" button again
   ↓
8. Section 2 appears in left list
   ↓
9. Click on "Section 2"
   ↓
10. Editor clears (loads Section 2's empty content)
    ↓
11. Type DIFFERENT content:
    [Header] Types of Cell Division
    [Paragraph] There are two types...
    [List] • Mitosis
    [List] • Meiosis
    ↓
12. ✅ Data auto-saves to:
    formData.content_structure.sections[1].content_data.editorjs_data
```

### **Step 3: Switch Back to Section 1**

```
13. Click on "Section 1" in left list
    ↓
14. Editor reloads with Section 1 content
    ↓
15. ✅ You see:
    [Header] Introduction to Cell Division
    [Paragraph] Cell division is the process...
    [Image] Your diagram
```

### **Step 4: Switch to Section 2**

```
16. Click on "Section 2" in left list
    ↓
17. Editor reloads with Section 2 content
    ↓
18. ✅ You see:
    [Header] Types of Cell Division
    [Paragraph] There are two types...
    [List] • Mitosis
    [List] • Meiosis
```

---

## 🔧 **How The Fix Works**

### **Added Unique Key Prop:**

```typescript
<EditorJSContentEditor
  key={`editor-${section.id}-${index}`}  // ⭐ Forces re-render
  data={section.content_data?.editorjs_data}
  onChange={(data) => {
    updateContentSection(index, {
      content_data: {
        ...section.content_data,
        editorjs_data: data
      }
    });
  }}
/>
```

**Why This Works:**

When you switch sections, the `key` changes:
- Section 1: `key="editor-abc123-0"`
- Section 2: `key="editor-xyz789-1"`

React sees different keys → **completely destroys old component** → **creates fresh new component** → **loads new section's data**

---

## 📊 **Data Structure**

```json
{
  "content_structure": {
    "sections": [
      {
        "id": "section-abc123",
        "title": "Introduction",
        "content_type": "text",
        "content_data": {
          "editorjs_data": {
            "blocks": [
              {
                "type": "header",
                "data": { "text": "Introduction to Cell Division" }
              },
              {
                "type": "paragraph",
                "data": { "text": "Cell division is..." }
              }
            ]
          }
        }
      },
      {
        "id": "section-xyz789",
        "title": "Types",
        "content_type": "text",
        "content_data": {
          "editorjs_data": {
            "blocks": [
              {
                "type": "header",
                "data": { "text": "Types of Cell Division" }
              },
              {
                "type": "list",
                "data": {
                  "items": ["Mitosis", "Meiosis"]
                }
              }
            ]
          }
        }
      }
    ]
  }
}
```

**Each section has its own `editorjs_data` with completely different content!**

---

## 🧪 **Test Scenario**

### **Create 3 Sections with Different Content:**

**Section 1: Introduction**
```
[Header] What is Cell Division?
[Paragraph] Cell division is fundamental...
[Image] Overview diagram
```

**Section 2: Process Steps**
```
[Header] Steps of Mitosis
[List] 1. Prophase
[List] 2. Metaphase
[List] 3. Anaphase
[List] 4. Telophase
[Table] Comparison of phases
```

**Section 3: Summary**
```
[Header] Key Takeaways
[Quote] "Cell division is essential for growth..."
[Checklist] ☑ Understand phases
[Checklist] ☑ Identify differences
```

### **Test Switching:**

1. Click Section 1 → See introduction content ✅
2. Click Section 2 → See process steps ✅
3. Click Section 3 → See summary ✅
4. Click Section 1 again → Still see introduction ✅
5. Go to Review step → All 3 sections have different content ✅
6. Save module → All sections save correctly ✅

---

## 🎯 **Visual Workflow**

```
┌─────────────────────────────────────────────────────┐
│                     Left Panel                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📝 Section 1 - Introduction                     │ │ ← Click
│ │ 📝 Section 2 - Process Steps                    │ │
│ │ 📝 Section 3 - Summary                          │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                    Right Panel                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Edit Section: Section 1       [Auto-Save]       │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ Section Title: [Introduction_______________]    │ │
│ │                                                  │ │
│ │ Rich Content Editor (WYSIWYG)                   │ │
│ │ ┌──────────────────────────────────────────┐   │ │
│ │ │ [Header] What is Cell Division?          │   │ │
│ │ │                                           │   │ │
│ │ │ [Paragraph] Cell division is...          │   │ │
│ │ │                                           │   │ │
│ │ │ [Image] [Diagram image]                  │   │ │
│ │ └──────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

When you click Section 2:

```
┌─────────────────────────────────────────────────────┐
│                     Left Panel                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📝 Section 1 - Introduction                     │ │
│ │ 📝 Section 2 - Process Steps                    │ │ ← Click
│ │ 📝 Section 3 - Summary                          │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                    Right Panel                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Edit Section: Section 2       [Auto-Save]       │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ Section Title: [Process Steps______________]    │ │
│ │                                                  │ │
│ │ Rich Content Editor (WYSIWYG)                   │ │
│ │ ┌──────────────────────────────────────────┐   │ │
│ │ │ [Header] Steps of Mitosis                │   │ │
│ │ │                                           │   │ │
│ │ │ [List] 1. Prophase                       │   │ │
│ │ │ [List] 2. Metaphase                      │   │ │
│ │ │                                           │   │ │
│ │ │ [Table] Phase comparison                 │   │ │
│ │ └──────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Different content loads automatically!**

---

## ⚠️ **Important Notes**

### **1. Auto-Save is ON**

Every change you type is automatically saved to state. You don't need to click a "Save" button when switching sections.

### **2. Each Section is Independent**

Changing content in Section 1 does NOT affect Section 2 or Section 3.

### **3. Section Switching is Instant**

When you click a different section, the editor reloads with that section's content immediately.

### **4. No Data Loss**

All your content is preserved. You can switch between sections as many times as you want.

---

## 🐛 **Troubleshooting**

### **Issue: Section content doesn't load**

**Check:**
1. Is the section clicked? (should be highlighted in left list)
2. Does the section have a unique ID?
3. Press F12 and check console for errors

**Solution:**
```typescript
// Verify section has unique ID
console.log('Section:', {
  id: section.id,
  index: index,
  hasContent: !!section.content_data?.editorjs_data
});
```

### **Issue: Content appears the same in all sections**

**Check:**
1. Did you actually type different content in each section?
2. Are you looking at the right section?

**Solution:**
Click on each section one by one and verify the content is different.

### **Issue: Editor appears empty when switching**

**This is normal** if the section has no content yet! Just start typing.

---

## ✅ **Summary**

| Action | Result |
|--------|--------|
| Add Section 1 | New empty section created |
| Type content in Section 1 | Saves to `sections[0].content_data.editorjs_data` |
| Add Section 2 | New empty section created |
| Type content in Section 2 | Saves to `sections[1].content_data.editorjs_data` |
| Click Section 1 | Loads `sections[0].content_data.editorjs_data` |
| Click Section 2 | Loads `sections[1].content_data.editorjs_data` |
| Save module | All sections save to database |

**Each section maintains its own unique content!** ✅

---

**Last Updated:** October 20, 2025  
**Status:** Multi-section support fully working  
**Key Fix:** Added unique `key` prop to Editor.js component
