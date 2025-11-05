'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  VARKModule,
  CreateVARKModuleData,
  UpdateVARKModuleData,
  VARKModuleCategory,
  VARKAssessmentQuestion
} from '@/types/vark-module';
import {
  Plus,
  X,
  Eye,
  Headphones,
  PenTool,
  Zap,
  Video,
  Image,
  FileText,
  Link,
  Mic,
  Activity,
  Target,
  Clock,
  Settings
} from 'lucide-react';

const varkModuleSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  title: z
    .string()
    .min(1, 'Module title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  learning_objectives: z
    .array(z.string().min(1, 'Learning objective cannot be empty'))
    .min(1, 'At least one learning objective is required'),
  content_structure: z.object({
    sections: z
      .array(z.string().min(1, 'Section name cannot be empty'))
      .min(1, 'At least one section is required')
  }),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  estimated_duration_minutes: z
    .number()
    .min(1, 'Duration must be at least 1 minute')
    .max(480, 'Duration cannot exceed 8 hours'),
  prerequisite_module_id: z.string().nullable().optional(),
  prerequisites: z.array(z.string()),
  multimedia_content: z.object({
    videos: z.array(z.string().url('Must be a valid URL')),
    images: z.array(z.string().url('Must be a valid URL')),
    diagrams: z.array(z.string().url('Must be a valid URL')),
    podcasts: z.array(z.string().url('Must be a valid URL')),
    audio_lessons: z.array(z.string().url('Must be a valid URL')),
    discussion_guides: z.array(z.string().url('Must be a valid URL')),
    interactive_simulations: z.array(z.string().url('Must be a valid URL')),
    hands_on_activities: z.array(z.string().url('Must be a valid URL'))
  }),
  interactive_elements: z.object({
    drag_and_drop: z.boolean(),
    visual_builder: z.boolean(),
    simulation: z.boolean(),
    audio_playback: z.boolean(),
    discussion_forum: z.boolean(),
    voice_recording: z.boolean(),
    text_editor: z.boolean(),
    note_taking: z.boolean(),
    physical_activities: z.boolean(),
    experiments: z.boolean()
  }),
  assessment_questions: z.array(
    z.object({
      type: z.enum([
        'multiple_choice',
        'true_false',
        'matching',
        'short_answer',
        'audio_response',
        'visual_response',
        'interactive_response'
      ]),
      question: z.string().min(1, 'Question is required'),
      options: z.array(z.string()).optional(),
      correct_answer: z.any().optional(),
      max_duration: z.number().optional(),
      points: z.number().min(1, 'Points must be at least 1').optional(),
      interactive_config: z.any().optional()
    })
  ),
  is_published: z.boolean()
});

type VARKModuleFormData = z.infer<typeof varkModuleSchema>;

interface VARKModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateVARKModuleData | UpdateVARKModuleData
  ) => Promise<void>;
  moduleData?: VARKModule | null;
  categories: VARKModuleCategory[];
  availableModules?: VARKModule[];
  mode: 'create' | 'edit';
}

const difficultyLevels = [
  {
    value: 'beginner',
    label: 'Beginner',
    color: 'bg-green-100 text-green-800'
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    color: 'bg-yellow-100 text-yellow-800'
  },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800' }
];

const questionTypes = [
  { value: 'multiple_choice', label: 'Multiple Choice', icon: Target },
  { value: 'true_false', label: 'True/False', icon: Target },
  { value: 'matching', label: 'Matching', icon: Target },
  { value: 'short_answer', label: 'Short Answer', icon: PenTool },
  { value: 'audio_response', label: 'Audio Response', icon: Mic },
  { value: 'visual_response', label: 'Visual Response', icon: Eye },
  { value: 'interactive_response', label: 'Interactive', icon: Activity }
];

