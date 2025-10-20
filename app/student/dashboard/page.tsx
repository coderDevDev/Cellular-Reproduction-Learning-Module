'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  StudentDashboardAPI,
  type DashboardStats,
  type RecentActivity,
  type ProgressData
} from '@/lib/api/student-dashboard';
import { VARKModulesAPI } from '@/lib/api/vark-modules';
import { ClassesAPI } from '@/lib/api/classes';
import {
  BookOpen,
  FileText,
  Activity,
  BarChart3,
  Eye,
  Headphones,
  PenTool,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  PlayCircle,
  Calendar,
  Target,
  Loader2,
  Award,
  Trophy,
  Star,
  Users,
  Bookmark,
  ArrowRight,
  Plus,
  Clock3,
  Target as TargetIcon,
  Zap as ZapIcon,
  Brain,
  Lightbulb,
  Rocket,
  GraduationCap,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const learningStyleIcons = {
  visual: Eye,
  auditory: Headphones,
  reading_writing: PenTool,
  kinesthetic: Zap
};

const learningStyleColors = {
  visual: 'from-blue-500 to-blue-600',
  auditory: 'from-green-500 to-green-600',
  reading_writing: 'from-purple-500 to-purple-600',
  kinesthetic: 'from-orange-500 to-orange-600'
};

const learningStyleLabels = {
  visual: 'Visual',
  auditory: 'Auditory',
  reading_writing: 'Reading/Writing',
  kinesthetic: 'Kinesthetic'
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return CheckCircle;
    case 'in_progress':
      return Clock;
    case 'urgent':
      return Calendar;
    default:
      return Clock;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'urgent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Done';
    case 'in_progress':
      return 'In Progress';
    case 'urgent':
      return 'Urgent';
    default:
      return 'Pending';
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4)
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [recommendedModules, setRecommendedModules] = useState<any[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load dashboard statistics
      const statsData = await StudentDashboardAPI.getDashboardStats(user!.id);
      setStats(statsData);

      // Load recent activities
      const activitiesData = await StudentDashboardAPI.getRecentActivities(
        user!.id
      );
      setRecentActivities(activitiesData);

      // Load progress data
      const progressData = await StudentDashboardAPI.getProgressData(user!.id);
      setProgress(progressData);

      // Load recommended modules based on learning style
      const userLearningStyle = user?.learningStyle || 'visual';
      const varkAPI = new VARKModulesAPI();
      const modulesData = await varkAPI.getModules();
      const recommended = modulesData
        .filter(
          (module: any) =>
            module.target_learning_styles?.includes(userLearningStyle) ||
            module.category?.learning_style === userLearningStyle
        )
        .slice(0, 3);
      setRecommendedModules(recommended);

      // Load enrolled classes
      try {
        const classesData = await ClassesAPI.getStudentClasses(user!.id);
        setEnrolledClasses(classesData);
      } catch (error) {
        console.error('Error loading enrolled classes:', error);
        setEnrolledClasses([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00af8f]" />
          <p className="text-lg text-gray-600">
            Loading your learning dashboard...
          </p>
        </div>
      </div>
    );
  }

  const userLearningStyle = user?.learningStyle || 'visual';
  const LearningStyleIcon =
    learningStyleIcons[userLearningStyle as keyof typeof learningStyleIcons];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back,{' '}
                  {user?.fullName?.split(' ')[0] ||
                    user?.firstName ||
                    'Student'}
                  ! 👋
                </h1>
                <p className="text-gray-600">
                  Ready to continue your learning journey?
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-gray-300 hover:bg-gray-50">
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                onClick={() => (window.location.href = '/student/vark-modules')}
                className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af90] text-white border-0">
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Learning
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Learning Style Profile */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-[#00af8f]/5 to-[#00af90]/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${
                    learningStyleColors[
                      userLearningStyle as keyof typeof learningStyleColors
                    ]
                  } rounded-full flex items-center justify-center shadow-lg`}>
                  <LearningStyleIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {user?.learningType && user.learningType}
                    <span className="text-gray-600 ml-4"> Learner</span>
                  </h3>
                  <p className="text-gray-600">
                    Your learning style is optimized for
                    {user?.preferredModules &&
                      user.preferredModules.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.preferredModules
                            .slice(0, 4)
                            .map((module: string, idx: number) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs px-1.5 py-0 bg-gradient-to-r from-[#00af8f]/10 to-teal-400/10 text-[#00af8f] border border-[#00af8f]/20">
                                {module}
                              </Badge>
                            ))}
                          {user.preferredModules.length > 4 && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0 bg-gray-100 text-gray-600">
                              +{user.preferredModules.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#00af8f]">
                  {stats?.lessonsCompleted || 0}
                </div>
                <div className="text-sm text-gray-500">Modules Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Modules
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats?.totalLessons || 0}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Available to learn
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Quiz Average
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats?.quizAverage || 0}%
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Your performance
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Activities
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stats?.activitiesSubmitted || 0}/
                    {stats?.totalActivities || 0}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Completed/Total
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Time Spent
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {stats?.totalTimeSpent || 0}h
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Learning this week
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommended Modules */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <Target className="w-5 h-5 text-[#00af8f]" />
                    <span>Recommended for You</span>
                  </CardTitle>
                  <Link href="/student/vark-modules">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#00af8f] hover:text-[#00af90]">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-gray-600">
                  Modules tailored to your{' '}
                  {learningStyleLabels[
                    userLearningStyle as keyof typeof learningStyleLabels
                  ].toLowerCase()}{' '}
                  learning style
                </p>
              </CardHeader>
              <CardContent>
                {recommendedModules.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No recommended modules yet</p>
                    <p className="text-sm text-gray-400">
                      Complete your profile to get personalized recommendations
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendedModules.map(module => (
                      <div
                        key={module.id}
                        className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:border-[#00af8f]/30 hover:shadow-md transition-all duration-200">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-12 h-12 bg-gradient-to-r ${
                              learningStyleColors[
                                userLearningStyle as keyof typeof learningStyleColors
                              ]
                            } rounded-lg flex items-center justify-center`}>
                            <Target className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {module.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {module.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {module.difficulty_level}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {module.estimated_duration_minutes} min
                            </Badge>
                          </div>
                        </div>
                        <Link href={`/student/vark-modules/${module.id}`}>
                          <Button
                            size="sm"
                            className="bg-[#00af8f] hover:bg-[#00af90] text-white">
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-[#00af8f]" />
                  <span>Recent Activities</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Your latest learning progress
                </p>
              </CardHeader>
              <CardContent>
                {recentActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activities</p>
                    <p className="text-sm text-gray-400">
                      Start learning to see your progress
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivities.slice(0, 5).map(activity => {
                      const StatusIcon = getStatusIcon(activity.status);
                      return (
                        <div
                          key={activity.id}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div
                            className={`w-8 h-8 ${activity.color} rounded-lg flex items-center justify-center`}>
                            <StatusIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTimestamp(activity.timestamp)}
                            </p>
                          </div>
                          <Badge
                            className={getStatusColor(activity.status)}
                            variant="secondary">
                            {getStatusText(activity.status)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enrolled Classes */}
        {enrolledClasses.length > 0 && (
          <Card className="mt-8 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#00af8f]" />
                <span>Your Classes</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Classes you're currently enrolled in
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledClasses.map(classItem => (
                  <div
                    key={classItem.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#00af8f]/30 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {classItem.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {classItem.subject}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Students:</span>
                        <span className="font-medium">
                          {classItem.students?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Modules:</span>
                        <span className="font-medium">
                          {classItem.modules?.length || 0}
                        </span>
                      </div>
                    </div>
                    <Link href={`/student/classes/${classItem.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3">
                        View Class
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Tips */}
        <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-[#00af8f]/5 to-[#00af90]/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-full flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Learning Tip of the Day
                </h3>
                <p className="text-gray-700 mb-3">
                  As a{' '}
                  {learningStyleLabels[
                    userLearningStyle as keyof typeof learningStyleLabels
                  ].toLowerCase()}{' '}
                  learner, try to{' '}
                  {userLearningStyle === 'visual'
                    ? 'use diagrams and charts to visualize concepts'
                    : userLearningStyle === 'auditory'
                    ? 'read content aloud or discuss with peers'
                    : userLearningStyle === 'reading_writing'
                    ? 'take detailed notes and rewrite information in your own words'
                    : 'engage in hands-on activities and physical movement while learning'}
                  .
                </p>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-[#00af8f]/20 text-[#00af8f]">
                    Personalized Tip
                  </Badge>
                  <Badge variant="outline">Daily</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
