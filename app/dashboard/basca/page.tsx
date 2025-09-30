'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Users,
  UserPlus,
  AlertTriangle,
  Bell,
  TrendingUp,
  FileText,
  Calendar,
  MapPin,
  Activity,
  CheckCircle,
  GraduationCap,
  BarChart3,
  Search,
  Filter,
  Plus,
  Download,
  Home,
  Menu,
  X,
  ChevronRight,
  Phone,
  Mail,
  Clock,
  Database,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
  Eye
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  BascaMembersTable,
  AddBascaMemberModal,
  EditBascaMemberModal,
  ViewBascaMemberModal,
  DeleteBascaMemberDialog
} from '@/components/basca';
import { AddSeniorMobile, ViewSeniorModal } from '@/components/seniors';
import { useAuth } from '@/hooks/useAuth';
import { BascaMembersAPI } from '@/lib/api/basca-members';
import { SeniorCitizensAPI } from '@/lib/api/senior-citizens';
import { useToast } from '@/hooks/use-toast';
import type { BascaMember } from '@/types/basca';
import type { SeniorCitizen } from '@/types/property';
import { Skeleton } from '@/components/ui/skeleton';
import { MiniPWAStatus } from '@/components/ui/pwa-status';
import { getOfflineDB } from '@/lib/db/offline-db';
import { usePWA } from '@/hooks/usePWA';

