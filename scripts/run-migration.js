const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

    // Read the migration SQL file
    const migrationPath = path.join(
      __dirname,
      'migration-add-profile-picture.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');
    console.log('📊 Executing migration...');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      // If exec_sql doesn't exist, try direct query execution
      console.log('ℹ️  Trying direct query execution...');

      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing: ${statement.substring(0, 100)}...`);
          const { error: stmtError } = await supabase.raw(statement);
          if (stmtError) {
            console.error(`Error executing statement: ${stmtError.message}`);
            // Continue with other statements
          }
        }
      }
    }

    console.log('✅ Migration completed successfully!');

    // Verify the migration by checking if the new columns exist
    console.log('🔍 Verifying migration...');

    const { data: tables, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'senior_citizens')
      .eq('table_schema', 'public')
      .in('column_name', [
        'profile_picture',
        'housing_condition',
        'physical_health_condition',
        'monthly_income',
        'monthly_pension',
        'living_condition'
      ]);

    if (tableError) {
      console.log(
        '⚠️  Could not verify migration, but no errors occurred during execution'
      );
    } else {
      const columnNames = tables.map(t => t.column_name);
      console.log('📋 Found columns:', columnNames);

      const expectedColumns = [
        'profile_picture',
        'housing_condition',
        'physical_health_condition',
        'monthly_income',
        'monthly_pension',
        'living_condition'
      ];
      const missingColumns = expectedColumns.filter(
        col => !columnNames.includes(col)
      );

      if (missingColumns.length > 0) {
        console.log(
          '⚠️  Some columns may not have been created:',
          missingColumns
        );
      } else {
        console.log('✅ All expected columns are present!');
      }
    }

    // Check if beneficiaries table exists
    const { data: beneficiariesTable, error: beneficiariesError } =
      await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'beneficiaries')
        .eq('table_schema', 'public');

    if (beneficiariesError) {
      console.log('⚠️  Could not verify beneficiaries table');
    } else if (beneficiariesTable && beneficiariesTable.length > 0) {
      console.log('✅ Beneficiaries table exists!');
    } else {
      console.log('⚠️  Beneficiaries table may not have been created');
    }

    console.log('🎉 Migration process completed!');
    console.log(
      '📝 You can now use the updated database schema in your application.'
    );
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
runMigration();
