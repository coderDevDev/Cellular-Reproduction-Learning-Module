# VARK Module Import/Export Analysis

## Current State

### ✅ What Exists

**1. JSON Backup System (Auto-Upload)**
Located in: `client/lib/api/vark-modules.ts`

```typescript
async uploadModuleBackup(moduleData: any, moduleId: string): Promise<string | null>
```

**Functionality:**
- Automatically creates JSON backup when module is created/updated
- Uploads JSON file to Supabase Storage (`module-backups` bucket)
- Stores backup URL in `json_backup_url` field
- Filename format: `module-backup-{moduleId}-{timestamp}.json`

**Trigger:** Automatic on `createModule()` and `updateModule()`

**Example:**
```typescript
// In createModule():
const backupUrl = await this.uploadModuleBackup(data, data.id);
await this.supabase
  .from('vark_modules')
  .update({ json_backup_url: backupUrl })
  .eq('id', data.id);
```

### ❌ What's Missing

**1. Export to JSON (Download to Computer)**
- No UI button to export/download module as JSON
- No function to trigger download to user's filesystem
- Teachers can't share modules offline

**2. Import from JSON (Upload & Restore)**
- No UI to upload JSON file
- No function to parse and restore module from JSON
- Teachers can't import pre-made modules
- Can't restore from backups manually

**3. Bulk Operations**
- No bulk export (download multiple modules at once)
- No bulk import (upload multiple module files)

## Module Data Structure

### Complete Module Schema

```typescript
interface VARKModule {
  // Identifiers
  id: string;
  
  // Basic Info
  title: string;
  description: string;
  category_id: string;
  
  // Targeting
  target_learning_styles: ('visual' | 'auditory' | 'reading_writing' | 'kinesthetic')[];
  target_class_id?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  
  // Content Structure
  content_structure: {
    sections: VARKModuleContentSection[];
    total_sections: number;
    estimated_duration: number;
  };
  
  // Metadata
  estimated_duration: number;
  learning_objectives: string[];
  prerequisites: string[];
  tags: string[];
  
  // Status
  status: 'draft' | 'published' | 'archived';
  is_active: boolean;
  
  // Tracking
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Backup
  json_backup_url?: string;
  
  // Computed fields
  teacher_name?: string;
}
```

### Content Section Structure

```typescript
interface VARKModuleContentSection {
  id: string;
  section_number: number;
  title: string;
  content_type: 'text' | 'activity' | 'assessment';
  content_data: {
    text?: string;  // HTML content
    activity?: {
      instructions: string;
      type: string;
      materials?: string[];
    };
    assessment?: {
      questions: any[];
      passing_score?: number;
    };
  };
  learning_style_focus?: ('visual' | 'auditory' | 'reading_writing' | 'kinesthetic')[];
  estimated_time: number;
}
```

## Proposed Implementation

### 1. Export to JSON (Download)

**Location:** Add to `client/app/teacher/vark-modules/page.tsx`

**Features:**
- Single module export
- Bulk export (selected modules)
- Export with images (embedded base64) or without
- Export metadata only vs full content

**UI Changes:**
```tsx
// In module card actions
<Button onClick={() => handleExportModule(module.id)}>
  <Download className="w-4 h-4 mr-2" />
  Export JSON
</Button>

// In bulk actions toolbar
<Button onClick={handleBulkExport}>
  <FileDown className="w-4 h-4 mr-2" />
  Export Selected ({selectedModules.length})
</Button>
```

**Implementation:**
```typescript
const handleExportModule = async (moduleId: string) => {
  const module = modules.find(m => m.id === moduleId);
  if (!module) return;
  
  // Clean sensitive data
  const exportData = {
    ...module,
    // Remove IDs for fresh import
    id: undefined,
    created_by: undefined,
    created_at: undefined,
    updated_at: undefined,
    json_backup_url: undefined
  };
  
  // Create JSON blob
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${module.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  toast.success(`Module "${module.title}" exported successfully!`);
};
```

### 2. Import from JSON (Upload)

**Location:** Add to `client/app/teacher/vark-modules/page.tsx`

**Features:**
- Single file upload
- Validation (schema check)
- Duplicate detection
- Preview before import
- Option to import as draft

**UI Changes:**
```tsx
// Add to page header
<Button onClick={() => setShowImportModal(true)}>
  <Upload className="w-4 h-4 mr-2" />
  Import Module
</Button>

// Import Modal
<Dialog open={showImportModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Import Module from JSON</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <Input
        type="file"
        accept=".json"
        onChange={handleFileSelect}
      />
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle>{previewData.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{previewData.description}</p>
            <Badge>{previewData.difficulty_level}</Badge>
          </CardContent>
        </Card>
      )}
      <Button onClick={handleImportConfirm}>
        Import Module
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

**Implementation:**
```typescript
const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Validate structure
    if (!data.title || !data.content_structure) {
      throw new Error('Invalid module structure');
    }
    
    setPreviewData(data);
    toast.success('File loaded successfully!');
  } catch (error) {
    toast.error('Invalid JSON file');
  }
};