export default function VARKModuleFormModal({
  isOpen,
  onClose,
  onSubmit,
  moduleData,
  categories,
  mode
}: VARKModuleFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLearningObjective, setNewLearningObjective] = useState('');
  const [newSection, setNewSection] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [urlType, setUrlType] =
    useState<keyof VARKModuleFormData['multimedia_content']>('videos');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<VARKModuleFormData>({
    resolver: zodResolver(varkModuleSchema),
    mode: 'onChange',
    defaultValues: {
      learning_objectives: [''],
      content_structure: { sections: [''] },
      prerequisites: [],
      multimedia_content: {
        videos: [],
        images: [],
        diagrams: [],
        podcasts: [],
        audio_lessons: [],
        discussion_guides: [],
        interactive_simulations: [],
        hands_on_activities: []
      },
      interactive_elements: {
        drag_and_drop: false,
        visual_builder: false,
        simulation: false,
        audio_playback: false,
        discussion_forum: false,
        voice_recording: false,
        text_editor: false,
        note_taking: false,
        physical_activities: false,
        experiments: false
      },
      assessment_questions: [],
      is_published: false
    }
  });

  const watchedLearningObjectives = watch('learning_objectives');
  const watchedSections = watch('content_structure.sections');
  const watchedPrerequisites = watch('prerequisites');
  const watchedMultimediaContent = watch('multimedia_content');
  const watchedInteractiveElements = watch('interactive_elements');

  useEffect(() => {
    if (isOpen && moduleData && mode === 'edit') {
      setValue('category_id', moduleData.category_id);
      setValue('title', moduleData.title);
      setValue('description', moduleData.description);
      setValue('learning_objectives', moduleData.learning_objectives);
      setValue('content_structure', moduleData.content_structure);
      setValue('difficulty_level', moduleData.difficulty_level);
      setValue(
        'estimated_duration_minutes',
        moduleData.estimated_duration_minutes
      );
      setValue('prerequisite_module_id', (moduleData as any).prerequisite_module_id || null);
      setValue('prerequisites', moduleData.prerequisites);
      setValue('multimedia_content', moduleData.multimedia_content);
      setValue('interactive_elements', moduleData.interactive_elements);
      setValue('assessment_questions', moduleData.assessment_questions);
      setValue('is_published', moduleData.is_published);
    } else if (isOpen && mode === 'create') {
      reset();
    }
  }, [isOpen, moduleData, mode, setValue, reset]);

  const addLearningObjective = () => {
    if (newLearningObjective.trim()) {
      setValue('learning_objectives', [
        ...watchedLearningObjectives,
        newLearningObjective.trim()
      ]);
      setNewLearningObjective('');
    }
  };

  const removeLearningObjective = (index: number) => {
    const updated = watchedLearningObjectives.filter((_, i) => i !== index);
    setValue('learning_objectives', updated);
  };

  const addSection = () => {
    if (newSection.trim()) {
      setValue('content_structure.sections', [
        ...watchedSections,
        newSection.trim()
      ]);
      setNewSection('');
    }
  };

  const removeSection = (index: number) => {
    const updated = watchedSections.filter((_, i) => i !== index);
    setValue('content_structure.sections', updated);
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setValue('prerequisites', [
        ...watchedPrerequisites,
        newPrerequisite.trim()
      ]);
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (index: number) => {
    const updated = watchedPrerequisites.filter((_, i) => i !== index);
    setValue('prerequisites', updated);
  };

  const addUrl = () => {
    if (newUrl.trim() && isValidUrl(newUrl)) {
      const currentUrls = watchedMultimediaContent[urlType] || [];
      setValue(`multimedia_content.${urlType}`, [
        ...currentUrls,
        newUrl.trim()
      ]);
      setNewUrl('');
    }
  };

  const removeUrl = (
    type: keyof VARKModuleFormData['multimedia_content'],
    index: number
  ) => {
    const currentUrls = watchedMultimediaContent[type] || [];
    const updated = currentUrls.filter((_, i) => i !== index);
    setValue(`multimedia_content.${type}`, updated);
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const toggleInteractiveElement = (
    element: keyof VARKModuleFormData['interactive_elements']
  ) => {
    setValue(
      `interactive_elements.${element}`,
      !watchedInteractiveElements[element]
    );
  };

  const handleFormSubmit = async (data: VARKModuleFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast({
        title: mode === 'create' ? 'Module Created' : 'Module Updated',
        description:
          mode === 'create'
            ? 'Your new VARK module has been created successfully.'
            : 'Your VARK module has been updated successfully.',
        variant: 'default'
      });
      onClose();
      reset();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      reset();
    }
  };

  const getUrlTypeIcon = (
    type: keyof VARKModuleFormData['multimedia_content']
  ) => {
    switch (type) {
      case 'videos':
        return Video;
      case 'images':
        return Image;
      case 'diagrams':
        return Image;
      case 'podcasts':
        return Mic;
      case 'audio_lessons':
        return Mic;
      case 'discussion_guides':
        return FileText;
      case 'interactive_simulations':
        return Activity;
      case 'hands_on_activities':
        return Activity;
      default:
        return Link;
    }
  };

  const getUrlTypeLabel = (
    type: keyof VARKModuleFormData['multimedia_content']
  ) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Create New VARK Module' : 'Edit VARK Module'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Category *</Label>
                <Select
                  value={watch('category_id')}
                  onValueChange={value => setValue('category_id', value)}>
                  <SelectTrigger
                    className={errors.category_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.subject} -{' '}
                        {category.grade_level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && (
                  <p className="text-sm text-red-500">
                    {errors.category_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty_level">Difficulty Level *</Label>
                <Select
                  value={watch('difficulty_level')}
                  onValueChange={value =>
                    setValue('difficulty_level', value as any)
                  }>
                  <SelectTrigger
                    className={errors.difficulty_level ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center space-x-2">
                          <Badge className={level.color}>{level.label}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.difficulty_level && (
                  <p className="text-sm text-red-500">
                    {errors.difficulty_level.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Module Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter module title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter module description"
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_duration_minutes">
                Estimated Duration (minutes) *
              </Label>
              <Input
                id="estimated_duration_minutes"
                type="number"
                {...register('estimated_duration_minutes', {
                  valueAsNumber: true
                })}
                placeholder="45"
                min="1"
                max="480"
                className={
                  errors.estimated_duration_minutes ? 'border-red-500' : ''
                }
              />
              {errors.estimated_duration_minutes && (
                <p className="text-sm text-red-500">
                  {errors.estimated_duration_minutes.message}
                </p>
              )}
            </div>

            {/* Prerequisite Module Selector */}
            <div className="space-y-2">
              <Label htmlFor="prerequisite_module">
                Prerequisite Module (Optional)
              </Label>
              <p className="text-sm text-gray-500">
                Select a module that students must complete before accessing this one
              </p>
              <Select
                value={watch('prerequisite_module_id') || 'none'}
                onValueChange={value =>
                  setValue('prerequisite_module_id', value === 'none' ? null : value)
                }>
                <SelectTrigger>
                  <SelectValue placeholder="No prerequisite required" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center space-x-2">
                      <span>No prerequisite required</span>
                    </div>
                  </SelectItem>
                  {availableModules
                    .filter(m => m.id !== moduleData?.id) // Don't show current module
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

          {/* Learning Objectives */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Learning Objectives
            </h3>

            <div className="space-y-3">
              {watchedLearningObjectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-[#00af8f]" />
                  <Input
                    value={objective}
                    onChange={e => {
                      const updated = [...watchedLearningObjectives];
                      updated[index] = e.target.value;
                      setValue('learning_objectives', updated);
                    }}
                    placeholder={`Learning objective ${index + 1}`}
                    className="flex-1"
                  />
                  {watchedLearningObjectives.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLearningObjective(index)}
                      className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Input
                value={newLearningObjective}
                onChange={e => setNewLearningObjective(e.target.value)}
                placeholder="Add new learning objective"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addLearningObjective}
                disabled={!newLearningObjective.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content Structure */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Content Structure
            </h3>

            <div className="space-y-3">
              {watchedSections.map((section, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#00af8f]" />
                  <Input
                    value={section}
                    onChange={e => {
                      const updated = [...watchedSections];
                      updated[index] = e.target.value;
                      setValue('content_structure.sections', updated);
                    }}
                    placeholder={`Section ${index + 1}`}
                    className="flex-1"
                  />
                  {watchedSections.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(index)}
                      className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Input
                value={newSection}
                onChange={e => setNewSection(e.target.value)}
                placeholder="Add new section"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSection}
                disabled={!newSection.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Prerequisites</h3>

            <div className="space-y-3">
              {watchedPrerequisites.map((prerequisite, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-[#00af8f]" />
                  <Input
                    value={prerequisite}
                    onChange={e => {
                      const updated = [...watchedPrerequisites];
                      updated[index] = e.target.value;
                      setValue('prerequisites', updated);
                    }}
                    placeholder={`Prerequisite ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePrerequisite(index)}
                    className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Input
                value={newPrerequisite}
                onChange={e => setNewPrerequisite(e.target.value)}
                placeholder="Add new prerequisite"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addPrerequisite}
                disabled={!newPrerequisite.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Multimedia Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Multimedia Content
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select
                  value={urlType}
                  onValueChange={value => setUrlType(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(watchedMultimediaContent).map(type => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const Icon = getUrlTypeIcon(type as any);
                            return <Icon className="w-4 h-4" />;
                          })()}
                          <span>{getUrlTypeLabel(type as any)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Add URL</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    placeholder="https://example.com/content"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addUrl}
                    disabled={!newUrl.trim() || !isValidUrl(newUrl)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Display URLs for selected type */}
            <div className="space-y-2">
              <Label>{getUrlTypeLabel(urlType)} URLs</Label>
              <div className="space-y-2">
                {watchedMultimediaContent[urlType]?.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    {(() => {
                      const Icon = getUrlTypeIcon(urlType);
                      return <Icon className="w-4 h-4 text-gray-500" />;
                    })()}
                    <span className="flex-1 text-sm text-gray-700 truncate">
                      {url}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUrl(urlType, index)}
                      className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {(!watchedMultimediaContent[urlType] ||
                  watchedMultimediaContent[urlType].length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No {getUrlTypeLabel(urlType).toLowerCase()} added yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Elements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Interactive Elements
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(watchedInteractiveElements).map(
                ([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={() =>
                        toggleInteractiveElement(key as any)
                      }
                    />
                    <Label htmlFor={key} className="text-sm">
                      {key
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Assessment Questions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Assessment Questions
            </h3>

            <div className="space-y-4">
              {watch('assessment_questions')?.map((question, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updated = watch('assessment_questions').filter(
                          (_, i) => i !== index
                        );
                        setValue('assessment_questions', updated);
                      }}
                      className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select
                        value={question.type}
                        onValueChange={value => {
                          const updated = [...watch('assessment_questions')];
                          updated[index] = { ...question, type: value as any };
                          setValue('assessment_questions', updated);
                        }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                <type.icon className="w-4 h-4" />
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={question.points || 1}
                        onChange={e => {
                          const updated = [...watch('assessment_questions')];
                          updated[index] = {
                            ...question,
                            points: parseInt(e.target.value) || 1
                          };
                          setValue('assessment_questions', updated);
                        }}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Textarea
                      value={question.question}
                      onChange={e => {
                        const updated = [...watch('assessment_questions')];
                        updated[index] = {
                          ...question,
                          question: e.target.value
                        };
                        setValue('assessment_questions', updated);
                      }}
                      placeholder="Enter your question"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const newQuestion: VARKAssessmentQuestion = {
                  type: 'multiple_choice',
                  question: '',
                  points: 1
                };
                setValue('assessment_questions', [
                  ...(watch('assessment_questions') || []),
                  newQuestion
                ]);
              }}
              className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Assessment Question
            </Button>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_published">Publish Module</Label>
              <p className="text-sm text-gray-500">
                Published modules are visible to students
              </p>
            </div>
            <Switch
              id="is_published"
              checked={watch('is_published')}
              onCheckedChange={checked => setValue('is_published', checked)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white border-0">
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </span>
                </div>
              ) : (
                <span>
                  {mode === 'create' ? 'Create Module' : 'Update Module'}
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
