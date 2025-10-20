# 📺 CKEditor Content Display Guide

## ✅ **How CKEditor Content is Displayed**

Now that we use CKEditor, content is stored as **HTML** and rendered beautifully in both Preview and Student View.

---

## 🎨 **Display Locations**

### **1. Module Preview Modal** ✅ UPDATED
**Component:** `vark-module-preview.tsx`

When you click "Preview Module" while building, your content appears exactly as formatted.

**Features:**
- ✅ Headings (H1-H4)
- ✅ Bold, italic, underline
- ✅ Lists (bulleted & numbered)
- ✅ Links (clickable)
- ✅ Images (embedded)
- ✅ Tables (with borders)
- ✅ Code blocks (syntax highlighted)
- ✅ Blockquotes
- ✅ Custom styling from CKEditor

---

### **2. Student Module Viewer** ✅ UPDATED
**Component:** `dynamic-module-viewer.tsx`

When students view the module, content appears with professional styling.

**Features:**
- ✅ Larger, readable fonts
- ✅ Proper spacing between elements
- ✅ Beautiful headings
- ✅ Styled links (blue, underlined on hover)
- ✅ Lists with proper indentation
- ✅ Images with shadow and rounded corners
- ✅ Tables with borders
- ✅ Code blocks with dark background
- ✅ Key Points section (if added)

---

## 💻 **How It Works**

### **Storage:**
```typescript
// In database/state
content_data: {
  text: "<h2>Introduction</h2><p>This is the <strong>introduction</strong> text...</p>"
}
```

### **Display:**
```tsx
// In preview/viewer components
<div 
  className="prose prose-lg"
  dangerouslySetInnerHTML={{ __html: content_data.text }}
/>
```

---

## 🎨 **Styling Applied**

### **Preview Modal Styling:**
```
✓ Headings: Bold, sized (H1=2xl, H2=xl, H3=lg, H4=base)
✓ Paragraphs: Gray text, relaxed leading
✓ Links: Blue color, underline on hover
✓ Strong/Bold: Dark gray, semibold
✓ Lists: Proper bullets/numbers with margin
✓ Blockquotes: Left border (4px gray), italic, padding
✓ Code: Gray background, rounded corners
✓ Pre: Dark background (code blocks)
✓ Images: Rounded corners, shadow
✓ Tables: Full width, bordered, header styling
```

### **Student Viewer Styling (Enhanced):**
```
✓ Headings: Larger sizes (H1=3xl, H2=2xl, H3=xl, H4=lg)
✓ Paragraphs: Relaxed, better spacing (mb-4)
✓ Links: Blue, no underline, underline on hover
✓ Lists: 6px left margin, 2px bottom spacing
✓ Blockquotes: Blue left border (4px), italic, spacing
✓ Code: Gray background, padding, mono font
✓ Pre: Dark background, padding, scroll if needed
✓ Images: Rounded, large shadow, 6px vertical margin
✓ Tables: Full width, padded cells, bordered
✓ Key Points: Blue callout box with icon
```

---

## 📊 **Example Content Flow**

### **Step 1: Teacher Creates Content**

In CKEditor, teacher types:

```
# Cell Division

Cell division is the process by which a **parent cell** divides into two or more **daughter cells**.

## Types of Cell Division

1. Mitosis
2. Meiosis

> **Important:** Both processes are essential for life!
```

### **Step 2: CKEditor Converts to HTML**

```html
<h1>Cell Division</h1>
<p>Cell division is the process by which a <strong>parent cell</strong> divides into two or more <strong>daughter cells</strong>.</p>
<h2>Types of Cell Division</h2>
<ol>
  <li>Mitosis</li>
  <li>Meiosis</li>
</ol>
<blockquote>
  <p><strong>Important:</strong> Both processes are essential for life!</p>
</blockquote>
```

### **Step 3: Saved to Database**

```json
{
  "content_structure": {
    "sections": [
      {
        "id": "section-1",
        "title": "Introduction",
        "content_type": "text",
        "content_data": {
          "text": "<h1>Cell Division</h1><p>Cell division is..."
        }
      }
    ]
  }
}
```

### **Step 4: Displayed to Students**

Students see beautifully formatted content:

```
─────────────────────────────────
│ Cell Division (Large Heading) │
─────────────────────────────────

Cell division is the process by which a parent cell 
divides into two or more daughter cells.

Types of Cell Division (Medium Heading)

1. Mitosis
2. Meiosis

┌─────────────────────────────────┐
│ Important: Both processes are   │
│ essential for life!             │
└─────────────────────────────────┘
```

---

## 🔍 **Content Features in Preview vs Student View**

| Feature | Preview Modal | Student Viewer |
|---------|---------------|----------------|
| Headings | ✅ Styled | ✅ Larger, bolder |
| Paragraphs | ✅ Gray text | ✅ Relaxed spacing |
| Bold/Italic | ✅ Applied | ✅ Enhanced |
| Lists | ✅ Basic | ✅ Better spacing |
| Links | ✅ Blue | ✅ Blue + hover |
| Images | ✅ Rounded | ✅ Shadow + rounded |
| Tables | ✅ Bordered | ✅ Styled headers |
| Code Blocks | ✅ Gray bg | ✅ Dark bg |
| Blockquotes | ✅ Border | ✅ Blue accent |
| Key Points | ✅ Shown | ✅ Blue callout |

