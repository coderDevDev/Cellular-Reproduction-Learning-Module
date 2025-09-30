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
import { toast } from '@/hooks/use-toast';
import { Class, CreateClassData, UpdateClassData } from '@/types/class';

const classSchema = z.object({
  name: z
    .string()
    .min(1, 'Class name is required')
    .max(100, 'Class name must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  subject: z.string().min(1, 'Subject is required'),
  grade_level: z.string().min(1, 'Grade level is required')
});

type ClassFormData = z.infer<typeof classSchema>;

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClassData | UpdateClassData) => Promise<void>;
  classData?: Class | null;
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

export default function ClassFormModal({
  isOpen,
  onClose,
  onSubmit,
  classData,
  mode
}: ClassFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid }
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    mode: 'onChange'
  });

  useEffect(() => {
    if (isOpen && classData && mode === 'edit') {
      setValue('name', classData.name);
      setValue('description', classData.description);
      setValue('subject', classData.subject);
      setValue('grade_level', classData.grade_level);
    } else if (isOpen && mode === 'create') {
      reset();
    }
  }, [isOpen, classData, mode, setValue, reset]);

  const handleFormSubmit = async (data: ClassFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast({
        title: mode === 'create' ? 'Class Created' : 'Class Updated',
        description:
          mode === 'create'
            ? 'Your new class has been created successfully.'
            : 'Your class has been updated successfully.',
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Create New Class' : 'Edit Class'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Class Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Class Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter class name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter class description"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select
              value={register('subject').value}
              onValueChange={value => setValue('subject', value)}>
              <SelectTrigger className={errors.subject ? 'border-red-500' : ''}>
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

          {/* Grade Level */}
          <div className="space-y-2">
            <Label htmlFor="grade_level">Grade Level *</Label>
            <Select
              value={register('grade_level').value}
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
                  {mode === 'create' ? 'Create Class' : 'Update Class'}
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}






