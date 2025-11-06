'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Home,
  GraduationCap,
  BookOpen,
  FileText,
  Activity,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap as GraduationCapIcon,
  Target,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { toast } from 'sonner';

const navigationItems = [
  { icon: Home, label: 'Dashboard', href: '/teacher/dashboard' },
  // { icon: BookOpen, label: 'Lessons', href: '/teacher/lessons' },
  // { icon: GraduationCap, label: 'Classes', href: '/teacher/classes' },
  { icon: Target, label: 'VARK Modules', href: '/teacher/vark-modules' },
  { icon: FileText, label: 'Student Submissions', href: '/teacher/submissions' },
  { icon: Users, label: 'Students', href: '/teacher/students' },
  // { icon: FileText, label: 'Quizzes', href: '/teacher/quizzes' },
  // { icon: Activity, label: 'Activities', href: '/teacher/activities' },
  // { icon: Users, label: 'Students', href: '/teacher/students' },
  { icon: Settings, label: 'My Profile', href: '/teacher/profile' }
  // { icon: BarChart3, label: 'Analytics', href: '/teacher/analytics' },
];

export default function TeacherLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, logout, authState } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lottieError, setLottieError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
      toast.error('Please log in to access the teacher dashboard');
      router.push('/auth/login');
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
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              Loading CRLM
            </h3>
            <p className="text-gray-600">
              Preparing your teaching experience...
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

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white via-white to-teal-50/5 backdrop-blur-sm border-r border-teal-100/30 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* Sidebar Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-teal-50/3 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,175,143,0.02),transparent_50%)]"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Enhanced Sidebar Header */}
          <div className="p-6 border-b border-teal-100/30">
            <div className="flex items-center space-x-3">
              {/* Lottie Logo */}
              <div className="w-12 h-12 relative">
                {!lottieError ? (
                  <DotLottieReact
                    src="https://lottie.host/471336af-ae85-416e-b9bc-c910d6bd398e/7iNaBjvF63.lottie"
                    loop
                    autoplay
                    className="w-full h-full"
                    onError={() => {
                      console.log(
                        'Sidebar Lottie animation failed to load, showing fallback'
                      );
                      setLottieError(true);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-2xl flex items-center justify-center shadow-xl">
                    <GraduationCapIcon className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-[#00af8f] to-gray-900 bg-clip-text text-transparent">
                  CRLM
                </h1>
                <p className="text-sm text-gray-500">Teacher Portal</p>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00af8f] to-[#00af90] text-white shadow-lg shadow-[#00af8f]/25'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-[#00af8f]/5 hover:text-gray-900 hover:shadow-md'
                  }`}
                  onClick={() => setSidebarOpen(false)}>
                  <Icon
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-600 group-hover:text-[#00af8f] group-hover:scale-110'
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Enhanced User Profile & Logout */}
          <div className="p-4 border-t border-teal-100/30">
            <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-teal-50/50">
              <div className="relative">
                <Avatar className="w-12 h-12 ring-2 ring-teal-100 shadow-lg">
                  <AvatarImage src={user?.profilePhoto} />
                  <AvatarFallback className="bg-gradient-to-br from-[#00af8f] to-[#00af90] text-white font-semibold">
                    {user?.firstName?.charAt(0) ||
                      user?.fullName?.charAt(0) ||
                      'T'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName || user?.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isLoggingOut}
                  className="w-full justify-start text-gray-700 hover:text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-50 transition-all duration-300 border-teal-200 hover:shadow-md">
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing Out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <span>Sign Out</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600">
                    Are you sure you want to sign out? You'll need to log in
                    again to access your account and continue your teaching
                    activities.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel disabled={isLoggingOut} className="flex-1">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    {isLoggingOut ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing Out...</span>
                      </div>
                    ) : (
                      'Sign Out'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 relative z-10">
        {/* Enhanced Mobile Top Bar */}
        <div className="lg:hidden bg-gradient-to-r from-white via-white to-teal-50/10 backdrop-blur-sm border-b border-teal-100/30 shadow-sm px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl bg-gradient-to-r from-[#00af8f]/10 to-teal-400/10 border border-[#00af8f]/20 hover:from-[#00af8f]/20 hover:to-teal-400/20 transition-all duration-300">
                <Menu className="w-5 h-5 text-[#00af8f]" />
              </Button>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-[#00af8f] to-gray-900 bg-clip-text text-transparent">
                  CRLM
                </h1>
                <p className="text-xs text-gray-500">Teacher Portal</p>
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
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-6">{children}</div>
      </div>
    </div>
  );
}
