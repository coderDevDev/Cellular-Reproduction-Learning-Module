// Environment configuration
export const config = {
  supabase: {
    url:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://xieuxyhwjircnbqvfxsd.supabase.co',
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZXV4eWh3amlyY25icXZmeHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjI2ODYsImV4cCI6MjA3MDY5ODY4Nn0.gcHvfVFg8gGHCIGjRzDFQTxjzY6MijfHNw-gdd-2nUg',
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZXV4eWh3amlyY25icXZmeHNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMjY4NiwiZXhwIjoyMDcwNjk4Njg2fQ.wHIhUPn-2nMfRFbYuAle_67z55pl2SmV9xORHBIQwr0'
  }
};

// Validate required environment variables
export function validateEnvironment() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars);
    console.warn('Please check your .env.local file');
  }

  return missingVars.length === 0;
}
