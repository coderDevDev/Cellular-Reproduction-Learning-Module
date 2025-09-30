'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  GraduationCap as GraduationCapIcon,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  { icon: Home, label: 'Dashboard', href: '/teacher/dashboard' },
  { icon: GraduationCap, label: 'Classes', href: '/teacher/classes' },
  { icon: Target, label: 'VARK Modules', href: '/teacher/vark-modules' },
  { icon: BookOpen, label: 'Lessons', href: '/teacher/lessons' },
  { icon: FileText, label: 'Quizzes', href: '/teacher/quizzes' },
  { icon: Activity, label: 'Activities', href: '/teacher/activities' },
  { icon: Users, label: 'Students', href: '/teacher/students' },
  { icon: BarChart3, label: 'Analytics', href: '/teacher/analytics' },
  { icon: Settings, label: 'Settings', href: '/teacher/settings' }
];

export default function TeacherLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00af8f]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-lg flex items-center justify-center">
                <GraduationCapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CRLM</h1>
                <p className="text-sm text-gray-500">Teacher Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00af8f] to-[#00af90] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.firstName?.charAt(0) || user.fullName?.charAt(0) || 'T'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName || user.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="w-full justify-start text-gray-700 hover:text-red-600 hover:border-red-300">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        {/* <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold text-gray-900">
                  Teacher Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage your classes and students
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </Badge>
            </div>
          </div>
        </div> */}

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
