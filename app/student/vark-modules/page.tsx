'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { VARKModulesAPI } from '@/lib/api/vark-modules';
import { ClassesAPI } from '@/lib/api/classes';
import ModuleCompletionBadge from '@/components/student/module-completion-badge';
import {
  type VARKModule,
  type VARKModuleCategory,
  type VARKModuleProgress
} from '@/types/vark-module';
import {
  BookOpen,
  Eye,
  Headphones,
  PenTool,
  Zap,
  PlayCircle,
  CheckCircle,
  Clock,
  Target,
  Star,
  Search,
  Filter,
  TrendingUp,
  Award,
  Trophy,
  Download,
  Calendar as CalendarIcon,
  Loader2,
  ArrowRight,
  Bookmark,
  Calendar,
  Timer,
  Users,
  Lock,
  Unlock,
  EyeOff,
  BookmarkPlus,
  BookmarkCheck,
  RefreshCw,
  Sparkles,
  Target as TargetIcon,
  Zap as ZapIcon,
  Brain,
  Lightbulb,
  Rocket,
  GraduationCap,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3
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

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

const difficultyIcons = {
  beginner: GraduationCap,
  intermediate: Target,
  advanced: Rocket
};

export default function StudentVARKModulesPage() {
  const { user } = useAuth();
  const [modules, setModules] = useState<VARKModule[]>([]);
  const [categories, setCategories] = useState<VARKModuleCategory[]>([]);
  const [progress, setProgress] = useState<VARKModuleProgress[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLearningStyle, setSelectedLearningStyle] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [viewMode, setViewMode] = useState<
    'all' | 'recommended' | 'in-progress' | 'completed'
  >('all');
  const [bookmarkedModules, setBookmarkedModules] = useState<string[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedModuleForResults, setSelectedModuleForResults] = useState<
    string | null
  >(null);
  const [resultsData, setResultsData] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const varkAPI = new VARKModulesAPI();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all available modules
      const modulesData = await varkAPI.getModules();

      // Show ALL published modules to students
      // Content filtering will apply when viewing module sections/content
      const filteredModules = modulesData.filter(module => {
        // Only filter by published status
        return module.is_published === true;
      });

      setModules(filteredModules);

      // Load student's progress data (includes completed modules) - LOAD THIS FIRST
      console.log('🔄 Loading student progress for user:', user!.id);
      try {
        const progressData = await varkAPI.getStudentProgress(user!.id);
        console.log('✅ Student progress loaded:', progressData);
        setProgress(progressData);
      } catch (error) {
        console.error('❌ Error loading progress:', error);
        setProgress([]);
      }

      // Load student's enrolled classes
      try {
        const classesData = await ClassesAPI.getStudentClasses(user!.id);
        setEnrolledClasses(classesData);
      } catch (error) {
        console.error('Error loading enrolled classes:', error);
        setEnrolledClasses([]);
      }
    } catch (error) {
      console.error('Error loading VARK modules data:', error);
      toast.error('Failed to load VARK modules data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = (moduleId: string) => {
    setBookmarkedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
    toast.success(
      bookmarkedModules.includes(moduleId)
        ? 'Module removed from bookmarks'
        : 'Module added to bookmarks'
    );
  };

  const handleViewResults = async (moduleId: string) => {
    try {
      setLoadingResults(true);
      setSelectedModuleForResults(moduleId);
      setShowResultsModal(true);

      // Load module data
      const module = await varkAPI.getModuleById(moduleId);

      // Load completion data
      const completionData = await varkAPI.getStudentModuleCompletion(
        user!.id,
        moduleId
      );

      // Load all section submissions
      const submissionsData = await varkAPI.getStudentSubmissions(
        user!.id,
        moduleId
      );

      setResultsData({
        module,
        completion: completionData,
        submissions: submissionsData
      });

      console.log('📊 Results loaded:', { completionData, submissionsData });
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load results');
      setShowResultsModal(false);
    } finally {
      setLoadingResults(false);
    }
  };

  const downloadResults = () => {
    if (!resultsData) return;

    const exportData = {
      module: resultsData.module?.title,
      student: user?.firstName + ' ' + user?.lastName,
      completion: resultsData.completion,
      submissions: resultsData.submissions
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resultsData.module?.title}-results-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Results downloaded!');
  };

  const getModuleProgress = (moduleId: string) => {
    const moduleProgress = progress.find(p => p.module_id === moduleId);
    return moduleProgress?.progress_percentage || 0;
  };

  const getModuleStatus = (moduleId: string) => {
    const moduleProgress = progress.find(p => p.module_id === moduleId);
    if (!moduleProgress) return 'not_started';

    // Check status field first (set by getStudentProgress for completed modules)
    if (moduleProgress.status === 'completed') return 'completed';

    // Fallback to progress percentage
    if (moduleProgress.progress_percentage === 100) return 'completed';
    if (moduleProgress.progress_percentage > 0) return 'in_progress';
    return 'not_started';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'in_progress':
        return Clock3;
      case 'not_started':
        return PlayCircle;
      default:
        return PlayCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_started':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'View Results';
      case 'in_progress':
        return 'Continue Learning';
      case 'not_started':
        return 'Start Learning';
      default:
        return 'Start';
    }
  };

  // Check if module is locked due to prerequisite
  const isModuleLocked = (module: VARKModule) => {
    const prerequisiteId = (module as any).prerequisite_module_id;
    if (!prerequisiteId) return false; // No prerequisite = unlocked

    // Check if prerequisite module is completed
    const prerequisiteProgress = progress.find(
      p => p.module_id === prerequisiteId
    );

    if (!prerequisiteProgress) {
      console.log(
        `🔒 Module "${module.title}" is LOCKED - prerequisite not started`
      );
      return true; // Locked if no progress
    }

    // Unlocked if prerequisite is completed (check both status and percentage)
    const isPrerequisiteCompleted =
      prerequisiteProgress.status === 'completed' ||
      prerequisiteProgress.progress_percentage === 100;

    console.log(
      `🔓 Module "${module.title}" - Prerequisite completed:`,
      isPrerequisiteCompleted,
      prerequisiteProgress
    );

    return !isPrerequisiteCompleted; // Locked if prerequisite NOT completed
  };

  // Get prerequisite module info
  const getPrerequisiteModule = (module: VARKModule) => {
    const prerequisiteId = (module as any).prerequisite_module_id;
    if (!prerequisiteId) return null;
    return modules.find(m => m.id === prerequisiteId);
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch =
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject =
      selectedSubject === 'all' || module.category?.subject === selectedSubject;

    const matchesDifficulty =
      selectedDifficulty === 'all' ||
      module.difficulty_level === selectedDifficulty;

    const matchesCategory =
      selectedCategory === 'all' || module.category_id === selectedCategory;

    const matchesLearningStyle =
      selectedLearningStyle === 'all' ||
      (module.target_learning_styles &&
        module.target_learning_styles.includes(selectedLearningStyle as any)) ||
      module.category?.learning_style === selectedLearningStyle;

    const matchesClass =
      selectedClass === 'all' ||
      !module.target_class_id ||
      module.target_class_id === selectedClass;

    // Apply view mode filters
    let matchesViewMode = true;
    if (viewMode === 'recommended') {
      const userLearningStyle = user?.learningStyle || 'visual';
      matchesViewMode =
        module.target_learning_styles?.includes(userLearningStyle as any) ||
        module.category?.learning_style === userLearningStyle;
    } else if (viewMode === 'in-progress') {
      matchesViewMode = getModuleStatus(module.id) === 'in_progress';
    } else if (viewMode === 'completed') {
      matchesViewMode = getModuleStatus(module.id) === 'completed';
    }

    return (
      matchesSearch &&
      matchesSubject &&
      matchesDifficulty &&
      matchesCategory &&
      matchesLearningStyle &&
      matchesClass &&
      matchesViewMode
    );
  });

  const subjects = Array.from(new Set(categories.map(cat => cat.subject)));
  const learningStyles = [
    'visual',
    'auditory',
    'reading_writing',
    'kinesthetic'
  ];
  const difficultyLevels = ['beginner', 'intermediate', 'advanced'];

  const userLearningStyle = user?.learningStyle || 'visual';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00af8f]" />
          <p className="text-lg text-gray-600">
            Loading your learning modules...
          </p>
        </div>
      </div>
    );
  }

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
                  VARK Learning Modules
                </h1>
                <p className="text-gray-600">
                  Personalized learning content tailored to your{' '}
                  {learningStyleLabels[
                    userLearningStyle as keyof typeof learningStyleLabels
                  ].toLowerCase()}{' '}
                  learning style
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={loadData}
                className="border-gray-300 hover:bg-gray-50">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => (window.location.href = '/student/dashboard')}
                className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af90] text-white border-0">
                <BookOpen className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Mode Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              {
                key: 'all',
                label: 'All Modules',
                icon: BookOpen,
                count: modules.length
              },
              {
                key: 'recommended',
                label: 'Recommended',
                icon: Sparkles,
                count: modules.filter(
                  m =>
                    m.target_learning_styles?.includes(
                      userLearningStyle as any
                    ) || m.category?.learning_style === userLearningStyle
                ).length
              },
              {
                key: 'in-progress',
                label: 'In Progress',
                icon: Clock3,
                count: modules.filter(
                  m => getModuleStatus(m.id) === 'in_progress'
                ).length
              },
              {
                key: 'completed',
                label: 'Completed',
                icon: CheckCircle2,
                count: modules.filter(
                  m => getModuleStatus(m.id) === 'completed'
                ).length
              }
            ].map(({ key, label, icon: Icon, count }) => (
              <Button
                key={key}
                variant={viewMode === key ? 'default' : 'outline'}
                onClick={() => setViewMode(key as any)}
                className={`${
                  viewMode === key
                    ? 'bg-[#00af8f] hover:bg-[#00af90] text-white'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                <Icon className="w-4 h-4 mr-2" />
                {label}
                <Badge
                  variant={viewMode === key ? 'secondary' : 'outline'}
                  className="ml-2 bg-white/20 text-white border-white/30">
                  {count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-[#00af8f]" />
              Filter & Search Modules
            </h3>
            <p className="text-sm text-gray-600">
              Find modules that match your preferences and learning needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#00af8f] focus:ring-[#00af8f]"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}>
                <SelectTrigger className="border-gray-300 focus:border-[#00af8f] focus:ring-[#00af8f]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Learning Style Filter */}
            {/* <div>
              <Select
                value={selectedLearningStyle}
                onValueChange={setSelectedLearningStyle}>
                <SelectTrigger className="border-gray-300 focus:border-[#00af8f] focus:ring-[#00af8f]">
                  <SelectValue placeholder="All Styles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Learning Styles</SelectItem>
                  {learningStyles.map(style => (
                    <SelectItem key={style} value={style}>
                      {
                        learningStyleLabels[
                          style as keyof typeof learningStyleLabels
                        ]
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            {/* Difficulty Filter */}
            {/* <div>
              <Select
                value={selectedDifficulty}
                onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="border-gray-300 focus:border-[#00af8f] focus:ring-[#00af8f]">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {difficultyLevels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
          </div>

          {/* Active Filters Display */}
          {(searchTerm ||
            selectedSubject !== 'all' ||
            selectedLearningStyle !== 'all' ||
            selectedDifficulty !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Active Filters:
                  </span>
                  {searchTerm && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  {selectedSubject !== 'all' && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800">
                      Subject: {selectedSubject}
                    </Badge>
                  )}
                  {selectedLearningStyle !== 'all' && (
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-800">
                      Style:{' '}
                      {
                        learningStyleLabels[
                          selectedLearningStyle as keyof typeof learningStyleLabels
                        ]
                      }
                    </Badge>
                  )}
                  {selectedDifficulty !== 'all' && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800">
                      Difficulty:{' '}
                      {selectedDifficulty.charAt(0).toUpperCase() +
                        selectedDifficulty.slice(1)}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSubject('all');
                    setSelectedLearningStyle('all');
                    setSelectedDifficulty('all');
                  }}
                  className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400">
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modules Grid */}
        {filteredModules.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {modules.length === 0
                ? 'No modules available yet'
                : 'No modules match your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {modules.length === 0
                ? "Teachers haven't created any modules yet. Check back later!"
                : 'Try adjusting your search criteria or filters to find more modules.'}
            </p>
            {modules.length === 0 ? (
              <Button
                onClick={() => (window.location.href = '/student/dashboard')}
                className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af90] text-white border-0">
                <BookOpen className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('all');
                  setSelectedLearningStyle('all');
                  setSelectedDifficulty('all');
                }}>
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map(module => {
              const moduleStatus = getModuleStatus(module.id);
              const moduleProgress = getModuleProgress(module.id);
              const StatusIcon = getStatusIcon(moduleStatus);
              const DifficultyIcon =
                difficultyIcons[
                  module.difficulty_level as keyof typeof difficultyIcons
                ];
              const isBookmarked = bookmarkedModules.includes(module.id);

              // Determine if module is recommended for this student
              const isRecommended =
                module.target_learning_styles?.includes(
                  userLearningStyle as any
                ) || module.category?.learning_style === userLearningStyle;

              return (
                <Card
                  key={module.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                  {/* Module Header */}
                  <div className="relative">
                    <div className="h-32 bg-gradient-to-br from-[#00af8f]/10 to-[#00af90]/10 flex items-center justify-center">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${
                          learningStyleColors[
                            userLearningStyle as keyof typeof learningStyleColors
                          ]
                        } rounded-full flex items-center justify-center shadow-lg`}>
                        <Target className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Bookmark Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBookmark(module.id)}
                      className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white shadow-sm">
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-[#00af8f]" />
                      ) : (
                        <BookmarkPlus className="w-4 h-4 text-gray-600" />
                      )}
                    </Button>

                    {/* Recommended Badge */}
                    {isRecommended && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Recommended
                        </Badge>
                      </div>
                    )}

                    {/* Locked Badge */}
                    {isModuleLocked(module) && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gray-500 text-white text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {moduleProgress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0">
                        <Progress
                          value={moduleProgress}
                          className="h-1 rounded-none"
                        />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    {/* Module Title and Description */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                        {module.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {module.description}
                      </p>
                      {/* Completion Badge */}
                      {user?.id && (
                        <div className="mt-3">
                          <ModuleCompletionBadge
                            moduleId={module.id}
                            studentId={user.id}
                          />
                        </div>
                      )}
                    </div>

                    {/* Module Meta */}
                    <div className="space-y-3 mb-4">
                      {/* Category and Subject */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {module.category?.subject || 'General'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {module.category?.grade_level || 'All Levels'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Timer className="w-3 h-3" />
                          <span>{module.estimated_duration_minutes} min</span>
                        </div>
                      </div>

                      {/* Difficulty */}
                      {/* <div className="flex items-center space-x-2">
                        <DifficultyIcon className="w-4 h-4 text-gray-400" />
                        <Badge
                          className={`text-xs ${
                            difficultyColors[
                              module.difficulty_level as keyof typeof difficultyColors
                            ]
                          }`}>
                          {module.difficulty_level.charAt(0).toUpperCase() +
                            module.difficulty_level.slice(1)}
                        </Badge>
                      </div> */}

                      {/* Learning Styles */}
                      {/* {module.target_learning_styles &&
                        module.target_learning_styles.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-gray-400" />
                            <div className="flex flex-wrap gap-1">
                              {module.target_learning_styles.map(
                                (style, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className={`text-xs ${
                                      style === userLearningStyle
                                        ? 'bg-[#00af8f]/20 text-[#00af8f]'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {
                                      learningStyleLabels[
                                        style as keyof typeof learningStyleLabels
                                      ]
                                    }
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )} */}
                    </div>

                    {/* Prerequisite Warning */}
                    {isModuleLocked(module) && (
                      <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Lock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-orange-800 mb-1">
                              Prerequisite Required
                            </p>
                            <p className="text-xs text-orange-700">
                              Complete{' '}
                              <span className="font-semibold">
                                {getPrerequisiteModule(module)?.title ||
                                  'previous module'}
                              </span>{' '}
                              first
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Debug Info */}
                    {console.log(
                      'Module:',
                      module.title,
                      '| Status:',
                      moduleStatus,
                      '| Progress:',
                      progress.find(p => p.module_id === module.id)
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {/* For completed modules, show two buttons */}
                      {moduleStatus === 'completed' &&
                      !isModuleLocked(module) ? (
                        <>
                          <Button
                            onClick={() => {
                              window.location.href = `/student/vark-modules/${module.id}`;
                            }}
                            variant="outline"
                            className="w-full border-green-600 text-green-600 hover:bg-green-50">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Review Module
                          </Button>
                          <Button
                            onClick={() => handleViewResults(module.id)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Results
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => {
                            if (isModuleLocked(module)) {
                              toast.error(
                                `Please complete "${
                                  getPrerequisiteModule(module)?.title
                                }" first`
                              );
                              return;
                            }
                            window.location.href = `/student/vark-modules/${module.id}`;
                          }}
                          disabled={isModuleLocked(module)}
                          className={`w-full ${
                            isModuleLocked(module)
                              ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed'
                              : moduleStatus === 'in_progress'
                              ? 'bg-yellow-600 hover:bg-yellow-700'
                              : 'bg-[#00af8f] hover:bg-[#00af90]'
                          } text-white`}>
                          {isModuleLocked(module) ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Locked
                            </>
                          ) : (
                            <>
                              <StatusIcon className="w-4 h-4 mr-2" />
                              {getStatusText(moduleStatus)}
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Progress Status */}
                    {moduleProgress > 0 && (
                      <div className="mt-3 text-center">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                          <span>{moduleProgress}% Complete</span>
                          {moduleStatus === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Learning Style Tips */}
        {/* <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-[#00af8f]/5 to-[#00af90]/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-full flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Optimize Your Learning Experience
                </h3>
                <p className="text-gray-700 mb-3">
                  As a{' '}
                  {learningStyleLabels[
                    userLearningStyle as keyof typeof learningStyleLabels
                  ].toLowerCase()}{' '}
                  learner, focus on modules that target your learning style for
                  the best results. Look for the "Recommended" badge to find
                  content optimized for you.
                </p>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-[#00af8f]/20 text-[#00af8f]">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Personalized Content
                  </Badge>
                  <Badge variant="outline">
                    Learning Style:{' '}
                    {
                      learningStyleLabels[
                        userLearningStyle as keyof typeof learningStyleLabels
                      ]
                    }
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Results Modal */}
      <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              <span>Module Results</span>
              {resultsData && (
                <Button onClick={downloadResults} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              {resultsData?.module?.title || 'Loading...'}
            </DialogDescription>
          </DialogHeader>

          {loadingResults ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : resultsData ? (
            <div className="space-y-6 mt-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Final Score */}
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Trophy className="w-6 h-6" />
                      <Badge className="bg-white text-green-600 text-xs">
                        Score
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold">
                      {resultsData.completion?.final_score || 0}%
                    </div>
                    <p className="text-green-100 text-sm mt-1">
                      {(resultsData.completion?.final_score || 0) >= 90
                        ? 'Excellent!'
                        : (resultsData.completion?.final_score || 0) >= 80
                        ? 'Great Job!'
                        : 'Good Work!'}
                    </p>
                  </CardContent>
                </Card>

                {/* Time Spent */}
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-6 h-6" />
                      <Badge className="bg-white text-blue-600 text-xs">
                        Time
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold">
                      {Math.floor(
                        (resultsData.completion?.time_spent_minutes || 0) / 60
                      ) > 0
                        ? `${Math.floor(
                            (resultsData.completion?.time_spent_minutes || 0) /
                              60
                          )}h`
                        : `${resultsData.completion?.time_spent_minutes || 0}m`}
                    </div>
                    <p className="text-blue-100 text-sm mt-1">Study time</p>
                  </CardContent>
                </Card>

                {/* Sections */}
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="w-6 h-6" />
                      <Badge className="bg-white text-purple-600 text-xs">
                        Sections
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold">
                      {resultsData.completion?.sections_completed || 0}
                    </div>
                    <p className="text-purple-100 text-sm mt-1">
                      {resultsData.completion?.perfect_sections || 0} perfect
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Completion Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-600" />
                    Completion Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Completed On</p>
                        <p className="font-semibold">
                          {resultsData.completion?.completion_date
                            ? new Date(
                                resultsData.completion.completion_date
                              ).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {resultsData.completion?.pre_test_score !== undefined && (
                      <div className="flex items-center space-x-3">
                        <Target className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Pre-Test Score
                          </p>
                          <p className="font-semibold">
                            {resultsData.completion.pre_test_score}%
                          </p>
                        </div>
                      </div>
                    )}

                    {resultsData.completion?.post_test_score !== undefined && (
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Post-Test Score
                          </p>
                          <p className="font-semibold">
                            {resultsData.completion.post_test_score}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Section Submissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    Section Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resultsData.submissions?.length === 0 ? (
                      <p className="text-gray-600 text-center py-4">
                        No submissions found.
                      </p>
                    ) : (
                      resultsData.submissions?.map(
                        (submission: any, index: number) => (
                          <div
                            key={submission.section_id}
                            className="border rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-semibold text-sm">
                                    {index + 1}. {submission.section_title}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {submission.section_type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {new Date(
                                    submission.submitted_at
                                  ).toLocaleString()}
                                </p>
                              </div>

                              {submission.assessment_results && (
                                <div className="text-right">
                                  <div
                                    className={`text-xl font-bold ${
                                      submission.assessment_results.passed
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}>
                                    {submission.assessment_results.percentage.toFixed(
                                      1
                                    )}
                                    %
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {
                                      submission.assessment_results
                                        .correct_count
                                    }
                                    /
                                    {
                                      submission.assessment_results
                                        .total_questions
                                    }{' '}
                                    correct
                                  </p>
                                </div>
                              )}
                            </div>

                            {submission.assessment_results && (
                              <Progress
                                value={submission.assessment_results.percentage}
                                className="h-2 mt-2"
                              />
                            )}
                          </div>
                        )
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-gray-600">No results data available.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
