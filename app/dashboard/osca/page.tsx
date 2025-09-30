'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserPlus,
  AlertTriangle,
  Bell,
  TrendingUp,
  FileText,
  Calendar,
  MapPin,
  Activity,
  BarChart3,
  Clock,
  Building,
  Heart
} from 'lucide-react';
import { DashboardAPI, type DashboardStats } from '@/lib/api/dashboard';

export default function OSCADashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await DashboardAPI.getOSCADashboardStats();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load dashboard data'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh dashboard data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const getStatsConfig = (data: DashboardStats) => [
    {
      title: 'Total Senior Citizens',
      value: data.totalSeniors.toLocaleString(),
      change: `+${data.newThisMonth} this month`,
      icon: Users,
      color: 'bg-[#00af8f]',
      textColor: 'text-[#00af8f]'
    },
    {
      title: 'Active Seniors',
      value: data.activeSeniors.toLocaleString(),
      change: `${Math.round(
        (data.activeSeniors / Math.max(data.totalSeniors, 1)) * 100
      )}% of total`,
      icon: UserPlus,
      color: 'bg-[#00af8f]',
      textColor: 'text-[#00af8f]'
    },
    {
      title: 'New This Month',
      value: data.newThisMonth.toLocaleString(),
      change: data.newThisMonth > 0 ? '+' + data.newThisMonth : '0',
      icon: TrendingUp,
      color: 'bg-[#ffd416]',
      textColor: 'text-[#ffd416]'
    },
    {
      title: 'Pending Requests',
      value: data.pendingRequests.toLocaleString(),
      change: `${data.pendingAppointments} appointments`,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-500'
    }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#333333]">
              OSCA Dashboard
            </h1>
            <p className="text-[#666666] mt-2">Loading dashboard data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-16 h-8 bg-gray-200 rounded mb-1"></div>
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#333333]">
              OSCA Dashboard
            </h1>
            <p className="text-red-600 mt-2">
              Error: {error || 'Failed to load data'}
            </p>
          </div>
        </div>
        <Card className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Dashboard Error</h3>
          <p className="text-gray-600 mb-4">
            {error || 'Failed to load dashboard data'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#00af8f] hover:bg-[#00af90] text-white">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const stats = getStatsConfig(dashboardData);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#333333] mb-2">
            OSCA Dashboard
          </h1>
          <p className="text-[#666666] text-lg">
            Welcome back! Here's what's happening with senior citizens today.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <Badge
              variant="outline"
              className="bg-[#00af8f]/10 text-[#00af8f] border-[#00af8f]/20">
              Real-time Data
            </Badge>
            <span className="text-sm text-[#666666]">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/10"
            onClick={() => router.push('/dashboard/osca/reports')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            View Reports
          </Button>
          <Button
            className="bg-[#00af8f] hover:bg-[#00af90] text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => router.push('/dashboard/osca/announcements')}>
            <Bell className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        </div>
      </div>

      {/* Stats Grid with Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 group cursor-pointer"
              onClick={() => {
                if (stat.title.includes('Total'))
                  router.push('/dashboard/osca/seniors');
                else if (stat.title.includes('Pending'))
                  router.push('/dashboard/osca/appointments');
                else if (stat.title.includes('Active'))
                  router.push('/dashboard/osca/seniors');
              }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#666666] uppercase tracking-wide mb-3">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-[#333333] mb-2 group-hover:text-[#00af8f] transition-colors">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${stat.textColor}`}>
                        {stat.change}
                      </p>
                      {index === 0 && (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`p-4 rounded-2xl ${stat.color} bg-opacity-10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-7 h-7 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Announcements */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30">
          <CardHeader className="bg-gradient-to-r from-[#00af8f]/5 to-[#00af90]/5 border-b border-[#E0DDD8]/30">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00af8f]/10 rounded-xl">
                  <Bell className="w-6 h-6 text-[#00af8f]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#333333]">
                    Recent Announcements
                  </h3>
                  <p className="text-sm text-[#666666] mt-1">
                    Latest system notifications
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/osca/announcements')}
                className="text-[#00af8f] hover:bg-[#00af8f]/10">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {dashboardData.recentAnnouncements.length > 0 ? (
                dashboardData.recentAnnouncements.map(announcement => (
                  <div
                    key={announcement.id}
                    className="group p-4 rounded-xl border-2 border-[#E0DDD8]/50 hover:border-[#00af8f]/30 hover:bg-[#00af8f]/5 transition-all duration-300 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            announcement.isUrgent
                              ? 'bg-red-500 animate-pulse'
                              : 'bg-[#00af8f]'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-[#333333] group-hover:text-[#00af8f] transition-colors">
                            {announcement.title}
                          </h4>
                          {announcement.isUrgent && (
                            <Badge
                              variant="destructive"
                              className="text-xs animate-pulse">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#666666] mb-3 line-clamp-2">
                          {announcement.content.length > 120
                            ? announcement.content.substring(0, 120) + '...'
                            : announcement.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs bg-white">
                              {announcement.type}
                            </Badge>
                            {announcement.targetBarangay && (
                              <Badge className="text-xs bg-[#00af8f]/10 text-[#00af8f] border-[#00af8f]/20">
                                {announcement.targetBarangay}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-[#666666]">
                            {new Date(
                              announcement.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#333333] mb-2">
                    No Announcements
                  </h3>
                  <p className="text-[#666666] mb-4">
                    No recent announcements to display
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/osca/announcements')}
                    className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/10">
                    Create Announcement
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30">
          <CardHeader className="bg-gradient-to-r from-[#00af8f]/5 to-[#00af90]/5 border-b border-[#E0DDD8]/30">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00af8f]/10 rounded-xl">
                  <UserPlus className="w-6 h-6 text-[#00af8f]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#333333]">
                    New Registrations
                  </h3>
                  <p className="text-sm text-[#666666] mt-1">
                    Recently added seniors
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/osca/seniors')}
                className="text-[#00af8f] hover:bg-[#00af8f]/10">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {dashboardData.recentRegistrations.length > 0 ? (
                dashboardData.recentRegistrations.map(registration => (
                  <div
                    key={registration.id}
                    className="group p-4 rounded-xl border-2 border-[#E0DDD8]/50 hover:border-[#00af8f]/30 hover:bg-[#00af8f]/5 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#00af8f]/20 to-[#00af90]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-[#00af8f]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#333333] group-hover:text-[#00af8f] transition-colors">
                          {registration.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#666666]" />
                            <p className="text-sm text-[#666666]">
                              {registration.barangay}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#666666]" />
                            <p className="text-sm text-[#666666]">
                              Age {registration.age}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-200">
                          New
                        </Badge>
                        <p className="text-xs text-[#666666] mt-1">
                          {new Date(
                            registration.registrationDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#333333] mb-2">
                    No New Registrations
                  </h3>
                  <p className="text-[#666666] mb-4">
                    No recent registrations to display
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/osca/seniors')}
                    className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/10">
                    Add Senior Citizen
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30">
          <CardHeader className="bg-gradient-to-r from-[#00af8f]/5 to-[#00af90]/5 border-b border-[#E0DDD8]/30">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-[#00af8f]/10 rounded-xl">
                <Activity className="w-6 h-6 text-[#00af8f]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#333333]">
                  System Overview
                </h3>
                <p className="text-sm text-[#666666] mt-1">
                  Quick system status
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* System Status Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-800">Database</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    Online
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Pending Tasks
                    </span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                    {dashboardData.pendingRequests +
                      dashboardData.pendingAppointments}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">
                      Active Monitoring
                    </span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                    {dashboardData.activeSeniors}
                  </Badge>
                </div>
              </div>

              {/* Quick Access Buttons */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-[#333333] mb-3">
                  Quick Access
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/osca/appointments')}
                    className="justify-start border-[#00af8f]/30 hover:bg-[#00af8f]/10">
                    <Calendar className="w-4 h-4 mr-2" />
                    Appointments
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/osca/documents')}
                    className="justify-start border-[#00af8f]/30 hover:bg-[#00af8f]/10">
                    <FileText className="w-4 h-4 mr-2" />
                    Documents
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/osca/census')}
                    className="justify-start border-[#00af8f]/30 hover:bg-[#00af8f]/10">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Census
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/osca/benefits')}
                    className="justify-start border-[#00af8f]/30 hover:bg-[#00af8f]/10">
                    <Heart className="w-4 h-4 mr-2" />
                    Benefits
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30">
        <CardHeader className="bg-gradient-to-r from-[#00af8f]/5 to-[#00af90]/5 border-b border-[#E0DDD8]/30">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00af8f]/10 rounded-xl">
                <Activity className="w-6 h-6 text-[#00af8f]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#333333]">
                  Quick Actions
                </h3>
                <p className="text-sm text-[#666666] mt-1">
                  Frequently used operations
                </p>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                icon: UserPlus,
                label: 'Add Senior',
                description: 'Register new senior citizen',
                path: '/dashboard/osca/seniors',
                color: 'from-[#00af8f] to-[#00af90]'
              },
              {
                icon: Bell,
                label: 'Announcements',
                description: 'Create notifications',
                path: '/dashboard/osca/announcements',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: FileText,
                label: 'Reports',
                description: 'Generate reports',
                path: '/dashboard/osca/reports',
                color: 'from-purple-500 to-purple-600'
              },
              {
                icon: Calendar,
                label: 'Appointments',
                description: 'Schedule meetings',
                path: '/dashboard/osca/appointments',
                color: 'from-orange-500 to-orange-600'
              },
              {
                icon: Building,
                label: 'Census',
                description: 'Population data',
                path: '/dashboard/osca/census',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: Users,
                label: 'Manage Users',
                description: 'User accounts',
                path: '/dashboard/osca/users',
                color: 'from-red-500 to-red-600'
              }
            ].map((action, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border-2 border-[#E0DDD8]/50 hover:border-[#00af8f]/30 transition-all duration-300 cursor-pointer"
                onClick={() => router.push(action.path)}>
                <div className="p-6 bg-white hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#333333] group-hover:text-[#00af8f] transition-colors">
                        {action.label}
                      </h4>
                      <p className="text-xs text-[#666666] mt-1 leading-tight">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
