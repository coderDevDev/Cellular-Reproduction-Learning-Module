'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  FileText,
  ChevronDown,
  ChevronRight,
  Shield,
  Building
} from 'lucide-react';
import type { BascaMember } from '@/types/basca';

interface BascaMembersTableProps {
  bascaMembers: BascaMember[];
  onEdit: (member: BascaMember) => void;
  onView: (member: BascaMember) => void;
  onDelete: (member: BascaMember) => void;
}

export function BascaMembersTable({
  bascaMembers,
  onEdit,
  onView,
  onDelete
}: BascaMembersTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
    }
  };

  const getPositionBadge = (position: string) => {
    const positionColors: Record<string, string> = {
      president: 'bg-purple-100 text-purple-800',
      vice_president: 'bg-blue-100 text-blue-800',
      secretary: 'bg-green-100 text-green-800',
      treasurer: 'bg-yellow-100 text-yellow-800',
      coordinator: 'bg-orange-100 text-orange-800',
      member: 'bg-gray-100 text-gray-800'
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
        className={positionColors[position] || 'bg-gray-100 text-gray-800'}>
        {positionLabels[position] || position}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Barangay</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bascaMembers.map(member => (
            <React.Fragment key={member.id}>
              <TableRow className="hover:bg-gray-50">
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRow(member.id)}
                    className="h-8 w-8 p-0">
                    {expandedRow === member.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={member.profilePicture}
                        alt={`${member.firstName} ${member.lastName}`}
                      />
                      <AvatarFallback className="bg-[#00af8f]/10 text-[#00af8f]">
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getPositionBadge(member.position)}</TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">{member.barangay}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">{member.phone}</div>
                </TableCell>
                <TableCell>{getStatusBadge(member.isActive)}</TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">
                    {formatDate(member.joinDate)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(member)}
                      className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(member)}
                      className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(member)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedRow === member.id && (
                <TableRow>
                  <TableCell colSpan={8} className="p-0">
                    <Card className="mx-4 mb-4 border-l-4 border-l-[#00af8f]">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Personal Information */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Personal Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Employee ID:
                                </span>
                                <span className="text-gray-900">
                                  {member.employeeId || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Department:
                                </span>
                                <span className="text-gray-900">
                                  {member.department || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Join Date:
                                </span>
                                <span className="text-gray-900">
                                  {formatDate(member.joinDate)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              Contact Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900">
                                  {member.email}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900">
                                  {member.phone}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Address Information */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              Address Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900">
                                  {member.barangay}
                                </span>
                              </div>
                              <div className="text-gray-900 text-sm">
                                {member.address}
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          {member.notes && (
                            <div className="space-y-3 md:col-span-2 lg:col-span-3">
                              <h4 className="font-semibold text-gray-900 flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                Notes
                              </h4>
                              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                {member.notes}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
