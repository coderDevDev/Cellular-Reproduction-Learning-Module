# Database Setup Guide

This guide will help you set up the Supabase database for the Cellular Reproduction Learning Module.

## 🚨 Current Issue

You're seeing a "Database error saving new user" error because the trigger function has issues. Follow these steps to fix it.

## 📋 Prerequisites

1. **Supabase Account**: Make sure you have a Supabase account
2. **Project Created**: Ensure you have a Supabase project set up
3. **Environment Variables**: Your `.env.local` should have:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## 🗄️ Database Setup Steps

### Step 1: Access Your Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### Step 2: Run the Fixed Database Scripts

1. **Navigate to SQL Editor**

   - In your Supabase dashboard, click on **SQL Editor** in the left sidebar

2. **Drop existing tables (if any)**

   - Click **New Query**
   - Run this to clean up any existing tables:

   ```sql
   DROP TABLE IF EXISTS senior_citizens CASCADE;
   DROP TABLE IF EXISTS announcements CASCADE;
   DROP TABLE IF EXISTS appointments CASCADE;
   DROP TABLE IF EXISTS document_requests CASCADE;
   DROP TABLE IF EXISTS benefits CASCADE;
   DROP TABLE IF EXISTS census_records CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   DROP TYPE IF EXISTS user_role CASCADE;
   DROP TYPE IF EXISTS senior_status CASCADE;
   DROP TYPE IF EXISTS appointment_status CASCADE;
   DROP TYPE IF EXISTS document_request_status CASCADE;
   DROP TYPE IF EXISTS benefit_status CASCADE;
   DROP TYPE IF EXISTS announcement_type CASCADE;
   ```

3. **Create Tables with Fixed Script**

   - Click **New Query**
   - Copy the entire contents of `scripts/create-tables-fixed.sql`
   - Paste it into the SQL editor
   - Click **Run** to execute

4. **Verify Tables Created**
   - Go to **Table Editor** in the left sidebar
   - You should see these tables:
     - `profiles`
     - `lessons`
     - `quizzes`
     - `quiz_questions`
     - `quiz_assignees`
     - `quiz_results`
     - `activities`
     - `activity_assignees`
     - `submissions`
     - `announcements`

### Step 3: Configure Authentication

1. **Go to Authentication Settings**

   - In your Supabase dashboard, click **Authentication** → **Settings**

2. **Enable Email Confirmation**

   - Make sure **Enable email confirmations** is turned ON
   - This is required for the registration flow

3. **Configure Email Templates** (Optional)
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation email if needed

## 🔧 Verification Steps

### Check Database Tables

1. Go to **Table Editor** in Supabase dashboard
2. Verify these tables exist:
   - `profiles` (extends auth.users)
   - `lessons`
   - `quizzes`
   - `quiz_questions`
   - `quiz_assignees`
   - `quiz_results`
   - `activities`
   - `activity_assignees`
   - `submissions`
   - `announcements`

### Check Functions and Triggers

1. Go to **Database** → **Functions** in Supabase dashboard
2. You should see:
   - `handle_new_user()` function (improved version)
   - `update_updated_at_column()` function

### Test Registration

1. Start your development server: `pnpm dev`
2. Try registering a new user with different roles (`student`, `teacher`)
3. Check that no "Database error saving new user" errors occur

## 🚨 Troubleshooting

### Issue: "Database error saving new user"

**Solution**:

1. Use the fixed script `scripts/create-tables-fixed.sql`
2. The improved trigger function handles errors gracefully
3. The AuthAPI now has fallback mechanisms

### Issue: "Table 'profiles' does not exist"

**Solution**: Run the `create-tables-fixed.sql` script in SQL Editor

### Issue: "Function 'handle_new_user' does not exist"

**Solution**: The fixed script creates this function with better error handling. Make sure you ran the entire script.

### Issue: "Permission denied"

**Solution**:

1. Check your environment variables are correct
2. Ensure you're using the correct project
3. Verify your API keys have the right permissions

### Issue: "RLS policy error"

**Solution**: The fixed script creates RLS policies automatically. Make sure you ran the entire script.

## 🔄 What's Fixed in the New Script

### Improved Trigger Function

- **Better error handling**: Won't fail registration if trigger has issues
- **Safe defaults**: Handles missing metadata gracefully
- **Exception handling**: Logs errors but doesn't break registration

### Enhanced AuthAPI

- **Fallback mechanism**: Manually creates user record if trigger fails
- **Better error handling**: Provides detailed error messages
- **Retry logic**: Waits for trigger to execute before checking

### Additional RLS Policy

- **Insert policy**: Allows users to insert their own profile records
- **Better security**: Maintains security while allowing registration

## 📊 New System Features

### Role-Based Access Control

- **Teacher**: Can create and manage lessons, quizzes, activities, and announcements
- **Student**: Can view assigned lessons/activities and submit work

### Learning Management

- **Lessons**: Publish multimedia content tagged by learning style (VARK)
- **Quizzes**: Pre/post quizzes with multiple question types and scoring
- **Activities**: Assignments/projects with deadlines and rubric links
- **Submissions**: Students upload work; teachers grade and give feedback

### Communication

- **Announcements**: Publish updates targeted by role; schedule expiry
- **Visibility Controls**: Students see published items and their assignments

## 📞 Getting Help

If you're still having issues:

1. **Check Supabase Logs**

   - Go to **Logs** in your Supabase dashboard
   - Look for any error messages

2. **Verify Environment Variables**

   - Double-check your `.env.local` file
   - Make sure the URLs and keys are correct

3. **Test Database Connection**
   - Try a simple query in SQL Editor: `SELECT * FROM users LIMIT 1;`
   - This will confirm the table exists

## 🔄 Reset Database (If Needed)

If you need to start fresh:

1. **Drop all learning tables and types** (in SQL Editor):

   ```sql
   DROP TABLE IF EXISTS public.submissions CASCADE;
   DROP TABLE IF EXISTS public.activity_assignees CASCADE;
   DROP TABLE IF EXISTS public.activities CASCADE;
   DROP TABLE IF EXISTS public.quiz_results CASCADE;
   DROP TABLE IF EXISTS public.quiz_assignees CASCADE;
   DROP TABLE IF EXISTS public.quiz_questions CASCADE;
   DROP TABLE IF EXISTS public.quizzes CASCADE;
   DROP TABLE IF EXISTS public.lessons CASCADE;
   DROP TABLE IF EXISTS public.announcements CASCADE;
   DROP TABLE IF EXISTS public.profiles CASCADE;
   DROP TYPE IF EXISTS user_role CASCADE;
   DROP TYPE IF EXISTS learning_style CASCADE;
   DROP TYPE IF EXISTS quiz_type CASCADE;
   DROP TYPE IF EXISTS question_type CASCADE;
   ```

2. **Re-run the fixed setup script**:
   - Copy and paste `scripts/create-tables-fixed.sql`
   - Click **Run**

## ✅ Success Indicators

After following these steps, you should see:

- ✅ No "Database error saving new user" errors
- ✅ Registration works for both `student` and `teacher` roles
- ✅ Success message appears after registration
- ✅ Email verification email is sent
- ✅ User can log in after email verification
- ✅ Role-based dashboards load correctly
- ✅ Teachers can create lessons/quizzes/activities and students can access assignments

---

**Need more help?** Check the main README.md for additional troubleshooting steps.
