'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Activity,
  Calendar,
  Clock,
  MapPin,
  Users,
  Target,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock3,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { BascaActivitiesAPI } from '@/lib/api/basca-activities';
import { useToast } from '@/hooks/use-toast';
import AddBascaActivityModal from '@/components/basca/add-basca-activity-modal';
import type { BascaActivity } from '@/types/basca';

export default function BASCActivitiesDashboard() {
  const { toast } = useToast();
  const [activities, setActivities] = useState<BascaActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<BascaActivity[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, selectedType, selectedStatus]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const allActivities = await BascaActivitiesAPI.getAllActivities();
      setActivities(allActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch activities',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        activity =>
          activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          activity.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(
        activity => activity.activityType === selectedType
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      const isCompleted = selectedStatus === 'completed';
      filtered = filtered.filter(
        activity => activity.isCompleted === isCompleted
      );
    }

    setFilteredActivities(filtered);
  };

  const handleExportData = () => {
    const csvContent = generateCSV(filteredActivities);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'basca-activities.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (activities: BascaActivity[]) => {
    const headers = [
      'Title',
      'Date',
      'Time',
      'Location',
      'Type',
      'Status',
      'Expected Participants',
      'Actual Participants',
      'Barangay'
    ];
    const rows = activities.map(activity => [
      activity.title,
      new Date(activity.activityDate).toLocaleDateString(),
      `${activity.startTime}${
        activity.endTime ? ` - ${activity.endTime}` : ''
      }`,
      activity.location || '',
      getActivityTypeLabel(activity.activityType),
      activity.isCompleted ? 'Completed' : 'Scheduled',
      activity.expectedParticipants?.toString() || '0',
      activity.actualParticipants.toString(),
      activity.barangay
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const calculateStats = () => {
    const total = activities.length;
    const completed = activities.filter(a => a.isCompleted).length;
    const upcoming = activities.filter(
      a => !a.isCompleted && new Date(a.activityDate) >= new Date()
    ).length;
    const thisMonth = activities.filter(a => {
      const activityDate = new Date(a.activityDate);
      const now = new Date();
      return (
        activityDate.getMonth() === now.getMonth() &&
        activityDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return { total, completed, upcoming, thisMonth };
  };

  const stats = calculateStats();

  const statsData = [
    {
      title: 'Total Activities',
      value: stats.total.toString(),
      icon: Activity,
      color: 'bg-[#E6B800]',
      textColor: 'text-[#E6B800]'
    },
    {
      title: 'Completed',
      value: stats.completed.toString(),
      icon: CheckCircle,
      color: 'bg-[#00B5AD]',
      textColor: 'text-[#00B5AD]'
    },
    {
      title: 'Upcoming',
      value: stats.upcoming.toString(),
      icon: Clock3,
      color: 'bg-[#FF6B6B]',
      textColor: 'text-[#FF6B6B]'
    },
    {
      title: 'This Month',
      value: stats.thisMonth.toString(),
      icon: TrendingUp,
      color: 'bg-[#4ECDC4]',
      textColor: 'text-[#4ECDC4]'
    }
  ];

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'community_service':
        return 'bg-blue-100 text-blue-800';
      case 'training':
        return 'bg-green-100 text-green-800';
      case 'outreach':
        return 'bg-purple-100 text-purple-800';
      case 'fundraising':
        return 'bg-orange-100 text-orange-800';
      case 'celebration':
        return 'bg-pink-100 text-pink-800';
      case 'advocacy':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (activity: BascaActivity) => {
    if (activity.isCompleted) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }

    const activityDate = new Date(activity.activityDate);
    const now = new Date();

    if (activityDate < now) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    }

    if (activityDate.toDateString() === now.toDateString()) {
      return <Badge className="bg-blue-100 text-blue-800">Today</Badge>;
    }

    return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
  };

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      community_service: 'Community Service',
      training: 'Training & Education',
      outreach: 'Outreach Program',
      fundraising: 'Fundraising',
      celebration: 'Celebration/Event',
      advocacy: 'Advocacy Campaign',
      other: 'Other'
    };
    return (
      labels[type] ||
      type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  const handleAddActivitySuccess = () => {
    fetchActivities();
    setIsAddModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] via-[#F0EDE8] to-[#E6B800]/20 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#333333] mb-2">
            BASCA Activities Management
          </h1>
          <p className="text-lg lg:text-xl text-[#666666]">
            Manage community service, training, and outreach activities
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
                    placeholder="Search activities..."
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
                  <option value="community_service">Community Service</option>
                  <option value="training">Training & Education</option>
                  <option value="outreach">Outreach Program</option>
                  <option value="fundraising">Fundraising</option>
                  <option value="celebration">Celebration/Event</option>
                  <option value="advocacy">Advocacy Campaign</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5AD]">
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
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
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#E6B800] hover:bg-[#D4A600] text-white flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Activity
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              BASCA Activities ({filteredActivities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B5AD]"></div>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No activities found
                </h3>
                <p className="text-gray-500">
                  Get started by creating your first activity.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map(activity => (
                  <div
                    key={activity.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {activity.title}
                          </h3>
                          <div className="flex gap-2">
                            {getStatusBadge(activity)}
                            <Badge
                              className={getActivityTypeColor(
                                activity.activityType
                              )}>
                              {getActivityTypeLabel(activity.activityType)}
                            </Badge>
                          </div>
                        </div>

                        {activity.description && (
                          <p className="text-gray-600 mb-3">
                            {activity.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(
                                activity.activityDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {activity.startTime}
                              {activity.endTime ? ` - ${activity.endTime}` : ''}
                            </span>
                          </div>
                          {activity.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{activity.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>
                              {activity.actualParticipants}/
                              {activity.expectedParticipants || '∞'}{' '}
                              participants
                            </span>
                          </div>
                        </div>

                        {activity.targetAudience && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <Target className="w-4 h-4" />
                            <span>Target: {activity.targetAudience}</span>
                          </div>
                        )}

                        {activity.isCompleted && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <h4 className="font-medium text-green-800 mb-2">
                              Activity Outcomes
                            </h4>
                            {activity.outcomes && (
                              <p className="text-sm text-green-700 mb-2">
                                <strong>Outcomes:</strong> {activity.outcomes}
                              </p>
                            )}
                            {activity.challenges && (
                              <p className="text-sm text-green-700 mb-2">
                                <strong>Challenges:</strong>{' '}
                                {activity.challenges}
                              </p>
                            )}
                            {activity.recommendations && (
                              <p className="text-sm text-green-700">
                                <strong>Recommendations:</strong>{' '}
                                {activity.recommendations}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          Manage Participants
                        </Button>
                        {!activity.isCompleted && (
                          <Button
                            size="sm"
                            className="w-full bg-[#00B5AD] hover:bg-[#009C94] text-white">
                            Mark as Completed
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

      {/* Add Activity Modal */}
      <AddBascaActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddActivitySuccess}
      />
    </div>
  );
}
