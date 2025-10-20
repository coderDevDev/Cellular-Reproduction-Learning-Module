# Editor.js Integration Documentation

## Overview

This document describes the Editor.js integration in the VARK Module Builder, providing teachers with a powerful WYSIWYG (What You See Is What You Get) content editor for creating rich, structured learning modules.

## 🎯 Why Editor.js?

### Key Benefits

1. **Block-Style Editing**: Similar to Google Docs, Notion, and Medium
2. **Clean JSON Output**: Structured data instead of messy HTML
3. **Extensible**: Easy to add new block types
4. **Re-editable**: Edit content without losing structure
5. **Mobile-Friendly**: Responsive and touch-friendly interface

### Comparison with Traditional Textarea

| Feature | Traditional Textarea | Editor.js |
|---------|---------------------|-----------|
| **Formatting** | Plain text or manual HTML | Rich formatting with blocks |
| **User Experience** | Basic input field | Professional WYSIWYG editor |
| **Data Structure** | Raw text/HTML string | Clean JSON |
| **Content Reuse** | Difficult | Easy (JSON is portable) |
| **Learning Curve** | Minimal | Moderate (but intuitive) |

## 📦 Installed Packages

```json
{
  "@editorjs/editorjs": "Latest",
  "@editorjs/header": "Latest",
  "@editorjs/list": "Latest",
  "@editorjs/paragraph": "Latest",
  "@editorjs/quote": "Latest",
  "@editorjs/checklist": "Latest",
  "@editorjs/table": "Latest",
  "@editorjs/code": "Latest",
  "@editorjs/delimiter": "Latest",
  "@editorjs/warning": "Latest",
  "@editorjs/marker": "Latest",
  "@editorjs/inline-code": "Latest"
}
```

## 🏗️ Architecture

### Component Structure

```
client/
├── components/vark-modules/
│   ├── editorjs-content-editor.tsx       # Core Editor.js wrapper
│   ├── editorjs-section-editor.tsx       # Section editor with Editor.js
│   └── steps/
│       └── content-structure-step.tsx    # Integration point
├── lib/utils/
│   └── editorjs-converter.ts             # JSON ↔ Text/HTML converters
└── types/
    └── vark-module.ts                    # Type definitions
```

## 🔧 Implementation Details

### 1. EditorJS Content Editor Component

**File**: `components/vark-modules/editorjs-content-editor.tsx`

**Purpose**: Wraps Editor.js for use in React with Next.js

**Key Features**:
- Dynamic import to avoid SSR issues
- Memoized for performance
- Automatic cleanup on unmount
- Real-time onChange callbacks

**Usage**:
```tsx
<EditorJSContentEditor
  data={editorData}
  onChange={handleEditorChange}
  placeholder="Start writing..."
  readOnly={false}
/>
```

### 2. EditorJS Section Editor

**File**: `components/vark-modules/editorjs-section-editor.tsx`

**Purpose**: Full section editor with Editor.js and metadata controls

**Features**:
- Two-tab interface (Editor | Settings)
- Auto-extraction of key points
- Learning style selection
- Time estimation
- Content type selection
- Plain text preview

### 3. Content Structure Step Integration

**File**: `components/vark-modules/steps/content-structure-step.tsx`

**Changes**:
- Added `useEditorJS` state to toggle between editors
- Conditional rendering: Traditional editor OR Editor.js editor
- "✨ Use Editor.js" button in section edit header

**Flow**:
```
Section List → Select Section → Choose Editor Mode
                                      ↓
                        ┌──────────────┴──────────────┐
                        ↓                             ↓
                Traditional Editor          Editor.js Editor
                (Textarea + Forms)          (WYSIWYG + Tabs)
```

### 4. Utility Functions

**File**: `lib/utils/editorjs-converter.ts`

**Functions**:

#### `editorJsToPlainText(data: OutputData): string`
Converts Editor.js JSON to plain text for search and previews.

#### `editorJsToHtml(data: OutputData): string`
Converts Editor.js JSON to formatted HTML for rendering in module viewer.

#### `plainTextToEditorJs(text: string): OutputData`
Converts existing plain text content to Editor.js format (for migration).