const handleImportConfirm = async () => {
  if (!previewData) return;
  
  try {
    // Prepare data for import
    const moduleData = {
      ...previewData,
      created_by: user!.id,
      status: 'draft', // Import as draft by default
    };
    
    // Create module using existing API
    const newModule = await VARKModulesAPI.createModule(moduleData);
    
    setModules(prev => [newModule, ...prev]);
    toast.success(`Module "${newModule.title}" imported successfully!`);
    setShowImportModal(false);
  } catch (error) {
    toast.error('Failed to import module');
  }
};
```

### 3. Bulk Export

**Implementation:**
```typescript
const handleBulkExport = () => {
  if (selectedModules.length === 0) {
    toast.error('No modules selected');
    return;
  }
  
  const exportModules = modules
    .filter(m => selectedModules.includes(m.id))
    .map(module => ({
      ...module,
      id: undefined,
      created_by: undefined,
      created_at: undefined,
      updated_at: undefined,
      json_backup_url: undefined
    }));
  
  const jsonString = JSON.stringify(exportModules, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vark-modules-export-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  toast.success(`${selectedModules.length} modules exported!`);
  setSelectedModules([]);
};
```

## File Formats

### Export Format (Single Module)

**Filename:** `{module-title}.json`

```json
{
  "title": "Cell Division and Mitosis",
  "description": "Comprehensive module on cellular reproduction",
  "category_id": "biology",
  "target_learning_styles": ["visual", "reading_writing"],
  "difficulty_level": "intermediate",
  "content_structure": {
    "sections": [
      {
        "id": "section-1",
        "section_number": 1,
        "title": "Introduction to Cell Division",
        "content_type": "text",
        "content_data": {
          "text": "<h2>What is Cell Division?</h2>..."
        },
        "estimated_time": 15
      }
    ],
    "total_sections": 5,
    "estimated_duration": 60
  },
  "learning_objectives": [
    "Understand the phases of mitosis",
    "Identify chromosomes and their behavior"
  ],
  "prerequisites": ["Basic cell structure"],
  "tags": ["biology", "cells", "mitosis"],
  "status": "published",
  "is_active": true
}
```

### Export Format (Bulk/Multiple Modules)

**Filename:** `vark-modules-export-{timestamp}.json`

```json
[
  {
    "title": "Module 1",
    ...
  },
  {
    "title": "Module 2",
    ...
  }
]
```

## Security & Validation

### Export Safeguards

1. **Remove Sensitive Data**
   - Remove `created_by` (teacher ID)
   - Remove `id` (for fresh import)
   - Remove `created_at`, `updated_at`
   - Keep `teacher_name` as metadata only

2. **Image Handling**
   - Option 1: Keep URLs (requires internet)
   - Option 2: Convert to base64 (larger file)
   - Default: Keep URLs

### Import Validation

1. **Schema Validation**
   ```typescript
   const validateModuleStructure = (data: any): boolean => {
     return !!(
       data.title &&
       data.content_structure &&
       data.content_structure.sections &&
       Array.isArray(data.content_structure.sections)
     );
   };
   ```

2. **Sanitization**
   - Strip harmful HTML from text content
   - Validate section structure
   - Ensure valid enums (status, difficulty, etc.)

3. **Duplicate Detection**
   - Check for existing modules with same title
   - Prompt user: "Module exists. Import as new copy?"

## UI Mockup

### Module Card with Export Button

```
┌─────────────────────────────────────┐
│ 📚 Cell Division and Mitosis       │
│ Beginner • Biology • 45 min        │
│                                     │
│ Visual, Reading/Writing            │
│                                     │
│ [👁️ View] [✏️ Edit] [🗑️ Delete]   │
│ [⬇️ Export JSON]                    │
└─────────────────────────────────────┘
```

### Bulk Actions Toolbar

```
┌─────────────────────────────────────────┐
│ 5 modules selected                      │
│ [⬇️ Export Selected] [🗑️ Delete] [✖ Clear] │
└─────────────────────────────────────────┘
```

### Import Modal

```
┌────────────────────────────────────┐
│ Import Module from JSON            │
├────────────────────────────────────┤
│                                    │
│ [📁 Choose File...] module.json    │
│                                    │
│ Preview:                           │
│ ┌────────────────────────────────┐ │
│ │ ✅ Cell Division and Mitosis   │ │
│ │ Beginner • 45 min              │ │
│ │ 5 sections                     │ │
│ └────────────────────────────────┘ │
│                                    │
│ [ ] Import as Draft                │
│                                    │
│ [Cancel] [Import Module]           │
└────────────────────────────────────┘
```

## Benefits

### For Teachers

✅ **Sharing:** Export modules to share with colleagues  
✅ **Backup:** Manual backup beyond auto-backup  
✅ **Templating:** Create template modules for reuse  
✅ **Migration:** Move modules between systems  
✅ **Offline Access:** Have JSON copies offline  

### For Students

✅ **Consistency:** Teachers can share best modules  
✅ **Quality:** Import proven, well-designed modules  

### For System

✅ **Data Portability:** Not locked into database  
✅ **Disaster Recovery:** Easy to restore from JSON  
✅ **Version Control:** Can track JSON in git  
✅ **Testing:** Easy to create test data  

## Next Steps

1. ✅ Review current JSON backup system
2. ⚠️ Add Export to JSON button (single module)
3. ⚠️ Add Import from JSON modal
4. ⚠️ Add bulk export functionality
5. ⚠️ Add validation & error handling
6. ⚠️ Test with sample modules
7. ⚠️ Add user documentation

## Sample Data

See existing sample modules:
- `client/data/sample-cell-division-module.ts`
- `client/data/module1-cell-division-reading-writing.ts`

These can be exported to JSON format for import testing.
