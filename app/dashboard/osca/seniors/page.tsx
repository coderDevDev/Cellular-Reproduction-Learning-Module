'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { SeniorCitizensTable } from '@/components/seniors/senior-citizens-table';
import { AddSeniorModal } from '@/components/seniors/add-senior-modal';
import { EditSeniorModal } from '@/components/seniors/edit-senior-modal';
import { ViewSeniorModal } from '@/components/seniors/view-senior-modal';
import { DeleteSeniorDialog } from '@/components/seniors/delete-senior-dialog';
import type { SeniorCitizen } from '@/types/property';

export default function OSCASeniorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [barangayFilter, setBarangayFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSenior, setSelectedSenior] = useState<SeniorCitizen | null>(
    null
  );
  const [seniors, setSeniors] = useState<SeniorCitizen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch seniors data from the database
  const fetchSeniors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { SeniorCitizensAPI } = await import('@/lib/api/senior-citizens');
      const result = await SeniorCitizensAPI.getAllSeniorCitizens(
        barangayFilter !== 'all' ? barangayFilter : undefined
      );

      console.log({ result });
      if (result.success && result.data) {
        // Transform database data to match our SeniorCitizen type
        const transformedSeniors: SeniorCitizen[] = result.data.map(
          (dbSenior: any) => ({
            id: dbSenior.id,
            userId: dbSenior.user_id,
            firstName: dbSenior.first_name,
            lastName: dbSenior.last_name,
            barangay: dbSenior.barangay,
            barangayCode: dbSenior.barangay_code,
            // Reconstruct address data from codes
            addressData: {
              region: dbSenior.region_code
                ? { region_code: dbSenior.region_code, region_name: '' }
                : undefined,
              province: dbSenior.province_code
                ? { province_code: dbSenior.province_code, province_name: '' }
                : undefined,
              city: dbSenior.city_code
                ? { city_code: dbSenior.city_code, city_name: '' }
                : undefined,
              barangay: dbSenior.barangay_code
                ? {
                    brgy_code: dbSenior.barangay_code,
                    brgy_name: dbSenior.barangay
                  }
                : undefined
            },
            dateOfBirth: dbSenior.date_of_birth,
            gender: dbSenior.gender,
            address: dbSenior.address,
            contactPerson: dbSenior.contact_person,
            contactPhone: dbSenior.contact_phone,
            contactRelationship: dbSenior.contact_relationship,
            medicalConditions: dbSenior.medical_conditions || [],
            medications: dbSenior.medications || [],
            emergencyContactName: dbSenior.emergency_contact_name,
            emergencyContactPhone: dbSenior.emergency_contact_phone,
            emergencyContactRelationship:
              dbSenior.emergency_contact_relationship,
            oscaId: dbSenior.osca_id,
            seniorIdPhoto: dbSenior.senior_id_photo,
            profilePicture: dbSenior.profile_picture,
            documents: dbSenior.documents || [],
            status: dbSenior.status,
            registrationDate: dbSenior.registration_date,
            lastMedicalCheckup: dbSenior.last_medical_checkup,
            notes: dbSenior.notes,
            housingCondition: dbSenior.housing_condition,
            physicalHealthCondition: dbSenior.physical_health_condition,
            monthlyIncome: dbSenior.monthly_income,
            monthlyPension: dbSenior.monthly_pension,
            livingCondition: dbSenior.living_condition,
            beneficiaries: dbSenior.beneficiaries || [],
            createdAt: dbSenior.created_at,
            updatedAt: dbSenior.updated_at,
            createdBy: dbSenior.created_by,
            updatedBy: dbSenior.updated_by,
            // Add user data if available
            // firstName: dbSenior.users?.first_name,
            // lastName: dbSenior.users?.last_name,
            email: dbSenior.users?.email,
            phone: dbSenior.users?.phone
          })
        );

        setSeniors(transformedSeniors);
        setIsLoading(false);
      } else {
        throw new Error('Failed to fetch seniors data');
      }
    } catch (error) {
      console.error('Error fetching seniors:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
      setSeniors([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchSeniors();
  }, [barangayFilter]);

  // Mock data for fallback demonstration (remove when database is fully set up)
  const mockSeniors: SeniorCitizen[] = [
    {
      id: '1',
      userId: 'user1',
      barangay: 'Barangay 1',
      barangayCode: 'BG001',
      dateOfBirth: '1950-03-15',
      gender: 'female',
      address: '123 Main Street, City',
      contactPerson: 'Maria Santos Jr.',
      contactPhone: '+639123456789',
      contactRelationship: 'Daughter',
      medicalConditions: ['Hypertension', 'Diabetes'],
      medications: ['Metformin', 'Amlodipine'],
      emergencyContactName: 'Juan Santos',
      emergencyContactPhone: '+639123456788',
      emergencyContactRelationship: 'Son',
      oscaId: 'OSCA-2024-001',
      seniorIdPhoto:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk9TQ0EgU2VuaW9yIENpdGl6ZW4gSUQ8L3RleHQ+Cjx0ZXh0IHg9IjE1MCIgeT0iMjMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1hcmlhIFNhbnRvczwvdGV4dD4KPHN2Zz4K',
      documents: ['OSCA ID', 'Medical Certificate'],
      status: 'active',
      registrationDate: '2024-01-15',
      lastMedicalCheckup: '2024-01-10',
      notes: 'Regular checkup needed',
      // New fields
      housingCondition: 'owned',
      physicalHealthCondition: 'good',
      monthlyIncome: 25000,
      monthlyPension: 15000,
      livingCondition: 'with_family',
      beneficiaries: [
        {
          id: 'ben1',
          seniorCitizenId: '1',
          name: 'Maria Santos Jr.',
          relationship: 'Daughter',
          dateOfBirth: '1980-05-20',
          gender: 'female',
          address: '123 Main Street, City',
          contactPhone: '+639123456789',
          occupation: 'Teacher',
          monthlyIncome: 35000,
          isDependent: false,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 'ben2',
          seniorCitizenId: '1',
          name: 'Juan Santos',
          relationship: 'Son',
          dateOfBirth: '1982-08-15',
          gender: 'male',
          address: '456 Oak Avenue, City',
          contactPhone: '+639123456788',
          occupation: 'Engineer',
          monthlyIncome: 45000,
          isDependent: false,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        }
      ],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'admin1',
      updatedBy: 'admin1'
    },
    {
      id: '2',
      userId: 'user2',
      barangay: 'Barangay 2',
      barangayCode: 'BG002',
      dateOfBirth: '1945-07-22',
      gender: 'male',
      address: '456 Oak Avenue, City',
      contactPerson: 'Ana Dela Cruz',
      contactPhone: '+639123456787',
      contactRelationship: 'Daughter',
      medicalConditions: ['Arthritis'],
      medications: ['Ibuprofen'],
      emergencyContactName: 'Pedro Dela Cruz',
      emergencyContactPhone: '+639123456786',
      emergencyContactRelationship: 'Son',
      oscaId: 'OSCA-2024-002',
      seniorIdPhoto:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk9TQ0EgU2VuaW9yIENpdGl6ZW4gSUQ8L3RleHQ+Cjx0ZXh0IHg9IjE1MCIgeT0iMjMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkp1YW4gRGVsYSBDcnV6PC90ZXh0Pgo8c3ZnPgo=',
      documents: ['OSCA ID'],
      status: 'active',
      registrationDate: '2024-01-10',
      lastMedicalCheckup: '2024-01-05',
      notes: 'Mobility assistance needed',
      // New fields
      housingCondition: 'rented',
      physicalHealthCondition: 'fair',
      monthlyIncome: 18000,
      monthlyPension: 12000,
      livingCondition: 'independent',
      beneficiaries: [
        {
          id: 'ben3',
          seniorCitizenId: '2',
          name: 'Ana Dela Cruz',
          relationship: 'Daughter',
          dateOfBirth: '1975-03-10',
          gender: 'female',
          address: '789 Pine Street, City',
          contactPhone: '+639123456787',
          occupation: 'Nurse',
          monthlyIncome: 40000,
          isDependent: false,
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z'
        }
      ],
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
      createdBy: 'admin1',
      updatedBy: 'admin1'
    },
    {
      id: '3',
      userId: 'user3',
      barangay: 'Barangay 3',
      barangayCode: 'BG003',
      dateOfBirth: '1955-12-08',
      gender: 'female',
      address: '789 Pine Street, City',
      contactPerson: 'Carlos Reyes',
      contactPhone: '+639123456785',
      contactRelationship: 'Son',
      medicalConditions: ['Heart Disease'],
      medications: ['Aspirin', 'Lisinopril'],
      emergencyContactName: 'Sofia Reyes',
      emergencyContactPhone: '+639123456784',
      emergencyContactRelationship: 'Daughter',
      oscaId: 'OSCA-2024-003',
      seniorIdPhoto:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk9TQ0EgU2VuaW9yIENpdGl6ZW4gSUQ8L3RleHQ+Cjx0ZXh0IHg9IjE1MCIgeT0iMjMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFuYSBSZXllczwvdGV4dD4KPHN2Zz4K',
      documents: ['OSCA ID', 'Medical Certificate', 'Heart Specialist Report'],
      status: 'active',
      registrationDate: '2024-01-08',
      lastMedicalCheckup: '2024-01-03',
      notes: 'Cardiac monitoring required',
      // New fields
      housingCondition: 'with_family',
      physicalHealthCondition: 'poor',
      monthlyIncome: 15000,
      monthlyPension: 10000,
      livingCondition: 'with_caregiver',
      beneficiaries: [
        {
          id: 'ben4',
          seniorCitizenId: '3',
          name: 'Carlos Reyes',
          relationship: 'Son',
          dateOfBirth: '1985-06-25',
          gender: 'male',
          address: '321 Elm Street, City',
          contactPhone: '+639123456785',
          occupation: 'Doctor',
          monthlyIncome: 60000,
          isDependent: false,
          createdAt: '2024-01-08T10:00:00Z',
          updatedAt: '2024-01-08T10:00:00Z'
        },
        {
          id: 'ben5',
          seniorCitizenId: '3',
          name: 'Sofia Reyes',
          relationship: 'Daughter',
          dateOfBirth: '1988-09-12',
          gender: 'female',
          address: '654 Maple Street, City',
          contactPhone: '+639123456784',
          occupation: 'Accountant',
          monthlyIncome: 38000,
          isDependent: false,
          createdAt: '2024-01-08T10:00:00Z',
          updatedAt: '2024-01-08T10:00:00Z'
        }
      ],
      createdAt: '2024-01-08T10:00:00Z',
      updatedAt: '2024-01-08T10:00:00Z',
      createdBy: 'admin1',
      updatedBy: 'admin1'
    }
  ];

  // Calculate dynamic stats from real data
  const calculateStats = () => {
    const totalSeniors = seniors.length;
    const activeSeniors = seniors.filter(s => s.status === 'active').length;
    const inactiveSeniors = seniors.filter(s => s.status === 'inactive').length;
    const deceasedSeniors = seniors.filter(s => s.status === 'deceased').length;

    // Calculate new this month (seniors registered in current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = seniors.filter(s => {
      const regDate = new Date(s.registrationDate || s.createdAt);
      return (
        regDate.getMonth() === currentMonth &&
        regDate.getFullYear() === currentYear
      );
    }).length;

    return [
      {
        title: 'Total Seniors',
        value: totalSeniors.toLocaleString(),
        change: `${totalSeniors > 0 ? '+' : ''}${totalSeniors}`,
        icon: Users,
        color: 'bg-[#00af8f]',
        textColor: 'text-[#00af8f]'
      },
      {
        title: 'Active Seniors',
        value: activeSeniors.toLocaleString(),
        change: `${Math.round(
          (activeSeniors / Math.max(totalSeniors, 1)) * 100
        )}%`,
        icon: UserPlus,
        color: 'bg-[#00af8f]',
        textColor: 'text-[#00af8f]'
      },
      {
        title: 'New This Month',
        value: newThisMonth.toLocaleString(),
        change: `+${newThisMonth}`,
        icon: Calendar,
        color: 'bg-[#ffd416]',
        textColor: 'text-[#ffd416]'
      },
      {
        title: 'Inactive/Deceased',
        value: (inactiveSeniors + deceasedSeniors).toLocaleString(),
        change: `${inactiveSeniors} inactive, ${deceasedSeniors} deceased`,
        icon: FileText,
        color: 'bg-red-500',
        textColor: 'text-red-500'
      }
    ];
  };

  const stats = calculateStats();

  const handleAddSenior = () => {
    setIsAddModalOpen(true);
  };

  const handleEditSenior = (senior: SeniorCitizen) => {
    setSelectedSenior(senior);
    setIsEditModalOpen(true);
  };

  const handleViewSenior = (senior: SeniorCitizen) => {
    setSelectedSenior(senior);
    setIsViewModalOpen(true);
  };

  const handleDeleteSenior = (senior: SeniorCitizen) => {
    setSelectedSenior(senior);
    setIsDeleteDialogOpen(true);
  };

  const handleExportData = () => {
    // Export functionality
    console.log('Exporting senior citizens data...');
  };

  // Filter seniors based on search and filters
  const filteredSeniors = seniors.filter(senior => {
    const matchesSearch =
      searchQuery === '' ||
      `${senior.firstName} ${senior.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      senior.oscaId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      senior.barangay.toLowerCase().includes(searchQuery.toLowerCase()) ||
      senior.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || senior.status === statusFilter;

    const matchesBarangay =
      barangayFilter === 'all' || senior.barangay === barangayFilter;

    return matchesSearch && matchesStatus && matchesBarangay;
  });

  // Get unique barangays for filter dropdown
  const uniqueBarangays = Array.from(
    new Set(seniors.map(s => s.barangay))
  ).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#333333]">Senior Citizens</h1>
          <p className="text-[#666666] mt-2">
            Manage and monitor all registered senior citizens
            {isLoading && (
              <span className="ml-2 text-[#00af8f]">Loading...</span>
            )}
            {!isLoading && (
              <span className="ml-2 text-[#00af8f]">
                ({filteredSeniors.length} records)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={isLoading || filteredSeniors.length === 0}
            className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/10 disabled:opacity-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={handleAddSenior}
            className="bg-[#00af8f] hover:bg-[#00af90] text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Add Senior Citizen
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#666666] uppercase tracking-wide">
                      {stat.title}
                    </p>
                    {isLoading ? (
                      <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mt-2"></div>
                    ) : (
                      <p className="text-3xl font-bold text-[#333333] mt-2">
                        {stat.value}
                      </p>
                    )}
                    {isLoading ? (
                      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                      <p
                        className={`text-sm font-medium ${stat.textColor} mt-1`}>
                        {stat.change}
                      </p>
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-2xl ${stat.color} bg-opacity-10 backdrop-blur-sm`}>
                    <Icon className={`w-7 h-7 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card className="border-0 bg-gradient-to-r from-white to-gray-50/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#666666] w-5 h-5" />
                <Input
                  placeholder="Search by name, OSCA ID, address, or barangay..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-2xl bg-white transition-all duration-200 placeholder:text-[#999999] hover:border-[#00af8f]/50"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] w-4 h-4 z-10" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-44 h-14 pl-10 border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-2xl bg-white">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-[#E0DDD8] shadow-lg">
                    <SelectItem
                      value="all"
                      className="rounded-lg hover:bg-[#00af8f]/5">
                      All Status
                    </SelectItem>
                    <SelectItem
                      value="active"
                      className="rounded-lg hover:bg-[#00af8f]/5">
                      Active
                    </SelectItem>
                    <SelectItem
                      value="inactive"
                      className="rounded-lg hover:bg-[#00af8f]/5">
                      Inactive
                    </SelectItem>
                    <SelectItem
                      value="deceased"
                      className="rounded-lg hover:bg-[#00af8f]/5">
                      Deceased
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] w-4 h-4 z-10" />
                <Select
                  value={barangayFilter}
                  onValueChange={setBarangayFilter}>
                  <SelectTrigger className="w-44 h-14 pl-10 border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-2xl bg-white">
                    <SelectValue placeholder="Filter by Barangay" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-[#E0DDD8] shadow-lg">
                    <SelectItem
                      value="all"
                      className="rounded-lg hover:bg-[#00af8f]/5">
                      All Barangays
                    </SelectItem>
                    {uniqueBarangays.map(barangay => (
                      <SelectItem
                        key={barangay}
                        value={barangay}
                        className="rounded-lg hover:bg-[#00af8f]/5">
                        {barangay}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Search Results Summary */}
          {searchQuery && (
            <div className="mt-4 p-3 bg-[#00af8f]/5 rounded-xl border border-[#00af8f]/20">
              <p className="text-sm text-[#00af8f] font-medium">
                Found {filteredSeniors.length} result
                {filteredSeniors.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Senior Citizens Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#00af8f]/5 to-[#00af90]/5 border-b border-[#E0DDD8]/30">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00af8f]/10 rounded-xl">
                <Users className="w-6 h-6 text-[#00af8f]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#333333]">
                  Senior Citizens Database
                </h3>
                <p className="text-sm text-[#666666] mt-1">
                  {isLoading ? (
                    <span className="animate-pulse">Loading records...</span>
                  ) : (
                    `${filteredSeniors.length} of ${seniors.length} records displayed`
                  )}
                </p>
              </div>
            </div>
            {!isLoading && seniors.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-[#00af8f]/10 text-[#00af8f] px-3 py-1">
                {filteredSeniors.length} Records
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-[#333333] mb-2">
                Error Loading Data
              </h3>
              <p className="text-[#666666] mb-4">{error}</p>
              <Button
                onClick={fetchSeniors}
                className="bg-[#00af8f] hover:bg-[#00af90] text-white">
                Try Again
              </Button>
            </div>
          ) : isLoading ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-[#00af8f]/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Users className="w-8 h-8 text-[#00af8f]" />
              </div>
              <h3 className="text-lg font-semibold text-[#333333] mb-2">
                Loading Senior Citizens
              </h3>
              <p className="text-[#666666]">
                Please wait while we fetch the data...
              </p>
              <div className="mt-4 flex justify-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#00af8f] rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-[#00af8f] rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}></div>
                  <div
                    className="w-2 h-2 bg-[#00af8f] rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          ) : filteredSeniors.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-[#00af8f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {seniors.length === 0 ? (
                  <UserPlus className="w-8 h-8 text-[#00af8f]" />
                ) : (
                  <Search className="w-8 h-8 text-[#00af8f]" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-[#333333] mb-2">
                {seniors.length === 0
                  ? 'No Senior Citizens Yet'
                  : 'No Results Found'}
              </h3>
              <p className="text-[#666666] mb-4">
                {seniors.length === 0
                  ? 'Start by adding your first senior citizen to the database.'
                  : searchQuery
                  ? `No senior citizens match "${searchQuery}". Try adjusting your search terms.`
                  : 'No senior citizens match the selected filters. Try changing your filter options.'}
              </p>
              {seniors.length === 0 ? (
                <Button
                  onClick={handleAddSenior}
                  className="bg-[#00af8f] hover:bg-[#00af90] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Senior Citizen
                </Button>
              ) : (
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setBarangayFilter('all');
                    }}
                    className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5">
                    Clear Filters
                  </Button>
                  <Button
                    onClick={handleAddSenior}
                    className="bg-[#00af8f] hover:bg-[#00af90] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Senior Citizen
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <SeniorCitizensTable
                seniors={filteredSeniors}
                onEdit={handleEditSenior}
                onView={handleViewSenior}
                onDelete={handleDeleteSenior}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals and Dialogs */}
      <AddSeniorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          // Refresh data after successful addition
          fetchSeniors();
        }}
      />

      {selectedSenior && (
        <>
          <EditSeniorModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            senior={selectedSenior}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedSenior(null);
              // Refresh data after successful edit
              fetchSeniors();
            }}
          />

          <ViewSeniorModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            senior={selectedSenior}
          />

          <DeleteSeniorDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            senior={selectedSenior}
            onSuccess={() => {
              setIsDeleteDialogOpen(false);
              setSelectedSenior(null);
              // Refresh data after successful deletion
              fetchSeniors();
            }}
          />
        </>
      )}
    </div>
  );
}
