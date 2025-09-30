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
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement password reset logic with Supabase
      // await supabase.auth.resetPasswordForEmail(data.email);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send reset email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Background Decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-[#00af8f]/20 rounded-full blur-2xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#ffd416]/20 rounded-full blur-2xl" />
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-[#333333]">
                Check Your Email
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-[#666666]">
                We've sent you a password reset link. Please check your email
                and follow the instructions to reset your password.
              </p>

              <div className="space-y-4">
                <Link href="/auth/login">
                  <Button className="w-full h-12 text-lg font-semibold text-white bg-[#00af8f] hover:bg-[#00af90] shadow-lg transition-all duration-300 rounded-xl hover:shadow-xl hover:scale-105 active:scale-95">
                    Back to Login
                  </Button>
                </Link>

                <p className="text-sm text-[#666666]">
                  Didn't receive the email?{' '}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-[#00af8f] hover:text-[#00af90] font-medium">
                    Try again
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#00af8f]/20 rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#ffd416]/20 rounded-full blur-2xl" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/auth/login"
            className="absolute top-4 left-4 text-[#666666] hover:text-[#333333] inline-flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Login
          </Link>

          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-[#00af8f] rounded-2xl flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[#333333] mb-2">
            Forgot Password?
          </h1>
          <p className="text-lg text-[#666666]">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {/* Forgot Password Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-[#333333]">
              Reset Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#333333] font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-lg font-semibold text-white bg-[#00af8f] hover:bg-[#00af90] shadow-lg transition-all duration-300 rounded-xl hover:shadow-xl hover:scale-105 active:scale-95">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-[#666666] text-sm">
                Remember your password?{' '}
                <Link
                  href="/auth/login"
                  className="text-[#00af8f] hover:text-[#00af90] font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
