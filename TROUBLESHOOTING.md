# Troubleshooting Guide

## 🔧 **Common Issues and Solutions**

### **Error: 406 (Not Acceptable) - GET /rest/v1/users**

**Problem:** The Supabase client is trying to access the `users` table but getting a 406 error due to RLS (Row Level Security) policies.

**Solutions:**

1. **Use Admin Client for Database Operations**

   - ✅ The auth API now uses `supabaseAdmin` for all database operations
   - ✅ This bypasses RLS policies during user creation
   - ✅ Service role key is properly configured

2. **Update RLS Policies**

   - ✅ Added service role policies to allow admin operations
   - ✅ Simplified policies to avoid circular dependencies
   - ✅ Fixed EXISTS clauses instead of IN clauses

3. **Check Environment Variables**
   ```bash
   # Ensure these are set in .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### **Error: "supabaseKey is required"**

**Problem:** Environment variables are not loading properly.

**Solutions:**

1. **Check File Location**

   ```
   your-project/
   ├── .env.local          # Development environment
   └── .env                # Production/scripts
   ```

2. **Verify File Content**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Restart Development Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### **Error: "Missing environment variables"**

**Problem:** Required environment variables are not set.

**Solutions:**

1. **Create Environment Files**

   - Create `.env.local` in project root
   - Add required variables
   - Restart development server

2. **Check Variable Names**
   - Ensure exact spelling (case-sensitive)
   - No extra spaces or quotes
   - Correct file extension

### **Error: "Database connection failed"**

**Problem:** Cannot connect to Supabase database.

**Solutions:**

1. **Check Supabase Project**

   - Verify project is active
   - Check if database is accessible
   - Ensure API keys are correct

2. **Verify Database Schema**

   ```bash
   # Run the updated SQL script in Supabase dashboard
   # Or use Supabase CLI
   ```

3. **Test Connection**
   ```bash
   npm run verify-auth
   ```

### **Error: "User registration failed"**

**Problem:** User creation fails during registration.

**Solutions:**

1. **Check Trigger Function**

   - Ensure `handle_new_user()` function exists
   - Verify trigger is attached to `auth.users`
   - Check function permissions

2. **Verify Table Structure**

   - Ensure all required tables exist
   - Check column names and types
   - Verify indexes are created

3. **Check RLS Policies**
   - Ensure service role can access tables
   - Verify user policies are correct
   - Test with admin client

### **Error: "Role-specific data missing"**

**Problem:** Role-specific fields are not being saved.

**Solutions:**

1. **Check Registration Data**

   - Verify all required fields are provided
   - Ensure data types are correct
   - Check form validation

2. **Update Database Schema**

   - Ensure all role-specific columns exist
   - Check data type compatibility
   - Verify default values

3. **Test Individual Roles**
   ```bash
   # Test each role separately
   npm run verify-auth
   ```

## 🧪 **Testing Steps**

### **1. Environment Setup**

```bash
# 1. Create environment files
touch .env.local
touch .env

# 2. Add variables
echo "NEXT_PUBLIC_SUPABASE_URL=your_url" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key" >> .env.local
echo "SUPABASE_SERVICE_ROLE_KEY=your_service_key" >> .env.local

# 3. Restart server
npm run dev
```

### **2. Database Setup**

```bash
# 1. Run SQL script in Supabase dashboard
# 2. Verify tables are created
# 3. Check RLS policies
# 4. Test trigger function
```

### **3. Test Authentication**

```bash
# 1. Run verification script
npm run verify-auth

# 2. Visit test page
# http://localhost:3000/test-auth

# 3. Test each role registration
```

### **4. Debug Issues**

```bash
# 1. Check browser console
# 2. Check server logs
# 3. Check Supabase logs
# 4. Verify environment variables
```

## 🔍 **Debugging Tools**

### **1. Test Page**

- Visit `http://localhost:3000/test-auth`
- Run individual tests
- Check detailed error messages

### **2. Verification Script**

```bash
npm run verify-auth
```

### **3. Environment Check**

```javascript
// Add this to any component to debug
console.log('Config:', config);
console.log('Environment:', process.env);
```

### **4. Supabase Dashboard**

- Check Logs section
- Verify table structure
- Test RLS policies
- Check trigger functions

## 📋 **Checklist**

### **Environment**

- [ ] `.env.local` file exists
- [ ] All required variables are set
- [ ] No typos in variable names
- [ ] Development server restarted

### **Database**

- [ ] SQL script executed successfully
- [ ] All tables created
- [ ] RLS policies applied
- [ ] Trigger function working
- [ ] Service role key configured

### **Authentication**

- [ ] Registration works for all roles
- [ ] Login works with role verification
- [ ] Dashboard redirection works
- [ ] Role-specific data saved

### **Testing**

- [ ] Database connection test passes
- [ ] All role registration tests pass
- [ ] No console errors
- [ ] No network errors

## 🚨 **Emergency Fixes**

### **If Nothing Works**

1. **Reset Environment**

   ```bash
   # Delete and recreate environment files
   rm .env.local .env
   # Recreate with correct values
   ```

2. **Reset Database**

   ```sql
   -- Drop and recreate tables
   DROP TABLE IF EXISTS users CASCADE;
   -- Run create-tables-fixed.sql again
   ```

3. **Clear Cache**

   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run dev
   ```

4. **Check Supabase Project**
   - Verify project is active
   - Check billing status
   - Ensure API keys are valid

---

**If you're still having issues, check the test page at `/test-auth` for detailed error messages!** 🔧

