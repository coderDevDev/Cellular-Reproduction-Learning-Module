'use client';

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
import {
  Plus,
  Trash2,
  Target,
  Clock,
  BookOpen,
  Eye,
  Users
} from 'lucide-react';
import { VARKModule, VARKModuleCategory } from '@/types/vark-module';
import { Class } from '@/types/class';

interface BasicInfoStepProps {
  formData: Partial<VARKModule>;
  updateFormData: (updates: Partial<VARKModule>) => void;
  categories: VARKModuleCategory[];
  teacherClasses?: Class[];
  availableModules?: VARKModule[];
}

export default function BasicInfoStep({
  formData,
  updateFormData,
  categories,
  teacherClasses,
  availableModules = []
}: BasicInfoStepProps) {
  const addLearningObjective = () => {
    const currentObjectives = formData.learning_objectives || [];
    updateFormData({
      learning_objectives: [...currentObjectives, '']
    });
  };

  const removeLearningObjective = (index: number) => {
    const currentObjectives = formData.learning_objectives || [];
    const newObjectives = currentObjectives.filter((_, i) => i !== index);
    updateFormData({ learning_objectives: newObjectives });
  };

  const updateLearningObjective = (index: number, value: string) => {
    const currentObjectives = formData.learning_objectives || [];
    const newObjectives = [...currentObjectives];
    newObjectives[index] = value;
    updateFormData({ learning_objectives: newObjectives });
  };

  const addPrerequisite = () => {
    const currentPrerequisites = formData.prerequisites || [];
    updateFormData({
      prerequisites: [...currentPrerequisites, '']
    });
  };

  const removePrerequisite = (index: number) => {
    const currentPrerequisites = formData.prerequisites || [];
    const newPrerequisites = currentPrerequisites.filter((_, i) => i !== index);
    updateFormData({ prerequisites: newPrerequisites });
  };

  const updatePrerequisite = (index: number, value: string) => {
    const currentPrerequisites = formData.prerequisites || [];
    const newPrerequisites = [...currentPrerequisites];
    newPrerequisites[index] = value;
    updateFormData({ prerequisites: newPrerequisites });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          <BookOpen className="w-8 h-8 mx-auto mb-3 text-blue-600" />
          Basic Module Information
        </h2>
        <p className="text-gray-600">
          Start by defining the core details of your learning module
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Module Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-700">
              Module Title *
            </Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title for your module"
              value={formData.title || ''}
              onChange={e => updateFormData({ title: e.target.value })}
              className="h-12 text-lg"
            />
          </div>

          {/* Target Class Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="targetClass"
              className="text-sm font-medium text-gray-700">
              Target Class (Optional)
            </Label>
            <Select
              value={formData.target_class_id || ''}
              onValueChange={value => {
                if (value === 'no-class') {
                  updateFormData({
                    target_class_id: '',
                    target_learning_styles: []
                  });
                } else {
                  updateFormData({ target_class_id: value });
                  // Auto-populate learning styles based on selected class
                  if (value && teacherClasses) {
                    const selectedClass = teacherClasses.find(
                      cls => cls.id === value
                    );
                    if (selectedClass && selectedClass.students) {
                      const learningStyles = Array.from(
                        new Set(
                          selectedClass.students
                            .map(student => student.learning_style)
                            .filter((style): style is string => Boolean(style))
                        )
                      );
                      updateFormData({
                        target_learning_styles: learningStyles
                      });
                    }
                  }
                }
              }}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select a class to target this module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-class">
                  <div className="flex items-center space-x-2">
                    <span>No specific class (General module)</span>
                  </div>
                </SelectItem>
                {teacherClasses?.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    <div className="flex items-center space-x-2">
                      <span>{cls.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {cls.subject} • {cls.grade_level} • {cls.student_count}{' '}
                        students
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Learning Style Targeting */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Target Learning Styles *
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {['visual', 'auditory', 'reading_writing', 'kinesthetic'].map(
                style => (
                  <div key={style} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={style}
                      checked={
                        formData.target_learning_styles?.includes(style) ||
                        false
                      }
                      onChange={e => {
                        const currentStyles =
                          formData.target_learning_styles || [];
                        if (e.target.checked) {
                          updateFormData({
                            target_learning_styles: [...currentStyles, style]
                          });
                        } else {
                          updateFormData({
                            target_learning_styles: currentStyles.filter(
                              s => s !== style
                            )
                          });
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <Label
                      htmlFor={style}
                      className="text-sm text-gray-700 capitalize">
                      {style.replace('_', ' ')}
                    </Label>
                  </div>
                )
              )}
            </div>

            {/* Target Learning Styles Validation Indicator */}
            {formData.target_learning_styles &&
              formData.target_learning_styles.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Target className="w-4 h-4" />
                  <span>
                    Selected: {formData.target_learning_styles.length} learning
                    style(s) -{' '}
                    {formData.target_learning_styles
                      .map(s => s.replace('_', ' '))
                      .join(', ')}
                  </span>
                </div>
              )}

            {(!formData.target_learning_styles ||
              formData.target_learning_styles.length === 0) && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <Target className="w-4 h-4" />
                <span>
                  Please select at least one target learning style to continue
                </span>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Select which learning styles this module is designed for
            </p>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <Label
              htmlFor="difficulty"
              className="text-sm font-medium text-gray-700">
              Difficulty Level *
            </Label>
            <Select
              value={formData.difficulty_level || 'beginner'}
              onValueChange={value =>
                updateFormData({ difficulty_level: value as any })
              }>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span>Beginner</span>
                  </div>
                </SelectItem>
                <SelectItem value="intermediate">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-yellow-600" />
                    <span>Intermediate</span>
                  </div>
                </SelectItem>
                <SelectItem value="advanced">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-red-600" />
                    <span>Advanced</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label
              htmlFor="duration"
              className="text-sm font-medium text-gray-700">
              Estimated Duration (minutes) *
            </Label>
            <div className="relative">
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="30"
                value={formData.estimated_duration_minutes || ''}
                onChange={e =>
                  updateFormData({
                    estimated_duration_minutes: parseInt(e.target.value) || 0
                  })
                }
                className="h-12 pl-10"
              />
              <Clock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Prerequisite Module Selector */}
          <div className="space-y-2">
            <Label
              htmlFor="prerequisite_module"
              className="text-sm font-medium text-gray-700">
              Prerequisite Module (Optional)
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              Select a module that students must complete before accessing this one
            </p>
            <Select
              value={(formData as any).prerequisite_module_id || 'none'}
              onValueChange={value =>
                updateFormData({ prerequisite_module_id: value === 'none' ? null : value } as any)
              }>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="No prerequisite required" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center space-x-2">
                    <span>No prerequisite required</span>
                  </div>
                </SelectItem>
                {availableModules
                  ?.filter(m => m.id !== formData.id)
                  .map(module => (
                    <SelectItem key={module.id} value={module.id}>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{module.title}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700">
              Module Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn in this module"
              value={formData.description || ''}
              onChange={e => updateFormData({ description: e.target.value })}
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Learning Objectives */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Learning Objectives *
            </Label>
            <div className="space-y-2">
              {(formData.learning_objectives || ['']).map(
                (objective, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Learning objective ${index + 1}`}
                      value={objective}
                      onChange={e =>
                        updateLearningObjective(index, e.target.value)
                      }
                      className="flex-1"
                    />
                    {(formData.learning_objectives || []).length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLearningObjective(index)}
                        className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )
              )}
              <Button
                type="button"
                variant="outline"
                onClick={addLearningObjective}
                className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400">
                <Plus className="w-4 h-4 mr-2" />
                Add Learning Objective
              </Button>
            </div>
          </div>

          {/* Prerequisites */}
          <Card className="border-0 shadow-sm bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Target className="w-5 h-5 text-orange-600" />
                Prerequisites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  What knowledge or skills should students have before starting
                  this module?
                </p>
                <div className="space-y-2">
                  {(formData.prerequisites || ['']).map(
                    (prerequisite, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder={`Prerequisite ${index + 1}`}
                          value={prerequisite}
                          onChange={e =>
                            updatePrerequisite(index, e.target.value)
                          }
                          className="flex-1"
                        />
                        {(formData.prerequisites || []).length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePrerequisite(index)}
                            className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPrerequisite}
                    className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Prerequisite
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Access Preview */}
          {formData.target_class_id &&
            formData.target_class_id !== 'no-class' &&
            teacherClasses && (
              <Card className="border-0 shadow-sm bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Student Access Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-blue-700">
                      Students who will be able to access this module:
                    </p>
                    {(() => {
                      const selectedClass = teacherClasses.find(
                        cls => cls.id === formData.target_class_id
                      );
                      if (!selectedClass || !selectedClass.students) {
                        return (
                          <p className="text-sm text-gray-500">
                            No students found in the selected class.
                          </p>
                        );
                      }

                      const accessibleStudents = selectedClass.students.filter(
                        student =>
                          !formData.target_learning_styles?.length ||
                          formData.target_learning_styles.includes(
                            student.learning_style || ''
                          )
                      );

                      if (accessibleStudents.length === 0) {
                        return (
                          <p className="text-sm text-orange-600">
                            No students match the selected learning styles.
                          </p>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-blue-800">
                              {accessibleStudents.length} of{' '}
                              {selectedClass.students.length} students
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {formData.target_learning_styles?.join(', ') ||
                                'All styles'}
                            </Badge>
                          </div>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {accessibleStudents.map(student => (
                              <div
                                key={student.id}
                                className="flex items-center justify-between p-2 bg-white rounded border text-sm">
                                <span className="font-medium text-gray-900">
                                  {student.full_name}
                                </span>
                                {student.learning_style && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs capitalize">
                                    {student.learning_style.replace('_', ' ')}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Quick Preview Section */}
        </div>
      </div>
    </div>
  );
}
