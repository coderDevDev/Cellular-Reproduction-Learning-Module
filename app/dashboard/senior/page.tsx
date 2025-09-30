'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  Bell,
  Calendar,
  FileText,
  Gift,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function SeniorDashboard() {
  // Mock data for demonstration
  const personalInfo = {
    name: 'Maria Santos',
    age: 68,
    barangay: 'Barangay 1',
    address: '123 Main Street, City',
    phone: '+63 912 345 6789',
    email: 'maria.santos@email.com',
    oscaId: 'OSCA-2024-001234'
  };

  const recentAnnouncements = [
    {
      id: 1,
      title: 'Monthly Pension Distribution',
      content: 'Pension distribution will be held on the 15th of this month.',
      date: '2024-01-10',
      urgent: false
    },
    {
      id: 2,
      title: 'Free Medical Check-up',
      content: 'Free medical check-up for all registered senior citizens.',
      date: '2024-01-08',
      urgent: true
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      type: 'Health Check-up',
      date: '2024-01-15',
      time: '09:00 AM',
      location: 'Barangay Health Center',
      status: 'confirmed'
    },
    {
      id: 2,
      type: 'Vaccination',
      date: '2024-01-20',
      time: '10:30 AM',
      location: 'City Health Office',
      status: 'pending'
    }
  ];

  const documentRequests = [
    {
      id: 1,
      type: 'OSCA ID Renewal',
      status: 'approved',
      date: '2024-01-05',
      processedDate: '2024-01-08'
    },
    {
      id: 2,
      type: 'Medical Certificate',
      status: 'pending',
      date: '2024-01-10',
      processedDate: null
    }
  ];

  const benefits = [
    {
      id: 1,
      name: 'Monthly Pension',
      amount: '₱1,000',
      status: 'active',
      nextPayment: '2024-01-15'
    },
    {
      id: 2,
      name: 'Medical Assistance',
      amount: '₱500',
      status: 'active',
      nextPayment: '2024-01-20'
    },
    {
      id: 3,
      name: 'Transportation Allowance',
      amount: '₱200',
      status: 'expired',
      nextPayment: null
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] via-[#F0EDE8] to-[#E6B800]/20 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#333333] mb-2">
            Welcome, {personalInfo.name}!
          </h1>
          <p className="text-lg lg:text-xl text-[#666666]">
            Your Senior Citizen Self-Service Portal
          </p>
        </div>

        {/* Personal Info Card */}
        <div className="mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#333333] flex items-center gap-3">
                <User className="w-6 h-6 text-[#00B5AD]" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-[#333333] mb-2">
                      Basic Information
                    </h3>
                    <div className="space-y-2 text-sm text-[#666666]">
                      <div>
                        <strong>Name:</strong> {personalInfo.name}
                      </div>
                      <div>
                        <strong>Age:</strong> {personalInfo.age} years old
                      </div>
                      <div>
                        <strong>OSCA ID:</strong> {personalInfo.oscaId}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#333333] mb-2">
                      Contact Information
                    </h3>
                    <div className="space-y-2 text-sm text-[#666666]">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{personalInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{personalInfo.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#333333] mb-2">
                    Address Information
                  </h3>
                  <div className="space-y-2 text-sm text-[#666666]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{personalInfo.address}</span>
                    </div>
                    <div>
                      <strong>Barangay:</strong> {personalInfo.barangay}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Announcements */}
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-[#333333] flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#00B5AD]" />
                  Recent Announcements
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#00B5AD] text-[#333333] hover:bg-[#F8F5F0]">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAnnouncements.map(announcement => (
                <div
                  key={announcement.id}
                  className="p-4 rounded-lg border border-[#E0DDD8] hover:border-[#00B5AD] transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-[#333333]">
                      {announcement.title}
                    </h4>
                    {announcement.urgent && (
                      <Badge className="bg-red-500 text-white text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <p className="text-[#666666] text-sm mb-2">
                    {announcement.content}
                  </p>
                  <div className="text-xs text-[#666666]">
                    {announcement.date}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-[#333333] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#E6B800]" />
                  Upcoming Appointments
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#00B5AD] text-[#333333] hover:bg-[#F8F5F0]">
                  Schedule New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className="p-4 rounded-lg border border-[#E0DDD8] hover:border-[#00B5AD] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#333333]">
                      {appointment.type}
                    </h4>
                    <Badge
                      className={
                        appointment.status === 'confirmed'
                          ? 'bg-[#00B5AD] text-white'
                          : 'bg-[#E6B800] text-white'
                      }>
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-[#666666]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{appointment.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Document Requests and Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Document Requests */}
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-[#333333] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#00B5AD]" />
                  Document Requests
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#00B5AD] text-[#333333] hover:bg-[#F8F5F0]">
                  New Request
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {documentRequests.map(request => (
                <div
                  key={request.id}
                  className="p-4 rounded-lg border border-[#E0DDD8] hover:border-[#00B5AD] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#333333]">
                      {request.type}
                    </h4>
                    <Badge
                      className={
                        request.status === 'approved'
                          ? 'bg-[#00B5AD] text-white'
                          : 'bg-[#E6B800] text-white'
                      }>
                      {request.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-[#666666]">
                    <div>Requested: {request.date}</div>
                    {request.processedDate && (
                      <div>Processed: {request.processedDate}</div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-[#333333] flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#00B5AD]" />
                  My Benefits
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#00B5AD] text-[#333333] hover:bg-[#F8F5F0]">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {benefits.map(benefit => (
                <div
                  key={benefit.id}
                  className="p-4 rounded-lg border border-[#E0DDD8] hover:border-[#00B5AD] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#333333]">
                      {benefit.name}
                    </h4>
                    <Badge
                      className={
                        benefit.status === 'active'
                          ? 'bg-[#00B5AD] text-white'
                          : 'bg-[#666666] text-white'
                      }>
                      {benefit.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-[#666666]">
                    <div className="text-lg font-semibold text-[#333333]">
                      {benefit.amount}
                    </div>
                    {benefit.nextPayment && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Next: {benefit.nextPayment}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#333333]">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button className="bg-[#00B5AD] hover:bg-[#009B94] text-white h-16 text-lg">
                  <FileText className="w-5 h-5 mr-2" />
                  Request Document
                </Button>
                <Button className="bg-[#E6B800] hover:bg-[#D4A600] text-white h-16 text-lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Appointment
                </Button>
                <Button className="bg-[#00B5AD] hover:bg-[#009B94] text-white h-16 text-lg">
                  <Bell className="w-5 h-5 mr-2" />
                  View Announcements
                </Button>
                <Button className="bg-[#666666] hover:bg-[#555555] text-white h-16 text-lg">
                  <User className="w-5 h-5 mr-2" />
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
