'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
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
  Stethoscope,
  ClipboardList,
  Heart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface BASCASidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BASCASidebar({ isOpen, onClose }: BASCASidebarProps) {
  const { authState, logout } = useAuth();
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('dashboard');

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard/basca'
    },
    {
      id: 'seniors',
      label: 'Senior Citizens',
      icon: Users,
      href: '/dashboard/basca/seniors',
      badge: '1,250'
    },
    {
      id: 'registrations',
      label: 'New Registrations',
      icon: Plus,
      href: '/dashboard/basca/registrations',
      badge: '8'
    },
    {
      id: 'requests',
      label: 'Document Requests',
      icon: FileText,
      href: '/dashboard/basca/requests',
      badge: '5'
    },
    {
      id: 'bhw',
      label: 'BHW Coordination',
      icon: Stethoscope,
      href: '/dashboard/basca/bhw'
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      href: '/dashboard/basca/appointments'
    },
    {
      id: 'benefits',
      label: 'Benefits',
      icon: Heart,
      href: '/dashboard/basca/benefits'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      href: '/dashboard/basca/reports'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      href: '/dashboard/basca/messages'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/basca/settings'
    }
  ];

  const handleNavigation = (item: any) => {
    setActiveItem(item.id);
    router.push(item.href);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#ffd416] rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">BASCA</h2>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="lg:hidden">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* User Info */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#ffd416]/10 rounded-full flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-[#ffd416]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {authState.user?.firstName} {authState.user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {authState.user?.email}
            </p>
            <p className="text-xs text-[#ffd416] font-medium">
              {authState.user?.barangay}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map(item => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className={`w-full justify-start h-12 ${
                isActive
                  ? 'bg-[#ffd416] text-white hover:bg-[#ffd317]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => handleNavigation(item)}>
              <Icon className="w-5 h-5 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Plus className="w-4 h-4 mr-2" />
            Register Senior
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <FileText className="w-4 h-4 mr-2" />
            Process Request
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Stethoscope className="w-4 h-4 mr-2" />
            Schedule BHW
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
