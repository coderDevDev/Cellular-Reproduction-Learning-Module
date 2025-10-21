'use client';

import React from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import type {
  User as CustomUser,
  AuthState,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData
} from '@/types/auth';
import { AuthAPI } from '@/lib/api/auth';
import { ProfileAPI } from '@/lib/api/profiles';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext<{
  authState: AuthState;
  user: CustomUser | null;
  login: (
    email: string,
    password: string,
    role?: 'student' | 'teacher'
  ) => Promise<{ success: boolean; message: string; user?: CustomUser }>;
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (
    data: ForgotPasswordData
  ) => Promise<{ success: boolean; message: string }>;
  updateProfile: (
    updates: Partial<CustomUser>
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  clearError: () => void;
} | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Check for current user on mount
    const checkCurrentUser = async () => {
      try {
        console.log('🔍 Starting auth check...');
        
        // Add timeout to prevent hanging (increased to 8 seconds for slow connections)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => {
            console.warn('⏱️ Auth check taking longer than expected...');
            reject(new Error('Auth check timeout'));
          }, 8000)
        );
        
        const authPromise = AuthAPI.getCurrentUser();
        
        // Race between auth check and timeout
        const result = await Promise.race([authPromise, timeoutPromise]);
        const { user, session } = result as any;

        if (user && session) {
          console.log('✅ User authenticated:', {
            id: user.id,
            email: user.email,
            role: user.role
          });

          setAuthState({
            user: user as CustomUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          console.log('❌ No authenticated user found');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      } catch (error: any) {
        if (error.message === 'Auth check timeout') {
          console.error('⚠️ Auth check timed out - possible slow connection or database issue');
          console.log('→ Treating as not authenticated');
        } else {
          console.error('⚠️ Error checking current user:', error);
        }
        
        // Set loading to false and treat as not authenticated
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error.message || 'Authentication check failed'
        });
      }
    };

    checkCurrentUser();

    // Set up session refresh interval
    const refreshInterval = setInterval(async () => {
      try {
        const { user, session } = await AuthAPI.getCurrentUser();
        if (user && session) {
          setAuthState(prev => ({
            ...prev,
            user: user as CustomUser,
            isAuthenticated: true,
            error: null
          }));
        } else {
          // Session expired, clear auth state
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Session refresh error:', error);
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      if (event === 'SIGNED_IN' && session) {
        const { user } = await AuthAPI.getCurrentUser();
        if (user) {
          setAuthState({
            user: user as CustomUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        const { user } = await AuthAPI.getCurrentUser();
        if (user) {
          setAuthState(prev => ({
            ...prev,
            user: user as CustomUser,
            isAuthenticated: true,
            error: null
          }));
        }
      }
    });

    return () => {
      clearInterval(refreshInterval);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string,
    role?: 'student' | 'teacher'
  ): Promise<{ success: boolean; message: string; user?: CustomUser }> => {
    console.log('useAuth login called with:', { email, role });
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const credentials: LoginCredentials = role
        ? { email, password, role }
        : { email, password };
      console.log('Calling AuthAPI.login with credentials:', credentials);
      const result = await AuthAPI.login(credentials);

      console.log('AuthAPI.login returned:', result);
      if (result.success && result.user) {
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message
        }));
      }

      const returnValue = {
        success: result.success,
        message: result.message,
        user: result.user || undefined
      };
      console.log('useAuth login returning:', returnValue);
      return returnValue;
    } catch (error) {
      console.log('useAuth login error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      const errorReturn = { success: false, message: errorMessage };
      console.log('useAuth login returning error:', errorReturn);
      return errorReturn;
    }
  };

  const register = async (
    data: RegisterData
  ): Promise<{ success: boolean; message: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await AuthAPI.register(data);

      if (result.success && result.user) {
        console.log(
          'Registration successful, setting user in auth state:',
          result.user
        );
        // Auto-login after successful registration for immediate onboarding
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        console.log('Registration failed:', result.message);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message
        }));
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, message: errorMessage };
    }
  };

  const forgotPassword = async (
    data: ForgotPasswordData
  ): Promise<{ success: boolean; message: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await AuthAPI.resetPassword(data.email);

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Password reset failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    // ⚡ Optimistic update: Clear local state immediately for instant UX
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });

    // Sign out from server in background (don't wait)
    AuthAPI.logout().catch(error => {
      console.error('⚠️ Background logout error (state already cleared):', error);
    });
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const updateProfile = async (
    updates: Partial<CustomUser>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Use ProfileAPI for profile updates
      const result = await ProfileAPI.updateProfile(updates as any);

      if (result.success && result.user) {
        setAuthState(prev => ({
          ...prev,
          user: result.user || null
        }));
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Profile update failed';
      return { success: false, message: errorMessage };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        user: authState.user,
        login,
        register,
        forgotPassword,
        updateProfile,
        logout,
        clearError
      }}>
      {children}
    </AuthContext.Provider>
  );
}
