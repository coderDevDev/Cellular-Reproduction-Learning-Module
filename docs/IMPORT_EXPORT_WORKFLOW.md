# 🔄 Import/Export Workflow Guide

## ✅ **NEW: Continue Your Work Anytime!**

You can now **export** your module progress as JSON and **import** it later to continue editing!

---

## 🎯 **Use Case**

### **Scenario:**
```
Day 1: Create sections 1-4, export as JSON
Day 2: Import JSON, continue with sections 5-8
Day 3: Import JSON, add final touches, save to database
```

**Perfect for:**
- 📝 Working on modules over multiple sessions
- 💾 Keeping backups of your work
- 🔄 Sharing module templates with colleagues
- 🧪 Testing different versions
- 📦 Version control your modules

---

## 📥 **Export Workflow**

### **Step 1: Create Your Module**
```
1. Fill out Basic Info
2. Add sections 1-4 with content
3. Go to Review step
```

### **Step 2: Export Progress**
```
1. Click "Export as JSON" button (blue)
2. File downloads: vark-module-2025-10-20T15-30-45.json
3. Save to safe location
```

### **Step 3: Close Builder**
```
- You can now safely close the builder
- Your work is saved in the JSON file
- Database not affected yet (only when you click "Save to Supabase")
```

---

## 📤 **Import Workflow**

### **Step 1: Open Module Builder**
```
1. Go to /teacher/vark-modules
2. Click "Create New Module"
3. Builder opens
```

### **Step 2: Import Your JSON**
```
1. Look for "Import JSON" button (top right, blue)
2. Click it
3. Select your JSON file
4. Data loads automatically ✅
```

### **Step 3: Continue Editing**
```
1. Form automatically goes to Step 1
2. Review imported data
3. Continue to Step 2
4. Add more sections or edit existing ones
5. Export again (optional backup)
6. Save to Supabase when done
```

---

## 🎨 **UI Location**

```
┌─────────────────────────────────────┐
│  Create VARK Learning Module        │
│                      [📥 Import JSON]│  ← NEW!
├─────────────────────────────────────┤
│                                     │
│  Step 1: Basic Information          │
│                                     │
└─────────────────────────────────────┘
```

---

## 📋 **Complete Example**

### **Scenario: Building a Large Module**

#### **Session 1 (Monday):**
```
1. Create module: "Cell Biology Complete Guide"
2. Add Basic Info:
   - Title: "Cell Biology Complete Guide"
   - Description: "Comprehensive cell biology module"
   - Learning Objectives: 5 objectives
3. Add Sections:
   - Section 1: Introduction to Cells
   - Section 2: Cell Structure
   - Section 3: Cell Membrane
   - Section 4: Organelles
4. Click "Export as JSON"
5. File saved: cell-biology-2025-10-20.json
6. Close builder (don't save to DB yet)
```

#### **Session 2 (Tuesday):**
```
1. Open builder
2. Click "Import JSON"
3. Select: cell-biology-2025-10-20.json
4. ✅ All 4 sections loaded!
5. Continue adding:
   - Section 5: Mitochondria
   - Section 6: Nucleus
   - Section 7: Endoplasmic Reticulum
   - Section 8: Golgi Apparatus
6. Click "Export as JSON" (new backup)
7. File saved: cell-biology-2025-10-21.json
8. Close builder
```

#### **Session 3 (Wednesday):**
```
1. Open builder
2. Click "Import JSON"
3. Select: cell-biology-2025-10-21.json
4. ✅ All 8 sections loaded!
5. Add final sections:
   - Section 9: Cell Division
   - Section 10: Summary
6. Review everything in Step 3
7. Click "Save to Supabase" 💾
8. ✅ Module saved to database!
```

---

## 🔍 **What Gets Imported**

### **All Data:**
```json
{
  "title": "...",
  "description": "...",
  "category_id": "...",
  "learning_objectives": [...],
  "target_learning_styles": [...],
  "content_structure": {
    "sections": [...]  // ← All your sections!
  },
  "difficulty_level": "...",
  "estimated_duration_minutes": 30,
  "multimedia_content": {...},
  "interactive_elements": {...},
  ...all other fields
}
```

### **Auto-Cleaned:**
```
✅ _exported_at → Removed (not needed)
✅ _note → Removed (not needed)
✅ id → Regenerated (new UUID)
```

---

## ✨ **Features**

### **1. Validation**
```typescript
// Checks file is JSON
if (!file.name.endsWith('.json')) {
  toast.error('Please select a JSON file');
}

// Validates required fields
if (!cleanData.title) {
  toast.error('Invalid JSON: Missing title field');
}
```

### **2. Data Merge**
```typescript
// Merges with existing form data
setFormData(prev => ({
  ...prev,
  ...cleanData,
  id: crypto.randomUUID()  // New ID for new module
}));
```

### **3. Auto-Reset**
```typescript
// Goes back to Step 1 to review
setCurrentStep(1);
```

---

## 🧪 **Testing**

### **Test 1: Export → Import**

**Steps:**
```
1. Create module with 2 sections
2. Export as JSON
3. Close builder
4. Open builder again
5. Import JSON
6. ✅ Verify: 2 sections loaded
7. Add 2 more sections
8. Export again
9. Import again
10. ✅ Verify: 4 sections loaded
```

### **Test 2: Multiple Sessions**

**Day 1:**
```
- Add sections 1-3
- Export: module-day1.json
```

