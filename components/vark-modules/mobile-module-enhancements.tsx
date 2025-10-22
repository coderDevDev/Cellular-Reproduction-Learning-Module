/**
 * Mobile Module Enhancements
 * Additional components for better mobile UX when viewing modules
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  List,
  CheckCircle,
  Circle,
  Eye,
  Headphones,
  PenTool,
  Zap,
  Clock,
  Target
} from 'lucide-react';
import { VARKModuleContentSection } from '@/types/vark-module';

const learningStyleIcons = {
  everyone: Target,
  visual: Eye,
  auditory: Headphones,
  reading_writing: PenTool,
  kinesthetic: Zap
};

interface MobileModuleNavigationProps {
  sections: VARKModuleContentSection[];
  currentSectionIndex: number;
  onSectionChange: (index: number) => void;
  sectionProgress: Record<string, boolean>;
}

/**
 * Mobile Bottom Navigation
 * Sticky bottom navigation for easy section switching
 */
export function MobileBottomNavigation({
  sections,
  currentSectionIndex,
  onSectionChange,
  sectionProgress
}: MobileModuleNavigationProps) {
  const hasNext = currentSectionIndex < sections.length - 1;
  const hasPrevious = currentSectionIndex > 0;
  const currentSection = sections[currentSectionIndex];
  const completedCount = Object.values(sectionProgress).filter(Boolean).length;
  const progressPercentage = (completedCount / sections.length) * 100;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      {/* Progress Bar */}
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span className="font-medium">{completedCount}/{sections.length}</span>
        </div>
        <Progress value={progressPercentage} className="h-1.5" />
      </div>

      {/* Navigation Buttons */}
      <div className="px-4 py-3 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSectionChange(currentSectionIndex - 1)}
          disabled={!hasPrevious}
          className="flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex-1 text-center min-w-0">
          <p className="text-xs text-gray-500">Section {currentSectionIndex + 1} of {sections.length}</p>
          <p className="text-sm font-medium text-gray-900 truncate">{currentSection?.title}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onSectionChange(currentSectionIndex + 1)}
          disabled={!hasNext}
          className="flex-shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Mobile Section List
 * Collapsible section list with progress indicators
 */
export function MobileSectionList({
  sections,
  currentSectionIndex,
  onSectionChange,
  sectionProgress
}: MobileModuleNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="md:hidden mb-4">
      <Card>
        <CardContent className="p-0">
          {/* Header - Always Visible */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">All Sections ({sections.length})</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {/* Expandable Section List */}
          {isExpanded && (
            <div className="border-t border-gray-200 max-h-96 overflow-y-auto">
              {sections.map((section, index) => {
                const isCompleted = sectionProgress[section.id];
                const isCurrent = index === currentSectionIndex;
                const Icon = isCompleted ? CheckCircle : Circle;

                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      onSectionChange(index);
                      setIsExpanded(false);
                    }}
                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                      isCurrent ? 'bg-purple-50 hover:bg-purple-50' : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      isCompleted ? 'text-green-600' : 'text-gray-400'
                    } ${isCurrent ? 'text-purple-600' : ''}`} />
                    
                    <div className="flex-1 text-left min-w-0">
                      <p className={`text-sm font-medium ${
                        isCurrent ? 'text-purple-900' : 'text-gray-900'
                      } line-clamp-2`}>
                        {index + 1}. {section.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">
                          {section.time_estimate_minutes} min
                        </span>
                        {section.learning_style_tags && section.learning_style_tags.length > 0 && (
                          <div className="flex gap-1">
                            {section.learning_style_tags.slice(0, 2).map((tag) => {
                              const StyleIcon = learningStyleIcons[tag as keyof typeof learningStyleIcons];
                              return StyleIcon ? (
                                <StyleIcon key={tag} className="w-3 h-3 text-gray-400" />
                              ) : null;
                            })}
                            {section.learning_style_tags.length > 2 && (
                              <span className="text-xs text-gray-400">+{section.learning_style_tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isCurrent && (
                      <Badge variant="default" className="bg-purple-600 text-white text-xs flex-shrink-0">
                        Current
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Mobile Section Header
 * Compact section header with key info
 */
interface MobileSectionHeaderProps {
  section: VARKModuleContentSection;
  sectionNumber: number;
  totalSections: number;
  isCompleted: boolean;
}

export function MobileSectionHeader({
  section,
  sectionNumber,
  totalSections,
  isCompleted
}: MobileSectionHeaderProps) {
  return (
    <div className="md:hidden mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              Section {sectionNumber}/{totalSections}
            </Badge>
            {isCompleted && (
              <Badge className="bg-green-600 text-white text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2">
            {section.title}
          </h2>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {section.time_estimate_minutes} min
            </span>
            {section.learning_style_tags && section.learning_style_tags.length > 0 && (
              <span className="flex items-center gap-1">
                {section.learning_style_tags.map((tag) => {
                  const StyleIcon = learningStyleIcons[tag as keyof typeof learningStyleIcons];
                  return StyleIcon ? (
                    <StyleIcon key={tag} className="w-3 h-3" />
                  ) : null;
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile Content Wrapper
 * Better spacing and padding for mobile content
 */
export function MobileContentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:p-0">
      {/* Mobile: More padding and spacing */}
      <div className="prose prose-sm sm:prose-base max-w-none 
        px-1 sm:px-0
        [&>p]:text-base [&>p]:leading-relaxed [&>p]:mb-4
        [&>h1]:text-2xl [&>h1]:mb-4 [&>h1]:mt-6
        [&>h2]:text-xl [&>h2]:mb-3 [&>h2]:mt-5
        [&>h3]:text-lg [&>h3]:mb-2 [&>h3]:mt-4
        [&>ul]:space-y-2 [&>ol]:space-y-2
        [&>li]:text-base
        [&>img]:rounded-lg [&>img]:my-4
        [&>figure]:my-6
      ">
        {children}
      </div>
    </div>
  );
}

/**
 * Swipe Gesture Handler (Optional Enhancement)
 * Add swipe gestures for section navigation
 */
interface SwipeHandlerProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
}

export function SwipeHandler({ onSwipeLeft, onSwipeRight, children }: SwipeHandlerProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
}
