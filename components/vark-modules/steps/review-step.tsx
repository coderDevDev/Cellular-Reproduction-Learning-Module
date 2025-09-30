'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Clock,
  Target,
  BookOpen,
  Activity,
  Video,
  Gamepad2,
  FileText,
  Eye,
  Headphones,
  PenTool,
  Zap,
  AlertCircle
} from 'lucide-react';
import { VARKModule } from '@/types/vark-module';

interface ReviewStepProps {
  formData: Partial<VARKModule>;
  onSave: () => void;
}

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

export default function ReviewStep({ formData, onSave }: ReviewStepProps) {
  const sections = formData.content_structure?.sections || [];
  const questions = formData.assessment_questions || [];
  const selectedInteractiveElements = Object.entries(
    formData.interactive_elements || {}
  )
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => key);

  const getLearningStyleCoverage = () => {
    const allTags = sections.flatMap(
      section => section.learning_style_tags || []
    );
    const coverage = {
      visual: allTags.filter(tag => tag === 'visual').length,
      auditory: allTags.filter(tag => tag === 'auditory').length,
      reading_writing: allTags.filter(tag => tag === 'reading_writing').length,
      kinesthetic: allTags.filter(tag => tag === 'kinesthetic').length
    };
    return coverage;
  };

  const getContentTypeBreakdown = () => {
    const breakdown = sections.reduce((acc, section) => {
      acc[section.content_type] = (acc[section.content_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return breakdown;
  };

  const hasRequiredFields = () => {
    return !!(
      formData.title &&
      formData.description &&
      formData.category_id &&
      formData.learning_objectives?.some(obj => obj.trim()) &&
      sections.length > 0
    );
  };

  const getValidationIssues = () => {
    const issues = [];

    if (!formData.title) issues.push('Module title is required');
    if (!formData.description) issues.push('Module description is required');
    if (!formData.category_id) issues.push('Category selection is required');
    if (!formData.learning_objectives?.some(obj => obj.trim())) {
      issues.push('At least one learning objective is required');
    }
    if (sections.length === 0)
      issues.push('At least one content section is required');

    // Check sections have required content
    sections.forEach((section, index) => {
      if (!section.title) issues.push(`Section ${index + 1} title is required`);
      if (
        !section.content_data?.text &&
        !section.content_data?.table_data &&
        !section.content_data?.quiz_data &&
        !section.content_data?.activity_data
      ) {
        issues.push(`Section ${index + 1} content is required`);
      }
    });

    return issues;
  };

  const validationIssues = getValidationIssues();
  const isValid = hasRequiredFields() && validationIssues.length === 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-600" />
          Review & Save Module
        </h2>
        <p className="text-gray-600">
          Review your module configuration before saving
        </p>
      </div>

      {/* Validation Status */}
      <Card
        className={`border-0 shadow-sm ${
          isValid ? 'bg-green-50' : 'bg-red-50'
        }`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            {isValid ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600" />
            )}
            <div>
              <h3
                className={`text-lg font-semibold ${
                  isValid ? 'text-green-900' : 'text-red-900'
                }`}>
                {isValid ? 'Module Ready to Save!' : 'Validation Issues Found'}
              </h3>
              <p
                className={`text-sm ${
                  isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                {isValid
                  ? 'All required fields are completed. Your module is ready to save.'
                  : 'Please fix the following issues before saving:'}
              </p>
            </div>
          </div>

          {!isValid && (
            <ul className="space-y-1 text-sm text-red-700">
              {validationIssues.map((issue, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Module Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Title</Label>
              <p className="text-gray-900 font-medium">
                {formData.title || 'Not set'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <p className="text-gray-900">
                {formData.description || 'Not set'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Difficulty
                </Label>
                <Badge variant="outline" className="capitalize">
                  {formData.difficulty_level || 'Not set'}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Duration
                </Label>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{formData.estimated_duration_minutes || 0} min</span>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Learning Objectives
              </Label>
              <ul className="mt-2 space-y-1">
                {(formData.learning_objectives || []).map(
                  (objective, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">
                        {objective || 'Not set'}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Content Structure */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span>Content Structure</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Total Sections
              </Label>
              <p className="text-2xl font-bold text-purple-600">
                {sections.length}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Content Types
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(getContentTypeBreakdown()).map(
                  ([type, count]) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="capitalize">
                      {type}: {count}
                    </Badge>
                  )
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Learning Style Coverage
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(getLearningStyleCoverage()).map(
                  ([style, count]) => {
                    const Icon =
                      learningStyleIcons[
                        style as keyof typeof learningStyleIcons
                      ];
                    const color =
                      learningStyleColors[
                        style as keyof typeof learningStyleColors
                      ];
                    return (
                      <div key={style} className="flex items-center space-x-2">
                        <div
                          className={`w-6 h-6 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm capitalize">
                          {style.replace('_', ' ')}: {count}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Elements & Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Elements */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gamepad2 className="w-5 h-5 text-orange-600" />
              <span>Interactive Elements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedInteractiveElements.length > 0 ? (
              <div className="space-y-2">
                {selectedInteractiveElements.map(element => (
                  <Badge key={element} variant="outline" className="capitalize">
                    {element.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No interactive elements selected
              </p>
            )}
          </CardContent>
        </Card>

        {/* Assessment */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span>Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Total Questions:{' '}
                <span className="font-semibold">{questions.length}</span>
              </p>
              {questions.length > 0 && (
                <div className="space-y-1">
                  {questions.map((question, index) => (
                    <div key={question.id} className="text-sm text-gray-700">
                      {index + 1}.{' '}
                      {question.question || 'Question text not set'}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {question.points || 0} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multimedia Content Summary */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-blue-600" />
            <span>Multimedia Content</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(formData.multimedia_content || {}).map(
              ([key, items]) => {
                const itemCount = Array.isArray(items)
                  ? items.filter(item => item.trim()).length
                  : 0;
                if (itemCount === 0) return null;

                return (
                  <div
                    key={key}
                    className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700">
                      {itemCount}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="text-center">
        {isValid && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 text-sm">
              ✅ <strong>Ready to Save!</strong> Your module will be saved to
              the database and you'll be able to view, edit, update, and delete
              it from the teacher's VARK modules dashboard.
            </p>
          </div>
        )}

        <Button
          onClick={onSave}
          disabled={!isValid}
          size="lg"
          className={`px-8 py-4 text-lg font-semibold ${
            isValid
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}>
          <CheckCircle className="w-6 h-6 mr-2" />
          {isValid ? 'Save VARK Module' : 'Fix Issues to Save'}
        </Button>

        {!isValid && (
          <p className="text-sm text-red-600 mt-3">
            Please fix all validation issues before saving your module.
          </p>
        )}
      </div>
    </div>
  );
}
