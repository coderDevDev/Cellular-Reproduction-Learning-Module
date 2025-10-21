'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, LogOut, User, X } from 'lucide-react';
import { StudentSidebar } from '@/components/student-sidebar';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { usePathname } from 'next/navigation';

export default function StudentLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [lottieError, setLottieError] = useState(false);
  const { user, logout, authState } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Redirect to login if not authenticated after loading completes
  useEffect(() => {
    if (!authState.isLoading && !user) {
      console.log(
        '❌ No user detected after auth loaded, redirecting to login...'
      );
      toast.error('Please log in to access the student dashboard');
      router.push('/auth/login/');
    }
  }, [authState.isLoading, user, router]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);

    // Logout clears state instantly (optimistic)
    logout();

    // Show feedback and redirect immediately
    toast.success('Successfully signed out');
    router.push('/');
  };

  // Show loading spinner only while auth is loading
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              Loading CRLM
            </h3>
            <p className="text-gray-600">
              Preparing your learning experience...
            </p>
            <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto mt-4">
              <div className="w-1/3 h-full bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 relative overflow-hidden">
      {/* Enhanced Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-[#00af8f]/10 to-[#00af8f]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#00af8f]/8 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="hidden lg:block absolute top-40 right-40 w-64 h-64 bg-gradient-to-r from-teal-400/8 to-[#00af8f]/8 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Enhanced Sidebar */}
      <StudentSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        lottieError={lottieError}
        setLottieError={setLottieError}
      />

      {/* Main Content */}
      <div className="lg:ml-64 relative z-10">
        {/* Enhanced Mobile Top Bar */}
        <header className="lg:hidden bg-gradient-to-r from-white via-white to-teal-50/10 backdrop-blur-sm border-b border-teal-100/30 shadow-sm px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl bg-gradient-to-r from-[#00af8f]/10 to-teal-400/10 border border-[#00af8f]/20 hover:from-[#00af8f]/20 hover:to-teal-400/20 transition-all duration-300">
                <Menu className="w-5 h-5 text-[#00af8f]" />
              </Button>
              <div className="flex items-center space-x-3">
                {/* Lottie Logo */}
                <div className="w-8 h-8 relative">
                  {!lottieError ? (
                    <DotLottieReact
                      src="https://lottie.host/471336af-ae85-416e-b9bc-c910d6bd398e/7iNaBjvF63.lottie"
                      loop
                      autoplay
                      className="w-full h-full"
                      onError={() => {
                        console.log(
                          'Mobile header Lottie animation failed to load, showing fallback'
                        );
                        setLottieError(true);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-lg flex items-center justify-center shadow-lg">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-[#00af8f] to-gray-900 bg-clip-text text-transparent">
                    CRLM
                  </h1>
                  <p className="text-xs text-gray-500">Student Portal</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Online
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="p-2 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all duration-300">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">{children}</div>
      </div>
    </div>
  );
}
