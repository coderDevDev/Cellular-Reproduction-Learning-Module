'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, BookOpen, FileText, Activity, User, Target } from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/student/dashboard',
    icon: Home,
    current: false
  },
  {
    name: 'VARK Modules',
    href: '/student/vark-modules',
    icon: Target,
    current: false
  },
  {
    name: 'Lessons',
    href: '/student/lessons',
    icon: BookOpen,
    current: false
  },
  {
    name: 'Quizzes',
    href: '/student/quizzes',
    icon: FileText,
    current: false
  },
  {
    name: 'Profile',
    href: '/student/profile',
    icon: User,
    current: false
  }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-16 px-2">
        {navigation.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 min-w-0 py-2 px-1 transition-all duration-200',
                isActive
                  ? 'text-[#00af8f]'
                  : 'text-gray-500 hover:text-gray-700'
              )}>
              <div
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 mb-1',
                  isActive ? 'bg-[#00af8f]/10' : 'hover:bg-gray-100'
                )}>
                <item.icon
                  className={cn(
                    'w-5 h-5 transition-all duration-200',
                    isActive && 'scale-110'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-all duration-200',
                  isActive ? 'text-[#00af8f]' : 'text-gray-500'
                )}>
                {item.name}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#00af8f] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </div>
  );
}
