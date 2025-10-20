# 📝 Editor.js Blocks Quick Reference

## Complete Block Types Available

### 📄 Text Blocks

#### **Paragraph**
```
Type: /paragraph or just start typing
Use: Regular body text
Example: "Cell division is the process..."
```

#### **Header** (H1-H6)
```
Type: /header or /h1, /h2, /h3, etc.
Use: Section titles and subtitles
Example: "## What is Mitosis?"
```

#### **Quote**
```
Type: /quote
Use: Important statements, definitions, citations
Example: 
"Mitosis is the process of cell division..."
— Biology Textbook, Chapter 5
```

#### **Code**
```
Type: /code
Use: Programming code, formulas, structured text
Example:
function cellDivide(cell) {
  return cell.split();
}
```

---

### 📝 List Blocks

#### **List** (Unordered/Ordered)
```
Type: /list
Use: Steps, bullet points, numbered items
Example:
• Growth
• Repair  
• Reproduction
```

#### **Checklist**
```
Type: /checklist
Use: Tasks, to-dos, learning objectives
Example:
☑ Understand cell cycle
☐ Draw mitosis stages
☐ Compare mitosis and meiosis
```

---

### 🖼️ Media Blocks

#### **Image** ⭐ NEW
```
Type: /image
Methods: 
  - Upload file (JPG, PNG, GIF, WebP, SVG)
  - Paste URL

Features:
  - Add caption
  - Border
  - Background
  - Stretch to full width

Use Cases:
  - Diagrams and charts
  - Screenshots
  - Photos and illustrations
  - Scientific images

Example:
[Cell Division Diagram]
Caption: "The stages of mitosis in order"
```

#### **Embed (Video)** ⭐ NEW
```
Type: /embed
Supported:
  - YouTube ⭐
  - Vimeo
  - Facebook
  - Instagram
  - Twitter
  - Twitch
  - CodePen

Use Cases:
  - Video lessons
  - Demonstrations
  - Documentaries
  - Lectures

Example:
YouTube: https://youtube.com/watch?v=xyz
Caption: "Cell Division Animation - 3D"
```

---

### 📊 Structured Blocks

#### **Table**
```
Type: /table
Use: Data comparison, specifications, schedules
Example:
| Phase      | Chromosome | Duration |
|------------|------------|----------|
| Prophase   | Condense   | 30 min   |
| Metaphase  | Align      | 20 min   |
```

#### **Warning**
```
Type: /warning
Use: Important notes, cautions, key concepts
Example:
⚠️ Important
Remember: Mitosis creates identical cells,
meiosis creates unique cells!
```

---

### ✨ Special Blocks

#### **Delimiter**
```
Type: /delimiter
Use: Visual section break
Appears as: ———
```

#### **Layout (Columns)** ⭐ NEW
```
Type: /layout
Shortcut: CMD+L

Use: Multi-column layouts, side-by-side content

Features:
  - 2, 3, or 4 columns
  - Nest any blocks inside
  - Responsive (stacks on mobile)
  - Perfect for comparisons

Use Cases:
  - Image + text side-by-side
  - Compare/contrast layouts
  - Step-by-step columns
  - Gallery layouts

Example:
┌──────────┬──────────┐
│ [Image]  │ [Text]   │
│          │ Details  │
└──────────┴──────────┘
```

---

### 🎨 Inline Formatting

Available in **all text blocks**:

#### **Bold**
```
Shortcut: Ctrl+B (Windows) / Cmd+B (Mac)
Select text → Click B or use shortcut
```

#### **Italic**
```
Shortcut: Ctrl+I (Windows) / Cmd+I (Mac)
Select text → Click I or use shortcut
```

#### **Link**
```
Shortcut: Ctrl+K (Windows) / Cmd+K (Mac)
Select text → Click link icon → Enter URL
```

#### **Marker (Highlight)**
```
Shortcut: Ctrl+Shift+M
Select text → Click marker icon
Creates: highlighted text
```

#### **Inline Code**
```
Shortcut: Ctrl+Shift+C
Select text → Click code icon
Creates: `code text`
```

---

## 🎯 Quick Access Methods

### Method 1: Slash Commands
```
Type / anywhere → Select block type
Examples:
/header
/image
/list
/table
```

### Method 2: Plus Button
```
Click + in left margin → Select from menu
Visual picker with icons
```

### Method 3: Keyboard Shortcuts
```
Enter → New paragraph
# → Header
* or - → List
``` → Quote
```

---

## 📚 Block Use Cases by Learning Style

### Visual Learners (👁️)
**Best Blocks:**
- ✅ **Image** - Diagrams, charts, infographics
- ✅ **Table** - Data comparison
- ✅ **Embed** - Visual demonstrations
- ✅ **Header** - Clear organization

**Example Module:**
```
## Cell Division Overview
[Image: Cell Division Cycle Diagram]

### Comparison Table
| Mitosis | Meiosis |
|---------|---------|
```

### Auditory Learners (🎧)
**Best Blocks:**
- ✅ **Embed** - Video lectures, talks
- ✅ **Quote** - Key spoken concepts
- ✅ **List** - Verbal steps
- ✅ **Paragraph** - Narration style

**Example Module:**
```
## Listen and Learn
[Embed: YouTube - Cell Division Explained]

