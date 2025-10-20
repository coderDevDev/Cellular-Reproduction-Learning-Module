# 📥 Export as JSON Feature

## ✅ **NEW: Preview Data Before Saving to Supabase**

You can now export your module data as a JSON file to see **exactly** what will be sent to the database before clicking "Save to Supabase".

---

## 🎯 **How to Use**

### **Step 1: Create Your Module**

1. Fill out Basic Info (Step 1)
2. Add Content Sections (Step 2)
3. Type content in CKEditor
4. Go to Review & Save Module (Step 3)

### **Step 2: Export as JSON**

1. **Look for the blue button:** "Export as JSON"
2. **Click it**
3. **A JSON file will download** to your Downloads folder
4. **Filename:** `vark-module-2025-10-20T07-14-00.json`

### **Step 3: Inspect the JSON**

1. **Open the file** in any text editor (VS Code, Notepad++, etc.)
2. **See the exact data structure**
3. **Verify everything looks correct**

### **Step 4: Save to Database**

1. **If everything looks good**, click "Save to Supabase"
2. **Module saves to database** with the exact structure you inspected

---

## 📋 **What You'll See in the JSON**

### **Example Output:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "category_id": "general-education",
  "title": "New VARK Module",
  "description": "A comprehensive learning module designed for diverse learning styles.",
  "difficulty_level": "beginner",
  "estimated_duration_minutes": 30,
  "target_learning_styles": [
    "visual",
    "reading_writing"
  ],
  "learning_objectives": [
    "Understand the key concepts",
    "Apply knowledge to real-world scenarios"
  ],
  "content_structure": {
    "sections": [
      {
        "id": "section-uuid",
        "title": "Section 1",
        "content_type": "text",
        "content_data": {
          "text": "<h2>Introduction</h2><p>This is the <strong>introduction</strong> content...</p>"
        },
        "position": 1,
        "is_required": true,
        "time_estimate_minutes": 5,
        "learning_style_tags": [
          "reading_writing"
        ],
        "metadata": {
          "key_points": [
            "Key point 1",
            "Key point 2"
          ]
        }
      }
    ],
    "learning_path": [],
    "prerequisites_checklist": [""],
    "completion_criteria": [""]
  },
  "multimedia_content": {
    "videos": [""],
    "images": [""],
    "diagrams": [""]
  },
  "interactive_elements": {
    "drag_and_drop": false,
    "visual_builder": false,
    "simulation": false
  },
  "assessment_questions": [],
  "module_metadata": {
    "content_standards": [""],
    "learning_competencies": [""]
  },
  "is_published": false,
  "_exported_at": "2025-10-20T07:14:00.000Z",
  "_note": "This is the exact data structure that will be sent to Supabase"
}
```

---

## 🔍 **What to Check**

### **1. CKEditor Content**

```json
{
  "content_data": {
    "text": "<h2>Heading</h2><p>Content with <strong>bold</strong> text...</p>"
  }
}
```

**Look for:**
- ✅ HTML is properly formatted
- ✅ All formatting preserved (bold, italic, etc.)
- ✅ Images embedded as base64
- ✅ Videos embedded as iframes

### **2. YouTube Videos**

```json
{
  "text": "<div style=\"position: relative; padding-bottom: 56.25%;\"><iframe src=\"https://www.youtube.com/embed/VIDEO_ID\" allowfullscreen></iframe></div>"
}
```

**Look for:**
- ✅ iframe tags present
- ✅ YouTube embed URL correct
- ✅ Styling for responsive video

### **3. Required Fields**

```json
{
  "title": "...",           // ✅ Not empty
  "description": "...",     // ✅ Not empty
  "category_id": "...",     // ✅ Has value (general-education)
  "learning_objectives": ["..."],  // ✅ At least 1
  "content_structure": {
    "sections": [...]       // ✅ At least 1 section
  }
}
```

### **4. Section Content**

```json
{
  "sections": [
    {
      "content_data": {
        "text": "<p>Content here...</p>"  // ✅ Not empty
      }
    }
  ]
}
```

**Make sure:**
- ✅ All sections have content
- ✅ Text is not empty
- ✅ HTML is valid

---

## 🎨 **UI Location**

In the **Review & Save Module** step, you'll see:

```
┌────────────────────────────────────┐
│     Review & Save Module           │
│                                    │
│  [Validation Status Card]          │
│                                    │
│  ┌──────────────┐  ┌─────────────┐│
│  │ 📥 Export as │  │ ✅ Save to  ││
│  │    JSON      │  │  Supabase   ││
│  └──────────────┘  └─────────────┘│
│                                    │
│  💡 Tip: Click "Export as JSON"   │
│     to see exact data structure    │
└────────────────────────────────────┘
```

---

## 📂 **File Details**

### **Filename Format:**

```
vark-module-YYYY-MM-DDTHH-MM-SS.json
```

**Example:**
```
vark-module-2025-10-20T07-14-32.json
```

### **File Location:**

- **Windows:** `C:\Users\YourName\Downloads\`
- **Mac:** `/Users/YourName/Downloads/`
- **Linux:** `/home/yourname/Downloads/`

### **File Size:**

- **Typical:** 5-20 KB
- **With images:** 50-200 KB (base64 encoded)
- **With videos:** 5-15 KB (just iframe, not video file)

---

## 🔧 **Use Cases**

### **1. Debugging**

```
Issue: Module not saving correctly
Solution: Export JSON and check data structure
```

### **2. Backup**

```
Before saving: Export JSON as backup
If something goes wrong: Re-import data
```

### **3. Documentation**

```
For developers: See exact API payload
For testing: Verify data format
```

### **4. Comparison**

```
Export before changes
Make changes
Export again
Compare files to see differences
```

### **5. Data Migration**

```
Export from one system
Modify JSON if needed
Import to another system
```

---

## 💡 **Tips**

### **Pretty Print in VS Code:**

1. Open JSON file
2. Press `Shift + Alt + F` (Windows/Linux)
3. Or `Shift + Option + F` (Mac)
4. JSON is nicely formatted!

### **Validate JSON:**

Use online validator:
- https://jsonlint.com/
- https://jsonformatter.org/

### **Search Within JSON:**

**VS Code:**
1. `Ctrl + F` (Windows/Linux) or `Cmd + F` (Mac)
2. Search for: `"content_data"`
3. Jump to all content sections

### **Check File Size:**

```bash
# Windows PowerShell
Get-Item vark-module-*.json | Select Name, Length

