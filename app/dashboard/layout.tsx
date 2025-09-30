'use client';

import '../globals.css';
import { useAuth } from '@/hooks/useAuth';
import { OSCASidebar } from '@/components/osca-sidebar';
import { BASCASidebar } from '@/components/basca-sidebar';
import { SeniorSidebar } from '@/components/senior-sidebar';
import { MiniPWAStatus } from '@/components/ui/pwa-status';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, User, Bell } from 'lucide-react';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { authState } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!authState.isLoading) {
      if (!authState.isAuthenticated) {
        router.push('/');
        return;
      }

      // Check if user has a valid role
      if (!authState.user?.role) {
        router.push('/');
        return;
      }

      setIsLoading(false);
    }
  }, [authState, router]);

  // Show loading state while checking authentication
  if (isLoading || authState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#feffff] to-[#ffffff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00af8f] mx-auto mb-4"></div>
          <p className="text-[#666666]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate sidebar based on user role
  const renderSidebar = () => {
    const sidebarProps = {
      isOpen: sidebarOpen,
      onClose: () => setSidebarOpen(false)
    };

    switch (authState.user?.role) {
      case 'osca':
        return <OSCASidebar {...sidebarProps} />;
      case 'basca':
        return <BASCASidebar {...sidebarProps} />;
      case 'senior':
        return <SeniorSidebar {...sidebarProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#feffff] to-[#ffffff]">
      {renderSidebar()}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10 p-0">
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                OSCA Dashboard
              </h1>
              <p className="text-xs text-gray-500">
                Welcome, {authState.user?.firstName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 relative">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </Button>
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 bg-white">
          <div className="h-full">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
