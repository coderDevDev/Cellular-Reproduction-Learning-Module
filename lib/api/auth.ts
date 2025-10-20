import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import type { RegisterData, LoginCredentials, User } from '@/types/auth';
import { config, validateEnvironment } from '@/lib/config';
import { toast } from 'sonner';

// require('dotenv').config({ path: '.env' });

// Validate environment on module load
validateEnvironment();

console.log({ config });
// Create a service client for admin operations that bypass RLS
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

export class AuthAPI {
  static async register(data: RegisterData) {
    try {
      console.log(
        'Starting registration for:',
        data.email,
        'with role:',
        data.role
      );

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

      // Skip profile check and create profile directly
      console.log('Creating profile manually...');

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

      console.log('Attempting to insert profile with data:', profileData);

      // Try with regular supabase client first (more reliable)
      let insertData, insertError;

      try {
        const { data: profileResult, error: profileErr } = await supabase
          .from('profiles')
          .insert(profileData)
          .select();

        insertData = profileResult;
        insertError = profileErr;

        if (insertError) {
          console.error('Regular client profile creation failed:', insertError);

          // Check if we have a valid service role key before trying admin client
          const hasServiceRoleKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY &&
            process.env.SUPABASE_SERVICE_ROLE_KEY !==
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

          if (hasServiceRoleKey) {
            console.log('Trying admin client as fallback...');
            const { data: adminResult, error: adminErr } = await supabaseAdmin
              .from('profiles')
              .insert(profileData)
              .select();

            insertData = adminResult;
            insertError = adminErr;
          } else {
            console.warn(
              'No service role key available, skipping admin client fallback'
            );
            insertError = new Error(
              'Profile creation failed: No service role key available for admin operations'
            );
          }
        }

        if (insertError) {
          console.error('Profile creation failed:', insertError);
          toast.error('Profile Creation Failed', {
            description: `Failed to create user profile: ${insertError.message}`
          });
          throw new Error(`Profile creation failed: ${insertError.message}`);
        } else {
          console.log('Profile created successfully:', insertData);
        }
      } catch (profileCreationError) {
        console.error('Profile creation error:', profileCreationError);
        toast.error('Profile Creation Failed', {
          description: `Failed to create user profile: ${
            profileCreationError instanceof Error
              ? profileCreationError.message
              : 'Unknown error'
          }`
        });
        throw new Error(
          `Failed to create user profile: ${
            profileCreationError instanceof Error
              ? profileCreationError.message
              : 'Unknown error'
          }`
        );
      }

      // Automatically sign in the user after successful registration
      console.log('Auto-signing in user after registration...');
      try {
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
          });

        if (signInError) {
          console.error('Auto sign-in failed:', signInError);
          // Don't throw error, just log it - user can still proceed
        } else if (signInData.user && signInData.session) {
          console.log('Auto sign-in successful:', signInData.user.id);
        }
      } catch (signInErr) {
        console.error('Auto sign-in error:', signInErr);
        // Don't throw error, just log it
      }

      // Show success toast
      const isConfirmed = authData.user.email_confirmed_at;
      toast.success('Registration Successful!', {
        description: isConfirmed
          ? 'Account created successfully and ready to use!'
          : 'Account created successfully. Please check your email to verify your account.'
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

      // Add timeout to prevent hanging
      const loginPromise = supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login timeout')), 10000)
      );

      const { data: authData, error: authError } = (await Promise.race([
        loginPromise,
        timeoutPromise
      ])) as any;

      console.log('Auth login result:', { authError, user: authData.user?.id });
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

      // Get user profile data
      console.log('Fetching profile for user:', authData.user.id);
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

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
        'Login successful, returning user:',
        user?.id,
        'role:',
        user?.role,
        'onboarding:',
        user?.onboardingCompleted
      );
      return {
        success: true,
        message: 'Login successful',
        user,
        session: authData.session
      };
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

      // Get user profile data
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('User data fetch error:', userError);
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
        return { success: false, message: 'No session to refresh' };
      }

      // Get updated user data
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

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