# Mac/Linux
ls -lh vark-module-*.json
```

---

## 🎯 **Example Workflow**

### **Complete Module Creation with Export:**

```
Step 1: Fill out module info
  ↓
Step 2: Add 3 sections with content
  ↓
Step 3: Go to Review
  ↓
Step 4: Click "Export as JSON" 📥
  ↓
Step 5: Open vark-module-2025-10-20T07-14-32.json
  ↓
Step 6: Verify:
  ✅ Title correct
  ✅ 3 sections present
  ✅ Content has HTML
  ✅ Videos embedded properly
  ↓
Step 7: Click "Save to Supabase" 💾
  ↓
Step 8: Success! Module in database ✅
```

---

## 🔍 **What Gets Added**

The JSON file includes two extra fields for your reference:

```json
{
  "_exported_at": "2025-10-20T07:14:00.000Z",
  "_note": "This is the exact data structure that will be sent to Supabase"
}
```

**Note:** These fields are **NOT** sent to Supabase. They're only in the exported file for your reference.

---

## 📊 **Compare: EditorJS vs CKEditor**

### **EditorJS Export (Old):**

```json
{
  "content_data": {
    "editorjs_data": {
      "time": 1697812345,
      "blocks": [
        {
          "id": "oNK8YPzXVb",
          "type": "paragraph",
          "data": {
            "text": "Content..."
          }
        }
      ],
      "version": "2.28.0"
    }
  }
}
```

**File size:** ~300 bytes per section

### **CKEditor Export (Now):**

```json
{
  "content_data": {
    "text": "<p>Content...</p>"
  }
}
```

**File size:** ~50 bytes per section

**Savings:** 83% smaller! 🎉

---

## ✅ **Benefits**

| Benefit | Description |
|---------|-------------|
| **Transparency** | See exactly what's being saved |
| **Debugging** | Identify issues before saving |
| **Backup** | Keep local copy of data |
| **Documentation** | Reference for developers |
| **Verification** | Confirm data structure |
| **Learning** | Understand how data is stored |
| **Testing** | Compare different configurations |

---

## 🚀 **Try It Now!**

1. Go to `/teacher/vark-modules`
2. Click "Create New Module"
3. Fill out the form
4. Add a section with content
5. Go to Review step
6. **Click "Export as JSON"** 📥
7. Open the downloaded file
8. **See your data!** 👀

---

## 📝 **Summary**

**Feature:** Export module data as JSON before saving to Supabase  
**Button:** Blue "Export as JSON" button in Review step  
**Output:** JSON file with complete module data structure  
**Purpose:** Inspect, verify, debug, backup, document  
**File:** Downloads to your Downloads folder  
**Format:** Pretty-printed JSON (easy to read)

**Now you can see exactly what data structure will be sent to Supabase! 🎉**

---

**Last Updated:** October 20, 2025  
**Feature:** Export as JSON  
**Status:** ✅ Active  
**Location:** Review & Save Module step