#### `extractKeyPoints(data: OutputData): string[]`
Automatically extracts key points from headers and lists.

### 5. Type Definitions

**File**: `types/vark-module.ts`

**Added**:
```typescript
import { OutputData } from '@editorjs/editorjs';

export interface VARKContentData {
  text?: string;
  html?: string;
  editorjs_data?: OutputData; // NEW: Editor.js JSON
  // ... other fields
}
```

## 🎨 Available Block Types

### Text Blocks
- **Paragraph**: Basic text with inline formatting
- **Header**: H1-H6 headings
- **Quote**: Blockquotes with attribution
- **Code**: Syntax-highlighted code blocks

### List Blocks
- **List**: Ordered or unordered lists
- **Checklist**: Interactive checkboxes

### Structural Blocks
- **Table**: Data tables with custom rows/columns
- **Delimiter**: Visual separators
- **Warning**: Important callouts

### Inline Tools
- **Marker**: Highlight text
- **Inline Code**: Code formatting
- **Bold, Italic, Link**: Standard text formatting

## 📊 Data Flow

### Saving Content

```
1. User edits in Editor.js
   ↓
2. onChange callback triggered
   ↓
3. Editor.save() returns JSON
   ↓
4. JSON stored in content_data.editorjs_data
   ↓
5. Auto-convert to plain text (content_data.text)
   ↓
6. Auto-convert to HTML (content_data.html)
   ↓
7. Extract key points (metadata.key_points)
   ↓
8. Save to database
```

### Loading Content

```
1. Fetch module from database
   ↓
2. Check if editorjs_data exists
   ↓
   ├─ YES → Load directly into Editor.js
   └─ NO  → Convert text to Editor.js format
   ↓
3. Render in editor
```

## 🚀 Usage Guide

### For Teachers

#### Creating Content with Editor.js

1. **Start Creating**: Click "Create New Module" on VARK Modules page
2. **Navigate to Content Structure**: Go to Step 2
3. **Add or Select Section**: Create new or select existing section
4. **Enable Editor.js**: Click "✨ Use Editor.js" button
5. **Create Content**: 
   - Type `/` or click `+` to add blocks
   - Use inline formatting (Ctrl+B for bold, etc.)
   - Add headers, lists, tables as needed
6. **Review Auto-Generated**: Check the auto-extracted key points
7. **Configure Settings**: Set learning styles, time estimate
8. **Save**: Click "Save Section"

#### Block Types Guide

**Headers**: Great for section titles
```
Type: /header or click + → Header
Choose level: H1, H2, H3, etc.
```

**Lists**: For step-by-step instructions
```
Type: /list or click + → List
Choose: Ordered or Unordered
```

**Tables**: For comparing concepts
```
Type: /table or click + → Table
Configure rows and columns
```

**Quotes**: For definitions or citations
```
Type: /quote or click + → Quote
Add text and attribution
```

**Warning**: For important notes
```
Type: /warning or click + → Warning
Add title and message
```

### For Developers

#### Adding New Block Types

1. Install the block package:
```bash
npm install @editorjs/new-block
```

2. Import in `editorjs-content-editor.tsx`:
```typescript
import NewBlock from '@editorjs/new-block';
```

3. Add to tools configuration:
```typescript
tools: {
  newBlock: {
    class: NewBlock,
    config: {
      // Block-specific config
    }
  }
}
```

4. Update converter functions in `editorjs-converter.ts`:
```typescript
case 'newBlock':
  return `<div class="new-block">${block.data.content}</div>`;
```

## 🔄 Migration Guide

### Converting Existing Modules

Existing modules with plain text content will automatically convert to Editor.js format when opened in the editor:

```typescript
// Automatic conversion happens in editorjs-section-editor.tsx
const [editorData, setEditorData] = useState<OutputData>(() => {
  if (section.content_data?.editorjs_data) {
    return section.content_data.editorjs_data;
  } else if (section.content_data?.text) {
    return plainTextToEditorJs(section.content_data.text); // AUTO-CONVERT
  }
  // ... default empty editor
});
```

### Manual Conversion Script (if needed)

