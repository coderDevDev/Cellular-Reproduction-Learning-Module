'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Eye,
  Headphones,
  PenTool,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  Brain,
  Target,
  Users,
  FileText,
  PlayCircle,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface LearningStatement {
  id: number;
  statement: string;
  category: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
}

// Updated questions based on the instrument file
const learningStatements: LearningStatement[] = [
  {
    id: 1,
    statement:
      'I prefer to learn through animations and videos that illustrate mitosis and meiosis.',
    category: 'visual'
  },
  {
    id: 2,
    statement:
      "I prefer to learn by listening to someone's instruction and explanation rather than reading about cellular reproduction.",
    category: 'auditory'
  },
  {
    id: 3,
    statement:
      'I prefer to learn when I can participate and actively involve in the discussion.',
    category: 'kinesthetic'
  },
  {
    id: 4,
    statement:
      'I prefer to learn through reading detailed discussions about cellular reproduction.',
    category: 'reading_writing'
  },
  {
    id: 5,
    statement:
      'I prefer to watch video presentations with step-by-step explanations to visualize and understand the concept of cellular reproduction clearly.',
    category: 'visual'
  },
  {
    id: 6,
    statement:
      'I prefer to learn using a recorded discussion as a learning material.',
    category: 'auditory'
  },
  {
    id: 7,
    statement:
      'I prefer to learn through hands-on digital activities like virtual simulations.',
    category: 'kinesthetic'
  },
  {
    id: 8,
    statement:
      'I prefer to take down notes and use them as a learning material.',
    category: 'reading_writing'
  },
  {
    id: 9,
    statement:
      'I prefer to use diagrams and concept maps in learning complex concepts like cellular reproduction.',
    category: 'visual'
  },
  {
    id: 10,
    statement:
      'I prefer to use verbal and audio instructions to guide my learning about cellular reproduction.',
    category: 'auditory'
  },
  {
    id: 11,
    statement:
      'I prefer to learn by doing online tasks that allow me to apply concepts in real-time.',
    category: 'kinesthetic'
  },
  {
    id: 12,
    statement:
      "I prefer to learn when I'm able to read on my own and explore complex topics in detail.",
    category: 'reading_writing'
  },
  {
    id: 13,
    statement:
      'I prefer to learn using interactive charts that visually demonstrate biological processes like cellular reproduction.',
    category: 'visual'
  },
  {
    id: 14,
    statement:
      'I prefer to learn biology topics through a question-and-answer discussion.',
    category: 'auditory'
  },
  {
    id: 15,
    statement:
      'I prefer to learn through various activities that engage my senses and movement to reinforce concepts.',
    category: 'kinesthetic'
  },
  {
    id: 16,
    statement: 'I prefer to learn through reading and writing activities.',
    category: 'reading_writing'
  },
  {
    id: 17,
    statement:
      'I prefer to use colored contents and images materials in learning biological processes.',
    category: 'visual'
  },
  {
    id: 18,
    statement:
      'I prefer to discuss or share my knowledge with others to deepen my understanding of the concepts.',
    category: 'auditory'
  },
  {
    id: 19,
    statement:
      'I prefer to learn through exploring and manipulating various materials to understand cellular reproduction better.',
    category: 'kinesthetic'
  },
  {
    id: 20,
    statement:
      'I prefer to learn and engage with the discussion through text-based explanations.',
    category: 'reading_writing'
  }
];

const learningStyleInfo = {
  visual: {
    title: 'Visual Learner',
    description:
      'You learn best through seeing and observing. You prefer pictures, diagrams, charts, and visual aids.',
    icon: Eye,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    gradient: 'from-blue-400 to-blue-600',
    emoji: '👁️'
  },
  auditory: {
    title: 'Auditory Learner',
    description:
      'You learn best through listening and speaking. You prefer discussions, lectures, and verbal explanations.',
    icon: Headphones,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    gradient: 'from-green-400 to-green-600',
    emoji: '🎧'
  },
  reading_writing: {
    title: 'Reading/Writing Learner',
    description:
      'You learn best through reading and writing. You prefer text-based materials, note-taking, and written assignments.',
    icon: PenTool,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    gradient: 'from-purple-400 to-purple-600',
    emoji: '✍️'
  },
  kinesthetic: {
    title: 'Kinesthetic Learner',
    description:
      'You learn best through movement and hands-on experience. You prefer physical activities, experiments, and real-world applications.',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    gradient: 'from-orange-400 to-orange-600',
    emoji: '🖐️'
  }
};

