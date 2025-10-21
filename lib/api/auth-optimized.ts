/**
 * OPTIMIZED LOGIN STRATEGY
 * 
 * Instead of waiting for profile fetch, this approach:
 * 1. Authenticates user instantly
 * 2. Returns basic auth data immediately
 * 3. Fetches full profile in background
 * 
 * Result: Login feels instant (< 2s)
 */

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { User } from '@/types/auth';

export class OptimizedAuthAPI {
  /**
   * Fast login - returns immediately after auth, fetches profile in background
   */
  static async loginFast(credentials: { email: string; password: string; role?: string }) {
    try {
      // Step 1: Authenticate (fast - 1-3s)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (authError || !authData.user) {
        toast.error('Login Failed', {
          description: authError?.message || 'Invalid credentials'
        });
        return { success: false, message: authError?.message || 'Login failed' };
      }

      // Step 2: Return immediately with basic user info from auth metadata
      const basicUser: Partial<User> = {
        id: authData.user.id,
        email: authData.user.email!,
        role: authData.user.user_metadata?.role || credentials.role || 'student',
        firstName: authData.user.user_metadata?.first_name,
        lastName: authData.user.user_metadata?.last_name,
        learningStyle: authData.user.user_metadata?.learning_style,
        gradeLevel: authData.user.user_metadata?.grade_level
      };

      // Step 3: Fetch full profile in background (don't wait)
      this.fetchProfileInBackground(authData.user.id);

      toast.success('Login Successful!', {
        description: `Welcome back, ${basicUser.firstName || basicUser.email}!`
      });

      return {
        success: true,
        message: 'Login successful',
        user: basicUser as User,
        session: authData.session,
        profileLoading: true // Indicate profile is still loading
      };
    } catch (error) {
      console.error('Fast login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Fetch full profile in background (non-blocking)
   */
  private static async fetchProfileInBackground(userId: string) {
    try {
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('id, email, role, first_name, middle_name, last_name, full_name, profile_photo, learning_style, grade_level, onboarding_completed, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (!error && userData) {
        // Trigger a custom event that useAuth can listen to
        window.dispatchEvent(
          new CustomEvent('profile-loaded', { detail: userData })
        );
        console.log('✅ Full profile loaded in background');
      }
    } catch (error) {
      console.warn('Background profile fetch failed:', error);
    }
  }

  /**
   * Hybrid approach: Show loading state but proceed faster
   */
  static async loginWithProgress(
    credentials: { email: string; password: string; role?: string },
    onProgress?: (stage: string) => void
  ) {
    try {
      onProgress?.('Authenticating...');
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (authError || !authData.user) {
        return { success: false, message: authError?.message || 'Login failed' };
      }

      onProgress?.('Loading profile...');

      // Fetch profile with shorter timeout
      const profilePromise = supabase
        .from('profiles')
        .select('id, email, role, first_name, middle_name, last_name, full_name, profile_photo, learning_style, grade_level, onboarding_completed, created_at, updated_at')
        .eq('id', authData.user.id)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile timeout')), 5000)
      );

      try {
        const { data: userData } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;

        onProgress?.('Complete!');
        
        return {
          success: true,
          user: this.mapUserData(userData),
          session: authData.session
        };
      } catch (profileError) {
        // If profile times out, return basic info
        console.warn('Profile fetch slow, using basic info');
        onProgress?.('Complete (using cached data)');
        
        return {
          success: true,
          user: {
            id: authData.user.id,
            email: authData.user.email!,
            role: authData.user.user_metadata?.role || 'student'
          } as User,
          session: authData.session,
          profileIncomplete: true
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  private static mapUserData(userData: any): User {
    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      firstName: userData.first_name,
      middleName: userData.middle_name,
      lastName: userData.last_name,
      fullName: userData.full_name,
      profilePhoto: userData.profile_photo,
      learningStyle: userData.learning_style,
      gradeLevel: userData.grade_level,
      onboardingCompleted: userData.onboarding_completed,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at
    };
  }
}
