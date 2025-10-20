# 📐 Layout & Columns Guide for Editor.js

## Overview

The **Layout tool** allows you to create **side-by-side content** like:
- Image next to text
- Two-column comparisons
- Multi-column layouts
- Containers with nested blocks

Perfect for creating professional, magazine-style learning content!

---

## 🎯 Why Use Layouts?

### **Before (Without Layout):**
```
[Header]
[Paragraph of text]
[Image]
[More text]
```
Everything is stacked vertically ⬇️

### **After (With Layout):**
```
┌─────────────────┬─────────────────┐
│                 │                 │
│    [Image]      │   [Text Here]   │
│                 │   [More Text]   │
│                 │                 │
└─────────────────┴─────────────────┘
```
Content can be side-by-side ↔️

---

## 🚀 How to Use Layout Tool

### **Step 1: Add Layout Block**

1. Click the **`+`** button in Editor.js
2. Select **"Layout"** from the menu
3. A container appears with layout options

### **Step 2: Configure Layout**

You'll see layout configuration options:
- **Container**: Basic wrapper (most common)
- **Columns**: 2, 3, or 4 columns
- **Custom**: Advanced configurations

### **Step 3: Add Content to Columns**

1. Click inside a column
2. Add blocks (paragraph, image, list, etc.)
3. Each column works like a mini-editor

### **Step 4: Customize**

- Add more columns
- Adjust column widths
- Add styling classes
- Nest layouts inside layouts!

---

## 📚 Common Use Cases

### **1. Image + Text Side-by-Side**

**Perfect for:**
- Explaining diagrams
- Before/After comparisons
- Step-by-step with visuals

**How to create:**
```
1. Add Layout block
2. Configure as 2-column layout
3. Column 1: Add Image
4. Column 2: Add Paragraphs explaining the image
```

**Example Result:**
```
┌──────────────┬─────────────────────────┐
│              │ Cell Division Process   │
│  [Diagram]   │                         │
│              │ The diagram shows the   │
│              │ stages of mitosis...    │
└──────────────┴─────────────────────────┘
```

---

### **2. Two-Column Comparison**

**Perfect for:**
- Mitosis vs Meiosis
- Pros vs Cons
- Before vs After

**How to create:**
```
1. Add Layout (2 columns)
2. Column 1: Header "Mitosis" + details
3. Column 2: Header "Meiosis" + details
```

**Example Result:**
```
┌─────────────────┬─────────────────┐
│ **Mitosis**     │ **Meiosis**     │
├─────────────────┼─────────────────┤
│ • 2 cells       │ • 4 cells       │
│ • Identical     │ • Different     │
│ • Body growth   │ • Reproduction  │
└─────────────────┴─────────────────┘
```

---

### **3. Three-Column Feature Highlight**

**Perfect for:**
- Learning style focus (Visual, Auditory, Kinesthetic)
- Step 1, 2, 3
- Category breakdowns

**How to create:**
```
1. Add Layout (3 columns)
2. Each column: Header + Content
3. Add icons/images at top
```

**Example Result:**
```
┌───────────┬───────────┬───────────┐
│ 👁️ Visual  │ 🎧 Audio   │ ⚡ Hands-on│
├───────────┼───────────┼───────────┤
│ Watch     │ Listen to │ Do the    │
│ diagram   │ lecture   │ lab       │
│ animation │ podcast   │ experiment│
└───────────┴───────────┴───────────┘
```

---

### **4. Image Gallery**

**Perfect for:**
- Multiple related images
- Process steps
- Comparisons

**How to create:**
```
1. Add Layout (2 or 3 columns)
2. Each column: Image + Caption
```

**Example Result:**
```
┌────────────┬────────────┬────────────┐
│ [Image 1]  │ [Image 2]  │ [Image 3]  │
│ Prophase   │ Metaphase  │ Anaphase   │
└────────────┴────────────┴────────────┘
```

---

### **5. Sidebar Layout**

**Perfect for:**
- Main content + related info
- Text + quick facts
- Content + resources

**How to create:**
```
1. Add Layout (2 columns, 70%/30% split if possible)
2. Wide column: Main content
3. Narrow column: Sidebar info
```

**Example Result:**
```
┌───────────────────────┬──────────┐
│ Main lesson content   │ 📌 Quick │
│ about cell division   │   Facts  │
│ with detailed         │          │
│ explanations...       │ • 23 chr │
│                       │ • 2 hrs  │
│                       │ • 4 phas │
└───────────────────────┴──────────┘
```

