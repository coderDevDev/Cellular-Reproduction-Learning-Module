'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Filter,
  Eye,
  FileText,
  Activity,
  GraduationCap,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Award
} from 'lucide-react';
import { BascaMembersAPI } from '@/lib/api/basca-members';
import { BascaMeetingsAPI } from '@/lib/api/basca-meetings';
import { BascaActivitiesAPI } from '@/lib/api/basca-activities';
import { BascaTrainingAPI } from '@/lib/api/basca-training';
import { useToast } from '@/hooks/use-toast';
import type {
  BascaMember,
  BascaMeeting,
  BascaActivity,
  BascaTraining
} from '@/types/basca';

export default function BASCAReportsDashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedBarangay, setSelectedBarangay] = useState('all');

  const [members, setMembers] = useState<BascaMember[]>([]);
  const [meetings, setMeetings] = useState<BascaMeeting[]>([]);
  const [activities, setActivities] = useState<BascaActivity[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<BascaTraining[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [membersData, meetingsData, activitiesData, trainingData] =
        await Promise.all([
          BascaMembersAPI.getAllMembers(),
          BascaMeetingsAPI.getAllMeetings(),
          BascaActivitiesAPI.getAllActivities(),
          BascaTrainingAPI.getAllTrainingSessions()
        ]);

      setMembers(membersData);
      setMeetings(meetingsData);
      setActivities(activitiesData);
      setTrainingSessions(trainingData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data for reports',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateOverviewStats = () => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const totalMeetings = meetings.length;
    const completedMeetings = meetings.filter(m => m.isCompleted).length;
    const totalActivities = activities.length;
    const completedActivities = activities.filter(a => a.isCompleted).length;
    const totalTraining = trainingSessions.length;
    const completedTraining = trainingSessions.filter(
      t => t.isCompleted
    ).length;

    return {
      totalMembers,
      activeMembers,
      totalMeetings,
      completedMeetings,
      totalActivities,
      completedActivities,
      totalTraining,
      completedTraining
    };
  };

  const calculateBarangayStats = () => {
    const barangayData: { [key: string]: any } = {};

    members.forEach(member => {
      if (!barangayData[member.barangay]) {
        barangayData[member.barangay] = {
          members: 0,
          meetings: 0,
          activities: 0,
          training: 0
        };
      }
      barangayData[member.barangay].members++;
    });

    meetings.forEach(meeting => {
      if (barangayData[meeting.barangay]) {
        barangayData[meeting.barangay].meetings++;
      }
    });

    activities.forEach(activity => {
      if (barangayData[activity.barangay]) {
        barangayData[activity.barangay].activities++;
      }
    });

    trainingSessions.forEach(session => {
      if (barangayData[session.barangay]) {
        barangayData[session.barangay].training++;
      }
    });

    return barangayData;
  };

  const calculateMonthlyTrends = () => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    const currentYear = new Date().getFullYear();

    const monthlyData = months.map((month, index) => {
      const monthStart = new Date(currentYear, index, 1);
      const monthEnd = new Date(currentYear, index + 1, 0);

      const meetingsCount = meetings.filter(m => {
        const meetingDate = new Date(m.meetingDate);
        return meetingDate >= monthStart && meetingDate <= monthEnd;
      }).length;

      const activitiesCount = activities.filter(a => {
        const activityDate = new Date(a.activityDate);
        return activityDate >= monthStart && activityDate <= monthEnd;
      }).length;

      const trainingCount = trainingSessions.filter(t => {
        const trainingDate = new Date(t.trainingDate);
        return trainingDate >= monthStart && trainingDate <= monthEnd;
      }).length;

      return {
        month,
        meetings: meetingsCount,
        activities: activitiesCount,
        training: trainingCount
      };
    });

    return monthlyData;
  };

  const calculateMemberDemographics = () => {
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56-65': 0,
      '65+': 0
    };

    const genderDistribution = {
      Male: 0,
      Female: 0
    };

    const educationLevels = {
      Elementary: 0,
      'High School': 0,
      College: 0,
      'Post Graduate': 0
    };

    members.forEach(member => {
      // Age calculation
      if (member.birthDate) {
        const birthDate = new Date(member.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        if (age >= 18 && age <= 25) ageGroups['18-25']++;
        else if (age >= 26 && age <= 35) ageGroups['26-35']++;
        else if (age >= 36 && age <= 45) ageGroups['36-45']++;
        else if (age >= 46 && age <= 55) ageGroups['46-55']++;
        else if (age >= 56 && age <= 65) ageGroups['56-65']++;
        else if (age > 65) ageGroups['65+']++;
      }

      // Gender
      if (member.gender) {
        genderDistribution[member.gender as keyof typeof genderDistribution]++;
      }

      // Education
      if (member.educationalAttainment) {
        const education = member.educationalAttainment;
        if (education.includes('Elementary')) educationLevels['Elementary']++;
        else if (education.includes('High School'))
          educationLevels['High School']++;
        else if (education.includes('College')) educationLevels['College']++;
        else if (education.includes('Post Graduate'))
          educationLevels['Post Graduate']++;
      }
    });

    return { ageGroups, genderDistribution, educationLevels };
  };

  const calculateActivityEffectiveness = () => {
    const activityTypes = activities.reduce((acc, activity) => {
      if (!acc[activity.activityType]) {
        acc[activity.activityType] = {
          total: 0,
          completed: 0,
          totalParticipants: 0,
          avgParticipants: 0
        };
      }

      acc[activity.activityType].total++;
      if (activity.isCompleted) {
        acc[activity.activityType].completed++;
      }
      acc[activity.activityType].totalParticipants +=
        activity.actualParticipants;

      return acc;
    }, {} as any);

    // Calculate averages
    Object.keys(activityTypes).forEach(type => {
      activityTypes[type].avgParticipants = Math.round(
        activityTypes[type].totalParticipants / activityTypes[type].total
      );
    });

    return activityTypes;
  };

  const handleExportReport = (reportType: string) => {
    let csvContent = '';

    switch (reportType) {
      case 'overview':
        csvContent = generateOverviewCSV();
        break;
      case 'barangay':
        csvContent = generateBarangayCSV();
        break;
      case 'monthly':
        csvContent = generateMonthlyCSV();
        break;
      case 'demographics':
        csvContent = generateDemographicsCSV();
        break;
      default:
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `basca-${reportType}-report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateOverviewCSV = () => {
    const stats = calculateOverviewStats();
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Members', stats.totalMembers],
      ['Active Members', stats.activeMembers],
      ['Total Meetings', stats.totalMeetings],
      ['Completed Meetings', stats.completedMeetings],
      ['Total Activities', stats.totalActivities],
      ['Completed Activities', stats.completedActivities],
      ['Total Training Sessions', stats.totalTraining],
      ['Completed Training Sessions', stats.completedTraining]
    ];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateBarangayCSV = () => {
    const barangayData = calculateBarangayStats();
    const headers = [
      'Barangay',
      'Members',
      'Meetings',
      'Activities',
      'Training Sessions'
    ];
    const rows = Object.entries(barangayData).map(([barangay, data]) => [
      barangay,
      data.members,
      data.meetings,
      data.activities,
      data.training
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateMonthlyCSV = () => {
    const monthlyData = calculateMonthlyTrends();
    const headers = ['Month', 'Meetings', 'Activities', 'Training Sessions'];
    const rows = monthlyData.map(data => [
      data.month,
      data.meetings,
      data.activities,
      data.training
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateDemographicsCSV = () => {
    const demographics = calculateMemberDemographics();
    const headers = ['Category', 'Subcategory', 'Count'];
    const rows = [
      ...Object.entries(demographics.ageGroups).map(([age, count]) => [
        'Age Group',
        age,
        count
      ]),
      ...Object.entries(demographics.genderDistribution).map(
        ([gender, count]) => ['Gender', gender, count]
      ),
      ...Object.entries(demographics.educationLevels).map(
        ([education, count]) => ['Education', education, count]
      )
    ];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const stats = calculateOverviewStats();
  const barangayData = calculateBarangayStats();
  const monthlyTrends = calculateMonthlyTrends();
  const demographics = calculateMemberDemographics();
  const activityEffectiveness = calculateActivityEffectiveness();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] via-[#F0EDE8] to-[#E6B800]/20 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#333333] mb-2">
            BASCA Reports & Analytics
          </h1>
          <p className="text-lg lg:text-xl text-[#666666]">
            Comprehensive insights and analytics for BASCA operations
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <Select
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <Select
                    value={selectedBarangay}
                    onValueChange={setSelectedBarangay}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Barangays</SelectItem>
                      {Object.keys(barangayData).map(barangay => (
                        <SelectItem key={barangay} value={barangay}>
                          {barangay}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('overview')}
                  className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Overview
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport('barangay')}
                  className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Barangay Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#666666] mb-1">
                    Total Members
                  </p>
                  <p className="text-2xl font-bold text-[#333333]">
                    {stats.totalMembers}
                  </p>
                  <p className="text-sm text-[#00B5AD]">
                    {stats.activeMembers} active
                  </p>
                </div>
                <div className="p-3 rounded-full bg-[#E6B800] bg-opacity-10">
                  <Users className="w-6 h-6 text-[#E6B800]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#666666] mb-1">
                    Meetings
                  </p>
                  <p className="text-2xl font-bold text-[#333333]">
                    {stats.totalMeetings}
                  </p>
                  <p className="text-sm text-[#00B5AD]">
                    {stats.completedMeetings} completed
                  </p>
                </div>
                <div className="p-3 rounded-full bg-[#00B5AD] bg-opacity-10">
                  <Calendar className="w-6 h-6 text-[#00B5AD]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#666666] mb-1">
                    Activities
                  </p>
                  <p className="text-2xl font-bold text-[#333333]">
                    {stats.totalActivities}
                  </p>
                  <p className="text-sm text-[#00B5AD]">
                    {stats.completedActivities} completed
                  </p>
                </div>
                <div className="p-3 rounded-full bg-[#FF6B6B] bg-opacity-10">
                  <Activity className="w-6 h-6 text-[#FF6B6B]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#666666] mb-1">
                    Training Sessions
                  </p>
                  <p className="text-2xl font-bold text-[#333333]">
                    {stats.totalTraining}
                  </p>
                  <p className="text-sm text-[#00B5AD]">
                    {stats.completedTraining} completed
                  </p>
                </div>
                <div className="p-3 rounded-full bg-[#4ECDC4] bg-opacity-10">
                  <GraduationCap className="w-6 h-6 text-[#4ECDC4]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Barangay Performance */}
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Barangay Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(barangayData).map(([barangay, data]) => (
                  <div
                    key={barangay}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{barangay}</h4>
                      <p className="text-sm text-gray-600">
                        {data.members} members • {data.activities} activities
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {data.meetings} meetings
                      </p>
                      <p className="text-sm text-gray-600">
                        {data.training} training
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrends.map(data => (
                  <div
                    key={data.month}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">{data.month}</h4>
                    <div className="flex gap-4 text-sm">
                      <span className="text-blue-600">
                        {data.meetings} meetings
                      </span>
                      <span className="text-green-600">
                        {data.activities} activities
                      </span>
                      <span className="text-purple-600">
                        {data.training} training
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Member Demographics */}
        <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Member Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Age Groups */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Age Distribution
                </h4>
                <div className="space-y-2">
                  {Object.entries(demographics.ageGroups).map(
                    ([age, count]) => (
                      <div
                        key={age}
                        className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{age}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Gender */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Gender Distribution
                </h4>
                <div className="space-y-2">
                  {Object.entries(demographics.genderDistribution).map(
                    ([gender, count]) => (
                      <div
                        key={gender}
                        className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{gender}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Education Levels
                </h4>
                <div className="space-y-2">
                  {Object.entries(demographics.educationLevels).map(
                    ([education, count]) => (
                      <div
                        key={education}
                        className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {education}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Effectiveness */}
        <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Activity Effectiveness by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(activityEffectiveness).map(([type, data]) => (
                <div
                  key={type}
                  className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {type.replace('_', ' ')}
                    </h4>
                    <Badge className="bg-blue-100 text-blue-800">
                      {data.completed}/{data.total} completed
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="font-medium">{data.total}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Avg Participants</p>
                      <p className="font-medium">{data.avgParticipants}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Completion Rate</p>
                      <p className="font-medium">
                        {Math.round((data.completed / data.total) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
