'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Shield, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import DebugSessionInfo from '@/components/debug-session-info';

export default function HomePage() {
  const { user, authState } = useAuth();
  const router = useRouter();
  const isLoading = authState.isLoading;

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

        {/* Enhanced Hero Section */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-7xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#00af8f]/10 to-teal-400/10 border border-[#00af8f]/20 mb-8">
              <div className="w-2 h-2 bg-[#00af8f] rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-[#00af8f]">
                Next-Generation Learning Platform
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight">
              Personalized
              <span className="block bg-gradient-to-r from-[#00af8f] via-[#00af90] to-teal-600 bg-clip-text text-transparent">
                Learning Experience
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Discover your unique learning style with our advanced VARK
              assessment and access
              <span className="font-semibold text-[#00af8f]">
                {' '}
                AI-powered educational content
              </span>{' '}
              that adapts to how you learn best. Teachers can create engaging,
              interactive lessons and track student progress in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
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

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#00af8f] mb-2">
                  10K+
                </div>
                <div className="text-gray-600">Students Learning</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-600 mb-2">
                  500+
                </div>
                <div className="text-gray-600">Teachers Active</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#00af90] mb-2">
                  95%
                </div>
                <div className="text-gray-600">Success Rate</div>
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
                    , interactive quizzes, and engaging activities tailored to
                    your unique learning preferences.
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
        </main>

        {/* Enhanced Footer */}
        <footer className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16">
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
                <p className="text-gray-400 mb-4 md:mb-0">
                  &copy; 2024 CRLM. Built with modern web technologies and
                  powered by AI.
                </p>
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
