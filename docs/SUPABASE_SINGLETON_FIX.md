# Supabase Client Singleton Fix

## Problem
**Warning:** "Multiple GoTrueClient instances detected in the same browser context"

This warning appeared because multiple Supabase client instances were being created across different API files, causing:
- Memory overhead
- Potential session conflicts
- Undefined behavior with concurrent auth operations

## Root Cause

Multiple files were creating their own Supabase admin clients:

```typescript
// ❌ BEFORE - Creating duplicate clients
// In students.ts:
const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey);

// In auth.ts:
const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey);

// In senior-citizens.ts:
const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey);
```

Each `createClient()` call creates a new GoTrueClient instance, leading to the warning.

## Solution

### 1. Centralized Singleton Pattern in `lib/supabase.ts`

```typescript
// ✅ AFTER - Singleton pattern
let _supabaseClient: SupabaseClient<Database> | null = null;
let _supabaseAdminClient: SupabaseClient<Database> | null = null;

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

function getSupabaseAdminClient() {
  if (!_supabaseAdminClient) {
    _supabaseAdminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'biscas-naga-admin-auth', // Different storage key
      },
    });
  }
  return _supabaseAdminClient;
}

export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdminClient();
```

### 2. Import Singleton in All API Files

```typescript
// ✅ Import instead of creating new instances
import { supabase, supabaseAdmin } from '@/lib/supabase';
```

## Files Modified

### 1. `client/lib/supabase.ts`
- Implemented singleton pattern with getters
- Added unique storage keys for client and admin
- Added auth configuration options
- Prevents multiple GoTrueClient instances

### 2. `client/lib/api/students.ts`
**Before:**
```typescript
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';
const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey);
```

**After:**
```typescript
import { supabase, supabaseAdmin } from '@/lib/supabase';
```

### 3. `client/lib/api/auth.ts`
**Before:**
```typescript
import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey);
```

**After:**
```typescript
import { supabase, supabaseAdmin } from '@/lib/supabase';
```

### 4. `client/lib/api/senior-citizens.ts`
**Before:**
```typescript
import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient<Database>(config.supabase.url, config.supabase.serviceRoleKey);
```

**After:**
```typescript
import { supabase, supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/database';
```

## Benefits

### ✅ Performance
- Single auth client instance shared across entire app
- Reduced memory footprint
- Better session management

### ✅ Session Consistency
- One auth state across all operations
- No session conflicts
- Predictable behavior

### ✅ Development Experience
- No warning messages in console
- Hot module reloading safe
- Cleaner imports

### ✅ Configuration Control
- Centralized auth settings
- Unique storage keys prevent collisions
- Easy to modify behavior globally

## Storage Keys

Two separate storage keys prevent conflicts:

1. **`biscas-naga-auth`** - Main client (user sessions)
   - `persistSession: true`
   - Used for student/teacher login
   
2. **`biscas-naga-admin-auth`** - Admin client (privileged operations)
   - `persistSession: false`
   - Used for user creation, RLS bypass

## Testing

After this fix, the warning should no longer appear in the browser console:

```
✅ No more: "Multiple GoTrueClient instances detected..."
```

To verify:
1. Open browser DevTools console
2. Navigate to any page that uses auth
3. Check that no GoTrueClient warnings appear
4. Test login/logout functionality
5. Test student creation/bulk import

## Additional Notes

- The `createServerSupabaseClient()` function intentionally creates new instances for server-side API routes
- This is by design as server routes don't need persistent clients
- Hot module reloading in development won't create duplicate instances due to singleton pattern

## Related Documentation
- [Supabase Client Options](https://supabase.com/docs/reference/javascript/initializing)
- [Auth Configuration](https://supabase.com/docs/reference/javascript/auth-signup)
