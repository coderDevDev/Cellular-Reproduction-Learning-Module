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
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Shield,
  User,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    middleName: z.string().optional(),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    gradeLevel: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['student', 'teacher'])
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>(
    'student'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student'
    }
  });

  const password = watch('password');

  const roleConfig = {
    teacher: {
      icon: Shield,
      title: 'Teacher Sign Up',
      subtitle: 'Educator Portal',
      description: 'Create lessons, quizzes, and manage classes',
      color: 'text-[#00af8f]',
      bgColor: 'bg-[#00af8f]',
      borderColor: 'border-[#00af8f]'
    },
    student: {
      icon: User,
      title: 'Student Sign Up',
      subtitle: 'Learning Portal',
      description: 'Access lessons, take quizzes, and submit activities',
      color: 'text-[#00af8f]',
      bgColor: 'bg-[#00af8f]',
      borderColor: 'border-[#00af8f]'
    }
  } as const;

  const config = roleConfig[selectedRole];

  const handleRoleChange = (role: 'student' | 'teacher') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await registerUser({
        ...data,
        role: selectedRole
      });

      console.log({ selectedRole });

      // Small delay to allow authentication state to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect based on role according to features.txt
      if (selectedRole === 'teacher') {
        router.push('/teacher/dashboard');
      } else {
        // Students go to VARK onboarding
        router.push('/onboarding/vark');
      }
    } catch (err) {
      // Error handling is now done by Sonner toast in auth.ts
      // Just set a generic error for the UI state
      setError('Registration failed. Please try again.');
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
        <div className="text-center mb-4 sm:mb-5 lg:mb-6">
          <Link
            href="/auth/login"
            className="absolute top-2 left-2 sm:top-4 sm:left-4 text-gray-600 hover:text-[#00af8f] inline-flex items-center text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            Back to Login
          </Link>

          <div className="flex items-center justify-center mb-2 sm:mb-3 lg:mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">
            Create Account
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-2 sm:mb-3 px-4">
            Join the learning community
          </p>
        </div>

        {/* Role Selection Tabs */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-4 sm:mb-5 lg:mb-6 group hover:shadow-2xl transition-all duration-300">
          <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-5 lg:px-6">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
              Choose Your Role
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 lg:p-6">
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
          </CardContent>
        </Card>

        {/* Register Form */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm group hover:shadow-2xl transition-all duration-300">
          <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-5 lg:px-6">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              {config.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3 sm:space-y-4 lg:space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-[#333333] font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Juan"
                    className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-lg sm:rounded-xl transition-all duration-300 hover:border-[#00af8f]/50"
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="middleName"
                    className="text-[#333333] font-medium">
                    Middle Name
                  </Label>
                  <Input
                    id="middleName"
                    type="text"
                    placeholder="Santos"
                    className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-lg sm:rounded-xl transition-all duration-300 hover:border-[#00af8f]/50"
                    {...register('middleName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-[#333333] font-medium">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Dela Cruz"
                    className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-lg sm:rounded-xl transition-all duration-300 hover:border-[#00af8f]/50"
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#333333] font-medium">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              {selectedRole === 'student' && (
                <div className="space-y-2">
                  <Label
                    htmlFor="gradeLevel"
                    className="text-[#333333] font-medium">
                    Grade Level
                  </Label>
                  <Input
                    id="gradeLevel"
                    type="text"
                    placeholder="Grade 6"
                    className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-lg sm:rounded-xl transition-all duration-300 hover:border-[#00af8f]/50"
                    {...register('gradeLevel')}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-[#333333] font-medium">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl pr-12"
                      {...register('password')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#333333]"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-[#333333] font-medium">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl pr-12"
                      {...register('confirmPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#333333]"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }>
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-11 lg:h-12 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] shadow-xl transition-all duration-300 rounded-lg sm:rounded-xl hover:shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                <p className="text-gray-600 text-xs sm:text-sm">
                  Already have an account?
                </p>
                <Link
                  href="/auth/login"
                  className="text-[#00af8f] hover:text-[#00af90] font-bold text-xs sm:text-sm transition-colors duration-200 hover:underline">
                  Sign in here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
