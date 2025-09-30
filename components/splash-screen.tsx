'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, User, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const steps = [
    {
      title: 'OSCA Superadmin',
      description: 'Full system control and management',
      icon: Shield,
      color: 'text-[#00B5AD]',
      bgColor: 'bg-[#00B5AD]/10'
    },
    {
      title: 'BASCA Admin',
      description: 'Barangay-level management',
      icon: Users,
      color: 'text-[#E6B800]',
      bgColor: 'bg-[#E6B800]/10'
    },
    {
      title: 'Senior Citizen',
      description: 'Self-service portal access',
      icon: User,
      color: 'text-[#00B5AD]',
      bgColor: 'bg-[#00B5AD]/10'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % steps.length);
      }, 800);

      return () => clearInterval(interval);
    }
  }, [isLoading, steps.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] via-[#F0EDE8] to-[#E6B800]/20 flex items-center justify-center p-6 lg:p-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Logo and Title */}
        <div className="mb-12 lg:mb-16">
          <div className="relative w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00B5AD] to-[#E6B800] rounded-3xl blur-xl opacity-75" />
            <div className="relative w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-[#00B5AD] to-[#E6B800] rounded-3xl flex items-center justify-center shadow-2xl">
              <Shield className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
            </div>
            <Sparkles className="absolute -top-3 -right-3 w-8 h-8 lg:w-10 lg:h-10 text-[#E6B800] animate-bounce" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-[#333333] mb-4">
            Cellular Reproduction Learning Module
          </h1>
          <p className="text-3xl lg:text-5xl font-bold text-[#00B5AD] mb-6">
            OSCA Management Platform
          </p>
        </div>

        {/* Loading Animation */}
        <div className="mb-12 lg:mb-16">
          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 lg:h-20 lg:w-20 border-4 border-[#00B5AD] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xl lg:text-2xl text-[#666666] font-medium">
            Initializing system...
          </p>
        </div>

        {/* Feature Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            return (
              <Card
                key={index}
                className={`p-6 lg:p-8 transition-all duration-500 ${
                  isActive
                    ? 'bg-white/90 shadow-xl scale-105'
                    : 'bg-white/60 shadow-lg'
                }`}>
                <CardContent className="text-center">
                  <div
                    className={`w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                      isActive ? step.bgColor : 'bg-[#F8F5F0]'
                    }`}>
                    <Icon
                      className={`w-8 h-8 lg:w-10 lg:h-10 ${
                        isActive ? step.color : 'text-[#666666]'
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-xl lg:text-3xl font-bold mb-2 ${
                      isActive ? 'text-[#333333]' : 'text-[#666666]'
                    }`}>
                    {step.title}
                  </h3>
                  <p
                    className={`text-lg lg:text-xl ${
                      isActive ? 'text-[#333333]' : 'text-[#666666]'
                    }`}>
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mt-8 lg:mt-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 lg:w-6 lg:h-6 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'bg-[#00B5AD] scale-125'
                  : 'bg-[#E0DDD8]'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 lg:mt-12">
          <p className="text-base lg:text-lg text-[#666666]">
            Powered by OSCA Technology
          </p>
        </div>
      </div>
    </div>
  );
}