const scaleLabels = {
  1: { label: 'Strongly Disagree', emoji: '😞', color: 'text-red-600' },
  2: { label: 'Disagree', emoji: '😐', color: 'text-red-500' },
  3: { label: 'Undecided', emoji: '🤷', color: 'text-gray-500' },
  4: { label: 'Agree', emoji: '😊', color: 'text-green-500' },
  5: { label: 'Strongly Agree', emoji: '🎉', color: 'text-green-600' }
};

export default function VARKOnboardingPage() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  // console.log('VARKOnboardingPage render - user:', user);
  // console.log('VARKOnboardingPage render - updateProfile:', updateProfile);

  const [currentStatement, setCurrentStatement] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Handle user loading state
  useEffect(() => {
    if (user !== null) {
      setIsLoadingUser(false);
    } else {
      // If user is null, wait a bit for auth state to update
      const timer = setTimeout(() => {
        setIsLoadingUser(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  // Redirect to login if no user after loading
  useEffect(() => {
    if (!isLoadingUser && !user) {
      console.log('No user found, redirecting to login...');
      router.push('/auth/login');
    }
  }, [isLoadingUser, user, router]);

  const progress = ((currentStatement + 1) / learningStatements.length) * 100;
  const currentStatementData = learningStatements[currentStatement];

  // Update answered count when answers change
  useEffect(() => {
    const count = Object.keys(answers).length;
    setAnsweredCount(count);
  }, [answers]);

  const handleRating = (rating: number) => {
    setAnswers(prev => ({ ...prev, [currentStatementData.id]: rating }));
  };

  const nextStatement = () => {
    if (currentStatement < learningStatements.length - 1) {
      setCurrentStatement(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const previousStatement = () => {
    if (currentStatement > 0) {
      setCurrentStatement(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    const scores = {
      visual: 0,
      auditory: 0,
      reading_writing: 0,
      kinesthetic: 0
    };

    // Calculate weighted scores based on ratings
    learningStatements.forEach(statement => {
      const rating = answers[statement.id] || 0;
      scores[statement.category] += rating;
    });

    // Find the dominant learning style
    const dominantStyle = Object.entries(scores).reduce((a, b) =>
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores]
        ? a
        : b
    )[0] as keyof typeof learningStyleInfo;

    setShowResults(true);
  };

  const handleComplete = async () => {
    console.log('=== handleComplete START ===');
    console.log('handleComplete called!');
    console.log('Current user:', user);
    console.log('Current answers:', answers);

    if (!user) {
      toast.error('User not found. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate final results
      const scores = {
        visual: 0,
        auditory: 0,
        reading_writing: 0,
        kinesthetic: 0
      };

      learningStatements.forEach(statement => {
        const rating = answers[statement.id] || 0;
        scores[statement.category] += rating;
      });

      const dominantStyle = Object.entries(scores).reduce((a, b) =>
        scores[a[0] as keyof typeof scores] >
        scores[b[0] as keyof typeof scores]
          ? a
          : b
      )[0] as keyof typeof learningStyleInfo;

      // Calculate preferred modules based on scores (high scores indicate preference)
      // According to VARK guidelines: Must score 20 or higher (out of 25) to indicate preferred learning style
      const threshold = 20;
      const styleMapping: Record<string, string> = {
        visual: 'Visual',
        auditory: 'Aural',
        reading_writing: 'Read/Write',
        kinesthetic: 'Kinesthetic'
      };

      const preferredModules: string[] = [];
      Object.entries(scores).forEach(([style, score]) => {
        if (score >= threshold) {
          preferredModules.push(styleMapping[style]);
        }
      });

      // If no modules meet threshold, use the dominant style
      if (preferredModules.length === 0) {
        preferredModules.push(styleMapping[dominantStyle]);
      }

      // Determine learning type based on number of preferred modules
      let learningType: string;
      switch (preferredModules.length) {
        case 1:
          learningType = 'Unimodal';
          break;
        case 2:
          learningType = 'Bimodal';
          break;
        case 3:
          learningType = 'Trimodal';
          break;
        case 4:
          learningType = 'Multimodal';
          break;
        default:
          learningType = 'Unimodal';
      }

      console.log('Calculated results:', {
        scores,
        dominantStyle,
        preferredModules,
        learningType
      });

      console.log('Updating profile with:', {
        id: user.id,
        role: user.role,
        learningStyle: dominantStyle,
        preferredModules,
        learningType,
        onboardingCompleted: true
      });

      console.log('Attempting direct database update (bypassing auth session)...');
      
      // Since email confirmation is required and session won't be established,
      // skip ProfileAPI and go straight to direct database update
      try {
        // Import supabase client
        const { supabase } = await import('@/lib/supabase');
        // First check if profile exists
          const { data: existingProfile, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
          
          console.log('Profile check:', { exists: !!existingProfile, checkError });
          
          let directUpdate, directError;
          
          if (!existingProfile) {
            // Profile doesn't exist, create it with upsert
            console.log('Profile not found, creating with upsert...');
            const upsertResult = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                email: user.email,
                role: user.role,
                first_name: user.firstName,
                middle_name: user.middleName,
                last_name: user.lastName,
                full_name: user.fullName,
                learning_style: dominantStyle,
                preferred_modules: preferredModules,
                learning_type: learningType,
                onboarding_completed: true
              }, { onConflict: 'id' })
              .select()
              .single();
            
            directUpdate = upsertResult.data;
            directError = upsertResult.error;
          } else {
            // Profile exists, update it
            console.log('Profile found, updating...');
            const updateResult = await supabase
              .from('profiles')
              .update({
                learning_style: dominantStyle,
                preferred_modules: preferredModules,
                learning_type: learningType,
                onboarding_completed: true
              })
              .eq('id', user.id)
              .select()
              .single();
            
            directUpdate = updateResult.data;
            directError = updateResult.error;
          }
          
        console.log('Direct operation result:', { directUpdate, directError });
        
        if (directError) {
          console.error('Direct operation failed:', directError);
          
          // Check if it's a foreign key constraint error
          if (directError.code === '23503') {
            console.error('Foreign key constraint violation - auth user does not exist');
            toast.error('Account Setup Error', {
              description: 'Your account was not properly created. Please register again.',
              duration: 5000
            });
            
            // Redirect to registration after delay
            setTimeout(() => {
              router.push('/auth/register');
            }, 3000);
            return;
          }
          
          throw new Error(`Failed to save learning style: ${directError.message}`);
        }
        
        toast.success('Success!', {
          description: 'Your learning style has been saved. Redirecting to dashboard...'
        });
        
        setTimeout(() => {
          router.push('/student/dashboard');
        }, 1500);
      } catch (dbError) {
        console.error('Database operation error:', dbError);
        throw dbError;
      }
    } catch (error) {
      console.error('Failed to update profile:', error);

      if (
        error instanceof Error &&
        error.message === 'Profile update timeout'
      ) {
        toast.error('Timeout Error', {
          description: 'Profile update is taking too long. Please try again.'
        });
      } else {
        toast.error('Error', {
          description:
            error instanceof Error
              ? error.message
              : 'Failed to save your learning style. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while waiting for user
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-[#333333] mb-2">
            Loading...
          </h2>
          <p className="text-[#666666]">Setting up your learning profile</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const scores = {
      visual: 0,
      auditory: 0,
      reading_writing: 0,
      kinesthetic: 0
    };

    learningStatements.forEach(statement => {
      const rating = answers[statement.id] || 0;
      scores[statement.category] += rating;
    });

    const dominantStyle = Object.entries(scores).reduce((a, b) =>
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores]
        ? a
        : b
    )[0] as keyof typeof learningStyleInfo;

    // Calculate preferred modules and learning type for display
    const threshold = 20;
    const styleMapping: Record<string, string> = {
      visual: 'Visual',
      auditory: 'Aural',
      reading_writing: 'Read/Write',
      kinesthetic: 'Kinesthetic'
    };

    const preferredModulesDisplay: string[] = [];
    Object.entries(scores).forEach(([style, score]) => {
      if (score >= threshold) {
        preferredModulesDisplay.push(styleMapping[style]);
      }
    });

    if (preferredModulesDisplay.length === 0) {
      preferredModulesDisplay.push(styleMapping[dominantStyle]);
    }

    let learningTypeDisplay: string;
    switch (preferredModulesDisplay.length) {
      case 1:
        learningTypeDisplay = 'Unimodal';
        break;
      case 2:
        learningTypeDisplay = 'Bimodal';
        break;
      case 3:
        learningTypeDisplay = 'Trimodal';
        break;
      case 4:
        learningTypeDisplay = 'Multimodal';
        break;
      default:
        learningTypeDisplay = 'Unimodal';
    }

    const styleInfo = learningStyleInfo[dominantStyle];
    const Icon = styleInfo.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff]">
        {/* Modern Header */}
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Assessment Complete
                </h1>
                <p className="text-gray-600">
                  Your learning style has been identified
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Background Decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-20 w-32 h-32 bg-[#00af8f]/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#ffd416]/10 rounded-full blur-2xl animate-pulse" />
          </div>

          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm transform transition-all duration-500 hover:shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex flex-col items-center space-y-6">
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${styleInfo.gradient} rounded-2xl flex items-center justify-center shadow-lg transform animate-bounce`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    🎉 Congratulations!
                  </CardTitle>
                  <h2 className="text-2xl font-semibold text-[#00af8f]">
                    {learningTypeDisplay} Learner
                  </h2>
                  {preferredModulesDisplay.length === 1 ? (
                    <>
                      <h3 className={`text-xl font-semibold ${styleInfo.color}`}>
                        {styleInfo.emoji} {styleInfo.title}
                      </h3>
                      <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                        {styleInfo.description}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        {preferredModulesDisplay.map((module) => {
                          const moduleKey = Object.keys(styleMapping).find(
                            key => styleMapping[key] === module
                          ) as keyof typeof learningStyleInfo;
                          const moduleInfo = learningStyleInfo[moduleKey];
                          return (
                            <span key={module} className="inline-flex items-center gap-1 text-lg">
                              <span>{moduleInfo.emoji}</span>
                              <span className={moduleInfo.color}>{module}</span>
                            </span>
                          );
                        })}
                      </div>
                      <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                        You have multiple preferred learning styles! You learn best through a combination of different approaches, making you a versatile learner.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Learning Type Display */}
              <div className="bg-gradient-to-r from-[#00af8f]/10 to-[#00af90]/10 rounded-xl p-6 border-2 border-[#00af8f]/30">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 text-[#00af8f] mr-2" />
                  Your Learning Profile
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Learning Type:</p>
                    <p className="text-2xl font-bold text-[#00af8f]">{learningTypeDisplay}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Preferred Learning Styles:</p>
                    <div className="flex flex-wrap gap-2">
                      {preferredModulesDisplay.map((module) => (
                        <Badge key={module} className="bg-[#00af8f] text-white px-3 py-1">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modern Score Breakdown */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="w-5 h-5 text-[#00af8f] mr-2" />
                  Your Learning Style Scores
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(scores).map(([style, score]) => {
                    const info =
                      learningStyleInfo[
                        style as keyof typeof learningStyleInfo
                      ];
                    const isDominant = style === dominantStyle;
                    const isPreferred = score >= threshold;
                    return (
                      <div
                        key={style}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          isDominant
                            ? `${info.bgColor} ${info.borderColor} shadow-md`
                            : isPreferred
                            ? 'bg-green-50 border-green-200 hover:shadow-sm'
                            : 'bg-gray-50 border-gray-200 hover:shadow-sm'
                        }`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xl">{info.emoji}</span>
                          {isDominant && (
                            <Badge className="bg-[#00af8f] text-white text-xs">
                              Dominant
                            </Badge>
                          )}
                          {!isDominant && isPreferred && (
                            <Badge className="bg-green-500 text-white text-xs">
                              Preferred
                            </Badge>
                          )}
                        </div>
                        <div
                          className={`font-bold text-xl ${
                            isDominant ? info.color : isPreferred ? 'text-green-600' : 'text-gray-700'
                          }`}>
                          {score}/25
                        </div>
                        <div className="text-sm text-gray-600 capitalize font-medium">
                          {info.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-[#333333] mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  What this means for you:
                </h3>
                <ul className="space-y-3 text-[#666666]">
                  <li className="flex items-start">
                    <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    You'll see lessons tailored to your learning style
                  </li>
                  <li className="flex items-start">
                    <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    Content will be optimized for how you learn best
                  </li>
                  <li className="flex items-start">
                    <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    You can always retake this assessment later
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="w-full h-14 text-lg font-semibold text-white bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] shadow-lg transition-all duration-300 rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100">
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-lg">
                      Saving your learning style...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Complete Setup & Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff]">
      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Learning Style Assessment
                </h1>
                <p className="text-gray-600">
                  Help us personalize your learning experience by understanding
                  how you learn best
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="bg-[#00af8f]/10 text-[#00af8f] border-[#00af8f]/20">
                <Target className="w-3 h-3 mr-1" />
                VARK Assessment
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Background Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-[#00af8f]/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#ffd416]/10 rounded-full blur-2xl animate-pulse" />
        </div>

        {/* Modern Progress Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                <div className="w-10 h-10 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {currentStatement + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Question {currentStatement + 1} of{' '}
                    {learningStatements.length}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Learning Style Assessment
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge
                  variant="secondary"
                  className="bg-[#00af8f]/10 text-[#00af8f] border-[#00af8f]/20">
                  {answeredCount} answered
                </Badge>
                {isSubmitting && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-600 border-blue-200 animate-pulse">
                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </Badge>
                )}
                <div className="text-right">
                  <div className="text-lg font-bold text-[#00af8f]">
                    {Math.round(progress)}%
                  </div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>
            </div>

            <Progress value={progress} className="h-2 bg-gray-200 mb-4" />

            {/* Enhanced Progress Indicators */}
            <div className="flex justify-between">
              {learningStatements.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStatement
                      ? 'bg-[#00af8f] scale-150'
                      : answers[index + 1]
                      ? 'bg-green-400'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modern Question Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
          <CardHeader className="text-center pb-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {currentStatement + 1}
                </span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 max-w-4xl leading-relaxed">
                {currentStatementData.statement}
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                <Target className="w-4 h-4" />
                <span>
                  Rate from 1 (Strongly Disagree) to 5 (Strongly Agree)
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Modern Rating Scale */}
            <div className="text-center">
              <div className="flex flex-col items-center space-y-6">
                {/* Scale Labels */}
                <div className="flex justify-between w-full max-w-md text-xs text-gray-500 font-medium">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </div>

                {/* Rating Buttons */}
                <div className="flex justify-center items-center space-x-4">
                  {[1, 2, 3, 4, 5].map(rating => {
                    const scaleInfo =
                      scaleLabels[rating as keyof typeof scaleLabels];
                    const isSelected =
                      answers[currentStatementData.id] === rating;
                    return (
                      <Button
                        key={rating}
                        type="button"
                        variant="outline"
                        className={`w-14 h-14 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-110 ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#00af8f] to-[#00af90] text-white border-[#00af8f] shadow-lg scale-110'
                            : 'hover:border-[#00af8f] hover:bg-[#00af8f]/5 hover:shadow-md border-gray-300'
                        }`}
                        onClick={() => handleRating(rating)}>
                        <div className="flex flex-col items-center">
                          <span className="text-sm">{scaleInfo.emoji}</span>
                          <span className="text-xs font-bold">{rating}</span>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {/* Current Selection Display */}
                {/* {answers[currentStatementData.id] && (
                  <div className="bg-gradient-to-r from-[#00af8f]/10 to-[#00af90]/10 rounded-xl p-4 border border-[#00af8f]/20">
                    <p className="text-lg text-gray-900 font-semibold">
                      Your rating:{' '}
                      <span className="text-[#00af8f] text-2xl font-bold">
                        {answers[currentStatementData.id]}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {
                        scaleLabels[
                          answers[
                            currentStatementData.id
                          ] as keyof typeof scaleLabels
                        ].label
                      }
                    </p>
                  </div>
                )} */}
              </div>
            </div>

            {/* Current Rating Display */}
            {/* {answers[currentStatementData.id] && (
              <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                <p className="text-lg text-[#333333] font-semibold">
                  Your rating:{' '}
                  <span className="text-[#00af8f] text-2xl">
                    {answers[currentStatementData.id]}
                  </span>
                </p>
                <p className="text-sm text-[#666666] mt-1">
                  {
                    scaleLabels[
                      answers[
                        currentStatementData.id
                      ] as keyof typeof scaleLabels
                    ].label
                  }
                </p>
              </div>
            )} */}

            {/* Modern Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={previousStatement}
                disabled={currentStatement === 0 || isSubmitting}
                className="px-6 h-12 text-base font-semibold border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={nextStatement}
                disabled={!answers[currentStatementData.id] || isSubmitting}
                className="px-8 h-12 text-base font-semibold bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {currentStatement === learningStatements.length - 1 ? (
                  <>
                    <span>See Results</span>
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
