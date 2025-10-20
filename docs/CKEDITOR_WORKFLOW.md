# ✅ CKEditor Content Structure Workflow

## 🎯 **Overview**

We've completely revamped the Content Structure workflow to use **CKEditor 5** instead of Editor.js. This provides:

- ✅ **Reliable auto-save** - Content saves as you type
- ✅ **No data loss** - Simple HTML string storage
- ✅ **Rich formatting** - Full WYSIWYG editor
- ✅ **Clean workflow** - No complex block structures

---

## 📊 **Complete Workflow**

```
┌────────────────────────────┐
│  User clicks "Add Section" │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  New section created:      │
│  {                         │
│    id: "uuid",             │
│    title: "",              │
│    content_type: "text",   │
│    content_data: {         │
│      text: ""  ← HTML      │
│    }                       │
│  }                         │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  React updates sections[]  │
│  array in state            │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  User clicks on section    │
│  setSelectedSectionIndex(0)│
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  CKEditor renders with     │
│  data={section.content_data│
│         .text || ''}       │
│  (initially empty)         │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  User types in CKEditor    │
│  "Hello world..."          │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  CKEditor fires onChange   │
│  event with HTML content   │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  React immediately updates │
│  sections[0].content_data  │
│  .text = "<p>Hello...</p>" │
│  ✅ Auto-saved!            │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  User adds Section 2       │
│  and types different text  │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  sections[1].content_data  │
│  .text = "<p>Section 2</p>"│
│  ✅ Auto-saved!            │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  User switches back to     │
│  Section 1                 │
│  (clicks on it)            │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  CKEditor loads            │
│  sections[0].content_data  │
│  .text                     │
│  Shows: "Hello world..."   │
│  ✅ No data loss!          │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  User clicks "Next" to     │
│  go to Review step         │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  All sections with content │
│  are validated             │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  User clicks "Save Module" │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  formData (including all   │
│  section HTML content)     │
│  sent to API/database      │
└────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **1. Data Structure**

**Before (EditorJS - Complex):**
```typescript
content_data: {
  editorjs_data: {
    time: 1697812345,
    blocks: [
      {
        id: "abc123",
        type: "paragraph",
        data: {
          text: "Content..."
        }
      }
    ],
    version: "2.28.0"
  }
}
```

**After (CKEditor - Simple):**
```typescript
content_data: {
  text: "<p>Content...</p>"  // Just HTML!
}
```

---

### **2. Component Structure**

**File:** `ckeditor-content-editor.tsx`

```typescript
interface CKEditorContentEditorProps {
  data: string;              // HTML string
  onChange: (data: string) => void;  // Returns HTML
  placeholder?: string;
  readOnly?: boolean;
}
```

**Features:**
- Full WYSIWYG toolbar
- Auto-save on change
- Image upload (Base64)
- Tables, lists, code blocks
- Media embed support
- Text formatting (bold, italic, etc.)
- Headings (H1-H4)
- Link management

---

### **3. State Management**

**Parent Component:** `vark-module-builder.tsx`

```typescript
const [formData, setFormData] = useState<Partial<VARKModule>>({
  content_structure: {
    sections: []
  }
});

const updateContentSection = (index: number, updates) => {
  const updatedSections = [...formData.content_structure.sections];
  updatedSections[index] = { ...updatedSections[index], ...updates };
  
  updateFormData({
    content_structure: {
      sections: updatedSections
    }
  });
};
```

**How it works:**
1. User types in CKEditor
2. `onChange` fires with HTML content
3. `updateContentSection` called immediately
4. State updated with new HTML
5. ✅ Content auto-saved!

---

### **4. Section Switching**

**When user switches sections:**

```typescript
// User clicks Section 2
setSelectedSectionIndex(1);

// CKEditor re-renders with new data
<CKEditorContentEditor
  data={sections[1].content_data?.text || ''}
  onChange={(content) => {
    updateContentSection(1, {
      content_data: { text: content }
    });
  }}
