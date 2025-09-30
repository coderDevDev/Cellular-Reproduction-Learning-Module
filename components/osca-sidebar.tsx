'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Users,
  FileText,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Search,
  Plus,
  Download,
  Database,
  MessageSquare,
  AlertTriangle,
  Calendar,
  MapPin,
  UserCheck,
  Activity,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardAPI } from '@/lib/api/dashboard';
import Image from 'next/image';

interface OSCASidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OSCASidebar({ isOpen, onClose }: OSCASidebarProps) {
  const { authState, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarStats, setSidebarStats] = useState({
    totalSeniors: 0,
    pendingAnnouncements: 0,
    pendingAppointments: 0,
    pendingDocuments: 0
  });

  // Fetch sidebar stats
  useEffect(() => {
    const fetchSidebarStats = async () => {
      try {
        const data = await DashboardAPI.getSidebarStats();
        setSidebarStats(data);
      } catch (error) {
        console.error('Error fetching sidebar stats:', error);
        // Keep default values on error
      }
    };

    fetchSidebarStats();
    // Refresh every 60 seconds (reduced frequency)
    const interval = setInterval(fetchSidebarStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard/osca',
      section: 'main'
    },
    {
      id: 'seniors',
      label: 'Senior Citizens',
      icon: Users,
      href: '/dashboard/osca/seniors',
      description: 'Manage all senior citizens',
      section: 'main',
      badge:
        sidebarStats.totalSeniors > 0
          ? sidebarStats.totalSeniors.toLocaleString()
          : undefined
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Bell,
      href: '/dashboard/osca/announcements',
      description: 'System-wide notifications',
      section: 'management',
      badge:
        sidebarStats.pendingAnnouncements > 0
          ? sidebarStats.pendingAnnouncements.toString()
          : undefined
    },
    {
      id: 'reports',
      label: 'Census Reports & Analytics',
      icon: BarChart3,
      href: '/dashboard/osca/reports',
      description: 'Generate comprehensive reports',
      section: 'management'
    },
    // {
    //   id: 'census',
    //   label: 'Census Management',
    //   icon: Database,
    //   href: '/dashboard/osca/census',
    //   description: 'Demographic tracking & trends',
    //   section: 'management'
    // },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      href: '/dashboard/osca/appointments',
      description: 'Manage medical appointments',
      section: 'services',
      badge:
        sidebarStats.pendingAppointments > 0
          ? sidebarStats.pendingAppointments.toString()
          : undefined
    },
    {
      id: 'documents',
      label: 'Document Requests',
      icon: FileText,
      href: '/dashboard/osca/documents',
      description: 'Process ID & certificate requests',
      section: 'services',
      badge:
        sidebarStats.pendingDocuments > 0
          ? sidebarStats.pendingDocuments.toString()
          : undefined
    },
    {
      id: 'benefits',
      label: 'Benefits Management',
      icon: Activity,
      href: '/dashboard/osca/benefits',
      description: 'Track financial assistance',
      section: 'services'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: UserCheck,
      href: '/dashboard/osca/users',
      description: 'Manage BASCA accounts',
      section: 'system'
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: AlertTriangle,
      href: '/dashboard/osca/audit',
      description: 'System activity tracking',
      section: 'system'
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      href: '/dashboard/osca/settings',
      description: 'Configure system preferences',
      section: 'system'
    }
  ];

  // Update active item based on current pathname
  useEffect(() => {
    const currentItem = navigationItems.find(item => pathname === item.href);
    if (currentItem) {
      setActiveItem(currentItem.id);
    }
  }, [pathname]);

  const handleNavigation = (item: any) => {
    setActiveItem(item.id);
    router.push(item.href);
    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navigationItems>);

