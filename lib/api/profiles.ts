import { supabase, supabaseAdmin } from '@/lib/supabase';
import type { User } from '@/types/auth';

export interface ProfileUpdateData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  gradeLevel?: string;
  profilePhoto?: string;
  learningStyle?: string;
  onboardingCompleted?: boolean;
}

export interface ProfileUpdateResult {
  success: boolean;
  message: string;
  user?: User;
}

export class ProfileAPI {
  /**
   * Update user profile information
   */
  static async updateProfile(
    updates: ProfileUpdateData
  ): Promise<ProfileUpdateResult> {
    try {
      console.log('ProfileAPI.updateProfile called with:', updates);

      // Get current user ID from auth
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser();

      if (!authUser) {
        return {
          success: false,
          message: 'User not authenticated'
        };
      }

      // Extract the fields that should be updated in the profiles table
      const profileUpdates: any = {};

      if (updates.firstName !== undefined)
        profileUpdates.first_name = updates.firstName;
      if (updates.middleName !== undefined)
        profileUpdates.middle_name = updates.middleName;
      if (updates.lastName !== undefined)
        profileUpdates.last_name = updates.lastName;
      if (updates.fullName !== undefined)
        profileUpdates.full_name = updates.fullName;
      if (updates.gradeLevel !== undefined)
        profileUpdates.grade_level = updates.gradeLevel;
      if (updates.profilePhoto !== undefined)
        profileUpdates.profile_photo = updates.profilePhoto;
      if (updates.learningStyle !== undefined)
        profileUpdates.learning_style = updates.learningStyle;
      if (updates.onboardingCompleted !== undefined)
        profileUpdates.onboarding_completed = updates.onboardingCompleted;

      console.log('Profile updates to apply:', profileUpdates);

      console.log('Updating profile with ID:', authUser.id);
      // Use regular client for profile updates (RLS should allow users to update their own profiles)
      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', authUser.id)
        .select('*')
        .single();

      console.log('Profile update result:', { data, error });

      if (error) {
        console.error('Profile update error:', error);
        return {
          success: false,
          message: error.message || 'Failed to update profile'
        };
      }

      if (!data) {
        return {
          success: false,
          message: 'Profile not found'
        };
      }

      // Convert the database result to our User type
      const updatedUser: User = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        middleName: data.middle_name,
        lastName: data.last_name,
        fullName: data.full_name,
        role: data.role,
        gradeLevel: data.grade_level,
        profilePhoto: data.profile_photo,
        learningStyle: data.learning_style,
        onboardingCompleted: data.onboarding_completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      console.log('Profile updated successfully:', updatedUser);

      return {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      };
    } catch (error) {
      console.error('Profile update exception:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to update profile'
      };
    }
  }

  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string): Promise<ProfileUpdateResult> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return {
          success: false,
          message: error.message || 'Failed to fetch profile'
        };
      }

      if (!data) {
        return {
          success: false,
          message: 'Profile not found'
        };
      }

      const user: User = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        middleName: data.middle_name,
        lastName: data.last_name,
        fullName: data.full_name,
        role: data.role,
        gradeLevel: data.grade_level,
        profilePhoto: data.profile_photo,
        learningStyle: data.learning_style,
        onboardingCompleted: data.onboarding_completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return {
        success: true,
        message: 'Profile fetched successfully',
        user
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch profile'
      };
    }
  }

  /**
   * Update user password (requires current password verification)
   */
  static async updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ProfileUpdateResult> {
    try {
      // First verify the current password
      const { error: verifyError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (verifyError) {
        return {
          success: false,
          message: verifyError.message || 'Failed to update password'
        };
      }

      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to update password'
      };
    }
  }
}
