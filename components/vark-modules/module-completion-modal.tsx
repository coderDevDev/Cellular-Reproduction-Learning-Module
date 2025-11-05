'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Award,
  Download,
  Share2,
  TrendingUp,
  Clock,
  Target,
  Star,
  ArrowRight,
  Sparkles,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface ModuleCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle: string;
  completionData: {
    finalScore: number;
    timeSpent: number; // minutes
    preTestScore?: number;
    postTestScore?: number;
    sectionsCompleted: number;
    totalSections: number;
    perfectSections: number;
  };
  badge?: {
    name: string;
    icon: string;
    description: string;
    rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
  onDownloadCertificate?: () => void;
  onViewSummary?: () => void;
}

const rarityColors = {
  bronze: 'from-orange-400 to-orange-600',
  silver: 'from-gray-300 to-gray-500',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-purple-400 to-purple-600'
};

export default function ModuleCompletionModal({
  isOpen,
  onClose,
  moduleTitle,
  completionData,
  badge,
  onDownloadCertificate,
  onViewSummary
}: ModuleCompletionModalProps) {
  const [showBadge, setShowBadge] = useState(false);

  const {
    finalScore,
    timeSpent,
    preTestScore,
    postTestScore,
    sectionsCompleted,
    totalSections,
    perfectSections
  } = completionData;

  const improvement =
    preTestScore && postTestScore
      ? Math.round(((postTestScore - preTestScore) / preTestScore) * 100)
      : null;

  const hours = Math.floor(timeSpent / 60);
  const minutes = timeSpent % 60;

  // Confetti celebration effect
  useEffect(() => {
    if (isOpen) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          // Show badge after confetti
          setTimeout(() => setShowBadge(true), 500);
          return;
        }

        confetti({
          particleCount: 3,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#4169E1', '#32CD32']
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-blue-50 to-purple-50">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4 py-6">
            {/* Success Icon */}
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <div className="w-24 h-24 rounded-full bg-green-400 opacity-75"></div>
              </div>
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <DialogTitle className="text-3xl font-bold text-gray-900">
              🎉 Congratulations!
            </DialogTitle>
            <DialogDescription className="text-lg text-gray-700">
              You've successfully completed
              <span className="block font-semibold text-blue-600 mt-1">
                {moduleTitle}
              </span>
            </DialogDescription>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        {/* Performance Summary */}
        <div className="space-y-6">
          {/* Score Card */}
          <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Your Performance
              </h3>
              <div className="text-4xl font-bold text-blue-600">
                {finalScore}%
              </div>
            </div>

            <Progress value={finalScore} className="h-3 mb-4" />

            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Sections Completed */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Sections
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {sectionsCompleted}/{totalSections}
                </div>
              </div>

              {/* Time Spent */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Time Spent
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {hours > 0 && `${hours}h `}
                  {minutes}m
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Scores */}
          {preTestScore !== undefined && postTestScore !== undefined && (
            <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Assessment Progress
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Pre-Test</div>
                  <div className="text-3xl font-bold text-gray-700">
                    {preTestScore}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Post-Test</div>
                  <div className="text-3xl font-bold text-green-600">
                    {postTestScore}%
                  </div>
                </div>
              </div>

              {improvement !== null && improvement > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-bold text-green-700">
                      +{improvement}% Improvement!
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Perfect Sections */}
          {perfectSections > 0 && (
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-600" />
                <div>
                  <div className="font-bold text-gray-900">
                    {perfectSections} Perfect Section{perfectSections !== 1 && 's'}!
                  </div>
                  <div className="text-sm text-gray-600">
                    You scored 100% on {perfectSections} section{perfectSections !== 1 && 's'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Badge Achievement */}
          {/* {badge && showBadge && (
            <div className={`p-6 bg-gradient-to-r ${rarityColors[badge.rarity]} rounded-xl shadow-2xl transform transition-all duration-500 scale-100`}>
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="text-6xl animate-bounce">
                    {badge.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Achievement Unlocked!
                </h3>
                <div className="text-xl font-semibold text-white">
                  {badge.name}
                </div>
                <p className="text-sm text-white/90">
                  {badge.description}
                </p>
                <Badge className="bg-white/20 text-white border-white/30">
                  {badge.rarity.toUpperCase()}
                </Badge>
              </div>
            </div>
          )} */}
        </div>

        {/* Action Buttons */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          {onDownloadCertificate && (
            <Button
              onClick={onDownloadCertificate}
              variant="outline"
              className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Certificate
            </Button>
          )}

          <Button
            onClick={() => {
              // Share functionality
              if (navigator.share) {
                navigator.share({
                  title: 'Module Completed!',
                  text: `I just completed ${moduleTitle} with a score of ${finalScore}%!`
                });
              }
            }}
            variant="outline"
            className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Achievement
          </Button>

          {onViewSummary && (
            <Button
              onClick={onViewSummary}
              variant="outline"
              className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              View Detailed Summary
            </Button>
          )}

          <Button
            onClick={onClose}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Back to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}