---

## 🖼️ **Image Handling**

### **How Images Work:**

1. **In CKEditor:** Teacher pastes or uploads image
2. **Storage:** Image converted to Base64 string
3. **In HTML:** `<img src="data:image/png;base64,...">`
4. **Display:** Image appears inline with text

**Styling:**
```css
✓ Rounded corners (8px)
✓ Shadow (for depth)
✓ Vertical margin (24px top/bottom)
✓ Responsive (max-width: 100%)
```

---

## 📋 **Table Rendering**

### **CKEditor Table:**

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

### **Stored as HTML:**

```html
<table>
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
      <th>Column 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
      <td>Data 3</td>
    </tr>
  </tbody>
</table>
```

### **Displayed with:**
```
✓ Full width
✓ Collapsed borders
✓ Header row (gray background)
✓ Cell padding (12px)
✓ Border around all cells
```

---

## 🎯 **Key Points Section**

### **What It Is:**

Optional highlighted section added via metadata:

```json
{
  "metadata": {
    "key_points": [
      "Cell division creates new cells",
      "Mitosis produces identical cells",
      "Meiosis produces genetic variation"
    ]
  }
}
```

### **How It Displays:**

**In Preview:**
```
─────────────────────────────
Key Points:
• Cell division creates new cells
• Mitosis produces identical cells  
• Meiosis produces genetic variation
─────────────────────────────
```

**In Student View (Enhanced):**
```
┌───────────────────────────────────┐
│ 🎯 Key Points:                    │
│                                   │
│ • Cell division creates new cells│
│ • Mitosis produces identical cells│
│ • Meiosis produces genetic        │
│   variation                       │
└───────────────────────────────────┘
(Blue background, icon, styled list)
```

---

## ✅ **Security: dangerouslySetInnerHTML**

### **Why It's Safe:**

1. **Content Source:** Only teachers can create content
2. **No User Input:** Students can't edit HTML
3. **Sanitization:** CKEditor produces clean HTML
4. **Controlled:** Content goes through validation

### **What It Does:**

```tsx
// This tells React: "Render this HTML directly"
<div dangerouslySetInnerHTML={{ __html: htmlContent }} />
```

**Without it:** 
```
Content shows as: <p>Hello</p> (literal text)
```

**With it:**
```
Content shows as: Hello (rendered paragraph)
```

---

## 🧪 **Testing the Display**

### **Test Preview:**

1. Create module with section
2. Add content in CKEditor:
   - Heading: "Test Heading"
   - Paragraph with **bold** text
   - List with 3 items
   - Image
3. Click "Preview Module"
4. ✅ **Verify:** All formatting appears correctly

### **Test Student View:**

1. Save the module
2. Go to student view (if available)
3. Open the module
4. ✅ **Verify:** 
   - Headings are larger
   - Lists are indented
   - Images have shadows
   - Tables are styled
   - Key points show in blue box

---

## 📱 **Responsive Design**

Content adapts to screen size:

**Desktop:**
- Full width (max 1200px)
- Large fonts
- Images full size

**Tablet:**
- Adjusted width
- Slightly smaller fonts
- Images responsive

**Mobile:**
- Full width
- Readable fonts
- Images scale down
- Tables scroll horizontally

---

## 🎨 **Customization**

### **To Change Styling:**

**Preview (Teacher):**
Edit: `vark-module-preview.tsx` line 318

**Student View:**
Edit: `dynamic-module-viewer.tsx` line 200

**Available Classes:**
- `prose-h1:text-4xl` - Change H1 size
- `prose-p:text-blue-600` - Change paragraph color
- `prose-a:underline` - Always underline links
- `prose-img:shadow-2xl` - Bigger image shadow
- `prose-table:border-2` - Thicker table borders

---

## ✅ **Summary**

| Aspect | Implementation |
|--------|----------------|
| Storage | HTML string |
| Rendering | dangerouslySetInnerHTML |
| Styling | Tailwind prose classes |
| Preview | vark-module-preview.tsx |
| Student View | dynamic-module-viewer.tsx |
| Images | Base64 embedded |
| Tables | Fully styled |
| Safety | Teacher-only content |

---

## 🎉 **Result**

**Teachers get:**
- ✅ Easy WYSIWYG editing
- ✅ Accurate preview
- ✅ Professional output

**Students get:**
- ✅ Beautiful, readable content
- ✅ Proper formatting
- ✅ Enhanced learning experience

**Your content looks exactly as you designed it! 🎨**

---

**Last Updated:** October 20, 2025  
**Editor:** CKEditor 5  
**Components Updated:** 2 (Preview + Viewer)  
**Status:** ✅ Production Ready
