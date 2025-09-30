'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import type { SeniorCitizen } from '@/types/property';

interface SeniorCitizensTableProps {
  seniors: SeniorCitizen[];
  onEdit: (senior: SeniorCitizen) => void;
  onView: (senior: SeniorCitizen) => void;
  onDelete: (senior: SeniorCitizen) => void;
}

export function SeniorCitizensTable({
  seniors,
  onEdit,
  onView,
  onDelete
}: SeniorCitizensTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'deceased':
        return <Badge className="bg-red-100 text-red-800">Deceased</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName || 'U';
    const last = lastName || 'U';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12"></TableHead>
            <TableHead className="font-semibold text-[#333333]">
              Senior Citizen
            </TableHead>
            <TableHead className="font-semibold text-[#333333]">
              OSCA ID
            </TableHead>
            <TableHead className="font-semibold text-[#333333]">Age</TableHead>
            <TableHead className="font-semibold text-[#333333]">
              Barangay
            </TableHead>
            <TableHead className="font-semibold text-[#333333]">
              Status
            </TableHead>
            <TableHead className="font-semibold text-[#333333]">
              Registration Date
            </TableHead>
            <TableHead className="font-semibold text-[#333333] w-12">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {seniors.map(senior => {
            const age = getAge(senior.dateOfBirth);
            const isExpanded = expandedRow === senior.id;

            return (
              <React.Fragment key={senior.id}>
                <TableRow className="hover:bg-gray-50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedRow(isExpanded ? null : senior.id)
                      }
                      className="h-8 w-8 p-0">
                      <span className="text-lg">{isExpanded ? '−' : '+'}</span>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={senior.seniorIdPhoto} alt="Senior" />
                        <AvatarFallback className="bg-[#00af8f]/10 text-[#00af8f]">
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-[#333333]">
                          {senior.firstName || 'Unknown'}{' '}
                          {senior.lastName || 'User'}
                        </div>
                        <div className="text-sm text-[#666666]">
                          {senior.gender === 'male'
                            ? 'Male'
                            : senior.gender === 'female'
                            ? 'Female'
                            : 'Other'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm text-[#00af8f] font-medium">
                      {senior.oscaId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-[#333333]">
                      {age} years old
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-[#666666]" />
                      <span className="text-sm text-[#333333]">
                        {senior.barangay}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(senior.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[#666666]" />
                      <span className="text-sm text-[#333333]">
                        {formatDate(senior.registrationDate)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onView(senior)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(senior)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(senior)}
                          className="text-red-600 focus:text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                {/* Expanded Row with Additional Details */}
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Contact Information */}
                          <div>
                            <h4 className="font-semibold text-[#333333] mb-3 flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-[#00af8f]" />
                              Contact Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-[#666666]">Address:</span>
                                <p className="text-[#333333]">
                                  {senior.address}
                                </p>
                              </div>
                              {senior.contactPerson && (
                                <div>
                                  <span className="text-[#666666]">
                                    Contact Person:
                                  </span>
                                  <p className="text-[#333333]">
                                    {senior.contactPerson}
                                  </p>
                                </div>
                              )}
                              {senior.contactPhone && (
                                <div>
                                  <span className="text-[#666666]">
                                    Contact Phone:
                                  </span>
                                  <p className="text-[#333333]">
                                    {senior.contactPhone}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Emergency Contact */}
                          <div>
                            <h4 className="font-semibold text-[#333333] mb-3 flex items-center">
                              <User className="w-4 h-4 mr-2 text-[#00af8f]" />
                              Emergency Contact
                            </h4>
                            <div className="space-y-2 text-sm">
                              {senior.emergencyContactName && (
                                <div>
                                  <span className="text-[#666666]">Name:</span>
                                  <p className="text-[#333333]">
                                    {senior.emergencyContactName}
                                  </p>
                                </div>
                              )}
                              {senior.emergencyContactPhone && (
                                <div>
                                  <span className="text-[#666666]">Phone:</span>
                                  <p className="text-[#333333]">
                                    {senior.emergencyContactPhone}
                                  </p>
                                </div>
                              )}
                              {senior.emergencyContactRelationship && (
                                <div>
                                  <span className="text-[#666666]">
                                    Relationship:
                                  </span>
                                  <p className="text-[#333333]">
                                    {senior.emergencyContactRelationship}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Medical Information */}
                          <div>
                            <h4 className="font-semibold text-[#333333] mb-3 flex items-center">
                              <FileText className="w-4 h-4 mr-2 text-[#00af8f]" />
                              Medical Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              {senior.medicalConditions.length > 0 && (
                                <div>
                                  <span className="text-[#666666]">
                                    Conditions:
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {senior.medicalConditions.map(
                                      (condition, index) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="text-xs">
                                          {condition}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                              {senior.medications.length > 0 && (
                                <div>
                                  <span className="text-[#666666]">
                                    Medications:
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {senior.medications.map(
                                      (medication, index) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="text-xs">
                                          {medication}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                              {senior.lastMedicalCheckup && (
                                <div>
                                  <span className="text-[#666666]">
                                    Last Checkup:
                                  </span>
                                  <p className="text-[#333333]">
                                    {formatDate(senior.lastMedicalCheckup)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(senior)}
                            className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/10">
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(senior)}
                            className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/10">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
