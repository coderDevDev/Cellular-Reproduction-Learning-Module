'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  MapPin,
  Phone,
  AlertTriangle,
  FileText,
  Home,
  Users
} from 'lucide-react';

export interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isCompleted: boolean;
  isRequired: boolean;
}

interface MultiStepFormProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  canProceed: boolean;
  children: React.ReactNode;
  submitLabel?: string;
}

export function MultiStepForm({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting,
  canProceed,
  children,
  submitLabel = 'Submit'
}: MultiStepFormProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-8">
      {/* Progress Header */}
      {/* <div className="bg-gradient-to-r from-[#feffff] to-[#ffffff] p-6 rounded-2xl border border-[#E0DDD8]/50 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#333333] mb-1">
              Step {currentStep + 1} of {steps.length}
            </h2>
            <p className="text-[#666666] text-sm font-medium">
              {steps[currentStep].title}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge
              variant="secondary"
              className="bg-[#00af8f]/10 text-[#00af8f] px-3 py-1 text-sm font-semibold">
              {Math.round(progress)}% Complete
            </Badge>
            <div className="text-xs text-[#666666] bg-[#feffff] px-3 py-1 rounded-full border">
              {currentStep + 1} / {steps.length}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-3 bg-[#E0DDD8]/30" />
          <div className="flex justify-between text-xs text-[#666666]">
            <span>Started</span>
            <span>Complete</span>
          </div>
        </div>
      </div> */}

      {/* Step Navigation */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, index) => (
          <Card
            key={step.id}
            className={`cursor-pointer transition-all duration-200 ${
              index === currentStep
                ? 'border-[#00af8f] bg-[#00af8f]/5'
                : index < currentStep
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 hover:border-[#00af8f]/50'
            }`}
            onClick={() => onStepChange(index)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === currentStep
                    ? 'bg-[#00af8f] text-white'
                    : index < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    (() => {
                      const IconComponent = step.icon;
                      return <IconComponent className="w-4 h-4" />;
                    })()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#333333] text-sm truncate">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#666666] truncate">
                    {step.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div> */}

      {/* Current Step Content */}
      <Card className="border-0 bg-white shadow-lg rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          {/* Step Header */}
          <div className="bg-gradient-to-r from-[#00af8f] to-[#00af90] p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                {(() => {
                  const IconComponent = steps[currentStep].icon;
                  return <IconComponent className="w-6 h-6 text-white" />;
                })()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {steps[currentStep].title}
                </h3>
                <p className="text-white/80 text-sm">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">{children}</div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between bg-[#feffff] p-6 rounded-2xl border border-[#E0DDD8]/50">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="h-12 px-6 border-2 border-[#E0DDD8] text-[#666666] hover:bg-[#E0DDD8]/20 hover:border-[#00af8f]/50 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all duration-200">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center space-x-4">
          {/* Step indicator dots */}
          <div className="flex items-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentStep
                    ? 'bg-[#00af8f] w-8'
                    : index < currentStep
                    ? 'bg-[#00af8f]/60'
                    : 'bg-[#E0DDD8]'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={onNext}
              disabled={!canProceed}
              className="h-12 px-8 bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!canProceed || isSubmitting}
              className="h-12 px-8 bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Submitting...
                </div>
              ) : (
                submitLabel
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step components for different sections
export function PersonalInfoStep({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

export function AddressStep({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

export function ContactStep({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

export function EmergencyContactStep({
  children
}: {
  children: React.ReactNode;
}) {
  return <div className="space-y-6">{children}</div>;
}

export function MedicalStep({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

export function LivingConditionsStep({
  children
}: {
  children: React.ReactNode;
}) {
  return <div className="space-y-6">{children}</div>;
}

export function BeneficiariesStep({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}
