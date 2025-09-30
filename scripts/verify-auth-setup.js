const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

// Environment configuration
const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcWljeGd0bG1ud2Fsd2ptYW92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDYyOTgwMCwiZXhwIjoyMDcwMjA1ODAwfQ.RPw9Ee0rdHpRYMrzwWDUTqRrQ6KkdWSnr2gFdZ4o4pE'
  }
};

// Validate environment variables
function validateEnvironment() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars);
    console.warn('Please check your .env file');
    return false;
  }

  return true;
}

// Create Supabase client
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

async function verifyDatabaseSetup() {
  console.log('🔍 Verifying database setup...\n');

  try {
    // Test 1: Check if users table exists and has correct structure
    console.log('1. Checking users table structure...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
      return false;
    }
    console.log('✅ Users table accessible');

    // Test 2: Check if senior_citizens table exists
    console.log('\n2. Checking senior_citizens table...');
    const { data: seniorsData, error: seniorsError } = await supabase
      .from('senior_citizens')
      .select('*')
      .limit(1);

    if (seniorsError) {
      console.error('❌ Senior citizens table error:', seniorsError.message);
      return false;
    }
    console.log('✅ Senior citizens table accessible');

    // Test 3: Check if announcements table exists
    console.log('\n3. Checking announcements table...');
    const { data: announcementsData, error: announcementsError } =
      await supabase.from('announcements').select('*').limit(1);

    if (announcementsError) {
      console.error(
        '❌ Announcements table error:',
        announcementsError.message
      );
      return false;
    }
    console.log('✅ Announcements table accessible');

    // Test 4: Check if appointments table exists
    console.log('\n4. Checking appointments table...');
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);

    if (appointmentsError) {
      console.error('❌ Appointments table error:', appointmentsError.message);
      return false;
    }
    console.log('✅ Appointments table accessible');

    // Test 5: Check if document_requests table exists
    console.log('\n5. Checking document_requests table...');
    const { data: docRequestsData, error: docRequestsError } = await supabase
      .from('document_requests')
      .select('*')
      .limit(1);

    if (docRequestsError) {
      console.error(
        '❌ Document requests table error:',
        docRequestsError.message
      );
      return false;
    }
    console.log('✅ Document requests table accessible');

    // Test 6: Check if benefits table exists
    console.log('\n6. Checking benefits table...');
    const { data: benefitsData, error: benefitsError } = await supabase
      .from('benefits')
      .select('*')
      .limit(1);

    if (benefitsError) {
      console.error('❌ Benefits table error:', benefitsError.message);
      return false;
    }
    console.log('✅ Benefits table accessible');

    // Test 7: Check if census_records table exists
    console.log('\n7. Checking census_records table...');
    const { data: censusData, error: censusError } = await supabase
      .from('census_records')
      .select('*')
      .limit(1);

    if (censusError) {
      console.error('❌ Census records table error:', censusError.message);
      return false;
    }
    console.log('✅ Census records table accessible');

    console.log('\n🎉 All database tables are properly set up!');
    return true;
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n🧪 Testing user registration...\n');

  const testUsers = [
    {
      email: `test-osca-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'osca',
      firstName: 'Test',
      lastName: 'OSCA',
      phone: '+639123456789',
      department: 'IT Department',
      position: 'System Administrator',
      employeeId: 'EMP-001'
    },
    {
      email: `test-basca-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'basca',
      firstName: 'Test',
      lastName: 'BASCA',
      phone: '+639123456788',
      barangay: 'Test Barangay',
      barangayCode: 'TB001'
    },
    {
      email: `test-senior-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'senior',
      firstName: 'Test',
      lastName: 'Senior',
      phone: '+639123456787',
      dateOfBirth: '1950-01-01',
      address: '123 Test Street, Test City',
      emergencyContactName: 'Test Contact',
      emergencyContactPhone: '+639123456786',
      emergencyContactRelationship: 'Spouse'
    }
  ];

  for (const user of testUsers) {
    try {
      console.log(`Testing ${user.role} registration...`);

      // Create user in Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            first_name: user.firstName,
            last_name: user.lastName,
            phone: user.phone,
            role: user.role,
            ...(user.role === 'osca' && {
              department: user.department,
              position: user.position,
              employee_id: user.employeeId
            }),
            ...(user.role === 'basca' && {
              barangay: user.barangay,
              barangay_code: user.barangayCode
            }),
            ...(user.role === 'senior' && {
              date_of_birth: user.dateOfBirth,
              address: user.address,
              emergency_contact_name: user.emergencyContactName,
              emergency_contact_phone: user.emergencyContactPhone,
              emergency_contact_relationship: user.emergencyContactRelationship
            })
          }
        });

      if (authError) {
        console.error(
          `❌ ${user.role} registration failed:`,
          authError.message
        );
        continue;
      }

      console.log(`✅ ${user.role} user created successfully`);

      // Verify user record was created in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error(
          `❌ ${user.role} user record not found:`,
          userError.message
        );
      } else {
        console.log(`✅ ${user.role} user record created in database`);
      }

      // For senior users, check if senior_citizens record was created
      if (user.role === 'senior') {
        const { data: seniorData, error: seniorError } = await supabase
          .from('senior_citizens')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (seniorError) {
          console.error(
            `❌ Senior citizen record not found:`,
            seniorError.message
          );
        } else {
          console.log(`✅ Senior citizen record created`);
        }
      }
    } catch (error) {
      console.error(`❌ ${user.role} test failed:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting authentication system verification...\n');

  // Validate environment variables first
  if (!validateEnvironment()) {
    console.error(
      '❌ Environment validation failed. Please check your .env file.'
    );
    process.exit(1);
  }

  console.log('✅ Environment variables validated');

  const dbSetup = await verifyDatabaseSetup();

  if (dbSetup) {
    await testUserRegistration();
  }

  console.log('\n✨ Verification complete!');
}

main().catch(console.error);
