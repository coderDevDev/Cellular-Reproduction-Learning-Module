'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Redirect based on user role
    if (authState.user) {
      const userRole = authState.user.role;

      switch (userRole) {
        case 'osca':
          router.push('/dashboard/osca');
          break;
        case 'basca':
          router.push('/dashboard/basca');
          break;
        case 'senior':
          router.push('/dashboard/senior');
          break;
        default:
          // Fallback to role selection
          router.push('/');
      }
    }
  }, [authState.isAuthenticated, authState.user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00af8f] mx-auto mb-4"></div>
        <p className="text-[#666666]">Loading dashboard...</p>
      </div>
    </div>
  );
}
