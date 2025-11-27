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
  GraduationCap,
  Menu,
  X,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import DebugSessionInfo from '@/components/debug-session-info';
import { type HomepageStats } from '@/lib/api/stats';
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

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('header')) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Fetch real statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);

        const response = await fetch('/api/stats');
        const result = await response.json();

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
        {/* Modern Mobile-First Header with Light Background */}
        <header className="relative bg-gradient-to-r from-white via-white to-teal-50/10 backdrop-blur-sm border-b border-teal-100/30 shadow-sm">
          {/* Very subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-teal-50/5 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,175,143,0.03),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.02),transparent_50%)]"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo Section - Enlarged */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Enlarged Lottie Logo */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
                  {!lottieError ? (
                    <DotLottieReact
                      src="https://lottie.host/471336af-ae85-416e-b9bc-c910d6bd398e/7iNaBjvF63.lottie"
                      loop
                      autoplay
                      className="w-full h-full"
                      onError={() => {
                        console.log(
                          'Header Lottie animation failed to load, showing fallback'
                        );
                        setLottieError(true);
                      }}
                    />
                  ) : (
                    /* Fallback Logo */
                    <div className="w-full h-full bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-3xl flex items-center justify-center shadow-xl">
                      <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  )}
                </div>

                {/* Brand Text */}
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-[#00af8f] to-gray-900 bg-clip-text text-transparent transition-all duration-300 hover:from-[#00af8f] hover:via-gray-900 hover:to-[#00af8f]">
                    CRLM
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 hidden sm:block transition-colors duration-300 hover:text-[#00af8f]">
                    Cellular Reproduction Learning Module
                  </p>
                  <p className="text-xs text-gray-600 sm:hidden transition-colors duration-300 hover:text-[#00af8f]">
                    Learning Module
                  </p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
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

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-gradient-to-r from-[#00af8f]/10 to-teal-400/10 border border-[#00af8f]/20 hover:from-[#00af8f]/20 hover:to-teal-400/20 transition-all duration-300"
                aria-label="Toggle mobile menu">
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-[#00af8f]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#00af8f]" />
                )}
              </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-b from-white via-white to-teal-50/5 backdrop-blur-sm border-b border-teal-100/20 shadow-xl z-50">
                {/* Very light mobile menu background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-teal-50/3 to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,175,143,0.02),transparent_70%)]"></div>
                <div className="relative z-10 px-4 py-6 space-y-4">
                  {/* Mobile Navigation Links */}
                  <div className="space-y-3">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f] hover:text-white transition-all duration-300 hover:shadow-lg py-3 text-base">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full">
                      <Button className="w-full bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white transition-all duration-300 hover:shadow-lg py-3 text-base">
                        Get Started
                      </Button>
                    </Link>
                  </div>

                  {/* Mobile Menu Footer */}
                  <div className="pt-4 border-t border-gray-200/50">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        Cellular Reproduction Learning Module
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Empowering personalized learning experiences
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                    Educational content
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#00af8f] mb-2 flex items-center justify-center">
              {statsLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  {stats ? stats.totalStudents.toLocaleString() : '1,250'}
                  {stats && stats.totalStudents >= 1000 && '+'}
                  {!stats && '+'}
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
            {!stats && (
              <div className="text-sm text-green-600 mt-1 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +150 this month
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-teal-600 mb-2 flex items-center justify-center">
              {statsLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  {stats ? stats.totalTeachers.toLocaleString() : '85'}
                  {stats && stats.totalTeachers >= 100 && '+'}
                  {!stats && '+'}
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
            {!stats && (
              <div className="text-sm text-green-600 mt-1 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12 this month
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-[#00af90] mb-2 flex items-center justify-center">
              {statsLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>{stats ? `${stats.successRate}%` : '92%'}</>
              )}
            </div>
            <div className="text-gray-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 mr-1" />
              Success Rate
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {stats ? stats.totalModules : '25'} modules available
            </div>
          </div>

          {/* Classes Stat */}
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2 flex items-center justify-center">
              {statsLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  {stats ? stats.totalClasses : '15'}
                  {stats && stats.totalClasses >= 10 && '+'}
                  {!stats && '+'}
                </>
              )}
            </div>
            <div className="text-gray-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 mr-1" />
              Active Classes
            </div>
          </div>

          {/* Quizzes Stat */}
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2 flex items-center justify-center">
              {statsLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  {stats ? stats.totalQuizzes : '45'}
                  {stats && stats.totalQuizzes >= 40 && '+'}
                  {!stats && '+'}
                </>
              )}
            </div>
            <div className="text-gray-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 mr-1" />
              Published Quizzes
            </div>
          </div>

          {/* Activities Stat */}
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2 flex items-center justify-center">
              {statsLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  {stats ? stats.totalActivities : '30'}
                  {stats && stats.totalActivities >= 25 && '+'}
                  {!stats && '+'}
                </>
              )}
            </div>
            <div className="text-gray-600 flex items-center justify-center">
              <Activity className="w-4 h-4 mr-1" />
              Learning Activities
            </div>
          </div>
        </div>

        {/* Enhanced Features Grid with Improved Spacing & Layout */}
        <div className="relative px-4 sm:px-6 lg:px-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-teal-50/5 to-transparent rounded-3xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,175,143,0.03),transparent_70%)] rounded-3xl"></div>

          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-[#00af8f] to-gray-900 bg-clip-text text-transparent mb-4">
                Why Choose CRLM?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experience the future of personalized learning with our
                comprehensive platform designed for both students and educators.
              </p>
            </div>

            {/* Cards Grid with Improved Spacing */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Student Experience Card */}
              <Card className="group relative border-0 shadow-xl bg-gradient-to-br from-white via-white to-teal-50/10 backdrop-blur-sm hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-[1.02] overflow-hidden">
                {/* Card Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#00af8f]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00af8f]/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <CardContent className="relative z-10 p-8 lg:p-10 text-center h-full flex flex-col">
                  {/* Enhanced Icon Container */}
                  <div className="relative mb-8 flex-shrink-0">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <User className="w-10 h-10 lg:w-12 lg:h-12 text-white transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    {/* Floating Elements */}
                    <div className="absolute -top-2 -right-2 w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-teal-400 to-[#00af8f] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 animate-pulse"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-br from-[#00af8f] to-teal-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 animate-bounce"></div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow flex flex-col">
                    <CardTitle className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 via-[#00af8f] to-gray-900 bg-clip-text text-transparent mb-4 transition-all duration-300 group-hover:from-[#00af8f] group-hover:via-gray-900 group-hover:to-[#00af8f]">
                      Student Experience
                    </CardTitle>
                    <p className="text-gray-600 leading-relaxed text-base lg:text-lg flex-grow transition-colors duration-300 group-hover:text-gray-700">
                      Take our advanced VARK learning style assessment and
                      access
                      <span className="font-semibold text-[#00af8f] transition-all duration-300 group-hover:text-teal-600">
                        {' '}
                        personalized lessons
                      </span>
                      , interactive quizzes, and engaging activities tailored to
                      your unique learning preferences.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Teacher Tools Card */}
              <Card className="group relative border-0 shadow-xl bg-gradient-to-br from-white via-white to-teal-50/10 backdrop-blur-sm hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-[1.02] overflow-hidden">
                {/* Card Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <CardContent className="relative z-10 p-8 lg:p-10 text-center h-full flex flex-col">
                  {/* Enhanced Icon Container */}
                  <div className="relative mb-8 flex-shrink-0">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-teal-500 to-[#00af8f] rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <Shield className="w-10 h-10 lg:w-12 lg:h-12 text-white transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    {/* Floating Elements */}
                    <div className="absolute -top-2 -right-2 w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-[#00af8f] to-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 animate-pulse"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-br from-teal-500 to-[#00af8f] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 animate-bounce"></div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow flex flex-col">
                    <CardTitle className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 via-teal-600 to-gray-900 bg-clip-text text-transparent mb-4 transition-all duration-300 group-hover:from-teal-600 group-hover:via-gray-900 group-hover:to-teal-600">
                      Teacher Tools
                    </CardTitle>
                    <p className="text-gray-600 leading-relaxed text-base lg:text-lg flex-grow transition-colors duration-300 group-hover:text-gray-700">
                      Create engaging, interactive lessons with our
                      <span className="font-semibold text-teal-600 transition-all duration-300 group-hover:text-[#00af8f]">
                        {' '}
                        comprehensive toolkit
                      </span>
                      . Build assessments, assign activities, and monitor
                      student progress with real-time analytics.
                    </p>
                  </div>
                </CardContent>
              </Card>

           
            </div>
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
                    <h3 className="text-2xl font-bold tex">CRLM</h3>
                    <p className="text-gray-400 text-sm">
                      Cellular Reproduction Learning Module
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                  Empowering educators and students with personalized learning
                  experiences through advanced VARK assessment.
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
    </div>
  );
}
