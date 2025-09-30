# VARK Modules Database Migration

This directory contains scripts to migrate your existing database to support the VARK modules functionality.

## 🚨 Problem

The error you encountered:
```
Could not find the 'module_metadata' column of 'vark_modules' in the schema cache
```

This happens because the database schema is missing several columns that the TypeScript types expect.

## 🔧 Solution

We've created migration scripts to add the missing columns to your existing database.

## 📁 Files

1. **`migration-add-vark-module-columns.sql`** - SQL migration script
2. **`run-vark-migration.js`** - Node.js script to run the migration
3. **`vark-modules-schema.sql`** - Complete schema (updated with missing columns)
4. **`check-and-populate-categories.sql`** - SQL script to populate VARK module categories
5. **`populate-categories.js`** - Node.js script to populate categories
6. **`complete-vark-migration.sql`** - Comprehensive migration script

## 🚀 Quick Fix Options

### Option 1: Run the Node.js Migration Script (Recommended)

```bash
cd client/scripts
npm install @supabase/supabase-js dotenv
node run-vark-migration.js
```

**Prerequisites:**
- Make sure you have a `.env.local` file in the `client` directory
- Include your Supabase service role key: `SUPABASE_SERVICE_ROLE_KEY=your_key_here`

### Option 2: Populate Categories First (If getCategories() returns empty)

If your `getCategories()` function is returning empty data, run this first:

```bash
cd client/scripts
npm install @supabase/supabase-js dotenv
node populate-categories.js
```

### Option 3: Manual SQL Execution

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `check-and-populate-categories.sql`
4. Execute the SQL

### Option 4: Run the Complete Migration

If you want to do everything at once:
1. Go to Supabase SQL Editor
2. Copy and paste the contents of `complete-vark-migration.sql`
3. Execute the SQL

### Option 5: Run the Complete Schema

If the tables don't exist yet:
1. Go to Supabase SQL Editor
2. Copy and paste the contents of `vark-modules-schema.sql`
3. Execute the SQL

## 📋 What the Migration Adds

### To `vark_modules` table:
- `module_metadata JSONB` - Additional metadata like content standards, competencies, etc.

### To `vark_module_sections` table:
- `learning_style_tags JSONB` - Array of learning style tags
- `interactive_elements JSONB` - Array of interactive element types  
- `metadata JSONB` - Additional section metadata

### Custom Types:
- `progress_status` enum
- `learning_style` enum

### VARK Module Categories:
- Biology & Life Sciences
- Mathematics (Visual, Auditory, Reading/Writing, Kinesthetic)
- Science (Visual, Auditory, Reading/Writing, Kinesthetic)

## ✅ Verification

After running the migration, you can verify it worked by:

1. **Check columns exist:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vark_modules' 
  AND column_name = 'module_metadata';
```

2. **Check categories exist:**
```sql
SELECT COUNT(*) FROM public.vark_module_categories;
```

3. **Try creating a VARK module again** - the error should be gone

## 🆘 Troubleshooting

### If getCategories() returns empty:

1. **Check if categories table exists:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'vark_module_categories';
```

2. **Check if categories table has data:**
```sql
SELECT COUNT(*) FROM public.vark_module_categories;
```

3. **Run the categories population script:**
```bash
node populate-categories.js
```

### If the migration script fails:

1. **Check environment variables** - make sure `SUPABASE_SERVICE_ROLE_KEY` is set
2. **Check permissions** - the service role key needs database access
3. **Manual execution** - run the SQL manually in Supabase SQL Editor

### If you still get errors:

1. **Check table existence:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'vark_%';
```

2. **Check column existence:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vark_modules';
```

## 🔄 After Migration

Once the migration is complete:

1. ✅ Try creating a VARK module again
2. ✅ The "Save VARK Module" button should work
3. ✅ Your module will be saved to the database
4. ✅ You can view/edit/delete it from the teacher dashboard
5. ✅ `getCategories()` should return populated data

## 📞 Need Help?

If you encounter issues:

1. Check the console for detailed error messages
2. Verify your Supabase credentials
3. Try running the SQL manually in Supabase SQL Editor
4. Check that all required columns exist in your database
5. Ensure the categories table is populated

---

**Note:** The migration is designed to be safe and won't overwrite existing data. It only adds missing columns with appropriate default values.
