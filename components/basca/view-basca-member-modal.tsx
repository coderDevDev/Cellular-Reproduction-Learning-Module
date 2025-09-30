'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  FileText,
  Shield,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  CreditCard
} from 'lucide-react';
import type { BascaMember } from '@/types/basca';

interface ViewBascaMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: BascaMember;
  onEdit?: () => void;
}

export function ViewBascaMemberModal({
  isOpen,
  onClose,
  member,
  onEdit
}: ViewBascaMemberModalProps) {
  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 px-3 py-1">
          <CheckCircle className="w-3.5 h-3.5" />
          Active
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1.5 px-3 py-1">
          <XCircle className="w-3.5 h-3.5" />
          Inactive
        </Badge>
      );
    }
  };

  const getPositionBadge = (position: string) => {
    const positionColors: Record<string, string> = {
      president: 'bg-purple-50 text-purple-700 border-purple-200',
      vice_president: 'bg-blue-50 text-blue-700 border-blue-200',
      secretary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      treasurer: 'bg-amber-50 text-amber-700 border-amber-200',
      coordinator: 'bg-orange-50 text-orange-700 border-orange-200',
      member: 'bg-slate-50 text-slate-700 border-slate-200'
    };

    const positionLabels: Record<string, string> = {
      president: 'President',
      vice_president: 'Vice President',
      secretary: 'Secretary',
      treasurer: 'Treasurer',
      coordinator: 'Coordinator',
      member: 'Member'
    };

    return (
      <Badge
        className={`${
          positionColors[position] ||
          'bg-slate-50 text-slate-700 border-slate-200'
        } flex items-center gap-1.5 px-3 py-1`}>
        {positionLabels[position] || position}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-gray-200/60">
          <DialogTitle className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 ring-4 ring-white shadow-lg">
                <AvatarImage src={member.profilePicture} />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-[#00af8f] to-[#00af90] text-white">
                  {getInitials(member.firstName, member.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <div
                  className={`w-3 h-3 rounded-full ${
                    member.isActive ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-[#333333] mb-2">
                {member.firstName} {member.lastName}
              </div>
              <div className="flex items-center gap-3 mb-3">
                {getPositionBadge(member.position)}
                {getStatusBadge(member.isActive)}
              </div>
              <div className="flex items-center gap-4 text-sm text-[#666666]">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {member.department || 'No Department'}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(member.joinDate)}
                </div>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-base text-[#666666] mt-2">
            Comprehensive member information and details
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          {/* Personal Information */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg text-[#333333]">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                    First Name
                  </label>
                  <p className="text-sm font-medium text-[#333333] bg-gray-50 px-3 py-2 rounded-md">
                    {member.firstName}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                    Last Name
                  </label>
                  <p className="text-sm font-medium text-[#333333] bg-gray-50 px-3 py-2 rounded-md">
                    {member.lastName}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                  Email Address
                </label>
                <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-md">
                  <Mail className="w-4 h-4 text-[#00af8f]" />
                  <p className="text-sm font-medium text-[#333333]">
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-md">
                  <Phone className="w-4 h-4 text-[#00af8f]" />
                  <p className="text-sm font-medium text-[#333333]">
                    {member.phone}
                  </p>
                </div>
              </div>

              {member.employeeId && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                    Employee ID
                  </label>
                  <p className="text-sm font-medium text-[#333333] bg-gray-50 px-3 py-2 rounded-md font-mono">
                    {member.employeeId}
                  </p>
                </div>
              )}

              {member.idPhoto && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                    Valid ID Document
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-md">
                    <CreditCard className="w-4 h-4 text-[#00af8f]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#333333]">
                        ID Document uploaded
                      </p>
                      <p className="text-xs text-[#666666]">
                        Click to view full document
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(member.idPhoto, '_blank')}
                      className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/10 px-3 py-1">
                      View
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Position & Department */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg text-[#333333]">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                Position & Department
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                  Position
                </label>
                <div className="mt-1">{getPositionBadge(member.position)}</div>
              </div>

              {member.department && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                    Department
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-md">
                    <Building className="w-4 h-4 text-[#00af8f]" />
                    <p className="text-sm font-medium text-[#333333]">
                      {member.department}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                  Join Date
                </label>
                <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-md">
                  <Calendar className="w-4 h-4 text-[#00af8f]" />
                  <p className="text-sm font-medium text-[#333333]">
                    {formatDate(member.joinDate)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                  Status
                </label>
                <div className="mt-1">{getStatusBadge(member.isActive)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="xl:col-span-2 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg text-[#333333]">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                    Barangay
                  </label>
                  <p className="text-sm font-medium text-[#333333] bg-gray-50 px-3 py-2 rounded-md">
                    {member.barangay}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                    Full Address
                  </label>
                  <p className="text-sm font-medium text-[#333333] bg-gray-50 px-3 py-2 rounded-md">
                    {member.address}
                  </p>
                </div>
              </div>

              {/* {member.addressData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  {member.addressData.region && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                        Region
                      </label>
                      <p className="text-sm font-medium text-[#333333] bg-blue-50 px-3 py-2 rounded-md">
                        {member.addressData.region.region_name}
                      </p>
                    </div>
                  )}
                  {member.addressData.province && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                        Province
                      </label>
                      <p className="text-sm font-medium text-[#333333] bg-green-50 px-3 py-2 rounded-md">
                        {member.addressData.province.province_name}
                      </p>
                    </div>
                  )}
                  {member.addressData.city && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                        City
                      </label>
                      <p className="text-sm font-medium text-[#333333] bg-purple-50 px-3 py-2 rounded-md">
                        {member.addressData.city.city_name}
                      </p>
                    </div>
                  )}
                  {member.addressData.barangay && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                        Barangay
                      </label>
                      <p className="text-sm font-medium text-[#333333] bg-orange-50 px-3 py-2 rounded-md">
                        {member.addressData.barangay.brgy_name}
                      </p>
                    </div>
                  )}
                </div>
              )} */}
            </CardContent>
          </Card>

          {/* Additional Information */}
          {member.notes && (
            <Card className="xl:col-span-2 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg text-[#333333]">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#333333] bg-amber-50 px-4 py-3 rounded-md border-l-4 border-amber-200">
                  {member.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card className="xl:col-span-2 border-0 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg text-[#333333]">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                    Created
                  </label>
                  <p className="text-sm font-medium text-[#333333] bg-white/60 px-3 py-2 rounded-md">
                    {formatDate(member.created_at)}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                    Last Updated
                  </label>
                  <p className="text-sm font-medium text-[#333333] bg-white/60 px-3 py-2 rounded-md">
                    {formatDate(member.updated_at)}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                    Member ID
                  </label>
                  <p className="text-sm font-mono font-medium text-[#333333] bg-white/60 px-3 py-2 rounded-md">
                    {member.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200/60">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2.5 border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/10 transition-all duration-200">
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={onEdit}
              className="px-6 py-2.5 bg-[#00af8f] hover:bg-[#00af90] text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Member
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
