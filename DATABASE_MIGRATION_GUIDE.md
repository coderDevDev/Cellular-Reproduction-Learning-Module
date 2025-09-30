# Database Migration Guide

This guide helps you set up the database schema for the Cellular Reproduction Learning Module.

## Quick Setup

### Option 1: Manual Migration (Recommended)

1. **Open Supabase Dashboard**

   - Go to your Supabase project dashboard
   - Navigate to the "SQL Editor" section

2. **Run the Migration Script**

   - Copy the contents of `scripts/manual-migration.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

3. **Verify the Migration**
   - The script will show "Migration completed successfully!" if everything works
   - Check the "Table Editor" to see the new columns and beneficiaries table

### Option 2: Automated Script (If RPC is enabled)

Run the migration script from your terminal:

```bash
node scripts/run-migration-simple.js
```

## What the Migration Does

### 1. Adds New Columns to `senior_citizens` Table

- `profile_picture` (TEXT) - Stores base64 encoded profile photos
- `housing_condition` (ENUM) - owned, rented, with_family, institution, other
- `physical_health_condition` (ENUM) - excellent, good, fair, poor, critical
- `monthly_income` (DECIMAL) - Monthly income amount
- `monthly_pension` (DECIMAL) - Monthly pension amount
- `living_condition` (ENUM) - independent, with_family, with_caregiver, institution, other

### 2. Creates `beneficiaries` Table

Stores information about family members and dependents of senior citizens:

- `id` (UUID) - Primary key
- `senior_citizen_id` (UUID) - Foreign key to senior_citizens
- `name` (TEXT) - Beneficiary's full name
- `relationship` (TEXT) - Relationship to senior citizen
- `date_of_birth` (DATE) - Beneficiary's birth date
- `gender` (TEXT) - male, female, or other
- `address` (TEXT) - Beneficiary's address
- `contact_phone` (TEXT) - Contact phone number
- `occupation` (TEXT) - Beneficiary's occupation
- `monthly_income` (DECIMAL) - Beneficiary's monthly income
- `is_dependent` (BOOLEAN) - Whether they depend on the senior citizen
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Last update time

### 3. Sets Up Row Level Security (RLS)

- OSCA users can manage all beneficiaries
- BASCA users can manage beneficiaries in their barangay
- Senior citizens can view their own beneficiaries
- Service role has full access for API operations

## Verification

After running the migration, you should have:

✅ **New columns in senior_citizens table**

- Check in Supabase Table Editor → senior_citizens → should see new columns

✅ **beneficiaries table created**

- Check in Supabase Table Editor → should see beneficiaries table

✅ **RLS policies in place**

- Check in Supabase Authentication → Policies → should see beneficiaries policies

## Testing the Database

You can test the database setup by:

1. **Running the schema test:**

   ```bash
   node scripts/test-database-schema.js
   ```

2. **Using the application:**
   - Start the development server: `npm run dev`
   - Navigate to the senior citizens section
   - Try adding a new senior citizen with photos and beneficiaries

## Troubleshooting

### Migration Already Applied

If you see messages like "column already exists" or "table already exists", that's normal! The migration script is designed to be safe to run multiple times.

### Permission Errors

Make sure your Supabase service role key is correctly set in `.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### RLS Issues

If you encounter permission errors when saving data, check that:

1. RLS policies are created correctly
2. Your user has the right role (osca, basca, or senior)
3. The service role key has the necessary permissions

## Database Schema Summary

The complete schema now supports:

- **User management** with role-based access (osca, basca, senior)
- **Senior citizen profiles** with comprehensive information
- **Photo storage** for profile pictures and ID documents
- **Beneficiary tracking** with family member details
- **Medical information** and living conditions
- **Address hierarchy** using Philippine address system
- **Audit trails** with created/updated timestamps

## Next Steps

After successful migration:

1. Test the form submission in the application
2. Verify data is being saved correctly
3. Test photo uploads and beneficiary management
4. Check RLS policies by testing with different user roles

For any issues, check the console logs in both the browser and server for detailed error messages.
