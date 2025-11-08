import { supabase, supabaseAdmin } from '@/lib/supabase';
import type { RegisterData, LoginCredentials, User } from '@/types/auth';
import { validateEnvironment } from '@/lib/config';
import { toast } from 'sonner';

// Validate environment on module load
validateEnvironment();

export class AuthAPI {
  static async register(data: RegisterData) {
    try {
      console.log(
        'Starting registration for:',
        data.email,
        'with role:',
        data.role
      );
      console.log({data})

      // Create user in Supabase Auth with role-specific metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            first_name: data.firstName,
            middle_name: data.middleName,
            last_name: data.lastName,
            role: data.role,
            learning_style: data.learningStyle,
            grade_level: data.gradeLevel
          },
          // For development: skip email confirmation
          emailRedirectTo: undefined
        }
      });

      console.log({ authError });
      if (authError) {
        console.error('Auth registration error:', authError);
        toast.error('Registration Failed', {
          description:
            authError.message || 'Failed to create account. Please try again.'
        });
        throw new Error(authError.message);
      }

      if (!authData.user) {
        toast.error('Registration Failed', {
          description: 'User creation failed. Please try again.'
        });
        throw new Error('User creation failed');
      }

      console.log('Auth user created successfully:', authData.user.id);
      console.log('User email confirmed:', authData.user.email_confirmed_at);
      console.log(
        'User confirmation sent at:',
        authData.user.confirmation_sent_at
      );

      // Wait a moment for the trigger to execute
      console.log('Waiting for profile trigger to execute...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create profile using upsert (works better with RLS policies)
      console.log('Creating profile with upsert...');

      const profileData = {
        id: authData.user.id,
        email: data.email,
        first_name: data.firstName || null,
        middle_name: data.middleName || null,
        last_name: data.lastName || null,
        full_name:
          data.fullName ||
          `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        role: data.role,
        onboarding_completed: false,
        ...(data.gradeLevel && { grade_level: data.gradeLevel })
      };

      console.log('Attempting to upsert profile with data:', profileData);

      // Use upsert which works with RLS policies that allow users to insert their own profile
      const { data: profileResult, error: profileErr } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (profileErr) {
        console.error('Profile upsert failed:', profileErr);
        // Don't throw error - profile might be created by trigger
        console.warn('Profile creation via upsert failed, but continuing with registration');
        console.warn('Profile may have been created by database trigger');
      } else {
        console.log('Profile created successfully via upsert:', profileResult);
      }

      // Automatically sign in the user after successful registration
      console.log('Auto-signing in user after registration...');
      let sessionEstablished = false;
      
      try {
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
          });

        if (signInError) {
          console.error('Auto sign-in failed:', signInError);
          
          // Check if it's just email not confirmed
          if (signInError.message?.includes('Email not confirmed') || signInError.message?.includes('email_not_confirmed')) {
            console.warn('⚠️ Email not confirmed - but allowing registration to proceed');
            console.warn('User can complete onboarding without email confirmation');
            // Don't treat this as a fatal error - user can still proceed
          } else {
            console.warn('User will need to log in manually');
          }
        } else if (signInData.user && signInData.session) {
          console.log('Auto sign-in successful:', signInData.user.id);
          sessionEstablished = true;
          
          // Verify session is stored
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: { session: verifySession } } = await supabase.auth.getSession();
          console.log('Session verification:', verifySession ? 'Session stored' : 'Session NOT stored');
          
          if (!verifySession) {
            console.error('Session was not stored properly!');
            sessionEstablished = false;
          }
        } else {
          console.warn('Sign-in succeeded but no session returned');
        }
      } catch (signInErr) {
        console.error('Auto sign-in error:', signInErr);
      }
      
      if (!sessionEstablished) {
        console.warn('⚠️ Session not established - user may need to refresh or log in again');
      }

      // Show success toast
      const isConfirmed = authData.user.email_confirmed_at;
      toast.success('Registration Successful!', {
        description: isConfirmed
          ? 'Account created successfully and ready to use!'
          : 'Account created successfully.'
      });

      // Create a User object from the registration data
      const user: User = {
        id: authData.user.id,
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        fullName:
          data.fullName ||
          `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        learningStyle: data.learningStyle,
        gradeLevel: data.gradeLevel,
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return {
        success: true,
        message:
          'Registration successful! Please check your email to verify your account.',
        user: user
      };
    } catch (error) {
      console.log({ error });
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async login(credentials: LoginCredentials) {
    try {
      console.log(
        'Starting login for:',
        credentials.email,
        'with role:',
        credentials.role
      );

      console.log('Calling supabase.auth.signInWithPassword...');

      // Login flow without timeout (removed to prevent unhandled rejections)
      const loginFlow = async () => {
        console.log('🔄 Step 1: Starting Supabase authentication...');
        
        // Step 1: Authenticate with Supabase (with timeout)
        const authTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout - taking too long')), 10000)
        );
        
        const authPromise = supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });
        
        let authData: any;
        let authError: any;
        
        try {
          const result = await Promise.race([authPromise, authTimeout]) as any;
          authData = result.data;
          authError = result.error;
          console.log('✅ Step 1 complete - Auth login result:', { authError, user: authData?.user?.id });
        } catch (error: any) {
          console.error('❌ Step 1 timeout/error:', error.message);
          // If timeout, try to get session from Supabase directly with timeout
          console.log('🔄 Attempting to get session directly...');
          
          const sessionTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('getSession timeout')), 3000)
          );
          
          try {
            const sessionPromise = supabase.auth.getSession();
            const sessionResult = await Promise.race([sessionPromise, sessionTimeout]) as any;
            const sessionData = sessionResult.data;
            
            console.log({sessionData});
            if (sessionData?.session?.user) {
              console.log('✅ Got session from getSession:', sessionData.session.user.id);
              authData = { user: sessionData.session.user, session: sessionData.session };
              authError = null;
            } else {
              throw new Error('Authentication failed - no session found');
            }
          } catch (sessionError: any) {
            console.error('❌ getSession also timed out/failed:', sessionError.message);
            // Last resort: Since auth listener fired with SIGNED_IN, authentication succeeded
            // We'll throw an error to be caught by outer try-catch and let the page handle it
            throw new Error('Login succeeded but session retrieval timed out. Please refresh the page.');
          }
        }
        if (authError) {
          toast.error('Login Failed', {
            description:
              authError.message || 'Invalid email or password. Please try again.'
          });
          return {
            success: false,
            message:
              authError.message || 'Invalid email or password. Please try again.'
          };
        }

        if (!authData.user) {
          toast.error('Login Failed', {
            description: 'Login failed. Please try again.'
          });
          return {
            success: false,
            message: 'Login failed. Please try again.'
          };
        }

        // Step 2: Get user profile data with timeout and fallback
        console.log('🔄 Step 2: Fetching profile for user:', authData.user.id);
        const startTime = Date.now();
        
        // Create timeout promise (5 seconds)
        // const timeoutPromise = new Promise((_, reject) => 
        //   setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        // );
        
        // Create profile fetch promise
        const profilePromise = supabase
          .from('profiles')
          .select('id, email, role, first_name, middle_name, last_name, full_name, profile_photo, learning_style, grade_level, onboarding_completed, created_at, updated_at')
          .eq('id', authData.user.id)
          .single();
        
        let userData = null;
        let userError = null;
        
        try {
          const result = await Promise.race([profilePromise]) as any;
          userData = result.data;

          console.log({userData})
          userError = result.error;
          
          const fetchTime = Date.now() - startTime;
          console.log(`✅ Step 2 complete in ${fetchTime}ms - Profile data:`, { 
            hasData: !!userData,
            userId: userData?.id, 
            userError: userError?.message,
            fetchTime 
          });
        } catch (error: any) {
          const fetchTime = Date.now() - startTime;
          console.warn(`⚠️ Profile fetch failed/timeout after ${fetchTime}ms:`, error.message);
          console.log('🔄 Using user_metadata as fallback...');
          
          // Fallback: Use user_metadata from auth response
          const metadata = authData.user.user_metadata;
          userData = {
            id: authData.user.id,
            email: authData.user.email,
            role: metadata.role || 'student',
            first_name: metadata.first_name || null,
            middle_name: metadata.middle_name || null,
            last_name: metadata.last_name || null,
            full_name: `${metadata.first_name || ''} ${metadata.middle_name || ''} ${metadata.last_name || ''}`.trim() || null,
            profile_photo: null,
            learning_style: null,
            grade_level: metadata.grade_level || null,
            onboarding_completed: false,
            created_at: authData.user.created_at,
            updated_at: authData.user.updated_at
          };
          userError = null; // Clear error since we have fallback data
          console.log('✅ Fallback data created from user_metadata');
        }

        return { authData, userData, userError };
      };

      // Execute login flow
      console.log('🚀 Executing login flow...');
      let result: any;
      
      try {
        result = await loginFlow();
        console.log('✅ Login flow complete, result:', { 
          hasResult: !!result,
          hasAuthData: !!result?.authData,
          hasUserData: !!result?.userData,
          userError: result?.userError?.message
        });
      } catch (flowError: any) {
        console.error('❌ Login flow error:', flowError);
        toast.error('Login Error', {
          description: flowError.message || 'An error occurred during login'
        });
        return {
          success: false,
          message: flowError.message || 'Login flow failed'
        };
      }
      
      // If timeout or error in flow
      if (!result || result.success === false) {
        console.log('⚠️ Login flow returned unsuccessful result');
        return result;
      }

      const { authData, userData, userError } = result;

      console.log('Profile fetch result:', {
        userError,
        userData: userData?.id
      });

      if (userError) {
        console.error('User data fetch error:', userError);
        toast.error('Profile Error', {
          description: 'Failed to fetch user profile. Please try again.'
        });
        return {
          success: false,
          message: 'Failed to fetch user profile. Please try again.'
        };
      }

      // Validate role if provided during login
      if (credentials.role && userData && userData.role !== credentials.role) {
        await supabase.auth.signOut();
        return {
          success: false,
          message: `Invalid role. Expected ${credentials.role}, but user is ${userData.role}`
        };
      }

      const user: User | null = userData
        ? {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            firstName: userData.first_name ?? undefined,
            middleName: userData.middle_name ?? undefined,
            lastName: userData.last_name ?? undefined,
            fullName: userData.full_name ?? undefined,
            profilePhoto: userData.profile_photo ?? undefined,
            learningStyle: userData.learning_style ?? undefined,
            gradeLevel: userData.grade_level ?? undefined,
            onboardingCompleted: userData.onboarding_completed ?? undefined,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at
          }
        : null;

      // Show success toast
      toast.success('Login Successful!', {
        description: `Welcome back, ${user?.firstName || user?.email}!`
      });

      console.log(
        '🎉 Login successful, returning user:',
        user?.id,
        'role:',
        user?.role,
        'onboarding:',
        user?.onboardingCompleted
      );
      const finalResult = {
        success: true,
        message: 'Login successful',
        user,
        session: authData.session
      };
      console.log('📤 Returning final result:', finalResult);
      return finalResult;
    } catch (error) {
      console.error('Login error:', error);

      if (error instanceof Error && error.message === 'Login timeout') {
        toast.error('Login Timeout', {
          description: 'Login is taking too long. Please try again.'
        });
        return {
          success: false,
          message: 'Login timeout. Please try again.'
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Logout failed'
      };
    }
  }

  static async getCurrentUser(): Promise<{ user: User | null; session: any }> {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!user || !session) {
        return { user: null, session: null };
      }

      // Check if session is expired
      const now = new Date().getTime() / 1000;
      if (session.expires_at && session.expires_at < now) {
        console.log('Session expired, attempting refresh...');
        const {
          data: { session: refreshedSession },
          error: refreshError
        } = await supabase.auth.refreshSession();

        if (refreshError || !refreshedSession) {
          console.error('Session refresh failed:', refreshError);
          return { user: null, session: null };
        }

        // After refreshing session, we still need to fetch user profile
        // Continue to the profile fetching logic below
      }

      // Get user profile data with timeout
      console.log('⏳ Fetching user profile from database...');
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Add 3-second timeout for profile fetch
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      );

      let userData;
      try {
        const result = await Promise.race([profilePromise, timeoutPromise]);
        userData = (result as any).data;
        const userError = (result as any).error;
        
        if (userError) {
          console.error('❌ User data fetch error:', userError);
          return { user: null, session: null };
        }
        console.log('✅ Profile fetched successfully');
      } catch (error) {
        console.error('⚠️ Profile fetch timeout or error:', error);
        return { user: null, session: null };
      }

      const userProfile: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.first_name ?? undefined,
        middleName: userData.middle_name ?? undefined,
        lastName: userData.last_name ?? undefined,
        fullName: userData.full_name ?? undefined,
        profilePhoto: userData.profile_photo ?? undefined,
        learningStyle: userData.learning_style ?? undefined,
        preferredModules: userData.preferred_modules ?? undefined,
        learningType: userData.learning_type ?? undefined,
        gradeLevel: userData.grade_level ?? undefined,
        onboardingCompleted: userData.onboarding_completed ?? undefined,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      };

      return { user: userProfile, session };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, session: null };
    }
  }

  static async refreshSession() {
    try {
      const {
        data: { session },
        error
      } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Session refresh error:', error);
        return { success: false, message: error.message };
      }

      if (!session) {
        console.log('🔄 Step 1: No session to refresh...');
        return { success: false, message: 'No session to refresh' };
      }

      console.log('✅ Step 1 complete - Session refreshed:', { session: session.id });
      console.log('🔄 Step 2: Fetching user profile from database...');
      // Step 2: Fetch user profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      console.log('✅ Step 2 complete - User data:', { userData: userData?.id, userError });
      console.log('🎯 Returning from refreshSession...');
      if (userError) {
        console.error('User data fetch error:', userError);
        return { success: false, message: 'Failed to fetch user data' };
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.first_name ?? undefined,
        middleName: userData.middle_name ?? undefined,
        lastName: userData.last_name ?? undefined,
        fullName: userData.full_name ?? undefined,
        profilePhoto: userData.profile_photo ?? undefined,
        learningStyle: userData.learning_style ?? undefined,
        gradeLevel: userData.grade_level ?? undefined,
        onboardingCompleted: userData.onboarding_completed ?? undefined,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      };

      return { success: true, user, session: session };
    } catch (error) {
      console.error('Session refresh error:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Session refresh failed'
      };
    }
  }

  static async validateSession() {
    try {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Session validation error:', error);
        return { success: false, message: error.message };
      }

      if (!session) {
        return { success: false, message: 'No active session' };
      }

      // Check if session is expired
      const now = new Date().getTime() / 1000;
      if (session.expires_at && session.expires_at < now) {
        return { success: false, message: 'Session expired' };
      }

      return { success: true, session };
    } catch (error) {
      console.error('Session validation error:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Session validation failed'
      };
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        console.error('Password reset error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Password reset failed'
      };
    }
  }

  static async updateProfile(updates: Partial<User>) {
    try {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Prepare profile data for update
      const profileData: any = {};

      if (updates.firstName !== undefined)
        profileData.first_name = updates.firstName;
      if (updates.middleName !== undefined)
        profileData.middle_name = updates.middleName;
      if (updates.lastName !== undefined)
        profileData.last_name = updates.lastName;
      if (updates.fullName !== undefined)
        profileData.full_name = updates.fullName;
      if (updates.profilePhoto !== undefined)
        profileData.profile_photo = updates.profilePhoto;
      if (updates.learningStyle !== undefined)
        profileData.learning_style = updates.learningStyle;
      if (updates.gradeLevel !== undefined)
        profileData.grade_level = updates.gradeLevel;
      if (updates.onboardingCompleted !== undefined)
        profileData.onboarding_completed = updates.onboardingCompleted;

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Profile updated successfully', data };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Profile update failed'
      };
    }
  }

  // Test functions for development
  static async testDatabaseConnection() {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('count')
        .limit(1);
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Database connection successful' };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Database connection failed'
      };
    }
  }

  static async testRoleRegistration(role: 'student' | 'teacher') {
    const testData: RegisterData = {
      firstName: `Test${role}`,
      lastName: 'User',
      email: `test-${role}-${Date.now()}@example.com`,
      password: 'testpassword123',
      confirmPassword: 'testpassword123',
      role: role,
      gradeLevel: role === 'student' ? 'Grade 6' : undefined
    };

    try {
      const result = await AuthAPI.register(testData);
      return result;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Test registration failed'
      };
    }
  }
}
