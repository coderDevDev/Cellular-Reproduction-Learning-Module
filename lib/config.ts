// Environment configuration
export const config = {
  supabase: {
    url:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://oykqgcyniwygrlsbhhvm.supabase.co',
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95a3FnY3luaXd5Z3Jsc2JoaHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjgzNzksImV4cCI6MjA3NzgwNDM3OX0.Y2MPr-eVhVaaSyYzwltpU6r_dc7fqXGY-LCaQGG9wRA',
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95a3FnY3luaXd5Z3Jsc2JoaHZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIyODM3OSwiZXhwIjoyMDc3ODA0Mzc5fQ.Ape2meioo-kfXp5mRNKjxHx8_fq7hOCvJhEm6XyjxEo'
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
