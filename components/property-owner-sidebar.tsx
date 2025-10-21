'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Building,
  Users,
  Wrench,
  Megaphone,
  History,
  MessageSquare,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import { useState } from 'react';

export function PropertyOwnerSidebar() {
  const { authState, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems = [
    {
      icon: Home,
      label: 'Dashboard',
      route: '/dashboard',
      description: 'Overview & analytics'
    },
    {
      icon: Building,
      label: 'Properties',
      route: '/dashboard/properties',
      description: 'Manage your properties',
      badge: '3 active'
    },
    {
      icon: Users,
      label: 'Tenants',
      route: '/dashboard/tenants',
      description: 'Tenant management',
      badge: '73 tenants'
    },
    {
      icon: Wrench,
      label: 'Maintenance',
      route: '/dashboard/maintenance',
      description: 'Repairs & requests',
      badge: '5 pending'
    },
    {
      icon: Megaphone,
      label: 'Announcements',
      route: '/dashboard/announcements',
      description: 'Property updates',
      badge: '2 new'
    },
    {
      icon: History,
      label: 'Transactions',
      route: '/dashboard/transactions',
      description: 'Payment history',
      badge: '156 records'
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      route: '/dashboard/messages',
      description: 'Tenant communication',
      badge: '12 unread'
    },
    {
      icon: Bell,
      label: 'Alerts',
      route: '/dashboard/alerts',
      description: 'Notifications',
      badge: '3 new'
    },
    {
      icon: Settings,
      label: 'Settings',
      route: '/dashboard/settings',
      description: 'Account preferences'
    },
    {
      icon: User,
      label: 'Profile',
      route: '/dashboard/profile',
      description: 'Personal information'
    }
  ];

  const handleSidebarItemClick = (route: string) => {
    router.push(route);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // Helper to determine if a sidebar item is active
  const isActive = (route: string) => {
    const normalize = (path: string) => path.replace(/\/+$/, '');
    return normalize(pathname) === normalize(route);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white shadow-2xl z-50">
        <div className="flex flex-col w-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  PropertyEase
                </h1>
                <p className="text-gray-500 text-sm">Management Portal</p>
              </div>
            </div>
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                  {authState.user?.firstName?.[0]}
                  {authState.user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-semibold text-sm truncate">
                  {authState.user?.firstName} {authState.user?.lastName}
                </p>
                <p className="text-gray-500 text-xs">Property Manager</p>
              </div>
            </div>
          </div>
          {/* Sidebar Navigation */}
          <div className="flex-1 p-4 overflow-y-auto">
            <nav className="space-y-1">
              {/* Dashboard Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                  Main
                </h3>
                {sidebarItems.slice(0, 1).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSidebarItemClick(item.route)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-gray-100 ${
                      isActive(item.route)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700'
                    }`}>
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive(item.route) ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {isActive(item.route) && (
                          <ChevronRight className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          isActive(item.route)
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              {/* Property Management Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                  Property Management
                </h3>
                {sidebarItems.slice(1, 3).map((item, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handleSidebarItemClick(item.route)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-gray-100 ${
                      isActive(item.route)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700'
                    }`}>
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive(item.route) ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {/* {item.badge && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">{item.badge}</Badge>
                        )} */}
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          isActive(item.route)
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              {/* Operations Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                  Operations
                </h3>
                {sidebarItems.slice(3, 5).map((item, index) => (
                  <button
                    key={index + 3}
                    onClick={() => handleSidebarItemClick(item.route)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-gray-100 ${
                      isActive(item.route)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700'
                    }`}>
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive(item.route) ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {/* {item.badge && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5">{item.badge}</Badge>
                        )} */}
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          isActive(item.route)
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              {/* Financial Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                  Financial
                </h3>
                {sidebarItems.slice(5, 6).map((item, index) => (
                  <button
                    key={index + 5}
                    onClick={() => handleSidebarItemClick(item.route)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-gray-100 ${
                      isActive(item.route)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700'
                    }`}>
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive(item.route) ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {/* {item.badge && (
                          <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5">{item.badge}</Badge>
                        )} */}
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          isActive(item.route)
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              {/* Communication Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                  Communication
                </h3>
                {sidebarItems.slice(6, 8).map((item, index) => (
                  <button
                    key={index + 6}
                    onClick={() => handleSidebarItemClick(item.route)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-gray-100 ${
                      isActive(item.route)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700'
                    }`}>
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive(item.route) ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {/* {item.badge && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5">
                            {item.badge}
                          </Badge>
                        )} */}
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          isActive(item.route)
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              {/* Settings Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                  Account
                </h3>
                {sidebarItems.slice(8, 10).map((item, index) => (
                  <button
                    key={index + 8}
                    onClick={() => handleSidebarItemClick(item.route)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-gray-100 ${
                      isActive(item.route)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700'
                    }`}>
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive(item.route) ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          isActive(item.route)
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </nav>
          </div>
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-all duration-200">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
