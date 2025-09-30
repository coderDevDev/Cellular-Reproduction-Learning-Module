# Class Targeting Migration for VARK Modules

This migration adds the missing columns needed for class targeting functionality in VARK modules.

## 🚨 Problem

The database schema is missing these columns:

- `target_class_id` - References the target class for the module
- `target_learning_styles` - Array of learning styles the module targets

This causes the error:

```
Could not find the 'target_learning_styles' column of 'vark_modules' in the schema cache
```

## 🔧 Solution

The migration script adds:

1. `target_class_id` - UUID column that references the `classes` table
2. `target_learning_styles` - JSONB column for storing learning style arrays

## 📁 Files

- `migration-add-class-targeting.sql` - SQL migration script
- `run-class-targeting-migration.js` - Node.js script to run the migration

## 🚀 How to Run

### Option 1: Using Node.js Script (Recommended)

1. **Install dependencies** (if not already installed):

   ```bash
   npm install @supabase/supabase-js dotenv
   ```

2. **Set up environment variables** in your `.env` file:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Run the migration**:
   ```bash
   cd client/scripts
   node run-class-targeting-migration.js
   ```

### Option 2: Manual SQL Execution

1. **Open your Supabase dashboard**
2. **Go to SQL Editor**
3. **Copy and paste** the contents of `migration-add-class-targeting.sql`
4. **Execute** the script

### Option 3: Using Supabase CLI

```bash
supabase db push --file=client/scripts/migration-add-class-targeting.sql
```

## ✅ Verification

After running the migration, verify the columns were added:

```sql
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vark_modules'
AND column_name IN ('target_class_id', 'target_learning_styles');
```

## 🎯 What This Enables

After the migration, you can:

- ✅ Select a target class when creating VARK modules
- ✅ Set learning style targeting for modules
- ✅ See which students can access modules based on class and learning styles
- ✅ Create modules specifically designed for certain classes

## 🔍 Troubleshooting

### If the migration fails:

1. **Check database connection** - Ensure your Supabase credentials are correct
2. **Verify permissions** - The service role key needs sufficient permissions
3. **Manual execution** - Try running the SQL manually in Supabase dashboard

### If columns still don't exist:

1. **Refresh schema cache** - Sometimes Supabase needs a moment to update
2. **Check for errors** - Look for any error messages in the migration output
3. **Verify manually** - Check the database directly in Supabase dashboard

## 📋 Next Steps

After successful migration:

1. Test creating a new VARK module
2. Verify class selection works
3. Check that learning style targeting functions properly
4. Test the student access preview feature

## 🆘 Need Help?

If you encounter issues:

1. Check the migration script output for error messages
2. Verify your database schema in Supabase dashboard
3. Ensure all environment variables are set correctly





