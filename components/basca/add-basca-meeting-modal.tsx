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
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { BascaMeeting } from '@/types/basca';

interface AddBascaMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBascaMeetingModal({
  isOpen,
  onClose,
  onSuccess
}: AddBascaMeetingModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agendaItems, setAgendaItems] = useState<string[]>(['']);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingDate: '',
    startTime: '',
    endTime: '',
    location: '',
    meetingType: 'regular',
    barangay: '',
    maxParticipants: '50',
    isVirtual: false,
    virtualLink: '',
    requireRSVP: false,
    autoAttendance: false,
    recordingEnabled: false,
    notes: ''
  });

  const handleInputChange = (
    field: string,
    value: string | boolean | number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAgendaItem = () => {
    setAgendaItems(prev => [...prev, '']);
  };

  const removeAgendaItem = (index: number) => {
    setAgendaItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateAgendaItem = (index: number, value: string) => {
    setAgendaItems(prev => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.meetingDate || !formData.startTime) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Filter out empty agenda items
      const filteredAgenda = agendaItems.filter(item => item.trim() !== '');

      const meetingData = {
        ...formData,
        agenda: filteredAgenda,
        attendeesCount: 0,
        isConducted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // TODO: Replace with actual API call
      console.log('Creating meeting:', meetingData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Success',
        description: 'Meeting created successfully.',
        variant: 'default'
      });

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to create meeting. Please try again.',
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
      meetingDate: '',
      startTime: '',
      endTime: '',
      location: '',
      meetingType: 'regular',
      barangay: '',
      maxParticipants: '50',
      isVirtual: false,
      virtualLink: '',
      requireRSVP: false,
      autoAttendance: false,
      recordingEnabled: false,
      notes: ''
    });
    setAgendaItems(['']);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule New BASCA Meeting
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Meeting Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder="Enter meeting title"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Enter meeting description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="meetingDate">Meeting Date *</Label>
              <Input
                id="meetingDate"
                type="date"
                value={formData.meetingDate}
                onChange={e => handleInputChange('meetingDate', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="meetingType">Meeting Type</Label>
              <Select
                value={formData.meetingType}
                onValueChange={value =>
                  handleInputChange('meetingType', value)
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular Meeting</SelectItem>
                  <SelectItem value="emergency">Emergency Meeting</SelectItem>
                  <SelectItem value="training">Training Meeting</SelectItem>
                  <SelectItem value="planning">Planning Meeting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                placeholder="Enter meeting location"
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
              <Label htmlFor="maxParticipants">Max Participants</Label>
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
          </div>

          {/* Virtual Meeting Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isVirtual">Virtual Meeting</Label>
                <p className="text-sm text-gray-600">
                  Enable virtual meeting capabilities
                </p>
              </div>
              <Switch
                id="isVirtual"
                checked={formData.isVirtual}
                onCheckedChange={checked =>
                  handleInputChange('isVirtual', checked)
                }
              />
            </div>

            {formData.isVirtual && (
              <div>
                <Label htmlFor="virtualLink">Virtual Meeting Link</Label>
                <Input
                  id="virtualLink"
                  value={formData.virtualLink}
                  onChange={e =>
                    handleInputChange('virtualLink', e.target.value)
                  }
                  placeholder="Enter Zoom, Google Meet, or other platform link"
                />
              </div>
            )}
          </div>

          {/* Meeting Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Meeting Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireRSVP">Require RSVP</Label>
                  <p className="text-sm text-gray-600">
                    Members must confirm attendance
                  </p>
                </div>
                <Switch
                  id="requireRSVP"
                  checked={formData.requireRSVP}
                  onCheckedChange={checked =>
                    handleInputChange('requireRSVP', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoAttendance">Auto Attendance</Label>
                  <p className="text-sm text-gray-600">
                    Automatically mark attendance
                  </p>
                </div>
                <Switch
                  id="autoAttendance"
                  checked={formData.autoAttendance}
                  onCheckedChange={checked =>
                    handleInputChange('autoAttendance', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="recordingEnabled">Enable Recording</Label>
                  <p className="text-sm text-gray-600">
                    Allow meeting recording
                  </p>
                </div>
                <Switch
                  id="recordingEnabled"
                  checked={formData.recordingEnabled}
                  onCheckedChange={checked =>
                    handleInputChange('recordingEnabled', checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Agenda */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Meeting Agenda</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAgendaItem}
                className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {agendaItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={e => updateAgendaItem(index, e.target.value)}
                    placeholder={`Agenda item ${index + 1}`}
                  />
                  {agendaItems.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAgendaItem(index)}
                      className="px-2">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
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
              {isLoading ? 'Creating...' : 'Create Meeting'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
