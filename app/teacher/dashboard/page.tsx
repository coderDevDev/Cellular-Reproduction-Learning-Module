'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TeacherDashboardAPI,
  type TeacherDashboardStats,
  type LearningStyleDistribution,
  type LearningTypeDistribution,
  type RecentCompletion
} from '@/lib/api/teacher-dashboard';
import {
  Users,
  BookOpen,
  FileText,
  Activity,
  BarChart3,
  Eye,
  Headphones,
  PenTool,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Layers,
  Grid2X2,
  Grid3X3,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';

const learningStyleIcons = {
  visual: Eye,
  auditory: Headphones,
  reading_writing: PenTool,
  kinesthetic: Zap
};

const learningStyleColors = {
  visual: 'bg-gradient-to-br from-blue-500 to-blue-600',
  auditory: 'bg-gradient-to-br from-green-500 to-green-600',
  reading_writing: 'bg-gradient-to-br from-purple-500 to-purple-600',
  kinesthetic: 'bg-gradient-to-br from-orange-500 to-orange-600'
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  return date.toLocaleDateString();
};

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [learningStyleDistribution, setLearningStyleDistribution] =
    useState<LearningStyleDistribution | null>(null);
  const [learningTypeDistribution, setLearningTypeDistribution] =
    useState<LearningTypeDistribution | null>(null);
  const [recentCompletions, setRecentCompletions] = useState<
    RecentCompletion[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        setError(null);

        const [statsData, styleDistribution, typeDistribution, completionsData] =
          await Promise.all([
            TeacherDashboardAPI.getDashboardStats(user.id),
            TeacherDashboardAPI.getLearningStyleDistribution(user.id),
            TeacherDashboardAPI.getLearningTypeDistribution(user.id),
            TeacherDashboardAPI.getRecentCompletions(user.id)
          ]);

        setStats(statsData);
        setLearningStyleDistribution(styleDistribution);
        setLearningTypeDistribution(typeDistribution);
        setRecentCompletions(completionsData);
      } catch (err) {
        console.error('Error fetching teacher dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00af8f]"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#00af8f]/20 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white px-6 py-2 rounded-lg font-medium">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 lg:mb-3">
          Welcome back, {user.firstName || user.fullName}!
        </h1>
        <p className="text-base lg:text-lg text-gray-600">
          Here's your educator dashboard overview
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-blue-700">
                  {stats?.totalStudents || 0}
                </p>
                <p className="text-xs lg:text-sm text-blue-600 font-medium">
                  Total Students
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-green-700">
                  {stats?.publishedModules || 0}
                </p>
                <p className="text-xs lg:text-sm text-green-600 font-medium">
                  Published Modules
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-purple-700">
                  {stats?.totalModules || 0}
                </p>
                <p className="text-xs lg:text-sm text-purple-600 font-medium">
                  Total Modules
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-orange-700">
                  {stats?.completedModules || 0}
                </p>
                <p className="text-xs lg:text-sm text-orange-600 font-medium">
                  Completed Modules
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Distributions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Learning Style Distribution (VARK) */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg lg:text-xl font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-[#00af8f]" />
              Learning Style (VARK)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              {learningStyleDistribution &&
                Object.entries(learningStyleDistribution).map(
                  ([style, count]) => {
                    const Icon =
                      learningStyleIcons[
                        style as keyof typeof learningStyleIcons
                      ];
                    const color =
                      learningStyleColors[
                        style as keyof typeof learningStyleColors
                      ];
                    return (
                      <div key={style} className="text-center">
                        <div
                          className={`w-16 h-16 lg:w-20 lg:h-20 ${color} rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-lg`}>
                          <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                        </div>
                        <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                          {count}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600 capitalize font-medium">
                          {style.replace('_', ' ')}
                        </p>
                      </div>
                    );
                  }
                )}
            </div>
          </CardContent>
        </Card>

        {/* Learning Type Distribution (Modality) */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg lg:text-xl font-semibold text-gray-900 flex items-center">
              <Layers className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-[#00af8f]" />
              Learning Modality Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              {learningTypeDistribution &&
                Object.entries(learningTypeDistribution)
                  .filter(([type]) => type !== 'not_set')
                  .map(([type, count]) => {
                    const icons = {
                      unimodal: Eye,
                      bimodal: Grid2X2,
                      trimodal: Grid3X3,
                      multimodal: LayoutGrid
                    };
                    const colors = {
                      unimodal: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
                      bimodal: 'bg-gradient-to-br from-pink-500 to-pink-600',
                      trimodal: 'bg-gradient-to-br from-teal-500 to-teal-600',
                      multimodal: 'bg-gradient-to-br from-amber-500 to-amber-600'
                    };
                    const Icon = icons[type as keyof typeof icons];
                    const color = colors[type as keyof typeof colors];
                    return (
                      <div key={type} className="text-center">
                        <div
                          className={`w-16 h-16 lg:w-20 lg:h-20 ${color} rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-lg`}>
                          <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                        </div>
                        <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                          {count}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600 capitalize font-medium">
                          {type}
                        </p>
                      </div>
                    );
                  })}
            </div>
            {learningTypeDistribution && learningTypeDistribution.not_set > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  {learningTypeDistribution.not_set} student{learningTypeDistribution.not_set !== 1 ? 's' : ''} without learning type set
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Module Completions */}
      <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg lg:text-xl font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-[#00af8f]" />
              Recent Module Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 lg:space-y-4">
              {recentCompletions.length > 0 ? (
                recentCompletions.map(completion => {
                  return (
                    <div
                      key={completion.id}
                      className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <div
                        className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 mb-1 text-sm lg:text-base truncate">
                          {completion.moduleTitle}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600 mb-1 truncate">
                          Completed by {completion.studentName}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimestamp(completion.completionDate)} • {Math.floor(completion.timeSpentMinutes / 60)}h {completion.timeSpentMinutes % 60}m
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1 lg:space-y-2 flex-shrink-0">
                        <div className="text-center">
                          <span className="text-xs text-gray-500">Score</span>
                          <p className="text-sm lg:text-lg font-bold text-green-600">
                            {completion.finalScore.toFixed(1)}%
                          </p>
                        </div>
                        {completion.perfectSections > 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800 font-medium text-xs">
                            {completion.perfectSections} Perfect
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 lg:py-12">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                    <Activity className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2 text-sm lg:text-base">
                    No recent completions
                  </p>
                  <p className="text-xs lg:text-sm text-gray-400">
                    Student module completions will appear here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
