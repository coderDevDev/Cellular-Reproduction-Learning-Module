# 📦 JSON Export/Import Feature Guide

## ✅ What I've Created

A complete JSON export/import system that lets you:
1. **Export module data to JSON** (save your work)
2. **Import JSON to populate form** (resume work later)
3. **Download sample template** (see correct format)

---

## 🎯 **How to Add to Your Module Builder**

### **Step 1: Add Import Statement**

In your module builder page (e.g., `app/teacher/vark-modules/create/page.tsx`):

```typescript
import JSONExportImport from '@/components/vark-modules/json-export-import';
```

### **Step 2: Add Component to UI**

Add it after your step navigation or at the top of the form:

```tsx
export default function CreateModulePage() {
  const [formData, setFormData] = useState<Partial<VARKModule>>({
    // ... initial state
  });

  const handleImport = (importedData: Partial<VARKModule>) => {
    setFormData(importedData);
    toast.success('Module data imported successfully!');
  };

  return (
    <div className="container mx-auto p-6">
      {/* Add JSON Export/Import at the top */}
      <JSONExportImport 
        formData={formData}
        onImport={handleImport}
      />

      {/* Rest of your form */}
      <YourStepperOrFormHere />
    </div>
  );
}
```

---

## 🎨 **Integration Examples**

### **Example 1: Add to Stepper Navigation**

```tsx
// In your VARK Module Builder component
<div className="space-y-6">
  {/* Step Navigation */}
  <div className="flex items-center justify-between">
    <StepNav currentStep={currentStep} />
    
    {/* Add Export/Import in top right */}
    <div className="flex items-center space-x-2">
      <JSONExportImport 
        formData={formData}
        onImport={handleImport}
      />
    </div>
  </div>

  {/* Current Step Content */}
  <div>
    {currentStep === 1 && <BasicInfoStep />}
    {currentStep === 2 && <ContentStructureStep />}
    {/* ... */}
  </div>
</div>
```

### **Example 2: Add as Collapsible Section**

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

<Collapsible>
  <CollapsibleTrigger className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900">
    <FileJson className="w-4 h-4" />
    <span>Import/Export Module Data</span>
  </CollapsibleTrigger>
  <CollapsibleContent className="pt-4">
    <JSONExportImport 
      formData={formData}
      onImport={handleImport}
    />
  </CollapsibleContent>
</Collapsible>
```

### **Example 3: Add to Review Step**

```tsx
// In your final review/save step
<div className="space-y-6">
  <h2>Review & Save</h2>
  
  {/* Show module summary */}
  <ModuleSummary data={formData} />
  
  {/* Export/Import option */}
  <JSONExportImport 
    formData={formData}
    onImport={handleImport}
  />
  
  {/* Save to Database button */}
  <Button onClick={handleSaveToDatabase}>
    Save to Database
  </Button>
