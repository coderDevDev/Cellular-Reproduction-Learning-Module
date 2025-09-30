// Check Environment Variables
// Run this script to verify your environment variables are set correctly

const fs = require('fs');
const path = require('path');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log('🔍 Environment Variables Check');
console.log('==============================');

if (!envExists) {
  console.log('❌ .env.local file not found!');
  console.log('📝 Create a .env.local file in your project root with:');
  console.log('');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('');
  console.log('🔑 Get these values from your Supabase dashboard:');
  console.log('   Settings → API → Project API keys');
  process.exit(1);
}

// Read and parse .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

console.log('✅ .env.local file found');

// Check required variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let allGood = true;

requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (!value) {
    console.log(`❌ ${varName} is missing`);
    allGood = false;
  } else if (
    value === 'your_supabase_url' ||
    value === 'your_supabase_anon_key' ||
    value === 'your_service_role_key'
  ) {
    console.log(`❌ ${varName} has placeholder value`);
    allGood = false;
  } else {
    console.log(`✅ ${varName} is set`);
  }
});

console.log('');

if (allGood) {
  console.log('🎉 All environment variables are set correctly!');
  console.log('💡 Try registering a user now - it should work!');
} else {
  console.log(
    '❌ Some environment variables are missing or have placeholder values'
  );
  console.log('');
  console.log('🔧 To fix this:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to Settings → API');
  console.log('3. Copy the Project URL, anon key, and service_role key');
  console.log('4. Update your .env.local file with the real values');
  console.log('');
  console.log(
    '⚠️  Important: The service_role key is required for user registration!'
  );
}

console.log('');
