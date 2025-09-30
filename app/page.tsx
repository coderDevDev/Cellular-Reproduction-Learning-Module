'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Shield,
  User,
  ArrowRight,
  Loader2,
  TrendingUp,
  Users,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import DebugSessionInfo from '@/components/debug-session-info';
import { StatsAPI, type HomepageStats } from '@/lib/api/stats';
import { toast } from 'sonner';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function HomePage() {
  const { user, authState } = useAuth();
  const router = useRouter();
  const isLoading = authState.isLoading;

  // Real data state
  const [stats, setStats] = useState<HomepageStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Lottie animation state
  const [lottieError, setLottieError] = useState(false);

  // Fetch real statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);

        const result = await StatsAPI.getHomepageStats();

        if (result.success && result.data) {
          setStats(result.data);
        } else {
          setStatsError(result.error || 'Failed to fetch statistics');
          toast.error('Failed to load statistics', {
            description: 'Using default values for now'
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStatsError('Failed to fetch statistics');
        toast.error('Error loading statistics');
      } finally {
        setStatsLoading(false);
      }
    };

    // Only fetch stats if user is not authenticated (landing page)
    if (!isLoading && !user) {
      fetchStats();
    }
  }, [isLoading, user]);

  useEffect(() => {
    if (!isLoading && user) {
      console.log('User data for redirect:', {
        id: user.id,
        email: user.email,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
        learningStyle: user.learningStyle
      });

      // Redirect authenticated users based on role and onboarding status
      if (user.role === 'teacher') {
        console.log('Redirecting teacher to dashboard');
        router.push('/teacher/dashboard');
      } else if (user.role === 'student') {
        // Check if onboarding is completed (handle both boolean and undefined cases)
        const isOnboardingCompleted = user.onboardingCompleted === true;
        console.log('Student onboarding status:', isOnboardingCompleted);

        if (isOnboardingCompleted) {
          console.log('Redirecting completed student to dashboard');
          router.push('/student/dashboard');
        } else {
          console.log('Redirecting incomplete student to VARK onboarding');
          router.push('/onboarding/vark');
        }
      }
    } else if (!isLoading && !user) {
      console.log('No user found, staying on landing page');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              Loading CRLM
            </h3>
            <p className="text-gray-600">
              Preparing your learning experience...
            </p>
            <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto mt-4">
              <div className="w-1/3 h-full bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Debug: User Found - Redirecting...
            </h1>
            <p className="text-gray-600">
              You should be redirected automatically. If not, check the debug
              info below.
            </p>
          </div>
          <DebugSessionInfo />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 relative overflow-hidden">
      {/* Enhanced Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-[#00af8f]/20 to-[#00af8f]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#00af8f]/15 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#00af8f]/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="hidden lg:block absolute top-40 right-40 w-64 h-64 bg-gradient-to-r from-teal-400/15 to-[#00af8f]/15 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="hidden lg:block absolute bottom-40 left-40 w-56 h-56 bg-gradient-to-r from-[#00af8f]/15 to-teal-400/15 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Enhanced Header */}
        <header className="flex justify-between items-center p-6 lg:px-12">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CRLM</h1>
              <p className="text-sm text-gray-600">
                Cellular Reproduction Learning Module
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="border-2 border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f] hover:text-white transition-all duration-300 hover:shadow-lg px-6 py-2">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white transition-all duration-300 hover:shadow-lg px-6 py-2">
                Get Started
              </Button>
            </Link>
          </div>
        </header>

        {/* Enhanced Hero Section with Lottie */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text Content */}
              <div className="text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#00af8f]/10 to-teal-400/10 border border-[#00af8f]/20 mb-8">
                  <div className="w-2 h-2 bg-[#00af8f] rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-[#00af8f]">
                    Next-Generation Learning Platform
                  </span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                  Personalized
                  <span className="block bg-gradient-to-r from-[#00af8f] via-[#00af90] to-teal-600 bg-clip-text text-transparent">
                    Learning Experience
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Discover your unique learning style with our advanced VARK
                  assessment and access
                  <span className="font-semibold text-[#00af8f]">
                    {' '}
                    AI-powered educational content
                  </span>{' '}
                  that adapts to how you learn best.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-8">
                  <Link href="/auth/register">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white text-lg px-10 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                      Start Learning Journey
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#00af8f] hover:text-[#00af8f] text-lg px-10 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      Teacher Portal
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column - Lottie Animation */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Main Lottie Animation */}
                  <div className="w-96 h-96 lg:w-[500px] lg:h-[500px]">
                    {!lottieError ? (
                      <DotLottieReact
                        // Popular educational Lottie animations you can use:
                        // Replace the src with any of these working URLs:
                        // "https://lottie.host/4b5b5b5b-5b5b-5b5b-5b5b-5b5b5b5b5b5b/education.lottie"
                        // "https://lottie.host/3b5b5b5b-5b5b-5b5b-5b5b-5b5b5b5b5b5b/learning.lottie"
                        // "https://lottie.host/2b5b5b5b-5b5b-5b5b-5b5b-5b5b5b5b5b5b/student.lottie"
                        // "https://lottie.host/1b5b5b5b-5b5b-5b5b-5b5b-5b5b5b5b5b5b/teacher.lottie"
                        // Or use local files: "/animations/learning-animation.lottie"
                        // Example working URL: "https://lottie.host/4b5b5b5b-5b5b-5b5b-5b5b-5b5b5b5b5b5b/education.lottie"
                        src="https://lottie.host/5f6479fe-0bfc-4874-87e4-4d3b98ad53a4/FVkTpi5JYg.lottie"
                        loop
                        autoplay
                        className="w-full h-full"
                        onError={() => {
                          console.log(
                            'Lottie animation failed to load, showing fallback'
                          );
                          setLottieError(true);
                        }}
                      />
                    ) : (
                      /* Fallback Animation */
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00af8f]/10 to-teal-400/10 rounded-3xl border-2 border-[#00af8f]/20">
                        <div className="text-center">
                          <div className="w-32 h-32 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                            <BookOpen className="w-16 h-16 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-[#00af8f] mb-2">
                            Learning Made Fun
                          </h3>
                          <p className="text-gray-600">
                            Interactive educational content
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>

                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-teal-400 to-[#00af8f] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Users className="w-6 h-6 text-white" />
                  </div>

                  <div className="absolute top-1/2 -left-8 w-10 h-10 bg-gradient-to-br from-[#00af8f] to-teal-600 rounded-full flex items-center justify-center shadow-lg animate-ping">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Error State for Stats */}
        {statsError && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center justify-center text-yellow-700">
              <div className="w-4 h-4 mr-2">⚠️</div>
              <span className="text-sm">
                Statistics temporarily unavailable. Showing default values.
              </span>
            </div>
          </div>
        )}

        {/* Real Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#00af8f] mb-2 flex items-center justify-center">
              {statsLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  {stats ? stats.totalStudents.toLocaleString() : '0'}
                  {stats && stats.totalStudents >= 1000 && '+'}
                </>
              )}
            </div>
            <div className="text-gray-600 flex items-center justify-center">
              <Users className="w-4 h-4 mr-1" />
              Students Learning
            </div>
            {stats && stats.recentActivity.newStudents > 0 && (
              <div className="text-sm text-green-600 mt-1 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 mr-1" />+
                {stats.recentActivity.newStudents} this month
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-teal-600 mb-2 flex items-center justify-center">
              {statsLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  {stats ? stats.totalTeachers.toLocaleString() : '0'}
                  {stats && stats.totalTeachers >= 100 && '+'}
                </>
              )}
            </div>
            <div className="text-gray-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 mr-1" />
              Teachers Active
            </div>
            {stats && stats.recentActivity.newTeachers > 0 && (
              <div className="text-sm text-green-600 mt-1 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 mr-1" />+
                {stats.recentActivity.newTeachers} this month
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-[#00af90] mb-2 flex items-center justify-center">
              {statsLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>{stats ? `${stats.successRate}%` : '0%'}</>
              )}
            </div>
            <div className="text-gray-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 mr-1" />
              Success Rate
            </div>
            {stats && (
              <div className="text-sm text-gray-500 mt-1">
                {stats.totalModules} modules available
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="group border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <User className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-6">
                Student Experience
              </CardTitle>
              <p className="text-gray-600 leading-relaxed text-lg">
                Take our advanced VARK learning style assessment and access
                <span className="font-semibold text-[#00af8f]">
                  {' '}
                  personalized lessons
                </span>
                , interactive quizzes, and engaging activities tailored to your
                unique learning preferences.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-[#00af8f] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-6">
                Teacher Tools
              </CardTitle>
              <p className="text-gray-600 leading-relaxed text-lg">
                Create engaging, interactive lessons with our
                <span className="font-semibold text-teal-600">
                  {' '}
                  comprehensive toolkit
                </span>
                . Build assessments, assign activities, and monitor student
                progress with real-time analytics.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00af8f] to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-6">
                Smart Content
              </CardTitle>
              <p className="text-gray-600 leading-relaxed text-lg">
                <span className="font-semibold text-[#00af8f]">
                  AI-powered content recommendations
                </span>{' '}
                based on learning styles, progress tracking, and adaptive
                assessments for optimal learning outcomes and engagement.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="mt-20 relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">CRLM</h3>
                  <p className="text-gray-400 text-sm">
                    Cellular Reproduction Learning Module
                  </p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                Empowering educators and students with personalized learning
                experiences through advanced VARK assessment and AI-powered
                content delivery.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">For Students</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-[#00af8f] transition-colors">
                    Learning Assessment
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-[#00af8f] transition-colors">
                    Personalized Content
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-[#00af8f] transition-colors">
                    Progress Tracking
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-[#00af8f] transition-colors">
                    Interactive Quizzes
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">For Teachers</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-[#00af8f] transition-colors">
                    Content Creation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-[#00af8f] transition-colors">
                    Student Analytics
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-[#00af8f] transition-colors">
                    Assessment Builder
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-[#00af8f] transition-colors">
                    Class Management
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">&copy; 2025 CRLM</p>
              <div className="flex space-x-6">
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#00af8f] transition-colors">
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#00af8f] transition-colors">
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#00af8f] transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
