'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogFooter,
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
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Check,
  CheckCircle,
  X,
  Eye,
  Phone,
  MapPin,
  Activity,
  AlertTriangle,
  CalendarDays,
  UserPlus,
  Stethoscope,
  Home,
  FileText,
  Star,
  Trash2,
  RotateCcw,
  Loader2,
  ChevronDown,
  Calendar as CalendarIcon,
  ArrowUp,
  ArrowDown,
  Target,
  Zap
} from 'lucide-react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { toast } from 'sonner';
import {
  AppointmentsAPI,
  type Appointment,
  type SeniorCitizen,
  type AppointmentFormData,
  type AppointmentFilters,
  type AppointmentStats
} from '@/lib/api/appointments';
import {
  validateAppointmentForm,
  validateAppointmentDate,
  validateTimeSlot,
  getAppointmentTypeLabel,
  getPriorityConfig,
  appointmentTypeOptions,
  priorityOptions,
  commonRequirements
} from '@/lib/validations/appointments';

// Calendar setup
const localizer = momentLocalizer(moment);

// Import calendar CSS
import 'react-big-calendar/lib/css/react-big-calendar.css';

export default function OSCAAppointmentsPage() {
  // Main state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentStats, setAppointmentStats] =
    useState<AppointmentStats | null>(null);
  const [seniorCitizens, setSeniorCitizens] = useState<SeniorCitizen[]>([]);
  const [barangays, setBarangays] = useState<{ id: string; name: string }[]>(
    []
  );
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSeniors, setIsLoadingSeniors] = useState(false);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusConfirmDialogOpen, setIsStatusConfirmDialogOpen] =
    useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    appointmentId: string;
    newStatus: string;
    appointmentTitle: string;
  } | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [barangayFilter, setBarangayFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Senior citizen selection state
  const [seniorSearchQuery, setSeniorSearchQuery] = useState('');
  const [selectedBarangayForSeniors, setSelectedBarangayForSeniors] =
    useState('all');

  // Form state
  const [formData, setFormData] = useState<AppointmentFormData>({
    senior_citizen_id: '',
    appointment_type: 'medical',
    appointment_date: '',
    appointment_time: '',
    purpose: '',
    notes: '',
    priority_level: 'medium',
    location: '',
    estimated_duration: 60,
    requirements: [],
    follow_up_required: false
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [appointmentsData, statsData, barangaysData] = await Promise.all([
          AppointmentsAPI.getAppointments(),
          AppointmentsAPI.getAppointmentStats(),
          AppointmentsAPI.getPiliBarangays()
        ]);

        setAppointments(appointmentsData);
        setAppointmentStats(statsData);
        setBarangays(barangaysData);
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('❌ Failed to load appointments', {
          description: 'Please try refreshing the page'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load appointments when filters change
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const filters: AppointmentFilters = {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          date_range: dateFilter !== 'all' ? dateFilter : undefined,
          barangay: barangayFilter !== 'all' ? barangayFilter : undefined,
          search: searchQuery || undefined
        };

        const appointmentsData = await AppointmentsAPI.getAppointments(filters);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error loading appointments:', error);
        toast.error('❌ Failed to load appointments');
      }
    };

    if (!isLoading) {
      loadAppointments();
    }
  }, [
    statusFilter,
    typeFilter,
    dateFilter,
    barangayFilter,
    searchQuery,
    isLoading
  ]);

  // Load senior citizens for selection
  const loadSeniorCitizens = useCallback(
    async (search?: string, barangay?: string) => {
      setIsLoadingSeniors(true);
      try {
        const seniors = await AppointmentsAPI.getSeniorCitizens(
          search,
          barangay
        );
        setSeniorCitizens(seniors);
      } catch (error) {
        console.error('Error loading senior citizens:', error);
        toast.error('❌ Failed to load senior citizens');
      } finally {
        setIsLoadingSeniors(false);
      }
    },
    []
  );

  // Load available time slots
  const loadAvailableTimeSlots = useCallback(
    async (date: string, appointmentType?: string) => {
      if (!date) return;

      setIsLoadingTimeSlots(true);
      try {
        const timeSlots = await AppointmentsAPI.getAvailableTimeSlots(
          date,
          appointmentType
        );
        setAvailableTimeSlots(timeSlots);
      } catch (error) {
        console.error('Error loading time slots:', error);
        toast.error('❌ Failed to load available time slots');
      } finally {
        setIsLoadingTimeSlots(false);
      }
    },
    []
  );

  // Debounced senior search to reduce lag
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (isCreateModalOpen || isEditModalOpen) {
        const searchTerm = seniorSearchQuery.trim() || undefined;
        const barangayFilter =
          selectedBarangayForSeniors !== 'all'
            ? selectedBarangayForSeniors
            : undefined;
        loadSeniorCitizens(searchTerm, barangayFilter);
      }
    }, 300); // 300ms delay to reduce API calls

    return () => clearTimeout(searchTimeout);
  }, [
    seniorSearchQuery,
    selectedBarangayForSeniors,
    isCreateModalOpen,
    isEditModalOpen,
    loadSeniorCitizens
  ]);

  // Memoized filtered appointments for performance
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const matchesSearch =
        !searchQuery ||
        appointment.senior_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        appointment.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.senior_barangay
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || appointment.status === statusFilter;
      const matchesType =
        typeFilter === 'all' || appointment.appointment_type === typeFilter;
      const matchesBarangay =
        barangayFilter === 'all' ||
        appointment.senior_barangay === barangayFilter;
      const matchesPriority =
        priorityFilter === 'all' ||
        appointment.priority_level === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesBarangay &&
        matchesPriority
      );
    });
  }, [
    appointments,
    searchQuery,
    statusFilter,
    typeFilter,
    barangayFilter,
    priorityFilter
  ]);

  // Enhanced stats with real data
  const stats = [
    {
      title: 'Total Appointments',
      value: appointmentStats?.total.toString() || '0',
      change: 'All time',
      icon: Calendar,
      color: 'bg-[#00af8f]',
      trend: 'stable'
    },
    {
      title: 'Pending Approval',
      value: appointmentStats?.pending.toString() || '0',
      change: 'Requires action',
      icon: Clock,
      color: 'bg-yellow-500',
      trend: appointmentStats && appointmentStats.pending > 0 ? 'up' : 'stable'
    },
    {
      title: "Today's Appointments",
      value: appointmentStats?.today.toString() || '0',
      change: 'Scheduled today',
      icon: Activity,
      color: 'bg-blue-500',
      trend: 'stable'
    },
    {
      title: 'Overdue',
      value: appointmentStats?.overdue.toString() || '0',
      change: 'Need attention',
      icon: AlertTriangle,
      color: 'bg-red-500',
      trend:
        appointmentStats && appointmentStats.overdue > 0 ? 'down' : 'stable'
    }
  ];

  // Calendar events for BigCalendar
  const calendarEvents = useMemo(() => {
    return filteredAppointments.map(appointment => ({
      id: appointment.id,
      title: `${appointment.senior_name} - ${getAppointmentTypeLabel(
        appointment.appointment_type
      )}`,
      start: new Date(
        `${appointment.appointment_date}T${appointment.appointment_time}`
      ),
      end: new Date(
        `${appointment.appointment_date}T${appointment.appointment_time}`
      ),
      resource: appointment
    }));
  }, [filteredAppointments]);

  // Form handlers
  const handleFieldChange = useCallback(
    (field: string, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));

      // Clear field error when user starts typing
      if (formErrors[field]) {
        setFormErrors(prev => ({ ...prev, [field]: '' }));
      }

      // Load time slots when date or type changes
      if (field === 'appointment_date' || field === 'appointment_type') {
        const date =
          field === 'appointment_date' ? value : formData.appointment_date;
        const type =
          field === 'appointment_type' ? value : formData.appointment_type;

        if (date && type) {
          loadAvailableTimeSlots(date, type);
        }
      }
    },
    [formData, formErrors, loadAvailableTimeSlots]
  );

  const handleSeniorSelection = useCallback(
    (seniorId: string) => {
      const selectedSenior = seniorCitizens.find(s => s.id === seniorId);
      if (selectedSenior) {
        setFormData(prev => ({
          ...prev,
          senior_citizen_id: seniorId
        }));
        setSeniorSearchQuery(
          `${selectedSenior.first_name} ${selectedSenior.last_name}`
        );
        // Auto-select the senior's barangay
        setSelectedBarangayForSeniors(selectedSenior.barangay);
      }
    },
    [seniorCitizens]
  );

  const validateForm = useCallback(() => {
    const validation = validateAppointmentForm(formData);
    if (!validation.success && validation.errors) {
      setFormErrors(validation.errors);
      return false;
    }

    // Additional validations
    const dateValidation = validateAppointmentDate(
      formData.appointment_date,
      formData.appointment_type
    );
    if (!dateValidation.valid) {
      setFormErrors(prev => ({
        ...prev,
        appointment_date: dateValidation.message || 'Invalid date'
      }));
      return false;
    }

    const timeValidation = validateTimeSlot(
      formData.appointment_time,
      formData.appointment_type
    );
    if (!timeValidation.valid) {
      setFormErrors(prev => ({
        ...prev,
        appointment_time: timeValidation.message || 'Invalid time'
      }));
      return false;
    }

    setFormErrors({});
    return true;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      senior_citizen_id: '',
      appointment_type: 'medical',
      appointment_date: '',
      appointment_time: '',
      purpose: '',
      notes: '',
      priority_level: 'medium',
      location: '',
      estimated_duration: 60,
      requirements: [],
      follow_up_required: false
    });
    setFormErrors({});
    setSeniorSearchQuery('');
    setSelectedBarangayForSeniors('all');
    setAvailableTimeSlots([]);
  }, []);

  const handleCreateAppointment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) {
        toast.error('❌ Please fix the form errors');
        return;
      }

      setIsSubmitting(true);
      const loadingToast = toast.loading('Creating appointment...', {
        description: 'Setting up the appointment for the senior citizen'
      });

      try {
        const newAppointment = await AppointmentsAPI.createAppointment(
          formData
        );
        setAppointments(prev => [newAppointment, ...prev]);

        // Refresh stats
        const newStats = await AppointmentsAPI.getAppointmentStats();
        setAppointmentStats(newStats);

        setIsCreateModalOpen(false);
        resetForm();

        toast.dismiss(loadingToast);
        toast.success('✅ Appointment created successfully!', {
          description: `Scheduled for ${
            newAppointment.senior_name
          } on ${new Date(
            newAppointment.appointment_date
          ).toLocaleDateString()}`,
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => {
              setSelectedAppointment(newAppointment);
              setIsViewModalOpen(true);
            }
          }
        });
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('❌ Failed to create appointment', {
          description:
            error instanceof Error ? error.message : 'Please try again later'
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, resetForm]
  );

  const handleEditAppointment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedAppointment || !validateForm()) {
        toast.error('❌ Please fix the form errors');
        return;
      }

      setIsSubmitting(true);
      const loadingToast = toast.loading('Updating appointment...', {
        description: 'Saving changes to the appointment'
      });

      try {
        const updatedAppointment = await AppointmentsAPI.updateAppointment(
          selectedAppointment.id,
          formData
        );
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === selectedAppointment.id ? updatedAppointment : apt
          )
        );

        setIsEditModalOpen(false);
        setSelectedAppointment(null);
        resetForm();

        toast.dismiss(loadingToast);
        toast.success('✅ Appointment updated successfully!', {
          description: `Updated appointment for ${updatedAppointment.senior_name}`,
          duration: 5000
        });
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('❌ Failed to update appointment', {
          description:
            error instanceof Error ? error.message : 'Please try again later'
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedAppointment, formData, validateForm, resetForm]
  );

  // Open status confirmation dialog
  const openStatusConfirmation = useCallback(
    (appointmentId: string, newStatus: string) => {
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        setPendingStatusChange({
          appointmentId,
          newStatus,
          appointmentTitle: `${
            appointment.senior_name
          } - ${getAppointmentTypeLabel(appointment.appointment_type)}`
        });
        setIsStatusConfirmDialogOpen(true);
      }
    },
    [appointments]
  );

  // Confirm status update
  const handleConfirmStatusUpdate = useCallback(async () => {
    if (!pendingStatusChange) return;

    const { appointmentId, newStatus } = pendingStatusChange;
    const loadingToast = toast.loading(
      `${
        newStatus === 'approved'
          ? 'Approving'
          : newStatus === 'cancelled'
          ? 'Rejecting'
          : newStatus === 'completed'
          ? 'Completing'
          : 'Updating'
      } appointment...`
    );

    try {
      await AppointmentsAPI.updateAppointmentStatus(appointmentId, newStatus);
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? {
                ...apt,
                status: newStatus as any,
                updated_at: new Date().toISOString()
              }
            : apt
        )
      );

      // Refresh stats
      const newStats = await AppointmentsAPI.getAppointmentStats();
      setAppointmentStats(newStats);

      setIsStatusConfirmDialogOpen(false);
      setPendingStatusChange(null);

      toast.dismiss(loadingToast);
      const statusLabel = newStatus === 'cancelled' ? 'rejected' : newStatus;
      toast.success(`✅ Appointment ${statusLabel} successfully!`, {
        duration: 4000
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('❌ Failed to update appointment status', {
        description:
          error instanceof Error ? error.message : 'Please try again later'
      });
    }
  }, [pendingStatusChange]);

  // Legacy function for backward compatibility (now uses confirmation)
  const handleStatusUpdate = useCallback(
    (appointmentId: string, newStatus: string) => {
      openStatusConfirmation(appointmentId, newStatus);
    },
    [openStatusConfirmation]
  );

  const handleDeleteAppointment = useCallback(async () => {
    if (!selectedAppointment) return;

    const loadingToast = toast.loading('Deleting appointment...', {
      description: 'Removing appointment from the system'
    });

    try {
      await AppointmentsAPI.deleteAppointment(selectedAppointment.id);
      setAppointments(prev =>
        prev.filter(apt => apt.id !== selectedAppointment.id)
      );

      // Refresh stats
      const newStats = await AppointmentsAPI.getAppointmentStats();
      setAppointmentStats(newStats);

      setIsDeleteDialogOpen(false);
      setSelectedAppointment(null);

      toast.dismiss(loadingToast);
      toast.success('✅ Appointment deleted successfully!', {
        duration: 4000
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('❌ Failed to delete appointment', {
        description:
          error instanceof Error ? error.message : 'Please try again later'
      });
    }
  }, [selectedAppointment]);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    resetForm();
    // Reset senior search state
    setSeniorSearchQuery('');
    setSelectedBarangayForSeniors('all');
    setIsCreateModalOpen(true);
    // Seniors will be loaded by the useEffect when modal opens
  }, [resetForm]);

  const openEditModal = useCallback(
    (appointment: Appointment) => {
      setSelectedAppointment(appointment);
      setFormData({
        senior_citizen_id: appointment.senior_citizen_id,
        appointment_type: appointment.appointment_type,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        purpose: appointment.purpose,
        notes: appointment.notes || '',
        priority_level: appointment.priority_level || 'medium',
        location: appointment.location || '',
        estimated_duration: appointment.estimated_duration || 60,
        requirements: appointment.requirements || [],
        follow_up_required: appointment.follow_up_required || false
      });
      setSeniorSearchQuery(appointment.senior_name || '');
      loadSeniorCitizens();
      loadAvailableTimeSlots(
        appointment.appointment_date,
        appointment.appointment_type
      );
      setIsEditModalOpen(true);
    },
    [loadSeniorCitizens, loadAvailableTimeSlots]
  );

  const openViewModal = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  }, []);

  const openDeleteDialog = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteDialogOpen(true);
  }, []);

  // Utility functions for styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'bhw':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'basca':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'consultation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'home_visit':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'approved':
        return Check;
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return X;
      case 'rescheduled':
        return RotateCcw;
      default:
        return Clock;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return Stethoscope;
      case 'bhw':
        return UserPlus;
      case 'basca':
        return Users;
      case 'consultation':
        return FileText;
      case 'home_visit':
        return Home;
      default:
        return Calendar;
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00af8f]/5 via-[#00af90]/3 to-transparent rounded-3xl"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-2xl">
                  <CalendarDays className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-[#333333]">
                    Appointment Management
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-[#00af8f] rounded-full animate-pulse"></div>
                    <span className="text-sm text-[#666666]">
                      Real-time Data
                    </span>
                    <span className="text-xs text-[#888888]">
                      • Last updated {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[#666666] text-lg">
                Schedule, manage, and track medical appointments and
                consultations for senior citizens with comprehensive workflow
                management
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setViewMode(viewMode === 'list' ? 'calendar' : 'list')
                }
                className="h-12 border-2 border-[#E0DDD8] hover:border-[#00af8f] hover:bg-[#00af8f]/5">
                {viewMode === 'list' ? (
                  <>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Calendar View
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    List View
                  </>
                )}
              </Button>

              <Button
                onClick={openCreateModal}
                className="h-12 bg-[#00af8f] hover:bg-[#00af90] text-white shadow-lg font-semibold px-6">
                <Plus className="w-5 h-5 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon =
            stat.trend === 'up'
              ? ArrowUp
              : stat.trend === 'down'
              ? ArrowDown
              : null;

          return (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-gray-100/20 rounded-full transform translate-x-8 -translate-y-8"></div>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-semibold text-[#666666] uppercase tracking-wide">
                        {stat.title}
                      </p>
                      {TrendIcon && (
                        <TrendIcon
                          className={`w-3 h-3 ${
                            stat.trend === 'up'
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        />
                      )}
                    </div>
                    <p className="text-3xl font-bold text-[#333333] mb-1 group-hover:text-[#00af8f] transition-colors">
                      {isLoading ? (
                        <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="text-sm text-[#666666] font-medium">
                      {stat.change}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-2xl ${stat.color} bg-opacity-10 backdrop-blur-sm group-hover:scale-110 transition-transform`}>
                    <Icon
                      className={`w-7 h-7`}
                      style={{ color: stat.color.replace('bg-', '') }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Filters */}
      <Card className="border-0 bg-gradient-to-r from-white to-gray-50/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#666666] w-5 h-5" />
                <Input
                  placeholder="Search by senior name, purpose, barangay, or appointment details..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-2 border-[#E0DDD8] focus:border-[#00af8f] text-base"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44 h-12 border-2 border-[#E0DDD8] focus:border-[#00af8f]">
                  <SelectValue placeholder="🔄 Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">⏳ Pending</SelectItem>
                  <SelectItem value="approved">✅ Approved</SelectItem>
                  <SelectItem value="completed">🎯 Completed</SelectItem>
                  <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                  <SelectItem value="rescheduled">🔄 Rescheduled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44 h-12 border-2 border-[#E0DDD8] focus:border-[#00af8f]">
                  <SelectValue placeholder="🏥 Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="medical">🩺 Medical</SelectItem>
                  <SelectItem value="bhw">🏠 BHW Visit</SelectItem>
                  <SelectItem value="basca">👥 BASCA</SelectItem>
                  <SelectItem value="consultation">💬 Consultation</SelectItem>
                  <SelectItem value="home_visit">🚪 Home Visit</SelectItem>
                </SelectContent>
              </Select>

              <Select value={barangayFilter} onValueChange={setBarangayFilter}>
                <SelectTrigger className="w-44 h-12 border-2 border-[#E0DDD8] focus:border-[#00af8f]">
                  <SelectValue placeholder="📍 Barangay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Barangays</SelectItem>
                  {barangays.map(barangay => (
                    <SelectItem key={barangay.id} value={barangay.name}>
                      📍 {barangay.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-44 h-12 border-2 border-[#E0DDD8] focus:border-[#00af8f]">
                  <SelectValue placeholder="📅 Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">📅 Today</SelectItem>
                  <SelectItem value="tomorrow">⏭️ Tomorrow</SelectItem>
                  <SelectItem value="week">📊 This Week</SelectItem>
                  <SelectItem value="month">📈 This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area with Tabs */}
      <Tabs
        value={viewMode}
        onValueChange={value => setViewMode(value as 'list' | 'calendar')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        {/* Appointments List View */}
        <TabsContent value="list">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-2xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-[#333333]">
                      Appointments Overview
                    </CardTitle>
                    <p className="text-sm text-[#666666] mt-1">
                      {filteredAppointments.length} of {appointments.length}{' '}
                      appointments
                    </p>
                  </div>
                </div>
                <Badge className="bg-[#00af8f]/10 text-[#00af8f] px-4 py-2">
                  {filteredAppointments.length} Results
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="p-6 border rounded-xl animate-pulse">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="w-48 h-5 bg-gray-200 rounded"></div>
                            <div className="w-64 h-4 bg-gray-200 rounded"></div>
                            <div className="flex gap-2">
                              <div className="w-16 h-6 bg-gray-200 rounded"></div>
                              <div className="w-16 h-6 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-[#00af8f]/10 to-[#00af90]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CalendarDays className="w-12 h-12 text-[#00af8f]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#333333] mb-2">
                    {appointments.length === 0
                      ? 'No Appointments Yet'
                      : 'No Results Found'}
                  </h3>
                  <p className="text-[#666666] mb-6 text-lg">
                    {appointments.length === 0
                      ? 'Get started by scheduling your first appointment for a senior citizen.'
                      : 'Try adjusting your search criteria or filters to find appointments.'}
                  </p>
                  <Button
                    onClick={openCreateModal}
                    className="bg-[#00af8f] hover:bg-[#00af90] text-white h-12 px-8 font-semibold">
                    <Plus className="w-5 h-5 mr-2" />
                    Schedule New Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map(appointment => {
                    const StatusIcon = getStatusIcon(appointment.status);
                    const TypeIcon = getTypeIcon(appointment.appointment_type);
                    const priorityConfig = getPriorityConfig(
                      appointment.priority_level || 'medium'
                    );

                    return (
                      <Card
                        key={appointment.id}
                        className="group hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getTypeColor(
                                  appointment.appointment_type
                                )} bg-opacity-10`}>
                                <TypeIcon
                                  className="w-7 h-7"
                                  style={{
                                    color: getTypeColor(
                                      appointment.appointment_type
                                    )
                                      .split(' ')[2]
                                      .replace('text-', '')
                                  }}
                                />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-xl font-bold text-[#333333] group-hover:text-[#00af8f] transition-colors">
                                    {appointment.senior_name}
                                  </h4>
                                  {appointment.priority_level &&
                                    appointment.priority_level !== 'medium' && (
                                      <Badge
                                        className={`${priorityConfig.bgColor} ${priorityConfig.color} border-0`}>
                                        <Star className="w-3 h-3 mr-1" />
                                        {priorityConfig.label}
                                      </Badge>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#00af8f]" />
                                    <span className="font-medium">
                                      {new Date(
                                        appointment.appointment_date
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#00af8f]" />
                                    <span className="font-medium">
                                      {appointment.appointment_time}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#00af8f]" />
                                    <span className="font-medium">
                                      {appointment.senior_barangay}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-[#00af8f]" />
                                    <span className="font-medium">
                                      {appointment.senior_phone}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                  <Badge
                                    className={`${getStatusColor(
                                      appointment.status
                                    )} border`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {appointment.status
                                      .charAt(0)
                                      .toUpperCase() +
                                      appointment.status.slice(1)}
                                  </Badge>
                                  <Badge
                                    className={`${getTypeColor(
                                      appointment.appointment_type
                                    )} border`}>
                                    <TypeIcon className="w-3 h-3 mr-1" />
                                    {getAppointmentTypeLabel(
                                      appointment.appointment_type
                                    )}
                                  </Badge>
                                  {appointment.estimated_duration && (
                                    <Badge
                                      variant="outline"
                                      className="text-gray-600">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {appointment.estimated_duration}min
                                    </Badge>
                                  )}
                                </div>

                                <div className="mb-4">
                                  <h5 className="font-semibold text-[#333333] mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Purpose:
                                  </h5>
                                  <p className="text-[#666666] leading-relaxed bg-gray-50 p-3 rounded-lg">
                                    {appointment.purpose}
                                  </p>
                                </div>

                                {appointment.notes && (
                                  <div className="mb-4">
                                    <h5 className="font-semibold text-[#333333] mb-2 flex items-center gap-2">
                                      <FileText className="w-4 h-4" />
                                      Notes:
                                    </h5>
                                    <p className="text-[#666666] text-sm bg-blue-50 p-3 rounded-lg">
                                      {appointment.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              {/* Status Actions Dropdown */}
                              {appointment.status !== 'completed' &&
                                appointment.status !== 'cancelled' && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm text-gray-600 mr-2">
                                      Actions:
                                    </span>
                                    <Select
                                      value=""
                                      onValueChange={value => {
                                        if (value) {
                                          handleStatusUpdate(
                                            appointment.id,
                                            value
                                          );
                                        }
                                      }}>
                                      <SelectTrigger className="h-8 w-auto min-w-[100px] text-sm">
                                        <SelectValue placeholder="Choose action" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {appointment.status === 'pending' && (
                                          <>
                                            <SelectItem
                                              value="approved"
                                              className="text-green-600">
                                              <div className="flex items-center gap-2">
                                                <Check className="w-4 h-4" />
                                                Approve
                                              </div>
                                            </SelectItem>
                                            <SelectItem
                                              value="cancelled"
                                              className="text-red-600">
                                              <div className="flex items-center gap-2">
                                                <X className="w-4 h-4" />
                                                Reject
                                              </div>
                                            </SelectItem>
                                          </>
                                        )}
                                        {appointment.status === 'approved' && (
                                          <>
                                            <SelectItem
                                              value="completed"
                                              className="text-blue-600">
                                              <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Complete
                                              </div>
                                            </SelectItem>
                                            <SelectItem
                                              value="cancelled"
                                              className="text-red-600">
                                              <div className="flex items-center gap-2">
                                                <X className="w-4 h-4" />
                                                Cancel
                                              </div>
                                            </SelectItem>
                                          </>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#00af8f] hover:text-[#00af90] hover:bg-[#00af8f]/5 h-10 w-10"
                                onClick={() => openViewModal(appointment)}
                                title="View Details">
                                <Eye className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 h-10 w-10"
                                onClick={() => openEditModal(appointment)}
                                title="Edit Appointment">
                                <Edit className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10 w-10"
                                onClick={() => openDeleteDialog(appointment)}
                                title="Delete Appointment">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-[#666666] pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Created{' '}
                                {new Date(
                                  appointment.created_at
                                ).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Updated{' '}
                                {new Date(
                                  appointment.updated_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Age: {appointment.senior_age}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-2xl">
                    <CalendarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-[#333333]">
                      Calendar View
                    </CardTitle>
                    <p className="text-sm text-[#666666] mt-1">
                      Visual overview of all appointments by date and time
                    </p>
                  </div>
                </div>
                <Badge className="bg-[#00af8f]/10 text-[#00af8f] px-4 py-2">
                  {filteredAppointments.length} Appointments
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] bg-white rounded-lg border">
                <BigCalendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%', padding: '20px' }}
                  views={['month', 'week', 'day']}
                  defaultView="month"
                  popup
                  selectable
                  onSelectEvent={event => openViewModal(event.resource)}
                  eventPropGetter={event => {
                    const appointment = event.resource;
                    let backgroundColor = '#00af8f';

                    switch (appointment.status) {
                      case 'pending':
                        backgroundColor = '#f59e0b';
                        break;
                      case 'approved':
                        backgroundColor = '#3b82f6';
                        break;
                      case 'completed':
                        backgroundColor = '#10b981';
                        break;
                      case 'cancelled':
                        backgroundColor = '#ef4444';
                        break;
                      case 'rescheduled':
                        backgroundColor = '#8b5cf6';
                        break;
                    }

                    return {
                      style: {
                        backgroundColor,
                        borderColor: backgroundColor,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        padding: '2px 6px'
                      }
                    };
                  }}
                  components={{
                    event: ({ event }) => (
                      <div className="text-xs">
                        <div className="font-semibold truncate">
                          {event.resource.senior_name}
                        </div>
                        <div className="truncate">
                          {getAppointmentTypeLabel(
                            event.resource.appointment_type
                          )}
                        </div>
                      </div>
                    )
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Appointment Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <CalendarDays className="w-5 h-5 mr-2 text-[#00af8f]" />
              Schedule New Appointment
            </DialogTitle>
            <DialogDescription>
              Create a new appointment for a senior citizen. All fields marked
              with * are required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAppointment} className="space-y-6">
            {/* Senior Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Select Senior Citizen *
              </Label>

              {/* Search and Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Search by name..."
                    value={seniorSearchQuery}
                    onChange={e => {
                      // Update UI immediately but debounce the API call via useEffect
                      setSeniorSearchQuery(e.target.value);
                    }}
                    className="h-10"
                  />
                </div>
                <div>
                  <Select
                    value={selectedBarangayForSeniors}
                    onValueChange={value => {
                      setSelectedBarangayForSeniors(value);
                      // Clear the selected senior when changing barangay filter
                      if (formData.senior_citizen_id) {
                        setFormData(prev => ({
                          ...prev,
                          senior_citizen_id: ''
                        }));
                        setSeniorSearchQuery('');
                      }
                    }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by barangay" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Barangays</SelectItem>
                      {barangays.map(barangay => (
                        <SelectItem key={barangay.id} value={barangay.name}>
                          {barangay.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Senior Selection List */}
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {isLoadingSeniors ? (
                  <div className="p-4 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading senior citizens...
                  </div>
                ) : seniorCitizens.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No senior citizens found. Try adjusting your search or
                    filter.
                  </div>
                ) : (
                  <div className="divide-y">
                    {seniorCitizens.map(senior => (
                      <div
                        key={senior.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          formData.senior_citizen_id === senior.id
                            ? 'bg-[#00af8f]/10 border-l-4 border-[#00af8f]'
                            : ''
                        }`}
                        onClick={() => handleSeniorSelection(senior.id)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {senior.first_name} {senior.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {senior.barangay} • {senior.gender} • Age{' '}
                              {new Date().getFullYear() -
                                new Date(senior.date_of_birth).getFullYear()}
                            </div>
                          </div>
                          {formData.senior_citizen_id === senior.id && (
                            <Check className="w-5 h-5 text-[#00af8f]" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {formErrors.senior_citizen_id && (
                <p className="text-sm text-red-600">
                  {formErrors.senior_citizen_id}
                </p>
              )}
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="appointment_type"
                  className="text-sm font-medium text-gray-700">
                  Appointment Type *
                </Label>
                <Select
                  value={formData.appointment_type}
                  onValueChange={value =>
                    handleFieldChange('appointment_type', value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">{option.label}</div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.appointment_type && (
                  <p className="text-sm text-red-600">
                    {formErrors.appointment_type}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="priority_level"
                  className="text-sm font-medium text-gray-700">
                  Priority Level *
                </Label>
                <Select
                  value={formData.priority_level}
                  onValueChange={value =>
                    handleFieldChange('priority_level', value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              option.value === 'urgent'
                                ? 'bg-red-500'
                                : option.value === 'high'
                                ? 'bg-orange-500'
                                : option.value === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}></div>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.priority_level && (
                  <p className="text-sm text-red-600">
                    {formErrors.priority_level}
                  </p>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="appointment_date"
                  className="text-sm font-medium text-gray-700">
                  Appointment Date *
                </Label>
                <Input
                  type="date"
                  value={formData.appointment_date}
                  onChange={e =>
                    handleFieldChange('appointment_date', e.target.value)
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className="h-10"
                />
                {formErrors.appointment_date && (
                  <p className="text-sm text-red-600">
                    {formErrors.appointment_date}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="appointment_time"
                  className="text-sm font-medium text-gray-700">
                  Appointment Time *
                </Label>
                <Select
                  value={formData.appointment_time}
                  onValueChange={value =>
                    handleFieldChange('appointment_time', value)
                  }
                  disabled={isLoadingTimeSlots}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingTimeSlots ? 'Loading slots...' : 'Select time'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map(slot => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.appointment_time && (
                  <p className="text-sm text-red-600">
                    {formErrors.appointment_time}
                  </p>
                )}
              </div>
            </div>

            {/* Purpose and Location */}
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="purpose"
                  className="text-sm font-medium text-gray-700">
                  Purpose/Reason *
                </Label>
                <Textarea
                  value={formData.purpose}
                  onChange={e => handleFieldChange('purpose', e.target.value)}
                  placeholder="Describe the purpose of this appointment..."
                  className="min-h-[80px]"
                />
                {formErrors.purpose && (
                  <p className="text-sm text-red-600">{formErrors.purpose}</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-gray-700">
                  Location
                </Label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={e => handleFieldChange('location', e.target.value)}
                  placeholder="e.g., OSCA Office, Senior's Home, Barangay Hall"
                  className="h-10"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="estimated_duration"
                  className="text-sm font-medium text-gray-700">
                  Estimated Duration (minutes)
                </Label>
                <Input
                  type="number"
                  value={formData.estimated_duration}
                  onChange={e =>
                    handleFieldChange(
                      'estimated_duration',
                      parseInt(e.target.value) || 30
                    )
                  }
                  min="15"
                  max="480"
                  className="h-10"
                />
              </div>

              <div>
                <Label
                  htmlFor="notes"
                  className="text-sm font-medium text-gray-700">
                  Additional Notes
                </Label>
                <Textarea
                  value={formData.notes}
                  onChange={e => handleFieldChange('notes', e.target.value)}
                  placeholder="Any additional information or special instructions..."
                  className="min-h-[60px]"
                />
              </div>
            </div>

            {/* Requirements */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Requirements
              </Label>
              <div className="mt-2 space-y-2">
                {commonRequirements.map(req => (
                  <div key={req} className="flex items-center space-x-2">
                    <Checkbox
                      id={req}
                      checked={formData.requirements?.includes(req) || false}
                      onCheckedChange={checked => {
                        const currentRequirements = formData.requirements || [];
                        const newRequirements = checked
                          ? [...currentRequirements, req]
                          : currentRequirements.filter(r => r !== req);
                        handleFieldChange('requirements', newRequirements);
                      }}
                    />
                    <Label htmlFor={req} className="text-sm text-gray-600">
                      {req}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="follow_up_required"
                checked={formData.follow_up_required}
                onCheckedChange={checked =>
                  handleFieldChange('follow_up_required', checked)
                }
              />
              <Label
                htmlFor="follow_up_required"
                className="text-sm text-gray-600">
                Follow-up appointment required
              </Label>
            </div>

            <DialogFooter className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#00af8f] hover:bg-[#00af90] text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Appointment Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <CalendarDays className="w-5 h-5 mr-2 text-[#00af8f]" />
              Appointment Details
            </DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Senior Citizen
                  </Label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedAppointment.senior_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <Badge className={getStatusColor(selectedAppointment.status)}>
                    {selectedAppointment.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Appointment Type
                  </Label>
                  <p className="text-gray-900">
                    {getAppointmentTypeLabel(
                      selectedAppointment.appointment_type
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Priority
                  </Label>
                  <Badge
                    className={`${
                      getPriorityConfig(
                        selectedAppointment.priority_level || 'medium'
                      ).bgColor
                    } ${
                      getPriorityConfig(
                        selectedAppointment.priority_level || 'medium'
                      ).color
                    }`}>
                    {selectedAppointment.priority_level?.toUpperCase() ||
                      'MEDIUM'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Date & Time
                  </Label>
                  <p className="text-gray-900">
                    {new Date(
                      selectedAppointment.appointment_date
                    ).toLocaleDateString()}{' '}
                    at {selectedAppointment.appointment_time}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Location
                  </Label>
                  <p className="text-gray-900">
                    {selectedAppointment.location || 'OSCA Office'}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Purpose
                </Label>
                <p className="text-gray-900 mt-1">
                  {selectedAppointment.purpose}
                </p>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Notes
                  </Label>
                  <p className="text-gray-900 mt-1">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedAppointment);
                  }}
                  className="bg-[#00af8f] hover:bg-[#00af90] text-white">
                  Edit Appointment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <CalendarDays className="w-5 h-5 mr-2 text-[#00af8f]" />
              Edit Appointment
            </DialogTitle>
            <DialogDescription>
              Update the appointment details. All fields marked with * are
              required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditAppointment} className="space-y-6">
            {/* Senior Selection (Read-only for edit) */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Senior Citizen *
              </Label>
              {selectedAppointment && (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <div className="font-medium text-gray-900">
                    {selectedAppointment.senior_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedAppointment.senior_barangay} •{' '}
                    {selectedAppointment.senior_gender}
                  </div>
                </div>
              )}
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="edit_appointment_type"
                  className="text-sm font-medium text-gray-700">
                  Appointment Type *
                </Label>
                <Select
                  value={formData.appointment_type}
                  onValueChange={value =>
                    handleFieldChange('appointment_type', value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.appointment_type && (
                  <p className="text-sm text-red-600">
                    {formErrors.appointment_type}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="edit_priority_level"
                  className="text-sm font-medium text-gray-700">
                  Priority Level *
                </Label>
                <Select
                  value={formData.priority_level}
                  onValueChange={value =>
                    handleFieldChange('priority_level', value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              option.value === 'urgent'
                                ? 'bg-red-500'
                                : option.value === 'high'
                                ? 'bg-orange-500'
                                : option.value === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}></div>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.priority_level && (
                  <p className="text-sm text-red-600">
                    {formErrors.priority_level}
                  </p>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="edit_appointment_date"
                  className="text-sm font-medium text-gray-700">
                  Appointment Date *
                </Label>
                <Input
                  type="date"
                  value={formData.appointment_date}
                  onChange={e =>
                    handleFieldChange('appointment_date', e.target.value)
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className="h-10"
                />
                {formErrors.appointment_date && (
                  <p className="text-sm text-red-600">
                    {formErrors.appointment_date}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="edit_appointment_time"
                  className="text-sm font-medium text-gray-700">
                  Appointment Time *
                </Label>
                <Select
                  value={formData.appointment_time}
                  onValueChange={value =>
                    handleFieldChange('appointment_time', value)
                  }
                  disabled={isLoadingTimeSlots}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingTimeSlots ? 'Loading slots...' : 'Select time'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map(slot => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.appointment_time && (
                  <p className="text-sm text-red-600">
                    {formErrors.appointment_time}
                  </p>
                )}
              </div>
            </div>

            {/* Purpose and Location */}
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="edit_purpose"
                  className="text-sm font-medium text-gray-700">
                  Purpose/Reason *
                </Label>
                <Textarea
                  value={formData.purpose}
                  onChange={e => handleFieldChange('purpose', e.target.value)}
                  placeholder="Describe the purpose of this appointment..."
                  className="min-h-[80px]"
                />
                {formErrors.purpose && (
                  <p className="text-sm text-red-600">{formErrors.purpose}</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="edit_location"
                  className="text-sm font-medium text-gray-700">
                  Location
                </Label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={e => handleFieldChange('location', e.target.value)}
                  placeholder="e.g., OSCA Office, Senior's Home, Barangay Hall"
                  className="h-10"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="edit_estimated_duration"
                  className="text-sm font-medium text-gray-700">
                  Estimated Duration (minutes)
                </Label>
                <Input
                  type="number"
                  value={formData.estimated_duration}
                  onChange={e =>
                    handleFieldChange(
                      'estimated_duration',
                      parseInt(e.target.value) || 30
                    )
                  }
                  min="15"
                  max="480"
                  className="h-10"
                />
              </div>

              <div>
                <Label
                  htmlFor="edit_notes"
                  className="text-sm font-medium text-gray-700">
                  Additional Notes
                </Label>
                <Textarea
                  value={formData.notes}
                  onChange={e => handleFieldChange('notes', e.target.value)}
                  placeholder="Any additional information or special instructions..."
                  className="min-h-[60px]"
                />
              </div>
            </div>

            {/* Requirements */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Requirements
              </Label>
              <div className="mt-2 space-y-2">
                {commonRequirements.map(req => (
                  <div key={req} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit_${req}`}
                      checked={formData.requirements?.includes(req) || false}
                      onCheckedChange={checked => {
                        const currentRequirements = formData.requirements || [];
                        const newRequirements = checked
                          ? [...currentRequirements, req]
                          : currentRequirements.filter(r => r !== req);
                        handleFieldChange('requirements', newRequirements);
                      }}
                    />
                    <Label
                      htmlFor={`edit_${req}`}
                      className="text-sm text-gray-600">
                      {req}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit_follow_up_required"
                checked={formData.follow_up_required}
                onCheckedChange={checked =>
                  handleFieldChange('follow_up_required', checked)
                }
              />
              <Label
                htmlFor="edit_follow_up_required"
                className="text-sm text-gray-600">
                Follow-up appointment required
              </Label>
            </div>

            <DialogFooter className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#00af8f] hover:bg-[#00af90] text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Update Appointment
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Appointment
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this appointment for{' '}
              <strong>{selectedAppointment?.senior_name}</strong>?
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                Scheduled:{' '}
                {selectedAppointment &&
                  new Date(
                    selectedAppointment.appointment_date
                  ).toLocaleDateString()}{' '}
                at {selectedAppointment?.appointment_time}
              </span>
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAppointment}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Appointment
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Confirmation Dialog */}
      <AlertDialog
        open={isStatusConfirmDialogOpen}
        onOpenChange={setIsStatusConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              {pendingStatusChange?.newStatus === 'approved' && (
                <>
                  <Check className="w-5 h-5 mr-2 text-green-600" />
                  Approve Appointment
                </>
              )}
              {pendingStatusChange?.newStatus === 'cancelled' && (
                <>
                  <X className="w-5 h-5 mr-2 text-red-600" />
                  Reject Appointment
                </>
              )}
              {pendingStatusChange?.newStatus === 'completed' && (
                <>
                  <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Complete Appointment
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{' '}
              <strong>
                {pendingStatusChange?.newStatus === 'cancelled'
                  ? 'reject'
                  : pendingStatusChange?.newStatus}
              </strong>{' '}
              this appointment?
              <br />
              <span className="text-sm text-gray-600 mt-2 block">
                <strong>Appointment:</strong>{' '}
                {pendingStatusChange?.appointmentTitle}
              </span>
              <br />
              {pendingStatusChange?.newStatus === 'approved' && (
                <span className="text-sm text-green-700">
                  ✅ The senior citizen will be notified that their appointment
                  has been approved.
                </span>
              )}
              {pendingStatusChange?.newStatus === 'cancelled' && (
                <span className="text-sm text-red-700">
                  ❌ The senior citizen will be notified that their appointment
                  has been rejected.
                </span>
              )}
              {pendingStatusChange?.newStatus === 'completed' && (
                <span className="text-sm text-blue-700">
                  ✅ This appointment will be marked as completed and archived.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isSubmitting}
              onClick={() => {
                setIsStatusConfirmDialogOpen(false);
                setPendingStatusChange(null);
              }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusUpdate}
              disabled={isSubmitting}
              className={
                pendingStatusChange?.newStatus === 'approved'
                  ? 'bg-green-600 hover:bg-green-700'
                  : pendingStatusChange?.newStatus === 'cancelled'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {pendingStatusChange?.newStatus === 'approved' && (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Approve Appointment
                    </>
                  )}
                  {pendingStatusChange?.newStatus === 'cancelled' && (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Reject Appointment
                    </>
                  )}
                  {pendingStatusChange?.newStatus === 'completed' && (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Appointment
                    </>
                  )}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
