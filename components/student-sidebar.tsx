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
  Award,
  HelpCircle,
  LogOut,
  PlayCircle,
  Lightbulb,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { toast } from 'sonner';

interface StudentSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { icon: Home, label: 'Dashboard', href: '/student/dashboard' },
  { icon: Target, label: 'VARK Modules', href: '/student/vark-modules' },
  { icon: BookOpen, label: 'My Classes', href: '/student/classes' },
  { icon: Activity, label: 'Activities', href: '/student/activities' },
  { icon: FileText, label: 'Quizzes', href: '/student/quizzes' },
  { icon: TrendingUp, label: 'Progress', href: '/student/progress' },
  { icon: Trophy, label: 'Achievements', href: '/student/achievements' },
  { icon: Calendar, label: 'Schedule', href: '/student/schedule' },
  { icon: Settings, label: 'Settings', href: '/student/settings' }
];

const quickActions = [
  {
    icon: PlayCircle,
    label: 'Continue Learning',
    href: '/student/vark-modules'
  },
  { icon: Target, label: 'Take Assessment', href: '/student/assessment' },
  { icon: Lightbulb, label: 'Learning Tips', href: '/student/tips' }
];

export function StudentSidebar({ isOpen, onToggle }: StudentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      console.log('Starting logout process...');

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
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Header - Fixed */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#00af8f] to-[#00af90] flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CRLM</h1>
                <p className="text-sm text-white/80">Student Portal</p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 relative">
            {/* User Profile Section */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-14 h-14 ring-2 ring-gray-100">
                    <AvatarImage src={user?.profilePhoto} />
                    <AvatarFallback className="bg-[#00af8f] text-white text-lg font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {user?.fullName ||
                      user?.firstName ||
                      user?.email ||
                      'Student'}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {user?.email || 'student@example.com'}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-1 bg-[#00af8f]/10 text-[#00af8f] border-0">
                      {user?.learningStyle || 'Visual'} Learner
                    </Badge>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {/* <div className="px-4 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50/50 to-white">
              <div className="flex items-center space-x-2 mb-4 px-2">
                <div className="w-2 h-2 bg-[#00af8f] rounded-full"></div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Quick Actions
                </h3>
              </div>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const colors = [
                    'from-blue-500 to-blue-600',
                    'from-purple-500 to-purple-600',
                    'from-green-500 to-green-600'
                  ];
                  const bgColors = [
                    'from-blue-50 to-blue-100',
                    'from-purple-50 to-purple-100',
                    'from-green-50 to-green-100'
                  ];
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex items-center space-x-4 px-4 py-4 rounded-2xl text-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300 group bg-white border border-gray-100"
                      onClick={() => onToggle()}>
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${
                          bgColors[index % bgColors.length]
                        } rounded-xl flex items-center justify-center group-hover:shadow-md transition-all duration-300`}>
                        <Icon
                          className={`w-6 h-6 text-[#00af8f] group-hover:scale-110 transition-transform duration-300`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-[#00af8f] transition-colors duration-300">
                          {action.label}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {action.label === 'Continue Learning'
                            ? 'Resume your progress'
                            : action.label === 'Take Assessment'
                            ? 'Discover your style'
                            : 'Get personalized tips'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#00af8f] group-hover:translate-x-1 transition-all duration-300" />
                    </Link>
                  );
                })}
              </div>
            </div> */}

            {/* Navigation */}
            <nav className="px-4 py-6 space-y-1">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-[#00af8f] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => onToggle()}>
                    <Icon
                      className={`w-5 h-5 ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-500 group-hover:text-gray-700'
                      }`}
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer Links */}
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="space-y-1">
                <Link
                  href="/help"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-sm">Help & Support</span>
                </Link>
                <Link
                  href="/feedback"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">Feedback</span>
                </Link>
              </div>
            </div>

            {/* Scroll Fade Indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          </div>

          {/* Account Actions - Fixed at Bottom */}
          <div className="px-4 py-4 border-t border-gray-200 bg-white flex-shrink-0">
            {/* Logout Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isLoggingOut}
                  className="w-full justify-start text-gray-700 hover:text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-50 transition-all duration-200">
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
