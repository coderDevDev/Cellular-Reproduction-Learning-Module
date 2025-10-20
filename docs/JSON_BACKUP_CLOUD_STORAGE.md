# ☁️ JSON Backup Cloud Storage Setup

## ✅ **SOLUTION: Automatic Cloud Backups**

Instead of 15MB local JSON files, modules are now automatically backed up to **Supabase Storage** when saved!

---

## 🎯 **Problem Solved**

### **Before:**
```
❌ 15MB JSON files downloaded locally
❌ Users might lose local files
❌ No way to re-download module data
❌ Manual backup management
```

### **After:**
```
✅ JSON automatically uploaded to cloud
✅ Stored in Supabase Storage
✅ URL saved in database
✅ Can download anytime
✅ Automatic backup on save/update
```

---

## 📋 **Setup Instructions**

### **Step 1: Create Storage Bucket in Supabase**

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click "Storage" in the left menu

2. **Create New Bucket**
   ```
   Bucket Name: module-backups
   Public: Yes (or use signed URLs)
   File Size Limit: 50MB
   Allowed MIME types: application/json
   ```

3. **Set Storage Policies**
   
   **Allow Upload (Authenticated Users):**
   ```sql
   CREATE POLICY "Allow authenticated uploads"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'module-backups' AND
     auth.uid() = (storage.foldername(name))[1]::uuid
   );
   ```

   **Allow Public Read:**
   ```sql
   CREATE POLICY "Allow public downloads"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'module-backups');
   ```

---

### **Step 2: Add Column to Database**

Run this SQL in Supabase SQL Editor:

```sql
-- Add json_backup_url column to vark_modules table
ALTER TABLE vark_modules 
ADD COLUMN IF NOT EXISTS json_backup_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN vark_modules.json_backup_url IS 
'URL to JSON backup file stored in Supabase Storage';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_vark_modules_backup_url 
ON vark_modules(json_backup_url) 
WHERE json_backup_url IS NOT NULL;
```

---

### **Step 3: Verify Setup**

1. **Test Storage Bucket:**
   ```javascript
   // In browser console (while logged in)
   const { data, error } = await supabase.storage
     .from('module-backups')
     .list();
   
   console.log('Bucket exists:', !error);
   ```

2. **Test Column:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'vark_modules' 
   AND column_name = 'json_backup_url';
   ```

---

## 🔄 **How It Works**

### **When Creating Module:**

```
1. User clicks "Save to Supabase"
   ↓
2. Module inserted into database
   ↓
3. Module ID generated
   ↓
4. JSON backup created from module data
   ↓
5. JSON uploaded to storage:
   → Path: vark-modules/module-backup-{id}-{timestamp}.json
   ↓
6. Public URL generated
   ↓
7. URL saved to database:
   → json_backup_url = "https://...storage.../module-backup-..."
   ↓
8. ✅ Module saved with backup!
```

### **When Updating Module:**

```
1. User edits module, clicks "Save"
   ↓
2. Module updated in database
   ↓
3. New JSON backup created
   ↓
4. New backup uploaded to storage
   ↓
5. New URL saved to database
   ↓
6. ✅ Module updated with new backup!
```

---

## 📂 **Storage Structure**

```
Supabase Storage
└── module-backups/
    └── vark-modules/
        ├── module-backup-550e8400-...-2025-10-20T08-00-00.json
        ├── module-backup-550e8400-...-2025-10-20T09-15-30.json
        ├── module-backup-661f9511-...-2025-10-20T10-30-45.json
        └── ...
```

**Filename Format:**
```
module-backup-{moduleId}-{timestamp}.json

Example:
module-backup-550e8400-e29b-41d4-a716-446655440000-2025-10-20T08-30-45.json
```

---

## 💾 **Database Structure**

```sql
-- vark_modules table (updated)
CREATE TABLE vark_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  -- ... other columns ...
  
  json_backup_url TEXT,  -- ← NEW! URL to cloud backup
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Example Row:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Cell Biology Module",
  "json_backup_url": "https://abc123.supabase.co/storage/v1/object/public/module-backups/vark-modules/module-backup-550e8400-2025-10-20T08-30-45.json",
  "created_at": "2025-10-20T08:30:45.000Z"
}
```

---

## 🔍 **Code Implementation**

### **1. Upload Function (vark-modules.ts)**

```typescript
async uploadModuleBackup(
  moduleData: any,
  moduleId: string
): Promise<string | null> {
  try {
    // Create JSON blob
    const jsonString = JSON.stringify(moduleData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `module-backup-${moduleId}-${timestamp}.json`;
    const filepath = `vark-modules/${filename}`;

    // Upload to storage
    const { data, error } = await this.supabase.storage
      .from('module-backups')
      .upload(filepath, blob, {
        contentType: 'application/json',
        upsert: false
      });

    if (error) return null;

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from('module-backups')
      .getPublicUrl(filepath);

    return urlData.publicUrl;
  } catch (error) {
    return null;
  }
}
```

### **2. Create Module (Updated)**

```typescript
async createModule(moduleData: CreateVARKModuleData): Promise<VARKModule> {
  // Insert module
  const { data, error } = await this.supabase
    .from('vark_modules')
    .insert(cleanModuleData)
    .select()
    .single();

  if (error) throw error;

  // Upload JSON backup
  const backupUrl = await this.uploadModuleBackup(data, data.id);
  
  // Save backup URL
  if (backupUrl) {
    await this.supabase
      .from('vark_modules')
      .update({ json_backup_url: backupUrl })
      .eq('id', data.id);
    
    data.json_backup_url = backupUrl;
  }

  return data;
}
```

### **3. Update Module (Updated)**

```typescript
async updateModule(
  id: string,
  moduleData: UpdateVARKModuleData
): Promise<VARKModule> {
  // Update module
  const { data, error } = await this.supabase
    .from('vark_modules')
    .update(moduleData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Upload new backup
  const backupUrl = await this.uploadModuleBackup(data, data.id);
  
  if (backupUrl) {
    await this.supabase
      .from('vark_modules')
      .update({ json_backup_url: backupUrl })
      .eq('id', id);
    
    data.json_backup_url = backupUrl;
  }

  return data;
}
```

---

## 📥 **Download Backup Feature**

### **Add Download Button in Module List:**

```tsx
// In your module card component
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    if (module.json_backup_url) {
      window.open(module.json_backup_url, '_blank');
    } else {
      toast.error('No backup available for this module');
    }
  }}
