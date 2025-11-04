'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, ArrowRight, BookOpen, Shield, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['student', 'teacher'])
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>(
    'student'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'student'
    }
  });

  const roleConfig = {
    teacher: {
      icon: Shield,
      title: 'Teacher Sign In',
      description: 'Access your dashboard',
      color: 'text-teal-600',
      bgColor: 'bg-gradient-to-r from-teal-500 to-[#00af8f]',
      borderColor: 'border-teal-500'
    },
    student: {
      icon: User,
      title: 'Student Sign In',
      description: 'Continue learning',
      color: 'text-[#00af8f]',
      bgColor: 'bg-gradient-to-r from-[#00af8f] to-[#00af90]',
      borderColor: 'border-[#00af8f]'
    }
  } as const;

  const config = roleConfig[selectedRole];

  const handleRoleChange = (role: 'student' | 'teacher') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Login form submitted with data:', data);
      console.log('Calling login function...');
      const result = await login(data.email, data.password, data.role);
      console.log('Login function returned:', result);

      if (result.success && result.user) {
        console.log('Login successful, user data:', result.user);
        console.log('User role:', result.user.role);
        console.log('Onboarding completed:', result.user.onboardingCompleted);

        // Wait for auth state to update before redirecting
        console.log('Waiting for auth state to update...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Role-based redirect according to features.txt
        if (result.user.role === 'teacher') {
          console.log('Redirecting teacher to dashboard');
          window.location.href = '/teacher/dashboard';
        } else if (result.user.role === 'student') {
          if (result.user.onboardingCompleted) {
            console.log('Student onboarding completed, redirecting to dashboard');
            window.location.href = '/student/dashboard';
          } else {
            console.log('Student onboarding not completed, redirecting to VARK');
            window.location.href = '/onboarding/vark';
          }
        }
      } else {
        console.log('Login failed or no user data:', result);
        // Error handling is now done by Sonner toast in auth.ts
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      // Error handling is now done by Sonner toast in auth.ts
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 relative overflow-hidden flex items-center justify-center p-2 sm:p-4">
      {/* Enhanced Background Decorations - Mobile Optimized */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 sm:top-20 sm:left-20 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-[#00af8f]/20 to-[#00af8f]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 sm:bottom-20 sm:right-20 w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-r from-[#00af8f]/15 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-[#00af8f]/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="hidden lg:block absolute top-40 right-40 w-64 h-64 bg-gradient-to-r from-teal-400/15 to-[#00af8f]/15 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="hidden lg:block absolute bottom-40 left-40 w-56 h-56 bg-gradient-to-r from-[#00af8f]/15 to-teal-400/15 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      <div className="w-full max-w-2xl lg:max-w-xl xl:max-w-2xl relative z-10 py-4 sm:py-6 lg:py-8">
        {/* Compact Header - Responsive Optimized */}

        {/* Compact Login Form with Integrated Role Selection */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm group hover:shadow-2xl transition-all duration-300">
          <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-5 lg:px-6">
            <div className="flex items-center justify-center mb-2 sm:mb-3 lg:mb-4">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ${
                  selectedRole === 'teacher'
                    ? 'bg-gradient-to-br from-teal-500 to-[#00af8f]'
                    : 'bg-gradient-to-br from-[#00af8f] to-[#00af90]'
                }`}>
                {(() => {
                  const IconComponent = config.icon;
                  return (
                    <IconComponent className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                  );
                })()}
              </div>
            </div>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              {config.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Role Selection Tabs */}
            <div className="space-y-3">
              <div className="text-center">
                <Label className="text-gray-900 font-semibold text-sm sm:text-base">
                  Choose Your Role
                </Label>
              </div>

              <Tabs
                value={selectedRole}
                onValueChange={value =>
                  handleRoleChange(value as 'student' | 'teacher')
                }
                className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-14 sm:h-16 bg-gray-100 rounded-lg p-1">
                  {(['student', 'teacher'] as const).map(role => (
                    <TabsTrigger
                      key={role}
                      value={role}
                      className="flex flex-col items-center justify-center space-y-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00af8f] data-[state=active]:to-[#00af90] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-[#00af8f] rounded-md transition-all duration-200">
                      {/* Icon Container */}
                      <div
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          selectedRole === role
                            ? 'bg-white/25'
                            : 'bg-gradient-to-br from-[#00af8f] to-[#00af90]'
                        }`}>
                        {(() => {
                          const IconComponent = roleConfig[role].icon;
                          return (
                            <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          );
                        })()}
                      </div>

                      {/* Role Text */}
                      <div className="text-center">
                        <div className="font-semibold text-xs capitalize">
                          {role}
                        </div>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3 sm:space-y-4 lg:space-y-5">
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-900 font-semibold text-sm sm:text-base">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-lg sm:rounded-xl transition-all duration-300 hover:border-[#00af8f]/50"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs sm:text-sm font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="password"
                  className="text-gray-900 font-semibold text-sm sm:text-base">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-lg sm:rounded-xl pr-10 sm:pr-12 transition-all duration-300 hover:border-[#00af8f]/50"
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#00af8f] transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs sm:text-sm font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-11 lg:h-12 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] shadow-xl transition-all duration-300 rounded-lg sm:rounded-xl hover:shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-gray-200">
              <Link
                href="/auth/forgot-password"
                className="text-[#00af8f] hover:text-[#00af90] font-semibold text-xs sm:text-sm transition-colors duration-200 hover:underline">
                Forgot password?
              </Link>

              {/* <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                <p className="text-gray-600 text-xs sm:text-sm">No account?</p>
                <Link
                  href="/auth/register"
                  className="text-[#00af8f] hover:text-[#00af90] font-bold text-xs sm:text-sm transition-colors duration-200 hover:underline">
                  Sign up
                </Link>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
