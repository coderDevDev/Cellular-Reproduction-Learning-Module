'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  FileText,
  Activity,
  Calendar,
  Clock,
  Target,
  Award,
  Eye,
  Download,
  Filter,
  Calendar as CalendarIcon,
  PieChart,
  LineChart
} from 'lucide-react';

interface AnalyticsData {
  totalStudents: number;
  activeStudents: number;
  totalClasses: number;
  totalLessons: number;
  totalQuizzes: number;
  totalActivities: number;
  averageLessonProgress: number;
  averageQuizScore: number;
  averageActivityCompletion: number;
  learningStyleDistribution: {
    visual: number;
    auditory: number;
    reading_writing: number;
    kinesthetic: number;
  };
  monthlyProgress: {
    month: string;
    lessonProgress: number;
    quizScores: number;
    activityCompletion: number;
  }[];
  subjectPerformance: {
    subject: string;
    averageScore: number;
    studentCount: number;
  }[];
  recentActivity: {
    type: string;
    title: string;
    date: string;
    participants: number;
  }[];
}

export default function TeacherAnalyticsPage() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  // Mock data for demonstration
  useEffect(() => {
    const mockAnalyticsData: AnalyticsData = {
      totalStudents: 45,
      activeStudents: 42,
      totalClasses: 6,
      totalLessons: 24,
      totalQuizzes: 18,
      totalActivities: 32,
      averageLessonProgress: 78.5,
      averageQuizScore: 82.3,
      averageActivityCompletion: 85.7,
      learningStyleDistribution: {
        visual: 18,
        auditory: 12,
        reading_writing: 8,
        kinesthetic: 7
      },
      monthlyProgress: [
        {
          month: 'Oct',
          lessonProgress: 65,
          quizScores: 72,
          activityCompletion: 68
        },
        {
          month: 'Nov',
          lessonProgress: 72,
          quizScores: 78,
          activityCompletion: 75
        },
        {
          month: 'Dec',
          lessonProgress: 78,
          quizScores: 82,
          activityCompletion: 82
        },
        {
          month: 'Jan',
          lessonProgress: 82,
          quizScores: 85,
          activityCompletion: 88
        }
      ],
      subjectPerformance: [
        { subject: 'Mathematics', averageScore: 85.2, studentCount: 24 },
        { subject: 'English', averageScore: 78.9, studentCount: 18 },
        { subject: 'Physics', averageScore: 82.1, studentCount: 22 },
        { subject: 'History', averageScore: 76.5, studentCount: 15 }
      ],
      recentActivity: [
        {
          type: 'Lesson',
          title: 'Calculus Fundamentals',
          date: '2024-01-20',
          participants: 24
        },
        {
          type: 'Quiz',
          title: 'Literature Analysis',
          date: '2024-01-19',
          participants: 18
        },
        {
          type: 'Activity',
          title: 'Physics Lab Report',
          date: '2024-01-18',
          participants: 22
        },
        {
          type: 'Lesson',
          title: 'World War II',
          date: '2024-01-17',
          participants: 15
        }
      ]
    };

    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 80) return 'text-blue-600';
    if (progress >= 70) return 'text-yellow-600';
    if (progress >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressBadgeColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-100 text-green-800';
    if (progress >= 80) return 'bg-blue-100 text-blue-800';
    if (progress >= 70) return 'bg-yellow-100 text-yellow-800';
    if (progress >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00af8f]"></div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into your teaching performance
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent">
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <Button variant="outline" className="border-gray-300">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {analyticsData.totalStudents}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  Total Students
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {analyticsData.totalClasses}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  Active Classes
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700">
                  {analyticsData.totalLessons}
                </p>
                <p className="text-sm text-purple-600 font-medium">
                  Total Lessons
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-700">
                  {analyticsData.totalActivities}
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  Total Activities
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-[#00af8f]" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Lesson Progress</span>
              <Badge
                variant="secondary"
                className={getProgressBadgeColor(
                  analyticsData.averageLessonProgress
                )}>
                {analyticsData.averageLessonProgress}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Quiz Scores</span>
              <Badge
                variant="secondary"
                className={getProgressBadgeColor(
                  analyticsData.averageQuizScore
                )}>
                {analyticsData.averageQuizScore}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Activity Completion</span>
              <Badge
                variant="secondary"
                className={getProgressBadgeColor(
                  analyticsData.averageActivityCompletion
                )}>
                {analyticsData.averageActivityCompletion}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-[#00af8f]" />
              Learning Style Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(analyticsData.learningStyleDistribution).map(
              ([style, count]) => (
                <div key={style} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize">
                    {style.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{count}</span>
                    <span className="text-sm text-gray-500">
                      (
                      {((count / analyticsData.totalStudents) * 100).toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Award className="w-5 h-5 mr-2 text-[#00af8f]" />
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analyticsData.subjectPerformance.map(subject => (
              <div
                key={subject.subject}
                className="flex items-center justify-between">
                <span className="text-gray-600">{subject.subject}</span>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className={getProgressBadgeColor(subject.averageScore)}>
                    {subject.averageScore.toFixed(1)}%
                  </Badge>
                  <span className="text-sm text-gray-500">
                    ({subject.studentCount})
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Progress Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <LineChart className="w-5 h-5 mr-2 text-[#00af8f]" />
            Monthly Progress Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.monthlyProgress.map(month => (
              <div key={month.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">
                    {month.month}
                  </span>
                  <div className="flex space-x-4">
                    <span className="text-gray-600">
                      Lesson: {month.lessonProgress}%
                    </span>
                    <span className="text-gray-600">
                      Quiz: {month.quizScores}%
                    </span>
                    <span className="text-gray-600">
                      Activity: {month.activityCompletion}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-full"
                    style={{ width: `${month.lessonProgress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-[#00af8f]" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'Lesson'
                        ? 'bg-blue-100 text-blue-600'
                        : activity.type === 'Quiz'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-purple-100 text-purple-600'
                    }`}>
                    {activity.type === 'Lesson' ? (
                      <BookOpen className="w-4 h-4" />
                    ) : activity.type === 'Quiz' ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <Activity className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">{activity.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{activity.participants} participants</span>
                  <span>{new Date(activity.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Detailed Reports
            </h3>
            <p className="text-sm text-gray-600">
              Generate comprehensive performance reports
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Export Data</h3>
            <p className="text-sm text-gray-600">
              Download analytics data for external analysis
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Set Goals</h3>
            <p className="text-sm text-gray-600">
              Define and track performance targets
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}