export default function BASCADashboard() {
  const { toast } = useToast();
  const { isOnline, offlineQueue, syncInProgress, syncOfflineData } = usePWA();
  const { authState } = useAuth();
  const [bascaMembers, setBascaMembers] = useState<BascaMember[]>([]);
  const [seniorCitizens, setSeniorCitizens] = useState<SeniorCitizen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSeniorModalOpen, setIsSeniorModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<BascaMember | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [barangayFilter, setBarangayFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedSenior, setSelectedSenior] = useState<any | null>(null);
  const [isViewSeniorOpen, setIsViewSeniorOpen] = useState(false);
  const [isEditSeniorOpen, setIsEditSeniorOpen] = useState(false);
  const [offlineSeniors, setOfflineSeniors] = useState<any[]>([]);
  const [isLoadingOffline, setIsLoadingOffline] = useState(false);

  // Field resolvers to support both camelCase (app model) and snake_case (DB),
  // plus joined `users` fields from the API.
  const getFirstName = (s: any) =>
    s?.firstName ?? s?.first_name ?? s?.users?.first_name ?? '';
  const getLastName = (s: any) =>
    s?.lastName ?? s?.last_name ?? s?.users?.last_name ?? '';
  const getFullName = (s: any) => `${getFirstName(s)} ${getLastName(s)}`.trim();
  const getEmail = (s: any) => s?.email ?? s?.users?.email ?? '';
  const getPhone = (s: any) =>
    s?.phone ?? s?.users?.phone ?? s?.contactPhone ?? '';
  const getGender = (s: any) => s?.gender ?? '';
  const getDOB = (s: any) => s?.dateOfBirth ?? s?.date_of_birth ?? '';
  const getBarangay = (s: any) => s?.barangay ?? '';
  const getAddress = (s: any) => s?.address ?? '';
  const getRegistrationDate = (s: any) =>
    s?.registrationDate ?? s?.registration_date ?? s?.created_at ?? '';
  const getOSCAId = (s: any) => s?.oscaId ?? s?.osca_id ?? '';
  const getMonthlyIncome = (s: any) =>
    s?.monthlyIncome ?? s?.monthly_income ?? '';
  const getMonthlyPension = (s: any) =>
    s?.monthlyPension ?? s?.monthly_pension ?? '';
  const getStatus = (s: any) => s?.status ?? 'active';
  const getProfilePicture = (s: any) =>
    s?.profilePicture ?? s?.profile_picture ?? '';

  // Normalize a DB record to our SeniorCitizen interface for view modal
  const mapSeniorRecordToModel = (s: any): SeniorCitizen => ({
    id: s.id,
    userId: s.user_id ?? s.userId,
    firstName: getFirstName(s) || undefined,
    lastName: getLastName(s) || undefined,
    email: getEmail(s) || undefined,
    phone: getPhone(s) || undefined,
    barangay: getBarangay(s) || '',
    barangayCode: s.barangayCode ?? s.barangay_code ?? '',
    dateOfBirth: (getDOB(s) as string) || '',
    gender: (getGender(s) as any) || 'other',
    address: getAddress(s) || '',
    addressData: undefined,
    contactPerson: s.contactPerson ?? s.contact_person ?? undefined,
    contactPhone: s.contactPhone ?? s.contact_phone ?? undefined,
    contactRelationship:
      s.contactRelationship ?? s.contact_relationship ?? undefined,
    medicalConditions: s.medicalConditions ?? s.medical_conditions ?? [],
    medications: s.medications ?? [],
    emergencyContactName:
      s.emergencyContactName ?? s.emergency_contact_name ?? undefined,
    emergencyContactPhone:
      s.emergencyContactPhone ?? s.emergency_contact_phone ?? undefined,
    emergencyContactRelationship:
      s.emergencyContactRelationship ??
      s.emergency_contact_relationship ??
      undefined,
    oscaId: s.oscaId ?? s.osca_id ?? undefined,
    seniorIdPhoto: s.seniorIdPhoto ?? s.senior_id_photo ?? undefined,
    profilePicture: getProfilePicture(s) || undefined,
    documents: s.documents ?? [],
    status: getStatus(s) as any,
    registrationDate:
      (getRegistrationDate(s) as string) || new Date().toISOString(),
    lastMedicalCheckup: s.lastMedicalCheckup ?? undefined,
    notes: s.notes ?? undefined,
    housingCondition: s.housingCondition ?? s.housing_condition ?? 'owned',
    physicalHealthCondition:
      s.physicalHealthCondition ?? s.physical_health_condition ?? 'good',
    monthlyIncome: Number(getMonthlyIncome(s) || 0),
    monthlyPension: Number(getMonthlyPension(s) || 0),
    livingCondition: s.livingCondition ?? s.living_condition ?? 'independent',
    beneficiaries: (s.beneficiaries || []).map((b: any) => ({
      id: b.id ?? '',
      seniorCitizenId: b.senior_citizen_id ?? b.seniorCitizenId ?? '',
      name: b.name,
      relationship: b.relationship,
      dateOfBirth: b.dateOfBirth ?? b.date_of_birth ?? '',
      gender: b.gender,
      address: b.address,
      contactPhone: b.contactPhone ?? b.contact_phone,
      occupation: b.occupation,
      monthlyIncome: b.monthlyIncome ?? b.monthly_income,
      isDependent: b.isDependent ?? b.is_dependent,
      createdAt: b.created_at ?? b.createdAt ?? '',
      updatedAt: b.updated_at ?? b.updatedAt ?? ''
    })),
    createdAt: s.created_at ?? s.createdAt ?? new Date().toISOString(),
    updatedAt: s.updated_at ?? s.updatedAt ?? new Date().toISOString(),
    createdBy: s.created_by ?? s.createdBy ?? undefined,
    updatedBy: s.updated_by ?? s.updatedBy ?? undefined
  });

  const handleViewSenior = (senior: any) => {
    setSelectedSenior(senior);
    setIsViewSeniorOpen(true);
  };

  const handleEditSenior = (senior: any) => {
    setSelectedSenior(senior);
    setIsEditSeniorOpen(true);
  };

  useEffect(() => {
    fetchBascaMembers();
    fetchSeniorCitizens();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    if (activeTab === 'offline') {
      loadOfflineSeniors();
    }
  }, [activeTab]);

  const loadOfflineSeniors = async () => {
    try {
      setIsLoadingOffline(true);
      const db = await getOfflineDB();
      const seniors = await db.getSeniors();
      setOfflineSeniors(seniors);
    } catch (e) {
      console.error('Failed to load offline seniors', e);
    } finally {
      setIsLoadingOffline(false);
    }
  };

  const fetchBascaMembers = async () => {
    try {
      const members = await BascaMembersAPI.getAllBascaMembers();
      setBascaMembers(members);
    } catch (error) {
      console.error('Error fetching basca members:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch basca members',
        variant: 'destructive'
      });
    }
  };

  const fetchSeniorCitizens = async () => {
    try {
      setIsLoading(true);
      const result = await SeniorCitizensAPI.getAllSeniorCitizens();
      if (result.success) {
        setSeniorCitizens(result.data);
      } else {
        throw new Error('Failed to fetch senior citizens');
      }
    } catch (error) {
      console.error('Error fetching senior citizens:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch senior citizens',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchBascaMembers(), fetchSeniorCitizens()]);
    setIsRefreshing(false);
    toast({
      title: 'Success',
      description: 'Dashboard refreshed successfully',
      variant: 'default'
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() && !recentSearches.includes(term.trim())) {
      setRecentSearches(prev => [term.trim(), ...prev.slice(0, 4)]);
    }
    setShowSearchSuggestions(false);
  };

  const handleSearchFocus = () => {
    if (recentSearches.length > 0) {
      setShowSearchSuggestions(true);
    }
  };

  const handleAddMember = () => {
    setIsAddModalOpen(true);
  };

  const handleAddSenior = () => {
    setIsSeniorModalOpen(true);
  };

  const handleEditMember = (member: BascaMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleViewMember = (member: BascaMember) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const handleDeleteMember = (member: BascaMember) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const handleMemberSuccess = () => {
    fetchBascaMembers();
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedMember(null);
  };

  const calculateStats = () => {
    const total = seniorCitizens.length;
    const active = seniorCitizens.filter(s => s.status === 'active').length;
    const inactive = total - active;
    const newThisMonth = seniorCitizens.filter(s => {
      const registrationDate = new Date(s.registrationDate);
      const now = new Date();
      return (
        registrationDate.getMonth() === now.getMonth() &&
        registrationDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return { total, active, inactive, newThisMonth };
  };

  // Utility functions for pagination and export
  const getFilteredSeniors = () => {
    return seniorCitizens.filter(senior => {
      const name = getFullName(senior).toLowerCase();
      const matchesSearch =
        searchTerm === '' || name.includes(searchTerm.toLowerCase());
      const status = getStatus(senior);
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && status === 'active') ||
        (filterStatus === 'inactive' && status !== 'active');
      return matchesSearch && matchesStatus;
    });
  };

  const getPaginatedSeniors = () => {
    const filtered = getFilteredSeniors();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(getFilteredSeniors().length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const exportToCSV = () => {
    const filteredSeniors = getFilteredSeniors();
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Barangay',
      'Address',
      'Gender',
      'Date of Birth',
      'Status',
      'Registration Date',
      'OSCA ID',
      'Monthly Income',
      'Monthly Pension'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredSeniors.map(senior =>
        [
          getFullName(senior),
          getEmail(senior),
          getPhone(senior),
          getBarangay(senior),
          getAddress(senior),
          getGender(senior),
          getDOB(senior),
          getStatus(senior),
          getRegistrationDate(senior),
          getOSCAId(senior),
          getMonthlyIncome(senior),
          getMonthlyPension(senior)
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `senior_citizens_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = calculateStats();

  const navigationTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'registrations', label: 'Senior Citizens', icon: UserPlus },
    { id: 'seniors', label: 'Manage Seniors', icon: Users },
    { id: 'offline', label: 'Offline Data', icon: Database },
    { id: 'sync', label: 'Sync Status', icon: Activity },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  const quickActions = [
    {
      title: 'New Senior',
      icon: UserPlus,
      action: handleAddSenior,
      color: 'bg-[#00af8f]'
    },
    {
      title: 'Offline Mode',
      icon: Database,
      action: () => setActiveTab('offline'),
      color: 'bg-[#ffd416]'
    },
    {
      title: 'Sync Data',
      icon: Activity,
      action: () => setActiveTab('sync'),
      color: 'bg-[#ff6b6b]'
    },
    {
      title: 'View Seniors',
      icon: Users,
      action: () => setActiveTab('seniors'),
      color: 'bg-[#4ecdc4]'
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">
              Welcome back, {authState.user?.firstName || 'User'}!
            </h2>
            <p className="text-[#e0f2f1] text-xs mb-2">
              Here's what's happening with BASCA today
            </p>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3 h-3 text-[#e0f2f1]" />
              <span className="text-xs text-[#e0f2f1]">
                Assigned to: {authState.user?.barangay || 'Unknown Barangay'}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <Card className="border-0 bg-white shadow-md rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#00af8f]/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#00af8f]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#333333] text-sm">
                {authState.user?.firstName} {authState.user?.lastName}
              </h3>
              <p className="text-xs text-[#666666]">{authState.user?.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <MapPin className="w-3 h-3 text-[#00af8f]" />
                <span className="text-xs text-[#00af8f] font-medium">
                  {authState.user?.barangay || 'Unknown Barangay'}
                </span>
              </div>
            </div>
            <Badge className="bg-[#00af8f] text-white text-xs px-2 py-1">
              BASCA Staff
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666] font-medium">
                  Total Seniors
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-[#333333]">
                    {stats.total}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-[#00af8f]/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-[#00af8f]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666] font-medium">Active</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-[#333333]">
                    {stats.active}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-[#ffd416]/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#ffd416]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666] font-medium">
                  New This Month
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-[#333333]">
                    {stats.newThisMonth}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-[#00af8f]/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#00af8f]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666] font-medium">Inactive</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-[#333333]">
                    {stats.inactive}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
                onClick={action.action}>
                <CardContent className="p-4 h-20 flex flex-col items-center justify-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color} bg-opacity-10`}>
                    <Icon
                      className={`w-5 h-5 ${action.color.replace(
                        'bg-',
                        'text-'
                      )}`}
                    />
                  </div>
                  <span className="text-xs font-medium text-[#333333] text-center leading-tight">
                    {action.title}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {/* <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Recent Activity
        </h3>
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-[#00af8f]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">
                    New member registered
                  </p>
                  <p className="text-xs text-[#666666]">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#ffd416]/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#ffd416]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">
                    Meeting scheduled
                  </p>
                  <p className="text-xs text-[#666666]">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#ff6b6b]/10 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#ff6b6b]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">
                    Report generated
                  </p>
                  <p className="text-xs text-[#666666]">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );

  const renderMembers = () => (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="sticky top-2 z-10">
        <div className="bg-white/80 backdrop-blur border border-gray-200/60 shadow-sm rounded-2xl p-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8391a2] w-4 h-4" />
              <Input
                placeholder="Search seniors by name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={handleSearchFocus}
                className="pl-10 h-10 text-sm border-gray-200 focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/10 rounded-xl bg-white"
              />

              {/* Search Suggestions */}
              {showSearchSuggestions && recentSearches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  <div className="p-2">
                    <p className="text-xs text-[#666666] font-medium mb-2 px-2">
                      Recent Searches
                    </p>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="w-full text-left px-3 py-2 text-sm text-[#333333] hover:bg-gray-50 rounded-lg transition-colors">
                        <Search className="w-3 h-3 inline mr-2 text-[#666666]" />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className="h-9 rounded-full text-xs">
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
                className="h-9 rounded-full text-xs">
                Active
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
                className="h-9 rounded-full text-xs">
                Inactive
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="bg-gray-100 rounded-lg p-1 flex">
                {/* <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('cards')}
                  className="h-9 w-9 rounded-md">
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('table')}
                  className="h-9 w-9 rounded-md">
                  <TableIcon className="w-4 h-4" />
                </Button> */}
              </div>

              {/* <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="h-9 rounded-lg text-xs border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f] hover:text-white">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button> */}

              {/* <Button
                onClick={handleAddSenior}
                size="sm"
                className="h-9 rounded-lg bg-[#00af8f] hover:bg-[#00af90] text-white text-xs">
                <UserPlus className="w-4 h-4 mr-1" />
                Add Senior
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Senior Citizens List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00af8f] mx-auto mb-3"></div>
            <p className="text-[#666666] text-sm">Loading senior citizens...</p>
          </div>
        </div>
      ) : seniorCitizens.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-[#00af8f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-[#00af8f]" />
          </div>
          <h3 className="text-lg font-medium text-[#333333] mb-2">
            No senior citizens registered yet
          </h3>
          <p className="text-[#666666] mb-6 text-sm max-w-sm mx-auto">
            Start building your senior citizen database by registering the first
            person
          </p>
          <Button
            onClick={handleAddSenior}
            className="bg-[#00af8f] hover:bg-[#00af90] text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Register First Senior
          </Button>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div className="bg-white rounded-xl p-4 border border-gray-200/60 shadow-sm">
              <p className="text-[11px] uppercase tracking-wide text-[#8391a2] font-medium">
                Total
              </p>
              <p className="mt-1 text-2xl font-bold text-[#0f172a]">
                {
                  seniorCitizens.filter(senior => {
                    const matchesSearch =
                      searchTerm === '' ||
                      `${senior.firstName || ''} ${senior.lastName || ''}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());
                    const matchesStatus =
                      filterStatus === 'all' ||
                      (filterStatus === 'active' &&
                        senior.status === 'active') ||
                      (filterStatus === 'inactive' &&
                        senior.status !== 'active');
                    return matchesSearch && matchesStatus;
                  }).length
                }
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200/60 shadow-sm">
              <p className="text-[11px] uppercase tracking-wide text-[#8391a2] font-medium">
                Active
              </p>
              <p className="mt-1 text-2xl font-bold text-[#00af8f]">
                {
                  seniorCitizens.filter(senior => {
                    const matchesSearch =
                      searchTerm === '' ||
                      `${senior.firstName || ''} ${senior.lastName || ''}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());
                    const matchesStatus =
                      filterStatus === 'all' || filterStatus === 'active';
                    return (
                      matchesSearch &&
                      matchesStatus &&
                      senior.status === 'active'
                    );
                  }).length
                }
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200/60 shadow-sm">
              <p className="text-[11px] uppercase tracking-wide text-[#8391a2] font-medium">
                Inactive
              </p>
              <p className="mt-1 text-2xl font-bold text-[#64748b]">
                {
                  seniorCitizens.filter(senior => {
                    const matchesSearch =
                      searchTerm === '' ||
                      `${senior.firstName || ''} ${senior.lastName || ''}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());
                    const matchesStatus =
                      filterStatus === 'all' || filterStatus === 'inactive';
                    return (
                      matchesSearch &&
                      matchesStatus &&
                      senior.status !== 'active'
                    );
                  }).length
                }
              </p>
            </div>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'cards' ? (
            <div className="space-y-2">
              {seniorCitizens
                .filter(senior => {
                  const fullName = getFullName(senior).toLowerCase();
                  const matchesSearch =
                    searchTerm === '' ||
                    fullName.includes(searchTerm.toLowerCase());
                  const status = getStatus(senior);
                  const matchesStatus =
                    filterStatus === 'all' ||
                    (filterStatus === 'active' && status === 'active') ||
                    (filterStatus === 'inactive' && status !== 'active');
                  return matchesSearch && matchesStatus;
                })
                .map(senior => (
                  <Card
                    key={senior.id}
                    className="border border-gray-200/60 bg-white shadow-sm hover:shadow-md rounded-2xl cursor-pointer transition-all duration-200"
                    onClick={() => handleViewSenior(senior)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-xl">
                          <AvatarImage src={getProfilePicture(senior)} alt="" />
                          <AvatarFallback className="bg-[#00af8f]/10 text-[#00af8f]">
                            {`${getFirstName(senior)[0] ?? 'N'}${
                              getLastName(senior)[0] ?? 'A'
                            }`}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-[#0f172a] text-sm truncate">
                              {getFullName(senior) || 'Unnamed'}
                            </h3>
                            <Badge
                              variant={
                                getStatus(senior) === 'active'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className={`text-[10px] px-2 py-0.5 ${
                                getStatus(senior) === 'active'
                                  ? 'bg-[#00af8f]'
                                  : 'bg-gray-400'
                              }`}>
                              {getStatus(senior) === 'active'
                                ? 'Active'
                                : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-xs text-[#64748b] truncate">
                            {getEmail(senior) && getPhone(senior)
                              ? `${getEmail(senior)} • ${getPhone(senior)}`
                              : getEmail(senior) || getPhone(senior) || '—'}
                          </p>
                          <p className="text-[11px] text-[#94a3b8] truncate">
                            {getBarangay(senior) || '—'}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronRight className="w-4 h-4 text-[#94a3b8]" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                        Senior Citizen
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                        Registration
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {getPaginatedSeniors().map(senior => (
                      <tr
                        key={senior.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleViewSenior(senior)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-[#00af8f]" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[#333333]">
                                {getFullName(senior) || 'Unnamed'}
                              </div>
                              <div className="text-xs text-[#666666]">
                                {getGender(senior) || '—'}
                                {getDOB(senior)
                                  ? ` • ${new Date(
                                      getDOB(senior)
                                    ).toLocaleDateString()}`
                                  : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-[#333333]">
                            {getEmail(senior) || '—'}
                          </div>
                          <div className="text-xs text-[#666666]">
                            {getPhone(senior) || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-[#333333]">
                            {getBarangay(senior) || '—'}
                          </div>
                          <div className="text-xs text-[#666666] truncate max-w-24">
                            {getAddress(senior) || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              getStatus(senior) === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                            className={`text-xs px-2 py-1 ${
                              getStatus(senior) === 'active'
                                ? 'bg-[#00af8f]'
                                : 'bg-gray-400'
                            }`}>
                            {getStatus(senior) === 'active'
                              ? 'Active'
                              : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-[#333333]">
                            {getRegistrationDate(senior)
                              ? new Date(
                                  getRegistrationDate(senior)
                                ).toLocaleDateString()
                              : '—'}
                          </div>
                          <div className="text-xs text-[#666666]">
                            {getOSCAId(senior) || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={e => {
                                e.stopPropagation();
                                handleViewSenior(senior);
                              }}>
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={e => {
                                e.stopPropagation();
                                handleEditSenior(senior);
                              }}>
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[#666666]">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                      {Math.min(
                        currentPage * itemsPerPage,
                        getFilteredSeniors().length
                      )}{' '}
                      of {getFilteredSeniors().length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 px-3 text-xs">
                        Previous
                      </Button>

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? 'default' : 'outline'
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="h-8 w-8 p-0 text-xs">
                              {pageNum}
                            </Button>
                          );
                        }
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 px-3 text-xs">
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderRegistrations = () => (
    <div className="space-y-4">
      {/* Registration Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00af8f]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <UserPlus className="w-6 h-6 text-[#00af8f]" />
              </div>
              <p className="text-xs text-[#666666] font-medium">
                Total Senior Citizens
              </p>
              <p className="text-xl font-bold text-[#333333]">
                {isLoading ? '...' : seniorCitizens.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffd416]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-[#ffd416]" />
              </div>
              <p className="text-xs text-[#666666] font-medium">
                New Seniors This Month
              </p>
              <p className="text-xl font-bold text-[#333333]">
                {isLoading ? '...' : stats.newThisMonth}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Registration Actions */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={handleAddSenior}
            className="h-14 bg-[#00af8f] hover:bg-[#00af90] text-white rounded-xl shadow-md">
            <UserPlus className="w-5 h-5 mr-2" />
            Register New Senior Citizen
          </Button>
          <Button
            variant="outline"
            className="h-14 border-[#ffd416] text-[#ffd416] hover:bg-[#ffd416]/5 rounded-xl">
            <Database className="w-5 h-5 mr-2" />
            Offline Registration Mode
          </Button>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Recent Senior Citizens
        </h3>
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="space-y-3">
              {seniorCitizens.slice(0, 3).map(senior => (
                <div key={senior.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#00af8f]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#333333]">
                      {senior.firstName} {senior.lastName}
                    </p>
                    <p className="text-xs text-[#666666]">{senior.barangay}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-1 bg-[#00af8f] text-white">
                    {senior.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOffline = () => (
    <div className="space-y-4">
      {/* Offline Status */}
      <Card className="border-0 bg-white shadow-md rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
              <Database className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-[#333333]">
                {isOnline ? 'Online Mode' : 'Offline Mode'}
              </h3>
              <p className="text-xs text-[#666666]">
                {isOnline
                  ? 'Connected to central database'
                  : 'Working locally on this device'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Connection Status:</span>
              <Badge
                className={`${
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                } text-white text-xs`}>
                {isOnline ? 'Connected' : 'Offline'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Last Sync:</span>
              <span className="text-[#333333]">Just now</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Pending Sync:</span>
              <span className="text-[#333333]">
                {offlineQueue} {offlineQueue === 1 ? 'record' : 'records'}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={loadOfflineSeniors}
                disabled={isLoadingOffline}
                className="text-xs">
                {isLoadingOffline ? 'Refreshing…' : 'Refresh Offline Data'}
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  await syncOfflineData();
                  // Refresh the offline seniors list after sync
                  await loadOfflineSeniors();
                }}
                disabled={!isOnline || syncInProgress}
                className="text-xs bg-[#00af8f] hover:bg-[#00af90] text-white">
                {syncInProgress ? 'Syncing…' : 'Sync Now'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Seniors */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Offline Seniors
        </h3>
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            {isLoadingOffline ? (
              <div className="text-sm text-[#666666]">
                Loading offline entries…
              </div>
            ) : offlineSeniors.length === 0 ? (
              <div className="text-sm text-[#666666]">
                No offline entries found.
              </div>
            ) : (
              <div className="space-y-2">
                {offlineSeniors.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0">
                      <div className="font-medium text-[#333333] truncate">
                        {(s.firstName || s.first_name || 'Unnamed') +
                          ' ' +
                          (s.lastName || s.last_name || '')}
                      </div>
                      <div className="text-xs text-[#666666] truncate">
                        {s.barangay || '—'} • Updated{' '}
                        {new Date(
                          s.lastModified || s.updatedAt || Date.now()
                        ).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs bg-orange-500 text-white">
                        Pending Sync
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          setSelectedSenior(s);
                          setIsViewSeniorOpen(true);
                        }}>
                        <Eye className="w-3 h-3 mr-1" /> View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSync = () => (
    <div className="space-y-4">
      {/* Sync Status */}
      <Card className="border-0 bg-white shadow-md rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#00af8f]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#333333]">Sync Status</h3>
              <p className="text-xs text-[#666666]">
                Data synchronization overview
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Total Records:</span>
              <span className="text-[#333333]">{seniorCitizens.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Synced:</span>
              <span className="text-[#333333]">{seniorCitizens.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Pending:</span>
              <span className="text-[#333333]">0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Last Sync:</span>
              <span className="text-[#333333]">Just now</span>
            </div>

            {/* Sync Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#666666]">Sync Progress:</span>
                <span className="text-[#00af8f] font-medium">100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Actions */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Sync Actions
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <Button className="h-12 bg-[#00af8f] hover:bg-[#00af90] text-white rounded-xl">
            <Activity className="w-4 h-4 mr-2" />
            Sync All Data
          </Button>
          <Button
            variant="outline"
            className="h-12 border-[#ffd416] text-[#ffd416] hover:bg-[#ffd416]/5 rounded-xl">
            <Database className="w-4 h-4 mr-2" />
            View Sync History
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSeniors = () => (
    <div className="space-y-4">
      {/* Senior Citizens Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00af8f]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-[#00af8f]" />
              </div>
              <p className="text-xs text-[#666666] font-medium">
                Total Seniors
              </p>
              <p className="text-xl font-bold text-[#333333]">
                {isLoading ? '...' : seniorCitizens.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffd416]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-[#ffd416]" />
              </div>
              <p className="text-xs text-[#666666] font-medium">Active</p>
              <p className="text-xl font-bold text-[#333333]">
                {isLoading ? '...' : stats.active}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Senior Management Actions */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Management Actions
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={handleAddSenior}
            className="h-14 bg-[#00af8f] hover:bg-[#00af90] text-white rounded-xl shadow-md">
            <UserPlus className="w-5 h-5 mr-2" />
            Add New Senior Citizen
          </Button>
          <Button
            variant="outline"
            className="h-14 border-[#ffd416] text-[#ffd416] hover:bg-[#ffd416]/5 rounded-xl">
            <Users className="w-5 h-5 mr-2" />
            View All Seniors
          </Button>
          <Button
            variant="outline"
            className="h-14 border-[#ff6b6b] text-[#ff6b6b] hover:bg-[#ff6b6b]/5 rounded-xl">
            <FileText className="w-5 h-5 mr-2" />
            Generate Reports
          </Button>
        </div>
      </div>

      {/* Recent Senior Activities */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Recent Activities
        </h3>
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-[#00af8f]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">
                    New senior citizen registered
                  </p>
                  <p className="text-xs text-[#666666]">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#ffd416]/10 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#ffd416]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">
                    Document updated
                  </p>
                  <p className="text-xs text-[#666666]">Yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4">
      {/* Reports Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00af8f]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-6 h-6 text-[#00af8f]" />
              </div>
              <p className="text-xs text-[#666666] font-medium">
                Total Reports
              </p>
              <p className="text-xl font-bold text-[#333333]">12</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffd416]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-[#ffd416]" />
              </div>
              <p className="text-xs text-[#666666] font-medium">This Month</p>
              <p className="text-xl font-bold text-[#333333]">3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Generate Reports
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <Button className="h-14 bg-[#00af8f] hover:bg-[#00af90] text-white rounded-xl shadow-md">
            <BarChart3 className="w-5 h-5 mr-2" />
            Senior Citizen Summary
          </Button>
          <Button
            variant="outline"
            className="h-14 border-[#ffd416] text-[#ffd416] hover:bg-[#ffd416]/5 rounded-xl">
            <Users className="w-5 h-5 mr-2" />
            Registration Report
          </Button>
          <Button
            variant="outline"
            className="h-14 border-[#ff6b6b] text-[#ff6b6b] hover:bg-[#ff6b6b]/5 rounded-xl">
            <Calendar className="w-5 h-5 mr-2" />
            Monthly Statistics
          </Button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[#333333] px-1">
          Recent Reports
        </h3>
        <Card className="border-0 bg-white shadow-md rounded-xl">
          <CardContent className="p-3">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#00af8f]/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-[#00af8f]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">
                    Senior Citizen Summary
                  </p>
                  <p className="text-xs text-[#666666]">
                    Generated 2 hours ago
                  </p>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  View
                </Button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#ffd416]/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#ffd416]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333]">
                    Registration Report
                  </p>
                  <p className="text-xs text-[#666666]">Generated yesterday</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'registrations':
        return renderRegistrations();
      case 'seniors':
        return renderMembers();
      case 'offline':
        return renderOffline();
      case 'sync':
        return renderSync();
      case 'reports':
        return renderReports();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2">
              <Menu className="w-5 h-5" />
            </Button> */}
            <div>
              <h1 className="text-lg font-bold text-[#333333]">BASCA</h1>
              <p className="text-xs text-[#666666]">
                {authState.user?.firstName} {authState.user?.lastName}
              </p>
              <p className="text-xs text-[#00af8f] font-medium">
                {authState.user?.barangay || 'Unknown Barangay'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MiniPWAStatus />
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={handleRefresh}
              disabled={isRefreshing}>
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </Button>
            {/* <Button variant="ghost" size="sm" className="p-2">
              <Bell className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleAddSenior}
              size="sm"
              className="bg-[#00af8f] hover:bg-[#00af90] text-white text-xs px-3 py-2 h-8">
              <Plus className="w-3 h-3 mr-1" />
              Register Senior
            </Button> */}
          </div>
        </div>

        {/* Tab Navigation */}
        {/* <div className="px-3 pb-2">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {navigationTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 h-8 rounded-lg text-xs ${
                    isActive
                      ? 'bg-white text-[#00af8f] shadow-sm'
                      : 'text-[#666666] hover:text-[#333333]'
                  }`}>
                  <Icon className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="p-3">{renderContent()}</div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          onClick={handleAddSenior}
          className="w-14 h-14 rounded-full bg-[#00af8f] hover:bg-[#00af90] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
        <div className="flex justify-around px-2 py-3">
          {navigationTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center space-y-1.5 h-16 px-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-[#00af8f] bg-[#00af8f]/5'
                    : 'text-[#666666] hover:text-[#333333] hover:bg-gray-50'
                }`}>
                <div
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-[#00af8f]/10' : 'bg-transparent'
                  }`}>
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive ? 'scale-110' : 'scale-100'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-medium transition-all duration-200 ${
                    isActive ? 'text-[#00af8f]' : 'text-[#666666]'
                  }`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-[#00af8f] rounded-full mt-1" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Safe Area Indicator for iOS */}
        <div className="h-1 bg-gradient-to-r from-[#00af8f] via-[#ffd416] to-[#00af8f] opacity-20" />
      </div>

      {/* Modals */}
      <AddBascaMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleMemberSuccess}
      />

      <AddSeniorMobile
        isOpen={isSeniorModalOpen}
        onClose={() => setIsSeniorModalOpen(false)}
        onSuccess={() => {
          setIsSeniorModalOpen(false);
          // Refresh the data after successful registration
          fetchSeniorCitizens();
          toast({
            title: 'Success',
            description:
              'Senior citizen registered successfully. Check the console for login credentials.',
            variant: 'default'
          });
        }}
      />

      {/* Senior View */}
      {selectedSenior && (
        <ViewSeniorModal
          isOpen={isViewSeniorOpen}
          onClose={() => setIsViewSeniorOpen(false)}
          senior={mapSeniorRecordToModel(selectedSenior)}
          onEdit={() => {
            setIsViewSeniorOpen(false);
            setIsEditSeniorOpen(true);
          }}
        />
      )}

      {/* Senior Edit (reusing AddSeniorMobile) */}
      <AddSeniorMobile
        isOpen={isEditSeniorOpen}
        onClose={() => setIsEditSeniorOpen(false)}
        onSuccess={() => {
          setIsEditSeniorOpen(false);
          fetchSeniorCitizens();
          toast({
            title: 'Success',
            description: 'Senior citizen updated successfully.',
            variant: 'default'
          });
        }}
        mode="edit"
        initialData={selectedSenior}
      />
    </div>
  );
}
