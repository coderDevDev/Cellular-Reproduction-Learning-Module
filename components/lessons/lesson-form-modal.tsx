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
import { Lesson, CreateLessonData, UpdateLessonData } from '@/types/lesson';
import {
  Upload,
  FileText,
  Video,
  Image,
  Link,
  X,
  Eye,
  Headphones,
  PenTool,
  Zap
} from 'lucide-react';

const lessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Lesson title is required')
    .max(200, 'Title must be less than 200 characters'),
  subject: z.string().min(1, 'Subject is required'),
  grade_level: z.string().min(1, 'Grade level is required'),
  vark_tag: z.enum(['visual', 'auditory', 'reading_writing', 'kinesthetic']),
  resource_type: z.string().min(1, 'Resource type is required'),
  content_url: z
    .string()
    .min(1, 'Content URL is required')
    .url('Must be a valid URL'),
  is_published: z.boolean()
});

type LessonFormData = z.infer<typeof lessonSchema>;

interface LessonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLessonData | UpdateLessonData) => Promise<void>;
  lessonData?: Lesson | null;
  mode: 'create' | 'edit';
}

const subjects = [
  'Mathematics',
  'English',
  'Science',
  'History',
  'Geography',
  'Literature',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Art',
  'Music',
  'Physical Education',
  'Social Studies',
  'Economics',
  'Psychology',
  'Philosophy',
  'Foreign Language'
];

const gradeLevels = [
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12'
];

const resourceTypes = [
  'Video',
  'Document',
  'Presentation',
  'Interactive',
  'Audio',
  'Image',
  'Web Link',
  'PDF',
  'Quiz',
  'Simulation'
];

const varkStyles = [
  {
    value: 'visual',
    label: 'Visual',
    icon: Eye,
    description: 'Images, diagrams, videos'
  },
  {
    value: 'auditory',
    label: 'Auditory',
    icon: Headphones,
    description: 'Audio, narration, discussions'
  },
  {
    value: 'reading_writing',
    label: 'Reading/Writing',
    icon: PenTool,
    description: 'Text, notes, writing'
  },
  {
    value: 'kinesthetic',
    label: 'Kinesthetic',
    icon: Zap,
    description: 'Hands-on, interactive, movement'
  }
];

export default function LessonFormModal({
  isOpen,
  onClose,
  onSubmit,
  lessonData,
  mode
}: LessonFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    mode: 'onChange',
    defaultValues: {
      is_published: false
    }
  });

  const watchedVarkTag = watch('vark_tag');
  const watchedResourceType = watch('resource_type');

  useEffect(() => {
    if (isOpen && lessonData && mode === 'edit') {
      setValue('title', lessonData.title);
      setValue('subject', lessonData.subject);
      setValue('grade_level', lessonData.grade_level);
      setValue('vark_tag', lessonData.vark_tag);
      setValue('resource_type', lessonData.resource_type);
      setValue('content_url', lessonData.content_url);
      setValue('is_published', lessonData.is_published);
    } else if (isOpen && mode === 'create') {
      reset();
      setFileUpload(null);
      setUploadProgress(0);
    }
  }, [isOpen, lessonData, mode, setValue, reset]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileUpload(file);
      // In a real app, you'd upload to Supabase Storage here
      // For now, we'll simulate the upload
      setUploadProgress(100);
      setValue('content_url', `https://example.com/uploads/${file.name}`);
    }
  };

  const removeFile = () => {
    setFileUpload(null);
    setUploadProgress(0);
    setValue('content_url', '');
  };

  const handleFormSubmit = async (data: LessonFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast({
        title: mode === 'create' ? 'Lesson Created' : 'Lesson Updated',
        description:
          mode === 'create'
            ? 'Your new lesson has been created successfully.'
            : 'Your lesson has been updated successfully.',
        variant: 'default'
      });
      onClose();
      reset();
      setFileUpload(null);
      setUploadProgress(0);
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
      setFileUpload(null);
      setUploadProgress(0);
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return Video;
      case 'document':
      case 'pdf':
        return FileText;
      case 'image':
        return Image;
      case 'web link':
        return Link;
      default:
        return FileText;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Create New Lesson' : 'Edit Lesson'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Lesson Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Lesson Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter lesson title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Subject and Grade Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select
                value={watch('subject')}
                onValueChange={value => setValue('subject', value)}>
                <SelectTrigger
                  className={errors.subject ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject && (
                <p className="text-sm text-red-500">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade_level">Grade Level *</Label>
              <Select
                value={watch('grade_level')}
                onValueChange={value => setValue('grade_level', value)}>
                <SelectTrigger
                  className={errors.grade_level ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.grade_level && (
                <p className="text-sm text-red-500">
                  {errors.grade_level.message}
                </p>
              )}
            </div>
          </div>

          {/* Learning Style Tag */}
          <div className="space-y-3">
            <Label>Learning Style Tag *</Label>
            <div className="grid grid-cols-2 gap-3">
              {varkStyles.map(style => {
                const Icon = style.icon;
                const isSelected = watchedVarkTag === style.value;
                return (
                  <div
                    key={style.value}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#00af8f] bg-[#00af8f]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setValue('vark_tag', style.value as any)}>
                    <div className="flex items-center space-x-2">
                      <Icon
                        className={`w-5 h-5 ${
                          isSelected ? 'text-[#00af8f]' : 'text-gray-500'
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            isSelected ? 'text-[#00af8f]' : 'text-gray-900'
                          }`}>
                          {style.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {style.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.vark_tag && (
              <p className="text-sm text-red-500">{errors.vark_tag.message}</p>
            )}
          </div>

          {/* Resource Type */}
          <div className="space-y-2">
            <Label htmlFor="resource_type">Resource Type *</Label>
            <Select
              value={watch('resource_type')}
              onValueChange={value => setValue('resource_type', value)}>
              <SelectTrigger
                className={errors.resource_type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                {resourceTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.resource_type && (
              <p className="text-sm text-red-500">
                {errors.resource_type.message}
              </p>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label>Content Upload</Label>
            {!fileUpload ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#00af8f] transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif,.mp3,.wav"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, DOC, PPT, Video, Audio, Images (Max 50MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const Icon = getResourceTypeIcon(
                        watchedResourceType || ''
                      );
                      return <Icon className="w-8 h-8 text-[#00af8f]" />;
                    })()}
                    <div>
                      <p className="font-medium text-gray-900">
                        {fileUpload.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(fileUpload.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#00af8f] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
                {uploadProgress === 100 && (
                  <Badge
                    variant="secondary"
                    className="mt-2 bg-green-100 text-green-800">
                    ✓ Upload Complete
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Content URL (Manual Input) */}
          <div className="space-y-2">
            <Label htmlFor="content_url">Content URL *</Label>
            <Input
              id="content_url"
              {...register('content_url')}
              placeholder="https://example.com/lesson-content"
              className={errors.content_url ? 'border-red-500' : ''}
            />
            {errors.content_url && (
              <p className="text-sm text-red-500">
                {errors.content_url.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter the URL where your lesson content is hosted, or upload a
              file above
            </p>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_published">Publish Lesson</Label>
              <p className="text-sm text-gray-500">
                Published lessons are visible to students
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
                  {mode === 'create' ? 'Create Lesson' : 'Update Lesson'}
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}