---

## 🎨 Layout Block Features

### **Nested Content**

You can add ANY block type inside layout columns:
- ✅ Paragraphs
- ✅ Headers
- ✅ Lists
- ✅ Images
- ✅ Videos (Embed)
- ✅ Tables
- ✅ Quotes
- ✅ Code blocks
- ✅ Even MORE Layouts! (nested)

### **Responsive Design**

Layouts automatically adapt:
- **Desktop**: Side-by-side columns
- **Tablet**: May stack or resize
- **Mobile**: Stacks vertically

Your content looks good on all devices! 📱💻

---

## 💡 Best Practices

### **Do's ✅**

1. **Balance Column Heights**
   - Try to keep columns similar heights
   - Looks more professional

2. **Use Consistent Spacing**
   - Add similar content to each column
   - Align headers at same level

3. **Limit Column Count**
   - 2-3 columns: ✅ Great
   - 4 columns: ⚠️ Okay
   - 5+ columns: ❌ Too crowded

4. **Mobile First**
   - Remember columns stack on mobile
   - Ensure content makes sense stacked

5. **Clear Purpose**
   - Use layouts when they ADD value
   - Don't force content into columns

### **Don'ts ❌**

1. **Don't Overuse**
   - Not everything needs columns
   - Mix with regular blocks

2. **Don't Put Long Text in Narrow Columns**
   - Hard to read
   - Use wider columns for text-heavy content

3. **Don't Nest Too Deeply**
   - Layouts inside layouts inside layouts = confusing
   - 2 levels max recommended

4. **Don't Forget Captions**
   - Always label images in layouts
   - Add headers to clarify purpose

---

## 🎓 Examples by Subject

### **Biology: Cell Division Lesson**

```
[Header: Cell Division]
[Paragraph: Introduction]

[Layout - 2 Columns]
┌─────────────────┬─────────────────┐
│ [Image]         │ [Header]        │
│ Cell diagram    │ Key Stages      │
│                 │                 │
│                 │ • Prophase      │
│                 │ • Metaphase     │
│                 │ • Anaphase      │
│                 │ • Telophase     │
└─────────────────┴─────────────────┘

[Paragraph: Conclusion]
```

---

### **Physics: Force Comparison**

```
[Layout - 2 Columns]
┌────────────────────┬────────────────────┐
│ **Balanced Forces**│**Unbalanced Forces**│
│                    │                    │
│ [Image: Tug of war │ [Image: Tug of war│
│  equal sides]      │  one side winning] │
│                    │                    │
│ • No motion        │ • Acceleration     │
│ • Equal magnitude  │ • Net force exists │
│ • Static state     │ • Direction change │
└────────────────────┴────────────────────┘
```

---

### **Chemistry: Lab Procedure**

```
[Layout - 3 Columns]
┌────────┬────────┬────────┐
│ Step 1 │ Step 2 │ Step 3 │
├────────┼────────┼────────┤
│[Image] │[Image] │[Image] │
│        │        │        │
│Pour    │Heat    │Observe │
│reagent │mixture │change  │
└────────┴────────┴────────┘
```

---

## 🛠️ Advanced Techniques

### **Nested Layouts**

Create complex structures:

```
[Outer Layout - 2 Columns]
┌─────────────────────┬──────────────────┐
│ [Inner Layout]      │ [Regular Content]│
│ ┌────────┬────────┐ │                  │
│ │Column A│Column B│ │ • Point 1        │
│ └────────┴────────┘ │ • Point 2        │
└─────────────────────┴──────────────────┘
```

### **Mixed Content Columns**

Combine different block types:

```
[Layout - 2 Columns]
┌──────────────┬──────────────┐
│ [Header]     │ [Image]      │
│ [Paragraph]  │ [Caption]    │
│ [List]       │ [Video]      │
│ • Item 1     │              │
│ • Item 2     │              │
└──────────────┴──────────────┘
```

### **Asymmetric Layouts**

Different amounts of content:

```
┌────────────────┬────────┐
│ Large column   │ Small  │
│ with lots of   │ sidebar│
│ detailed text  │ info   │
│ and multiple   │        │
│ paragraphs...  │ • Tip 1│
│                │ • Tip 2│
└────────────────┴────────┘
```

