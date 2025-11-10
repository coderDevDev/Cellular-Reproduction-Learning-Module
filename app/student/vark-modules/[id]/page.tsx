'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { VARKModulesAPI } from '@/lib/api/vark-modules';
import DynamicModuleViewer from '@/components/vark-modules/dynamic-module-viewer';
import { type VARKModule, type VARKModuleProgress } from '@/types/vark-module';
import { filterSectionsByPreferences } from '@/lib/utils/learning-style-matcher';
import {
  ArrowLeft,
  BookOpen,
  Target,
  Eye,
  Headphones,
  PenTool,
  Zap,
  CheckCircle,
  Loader2,
  Timer,
  GraduationCap,
  Star,
  BookmarkPlus,
  BookmarkCheck
} from 'lucide-react';
import { toast } from 'sonner';

// Required for static export - generates all possible module IDs at build time
// export async function generateStaticParams() {
//   // Since this is a dynamic route with authentication, we can't pre-generate all possible IDs
//   // Return empty array and let Next.js handle dynamic rendering
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

export default function StudentVARKModulePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [module, setModule] = useState<VARKModule | null>(null);
  const [progress, setProgress] = useState<VARKModuleProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [previousSubmissions, setPreviousSubmissions] = useState<any[]>([]);

  const varkAPI = new VARKModulesAPI();
  const moduleId = params.id as string;

  useEffect(() => {
    if (moduleId && user) {
      loadModule();
    }
  }, [moduleId, user]);

  const loadModule = async () => {
    try {
      setLoading(true);

      // Load module data
      const moduleData = await varkAPI.getModuleById(moduleId);
      if (!moduleData) {
        toast.error('Module not found');
        router.push('/student/vark-modules');
        return;
      }

      // Check if module is published
      if (!moduleData.is_published) {
        toast.error('This module is not available');
        router.push('/student/vark-modules');
        return;
      }

      // 🔍 DEBUG: Log user object to verify learning style is loaded
      console.log('🔍 === USER DEBUG ===');
      console.log('User object:', user);
      console.log('User learning style:', user?.learningStyle);
      console.log('User preferred modules:', (user as any)?.preferredModules);
      console.log('🔍 === END USER DEBUG ===');

      // ✨ Map preferred_modules to learning style tags format
      // "Visual" → "visual", "Aural" → "auditory", "Read/Write" → "reading_writing", "Kinesthetic" → "kinesthetic"
      const learningStyleMap: Record<string, string> = {
        'Visual': 'visual',
        'Aural': 'auditory',
        'Read/Write': 'reading_writing',
        'Kinesthetic': 'kinesthetic',
        'General Module': 'everyone' // General module students see everything
      };

      // Get student's preferred learning styles (supports multiple styles)
      const preferredModules = (user as any)?.preferredModules || [];
      const studentLearningStyles = preferredModules
        .map((module: string) => learningStyleMap[module])
        .filter((style: string | undefined) => style !== undefined);

      console.log('🎯 Mapped learning styles:', studentLearningStyles);

      // ✨ Apply MULTI-STYLE personalized content filtering
      // Show sections that match ANY of the student's preferred learning styles
      if (moduleData.content_structure?.sections && studentLearningStyles.length > 0) {
        const originalSectionCount = moduleData.content_structure.sections.length;

        console.log('🔍 === CONTENT FILTERING START ===');
        console.log('👤 Student Preferred Modules:', preferredModules);
        console.log('👤 Student Learning Styles:', studentLearningStyles);
        console.log('📦 Total sections in module:', originalSectionCount);

        // STRICT MULTI-STYLE FILTERING: Show section if:
        // 1. Section has "everyone" tag (universal content), OR
        // 2. Section has no tags (universal content), OR
        // 3. Section has ALL of the student's preferred learning styles (STRICT MATCH)
        const filteredSections = moduleData.content_structure.sections.filter((section, index) => {
          const tags = section.learning_style_tags || [];

          // Rule 1: If section has "everyone" tag, ALWAYS show it
          if (tags.includes('everyone')) {
            console.log(`✅ Section ${index + 1}: "${section.title}" - INCLUDED (has "everyone" tag)`);
            return true;
          }

          // Rule 2: If section has no tags, show it (universal content)
          if (tags.length === 0) {
            console.log(`✅ Section ${index + 1}: "${section.title}" - INCLUDED (no tags = universal)`);
            return true;
          }

          // Rule 3: EXACT MATCH - Section tags must EXACTLY match student's learning styles
          // For multi-style students (Bimodal, Trimodal, Multimodal): section must have ALL their styles
          // For single-style students (Unimodal): section must have only that one style
          
          // Check if section tags exactly match student's learning styles
          const tagsSet = new Set(tags);
          const studentStylesSet = new Set(studentLearningStyles);
          
          // For EXACT match: both sets must be equal
          const isExactMatch = 
            tags.length === studentLearningStyles.length &&
            tags.every((tag: string) => studentStylesSet.has(tag));
          
          if (isExactMatch) {
            console.log(`✅ Section ${index + 1}: "${section.title}" - INCLUDED (EXACT MATCH: section tags ${JSON.stringify(tags)} === student styles ${JSON.stringify(studentLearningStyles)})`);
            return true;
          }

          // Otherwise, HIDE the section
          console.log(`❌ Section ${index + 1}: "${section.title}" - EXCLUDED (not exact match)`, { sectionTags: tags, studentStyles: studentLearningStyles });
          return false;
        });

        // Update module with filtered sections
        moduleData.content_structure.sections = filteredSections;

        // Calculate statistics
        const filteredCount = filteredSections.length;
        const hiddenCount = originalSectionCount - filteredCount;
        const percentageShown = Math.round((filteredCount / originalSectionCount) * 100);

        console.log('📊 === FILTERING RESULTS ===');
        console.log(`✅ Sections shown: ${filteredCount}`);
        console.log(`❌ Sections hidden: ${hiddenCount}`);
        console.log(`📈 Percentage shown: ${percentageShown}%`);
        console.log('🔍 === CONTENT FILTERING END ===');

        // Show toast notification about personalization
        const learningStyleLabels = {
          'visual': 'Visual',
          'auditory': 'Auditory',
          'reading_writing': 'Reading/Writing',
          'kinesthetic': 'Kinesthetic'
        };

        if (hiddenCount > 0) {
          const styleNames = preferredModules.join(' + ');
          toast.success(
            `📚 Personalized for ${styleNames}: Showing ${filteredCount} 
      section`,
            { duration: 4000 }
          );
        } else {
          toast.info(
            `📚 All ${originalSectionCount} sections match your learning styles!`,
            { duration: 3000 }
          );
        }
      } else if (moduleData.content_structure?.sections) {
        // No learning style set - show all sections
        const totalSections = moduleData.content_structure.sections.length;
        console.log(`ℹ️ No learning style set for student, showing all ${totalSections} sections`);
        toast.info(
          `Showing all ${totalSections} sections (no learning style preference set)`,
          { duration: 3000 }
        );
      }

      setModule(moduleData);

      // Load progress data (placeholder - implement based on your progress tracking)
      const progressData: VARKModuleProgress = {
        id: `progress-${moduleId}`,
        module_id: moduleId,
        student_id: user!.id,
        status: 'not_started',
        progress_percentage: 0,
        current_section_id:
          moduleData.content_structure?.sections?.[0]?.id || '',
        time_spent_minutes: 0,
        completed_sections: [],
        assessment_scores: {},
        last_accessed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading module:', error);
      toast.error('Failed to load module');
      router.push('/student/vark-modules');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(
      isBookmarked
        ? 'Module removed from bookmarks'
        : 'Module added to bookmarks'
    );
  };

  const handleSectionComplete = (sectionIndex: number) => {
    if (progress && module?.content_structure?.sections) {
      const newProgress = { ...progress };
      const sectionId = module.content_structure.sections[sectionIndex]?.id;
      if (sectionId && !newProgress.completed_sections.includes(sectionId)) {
        newProgress.completed_sections.push(sectionId);
        newProgress.progress_percentage = Math.round(
          (newProgress.completed_sections.length /
            module.content_structure.sections.length) *
            100
        );
        newProgress.current_section_id =
          module.content_structure.sections[
            Math.min(
              sectionIndex + 1,
              module.content_structure.sections.length - 1
            )
          ]?.id || '';
        newProgress.status =
          newProgress.progress_percentage === 100 ? 'completed' : 'in_progress';
        setProgress(newProgress);
      }
    }
  };

  const handleQuizSubmit = (
    sectionIndex: number,
    score: number,
    totalQuestions: number
  ) => {
    if (progress && module?.content_structure?.sections) {
      const newProgress = { ...progress };
      const sectionId = module.content_structure.sections[sectionIndex]?.id;
      if (sectionId) {
        newProgress.assessment_scores[sectionId] = score;
        setProgress(newProgress);
        toast.success(`Quiz completed! Score: ${score}/${totalQuestions}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00af8f]" />
          <p className="text-lg text-gray-600">
            Loading your learning module...
          </p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Module not found
          </h3>
          <p className="text-gray-600 mb-4">
            The module you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <Button
            onClick={() => router.push('/student/vark-modules')}
            className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af90] text-white border-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Modules
          </Button>
        </div>
      </div>
    );
  }

  const userLearningStyle = user?.learningStyle || 'visual';
  const LearningStyleIcon =
    learningStyleIcons[userLearningStyle as keyof typeof learningStyleIcons];
  const DifficultyIcon =
    difficultyIcons[module.difficulty_level as keyof typeof difficultyIcons];


    console.log({userLearningStyle})

    console.log({module})
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <Button
                variant="ghost"
                onClick={() => router.push('/student/vark-modules')}
                className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-12 h-12 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {module.title}
                </h1>
                <p className="text-gray-600">
                  Personalized learning experience
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={handleBookmark} className="p-2">
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-[#00af8f]" />
                ) : (
                  <BookmarkPlus className="w-5 h-5 text-gray-600" />
                )}
              </Button>
              <Button
                onClick={() => router.push('/student/vark-modules')}
                className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af90] text-white border-0">
                <BookOpen className="w-4 h-4 mr-2" />
                All Modules
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module Content */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Learning Content</CardTitle>
                  {progress && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Progress:</span>
                      <Progress
                        value={progress.progress_percentage}
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {progress.progress_percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {module.content_structure?.sections &&
                module.content_structure.sections.length > 0 ? (
                  <DynamicModuleViewer
                    module={module}
                    userId={user?.id}
                    userName={`${user?.first_name} ${user?.last_name}`}
                    onSectionComplete={(sectionId: string) => {
                      const sectionIndex =
                        module.content_structure?.sections?.findIndex(
                          (s: any) => s.id === sectionId
                        ) || 0;
                      handleSectionComplete(sectionIndex);
                    }}
                    onProgressUpdate={(
                      sectionId: string,
                      completed: boolean
                    ) => {
                      if (completed) {
                        const sectionIndex =
                          module.content_structure?.sections?.findIndex(
                            (s: any) => s.id === sectionId
                          ) || 0;
                        handleSectionComplete(sectionIndex);
                      }
                    }}
                    initialProgress={
                      progress
                        ? Object.fromEntries(
                            (module.content_structure.sections || []).map(
                              (section: any, index: number) => [
                                section.id,
                                progress.completed_sections.includes(section.id)
                              ]
                            )
                          )
                        : {}
                    }
                  />
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No content available
                    </h3>
                    <p className="text-gray-600">
                      This module doesn't have any learning content yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Module Info Sidebar */}
          <div className="space-y-6">
            {/* Learning Style Profile */}
            {user && (
              <Card className="border-0 shadow-lg bg-gradient-to-r from-[#00af8f]/5 to-[#00af90]/5">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    {(user as any)?.preferredModules && (user as any).preferredModules.length > 1 ? (
                      <div className="flex -space-x-2">
                        {(user as any).preferredModules.slice(0, 3).map((module: string, idx: number) => {
                          const moduleToKeyMap: Record<string, keyof typeof learningStyleIcons> = {
                            'Visual': 'visual',
                            'Aural': 'auditory',
                            'Read/Write': 'reading_writing',
                            'Kinesthetic': 'kinesthetic'
                          };
                          
                          const styleKey = moduleToKeyMap[module] || 'visual';
                          const Icon = learningStyleIcons[styleKey] || learningStyleIcons.visual;
                          const colorClass = learningStyleColors[styleKey] || 'from-blue-500 to-blue-600';
                          
                          return (
                            <div
                              key={idx}
                              className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-full flex items-center justify-center shadow-lg border-2 border-white`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${
                          learningStyleColors[
                            userLearningStyle as keyof typeof learningStyleColors
                          ]
                        } rounded-full flex items-center justify-center shadow-lg`}>
                        <LearningStyleIcon className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-900">
                        {(user as any)?.learningType || 'Unimodal'}
                        <span className="text-gray-600"> Learner</span>
                      </h3>
                      {(user as any)?.preferredModules && (user as any).preferredModules.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(user as any).preferredModules.map((module: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs px-1.5 py-0 bg-gradient-to-r from-[#00af8f]/10 to-teal-400/10 text-[#00af8f] border border-[#00af8f]/20">
                              {module}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Module Overview */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Target className="w-5 h-5 text-[#00af8f]" />
                  <span>Module Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Difficulty:</span>
                    <div className="flex items-center space-x-2">
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
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <div className="flex items-center space-x-1">
                      <Timer className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">
                        {module.estimated_duration_minutes} min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sections:</span>
                    <span className="text-sm font-medium">
                      {module.content_structure?.sections?.length || 0}
                    </span>
                  </div>

                  {module.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Subject:</span>
                      <Badge variant="outline" className="text-xs">
                        {module.category.subject}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            {progress && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-[#00af8f]" />
                    <span>Your Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#00af8f] mb-2">
                      {progress.progress_percentage}%
                    </div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Current Section:
                      </span>
                      <span className="text-sm font-medium">
                        {module?.content_structure?.sections?.findIndex(
                          (s: any) => s.id === progress.current_section_id
                        ) + 1 || 1}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed:</span>
                      <span className="text-sm font-medium">
                        {progress.completed_sections.length}
                      </span>
                    </div>

                    {Object.keys(progress.assessment_scores).length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Assessments Taken:
                        </span>
                        <span className="text-sm font-medium">
                          {Object.keys(progress.assessment_scores).length}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Learning Tips */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-[#00af8f]/5 to-[#00af90]/5">
              <CardContent className="p-6">
                <div className="text-center">
                  <Target className="w-12 h-12 text-[#00af8f] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Learning Tip
                  </h3>
                  <p className="text-gray-700 text-sm">
                    As a{' '}
                    {learningStyleLabels[
                      userLearningStyle as keyof typeof learningStyleLabels
                    ].toLowerCase()}{' '}
                    learner, take your time with each section and engage with
                    the content in a way that works best for you.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
