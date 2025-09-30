'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
  Calendar,
  Activity,
  GraduationCap,
  BarChart3,
  Settings,
  Menu,
  X,
  Home
} from 'lucide-react';

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard/basca',
    icon: Home,
    description: 'Main dashboard and member management'
  },
  {
    name: 'Meetings',
    href: '/dashboard/basca/meetings',
    icon: Calendar,
    description: 'Manage meetings and track attendance'
  },
  {
    name: 'Activities',
    href: '/dashboard/basca/activities',
    icon: Activity,
    description: 'Health campaigns and community outreach'
  },
  {
    name: 'Training',
    href: '/dashboard/basca/training',
    icon: GraduationCap,
    description: 'Training sessions and certifications'
  },
  {
    name: 'Reports',
    href: '/dashboard/basca/reports',
    icon: BarChart3,
    description: 'Analytics and performance insights'
  },
  {
    name: 'Settings',
    href: '/dashboard/basca/settings',
    icon: Settings,
    description: 'BASCA configuration and preferences'
  }
];

export default function BASCALayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] via-[#F0EDE8] to-[#00af8f]/20">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
          <Menu className="w-5 h-5" />
        </Button>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/20"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-[#333333]">
                  BASCA Navigation
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="p-4 space-y-2">
                {navigation.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#00af8f] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm opacity-75">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/90 backdrop-blur-sm border-r border-[#E0DDD8] shadow-lg">
          <div className="flex items-center h-16 px-6 border-b border-[#E0DDD8]">
            <h1 className="text-xl font-bold text-[#333333]">
              BASCA Management
            </h1>
          </div>
          <nav className="flex-1 px-6 py-4 space-y-2">
            {navigation.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#00af8f] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                  <Icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div
                      className={`text-sm ${
                        isActive ? 'opacity-90' : 'opacity-75'
                      }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Quick Stats */}
          <div className="p-6 border-t border-[#E0DDD8]">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Total Members</span>
                <span className="font-medium">Loading...</span>
              </div>
              <div className="flex justify-between">
                <span>Active Projects</span>
                <span className="font-medium">Loading...</span>
              </div>
              <div className="flex justify-between">
                <span>This Month</span>
                <span className="font-medium">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        <main className="py-6">{children}</main>
      </div>
    </div>
  );
}