```typescript
// utils/convert-modules-to-editorjs.ts
import { plainTextToEditorJs } from '@/lib/utils/editorjs-converter';

async function convertModulesToEditorJS() {
  const modules = await fetchAllModules();
  
  for (const module of modules) {
    for (const section of module.content_structure.sections) {
      if (!section.content_data.editorjs_data && section.content_data.text) {
        section.content_data.editorjs_data = plainTextToEditorJs(
          section.content_data.text
        );
        await updateSection(section);
      }
    }
  }
}
```

## 🎓 Best Practices

### Content Structure

1. **Use Headers Hierarchically**: Start with H2, use H3 for subsections
2. **Break Up Text**: Use multiple paragraph blocks instead of one long block
3. **Add Visual Breaks**: Use delimiters between major sections
4. **Highlight Key Terms**: Use marker for important concepts
5. **Use Lists**: Break down steps or key points into lists

### Performance

1. **Limit Block Count**: Keep sections under 50 blocks for best performance
2. **Avoid Large Tables**: Split large tables into multiple smaller ones
3. **Lazy Load**: Editor.js is dynamically imported (already implemented)

### Accessibility

1. **Proper Heading Hierarchy**: Use H2→H3→H4, don't skip levels
2. **Alt Text for Images**: (When image tool is added)
3. **Descriptive Link Text**: Use meaningful link text, not "click here"

## 🐛 Troubleshooting

### Editor Not Loading

**Problem**: Editor.js component doesn't render
**Solution**: Ensure dynamic import is used (no SSR)
```typescript
const EditorJSContentEditor = dynamic(
  () => import('./editorjs-content-editor'),
  { ssr: false }
);
```

### Content Not Saving

**Problem**: Editor data not persisting
**Solution**: Check that `onChange` callback is properly connected:
```typescript
onChange: async () => {
  const outputData = await editorRef.current.save();
  onChange(outputData); // Must call parent callback
}
```

### TypeScript Errors

**Problem**: `editorjs_data` not recognized
**Solution**: Ensure `OutputData` type is imported in `vark-module.ts`:
```typescript
import { OutputData } from '@editorjs/editorjs';
```

## 📝 Example JSON Structure

### Simple Section with Editor.js

```json
{
  "id": "section-1",
  "title": "Introduction to Cell Division",
  "content_type": "text",
  "content_data": {
    "editorjs_data": {
      "blocks": [
        {
          "type": "header",
          "data": {
            "text": "What is Cell Division?",
            "level": 2
          }
        },
        {
          "type": "paragraph",
          "data": {
            "text": "Cell division is the process..."
          }
        },
        {
          "type": "list",
          "data": {
            "style": "unordered",
            "items": [
              "Growth and development",
              "Repair and regeneration",
              "Reproduction"
            ]
          }
        }
      ]
    },
    "text": "What is Cell Division?\n\nCell division is the process...\n\n• Growth and development\n• Repair and regeneration\n• Reproduction",
    "html": "<h2>What is Cell Division?</h2><p>Cell division is the process...</p><ul><li>Growth and development</li>..."
  },
  "metadata": {
    "key_points": [
      "What is Cell Division?",
      "Growth and development",
      "Repair and regeneration"
    ]
  }
}
```

## 🔮 Future Enhancements

### Planned Features

1. **Image Upload**: Add image block with upload capability
2. **Embed Block**: YouTube, Vimeo video embeds
3. **Math Equations**: LaTeX/MathJax support
4. **Collaborative Editing**: Real-time collaboration
5. **Version History**: Track content changes
6. **AI Assistance**: Auto-suggestions and content improvement

### Custom Block Ideas

1. **VARK Activity Block**: Specialized block for VARK activities
2. **Quiz Block**: Inline quizzes within content
3. **Flashcard Block**: Create flashcards inline
4. **Definition Block**: Glossary terms with definitions
5. **Comparison Block**: Side-by-side comparisons

## 📚 Additional Resources

- [Editor.js Official Docs](https://editorjs.io/)
- [Editor.js GitHub](https://github.com/codex-team/editor.js)
- [Available Plugins](https://github.com/editor-js)
- [Creating Custom Blocks](https://editorjs.io/creating-a-block-tool)

## 📄 License

This integration follows the same license as the BISCAS NAGA Learning Module project.

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainer**: BISCAS NAGA Development Team
