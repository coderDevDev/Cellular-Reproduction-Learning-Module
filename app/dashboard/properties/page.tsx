'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PropertyManagement } from '@/components/properties';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PropertiesPage() {
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!authState.isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authState.isAuthenticated, router]);

  // Show loading while checking authentication
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Desktop decorations */}
        <div className="hidden lg:block absolute top-20 right-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="hidden lg:block absolute bottom-20 left-20 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 lg:p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 lg:h-20 lg:w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6 lg:mb-8"></div>
                <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
                  Loading Properties
                </h2>
                <p className="text-gray-600 text-base lg:text-lg">
                  Please wait while we load your property data...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show loading (will redirect)
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Desktop decorations */}
        <div className="hidden lg:block absolute top-20 right-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="hidden lg:block absolute bottom-20 left-20 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 lg:p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 lg:h-20 lg:w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6 lg:mb-8"></div>
                <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
                  Redirecting
                </h2>
                <p className="text-gray-600 text-base lg:text-lg">
                  Taking you to the login page...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Only allow property owners to access this page
  if (authState.user?.role !== 'owner') {
    router.push('/dashboard');
    return null;
  }

  return <PropertyManagement onBack={() => router.push('/dashboard')} />;
}
