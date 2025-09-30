'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, User } from 'lucide-react';
import { StudentSidebar } from '@/components/student-sidebar';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function StudentLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      console.log('Starting logout process from mobile header...');

      await logout();

      console.log('Logout successful, redirecting to home...');
      toast.success('Successfully signed out');

      // Redirect to home page after successful logout
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <StudentSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName || user?.firstName || 'Student'}
                </span>
                <p className="text-xs text-gray-500 truncate">Student Portal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="p-2 text-gray-600 hover:text-red-600 disabled:opacity-50">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