---

## 🎯 VARK Learning Styles

### **Visual Learners (👁️)**

Use layouts for:
- Image + explanation side-by-side
- Process diagrams with steps
- Before/after comparisons
- Visual categorization

**Example:**
```
[Layout]
Image of labeled diagram | Text explaining each label
```

---

### **Reading/Writing Learners (✏️)**

Use layouts for:
- Compare/contrast essays
- Two-column notes
- Main content + definitions sidebar
- Text-heavy breakdowns

**Example:**
```
[Layout]
Main concept text | Key terms & definitions
```

---

### **Kinesthetic Learners (⚡)**

Use layouts for:
- Step-by-step procedures
- Hands-on activity instructions
- Process flows
- Sequential images

**Example:**
```
[Layout - 3 Columns]
Step 1 instructions | Step 2 instructions | Step 3 instructions
```

---

### **Auditory Learners (🎧)**

Use layouts for:
- Video + transcript
- Podcast + notes
- Audio lecture + key points
- Video + discussion questions

**Example:**
```
[Layout]
Embedded lecture video | Key points to listen for
```

---

## 🔧 Troubleshooting

### **Layout Tool Not Showing**

**Solution:**
1. Restart dev server (`Ctrl+C` then `npm run dev`)
2. Clear browser cache (`Ctrl+F5`)
3. Check console for layout tool message

### **Columns Look Weird on Mobile**

**Expected Behavior:**
- Columns stack vertically on small screens
- This is by design for readability

### **Can't Add Content to Column**

**Solution:**
- Click directly inside the column
- Look for the `+` button
- Or start typing

### **Layout Disappeared When Editing**

**Solution:**
- Layout data is preserved
- Reload the editor
- Check browser console for errors

---

## 📱 Responsive Behavior

### **Desktop (>1024px)**
```
┌───────┬───────┬───────┐
│   1   │   2   │   3   │
└───────┴───────┴───────┘
```

### **Tablet (768px-1024px)**
```
┌───────┬───────┐
│   1   │   2   │
├───────┴───────┤
│       3       │
└───────────────┘
```

### **Mobile (<768px)**
```
┌───────────────┐
│       1       │
├───────────────┤
│       2       │
├───────────────┤
│       3       │
└───────────────┘
```

---

## 🎨 Styling Tips

### **Visual Hierarchy**

```
1. Use headers in each column
2. Keep similar content heights
3. Add icons or emojis for quick recognition
4. Use borders/backgrounds to separate
```

### **Color Coding**

```
Column 1: 🔵 Blue theme (Theory)
Column 2: 🟢 Green theme (Practice)
Column 3: 🟡 Yellow theme (Assessment)
```

### **Alignment**

```
• Left-align text columns
• Center images
• Right-align numbers/data
• Top-align column content
```

---

## 📊 When to Use What

| Layout Type | Best For | Example |
|-------------|----------|---------|
| **2 Columns** | Comparisons, Image+Text | Mitosis vs Meiosis |
| **3 Columns** | Steps, Categories | Visual/Audio/Kinesthetic |
| **4 Columns** | Gallery, Options | 4 phases of mitosis |
| **Nested** | Complex structures | Lesson with sidebar & gallery |
| **Asymmetric** | Main + Sidebar | Content + Quick facts |

---

## 🚀 Quick Start Checklist

Creating your first layout:

```
□ Click + button
□ Select "Layout"
□ Choose column count
□ Click inside first column
□ Add content (text, image, etc.)
□ Move to next column
□ Add content
□ Save section
□ Preview result
```

---

## 💡 Pro Tips

1. **Start Simple**
   - Begin with 2-column layouts
   - Master basics before complex layouts

2. **Think Mobile First**
   - Design so stacked columns still make sense

3. **Use for Enhancement**
   - Layouts should clarify, not complicate

4. **Test on Different Screens**
   - Preview on phone, tablet, desktop

5. **Keep Consistent**
   - Use similar layouts throughout module

---

## 📚 Additional Resources

### **Similar Tools in Other Editors**

- Google Docs: Tables for layout
- Notion: Columns feature
- WordPress: Column blocks
- Canva: Grid layouts

### **Layout Inspiration**

- Magazine articles
- Infographics
- Comparison charts
- Product catalogs

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Feature:** Layout & Columns Support ⭐ NEW
