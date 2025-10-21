import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { config } from '@/lib/config';

const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;
const serviceRoleKey = config.supabase.serviceRoleKey;

// Singleton pattern to prevent multiple client instances
// This prevents "Multiple GoTrueClient instances" warning
let _supabaseClient: SupabaseClient<Database> | null = null;
let _supabaseAdminClient: SupabaseClient<Database> | null = null;

/**
 * Get or create the main Supabase client instance (singleton)
 */
function getSupabaseClient() {
  if (!_supabaseClient) {
    _supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'biscas-naga-auth', // Unique storage key
      },
    });
  }
  return _supabaseClient;
}

/**
 * Get or create the admin Supabase client instance (singleton)
 */
function getSupabaseAdminClient() {
  if (!_supabaseAdminClient) {
    // Validate that we have a service role key (not anon key)
    if (!serviceRoleKey || serviceRoleKey === supabaseAnonKey) {
      console.error('⚠️ WARNING: Admin client is using anon key instead of service role key!');
      console.error('This will cause "User not allowed" errors for admin operations.');
    } else {
      console.log('✅ Admin client initialized with service role key');
    }

    _supabaseAdminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'biscas-naga-admin-auth', // Different storage key for admin
      },
    });
  }
  return _supabaseAdminClient;
}

// Export singleton instances
export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdminClient();

// Server-side client for API routes (creates new instance each time)
export const createServerSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};
