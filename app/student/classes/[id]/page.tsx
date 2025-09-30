'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ClassesAPI } from '@/lib/api/classes';
import { type VARKModule } from '@/types/vark-module';
import {
  ArrowLeft,
  BookOpen,
  Target,
  Users,
  Calendar,
  Clock,
  GraduationCap,
  Star,
  PlayCircle,
  CheckCircle,
  Loader2,
  Eye,
  Headphones,
  PenTool,
  Zap,
  TrendingUp,
  Award,
  User,
  Mail,
  Bookmark
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Required for static export
// export async function generateStaticParams() {
//   // This function is required for static export but won't be used in dynamic routes
//   // Return empty array since this is a dynamic route
//   return [];
// }

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

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

const difficultyIcons = {
  beginner: GraduationCap,
  intermediate: Target,
  advanced: Star
};

interface ClassDetails {
  class: {
    id: string;
    name: string;
    description: string;
    subject: string;
    grade_level: string;
    created_at: string;
    updated_at: string;
    teacher: {
      id: string;
      name: string;
      email: string;
    };
    students: Array<{
      id: string;
      joined_at: string;
      first_name: string;
      last_name: string;
      full_name: string;
      email: string;
      learning_style: string;
      grade_level: string;
      profile_photo?: string;
    }>;
    student_count: number;
  };
  modules: VARKModule[];
  progress: any[];
  enrollment: {
    joined_at: string;
  };
}

export default function StudentClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'modules' | 'students'
  >('overview');

  const classId = params.id as string;

  useEffect(() => {
    if (classId && user) {
      loadClassDetails();
    }
  }, [classId, user]);

  const loadClassDetails = async () => {
    try {
      setLoading(true);
      const details = await ClassesAPI.getStudentClassDetails(
        classId,
        user!.id
      );
      setClassDetails(details);
    } catch (error) {
      console.error('Error loading class details:', error);
      toast.error('Failed to load class details');
      router.push('/student/classes');
    } finally {
      setLoading(false);
    }
  };

  const getModuleProgress = (moduleId: string) => {
    const progress = classDetails?.progress.find(p => p.module_id === moduleId);
    return progress?.progress_percentage || 0;
  };

  const getModuleStatus = (moduleId: string) => {
    const progress = classDetails?.progress.find(p => p.module_id === moduleId);
    if (!progress) return 'not_started';
    if (progress.progress_percentage === 100) return 'completed';
    if (progress.progress_percentage > 0) return 'in_progress';
    return 'not_started';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00af8f]" />
          <p className="text-lg text-gray-600">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Class not found
          </h3>
          <p className="text-gray-600 mb-4">
            The class you're looking for doesn't exist or you're not enrolled.
          </p>
          <Button
            onClick={() => router.push('/student/classes')}
            className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af90] text-white border-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  const { class: classInfo, modules, students } = classDetails;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <Button
                variant="ghost"
                onClick={() => router.push('/student/classes')}
                className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-12 h-12 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {classInfo.name}
                </h1>
                <p className="text-gray-600">
                  {classInfo.subject} • Grade {classInfo.grade_level}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-sm">
                {classInfo.student_count} Students
              </Badge>
              <Button
                onClick={() => router.push('/student/classes')}
                className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af90] text-white border-0">
                <BookOpen className="w-4 h-4 mr-2" />
                All Classes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'modules', label: 'Modules', icon: Target },
                { id: 'students', label: 'Classmates', icon: Users }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-[#00af8f] text-[#00af8f]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Class Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-[#00af8f]" />
                  <span>Class Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Description
                    </h3>
                    <p className="text-gray-600">
                      {classInfo.description || 'No description available.'}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Teacher
                        </p>
                        <p className="text-sm text-gray-600">
                          {classInfo.teacher.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Joined
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(
                            classDetails.enrollment.joined_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        Available Modules
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {modules.length}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Classmates
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {classInfo.student_count}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">
                        Subject
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {classInfo.subject}
                      </p>
                    </div>
                    <GraduationCap className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Modules */}
            {modules.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <Target className="w-5 h-5 text-[#00af8f]" />
                    <span>Recent Modules</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modules.slice(0, 3).map(module => (
                      <div
                        key={module.id}
                        className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:border-[#00af8f]/30 hover:shadow-md transition-all duration-200">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-lg flex items-center justify-center">
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
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Target className="w-5 h-5 text-[#00af8f]" />
                  <span>Available Modules ({modules.length})</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  VARK modules specifically designed for this class
                </p>
              </CardHeader>
              <CardContent>
                {modules.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No modules available
                    </h3>
                    <p className="text-gray-600">
                      Your teacher hasn't assigned any VARK modules to this
                      class yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map(module => {
                      const progress = getModuleProgress(module.id);
                      const status = getModuleStatus(module.id);
                      const DifficultyIcon =
                        difficultyIcons[
                          module.difficulty_level as keyof typeof difficultyIcons
                        ];

                      return (
                        <Card
                          key={module.id}
                          className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-lg flex items-center justify-center">
                                  <Target className="w-4 h-4 text-white" />
                                </div>
                                <Badge
                                  className={`text-xs ${
                                    difficultyColors[
                                      module.difficulty_level as keyof typeof difficultyColors
                                    ]
                                  }`}>
                                  <DifficultyIcon className="w-3 h-3 mr-1" />
                                  {module.difficulty_level}
                                </Badge>
                              </div>
                              <Badge
                                className={`text-xs ${getStatusColor(status)}`}>
                                {getStatusText(status)}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">
                              {module.title}
                            </CardTitle>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {module.description}
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {status !== 'not_started' && (
                              <div>
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-gray-600">
                                    Progress
                                  </span>
                                  <span className="font-medium">
                                    {progress}%
                                  </span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                            )}

                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {module.estimated_duration_minutes} min
                              </span>
                              {module.category && (
                                <span className="flex items-center">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  {module.category.subject}
                                </span>
                              )}
                            </div>

                            <Link href={`/student/vark-modules/${module.id}`}>
                              <Button className="w-full bg-[#00af8f] hover:bg-[#00af90] text-white">
                                {status === 'completed' ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Review
                                  </>
                                ) : status === 'in_progress' ? (
                                  <>
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    Continue
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    Start
                                  </>
                                )}
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Users className="w-5 h-5 text-[#00af8f]" />
                  <span>Classmates ({students.length})</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Students enrolled in this class
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map(student => {
                    const LearningStyleIcon =
                      learningStyleIcons[
                        student.learning_style as keyof typeof learningStyleIcons
                      ];

                    return (
                      <div
                        key={student.id}
                        className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-[#00af8f]/30 hover:shadow-md transition-all duration-200">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={student.profile_photo} />
                          <AvatarFallback className="bg-gradient-to-r from-[#00af8f] to-[#00af90] text-white">
                            {student.first_name?.charAt(0) ||
                              student.email?.charAt(0) ||
                              'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {student.full_name ||
                              `${student.first_name} ${student.last_name}`}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {student.email}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {student.grade_level}
                            </Badge>
                            {student.learning_style && (
                              <Badge variant="outline" className="text-xs">
                                <LearningStyleIcon className="w-3 h-3 mr-1" />
                                {
                                  learningStyleLabels[
                                    student.learning_style as keyof typeof learningStyleLabels
                                  ]
                                }
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