  const renderNavigationItem = (item: any) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    return (
      <Button
        key={item.id}
        variant={isActive ? 'default' : 'ghost'}
        className={`w-full justify-start transition-all duration-200 ${
          isCollapsed ? 'h-12 px-3' : 'h-14 px-4'
        } ${
          isActive
            ? 'bg-[#00af8f] text-white hover:bg-[#00af90] shadow-md border-none'
            : 'text-gray-700 hover:bg-gray-50 hover:text-[#00af8f] border border-transparent hover:border-[#00af8f]/20'
        }`}
        onClick={() => handleNavigation(item)}>
        <Icon
          className={`${
            isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'
          } flex-shrink-0`}
        />
        {!isCollapsed && (
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm truncate">{item.label}</span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={`ml-2 text-xs px-2 py-0.5 ${
                    isActive
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-[#00af8f]/10 text-[#00af8f] border-[#00af8f]/20'
                  }`}>
                  {item.badge}
                </Badge>
              )}
            </div>
            {item.description && (
              <p
                className={`text-xs mt-0.5 truncate ${
                  isActive ? 'text-white/80' : 'text-gray-500'
                }`}>
                {item.description}
              </p>
            )}
          </div>
        )}
        {isCollapsed && item.badge && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        )}
      </Button>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isCollapsed ? 'w-16' : 'w-72'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:border-r lg:border-gray-200`}>
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b border-gray-100 ${
            isCollapsed ? 'p-3' : 'p-6'
          }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-xl flex items-center justify-center shadow-lg">
              <Image
                src="https://mpqicxgtlmnwalwjmaov.supabase.co/storage/v1/object/sign/senior/f57b19189e96ff73ad61a12301a7ab147cdfe857.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wYzUzNjYxYi1hZjkzLTQ1MGUtYWZkOS00NDg2MzM4NmJiZDQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzZW5pb3IvZjU3YjE5MTg5ZTk2ZmY3M2FkNjFhMTIzMDFhN2FiMTQ3Y2RmZTg1Ny5wbmciLCJpYXQiOjE3NTQ2NDM4NjMsImV4cCI6MTc4NjE3OTg2M30.iC2Ik1M4KZwvZuHiRHU1FeBNX0jRzHCkmqCow-i5Syw"
                alt="Logo"
                width={24}
                height={24}
                className="rounded-lg"
              />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-gray-900">OSCA</h2>
                <p className="text-xs text-[#00af8f] font-medium">
                  Superadmin Portal
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex h-8 w-8 p-0 hover:bg-gray-100">
              <Menu className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden h-8 w-8 p-0 hover:bg-gray-100">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-full flex items-center justify-center shadow-md">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {authState.user?.firstName} {authState.user?.lastName}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {authState.user?.email}
                </p>
                <Badge
                  variant="secondary"
                  className="mt-1 text-xs bg-[#00af8f]/10 text-[#00af8f] border-[#00af8f]/20">
                  OSCA Administrator
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav
          className={`flex-1 overflow-y-auto ${
            isCollapsed ? 'px-2' : 'px-4'
          } py-4`}>
          <div className="space-y-6">
            {/* Main Navigation */}
            <div className="space-y-2">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Main
                </h3>
              )}
              <div className="space-y-1">
                {groupedItems.main?.map(item => renderNavigationItem(item))}
              </div>
            </div>

            {/* Management Section */}
            <div className="space-y-2">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Management
                </h3>
              )}
              <div className="space-y-1">
                {groupedItems.management?.map(item =>
                  renderNavigationItem(item)
                )}
              </div>
            </div>

            {/* Services Section */}
            <div className="space-y-2">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Services
                </h3>
              )}
              <div className="space-y-1">
                {groupedItems.services?.map(item => renderNavigationItem(item))}
              </div>
            </div>

            {/* System Section */}
            <div className="space-y-2">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  System
                </h3>
              )}
              <div className="space-y-1">
                {groupedItems.system?.map(item => renderNavigationItem(item))}
              </div>
            </div>
          </div>
        </nav>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-11 border-[#00af8f]/30 hover:bg-[#00af8f]/10 hover:border-[#00af8f] transition-all duration-200"
                onClick={() => router.push('/dashboard/osca/seniors')}>
                <Plus className="w-4 h-4 mr-3 text-[#00af8f]" />
                <span className="text-sm font-medium">Add Senior Citizen</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-11 border-[#00af8f]/30 hover:bg-[#00af8f]/10 hover:border-[#00af8f] transition-all duration-200"
                onClick={() => router.push('/dashboard/osca/announcements')}>
                <Bell className="w-4 h-4 mr-3 text-[#00af8f]" />
                <span className="text-sm font-medium">Post Announcement</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-11 border-[#00af8f]/30 hover:bg-[#00af8f]/10 hover:border-[#00af8f] transition-all duration-200"
                onClick={() => router.push('/dashboard/osca/reports')}>
                <Download className="w-4 h-4 mr-3 text-[#00af8f]" />
                <span className="text-sm font-medium">Export Report</span>
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className={`border-t border-gray-100 ${isCollapsed ? 'p-3' : 'p-4'}`}>
          <Button
            variant="ghost"
            className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 ${
              isCollapsed ? 'h-12 px-3' : 'h-12 px-4'
            }`}
            onClick={handleLogout}>
            <LogOut
              className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`}
            />
            {!isCollapsed && <span className="font-medium">Sign Out</span>}
          </Button>
        </div>
      </div>
    </>
  );
}