/>
```

**Key point:** Each section's content is stored independently in the `sections` array, so switching sections just changes which section's data is passed to CKEditor.

---

## ✅ **Advantages Over EditorJS**

| Feature | EditorJS | CKEditor |
|---------|----------|----------|
| Data format | Complex blocks | Simple HTML |
| Auto-save | Unreliable | ✅ Works perfectly |
| Section switching | Data loss issues | ✅ No issues |
| Type support | Any type | string |
| Validation | Complex | Simple (check string length) |
| Storage | Large JSON | Compact HTML |
| Rendering | Parse blocks | Direct HTML |
| Images | Upload required | Base64 embedded |

---

## 🧪 **Testing the Workflow**

### **Test 1: Create and Edit**

1. Click "Add Section"
2. Section 1 appears
3. Click on Section 1
4. Type: "This is section 1 content"
5. **Check console:** Should see auto-save message
6. Add formatting (bold, italic, headings)
7. ✅ **Result:** Content saved immediately

### **Test 2: Multiple Sections**

1. Add Section 2
2. Type: "This is section 2 content"
3. Add Section 3
4. Type: "This is section 3 content"
5. Click back to Section 1
6. ✅ **Result:** Shows "This is section 1 content"
7. Click Section 2
8. ✅ **Result:** Shows "This is section 2 content"

### **Test 3: Rich Content**

1. In Section 1, add:
   - Heading (H2)
   - Paragraph with **bold** and *italic*
   - Bulleted list
   - Image (paste or upload)
   - Table
   - Link
2. Switch to Section 2
3. Switch back to Section 1
4. ✅ **Result:** All formatting preserved!

### **Test 4: Save Module**

1. Fill out Basic Info (Step 1)
2. Add 2-3 sections with content (Step 2)
3. Click "Next" to Review
4. ✅ **Check:** Validation passes
5. Click "Save Module"
6. ✅ **Result:** Module saves with all content

---

## 📝 **Console Logging**

### **What You'll See:**

**When CKEditor loads:**
```javascript
🎯 CKEditor Component Rendered: {
  hasData: true,
  dataLength: 45,
  readOnly: false
}

✅ CKEditor is ready!
```

**When you type:**
```javascript
📝 CKEditor onChange: {
  contentLength: 52,
  hasContent: true,
  preview: "<p>This is my content...</p>"
}
```

**When auto-saving:**
```javascript
💾 Auto-saving Section 1: {
  sectionId: "abc123",
  contentLength: 52,
  hasContent: true
}
```

**When switching sections:**
```javascript
🎯 CKEditor focused
```

---

## 🎨 **CKEditor Features**

### **Toolbar Items:**

- **Undo/Redo** - Undo changes
- **Headings** - H1, H2, H3, H4, Paragraph
- **Font** - Size, family, color, background
- **Text Format** - Bold, italic, underline, strikethrough
- **Alignment** - Left, center, right, justify
- **Lists** - Numbered, bulleted
- **Indent** - Increase/decrease
- **Insert** - Link, image, table, media, code block
- **Styles** - Highlight, code, subscript, superscript
- **Tools** - Remove formatting

### **Keyboard Shortcuts:**

- `Ctrl+B` - Bold
- `Ctrl+I` - Italic
- `Ctrl+U` - Underline
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+K` - Insert link
- `Ctrl+Shift+7` - Numbered list
- `Ctrl+Shift+8` - Bulleted list

---

## 🔐 **Data Validation**

### **In Review Step:**

```typescript
// Simple validation - just check if text exists
if (!section.content_data?.text || section.content_data.text.trim().length === 0) {
  issues.push(`Section ${index + 1} content is required`);
}
```

**Much simpler than EditorJS block validation!**

---

## 💾 **Saving to Database**

When you click "Save Module", the data sent is:

```json
{
  "title": "Module Title",
  "description": "Description...",
  "content_structure": {
    "sections": [
      {
        "id": "section-1-uuid",
        "title": "Introduction",
        "content_type": "text",
        "content_data": {
          "text": "<h2>Introduction</h2><p>This is the <strong>introduction</strong>...</p>"
        },
        "position": 1,
        "is_required": true
      },
      {
        "id": "section-2-uuid",
        "title": "Main Content",
        "content_type": "text",
        "content_data": {
          "text": "<h2>Main Content</h2><ul><li>Point 1</li><li>Point 2</li></ul>"
        },
        "position": 2,
        "is_required": true
      }
    ]
  }
}
```

**Clean and simple!**

---

## 🚀 **Migration from EditorJS**

If you have existing modules with EditorJS data:

### **Option 1: Keep Both**

Support both formats:

```typescript
// In render
const content = section.content_data?.text || 
                convertEditorJSToHTML(section.content_data?.editorjs_data);
```

### **Option 2: Convert**

Run a migration script to convert EditorJS blocks to HTML:

```typescript
function convertEditorJSToHTML(editorjsData) {
  return editorjsData.blocks.map(block => {
    if (block.type === 'paragraph') {
      return `<p>${block.data.text}</p>`;
    }
    if (block.type === 'header') {
      return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
    }
    // ... etc
  }).join('');
}
```

---

## ✅ **Summary**

### **What Changed:**

1. **EditorJS → CKEditor** - More reliable editor
2. **Blocks → HTML** - Simpler data structure
3. **Manual save → Auto-save** - Better UX
4. **Complex validation → Simple** - Just check string length

### **Benefits:**

- ✅ No more "Block skipped" errors
- ✅ No more data loss when switching sections
- ✅ Faster, simpler, cleaner
- ✅ Better user experience
- ✅ Easier to debug
- ✅ Smaller payload

### **Result:**

**A robust, reliable content editing system that just works!** 🎉

---

**Last Updated:** October 20, 2025  
**Status:** ✅ Production Ready  
**Editor:** CKEditor 5 Classic