>
  <Download className="w-4 h-4 mr-2" />
  Download Backup
</Button>
```

---

## 🎯 **Benefits**

| Feature | Benefit |
|---------|---------|
| **Automatic backup** | No manual exports needed |
| **Cloud storage** | Never lose module data |
| **Version history** | New backup on each update |
| **Easy sharing** | Share URL with colleagues |
| **No local storage** | Saves disk space |
| **Always accessible** | Download from anywhere |

---

## 📊 **Storage Costs**

### **Supabase Free Tier:**
- **Storage:** 1 GB free
- **Bandwidth:** 2 GB/month free

### **Typical Usage:**
```
Average module with images: 5-15 MB
Modules per GB: ~70-200 modules
Updates per module: 5-10 versions

Storage for 100 modules:
- 100 modules × 10 MB = 1 GB
- Still within free tier!
```

### **If You Need More:**
```
Supabase Pro: $25/month
- 100 GB storage
- 200 GB bandwidth
- Enough for thousands of modules!
```

---

## 🧪 **Testing**

### **Test 1: Create Module with Backup**

```
1. Create new module
2. Add content
3. Click "Save to Supabase"
4. Check console:
   ✅ "📤 Uploading JSON backup to storage..."
   ✅ "✅ JSON backup uploaded: https://..."
   ✅ "✅ JSON backup URL saved to module"
5. Check database:
   ✅ json_backup_url column has URL
6. Click URL in browser:
   ✅ JSON file downloads
```

### **Test 2: Update Module**

```
1. Edit existing module
2. Click "Save"
3. Check console:
   ✅ "📤 Uploading JSON backup to storage..."
   ✅ "✅ Updated JSON backup URL"
4. Check storage:
   ✅ New backup file created with new timestamp
```

### **Test 3: Download Backup**

```
1. Go to module list
2. Find module with backup
3. Click "Download Backup"
4. ✅ JSON file downloads from cloud
5. ✅ Can import into builder
```

---

## 🔐 **Security**

### **Storage Policies:**

**Option 1: Public Buckets (Simpler)**
```sql
-- Anyone can read
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'module-backups');

-- Only authenticated users can upload
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'module-backups');
```

**Option 2: Signed URLs (More Secure)**
```typescript
// Generate signed URL (expires in 1 hour)
const { data, error } = await supabase.storage
  .from('module-backups')
  .createSignedUrl(filepath, 3600);

// Use signed URL
const signedUrl = data.signedUrl;
```

---

## 🚨 **Error Handling**

### **If Upload Fails:**

```typescript
// Module still saves to database
// Backup URL is null
// User can manually export JSON
// Backup will be created on next update
```

### **If Storage Full:**

```typescript
// Error logged in console
// Module saves successfully
// Show warning to user
// Admin needs to upgrade storage plan
```

---

## 📱 **User Experience**

### **Create Module:**
```
1. Fill out module form
2. Click "Save to Supabase"
3. Loading indicator appears
4. ✅ "Module saved successfully!"
5. ✅ "Backup stored in cloud"
```

### **Update Module:**
```
1. Edit module
2. Click "Save"
3. ✅ "Module updated!"
4. ✅ "New backup created"
```

### **Download Backup:**
```
1. Go to module list
2. Click "Download Backup"
3. ✅ JSON file downloads
4. Can import later to continue editing
```

---

## ✅ **Summary**

### **What Changed:**

| Before | After |
|--------|-------|
| Manual JSON export | ✅ Automatic cloud backup |
| 15MB local files | ✅ Stored in Supabase |
| Risk of losing files | ✅ Always accessible |
| No re-download option | ✅ Download anytime |

### **Implementation:**

1. ✅ Created `uploadModuleBackup()` function
2. ✅ Updated `createModule()` to upload backup
3. ✅ Updated `updateModule()` to upload backup
4. ✅ Added `json_backup_url` to database

### **Setup Required:**

1. ⚠️ Create `module-backups` storage bucket
2. ⚠️ Add `json_backup_url` column to database
3. ⚠️ Set storage policies

---

## 🎉 **Result**

**Every module is now automatically backed up to the cloud when saved!**

- ✅ No 15MB local files
- ✅ Always accessible from anywhere
- ✅ Can download backup anytime
- ✅ Version history maintained
- ✅ Never lose your work!

**Your modules are now safely stored in the cloud! ☁️🎉**

---

**Last Updated:** October 20, 2025  
**Feature:** Automatic Cloud Backups  
**Storage:** Supabase Storage  
**Status:** ✅ Ready to Deploy (Setup Required)