</div>
```

---

## 🔄 **User Workflow**

### **Scenario 1: Save Work in Progress**

```
User fills out form →
User clicks "Export to JSON" →
File downloads: "cell-division-module.json" →
User closes browser ✓
```

**Later...**

```
User opens form →
User clicks "Import from JSON" →
Selects "cell-division-module.json" →
Form populates with previous data ✓
User continues editing →
User clicks "Save to Database" when done
```

### **Scenario 2: Template-Based Creation**

```
User clicks "Download Template" →
Template downloads: "vark-module-template.json" →
User edits JSON in text editor (optional) →
User clicks "Import from JSON" →
Form populates with template data →
User makes changes →
User saves to database
```

---

## 📊 **What Gets Saved in JSON**

### **Complete Module Structure:**

```json
{
  "title": "Cell Division",
  "description": "Learn about mitosis and meiosis",
  "learning_objectives": [
    "Understand cell division",
    "Identify phases of mitosis"
  ],
  "content_structure": {
    "sections": [
      {
        "id": "section-1",
        "title": "Introduction",
        "content_type": "text",
        "content_data": {
          "editorjs_data": {
            "time": 1697812345678,
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
                  "text": "Cell division is..."
                }
              },
              {
                "type": "image",
                "data": {
                  "file": {
                    "url": "https://supabase.co/.../image.jpg"
                  },
                  "caption": "Cell division stages"
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
        "interactive_elements": [],
        "metadata": {}
      }
    ],
    "learning_path": [],
    "prerequisites_checklist": [],
    "completion_criteria": []
  },
  "difficulty_level": "beginner",
  "estimated_duration_minutes": 45,
  "prerequisites": [],
  "multimedia_content": {
    "videos": ["https://youtube.com/..."],
    "images": ["https://..."],
    "diagrams": [],
    "podcasts": [],
    "audio_lessons": []
  },
  "interactive_elements": {
    "drag_and_drop": false,
    "visual_builder": false,
    "simulation": false
  },
  "assessment_questions": [
    {
      "id": "q1",
      "type": "single_choice",
      "question": "What is mitosis?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "points": 10
    }
  ],
  "module_metadata": {
    "content_standards": [],
    "learning_competencies": [],
    "key_concepts": ["Cell division", "Mitosis"],
    "vocabulary": ["Chromosome", "Nucleus"],
    "real_world_applications": []
  },
  "is_published": false
}
```

---

## 🎯 **Key Features**

### **1. Smart Export**
```typescript
// Automatically generates filename from module title
const filename = formData.title
  ? `${formData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`
  : `vark-module-${Date.now()}.json`;

// Example outputs:
// "cell-division.json"
// "introduction-to-algebra.json"
// "vark-module-1697812345678.json" (if no title)
```

### **2. Data Validation**
```typescript
// Validates imported JSON before applying
const validation = validateModuleData(data);

if (!validation.valid) {
  // Shows error: "Missing title", "Invalid sections", etc.
  return;
}

// Only valid data gets imported
```

### **3. Status Feedback**
```typescript
// Success message
"✅ Module imported successfully! Title: 'Cell Division', Sections: 3"

// Error message
"❌ Invalid module data: Missing title, content_structure.sections must be an array"
```

---

## 🛠️ **Complete Implementation Example**

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VARKModule } from '@/types/vark-module';
import { VARKModulesAPI } from '@/lib/api/vark-modules';
import JSONExportImport from '@/components/vark-modules/json-export-import';
import BasicInfoStep from '@/components/vark-modules/steps/basic-info-step';
import ContentStructureStep from '@/components/vark-modules/steps/content-structure-step';
import toast from 'react-hot-toast';

export default function CreateVARKModulePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<VARKModule>>({
    title: '',
    description: '',
    learning_objectives: [],
    content_structure: {
      sections: [],
      learning_path: [],
      prerequisites_checklist: [],
      completion_criteria: []
    },
    difficulty_level: 'beginner',
    estimated_duration_minutes: 0,
    prerequisites: [],
    multimedia_content: {},
    interactive_elements: {},
    assessment_questions: [],
    module_metadata: {},
    is_published: false
  });

  // Handle import from JSON
  const handleImport = (importedData: Partial<VARKModule>) => {
    setFormData(importedData);
    toast.success(`✅ Module imported: "${importedData.title}"`);
    
    // Optionally reset to first step
    setCurrentStep(1);
  };

  // Handle save to database
  const handleSaveToDatabase = async () => {
    try {
      const api = new VARKModulesAPI();
      const result = await api.createModule({
        ...formData,
        category_id: formData.category_id || 'general-education',
        created_by: currentUserId
      } as any);

      toast.success('✅ Module saved to database!');
      router.push('/teacher/vark-modules');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('❌ Failed to save module');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create VARK Module</h1>
        
        {/* Step Indicator */}
        <div className="text-sm text-gray-500">
          Step {currentStep} of 5
        </div>
      </div>

      {/* JSON Export/Import */}
      <JSONExportImport 
        formData={formData}
        onImport={handleImport}
      />

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {currentStep === 1 && (
          <BasicInfoStep
            formData={formData}
            updateFormData={setFormData}
          />
        )}
        
        {currentStep === 2 && (
          <ContentStructureStep
            formData={formData}
            updateFormData={setFormData}
            addContentSection={() => {/* ... */}}
            updateContentSection={() => {/* ... */}}
            removeContentSection={() => {/* ... */}}
          />
        )}

        {/* ... more steps */}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}>
          Previous
        </Button>

        <div className="flex items-center space-x-2">
          {currentStep < 5 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}>
              Next
            </Button>
          ) : (
            <>
              {/* Save to Database button on last step */}
              <Button
                onClick={handleSaveToDatabase}
                className="bg-green-600 hover:bg-green-700">
                💾 Save to Database
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 **UI Preview**

When you add the component, it looks like this:

```
┌─────────────────────────────────────────────────┐
│ 📄 JSON Export/Import                           │
│ Save your work as JSON or load a previously     │
│ saved module                                     │
├─────────────────────────────────────────────────┤
│                                                  │
│ [Download]  [Upload]  [FileJson]                │
│ Export to   Import    Download                  │
│ JSON        from JSON Template                  │
│                                                  │
│ ─────────────────────────────────────────────── │
│ 💡 Export: Save your current work as JSON       │
│ 💡 Import: Load a previously saved JSON file    │
│ 💡 Template: Download a sample JSON structure   │
│                                                  │
│ Current Module Info:                            │
│ 📝 Title: Cell Division                         │
│ 📋 Sections: 3                                  │
│ 🎯 Objectives: 5                                │
│ ❓ Questions: 10                                │
└─────────────────────────────────────────────────┘
```

---

## ✅ **Benefits**

### **1. No Data Loss**
- Export at any time
- Resume work later
- Backup before major changes

### **2. Collaboration**
- Share JSON files with colleagues
- Review offline
- Merge changes

### **3. Version Control**
- Save multiple versions
- Compare changes
- Rollback if needed

### **4. Quick Start**
- Use templates
- Duplicate existing modules
- Faster content creation

---

## 🐛 **Error Handling**

### **Invalid JSON File**
```
❌ Invalid module data: Missing title, content_structure.sections must be an array
```

### **Missing Required Fields**
```
❌ Invalid module data: Missing or invalid content_structure
```

### **Import Success**
```
✅ Module imported successfully! Title: "Cell Division", Sections: 3
```

### **Export Success**
```
✅ Module exported successfully! Check your downloads folder.
```

---

## 📋 **Summary**

### **Files Created:**
1. `lib/utils/module-json-handler.ts` - Export/import logic
2. `components/vark-modules/json-export-import.tsx` - UI component
3. `docs/JSON_EXPORT_IMPORT_GUIDE.md` - This guide

### **How to Use:**
1. Import `JSONExportImport` component
2. Pass `formData` and `onImport` handler
3. Users can now export/import JSON files

### **Workflow:**
```
Fill Form → Export JSON → Close Browser
           ↓
Later: Import JSON → Form Populates → Continue Editing → Save to DB
```

### **Result:**
- ✅ Work never lost
- ✅ Easy to backup
- ✅ Shareable modules
- ✅ Template-based creation

---

**Status:** ✅ Feature complete and ready to use!  
**Integration:** Just add the component to your page  
**No database changes needed:** Uses existing structure
