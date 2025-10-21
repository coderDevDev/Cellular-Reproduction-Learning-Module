'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History, TrendingUp, DollarSign } from 'lucide-react';

export default function TransactionsPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show loading (will redirect)
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Only allow property owners to access this page
  if (authState.user?.role !== 'owner') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-xl">
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-white hover:bg-white/10 p-2 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white font-semibold text-lg">Transactions</h1>
              <p className="text-white/70 text-sm">
                View payment history and reports
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <History className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Transaction History
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Track all payment transactions and generate reports
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:shadow-lg">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Reports
            </Button>
            <Button
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <DollarSign className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
