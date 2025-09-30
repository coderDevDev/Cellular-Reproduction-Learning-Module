const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting Class Targeting Migration...');

    const migrationPath = path.join(
      __dirname,
      'migration-add-class-targeting.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📖 Migration SQL loaded');

    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.trim().toUpperCase().startsWith('SELECT')) {
        console.log(`⏭️  Skipping SELECT: ${statement.substring(0, 50)}...`);
        continue;
      }

      console.log(`🔧 Executing statement ${i + 1}/${statements.length}...`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          console.error(`❌ Error:`, error);
        } else {
          console.log(`✅ Statement ${i + 1} executed`);
        }
      } catch (execError) {
        console.error(`❌ Execution error:`, execError);
      }
    }

    console.log('\n🎯 Migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');

    const { error } = await supabase.from('vark_modules').select('id').limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

async function main() {
  const isConnected = await testConnection();

  if (!isConnected) {
    console.error('❌ Cannot proceed without database connection');
    process.exit(1);
  }

  await runMigration();
}

main().catch(console.error);
