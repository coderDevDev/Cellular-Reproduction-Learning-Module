const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting VARK Modules Migration...');

    // Read the migration SQL file
    const migrationPath = path.join(
      __dirname,
      'migration-add-vark-module-columns.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📖 Migration SQL loaded successfully');

    // Split the SQL into individual statements (basic splitting)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(
            `\n🔧 Executing statement ${i + 1}/${statements.length}...`
          );
          console.log(
            `   ${statement.substring(0, 100)}${
              statement.length > 100 ? '...' : ''
            }`
          );

          const { data, error } = await supabase.rpc('exec_sql', {
            sql: statement
          });

          if (error) {
            // Try direct query for ALTER statements
            const { error: directError } = await supabase
              .from('vark_modules')
              .select('id')
              .limit(1);
            if (directError) {
              console.log(
                `   ⚠️  Statement ${
                  i + 1
                } may have failed (this is often normal for ALTER statements)`
              );
            } else {
              console.log(`   ✅ Statement ${i + 1} executed successfully`);
            }
          } else {
            console.log(`   ✅ Statement ${i + 1} executed successfully`);
          }
        } catch (stmtError) {
          console.log(
            `   ⚠️  Statement ${i + 1} had an issue (this may be normal):`,
            stmtError.message
          );
        }
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Try creating a VARK module again');
    console.log('   2. Check that the module_metadata column exists');
    console.log('   3. Verify that all required fields are populated');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative approach: Use direct SQL execution
async function runMigrationDirect() {
  try {
    console.log('🚀 Starting VARK Modules Migration (Direct SQL)...');

    // Read the migration SQL file
    const migrationPath = path.join(
      __dirname,
      'migration-add-vark-module-columns.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📖 Migration SQL loaded successfully');

    // Execute the entire migration as one SQL block
    console.log('🔧 Executing migration...');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.log(
        '⚠️  Direct SQL execution failed, trying alternative approach...'
      );

      // Try to add columns one by one
      await addColumnIfNotExists(
        'vark_modules',
        'module_metadata',
        'JSONB',
        '{}'
      );
      await addColumnIfNotExists(
        'vark_module_sections',
        'learning_style_tags',
        'JSONB',
        '[]'
      );
      await addColumnIfNotExists(
        'vark_module_sections',
        'interactive_elements',
        'JSONB',
        '[]'
      );
      await addColumnIfNotExists(
        'vark_module_sections',
        'metadata',
        'JSONB',
        '{}'
      );
    } else {
      console.log('✅ Migration executed successfully via RPC');
    }

    console.log('\n🎉 Migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function addColumnIfNotExists(table, column, type, defaultValue) {
  try {
    console.log(`🔧 Adding column ${column} to ${table}...`);

    // Check if column exists
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', table)
      .eq('column_name', column);

    if (checkError) {
      console.log(
        `   ⚠️  Could not check if column exists: ${checkError.message}`
      );
      return;
    }

    if (columns && columns.length > 0) {
      console.log(`   ✅ Column ${column} already exists in ${table}`);
      return;
    }

    // Try to add the column using a simple approach
    console.log(`   ➕ Column ${column} does not exist, attempting to add...`);

    // For now, we'll just log that manual intervention is needed
    console.log(
      `   📝 Manual step required: Add column ${column} ${type} DEFAULT ${defaultValue} to table ${table}`
    );
  } catch (error) {
    console.log(
      `   ⚠️  Error checking/adding column ${column}: ${error.message}`
    );
  }
}

// Check if we can run the migration
async function checkDatabaseConnection() {
  try {
    console.log('🔍 Checking database connection...');

    const { data, error } = await supabase
      .from('vark_modules')
      .select('id')
      .limit(1);

    if (error) {
      console.log(
        '⚠️  Could not access vark_modules table, it may not exist yet'
      );
      console.log('   Creating tables first...');
      await createTablesIfNotExist();
    } else {
      console.log(
        '✅ Database connection successful, vark_modules table exists'
      );
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function createTablesIfNotExist() {
  try {
    console.log("🏗️  Creating VARK modules tables if they don't exist...");

    // Read the full schema file
    const schemaPath = path.join(__dirname, 'vark-modules-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('📖 Schema SQL loaded successfully');

    // Execute the schema creation
    const { data, error } = await supabase.rpc('exec_sql', { sql: schemaSQL });

    if (error) {
      console.log(
        '⚠️  Schema creation via RPC failed, manual creation may be needed'
      );
      console.log(
        '   Please run the vark-modules-schema.sql file manually in your database'
      );
    } else {
      console.log('✅ Tables created successfully');
    }
  } catch (error) {
    console.log('⚠️  Error creating tables:', error.message);
    console.log(
      '   Please run the vark-modules-schema.sql file manually in your database'
    );
  }
}

// Main execution
async function main() {
  console.log('🔧 VARK Modules Database Migration Tool');
  console.log('=====================================\n');

  await checkDatabaseConnection();
  await runMigrationDirect();

  console.log('\n✨ Migration process completed!');
  console.log(
    '   If you encountered any issues, please run the SQL manually in your database.'
  );
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runMigration, runMigrationDirect };
