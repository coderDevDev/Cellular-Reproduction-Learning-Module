'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  FileText,
  Bell,
  Calendar,
  Settings,
  LogOut,
  Home,
  Search,
  Plus,
  Download,
  MessageSquare,
  AlertTriangle,
  MapPin,
  UserCheck,
  Activity,
  Stethoscope,
  Heart,
  Gift,
  CreditCard,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SeniorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SeniorSidebar({ isOpen, onClose }: SeniorSidebarProps) {
  const { authState, logout } = useAuth();
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('dashboard');

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard/senior'
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
      href: '/dashboard/senior/profile'
    },
    {
      id: 'documents',
      label: 'My Documents',
      icon: FileText,
      href: '/dashboard/senior/documents'
    },
    {
      id: 'requests',
      label: 'Document Requests',
      icon: Plus,
      href: '/dashboard/senior/requests',
      badge: '2'
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      href: '/dashboard/senior/appointments'
    },
    {
      id: 'benefits',
      label: 'My Benefits',
      icon: Gift,
      href: '/dashboard/senior/benefits'
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Bell,
      href: '/dashboard/senior/announcements'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      href: '/dashboard/senior/messages'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/senior/settings'
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
          <div className="w-10 h-10 bg-[#00af8f] rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Senior Portal</h2>
            <p className="text-xs text-gray-500">Self-Service</p>
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
          <div className="w-10 h-10 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-[#00af8f]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {authState.user?.firstName} {authState.user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {authState.user?.email}
            </p>
            <p className="text-xs text-[#00af8f] font-medium">
              OSCA ID: {authState.user?.oscaId || 'N/A'}
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
                  ? 'bg-[#00af8f] text-white hover:bg-[#00af90]'
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
            <FileText className="w-4 h-4 mr-2" />
            Request Document
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Bell className="w-4 h-4 mr-2" />
            View Announcements
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