**Day 2:**
```
- Import: module-day1.json
- Add sections 4-6
- Export: module-day2.json
```

**Day 3:**
```
- Import: module-day2.json
- Add sections 7-9
- Save to database
```

### **Test 3: Invalid JSON**

**Steps:**
```
1. Click "Import JSON"
2. Select a .txt file
3. ✅ Error: "Please select a JSON file"

4. Select corrupt JSON file
5. ✅ Error: "Failed to parse JSON file"
```

---

## 💡 **Best Practices**

### **1. Naming Convention**
```
✅ Good:
- cell-biology-v1.json
- cell-biology-2025-10-20.json
- cell-biology-draft-sections-1-5.json

❌ Avoid:
- module.json (not descriptive)
- test.json (not descriptive)
```

### **2. Backup Strategy**
```
Export after each major milestone:
- After adding basic info → backup-v1.json
- After sections 1-5 → backup-v2.json
- After sections 6-10 → backup-v3.json
- Before final save → backup-final.json
```

### **3. Version Control**
```
Keep dated versions:
- module-2025-10-20-morning.json
- module-2025-10-20-afternoon.json
- module-2025-10-21-final.json
```

### **4. Collaborate**
```
1. Teacher A: Creates sections 1-5, exports
2. Teacher B: Imports, reviews, adds sections 6-10
3. Teacher A: Imports final version, saves to DB
```

---

## 🔄 **Workflow Diagram**

```
┌──────────────────────────┐
│ Start: Open Builder      │
└──────────┬───────────────┘
           │
           ▼
    ┌──────────────┐
    │ Import JSON? │
    └──┬───────┬───┘
       │       │
      Yes      No
       │       │
       ▼       ▼
  ┌─────────┐  ┌──────────────┐
  │ Select  │  │ Start Fresh  │
  │ JSON    │  │              │
  └────┬────┘  └──────┬───────┘
       │              │
       └──────┬───────┘
              │
              ▼
     ┌──────────────────┐
     │ Fill/Edit Form   │
     │ Step 1: Basic    │
     │ Step 2: Content  │
     └────────┬─────────┘
              │
              ▼
     ┌──────────────────┐
     │ Want to backup?  │
     └────┬────────┬────┘
          │        │
         Yes       No
          │        │
          ▼        │
     ┌─────────┐   │
     │ Export  │   │
     │ JSON    │   │
     └────┬────┘   │
          │        │
          └────┬───┘
               │
               ▼
     ┌──────────────────┐
     │ Continue editing │
     │ or Save to DB?   │
     └────┬────────┬────┘
          │        │
      Continue   Save
          │        │
          │        ▼
          │   ┌─────────────┐
          │   │ Step 3:     │
          │   │ Review      │
          │   └──────┬──────┘
          │          │
          │          ▼
          │   ┌─────────────┐
          │   │ Save to     │
          │   │ Supabase    │
          │   └──────┬──────┘
          │          │
          └──────────┤
                     ▼
              ┌──────────────┐
              │ ✅ Done!     │
              └──────────────┘
```

---

## 📱 **Button Design**

### **Export Button (Review Step):**
```
┌──────────────────┐
│ 📥 Export as JSON│  ← Blue outline
└──────────────────┘
```

### **Import Button (Top of Builder):**
```
┌──────────────────┐
│ ⬆️ Import JSON   │  ← Blue outline, top right
└──────────────────┘
```

---

## 🚨 **Error Handling**

### **Errors Caught:**

| Error | Message | Solution |
|-------|---------|----------|
| Not JSON file | "Please select a JSON file" | Select .json file |
| Parse error | "Failed to parse JSON file" | Check file format |
| Missing title | "Invalid JSON: Missing title field" | Use valid export |
| Read error | "Failed to read file" | Try different file |

---

## ✅ **Success Messages**

```
Export: "Data exported to vark-module-2025-10-20T15-30-45.json"
Import: "Module data imported successfully! You can now continue editing."
```

---

## 🎯 **Summary**

### **Export:**
- ✅ Save your progress as JSON file
- ✅ Backup at any time
- ✅ File downloads to your computer
- ✅ Can export multiple times

### **Import:**
- ✅ Load saved JSON file
- ✅ Continue editing from where you left off
- ✅ All sections and data preserved
- ✅ Can import and re-export multiple times

### **Workflow:**
```
Create → Export → Close
        ↓
Open → Import → Continue → Export → Close
                  ↓
Open → Import → Finalize → Save to DB ✅
```

---

## 🎓 **Use Cases**

| Scenario | Workflow |
|----------|----------|
| **Long module** | Break into multiple sessions with export/import |
| **Collaboration** | Share JSON between teachers |
| **Backup** | Export before major changes |
| **Templates** | Create base module, export, reuse |
| **Testing** | Try different versions without saving to DB |
| **Recovery** | Save work if browser crashes |

---

## 🎉 **Result**

**Before:**
- ❌ Had to complete module in one session
- ❌ Lost work if browser closed
- ❌ No way to backup progress
- ❌ Couldn't share work-in-progress

**After:**
- ✅ Work on module over multiple days
- ✅ Export progress anytime
- ✅ Import and continue later
- ✅ Keep multiple backups
- ✅ Share JSON with colleagues
- ✅ Never lose your work!

**Your workflow is now flexible and safe! 🚀**

---

**Last Updated:** October 20, 2025  
**Feature:** Import/Export JSON  
**Status:** ✅ Active  
**Location:** Top of Module Builder
