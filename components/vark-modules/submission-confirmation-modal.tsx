'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  Save,
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubmissionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  sectionTitle: string;
  sectionType: string;
  timeSpent: number; // seconds
  assessmentResult?: {
    score: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
  };
  isLastSection?: boolean;
}

export default function SubmissionConfirmationModal({
  isOpen,
  onClose,
  onContinue,
  sectionTitle,
  sectionType,
  timeSpent,
  assessmentResult,
  isLastSection = false
}: SubmissionConfirmationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  // Format time spent
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;
  const timeDisplay = minutes > 0 
    ? `${minutes}m ${seconds}s` 
    : `${seconds}s`;

  // Confetti effect for good scores
  useEffect(() => {
    if (isOpen && assessmentResult && assessmentResult.percentage >= 80) {
      const duration = 2000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 2,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
          colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isOpen, assessmentResult]);

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <DialogTitle className="text-2xl font-bold text-gray-900">
              {assessmentResult ? 'Assessment Submitted!' : 'Section Completed!'}
            </DialogTitle>
            
            <DialogDescription className="text-gray-600">
              Your work has been saved successfully
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Section Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Section</span>
                </div>
                <p className="text-gray-900 font-semibold">{sectionTitle}</p>
              </div>
              <Badge variant="outline" className="capitalize">
                {sectionType}
              </Badge>
            </div>

            <Separator />

            {/* Time Spent */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Time Spent</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{timeDisplay}</span>
            </div>

            {/* Assessment Results */}
            {assessmentResult && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600">Score</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {assessmentResult.score}/{assessmentResult.totalQuestions}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">Percentage</span>
                    </div>
                    <span className={`text-lg font-bold ${
                      assessmentResult.percentage >= 80 
                        ? 'text-green-600' 
                        : assessmentResult.percentage >= 60 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {assessmentResult.percentage.toFixed(0)}%
                    </span>
                  </div>

                  {/* Pass/Fail Badge */}
                  {assessmentResult.passed ? (
                    <div className="flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-2 px-3 rounded-md">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-semibold">Passed!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 bg-yellow-50 text-yellow-700 py-2 px-3 rounded-md">
                      <span className="text-sm font-semibold">Keep practicing!</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Saved Indicator */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Save className="w-4 h-4" />
            <span>Your answers have been saved and submitted</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2">
          {!isLastSection && (
            <Button
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700">
              Continue to Next Section
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full">
            {isLastSection ? 'View Results' : 'Stay on This Section'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}