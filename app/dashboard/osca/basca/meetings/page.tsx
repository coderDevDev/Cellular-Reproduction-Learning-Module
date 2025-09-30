'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  CalendarDays
} from 'lucide-react';
import { BascaMeetingsAPI } from '@/lib/api/basca-meetings';
import { BascaMeetingAttendeesAPI } from '@/lib/api/basca-meeting-attendees';
import { useToast } from '@/hooks/use-toast';
import AddBascaMeetingModal from '@/components/basca/add-basca-meeting-modal';
import type { BascaMeeting } from '@/types/basca';

export default function BASCAMeetingsDashboard() {
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<BascaMeeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<BascaMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    filterMeetings();
  }, [meetings, searchTerm, selectedType, selectedStatus]);

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const allMeetings = await BascaMeetingsAPI.getAllMeetings();
      setMeetings(allMeetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch meetings',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterMeetings = () => {
    let filtered = meetings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        meeting =>
          meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meeting.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          meeting.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(
        meeting => meeting.meetingType === selectedType
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      const isConducted = selectedStatus === 'conducted';
      filtered = filtered.filter(
        meeting => meeting.isConducted === isConducted
      );
    }

    setFilteredMeetings(filtered);
  };

  const handleAddMeeting = () => {
    setIsAddModalOpen(true);
  };

  const handleAddMeetingSuccess = () => {
    setIsAddModalOpen(false);
    fetchMeetings();
    toast({
      title: 'Success',
      description: 'Meeting created successfully',
      variant: 'default'
    });
  };

  const handleExportData = () => {
    const csvContent = generateCSV(filteredMeetings);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'basca-meetings.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (meetings: BascaMeeting[]) => {
    const headers = [
      'Title',
      'Date',
      'Time',
      'Location',
      'Type',
      'Status',
      'Attendees',
      'Barangay'
    ];
    const rows = meetings.map(meeting => [
      meeting.title,
      new Date(meeting.meetingDate).toLocaleDateString(),
      `${meeting.startTime}${meeting.endTime ? ` - ${meeting.endTime}` : ''}`,
      meeting.location || '',
      meeting.meetingType,
      meeting.isConducted ? 'Conducted' : 'Scheduled',
      meeting.attendeesCount.toString(),
      meeting.barangay
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const calculateStats = () => {
    const total = meetings.length;
    const conducted = meetings.filter(m => m.isConducted).length;
    const upcoming = meetings.filter(
      m => !m.isConducted && new Date(m.meetingDate) >= new Date()
    ).length;
    const thisMonth = meetings.filter(m => {
      const meetingDate = new Date(m.meetingDate);
      const now = new Date();
      return (
        meetingDate.getMonth() === now.getMonth() &&
        meetingDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return { total, conducted, upcoming, thisMonth };
  };

  const stats = calculateStats();

  const statsData = [
    {
      title: 'Total Meetings',
      value: stats.total.toString(),
      icon: Calendar,
      color: 'bg-[#E6B800]',
      textColor: 'text-[#E6B800]'
    },
    {
      title: 'Conducted',
      value: stats.conducted.toString(),
      icon: CheckCircle,
      color: 'bg-[#00B5AD]',
      textColor: 'text-[#00B5AD]'
    },
    {
      title: 'Upcoming',
      value: stats.upcoming.toString(),
      icon: Clock,
      color: 'bg-[#FF6B6B]',
      textColor: 'text-[#FF6B6B]'
    },
    {
      title: 'This Month',
      value: stats.thisMonth.toString(),
      icon: CalendarDays,
      color: 'bg-[#4ECDC4]',
      textColor: 'text-[#4ECDC4]'
    }
  ];

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'regular':
        return 'bg-blue-100 text-blue-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'training':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (meeting: BascaMeeting) => {
    if (meeting.isConducted) {
      return <Badge className="bg-green-100 text-green-800">Conducted</Badge>;
    }

    const meetingDate = new Date(meeting.meetingDate);
    const now = new Date();

    if (meetingDate < now) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    }

    if (meetingDate.toDateString() === now.toDateString()) {
      return <Badge className="bg-blue-100 text-blue-800">Today</Badge>;
    }

    return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] via-[#F0EDE8] to-[#E6B800]/20 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#333333] mb-2">
            BASCA Meetings Management
          </h1>
          <p className="text-lg lg:text-xl text-[#666666]">
            Schedule, manage, and track BASCA meetings and attendance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#666666] mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-[#333333]">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                      <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col lg:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search meetings..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5AD]">
                  <option value="all">All Types</option>
                  <option value="regular">Regular</option>
                  <option value="emergency">Emergency</option>
                  <option value="training">Training</option>
                  <option value="planning">Planning</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5AD]">
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="conducted">Conducted</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button
                  onClick={handleAddMeeting}
                  className="bg-[#E6B800] hover:bg-[#D4A600] text-white flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Meeting
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meetings List */}
        <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              BASCA Meetings ({filteredMeetings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B5AD]"></div>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No meetings found
                </h3>
                <p className="text-gray-500">
                  Get started by creating your first meeting.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMeetings.map(meeting => (
                  <div
                    key={meeting.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {meeting.title}
                          </h3>
                          <div className="flex gap-2">
                            {getStatusBadge(meeting)}
                            <Badge
                              className={getMeetingTypeColor(
                                meeting.meetingType
                              )}>
                              {meeting.meetingType.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        {meeting.description && (
                          <p className="text-gray-600 mb-3">
                            {meeting.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(
                                meeting.meetingDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {meeting.startTime}
                              {meeting.endTime ? ` - ${meeting.endTime}` : ''}
                            </span>
                          </div>
                          {meeting.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{meeting.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{meeting.attendeesCount} attendees</span>
                          </div>
                        </div>

                        {meeting.agenda && meeting.agenda.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Agenda:
                            </p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {meeting.agenda.slice(0, 3).map((item, index) => (
                                <li
                                  key={index}
                                  className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                  {item}
                                </li>
                              ))}
                              {meeting.agenda.length > 3 && (
                                <li className="text-gray-500 text-xs">
                                  +{meeting.agenda.length - 3} more items
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          Manage Attendance
                        </Button>
                        {!meeting.isConducted && (
                          <Button
                            size="sm"
                            className="w-full bg-[#00B5AD] hover:bg-[#009C94] text-white">
                            Mark as Conducted
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Meeting Modal */}
      <AddBascaMeetingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddMeetingSuccess}
      />
    </div>
  );
}
