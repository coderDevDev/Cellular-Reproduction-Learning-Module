# 📊 Database Structure & Data Flow

## Overview

This document explains the complete database structure for VARK Modules and how data flows from the Content Structure editor to the database.

---

## 🗄️ **Database Tables**

### **1. `vark_modules` (Main Table)**

Stores all VARK learning modules.

```sql
CREATE TABLE public.vark_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  learning_objectives JSONB,
  content_structure JSONB, -- ⭐ THIS IS WHERE SECTIONS ARE STORED
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_minutes INTEGER,
  prerequisites JSONB,
  multimedia_content JSONB,
  interactive_elements JSONB,
  assessment_questions JSONB,
  module_metadata JSONB,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📦 **Key JSONB Fields**

### **`content_structure` Field Structure**

This is the most important field for your content:

```typescript
{
  "sections": [
    {
      "id": "section-abc123",
      "title": "Section 1",  // ✏️ Editable, defaults to "Section X"
      "content_type": "text",
      "position": 1,
      "is_required": true,
      "time_estimate_minutes": 15,
      "learning_style_tags": ["visual", "reading_writing"],
      "interactive_elements": [],
      "metadata": {
        "difficulty": "beginner",
        "key_points": ["Point 1", "Point 2"]
      },
      "content_data": {
        "editorjs_data": {  // ⭐ Editor.js JSON output
          "time": 1234567890,
          "blocks": [
            {
              "type": "header",
              "data": {
                "text": "My Header",
                "level": 2
              }
            },
            {
              "type": "paragraph",
              "data": {
                "text": "My paragraph text..."
              }
            },
            {
              "type": "image",
              "data": {
                "url": "https://example.com/image.jpg",
                "caption": "My image caption"
              }
            },
            {
              "type": "video",  // Using Embed tool
              "data": {
                "url": "https://youtube.com/watch?v=ABC",
                "caption": "Video explanation"
              }
            }
          ],
          "version": "2.28.0"
        },
        // Other content type data (tables, quizzes, etc.)
        "table_data": null,
        "quiz_data": null
      }
    },
    // More sections...
  ],
  "learning_path": [],
  "prerequisites_checklist": [],
  "completion_criteria": []
}
```

---

## 🔄 **Data Flow: From Editor to Database**

### **Step 1: User Creates Content**

```typescript
// User types in Editor.js
// Editor.js automatically saves to component state
const handleEditorChange = (data: OutputData) => {
  updateContentSection(index, {
    content_data: {
      ...section.content_data,
      editorjs_data: data  // ⭐ Saves Editor.js JSON
    }
  });
};
```

### **Step 2: Data Accumulates in Form State**

```typescript
// In parent component (e.g., create-module page)
const [formData, setFormData] = useState<Partial<VARKModule>>({
  title: "",
  description: "",
  content_structure: {
    sections: [
      {
        id: "section-1",
        title: "",  // Defaults to "Section 1" if empty
        content_type: "text",
        content_data: {
          editorjs_data: {
            blocks: [...]  // Editor.js content
          }
        },
        // ... other fields
      }
    ],
    learning_path: [],
    prerequisites_checklist: [],
    completion_criteria: []
  },
  // ... other form fields
});
```

### **Step 3: User Clicks "Review & Save Module"**

```typescript
// In your form submit handler
const handleSubmit = async () => {
  try {
    // Prepare data for API
    const moduleData: CreateVARKModuleData = {
      category_id: formData.category_id || 'general-education',
      title: formData.title,
      description: formData.description,
      learning_objectives: formData.learning_objectives || [],
      content_structure: formData.content_structure, // ⭐ Entire structure with sections
      difficulty_level: formData.difficulty_level || 'beginner',
      estimated_duration_minutes: formData.estimated_duration_minutes || 0,
      prerequisites: formData.prerequisites || [],
      multimedia_content: formData.multimedia_content || {},
      interactive_elements: formData.interactive_elements || {},
      assessment_questions: formData.assessment_questions || [],
      module_metadata: formData.module_metadata || {},
      is_published: formData.is_published || false,
      created_by: userId,  // Current user ID
      target_class_id: formData.target_class_id,
      target_learning_styles: formData.target_learning_styles
    };

    // Call API to save
    const api = new VARKModulesAPI();
    const result = await api.createModule(moduleData);
    
    console.log('✅ Module saved with ID:', result.id);
    
  } catch (error) {
    console.error('❌ Failed to save module:', error);
  }
};
```

### **Step 4: API Saves to Database**

```typescript
// In lib/api/vark-modules.ts
async createModule(moduleData: CreateVARKModuleData): Promise<VARKModule> {
  const { data, error } = await this.supabase
    .from('vark_modules')
    .insert(moduleData)  // ⭐ Inserts entire object as JSONB
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create VARK module: ${error.message}`);
  }

  return data;
}
```

### **Step 5: Data in Database**

```json
// In PostgreSQL vark_modules table
{
  "id": "uuid-abc-123",
  "title": "Cell Division Module",
  "content_structure": {
    "sections": [
      {
        "id": "section-1",
        "title": "Introduction to Cell Division",
        "content_type": "text",
        "content_data": {
          "editorjs_data": {
            "blocks": [
              {
                "type": "header",
                "data": { "text": "What is Cell Division?", "level": 2 }
              },
              {
                "type": "paragraph",
                "data": { "text": "Cell division is..." }
              },
              {
                "type": "image",
                "data": {
                  "url": "https://supabase.co/.../cell-diagram.jpg",
                  "caption": "Stages of mitosis"
                }
              },
              {
                "type": "embed",
                "data": {
                  "service": "youtube",
                  "url": "https://youtube.com/watch?v=ABC",
                  "caption": "Cell division video"
                }
              }
            ]
          }
        }
      }
    ]
  },
  "created_at": "2025-10-20T12:00:00Z",
  "updated_at": "2025-10-20T12:00:00Z"
}
```

---

## 🎯 **Complete Example: Saving a Module**

### **Frontend Code (Simplified)**

```typescript
// pages/teacher/vark-modules/page.tsx
'use client';

import { useState } from 'react';
import { VARKModulesAPI } from '@/lib/api/vark-modules';
import ContentStructureStep from '@/components/vark-modules/steps/content-structure-step';

export default function CreateModulePage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_structure: {
      sections: [],
      learning_path: [],
      prerequisites_checklist: [],
      completion_criteria: []
    },
    // ... other fields
  });

  const addContentSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: "",  // Will default to "Section X" in UI
      content_type: "text",
      content_data: {
        editorjs_data: {
          blocks: []
        }
      },
      position: formData.content_structure.sections.length + 1,
      is_required: true,
      time_estimate_minutes: 0,
      learning_style_tags: [],
      interactive_elements: [],
      metadata: {}
    };

    setFormData({
      ...formData,
      content_structure: {
        ...formData.content_structure,
        sections: [...formData.content_structure.sections, newSection]
      }
    });
  };

  const updateContentSection = (index: number, updates: any) => {
    const updatedSections = [...formData.content_structure.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      ...updates
    };

    setFormData({
      ...formData,
      content_structure: {
        ...formData.content_structure,
        sections: updatedSections
      }
    });
  };

  const handleSaveModule = async () => {
    try {
      const api = new VARKModulesAPI();
      const result = await api.createModule({
        category_id: formData.category_id || 'general-education',
        title: formData.title,
        description: formData.description,
        learning_objectives: formData.learning_objectives || [],
        content_structure: formData.content_structure,  // ⭐ All sections saved here
        difficulty_level: formData.difficulty_level || 'beginner',
        estimated_duration_minutes: formData.estimated_duration_minutes || 0,
        prerequisites: formData.prerequisites || [],
        multimedia_content: formData.multimedia_content || {},
        interactive_elements: formData.interactive_elements || {},
        assessment_questions: formData.assessment_questions || [],
        module_metadata: formData.module_metadata || {},
        is_published: false,
        created_by: currentUserId
      });

      console.log('✅ Module saved successfully!', result.id);
      router.push('/teacher/vark-modules');
      
    } catch (error) {
      console.error('❌ Save failed:', error);
      alert('Failed to save module. Check console for details.');
    }
  };

  return (
    <div>
      <ContentStructureStep
        formData={formData}
        updateFormData={setFormData}
        addContentSection={addContentSection}
        updateContentSection={updateContentSection}
        removeContentSection={(index) => {
          const updatedSections = formData.content_structure.sections.filter(
            (_, i) => i !== index
          );
          setFormData({
            ...formData,
            content_structure: {
              ...formData.content_structure,
              sections: updatedSections
            }
          });
        }}
      />
      
      <button onClick={handleSaveModule}>
        Review & Save Module
      </button>
    </div>
  );
}
```

---

## ✅ **What Gets Saved**

When you click "Review & Save Module", the following data is saved to the database:

### **Module Level (Row in `vark_modules` table)**

```json
{
  "id": "generated-uuid",
  "category_id": "general-education",
  "title": "Your Module Title",
  "description": "Your module description",
  "learning_objectives": ["Objective 1", "Objective 2"],
  "content_structure": {  // ⭐ THIS IS THE KEY PART
    "sections": [
      // All your sections with Editor.js content
    ]
  },
  "difficulty_level": "beginner",
  "estimated_duration_minutes": 45,
  "is_published": false,
  "created_by": "teacher-user-id",
  "created_at": "2025-10-20T12:00:00Z"
}
```

### **Each Section Includes**

```json
{
  "id": "section-unique-id",
  "title": "Introduction",  // ✏️ User editable, defaults to "Section 1"
  "content_type": "text",
  "content_data": {
    "editorjs_data": {  // ⭐ Editor.js WYSIWYG content
      "time": 1234567890,
      "blocks": [
        {
          "type": "header",
          "data": { "text": "My Header", "level": 2 }
        },
        {
          "type": "paragraph",
          "data": { "text": "Paragraph text..." }
        },
        {
          "type": "image",
          "data": {
            "file": {
              "url": "https://supabase.co/storage/image.jpg"
            },
            "caption": "Image caption"
          }
        },
        {
          "type": "embed",  // Videos/Audio
          "data": {
            "service": "youtube",
            "url": "https://youtube.com/watch?v=ABC123",
            "embed": "https://www.youtube.com/embed/ABC123",
            "caption": "Video explanation"
          }
        },
        {
          "type": "table",
          "data": {
            "content": [
              ["Header 1", "Header 2"],
              ["Row 1 Col 1", "Row 1 Col 2"]
            ]
          }
        }
      ],
      "version": "2.28.0"
    }
  },
  "position": 1,
  "is_required": true,
  "time_estimate_minutes": 15,
  "learning_style_tags": ["visual", "reading_writing"],
  "metadata": {}
}
```

---

## 🔧 **Important Implementation Details**

### **1. Editor.js is Now DEFAULT** ✅

```typescript
const [useEditorJS, setUseEditorJS] = useState(true);  // ✅ Changed from false to true
```

All text content now uses the WYSIWYG editor by default!

### **2. Section Titles are Editable** ✏️

```typescript
<Input
  placeholder={`Section ${selectedSectionIndex + 1}`}
  value={sections[selectedSectionIndex].title || ''}
  onChange={e =>
    updateContentSection(selectedSectionIndex, {
      title: e.target.value
    })
  }
/>
<p className="text-xs text-gray-500 mt-1">
  Default: "Section {selectedSectionIndex + 1}" (You can edit this)
</p>
```

**Behavior:**
- Initial value: Empty string
- Placeholder shows: "Section 1", "Section 2", etc.
- Display value: `section.title || `Section ${index + 1}``
- User can type custom title, or leave empty for default

### **3. Data Validation Before Save**

Make sure your save handler validates:

```typescript
const handleSaveModule = async () => {
  // Validate required fields
  if (!formData.title) {
    alert('Module title is required');
    return;
  }

  if (!formData.content_structure?.sections?.length) {
    alert('At least one content section is required');
    return;
  }

  // Validate each section has content
  for (const section of formData.content_structure.sections) {
    if (section.content_type === 'text' && !section.content_data?.editorjs_data?.blocks?.length) {
      alert(`Section "${section.title || 'Untitled'}" is empty. Please add content or remove it.`);
      return;
    }
  }

  // Proceed with save
  const api = new VARKModulesAPI();
  await api.createModule(formData);
};
```

---

## 📋 **Checklist: Is My Data Saving Correctly?**

### **✅ Before Clicking "Review & Save"**

- [ ] Module title is filled
- [ ] At least one section exists
- [ ] Each section has a title (or will use default)
- [ ] Editor.js content has at least one block
- [ ] Images are uploaded to Supabase Storage
- [ ] Video/Audio URLs are from YouTube/SoundCloud

### **✅ During Save**

- [ ] Check browser console for errors
- [ ] Look for: `✅ Module saved with ID: uuid`
- [ ] If error, check: `❌ Failed to create VARK module: [error]`

### **✅ After Save**

- [ ] Module appears in modules list
- [ ] Can view module details
- [ ] Content renders correctly
- [ ] Images display properly
- [ ] Videos play in embed

---

## 🐛 **Troubleshooting**

### **Issue: "Failed to create VARK module: null value in column 'category_id'"**

**Solution:**
```typescript
// Make sure category_id has a default
const moduleData = {
  ...formData,
  category_id: formData.category_id || 'general-education'
};
```

### **Issue: "Section content is empty"**

**Check:**
```typescript
console.log('Section data:', section.content_data?.editorjs_data);
```

Should show:
```json
{
  "blocks": [
    { "type": "paragraph", "data": { "text": "..." } }
  ]
}
```

### **Issue: "Images not displaying after save"**

**Check:**
1. Images uploaded to Supabase Storage?
2. URLs are public?
3. Image URLs in `editorjs_data` are correct?

### **Issue: "Videos not embedding"**

**Check:**
1. Using supported platforms? (YouTube, Vimeo, SoundCloud)
2. URLs are clean? (No `?list=` parameters)
3. Videos are public/unlisted?

---

## 🎓 **Summary**

### **Data Flow:**

```
User Types in Editor.js
    ↓
onChange handler updates component state
    ↓
State accumulates in formData.content_structure.sections
    ↓
User clicks "Review & Save Module"
    ↓
handleSaveModule validates and prepares data
    ↓
VARKModulesAPI.createModule() called
    ↓
Supabase INSERT into vark_modules table
    ↓
Entire content_structure saved as JSONB
    ↓
Module ID returned
    ↓
✅ Success! Redirect to modules list
```

### **Key Points:**

1. ✅ **Editor.js is default** - All text content uses WYSIWYG
2. ✏️ **Section titles editable** - Default to "Section X", user can change
3. 📦 **Everything in one table** - `content_structure` JSONB holds all sections
4. 💾 **Single API call** - All sections saved together
5. 🔄 **Automatic JSON** - Editor.js output saved directly
6. 🖼️ **Images in Storage** - Upload to Supabase, store URLs
7. 🎥 **Videos are embeds** - Use YouTube/SoundCloud, store URLs

---

**Last Updated:** October 20, 2025  
**Status:** Editor.js is now DEFAULT ✅  
**Section Titles:** Editable with smart defaults ✏️
