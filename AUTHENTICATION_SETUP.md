# Authentication System Setup Guide

## 🎯 **Overview**

This guide ensures that the login and registration system works properly with the Cellular Reproduction Learning Module database structure.

## 📋 **Updated Files**

### 1. **Database Types (`types/database.ts`)**

✅ **Updated to match new system structure:**

- User roles: `osca`, `basca`, `senior`
- Role-specific fields for each user type
- All new tables: `senior_citizens`, `announcements`, `appointments`, `document_requests`, `benefits`, `census_records`

### 2. **Property Types (`types/property.ts`)**

✅ **Converted to Senior Citizen types:**

- `SeniorCitizen` interface
- `Announcement` interface
- `Appointment` interface
- `DocumentRequest` interface
- `Benefit` interface
- `CensusRecord` interface

### 3. **Auth API (`lib/api/auth.ts`)**

✅ **Enhanced with role-specific functionality:**

- Role-specific registration fields
- Proper data mapping between frontend and database
- Senior citizen record creation for senior users
- Environment variable for service role key
- Comprehensive error handling

### 4. **Database Schema (`scripts/create-tables-fixed.sql`)**

✅ **Updated trigger function:**

- Handles all role-specific fields
- Proper data type casting
- Safe defaults for optional fields
- Error handling to prevent registration failures

## 🔧 **Environment Variables**

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🧪 **Testing the System**

### **Option 1: Web Interface**

1. Navigate to `/test-auth` in your application
2. Run the database connection test
3. Test each role registration
4. Check results in real-time

### **Option 2: Command Line**

```bash
npm run verify-auth
```

This will:

- Verify all database tables exist
- Test user registration for each role
- Check role-specific data storage
- Validate senior citizen record creation

## 🔐 **Registration Flow**

### **OSCA Registration**

```typescript
{
  email: "osca@example.com",
  password: "SecurePassword123!",
  firstName: "John",
  lastName: "Doe",
  phone: "+639123456789",
  role: "osca",
  department: "IT Department",
  position: "System Administrator",
  employeeId: "EMP-001"
}
```

### **BASCA Registration**

```typescript
{
  email: "basca@example.com",
  password: "SecurePassword123!",
  firstName: "Jane",
  lastName: "Smith",
  phone: "+639123456788",
  role: "basca",
  barangay: "Barangay 1",
  barangayCode: "BG001"
}
```

### **Senior Registration**

```typescript
{
  email: "senior@example.com",
  password: "SecurePassword123!",
  firstName: "Maria",
  lastName: "Santos",
  phone: "+639123456787",
  role: "senior",
  dateOfBirth: "1950-01-01",
  address: "123 Main Street, City",
  emergencyContactName: "Juan Santos",
  emergencyContactPhone: "+639123456786",
  emergencyContactRelationship: "Spouse"
}
```

## 🔑 **Login Flow**

1. **User enters credentials** with role selection
2. **Supabase Auth validates** email/password
3. **Role verification** ensures correct role login
4. **User data loaded** with role-specific fields
5. **Dashboard redirection** based on role

## 🗄️ **Database Tables**

### **Core Tables**

- `users` - User accounts with role-based fields
- `senior_citizens` - Detailed senior citizen records
- `announcements` - System-wide and barangay-specific announcements
- `appointments` - Health check-ups and consultations
- `document_requests` - OSCA ID and certificate requests
- `benefits` - Financial and social assistance tracking
- `census_records` - Statistical data by barangay

### **Security Features**

- **Row Level Security (RLS)** - Data access controlled by role
- **Role-based Access** - Users can only access appropriate areas
- **Input Validation** - Client and server-side validation
- **Password Security** - Strong password requirements

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Database Connection Failed**

   - Check environment variables
   - Verify Supabase project is active
   - Ensure database schema is applied

2. **Registration Fails**

   - Check if trigger function exists
   - Verify role-specific fields are provided
   - Check console for detailed error messages

3. **Login Fails**

   - Verify email is confirmed
   - Check if role matches registration
   - Ensure user record exists in database

4. **Role-specific Data Missing**
   - Check if trigger function handles all fields
   - Verify data mapping in auth API
   - Check database schema for field names

### **Debugging Steps**

1. **Run verification script:**

   ```bash
   npm run verify-auth
   ```

2. **Check database logs:**

   - Go to Supabase Dashboard
   - Check Logs section for errors

3. **Test individual components:**
   - Visit `/test-auth` page
   - Run individual tests
   - Check browser console for errors

## ✅ **Verification Checklist**

- [ ] Environment variables set correctly
- [ ] Database schema applied successfully
- [ ] Trigger function working properly
- [ ] Role-specific registration working
- [ ] Login with role verification working
- [ ] Dashboard redirection working
- [ ] Senior citizen records created for senior users
- [ ] All tables accessible and properly structured

## 🎉 **Success Indicators**

When everything is working correctly, you should see:

1. **Registration Success:**

   - User account created in Supabase Auth
   - User record created in `users` table
   - Role-specific data stored correctly
   - Senior citizen record created for senior users

2. **Login Success:**

   - User can log in with correct role
   - Role-specific data loaded properly
   - Dashboard redirection works correctly

3. **Database Verification:**
   - All tables accessible
   - RLS policies working
   - Data isolation between roles

## 📞 **Support**

If you encounter issues:

1. Check the verification script output
2. Review browser console for errors
3. Check Supabase dashboard logs
4. Verify environment variables
5. Ensure database schema is applied correctly

---

**The authentication system is now fully configured for the Cellular Reproduction Learning Module!** 🎉
