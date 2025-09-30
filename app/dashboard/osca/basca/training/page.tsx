'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock3,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Target,
  Star
} from 'lucide-react';
import { BascaTrainingAPI } from '@/lib/api/basca-training';
import { useToast } from '@/hooks/use-toast';
import AddBascaTrainingModal from '@/components/basca/add-basca-training-modal';
import type { BascaTrainingSession } from '@/types/basca';

export default function BASCATrainingDashboard() {
  const { toast } = useToast();
  const [trainingSessions, setTrainingSessions] = useState<
    BascaTrainingSession[]
  >([]);
  const [filteredSessions, setFilteredSessions] = useState<
    BascaTrainingSession[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchTrainingSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [trainingSessions, searchTerm, selectedType, selectedStatus]);

  const fetchTrainingSessions = async () => {
    try {
      setIsLoading(true);
      const allSessions = await BascaTrainingAPI.getAllTrainingSessions();
      setTrainingSessions(allSessions);
    } catch (error) {
      console.error('Error fetching training sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch training sessions',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = trainingSessions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        session =>
          session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          session.trainerName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          session.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(
        session => session.trainingType === selectedType
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      const isCompleted = selectedStatus === 'completed';
      filtered = filtered.filter(
        session => session.isCompleted === isCompleted
      );
    }

    setFilteredSessions(filtered);
  };

  const handleAddTraining = () => {
    setIsAddModalOpen(true);
  };

  const handleAddTrainingSuccess = () => {
    setIsAddModalOpen(false);
    fetchTrainingSessions();
    toast({
      title: 'Success',
      description: 'Training session created successfully',
      variant: 'default'
    });
  };

  const handleExportData = () => {
    const csvContent = generateCSV(filteredSessions);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'basca-training-sessions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (sessions: BascaTrainingSession[]) => {
    const headers = [
      'Title',
      'Date',
      'Time',
      'Location',
      'Type',
      'Status',
      'Trainer',
      'Max Participants',
      'Current Participants',
      'Trainer Organization'
    ];
    const rows = sessions.map(session => [
      session.title,
      new Date(session.trainingDate).toLocaleDateString(),
      `${session.startTime}${session.endTime ? ` - ${session.endTime}` : ''}`,
      session.location || '',
      session.trainingType.replace('_', ' '),
      session.isCompleted ? 'Completed' : 'Scheduled',
      session.trainerName || '',
      session.maxParticipants?.toString() || '0',
      session.currentParticipants.toString(),
      session.trainerOrganization || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const calculateStats = () => {
    const total = trainingSessions.length;
    const completed = trainingSessions.filter(s => s.isCompleted).length;
    const upcoming = trainingSessions.filter(
      s => !s.isCompleted && new Date(s.trainingDate) >= new Date()
    ).length;
    const thisMonth = trainingSessions.filter(s => {
      const trainingDate = new Date(s.trainingDate);
      const now = new Date();
      return (
        trainingDate.getMonth() === now.getMonth() &&
        trainingDate.getFullYear() === now.getFullYear()
      );
    }).length;

    const totalParticipants = trainingSessions.reduce(
      (sum, s) => sum + s.currentParticipants,
      0
    );
    const avgParticipants =
      total > 0 ? Math.round(totalParticipants / total) : 0;

    return {
      total,
      completed,
      upcoming,
      thisMonth,
      totalParticipants,
      avgParticipants
    };
  };

  const stats = calculateStats();

  const statsData = [
    {
      title: 'Total Sessions',
      value: stats.total.toString(),
      icon: GraduationCap,
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
      title: 'Avg Participants',
      value: stats.avgParticipants.toString(),
      icon: Users,
      color: 'bg-[#4ECDC4]',
      textColor: 'text-[#4ECDC4]'
    }
  ];

  const getTrainingTypeColor = (type: string) => {
    switch (type) {
      case 'first_aid':
        return 'bg-red-100 text-red-800';
      case 'health_education':
        return 'bg-blue-100 text-blue-800';
      case 'emergency_response':
        return 'bg-orange-100 text-orange-800';
      case 'community_health':
        return 'bg-green-100 text-green-800';
      case 'leadership':
        return 'bg-purple-100 text-purple-800';
      case 'technical_skills':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (session: BascaTrainingSession) => {
    if (session.isCompleted) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }

    const trainingDate = new Date(session.trainingDate);
    const now = new Date();

    if (trainingDate < now) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    }

    if (trainingDate.toDateString() === now.toDateString()) {
      return <Badge className="bg-blue-100 text-blue-800">Today</Badge>;
    }

    return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
  };

  const getTrainingTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCertificationBadge = (session: BascaTrainingSession) => {
    if (session.trainingType !== 'certification') return null;

    return (
      <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
        <Award className="w-3 h-3" />
        Certification Training
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] via-[#F0EDE8] to-[#E6B800]/20 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#333333] mb-2">
            BASCA Training Management
          </h1>
          <p className="text-lg lg:text-xl text-[#666666]">
            Manage training sessions, track certifications, and monitor skill
            development
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
                    placeholder="Search training sessions..."
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
                  <option value="first_aid">First Aid</option>
                  <option value="health_education">Health Education</option>
                  <option value="emergency_response">Emergency Response</option>
                  <option value="community_health">Community Health</option>
                  <option value="leadership">Leadership</option>
                  <option value="technical_skills">Technical Skills</option>
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
                  onClick={handleAddTraining}
                  className="bg-[#E6B800] hover:bg-[#D4A600] text-white flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Training
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Sessions List */}
        <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Training Sessions ({filteredSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B5AD]"></div>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No training sessions found
                </h3>
                <p className="text-gray-500">
                  Get started by creating your first training session.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map(session => (
                  <div
                    key={session.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.title}
                          </h3>
                          <div className="flex gap-2">
                            {getStatusBadge(session)}
                            <Badge
                              className={getTrainingTypeColor(
                                session.trainingType
                              )}>
                              {getTrainingTypeLabel(session.trainingType)}
                            </Badge>
                            {getCertificationBadge(session)}
                          </div>
                        </div>

                        {session.description && (
                          <p className="text-gray-600 mb-3">
                            {session.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(
                                session.trainingDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {session.startTime}
                              {session.endTime ? ` - ${session.endTime}` : ''}
                            </span>
                          </div>
                          {session.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{session.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>
                              {session.currentParticipants}/
                              {session.maxParticipants || '∞'} participants
                            </span>
                          </div>
                        </div>

                        {session.trainerName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <Star className="w-4 h-4" />
                            <span>Trainer: {session.trainerName}</span>
                          </div>
                        )}

                        {session.trainerOrganization && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Trainer Organization
                            </h4>
                            <p className="text-sm text-blue-700">
                              {session.trainerOrganization}
                            </p>
                          </div>
                        )}

                        {session.isCompleted && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <h4 className="font-medium text-green-800 mb-2">
                              Training Completed
                            </h4>
                            <p className="text-sm text-green-700">
                              This training session has been completed
                              successfully.
                            </p>
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
                        {!session.isCompleted && (
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

      {/* Add Training Modal */}
      <AddBascaTrainingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddTrainingSuccess}
      />
    </div>
  );
}
