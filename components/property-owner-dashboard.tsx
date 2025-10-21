'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Menu,
  MessageSquare,
  Bell,
  Building,
  User,
  Megaphone,
  History,
  Settings,
  Users,
  Wrench,
  ArrowLeft,
  LogOut,
  TrendingUp,
  DollarSign,
  Calendar,
  X,
  ChevronRight,
  BarChart3,
  FileText,
  CreditCard
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function PropertyOwnerDashboard() {
  const { authState, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime] = useState(
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  );

  const quickActions = [
    {
      icon: Building,
      label: 'Properties',
      color: 'from-blue-500 to-blue-600',
      route: '/dashboard/properties',
      count: '3'
    },
    {
      icon: Users,
      label: 'Tenants',
      color: 'from-purple-500 to-purple-600',
      route: '/dashboard/tenants',
      count: '73'
    },
    {
      icon: Wrench,
      label: 'Maintenance',
      color: 'from-orange-500 to-orange-600',
      route: '/dashboard/maintenance',
      count: '5'
    },
    {
      icon: Megaphone,
      label: 'Announcements',
      color: 'from-green-500 to-green-600',
      route: '/dashboard/announcements',
      count: '2'
    },
    {
      icon: History,
      label: 'Transactions',
      color: 'from-indigo-500 to-indigo-600',
      route: '/dashboard/transactions',
      count: '156'
    },
    {
      icon: Settings,
      label: 'Settings',
      color: 'from-gray-500 to-gray-600',
      route: '/dashboard/settings',
      count: ''
    }
  ];

  const sidebarItems = [
    // Main Dashboard
    {
      icon: Home,
      label: 'Dashboard',
      route: '/dashboard',
      active: true,
      description: 'Overview & analytics'
    },

    // Property Management
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

    // Operations
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

    // Financial
    {
      icon: History,
      label: 'Transactions',
      route: '/dashboard/transactions',
      description: 'Payment history',
      badge: '156 records'
    },

    // Communication
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

    // Settings
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

  const handleActionClick = (route: string) => {
    router.push(route);
  };

  const handleSidebarItemClick = (route: string) => {
    router.push(route);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
          <div className="flex-1 p-4">
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
                      item.active
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700'
                    }`}>
                    <item.icon
                      className={`w-5 h-5 ${
                        item.active ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.active && (
                          <ChevronRight className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          item.active ? 'text-blue-600' : 'text-gray-500'
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
                      item.active
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700'
                    }`}>
                    <item.icon
                      className={`w-5 h-5 ${
                        item.active ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          item.active ? 'text-blue-600' : 'text-gray-500'
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
                      item.active
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700'
                    }`}>
                    <item.icon
                      className={`w-5 h-5 ${
                        item.active ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          item.active ? 'text-blue-600' : 'text-gray-500'
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
                      item.active
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700'
                    }`}>
                    <item.icon
                      className={`w-5 h-5 ${
                        item.active ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          item.active ? 'text-blue-600' : 'text-gray-500'
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
                      item.active
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700'
                    }`}>
                    <item.icon
                      className={`w-5 h-5 ${
                        item.active ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          item.active ? 'text-blue-600' : 'text-gray-500'
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
                      item.active
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700'
                    }`}>
                    <item.icon
                      className={`w-5 h-5 ${
                        item.active ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          item.active ? 'text-blue-600' : 'text-gray-500'
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

      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-xl">
        <div className="px-4 pt-12 pb-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-white/70 text-sm font-medium">
                {currentTime}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 p-2 rounded-xl relative">
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="text-white hover:bg-white/10 p-2 rounded-xl">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* User Info Row */}
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-white/30 shadow-lg">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                {authState.user?.firstName?.[0]}
                {authState.user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold text-lg">
                {authState.user?.firstName} {authState.user?.lastName}
              </p>
              <p className="text-white/70 text-sm">Property Manager</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Mobile Sidebar Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-xl">
                    <X className="w-5 h-5" />
                  </Button>
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

              {/* Mobile Sidebar Navigation */}
              <div className="flex-1 p-4">
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
                          item.active
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700'
                        }`}>
                        <item.icon
                          className={`w-5 h-5 ${
                            item.active ? 'text-blue-600' : 'text-gray-500'
                          }`}
                        />
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.label}</span>
                            {item.active && (
                              <ChevronRight className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <p
                            className={`text-xs mt-0.5 ${
                              item.active ? 'text-blue-600' : 'text-gray-500'
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
                          item.active
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700'
                        }`}>
                        <item.icon
                          className={`w-5 h-5 ${
                            item.active ? 'text-blue-600' : 'text-gray-500'
                          }`}
                        />
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.label}</span>
                            {item.badge && (
                              <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p
                            className={`text-xs mt-0.5 ${
                              item.active ? 'text-blue-600' : 'text-gray-500'
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
                          item.active
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700'
                        }`}>
                        <item.icon
                          className={`w-5 h-5 ${
                            item.active ? 'text-blue-600' : 'text-gray-500'
                          }`}
                        />
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.label}</span>
                            {item.badge && (
                              <Badge className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p
                            className={`text-xs mt-0.5 ${
                              item.active ? 'text-blue-600' : 'text-gray-500'
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
                          item.active
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700'
                        }`}>
                        <item.icon
                          className={`w-5 h-5 ${
                            item.active ? 'text-blue-600' : 'text-gray-500'
                          }`}
                        />
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.label}</span>
                            {item.badge && (
                              <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p
                            className={`text-xs mt-0.5 ${
                              item.active ? 'text-blue-600' : 'text-gray-500'
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
                          item.active
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700'
                        }`}>
                        <item.icon
                          className={`w-5 h-5 ${
                            item.active ? 'text-blue-600' : 'text-gray-500'
                          }`}
                        />
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.label}</span>
                            {item.badge && (
                              <Badge className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p
                            className={`text-xs mt-0.5 ${
                              item.active ? 'text-blue-600' : 'text-gray-500'
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
                          item.active
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700'
                        }`}>
                        <item.icon
                          className={`w-5 h-5 ${
                            item.active ? 'text-blue-600' : 'text-gray-500'
                          }`}
                        />
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <p
                            className={`text-xs mt-0.5 ${
                              item.active ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                            {item.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </nav>
              </div>

              {/* Mobile Sidebar Footer */}
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
        </div>
      )}

      {/* Main Content */}
      <div className={`lg:ml-64`}>
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">
                  Welcome back, {authState.user?.firstName}!
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-gray-500 text-sm font-medium">
                  {currentTime}
                </div>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 lg:p-8">
          {/* Desktop Stats Grid */}
          <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">
                      Total Properties
                    </p>
                    <p className="text-3xl font-bold">3</p>
                  </div>
                  <Building className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm mb-1">
                      Active Tenants
                    </p>
                    <p className="text-3xl font-bold">73</p>
                  </div>
                  <Users className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm mb-1">Maintenance</p>
                    <p className="text-3xl font-bold">5</p>
                  </div>
                  <Wrench className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm mb-1">
                      Monthly Income
                    </p>
                    <p className="text-3xl font-bold">₱847K</p>
                  </div>
                  <DollarSign className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desktop Quick Actions */}
          <div className="hidden lg:grid grid-cols-3 gap-6 mb-8">
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Financial Overview
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Track your property income
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  View Reports
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Activity
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Latest property updates
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white">
                  View Activity
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Quick Actions
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Manage your properties
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  Manage Properties
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Content (unchanged) */}
          <div className="lg:hidden">
            {/* Mobile Welcome Section */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
                Dashboard
              </h1>
              <p className="text-gray-600 text-sm">
                Welcome back, {authState.user?.firstName}!
              </p>
            </div>

            {/* Mobile Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 opacity-80" />
                  <div className="text-2xl font-bold mb-1">3</div>
                  <p className="text-blue-100 text-xs">Properties</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 opacity-80" />
                  <div className="text-2xl font-bold mb-1">73</div>
                  <p className="text-green-100 text-xs">Tenants</p>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Income Card */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg mb-6 border border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-800 font-semibold">
                    Monthly Income
                  </span>
                </div>
                <div className="text-3xl font-bold mb-2 text-gray-900">
                  ₱847,500
                </div>
                <p className="text-gray-600 text-xs mb-4">
                  Total expected this month
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-200 text-green-700 hover:bg-green-50 backdrop-blur-sm text-xs bg-transparent">
                  View Report
                </Button>
              </CardContent>
            </Card>

            {/* Mobile Quick Actions Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer border-0 shadow-md"
                  onClick={() => handleActionClick(action.route)}>
                  <CardContent className="p-4 text-center">
                    <div className="relative mb-3">
                      <div
                        className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mx-auto shadow-md`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      {action.count && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {action.count}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-800 text-xs font-semibold leading-tight">
                      {action.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mobile Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-6">
                <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      icon: User,
                      title: 'New tenant registered',
                      description: 'Sunrise Apartments - Unit A-205',
                      time: '2h ago',
                      color: 'bg-green-500',
                      badge: 'New',
                      badgeColor: 'bg-green-100 text-green-700'
                    },
                    {
                      icon: Wrench,
                      title: 'Maintenance completed',
                      description: 'Slitz Dormitory - Room 204',
                      time: '5h ago',
                      color: 'bg-blue-500',
                      badge: 'Done',
                      badgeColor: 'bg-blue-100 text-blue-700'
                    },
                    {
                      icon: Building,
                      title: 'Inspection scheduled',
                      description: 'Business Hub Plaza',
                      time: '1d ago',
                      color: 'bg-orange-500',
                      badge: 'Scheduled',
                      badgeColor: 'bg-orange-100 text-orange-700'
                    }
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                      <div
                        className={`w-10 h-10 ${activity.color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                        <activity.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-semibold text-sm">
                          {activity.title}
                        </p>
                        <p className="text-gray-600 text-xs truncate">
                          {activity.description}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {activity.time}
                        </p>
                      </div>
                      <Badge
                        className={`${activity.badgeColor} hover:${activity.badgeColor} border-0 text-xs`}>
                        {activity.badge}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
