'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Trash2,
  FileText,
  CheckCircle,
  Clock,
  Target,
  Brain,
  Eye,
  Headphones,
  PenTool,
  Zap
} from 'lucide-react';
import { VARKModule, VARKAssessmentQuestion } from '@/types/vark-module';

interface AssessmentStepProps {
  formData: Partial<VARKModule>;
  updateFormData: (updates: Partial<VARKModule>) => void;
}

const questionTypes = [
  {
    value: 'single_choice',
    label: 'Single Choice',
    icon: CheckCircle,
    description: 'Choose one correct answer from options'
  },
  {
    value: 'multiple_choice',
    label: 'Multiple Choice',
    icon: CheckCircle,
    description: 'Choose multiple correct answers from options'
  },
  {
    value: 'true_false',
    label: 'True/False',
    icon: CheckCircle,
    description: 'Simple true or false questions'
  },
  {
    value: 'matching',
    label: 'Matching',
    icon: CheckCircle,
    description: 'Match items from two columns'
  },
  {
    value: 'short_answer',
    label: 'Short Answer',
    icon: PenTool,
    description: 'Brief text responses'
  },
  {
    value: 'audio_response',
    label: 'Audio Response',
    icon: Headphones,
    description: 'Voice recording answers'
  },
  {
    value: 'visual_response',
    label: 'Visual Response',
    icon: Eye,
    description: 'Drawing or image responses'
  },
  {
    value: 'interactive_response',
    label: 'Interactive',
    icon: Zap,
    description: 'Complex interactive questions'
  }
];

const learningStyleIcons = {
  everyone: Target,
  visual: Eye,
  auditory: Headphones,
  reading_writing: PenTool,
  kinesthetic: Zap
};

const learningStyleColors = {
  everyone: 'from-teal-500 to-teal-600',
  visual: 'from-blue-500 to-blue-600',
  auditory: 'from-green-500 to-green-600',
  reading_writing: 'from-purple-500 to-purple-600',
  kinesthetic: 'from-orange-500 to-orange-600'
};

export default function AssessmentStep({
  formData,
  updateFormData
}: AssessmentStepProps) {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<
    number | null
  >(null);
  const questions = formData.assessment_questions || [];

  // Debug logging
  console.log('AssessmentStep - formData:', formData);
  console.log('AssessmentStep - questions:', questions);

  // Set initial selected question if questions exist
  React.useEffect(() => {
    if (questions.length > 0 && selectedQuestionIndex === null) {
      setSelectedQuestionIndex(0);
    }
  }, [questions, selectedQuestionIndex]);

  const addQuestion = () => {
    const newQuestion: VARKAssessmentQuestion = {
      id: `question-${Date.now()}`,
      type: 'single_choice',
      question: '',
      options: [''],
      correct_answer: '',
      points: 10
    };

    const updatedQuestions = [...questions, newQuestion];
    updateFormData({ assessment_questions: updatedQuestions });
    setSelectedQuestionIndex(updatedQuestions.length - 1);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    updateFormData({ assessment_questions: updatedQuestions });
    if (selectedQuestionIndex === index) {
      setSelectedQuestionIndex(null);
    } else if (
      selectedQuestionIndex !== null &&
      selectedQuestionIndex > index
    ) {
      setSelectedQuestionIndex(selectedQuestionIndex - 1);
    }
  };

  const updateQuestion = (
    index: number,
    updates: Partial<VARKAssessmentQuestion>
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    updateFormData({ assessment_questions: updatedQuestions });
  };

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex];
    const newOptions = [...(question.options || []), ''];
    updateQuestion(questionIndex, { options: newOptions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    const newOptions = question.options?.filter(
      (_, i) => i !== optionIndex
    ) || [''];
    updateQuestion(questionIndex, { options: newOptions });
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const question = questions[questionIndex];
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    updateQuestion(questionIndex, { options: newOptions });
  };

  const renderQuestionForm = (
    question: VARKAssessmentQuestion,
    index: number
  ) => {
    const { type } = question;

    return (
      <div className="space-y-6">
        {/* Question Type */}
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Question Type
          </Label>
          <Select
            value={type}
            onValueChange={value =>
              updateQuestion(index, { type: value as any })
            }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {questionTypes.map(qt => {
                const Icon = qt.icon;
                return (
                  <SelectItem key={qt.value} value={qt.value}>
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{qt.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Question Text */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Question</Label>
          <Textarea
            placeholder="Enter your question..."
            value={question.question || ''}
            onChange={e => updateQuestion(index, { question: e.target.value })}
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Options for Multiple Choice */}
        {(type === 'single_choice' ||
          type === 'multiple_choice' ||
          type === 'matching') && (
          <div>
            <Label className="text-sm font-medium text-gray-700">Options</Label>
            <div className="space-y-2">
              {(question.options || ['']).map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={e =>
                      updateOption(index, optionIndex, e.target.value)
                    }
                    className="flex-1"
                  />
                  {(question.options || []).length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index, optionIndex)}
                      className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addOption(index)}
                className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400">
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {/* Correct Answer */}
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Correct Answer
          </Label>
          <Input
            placeholder="Enter the correct answer..."
            value={question.correct_answer || ''}
            onChange={e =>
              updateQuestion(index, { correct_answer: e.target.value })
            }
          />
        </div>

        {/* Points */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Points</Label>
          <Input
            type="number"
            min="1"
            placeholder="10"
            value={question.points || ''}
            onChange={e =>
              updateQuestion(index, { points: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        {/* Max Duration for Audio/Visual */}
        {(type === 'audio_response' || type === 'visual_response') && (
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Max Duration (seconds)
            </Label>
            <Input
              type="number"
              min="10"
              placeholder="60"
              value={question.max_duration || ''}
              onChange={e =>
                updateQuestion(index, {
                  max_duration: parseInt(e.target.value) || 0
                })
              }
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          <FileText className="w-8 h-8 mx-auto mb-3 text-green-600" />
          Assessment Questions
        </h2>
        <p className="text-gray-600">
          Create assessment questions to evaluate student understanding
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Question List */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Assessment Questions</CardTitle>
                <Button
                  onClick={addQuestion}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedQuestionIndex === index
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedQuestionIndex(index)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {question.question || `Question ${index + 1}`}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          removeQuestion(index);
                        }}
                        className="text-red-600 hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {question.type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {question.points || 0} pts
                      </span>
                    </div>
                  </div>
                ))}
                {questions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No assessment questions yet</p>
                    <p className="text-sm">
                      Click "Add Question" to get started
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Question Editor */}
        <div className="lg:col-span-2">
          {selectedQuestionIndex !== null &&
          questions[selectedQuestionIndex] ? (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  Edit Question:{' '}
                  {questions[selectedQuestionIndex].question ||
                    `Question ${selectedQuestionIndex + 1}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderQuestionForm(
                  questions[selectedQuestionIndex],
                  selectedQuestionIndex
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Question Selected
                </h3>
                <p className="text-gray-500">
                  Select a question from the list to edit its properties and
                  content.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Assessment Tips */}
      <Card className="border-0 shadow-sm bg-green-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            📝 Assessment Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-green-800">
            <div>
              <h4 className="font-medium mb-2">Question Design:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use clear, unambiguous language</li>
                <li>Include a mix of difficulty levels</li>
                <li>Provide immediate feedback</li>
                <li>Align with learning objectives</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Learning Style Integration:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Visual: Include diagrams and images</li>
                <li>Auditory: Add audio questions</li>
                <li>Reading/Writing: Use text-based questions</li>
                <li>Kinesthetic: Include interactive elements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
