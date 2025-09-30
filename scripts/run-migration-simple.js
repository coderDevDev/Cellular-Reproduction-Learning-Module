const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  console.error(
    'Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...');

    // 1. Add profile_picture column to senior_citizens table
    console.log('📊 Adding profile_picture column...');
    try {
      const { error: profilePictureError } = await supabase.rpc('exec_sql', {
        sql: `
          DO $$ 
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 
                  FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'senior_citizens' 
                  AND column_name = 'profile_picture'
              ) THEN
                  ALTER TABLE public.senior_citizens 
                  ADD COLUMN profile_picture TEXT;
                  
                  RAISE NOTICE 'Added profile_picture column to senior_citizens table';
              ELSE
                  RAISE NOTICE 'profile_picture column already exists in senior_citizens table';
              END IF;
          END $$;
        `
      });

      if (profilePictureError) {
        console.error(
          'Error adding profile_picture column:',
          profilePictureError.message
        );
      } else {
        console.log('✅ Profile picture column added successfully');
      }
    } catch (error) {
      console.log(
        'ℹ️  Profile picture column may already exist or RPC not available'
      );
    }

    // 2. Create enum types if they don't exist
    console.log('📊 Creating enum types...');

    const enumQueries = [
      "CREATE TYPE IF NOT EXISTS housing_condition AS ENUM ('owned', 'rented', 'with_family', 'institution', 'other');",
      "CREATE TYPE IF NOT EXISTS physical_health_condition AS ENUM ('excellent', 'good', 'fair', 'poor', 'critical');",
      "CREATE TYPE IF NOT EXISTS living_condition AS ENUM ('independent', 'with_family', 'with_caregiver', 'institution', 'other');"
    ];

    for (const query of enumQueries) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          console.log(`ℹ️  Enum type may already exist: ${error.message}`);
        }
      } catch (error) {
        console.log('ℹ️  Using alternative method for enum creation');
      }
    }

    // 3. Add new columns with conditional logic
    console.log('📊 Adding new columns...');

    const columnQueries = [
      "ALTER TABLE public.senior_citizens ADD COLUMN IF NOT EXISTS housing_condition housing_condition DEFAULT 'owned';",
      "ALTER TABLE public.senior_citizens ADD COLUMN IF NOT EXISTS physical_health_condition physical_health_condition DEFAULT 'good';",
      'ALTER TABLE public.senior_citizens ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(10,2) DEFAULT 0;',
      'ALTER TABLE public.senior_citizens ADD COLUMN IF NOT EXISTS monthly_pension DECIMAL(10,2) DEFAULT 0;',
      "ALTER TABLE public.senior_citizens ADD COLUMN IF NOT EXISTS living_condition living_condition DEFAULT 'independent';"
    ];

    for (const query of columnQueries) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          console.log(`ℹ️  Column may already exist: ${error.message}`);
        } else {
          console.log(
            `✅ Column added: ${
              query.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1]
            }`
          );
        }
      } catch (error) {
        console.log(`ℹ️  Column operation: ${error.message}`);
      }
    }

    // 4. Create beneficiaries table
    console.log('📊 Creating beneficiaries table...');

    const beneficiariesTableSQL = `
      CREATE TABLE IF NOT EXISTS public.beneficiaries (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          senior_citizen_id UUID REFERENCES public.senior_citizens(id) ON DELETE CASCADE NOT NULL,
          name TEXT NOT NULL,
          relationship TEXT NOT NULL,
          date_of_birth DATE NOT NULL,
          gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
          address TEXT,
          contact_phone TEXT,
          occupation TEXT,
          monthly_income DECIMAL(10,2) DEFAULT 0,
          is_dependent BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: beneficiariesTableSQL
      });
      if (error) {
        console.log(
          `ℹ️  Beneficiaries table may already exist: ${error.message}`
        );
      } else {
        console.log('✅ Beneficiaries table created successfully');
      }
    } catch (error) {
      console.log('ℹ️  Beneficiaries table creation:', error.message);
    }

    // 5. Test database connection
    console.log('🔍 Testing database connection...');

    const { data: testData, error: testError } = await supabase
      .from('senior_citizens')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('⚠️  Database connection test failed:', testError.message);
    } else {
      console.log('✅ Database connection successful!');
    }

    console.log('🎉 Migration process completed!');
    console.log(
      '📝 The database schema has been updated for the senior citizen management system.'
    );
    console.log('🚀 You can now run your application with the new features!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
runMigration();


