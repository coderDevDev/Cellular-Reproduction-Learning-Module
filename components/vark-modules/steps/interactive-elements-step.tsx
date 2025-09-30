'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MousePointer,
  Palette,
  Play,
  Volume2,
  MessageSquare,
  Mic,
  Type,
  StickyNote,
  Activity,
  FlaskConical,
  FileText,
  BarChart3,
  Beaker,
  Gamepad2
} from 'lucide-react';
import { VARKModule } from '@/types/vark-module';

interface InteractiveElementsStepProps {
  formData: Partial<VARKModule>;
  updateFormData: (updates: Partial<VARKModule>) => void;
}

const interactiveElements = [
  {
    key: 'drag_and_drop',
    label: 'Drag & Drop',
    icon: MousePointer,
    description: 'Interactive drag and drop activities for hands-on learning',
    category: 'kinesthetic',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    key: 'visual_builder',
    label: 'Visual Builder',
    icon: Palette,
    description: 'Tools for creating visual content and diagrams',
    category: 'visual',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    key: 'simulation',
    label: 'Simulation',
    icon: Play,
    description: 'Virtual simulations and experiments',
    category: 'kinesthetic',
    color: 'from-teal-600 to-emerald-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    key: 'audio_playback',
    label: 'Audio Playback',
    icon: Volume2,
    description: 'Audio controls and playback features',
    category: 'auditory',
    color: 'from-emerald-600 to-teal-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    key: 'discussion_forum',
    label: 'Discussion Forum',
    icon: MessageSquare,
    description: 'Interactive discussion and collaboration tools',
    category: 'reading_writing',
    color: 'from-teal-700 to-emerald-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    key: 'voice_recording',
    label: 'Voice Recording',
    icon: Mic,
    description: 'Voice recording and audio response capabilities',
    category: 'auditory',
    color: 'from-emerald-700 to-teal-800',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    key: 'text_editor',
    label: 'Text Editor',
    icon: Type,
    description: 'Rich text editing and note-taking tools',
    category: 'reading_writing',
    color: 'from-teal-500 to-emerald-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    key: 'note_taking',
    label: 'Note Taking',
    icon: StickyNote,
    description: 'Digital note-taking and annotation features',
    category: 'reading_writing',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    key: 'physical_activities',
    label: 'Physical Activities',
    icon: Activity,
    description: 'Physical movement and hands-on activities',
    category: 'kinesthetic',
    color: 'from-teal-600 to-emerald-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    key: 'experiments',
    label: 'Experiments',
    icon: FlaskConical,
    description: 'Virtual and physical experiment tools',
    category: 'kinesthetic',
    color: 'from-emerald-600 to-teal-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    key: 'interactive_quizzes',
    label: 'Interactive Quizzes',
    icon: FileText,
    description: 'Dynamic quiz and assessment tools',
    category: 'reading_writing',
    color: 'from-teal-700 to-emerald-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    key: 'progress_tracking',
    label: 'Progress Tracking',
    icon: BarChart3,
    description: 'Visual progress indicators and analytics',
    category: 'visual',
    color: 'from-emerald-700 to-teal-800',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    key: 'virtual_laboratory',
    label: 'Virtual Laboratory',
    icon: Beaker,
    description: 'Virtual lab experiments and simulations',
    category: 'kinesthetic',
    color: 'from-teal-500 to-emerald-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    key: 'gamification',
    label: 'Gamification',
    icon: Gamepad2,
    description: 'Game-like elements and rewards',
    category: 'kinesthetic',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  }
];

const learningStyleCategories = [
  { key: 'visual', label: 'Visual', color: 'from-blue-500 to-blue-600' },
  { key: 'auditory', label: 'Auditory', color: 'from-green-500 to-green-600' },
  {
    key: 'reading_writing',
    label: 'Reading/Writing',
    color: 'from-purple-500 to-purple-600'
  },
  {
    key: 'kinesthetic',
    label: 'Kinesthetic',
    color: 'from-orange-500 to-orange-600'
  }
];

export default function InteractiveElementsStep({
  formData,
  updateFormData
}: InteractiveElementsStepProps) {
  const handleToggleElement = (key: string, checked: boolean) => {
    updateFormData({
      interactive_elements: {
        ...formData.interactive_elements,
        [key]: checked
      }
    });
  };

  const getElementsByCategory = (category: string) => {
    return interactiveElements.filter(element => element.category === category);
  };

  const getSelectedCount = () => {
    return Object.values(formData.interactive_elements || {}).filter(Boolean)
      .length;
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full blur-3xl opacity-30"></div>
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Interactive Elements
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choose interactive features that will engage students and enhance
              learning. Select tools that align with different learning styles
              and create an immersive experience.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {getSelectedCount()}
            </div>
            <div className="text-sm text-blue-600">Elements Selected</div>
          </CardContent>
        </Card>
        {learningStyleCategories.map(category => {
          const categoryElements = getElementsByCategory(category.key);
          const selectedCount = categoryElements.filter(
            element =>
              formData.interactive_elements?.[
                element.key as keyof typeof formData.interactive_elements
              ]
          ).length;
          return (
            <Card
              key={category.key}
              className="border-0 shadow-sm bg-gradient-to-r from-gray-50 to-gray-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-700">
                  {selectedCount}
                </div>
                <div className="text-sm text-gray-600">{category.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Interactive Elements by Category */}
      <div className="space-y-8">
        {learningStyleCategories.map(category => {
          const categoryElements = getElementsByCategory(category.key);
          return (
            <Card key={category.key} className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-semibold text-sm">
                      {category.label.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {category.label} Learning Elements
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Interactive features optimized for{' '}
                      {category.label.toLowerCase()} learners
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryElements.map(element => {
                    const Icon = element.icon;
                    const isSelected =
                      formData.interactive_elements?.[
                        element.key as keyof typeof formData.interactive_elements
                      ];

                    return (
                      <div
                        key={element.key}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={element.key}
                            checked={isSelected || false}
                            onCheckedChange={checked =>
                              handleToggleElement(
                                element.key,
                                checked as boolean
                              )
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div
                                className={`w-8 h-8 bg-gradient-to-r ${element.color} rounded-lg flex items-center justify-center`}>
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                              <Label
                                htmlFor={element.key}
                                className="font-medium text-gray-900 cursor-pointer">
                                {element.label}
                              </Label>
                            </div>
                            <p className="text-sm text-gray-600">
                              {element.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Best Practices */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-purple-100">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">
            🎯 Interactive Learning Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-purple-800">
            <div>
              <h4 className="font-medium mb-2">For Engagement:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Mix different types of interactions</li>
                <li>Provide immediate feedback</li>
                <li>Allow for exploration and discovery</li>
                <li>Include progress tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">For Learning Styles:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Visual: Use diagrams and visual builders</li>
                <li>Auditory: Include audio and voice features</li>
                <li>Reading/Writing: Provide text tools and forums</li>
                <li>Kinesthetic: Add hands-on activities and simulations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={() => {
            // Select all elements
            const allElements = interactiveElements.reduce((acc, element) => {
              acc[element.key] = true;
              return acc;
            }, {} as any);
            updateFormData({ interactive_elements: allElements });
          }}
          className="border-purple-300 text-purple-700 hover:bg-purple-50">
          Select All
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            // Deselect all elements
            const noElements = interactiveElements.reduce((acc, element) => {
              acc[element.key] = false;
              return acc;
            }, {} as any);
            updateFormData({ interactive_elements: noElements });
          }}
          className="border-gray-300 text-gray-700 hover:bg-gray-50">
          Clear All
        </Button>
      </div>
    </div>
  );
}
