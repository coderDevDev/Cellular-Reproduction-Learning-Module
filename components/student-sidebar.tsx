'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  BookOpen,
  Target,
  FileText,
  Activity,
  Settings,
  Trophy,
  Calendar,
  TrendingUp,
  LogOut,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { toast } from 'sonner';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface StudentSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  lottieError?: boolean;
  setLottieError?: (error: boolean) => void;
}

const navigationItems = [
  { icon: Home, label: 'Dashboard', href: '/student/dashboard' },
  { icon: Target, label: 'VARK Modules', href: '/student/vark-modules' },
  // { icon: BookOpen, label: 'My Classes', href: '/student/classes' },
  // { icon: Activity, label: 'Activities', href: '/student/activities' },
  // { icon: FileText, label: 'Quizzes', href: '/student/quizzes' },
  // { icon: TrendingUp, label: 'Progress', href: '/student/progress' },
  // { icon: Trophy, label: 'Achievements', href: '/student/achievements' },
  // { icon: Calendar, label: 'Schedule', href: '/student/schedule' },
  { icon: Settings, label: 'My Profile', href: '/student/profile' }
];

export function StudentSidebar({
  isOpen,
  onToggle,
  lottieError = false,
  setLottieError
}: StudentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    
    // Logout clears state instantly (optimistic)
    logout();
    
    // Show feedback and redirect immediately
    toast.success('Successfully signed out');
    router.push('/');
  };

  return (
    <>
      {/* Enhanced Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Enhanced Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white via-white to-teal-50/5 backdrop-blur-sm border-r border-teal-100/30 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
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
                        'Student sidebar Lottie animation failed to load, showing fallback'
                      );
                      setLottieError?.(true);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-2xl flex items-center justify-center shadow-xl">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-[#00af8f] to-gray-900 bg-clip-text text-transparent">
                  CRLM
                </h1>
                <p className="text-sm text-gray-500">Student Portal</p>
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
                  onClick={() => onToggle()}>
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
                      user?.email?.charAt(0).toUpperCase() ||
                      'S'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName ||
                    user?.fullName ||
                    user?.email ||
                    'Student'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'student@example.com'}
                </p>
                {user?.learningType && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 mt-1 bg-gradient-to-r from-indigo-500/10 to-purple-400/10 text-indigo-600 border border-indigo-500/20">
                    {user.learningType}
                  </Badge>
                )}
                {user?.preferredModules && user.preferredModules.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.preferredModules.slice(0, 2).map((module: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs px-1.5 py-0 bg-gradient-to-r from-[#00af8f]/10 to-teal-400/10 text-[#00af8f] border border-[#00af8f]/20">
                        {module}
                      </Badge>
                    ))}
                    {user.preferredModules.length > 2 && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0 bg-gray-100 text-gray-600">
                        +{user.preferredModules.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
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
                    again to access your account and continue your learning
                    journey.
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
    </>
  );
}
