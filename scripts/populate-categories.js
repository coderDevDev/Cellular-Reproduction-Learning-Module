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

async function populateCategories() {
  try {
    console.log('🚀 Starting VARK Module Categories Population...');

    // Step 1: Check if table exists
    console.log('🔍 Checking if vark_module_categories table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('vark_module_categories')
      .select('id')
      .limit(1);

    if (tableError) {
      console.log('⚠️  Table may not exist, creating it...');
      await createCategoriesTable();
    } else {
      console.log('✅ Table exists');
    }

    // Step 2: Check current count
    const { count, error: countError } = await supabase
      .from('vark_module_categories')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error checking count:', countError);
      return;
    }

    console.log(`📊 Current categories count: ${count}`);

    if (count > 0) {
      console.log('✅ Categories already exist, showing current data...');
      await showCurrentCategories();
      return;
    }

    // Step 3: Insert categories
    console.log('➕ Inserting categories...');
    await insertCategories();

    // Step 4: Verify insertion
    console.log('✅ Categories inserted successfully!');
    await showCurrentCategories();
  } catch (error) {
    console.error('❌ Error populating categories:', error);
    process.exit(1);
  }
}

async function createCategoriesTable() {
  try {
    console.log('🏗️  Creating vark_module_categories table...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.vark_module_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        subject VARCHAR(100) NOT NULL,
        grade_level VARCHAR(100) NOT NULL,
        learning_style VARCHAR(50) NOT NULL,
        icon_name VARCHAR(100),
        color_scheme VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

    if (error) {
      console.log(
        '⚠️  Could not create table via RPC, manual creation may be needed'
      );
      console.log('   Please run the SQL manually in your Supabase SQL Editor');
    } else {
      console.log('✅ Table created successfully');
    }
  } catch (error) {
    console.log('⚠️  Error creating table:', error.message);
    console.log('   Please run the SQL manually in your Supabase SQL Editor');
  }
}

async function insertCategories() {
  try {
    // Insert Biology category
    const biologyCategory = {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Biology & Life Sciences',
      description:
        'Explore the fascinating world of living organisms, from cells to ecosystems',
      subject: 'Biology',
      grade_level: 'High School',
      learning_style: 'visual',
      icon_name: 'microscope',
      color_scheme: 'from-green-500 to-emerald-600',
      is_active: true
    };

    const { error: bioError } = await supabase
      .from('vark_module_categories')
      .upsert(biologyCategory, { onConflict: 'id' });

    if (bioError) {
      console.error('❌ Error inserting Biology category:', bioError);
    } else {
      console.log('✅ Biology category inserted');
    }

    // Insert additional categories
    const additionalCategories = [
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Mathematics - Visual Learning',
        description:
          'Mathematics concepts through visual representations, diagrams, and charts',
        subject: 'Mathematics',
        grade_level: 'High School',
        learning_style: 'visual',
        icon_name: 'calculator',
        color_scheme: 'from-blue-500 to-blue-600',
        is_active: true
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Mathematics - Auditory Learning',
        description:
          'Mathematics learning through audio explanations, discussions, and verbal problem-solving',
        subject: 'Mathematics',
        grade_level: 'High School',
        learning_style: 'auditory',
        icon_name: 'headphones',
        color_scheme: 'from-green-500 to-green-600',
        is_active: true
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Mathematics - Reading/Writing',
        description:
          'Mathematics through text-based explanations, formulas, and written problem-solving',
        subject: 'Mathematics',
        grade_level: 'High School',
        learning_style: 'reading_writing',
        icon_name: 'book',
        color_scheme: 'from-purple-500 to-purple-600',
        is_active: true
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'Mathematics - Kinesthetic',
        description:
          'Mathematics through interactive simulations, manipulatives, and real-world applications',
        subject: 'Mathematics',
        grade_level: 'High School',
        learning_style: 'kinesthetic',
        icon_name: 'zap',
        color_scheme: 'from-orange-500 to-orange-600',
        is_active: true
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        name: 'Science - Visual Discovery',
        description:
          'Scientific concepts through visual models, diagrams, and interactive visualizations',
        subject: 'Science',
        grade_level: 'High School',
        learning_style: 'visual',
        icon_name: 'flask',
        color_scheme: 'from-blue-500 to-blue-600',
        is_active: true
      },
      {
        id: '77777777-7777-7777-7777-777777777777',
        name: 'Science - Auditory Learning',
        description:
          'Science through audio explanations, discussions, and verbal concept exploration',
        subject: 'Science',
        grade_level: 'High School',
        learning_style: 'auditory',
        icon_name: 'headphones',
        color_scheme: 'from-green-500 to-green-600',
        is_active: true
      },
      {
        id: '88888888-8888-8888-8888-888888888888',
        name: 'Science - Reading/Writing',
        description:
          'Science through text-based explanations, research papers, and written analysis',
        subject: 'Science',
        grade_level: 'High School',
        learning_style: 'reading_writing',
        icon_name: 'book-open',
        color_scheme: 'from-purple-500 to-purple-600',
        is_active: true
      },
      {
        id: '99999999-9999-9999-9999-999999999999',
        name: 'Science - Interactive Labs',
        description:
          'Science through hands-on experiments, simulations, and physical activities',
        subject: 'Science',
        grade_level: 'High School',
        learning_style: 'kinesthetic',
        icon_name: 'zap',
        color_scheme: 'from-orange-500 to-orange-600',
        is_active: true
      }
    ];

    const { error: additionalError } = await supabase
      .from('vark_module_categories')
      .upsert(additionalCategories, { onConflict: 'id' });

    if (additionalError) {
      console.error(
        '❌ Error inserting additional categories:',
        additionalError
      );
    } else {
      console.log('✅ Additional categories inserted');
    }
  } catch (error) {
    console.error('❌ Error inserting categories:', error);
  }
}

async function showCurrentCategories() {
  try {
    const { data, error } = await supabase
      .from('vark_module_categories')
      .select('*')
      .order('subject', { ascending: true });

    if (error) {
      console.error('❌ Error fetching categories:', error);
      return;
    }

    console.log('\n📋 Current Categories:');
    console.log('======================');

    data.forEach(category => {
      console.log(
        `• ${category.name} (${category.subject} - ${category.learning_style})`
      );
    });

    console.log(`\nTotal: ${data.length} categories`);

    // Show Biology category specifically
    const biologyCategory = data.find(
      cat => cat.name === 'Biology & Life Sciences'
    );
    if (biologyCategory) {
      console.log('\n🔬 Biology Category ID for sample module:');
      console.log(`   ${biologyCategory.id}`);
    }
  } catch (error) {
    console.error('❌ Error showing categories:', error);
  }
}

// Main execution
async function main() {
  console.log('🔧 VARK Module Categories Population Tool');
  console.log('========================================\n');

  await populateCategories();

  console.log('\n✨ Categories population completed!');
  console.log('   You can now use getCategories() in your API.');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { populateCategories };
