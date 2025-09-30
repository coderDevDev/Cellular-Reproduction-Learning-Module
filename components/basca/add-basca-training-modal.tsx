'use client';

import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  GraduationCap,
  BookOpen,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { BascaTraining } from '@/types/basca';

interface AddBascaTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBascaTrainingModal({
  isOpen,
  onClose,
  onSuccess
}: AddBascaTrainingModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState<string[]>(['']);
  const [prerequisites, setPrerequisites] = useState<string[]>(['']);
  const [materials, setMaterials] = useState<string[]>(['']);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trainingType: 'skills_development',
    category: 'leadership',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    barangay: '',
    maxParticipants: '30',
    minParticipants: '5',
    budget: '',
    isRecurring: false,
    recurrencePattern: 'weekly',
    requirePrerequisites: false,
    requireAssessment: false,
    provideCertificate: true,
    isPublic: true,
    targetAudience: '',
    learningObjectives: '',
    notes: ''
  });

  const handleInputChange = (
    field: string,
    value: string | boolean | number | string[]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addModule = () => {
    setModules(prev => [...prev, '']);
  };

  const removeModule = (index: number) => {
    setModules(prev => prev.filter((_, i) => i !== index));
  };

  const updateModule = (index: number, value: string) => {
    setModules(prev => prev.map((item, i) => (i === index ? value : item)));
  };

  const addPrerequisite = () => {
    setPrerequisites(prev => [...prev, '']);
  };

  const removePrerequisite = (index: number) => {
    setPrerequisites(prev => prev.filter((_, i) => i !== index));
  };

  const updatePrerequisite = (index: number, value: string) => {
    setPrerequisites(prev =>
      prev.map((item, i) => (i === index ? value : item))
    );
  };

  const addMaterial = () => {
    setMaterials(prev => [...prev, '']);
  };

  const removeMaterial = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, value: string) => {
    setMaterials(prev => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.startDate || !formData.startTime) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Filter out empty modules, prerequisites, and materials
      const filteredModules = modules.filter(item => item.trim() !== '');
      const filteredPrerequisites = prerequisites.filter(
        item => item.trim() !== ''
      );
      const filteredMaterials = materials.filter(item => item.trim() !== '');

      const trainingData = {
        ...formData,
        modules: filteredModules,
        prerequisites: filteredPrerequisites,
        materials: filteredMaterials,
        participantsCount: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // TODO: Replace with actual API call
      console.log('Creating training:', trainingData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Success',
        description: 'Training session created successfully.',
        variant: 'default'
      });

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating training:', error);
      toast({
        title: 'Error',
        description: 'Failed to create training session. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      trainingType: 'skills_development',
      category: 'leadership',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: '',
      barangay: '',
      maxParticipants: '30',
      minParticipants: '5',
      budget: '',
      isRecurring: false,
      recurrencePattern: 'weekly',
      requirePrerequisites: false,
      requireAssessment: false,
      provideCertificate: true,
      isPublic: true,
      targetAudience: '',
      learningObjectives: '',
      notes: ''
    });
    setModules(['']);
    setPrerequisites(['']);
    setMaterials(['']);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Create New BASCA Training Session
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Training Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder="Enter training title"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Enter training description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="trainingType">Training Type</Label>
              <Select
                value={formData.trainingType}
                onValueChange={value =>
                  handleInputChange('trainingType', value)
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skills_development">
                    Skills Development
                  </SelectItem>
                  <SelectItem value="leadership">
                    Leadership Training
                  </SelectItem>
                  <SelectItem value="technical">Technical Training</SelectItem>
                  <SelectItem value="soft_skills">Soft Skills</SelectItem>
                  <SelectItem value="compliance">
                    Compliance Training
                  </SelectItem>
                  <SelectItem value="certification">
                    Certification Course
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={value => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="technical">Technical Skills</SelectItem>
                  <SelectItem value="safety">Safety & Security</SelectItem>
                  <SelectItem value="community">
                    Community Development
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={e =>
                  handleInputChange('targetAudience', e.target.value)
                }
                placeholder="e.g., BASCA members, Community leaders, etc."
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Schedule & Duration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={e => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={e => handleInputChange('endDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={e => handleInputChange('startTime', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={e => handleInputChange('endTime', e.target.value)}
                />
              </div>
            </div>

            {/* Recurring Training */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isRecurring">Recurring Training</Label>
                  <p className="text-sm text-gray-600">
                    Training repeats on a schedule
                  </p>
                </div>
                <Switch
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onCheckedChange={checked =>
                    handleInputChange('isRecurring', checked)
                  }
                />
              </div>

              {formData.isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recurrencePattern">
                      Recurrence Pattern
                    </Label>
                    <Select
                      value={formData.recurrencePattern}
                      onValueChange={value =>
                        handleInputChange('recurrencePattern', value)
                      }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location & Participants */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location & Participants</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  placeholder="Enter training location"
                />
              </div>

              <div>
                <Label htmlFor="barangay">Barangay</Label>
                <Input
                  id="barangay"
                  value={formData.barangay}
                  onChange={e => handleInputChange('barangay', e.target.value)}
                  placeholder="Enter barangay"
                />
              </div>

              <div>
                <Label htmlFor="minParticipants">Minimum Participants</Label>
                <Input
                  id="minParticipants"
                  type="number"
                  value={formData.minParticipants}
                  onChange={e =>
                    handleInputChange('minParticipants', e.target.value)
                  }
                  min="1"
                  max="1000"
                />
              </div>

              <div>
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={e =>
                    handleInputChange('maxParticipants', e.target.value)
                  }
                  min="1"
                  max="1000"
                />
              </div>

              <div>
                <Label htmlFor="budget">Budget (PHP)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={e => handleInputChange('budget', e.target.value)}
                  placeholder="Enter budget amount"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <Label htmlFor="learningObjectives">Learning Objectives</Label>
            <Textarea
              id="learningObjectives"
              value={formData.learningObjectives}
              onChange={e =>
                handleInputChange('learningObjectives', e.target.value)
              }
              placeholder="Describe what participants will learn from this training"
              rows={3}
            />
          </div>

          {/* Training Modules */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Training Modules</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addModule}
                className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Module
              </Button>
            </div>

            <div className="space-y-3">
              {modules.map((module, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={module}
                    onChange={e => updateModule(index, e.target.value)}
                    placeholder={`Module ${index + 1}`}
                  />
                  {modules.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeModule(index)}
                      className="px-2">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Prerequisites</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPrerequisite}
                className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Prerequisite
              </Button>
            </div>

            <div className="space-y-3">
              {prerequisites.map((prerequisite, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={prerequisite}
                    onChange={e => updatePrerequisite(index, e.target.value)}
                    placeholder={`Prerequisite ${index + 1}`}
                  />
                  {prerequisites.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePrerequisite(index)}
                      className="px-2">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Training Materials */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Training Materials</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMaterial}
                className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Material
              </Button>
            </div>

            <div className="space-y-3">
              {materials.map((material, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={material}
                    onChange={e => updateMaterial(index, e.target.value)}
                    placeholder={`Material ${index + 1}`}
                  />
                  {materials.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMaterial(index)}
                      className="px-2">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Training Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Training Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requirePrerequisites">
                    Require Prerequisites
                  </Label>
                  <p className="text-sm text-gray-600">
                    Participants must meet prerequisites
                  </p>
                </div>
                <Switch
                  id="requirePrerequisites"
                  checked={formData.requirePrerequisites}
                  onCheckedChange={checked =>
                    handleInputChange('requirePrerequisites', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireAssessment">Require Assessment</Label>
                  <p className="text-sm text-gray-600">
                    Participants must complete assessment
                  </p>
                </div>
                <Switch
                  id="requireAssessment"
                  checked={formData.requireAssessment}
                  onCheckedChange={checked =>
                    handleInputChange('requireAssessment', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="provideCertificate">
                    Provide Certificate
                  </Label>
                  <p className="text-sm text-gray-600">
                    Issue completion certificate
                  </p>
                </div>
                <Switch
                  id="provideCertificate"
                  checked={formData.provideCertificate}
                  onCheckedChange={checked =>
                    handleInputChange('provideCertificate', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPublic">Public Training</Label>
                  <p className="text-sm text-gray-600">
                    Visible to non-members
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={checked =>
                    handleInputChange('isPublic', checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes or instructions"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#00B5AD] hover:bg-[#009C94] text-white">
              {isLoading ? 'Creating...' : 'Create Training Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
