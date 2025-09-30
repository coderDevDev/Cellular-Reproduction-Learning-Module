# Environment Setup Guide

## 🔧 **Environment Variables Configuration**

### **Required Files**

1. **`.env.local`** (for development)
2. **`.env`** (for production/scripts)

### **Required Variables**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### **How to Get Your Supabase Credentials**

1. **Go to your Supabase Dashboard**

   - Visit https://supabase.com/dashboard
   - Select your project

2. **Get the URL and Keys**

   - Go to **Settings** → **API**
   - Copy the **Project URL**
   - Copy the **anon public** key
   - Copy the **service_role** key (keep this secret!)

3. **Create Environment Files**

   **For Development (`.env.local`):**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

   **For Scripts (`.env`):**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### **File Locations**

```
your-project/
├── .env.local          # Development environment
├── .env                # Production/scripts environment
├── lib/
│   ├── config.ts       # Environment configuration
│   └── api/
│       └── auth.ts     # Uses config
└── scripts/
    └── verify-auth-setup.js  # Uses .env
```

### **Security Notes**

- ⚠️ **Never commit `.env.local` or `.env` to version control**
- ✅ **Add them to `.gitignore`**
- 🔒 **Keep your service role key secret**
- 🌐 **Public keys can be exposed in client-side code**

### **Troubleshooting**

#### **Error: "supabaseKey is required"**

**Solution:**

1. Check if `.env.local` exists in your project root
2. Verify the file contains the correct variables
3. Restart your development server
4. Check the file path and syntax

#### **Error: "Missing environment variables"**

**Solution:**

1. Create `.env.local` file in project root
2. Add the required variables
3. Restart the development server

#### **Error: "Cannot read property of undefined"**

**Solution:**

1. Check variable names (case-sensitive)
2. Ensure no extra spaces in the file
3. Verify the file is in the correct location

### **Testing Environment Setup**

1. **Run the verification script:**

   ```bash
   npm run verify-auth
   ```

2. **Check the web interface:**

   - Visit `http://localhost:3000/test-auth`
   - Run the database connection test

3. **Check console output:**
   - Look for "✅ Environment variables validated"
   - Check for any warning messages

### **Common Issues**

#### **Issue: Environment variables not loading**

**Check:**

- File name is exactly `.env.local` (not `.env.local.txt`)
- File is in the project root directory
- No extra spaces or quotes around values
- Development server was restarted after adding the file

#### **Issue: Different values in different environments**

**Check:**

- `.env.local` for development
- `.env` for production/scripts
- Both files have the same variable names
- Values are correct for each environment

### **Example Environment Files**

**`.env.local` (Development):**

```env
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**`.env` (Production/Scripts):**

```env
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Verification Steps**

1. ✅ **Create environment files**
2. ✅ **Add required variables**
3. ✅ **Restart development server**
4. ✅ **Run verification script**
5. ✅ **Test web interface**
6. ✅ **Check console for errors**

---

**Your environment is now properly configured!** 🎉
