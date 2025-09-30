'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Download
} from 'lucide-react';
import {
  BascaMembersTable,
  AddBascaMemberModal,
  EditBascaMemberModal,
  ViewBascaMemberModal,
  DeleteBascaMemberDialog
} from '@/components/basca';
import { BascaMembersAPI } from '@/lib/api/basca-members';
import { useToast } from '@/hooks/use-toast';
import type { BascaMember } from '@/types/basca';

export default function BASCADashboard() {
  const { toast } = useToast();
  const [bascaMembers, setBascaMembers] = useState<BascaMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<BascaMember | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [barangayFilter, setBarangayFilter] = useState<string>('all');

  useEffect(() => {
    fetchBascaMembers();
  }, []);

  const fetchBascaMembers = async () => {
    try {
      setIsLoading(true);
      const members = await BascaMembersAPI.getAllBascaMembers();
      setBascaMembers(members);

      console.log({ bascaMembers });
    } catch (error) {
      console.error('Error fetching basca members:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch basca members',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = () => {
    setIsAddModalOpen(true);
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
    const total = bascaMembers.length;
    const active = bascaMembers.filter(m => m.isActive).length;
    const inactive = total - active;
    const newThisMonth = bascaMembers.filter(m => {
      const joinDate = new Date(m.joinDate);
      const now = new Date();
      return (
        joinDate.getMonth() === now.getMonth() &&
        joinDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return { total, active, inactive, newThisMonth };
  };

  const stats = calculateStats();

  const statsData = [
    {
      title: 'Total Members',
      value: stats.total.toString(),
      change: '+0%',
      icon: Users,
      color: 'bg-[#00af8f]',
      textColor: 'text-[#00af8f]'
    },
    {
      title: 'Active Members',
      value: stats.active.toString(),
      change: '+0%',
      icon: CheckCircle,
      color: 'bg-[#ffd416]',
      textColor: 'text-[#ffd416]'
    },
    {
      title: 'New This Month',
      value: stats.newThisMonth.toString(),
      change: '+0%',
      icon: TrendingUp,
      color: 'bg-[#00af8f]',
      textColor: 'text-[#00af8f]'
    },
    {
      title: 'Inactive Members',
      value: stats.inactive.toString(),
      change: '+0%',
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-500'
    }
  ];

  // Get unique barangays for filter dropdown
  const uniqueBarangays = Array.from(
    new Set(bascaMembers.map(m => m.barangay))
  ).sort();

  // Filter members based on search and status
  const filteredMembers = bascaMembers.filter(member => {
    const matchesSearch =
      searchTerm === '' ||
      `${member.firstName} ${member.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      member.barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && member.isActive) ||
      (filterStatus === 'inactive' && !member.isActive);

    const matchesBarangay =
      barangayFilter === 'all' || member.barangay === barangayFilter;

    return matchesSearch && matchesStatus && matchesBarangay;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#333333]">BASCA Dashboard</h1>
          <p className="text-[#666666] mt-2">
            Welcome back! Here's what's happening with BASCA today.
            {isLoading && (
              <span className="ml-2 text-[#00af8f]">Loading...</span>
            )}
            {!isLoading && (
              <span className="ml-2 text-[#00af8f]">
                ({filteredMembers.length} members)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/10">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={handleAddMember}
            className="bg-[#00af8f] hover:bg-[#00af90] text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
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
                    <p className="text-3xl font-bold text-[#333333] mt-2">
                      {isLoading ? (
                        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className={`text-sm font-medium ${stat.textColor} mt-1`}>
                      {isLoading ? (
                        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        stat.change
                      )}
                    </p>
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

      {/* Quick Actions */}
      {/* <Card className="border-0 bg-gradient-to-r from-white to-gray-50/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#333333]">
            <Activity className="w-5 h-5 text-[#00af8f]" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-6 flex-col border-2 border-[#E0DDD8] hover:border-[#00af8f] hover:bg-[#00af8f]/5 rounded-2xl transition-all duration-200"
              onClick={handleAddMember}>
              <UserPlus className="w-8 h-8 mb-3 text-[#00af8f]" />
              <span className="text-sm font-medium">Add Member</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex-col border-2 border-[#E0DDD8] hover:border-[#00af8f] hover:bg-[#00af8f]/5 rounded-2xl transition-all duration-200">
              <Calendar className="w-8 h-8 mb-3 text-[#00af8f]" />
              <span className="text-sm font-medium">Schedule Meeting</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex-col border-2 border-[#E0DDD8] hover:border-[#00af8f] hover:bg-[#00af8f]/5 rounded-2xl transition-all duration-200">
              <GraduationCap className="w-8 h-8 mb-3 text-[#00af8f]" />
              <span className="text-sm font-medium">Plan Training</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex-col border-2 border-[#E0DDD8] hover:border-[#00af8f] hover:bg-[#00af8f]/5 rounded-2xl transition-all duration-200">
              <BarChart3 className="w-8 h-8 mb-3 text-[#00af8f]" />
              <span className="text-sm font-medium">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Member Management Section */}
      <Card className="border-0 bg-gradient-to-r from-white to-gray-50/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[#333333]">
              <Users className="w-5 h-5 text-[#00af8f]" />
              Member Management
            </CardTitle>
            <div className="flex items-center gap-4">
              {/* Search and Filter Controls */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#666666] w-5 h-5" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-base border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-2xl bg-white transition-all duration-200 placeholder:text-[#999999] hover:border-[#00af8f]/50 w-80"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] w-4 h-4 z-10" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
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
                        Active Only
                      </SelectItem>
                      <SelectItem
                        value="inactive"
                        className="rounded-lg hover:bg-[#00af8f]/5">
                        Inactive Only
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
              {/* <Button
                onClick={handleAddMember}
                className="bg-[#00af8f] hover:bg-[#00af90] text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button> */}
            </div>
          </div>

          {/* Search Results Summary */}
          {(searchTerm ||
            filterStatus !== 'all' ||
            barangayFilter !== 'all') && (
            <div className="mt-4 p-3 bg-[#00af8f]/5 rounded-xl border border-[#00af8f]/20">
              <p className="text-sm text-[#00af8f] font-medium">
                Found {filteredMembers.length} result
                {filteredMembers.length !== 1 ? 's' : ''}
                {searchTerm && ` for "${searchTerm}"`}
                {filterStatus !== 'all' && ` (${filterStatus} status)`}
                {barangayFilter !== 'all' && ` in ${barangayFilter}`}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00af8f] mx-auto mb-4"></div>
                <p className="text-[#666666] text-lg">Loading members...</p>
              </div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-[#333333] mb-2">
                No members found
              </h3>
              <p className="text-[#666666] mb-6 text-lg">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first BASCA member.'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button
                  onClick={handleAddMember}
                  className="bg-[#00af8f] hover:bg-[#00af90] text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Member
                </Button>
              )}
            </div>
          ) : (
            <BascaMembersTable
              bascaMembers={filteredMembers}
              onEdit={handleEditMember}
              onView={handleViewMember}
              onDelete={handleDeleteMember}
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddBascaMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleMemberSuccess}
      />

      {selectedMember && (
        <>
          <EditBascaMemberModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            member={selectedMember}
            onSuccess={handleMemberSuccess}
          />

          <ViewBascaMemberModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            member={selectedMember}
            onEdit={() => {
              setIsViewModalOpen(false);
              setIsEditModalOpen(true);
            }}
          />

          <DeleteBascaMemberDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            member={selectedMember}
            onSuccess={handleMemberSuccess}
          />
        </>
      )}
    </div>
  );
}