> "The cell cycle is a continuous process..."
```

### Reading/Writing Learners (✏️)
**Best Blocks:**
- ✅ **Paragraph** - Detailed text
- ✅ **Header** - Structured outline
- ✅ **List** - Key points
- ✅ **Quote** - Definitions
- ✅ **Code** - Formulas

**Example Module:**
```
## Detailed Explanation

Cell division occurs when...

### Key Points:
• Growth occurs through mitosis
• Reproduction uses meiosis

> Definition: Mitosis is...
```

### Kinesthetic Learners (⚡)
**Best Blocks:**
- ✅ **Checklist** - Action items
- ✅ **Embed** - Demonstration videos
- ✅ **Image** - Step-by-step visuals
- ✅ **Warning** - Safety notes
- ✅ **List** - Procedure steps

**Example Module:**
```
## Hands-On Activity

☐ Step 1: Prepare slide
☐ Step 2: Add sample
☐ Step 3: Observe

[Embed: Lab Procedure Video]

⚠️ Safety First
Always wear protective equipment
```

---

## 🎨 Layout Combinations

### Professional Article Style
```
Header (H1) - Main title
Paragraph - Introduction
Image - Hero/featured image
Header (H2) - First section
Paragraph - Content
List - Key points
Table - Data
Header (H2) - Second section
...
```

### Step-by-Step Guide
```
Header (H1) - Guide title
Paragraph - Overview
Checklist - What you'll learn
Header (H2) - Step 1
Image - Visual guide
Paragraph - Instructions
Warning - Important note
Header (H2) - Step 2
...
```

### Research/Academic Style
```
Header (H1) - Research title
Paragraph - Abstract
Header (H2) - Introduction
Quote - Thesis statement
Header (H2) - Methods
List - Procedures
Table - Results
Image - Charts/graphs
Header (H2) - Discussion
Header (H2) - Conclusion
```

### Video-Enhanced Lesson
```
Header (H1) - Lesson title
Paragraph - Introduction
Embed - Intro video
Header (H2) - Concepts
Paragraph - Explanation
Image - Diagram
Embed - Deep-dive video
Checklist - Learning outcomes
```

---

## 💡 Pro Tips

### Organizing Content
1. **Start with headers** - Create outline first
2. **Add media strategically** - Don't overload
3. **Break up long text** - Use multiple paragraph blocks
4. **Use delimiters** - Separate major sections

### Image Best Practices
- **Caption everything** - Helps with accessibility
- **Compress images** - Faster loading
- **Descriptive filenames** - Better organization
- **Consistent sizing** - Professional look

### Video Best Practices
- **Short clips** - 3-10 minutes ideal
- **Test playback** - Before publishing
- **Provide context** - Explain before video
- **Offer alternatives** - Text summary for accessibility

### Table Best Practices
- **Keep simple** - 3-5 columns max
- **Clear headers** - Descriptive column names
- **Align properly** - Use appropriate alignment
- **Alternate rows** - Better readability (automatic)

### Accessibility
- **Alt text** - Use image captions
- **Clear headers** - Logical hierarchy (H2 → H3, not H2 → H4)
- **Link text** - "Read about mitosis" not "click here"
- **Transcripts** - Summarize video content in text

---

## 🔧 Common Workflows

### Creating a Simple Lesson
```
1. Add title (H1)
2. Write introduction (Paragraph)
3. Add main points (List)
4. Insert diagram (Image)
5. Provide details (Paragraphs)
6. Summarize (Quote)
```

### Building a Complex Module
```
1. Outline with headers (H2, H3)
2. Fill in text (Paragraphs)
3. Add visual aids (Images, Videos)
4. Insert data (Tables)
5. Highlight key points (Warning, Quote)
6. Create checkpoints (Checklist)
7. Add transitions (Delimiter)
```

### Converting Existing Content
```
1. Paste text → Auto-converts to paragraphs
2. Add headers for structure
3. Convert bullet points → Lists
4. Add missing images
5. Embed referenced videos
6. Format special text (Code, Quote)
```

---

## 📊 Block Statistics

**Total Blocks Available:** 15 ⭐

**Text Blocks:** 4
- Paragraph, Header, Quote, Code

**List Blocks:** 2
- List, Checklist

**Media Blocks:** 2 ⭐
- Image, Embed

**Structured Blocks:** 2
- Table, Warning

**Special Blocks:** 2 ⭐
- Delimiter, Layout

**Inline Tools:** 5
- Bold, Italic, Link, Marker, Inline Code

---

## 🎯 Decision Guide

### When to use which block?

**Need to explain something?**
→ Paragraph

**Need to organize ideas?**
→ List or Checklist

**Need to emphasize?**
→ Quote or Warning

**Need to show something?**
→ Image or Embed

**Need to compare data?**
→ Table

**Need to structure content?**
→ Headers

**Need to separate sections?**
→ Delimiter

**Need to show code/formula?**
→ Code

---

## 📱 Mobile Compatibility

All blocks are **fully responsive**:

✅ **Text blocks** - Reflow automatically
✅ **Images** - Scale to screen size
✅ **Videos** - Responsive 16:9 ratio
✅ **Tables** - Horizontal scroll if needed
✅ **Lists** - Maintain formatting

---

## 🚀 Getting Started

1. **Click `+` button** anywhere
2. **Type `/` and search** for block type
3. **Select block** from menu
4. **Start creating!**

**Tip:** Most common blocks appear first in the menu

---

**Last Updated:** January 2025
**Version:** 1.1.0 (with Image, Video & Layout support)
