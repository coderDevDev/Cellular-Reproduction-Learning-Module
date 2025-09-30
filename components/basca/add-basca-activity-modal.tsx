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
  Target,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { BascaActivitiesAPI } from '@/lib/api/basca-activities';
import type { BascaActivity, CreateBascaActivityData } from '@/types/basca';

interface AddBascaActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBascaActivityModal({
  isOpen,
  onClose,
  onSuccess
}: AddBascaActivityModalProps) {
  const { toast } = useToast();
  const { authState } = useAuth();
  const user = authState.user;
  const [isLoading, setIsLoading] = useState(false);
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activityType: 'community_service' as const,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    barangay: '',
    maxParticipants: '50',
    minParticipants: '5',
    budget: '',
    isRecurring: false,
    recurrencePattern: 'weekly' as const,
    recurrenceDays: [] as string[],
    requireRegistration: false,
    requireApproval: false,
    isPublic: true,
    targetAudience: '',
    expectedOutcome: '',
    notes: ''
  });

  const handleInputChange = (
    field: string,
    value: string | boolean | number | string[]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addObjective = () => {
    setObjectives(prev => [...prev, '']);
  };

  const removeObjective = (index: number) => {
    setObjectives(prev => prev.filter((_, i) => i !== index));
  };

  const updateObjective = (index: number, value: string) => {
    setObjectives(prev => prev.map((item, i) => (i === index ? value : item)));
  };

  const addRequirement = () => {
    setRequirements(prev => [...prev, '']);
  };

  const removeRequirement = (index: number) => {
    setRequirements(prev => prev.filter((_, i) => i !== index));
  };

  const updateRequirement = (index: number, value: string) => {
    setRequirements(prev =>
      prev.map((item, i) => (i === index ? value : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'Please log in to create activities.',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.title || !formData.startDate || !formData.startTime) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    if (!user.barangay || !user.barangayCode) {
      toast({
        title: 'Missing Information',
        description: 'Please ensure your barangay information is complete.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Filter out empty objectives and requirements
      const filteredObjectives = objectives.filter(item => item.trim() !== '');
      const filteredRequirements = requirements.filter(
        item => item.trim() !== ''
      );

      const activityData: CreateBascaActivityData = {
        title: formData.title,
        description: formData.description || undefined,
        activityDate: formData.startDate,
        endDate: formData.endDate || undefined,
        startTime: formData.startTime,
        endTime: formData.endTime || undefined,
        location: formData.location || undefined,
        barangay: user.barangay,
        barangayCode: user.barangayCode,
        activityType: formData.activityType,
        targetAudience: formData.targetAudience || undefined,
        expectedParticipants: parseInt(formData.maxParticipants),
        minParticipants: parseInt(formData.minParticipants),
        maxParticipants: parseInt(formData.maxParticipants),
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.isRecurring
          ? formData.recurrencePattern
          : undefined,
        recurrenceDays: formData.isRecurring
          ? formData.recurrenceDays
          : undefined,
        requireRegistration: formData.requireRegistration,
        requireApproval: formData.requireApproval,
        isPublic: formData.isPublic,
        expectedOutcome: formData.expectedOutcome || undefined,
        objectives:
          filteredObjectives.length > 0 ? filteredObjectives : undefined,
        requirements:
          filteredRequirements.length > 0 ? filteredRequirements : undefined,
        notes: formData.notes || undefined
      };

      // Create activity using the API
      await BascaActivitiesAPI.createActivity(activityData, user.id);

      toast({
        title: 'Success',
        description: 'Activity created successfully.',
        variant: 'default'
      });

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating activity:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create activity. Please try again.',
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
      activityType: 'community_service',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: '',
      barangay: '',
      maxParticipants: '50',
      minParticipants: '5',
      budget: '',
      isRecurring: false,
      recurrencePattern: 'weekly',
      recurrenceDays: [],
      requireRegistration: false,
      requireApproval: false,
      isPublic: true,
      targetAudience: '',
      expectedOutcome: '',
      notes: ''
    });
    setObjectives(['']);
    setRequirements(['']);
    onClose();
  };

  // Don't render if user is not authenticated or doesn't have barangay info
  if (!user || !user.barangay || !user.barangayCode) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Create New BASCA Activity
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Activity Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder="Enter activity title"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Enter activity description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="activityType">Activity Type</Label>
              <Select
                value={formData.activityType}
                onValueChange={value =>
                  handleInputChange('activityType', value as any)
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="community_service">
                    Community Service
                  </SelectItem>
                  <SelectItem value="training">Training & Education</SelectItem>
                  <SelectItem value="outreach">Outreach Program</SelectItem>
                  <SelectItem value="fundraising">Fundraising</SelectItem>
                  <SelectItem value="celebration">Celebration/Event</SelectItem>
                  <SelectItem value="advocacy">Advocacy Campaign</SelectItem>
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
                placeholder="e.g., Senior citizens, Youth, etc."
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

            {/* Recurring Activity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isRecurring">Recurring Activity</Label>
                  <p className="text-sm text-gray-600">
                    Activity repeats on a schedule
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
                        handleInputChange('recurrencePattern', value as any)
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
                  placeholder="Enter activity location"
                />
              </div>

              <div>
                <Label htmlFor="barangay">Barangay</Label>
                <Input
                  id="barangay"
                  value={user.barangay}
                  disabled
                  className="bg-gray-100"
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

          {/* Objectives */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Activity Objectives</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObjective}
                className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Objective
              </Button>
            </div>

            <div className="space-y-3">
              {objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={objective}
                    onChange={e => updateObjective(index, e.target.value)}
                    placeholder={`Objective ${index + 1}`}
                  />
                  {objectives.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeObjective(index)}
                      className="px-2">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Requirements</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRequirement}
                className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Requirement
              </Button>
            </div>

            <div className="space-y-3">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={requirement}
                    onChange={e => updateRequirement(index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                  />
                  {requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                      className="px-2">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expected Outcome */}
          <div>
            <Label htmlFor="expectedOutcome">Expected Outcome</Label>
            <Textarea
              id="expectedOutcome"
              value={formData.expectedOutcome}
              onChange={e =>
                handleInputChange('expectedOutcome', e.target.value)
              }
              placeholder="Describe the expected results and impact of this activity"
              rows={3}
            />
          </div>

          {/* Activity Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Activity Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireRegistration">
                    Require Registration
                  </Label>
                  <p className="text-sm text-gray-600">
                    Participants must register beforehand
                  </p>
                </div>
                <Switch
                  id="requireRegistration"
                  checked={formData.requireRegistration}
                  onCheckedChange={checked =>
                    handleInputChange('requireRegistration', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireApproval">Require Approval</Label>
                  <p className="text-sm text-gray-600">
                    Registration requires admin approval
                  </p>
                </div>
                <Switch
                  id="requireApproval"
                  checked={formData.requireApproval}
                  onCheckedChange={checked =>
                    handleInputChange('requireApproval', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPublic">Public Activity</Label>
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
              {isLoading ? 'Creating...' : 'Create Activity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
