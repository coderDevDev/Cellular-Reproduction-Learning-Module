'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Target,
  Clock,
  CheckCircle,
  Eye,
  Headphones,
  PenTool,
  Zap,
  Play,
  Pause,
  ArrowLeft,
  Brain
} from 'lucide-react';
import { sampleCellDivisionModule } from '@/data/sample-cell-division-module';
import DynamicModuleViewer from '@/components/vark-modules/dynamic-module-viewer';
import Link from 'next/link';

export default function CellDivisionModuleDemo() {
  const [isModuleActive, setIsModuleActive] = useState(false);
  const [moduleProgress, setModuleProgress] = useState<Record<string, boolean>>(
    {}
  );
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const handleSectionComplete = (sectionId: string) => {
    setCompletedSections(prev => [...prev, sectionId]);
    setModuleProgress(prev => ({ ...prev, [sectionId]: true }));
  };

  const handleProgressUpdate = (sectionId: string, completed: boolean) => {
    setModuleProgress(prev => ({ ...prev, [sectionId]: completed }));
  };

  const totalSections =
    sampleCellDivisionModule.content_structure.sections.length;
  const progressPercentage = (completedSections.length / totalSections) * 100;

  const learningStyleIcons = {
    visual: Eye,
    auditory: Headphones,
    reading_writing: PenTool,
    kinesthetic: Zap
  };

  const learningStyleColors = {
    visual: 'from-blue-500 to-blue-600',
    auditory: 'from-green-500 to-green-600',
    reading_writing: 'from-purple-500 to-purple-600',
    kinesthetic: 'from-orange-500 to-orange-600'
  };

  if (isModuleActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Module Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setIsModuleActive(false)}
              className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Module Overview
            </Button>

            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
                      {sampleCellDivisionModule.title}
                    </CardTitle>
                    <p className="text-lg text-gray-600 mb-4">
                      {sampleCellDivisionModule.description}
                    </p>

                    {/* Progress Overview */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>
                          Overall Progress: {completedSections.length} of{' '}
                          {totalSections} sections
                        </span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <Badge
                      variant="outline"
                      className="border-gray-300 text-lg px-4 py-2">
                      <Clock className="w-5 h-5 mr-2" />
                      {sampleCellDivisionModule.estimated_duration_minutes} min
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-gray-300 text-lg px-4 py-2">
                      <Target className="w-5 h-5 mr-2" />
                      {sampleCellDivisionModule.difficulty_level}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Dynamic Module Viewer */}
          <DynamicModuleViewer
            module={sampleCellDivisionModule}
            onProgressUpdate={handleProgressUpdate}
            onSectionComplete={handleSectionComplete}
            initialProgress={moduleProgress}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/demo">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Demos
            </Button>
          </Link>
        </div>

        {/* Module Overview */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-4xl font-bold text-gray-900 mb-3">
                {sampleCellDivisionModule.title}
              </CardTitle>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {sampleCellDivisionModule.description}
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Module Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Learning Objectives */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sampleCellDivisionModule.learning_objectives.map(
                  (objective, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-2 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{objective}</span>
                    </li>
                  )
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Module Stats */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Module Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Sections:</span>
                <Badge variant="outline">{totalSections}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Duration:</span>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {sampleCellDivisionModule.estimated_duration_minutes} min
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Difficulty:</span>
                <Badge variant="outline">
                  <Target className="w-3 h-3 mr-1" />
                  {sampleCellDivisionModule.difficulty_level}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Assessments:</span>
                <Badge variant="outline">
                  {sampleCellDivisionModule.assessment_questions.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Learning Style Support */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                Learning Style Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(learningStyleIcons).map(([style, Icon]) => {
                  const color =
                    learningStyleColors[
                      style as keyof typeof learningStyleColors
                    ];
                  return (
                    <div key={style} className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {style.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Structure Preview */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">📚 Content Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleCellDivisionModule.content_structure.sections.map(
                (section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {section.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {section.content_type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {section.time_estimate_minutes} min
                        </span>
                        {section.is_required && (
                          <Badge
                            variant="outline"
                            className="text-xs border-red-300 text-red-700">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {section.learning_style_tags.map(tag => {
                        const Icon =
                          learningStyleIcons[
                            tag as keyof typeof learningStyleIcons
                          ];
                        const color =
                          learningStyleColors[
                            tag as keyof typeof learningStyleColors
                          ];
                        return (
                          <div
                            key={tag}
                            className={`w-6 h-6 bg-gradient-to-r ${color} rounded-full flex items-center justify-center`}>
                            <Icon className="w-3 h-3 text-white" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interactive Elements */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">🎮 Interactive Elements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(
                sampleCellDivisionModule.interactive_elements
              ).map(([element, enabled]) => {
                if (!enabled) return null;
                const elementName = element
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase());
                return (
                  <div
                    key={element}
                    className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-green-800">
                      {elementName}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Start Module Button */}
        <div className="text-center">
          <Button
            onClick={() => setIsModuleActive(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            <Play className="w-6 h-6 mr-2" />
            Start Learning Module
          </Button>
          <p className="text-sm text-gray-500 mt-3">
            Click to begin your interactive learning journey through Cell
            Division
          </p>
        </div>
      </div>
    </div>
  );
}
