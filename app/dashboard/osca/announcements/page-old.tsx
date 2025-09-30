'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Bell,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Send,
  Calendar,
  MapPin,
  Clock,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Users,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  AnnouncementsAPI,
  type Announcement,
  type Barangay
} from '@/lib/api/announcements';
import {
  validateAnnouncementForm,
  validateSMSContent,
  validateBarangayRequirements,
  type AnnouncementFormData
} from '@/lib/validations/announcements';

export default function OSCAAnnouncementsPage() {
  const { authState } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [urgentFilter, setUrgentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [barangayFilter, setBarangayFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    type: 'general',
    targetBarangay: '',
    isUrgent: false,
    expiresAt: '',
    priorityLevel: 1,
    scheduledAt: '',
    status: 'published',
    tags: [],
    sendSMS: false
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [smsPreview, setSmsPreview] = useState<{
    isValid: boolean;
    messageLength: number;
    message: string;
    warnings: string[];
  } | null>(null);
  const [barangayValidation, setBarangayValidation] = useState<{
    isValid: boolean;
    seniorCount: number;
    message: string;
  } | null>(null);

  // Load data on component mount and when filters change
  useEffect(() => {
    loadAnnouncements();
    loadBarangays();
  }, [
    currentPage,
    searchQuery,
    typeFilter,
    urgentFilter,
    statusFilter,
    barangayFilter
  ]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Load announcements from API
  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      const filters = {
        search: searchQuery || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        isUrgent:
          urgentFilter === 'urgent'
            ? true
            : urgentFilter === 'normal'
            ? false
            : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        targetBarangay: barangayFilter !== 'all' ? barangayFilter : undefined
      };

      const result = await AnnouncementsAPI.getAnnouncements(
        currentPage,
        10,
        filters
      );
      setAnnouncements(result.announcements);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading announcements:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load announcements'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load barangays from API
  const loadBarangays = async () => {
    try {
      const result = await AnnouncementsAPI.getBarangays();
      setBarangays(result);
    } catch (error) {
      console.error('Error loading barangays:', error);
    }
  };

  // Handle form field changes with validation
  const handleFieldChange = (field: keyof AnnouncementFormData, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Clear field error
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Update SMS preview if relevant fields changed
    if (
      ['title', 'content', 'isUrgent', 'type', 'targetBarangay'].includes(field)
    ) {
      const preview = validateSMSContent(
        newFormData.title,
        newFormData.content,
        newFormData.isUrgent,
        newFormData.type,
        newFormData.targetBarangay || undefined
      );
      setSmsPreview(preview);
    }

    // Validate barangay selection
    if (field === 'targetBarangay' && value) {
      validateBarangayRequirements(value).then(setBarangayValidation);
    } else if (field === 'targetBarangay' && !value) {
      setBarangayValidation(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general',
      targetBarangay: '',
      isUrgent: false,
      expiresAt: '',
      priorityLevel: 1,
      scheduledAt: '',
      status: 'published',
      tags: [],
      sendSMS: false
    });
    setFormErrors({});
    setSmsPreview(null);
    setBarangayValidation(null);
  };

  // Handle create announcement
  const handleCreateAnnouncement = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate form
      const validation = validateAnnouncementForm(formData);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        return;
      }

      // Additional validation for barangay
      if (
        formData.targetBarangay &&
        (!barangayValidation || !barangayValidation.isValid)
      ) {
        setError('Please select a valid barangay with active senior citizens');
        return;
      }

      // Create announcement
      await AnnouncementsAPI.createAnnouncement(formData);

      setSuccess('Announcement created successfully!');
      setIsCreateModalOpen(false);
      resetForm();
      await loadAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create announcement'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit announcement
  const handleEditAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Validate form
      const validation = validateAnnouncementForm(formData);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        return;
      }

      // Update announcement
      await AnnouncementsAPI.updateAnnouncement({
        id: selectedAnnouncement.id,
        ...formData
      });

      setSuccess('Announcement updated successfully!');
      setIsEditModalOpen(false);
      resetForm();
      setSelectedAnnouncement(null);
      await loadAnnouncements();
    } catch (error) {
      console.error('Error updating announcement:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update announcement'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete announcement
  const handleDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await AnnouncementsAPI.deleteAnnouncement(selectedAnnouncement.id);

      setSuccess('Announcement deleted successfully!');
      setIsDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
      await loadAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to delete announcement'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening edit modal
  const openEditModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      targetBarangay: announcement.targetBarangay || '',
      isUrgent: announcement.isUrgent,
      expiresAt: announcement.expiresAt || '',
      priorityLevel: announcement.priorityLevel,
      scheduledAt: announcement.scheduledAt || '',
      status: announcement.status,
      tags: announcement.tags,
      sendSMS: false
    });
    setIsEditModalOpen(true);
  };

  // Handle opening delete dialog
  const openDeleteDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteDialogOpen(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'benefit':
        return 'bg-green-100 text-green-800';
      case 'birthday':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Stats calculation
  const stats = [
    {
      title: 'Total Announcements',
      value: announcements.length.toString(),
      change: 'Active',
      icon: Bell,
      color: 'bg-[#00af8f]',
      textColor: 'text-[#00af8f]'
    },
    {
      title: 'Urgent Alerts',
      value: announcements.filter(a => a.isUrgent).length.toString(),
      change: 'Requires attention',
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-500'
    },
    {
      title: 'SMS Sent',
      value: announcements.filter(a => a.smsSent).length.toString(),
      change: `${announcements.reduce(
        (sum, a) => sum + a.recipientCount,
        0
      )} recipients`,
      icon: Send,
      color: 'bg-[#ffd416]',
      textColor: 'text-[#ffd416]'
    },
    {
      title: 'This Month',
      value: announcements
        .filter(a => {
          const date = new Date(a.createdAt);
          const now = new Date();
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        })
        .length.toString(),
      change: 'Created',
      icon: Calendar,
      color: 'bg-[#00af8f]',
      textColor: 'text-[#00af8f]'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#333333]">
            Announcements & Notifications
          </h1>
          <p className="text-[#666666] mt-2">
            Manage system-wide and barangay-specific announcements
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00af8f] hover:bg-[#00af90] text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Create and send announcements to senior citizens
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newAnnouncement.title}
                  onChange={e =>
                    setNewAnnouncement(prev => ({
                      ...prev,
                      title: e.target.value
                    }))
                  }
                  placeholder="Enter announcement title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={newAnnouncement.content}
                  onChange={e =>
                    setNewAnnouncement(prev => ({
                      ...prev,
                      content: e.target.value
                    }))
                  }
                  placeholder="Enter announcement content"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={newAnnouncement.type}
                    onValueChange={(value: any) =>
                      setNewAnnouncement(prev => ({ ...prev, type: value }))
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="benefit">Benefit</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Target Barangay (Optional)
                  </label>
                  <Input
                    value={newAnnouncement.targetBarangay}
                    onChange={e =>
                      setNewAnnouncement(prev => ({
                        ...prev,
                        targetBarangay: e.target.value
                      }))
                    }
                    placeholder="Leave empty for system-wide"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={newAnnouncement.isUrgent}
                    onChange={e =>
                      setNewAnnouncement(prev => ({
                        ...prev,
                        isUrgent: e.target.checked
                      }))
                    }
                  />
                  <label htmlFor="urgent" className="text-sm">
                    Mark as urgent
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sms"
                    checked={newAnnouncement.sendSMS}
                    onChange={e =>
                      setNewAnnouncement(prev => ({
                        ...prev,
                        sendSMS: e.target.checked
                      }))
                    }
                  />
                  <label htmlFor="sms" className="text-sm">
                    Send SMS notifications
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Expires At (Optional)
                </label>
                <Input
                  type="datetime-local"
                  value={newAnnouncement.expiresAt}
                  onChange={e =>
                    setNewAnnouncement(prev => ({
                      ...prev,
                      expiresAt: e.target.value
                    }))
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAnnouncement}
                  className="bg-[#00af8f] hover:bg-[#00af90] text-white"
                  disabled={!newAnnouncement.title || !newAnnouncement.content}>
                  Create Announcement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#666666]">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-[#333333] mt-1">
                      {isLoading ? (
                        <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className={`text-sm font-medium ${stat.textColor} mt-1`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-0 bg-gradient-to-r from-white to-gray-50/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#666666] w-5 h-5" />
                <Input
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-2 border-[#E0DDD8] focus:border-[#00af8f]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44 h-12">
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="benefit">Benefit</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                </SelectContent>
              </Select>
              <Select value={urgentFilter} onValueChange={setUrgentFilter}>
                <SelectTrigger className="w-44 h-12">
                  <SelectValue placeholder="Filter by Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent Only</SelectItem>
                  <SelectItem value="normal">Normal Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-[#00af8f]" />
              <div>
                <h3 className="text-xl font-bold text-[#333333]">
                  All Announcements
                </h3>
                <p className="text-sm text-[#666666] mt-1">
                  {filteredAnnouncements.length} of {announcements.length}{' '}
                  announcements
                </p>
              </div>
            </div>
            <Badge className="bg-[#00af8f]/10 text-[#00af8f]">
              {filteredAnnouncements.length} Results
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-64 h-5 bg-gray-200 rounded"></div>
                    <div className="w-16 h-5 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#333333] mb-2">
                {announcements.length === 0
                  ? 'No Announcements Yet'
                  : 'No Results Found'}
              </h3>
              <p className="text-[#666666] mb-4">
                {announcements.length === 0
                  ? 'Create your first announcement to get started.'
                  : 'Try adjusting your search criteria.'}
              </p>
              {announcements.length === 0 && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#00af8f] hover:bg-[#00af90] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Announcement
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map(announcement => (
                <div
                  key={announcement.id}
                  className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          announcement.isUrgent ? 'bg-red-500' : 'bg-[#00af8f]'
                        }`}
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-[#333333] mb-1">
                          {announcement.title}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getTypeColor(announcement.type)}>
                            {announcement.type}
                          </Badge>
                          {announcement.isUrgent && (
                            <Badge variant="destructive">Urgent</Badge>
                          )}
                          {announcement.targetBarangay && (
                            <Badge
                              variant="outline"
                              className="border-[#00af8f] text-[#00af8f]">
                              <MapPin className="w-3 h-3 mr-1" />
                              {announcement.targetBarangay}
                            </Badge>
                          )}
                          {announcement.smsSent && (
                            <Badge
                              variant="outline"
                              className="border-green-500 text-green-600">
                              <Send className="w-3 h-3 mr-1" />
                              SMS Sent
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-[#666666] mb-3 leading-relaxed">
                    {announcement.content}
                  </p>
                  <div className="flex items-center justify-between text-sm text-[#666666]">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Created{' '}
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </div>
                      {announcement.expiresAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Expires{' '}
                          {new Date(
                            announcement.expiresAt
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
