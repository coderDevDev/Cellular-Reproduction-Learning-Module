'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { useIsMobile } from '@/components/ui/use-mobile';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  AlertTriangle,
  Eye,
  Edit,
  Download,
  Mail,
  Clock,
  Shield
} from 'lucide-react';
import type { SeniorCitizen } from '@/types/property';

interface ViewSeniorModalProps {
  isOpen: boolean;
  onClose: () => void;
  senior: SeniorCitizen;
  onEdit?: () => void;
}

export function ViewSeniorModal({
  isOpen,
  onClose,
  senior,
  onEdit
}: ViewSeniorModalProps) {
  const isMobile = useIsMobile();
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
      month: 'long',
      day: 'numeric'
    });
  };

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

  const age = getAge(senior.dateOfBirth);

  const header = (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Eye className="w-6 h-6 text-[#00af8f]" />
        <span className="text-2xl font-bold text-[#333333]">
          Senior Citizen Details
        </span>
      </div>
      <p className="text-[#666666]">
        View complete information for {senior.firstName} {senior.lastName}
      </p>
    </div>
  );

  const content = (
    <div className="space-y-6">
      {/* Header with Photo and Basic Info */}
      <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-[#00af8f]/5 to-[#ffd416]/5 rounded-xl">
        <Avatar className="h-24 w-24">
          <AvatarImage src={senior.seniorIdPhoto} alt="Senior" />
          <AvatarFallback className="bg-[#00af8f]/10 text-[#00af8f] text-2xl">
            {senior.firstName?.charAt(0)}
            {senior.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-[#333333]">
              {senior.firstName} {senior.lastName}
            </h2>
            {getStatusBadge(senior.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00af8f]" />
              <span className="text-[#666666]">OSCA ID:</span>
              <span className="font-mono font-medium text-[#00af8f]">
                {senior.oscaId}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00af8f]" />
              <span className="text-[#666666]">Age:</span>
              <span className="font-medium text-[#333333]">
                {age} years old
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#00af8f]" />
              <span className="text-[#666666]">Gender:</span>
              <span className="font-medium text-[#333333] capitalize">
                {senior.gender}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* {onEdit && (
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/10">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )} */}
          {/* <Button
            variant="outline"
            size="sm"
            className="border-[#666666] text-[#666666] hover:bg-[#666666]/10">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button> */}
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
          <User className="w-5 h-5 text-[#00af8f]" />
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Date of Birth
              </span>
              <p className="text-[#333333]">{formatDate(senior.dateOfBirth)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Registration Date
              </span>
              <p className="text-[#333333]">
                {formatDate(senior.registrationDate)}
              </p>
            </div>
            {senior.lastMedicalCheckup && (
              <div>
                <span className="text-sm font-medium text-[#666666]">
                  Last Medical Checkup
                </span>
                <p className="text-[#333333]">
                  {formatDate(senior.lastMedicalCheckup)}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-[#666666]">Status</span>
              <div className="mt-1">{getStatusBadge(senior.status)}</div>
            </div>
            {senior.notes && (
              <div>
                <span className="text-sm font-medium text-[#666666]">
                  Notes
                </span>
                <p className="text-[#333333] text-sm">{senior.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#00af8f]" />
          Address Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Barangay
              </span>
              <p className="text-[#333333]">{senior.barangay}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Barangay Code
              </span>
              <p className="text-[#333333] font-mono">{senior.barangayCode}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Complete Address
              </span>
              <p className="text-[#333333]">{senior.address}</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
          <Phone className="w-5 h-5 text-[#00af8f]" />
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {senior.contactPerson && (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-[#666666]">
                  Contact Person
                </span>
                <p className="text-[#333333]">{senior.contactPerson}</p>
              </div>
              {senior.contactPhone && (
                <div>
                  <span className="text-sm font-medium text-[#666666]">
                    Contact Phone
                  </span>
                  <p className="text-[#333333]">{senior.contactPhone}</p>
                </div>
              )}
              {senior.contactRelationship && (
                <div>
                  <span className="text-sm font-medium text-[#666666]">
                    Relationship
                  </span>
                  <p className="text-[#333333]">{senior.contactRelationship}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#00af8f]" />
          Emergency Contact
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {senior.emergencyContactName && (
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Emergency Contact Name
              </span>
              <p className="text-[#333333]">{senior.emergencyContactName}</p>
            </div>
          )}
          {senior.emergencyContactPhone && (
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Emergency Contact Phone
              </span>
              <p className="text-[#333333]">{senior.emergencyContactPhone}</p>
            </div>
          )}
          {senior.emergencyContactRelationship && (
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Relationship
              </span>
              <p className="text-[#333333]">
                {senior.emergencyContactRelationship}
              </p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Medical Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00af8f]" />
          Medical Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Medical Conditions
              </span>
              {senior.medicalConditions.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {senior.medicalConditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {condition}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[#666666] text-sm">
                  No medical conditions recorded
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Medications
              </span>
              {senior.medications.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {senior.medications.map((medication, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {medication}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[#666666] text-sm">
                  No medications recorded
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Living Conditions & Income */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#00af8f]" />
          Living Conditions & Income
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Housing Condition
              </span>
              <p className="text-[#333333] capitalize">
                {senior.housingCondition?.replace('_', ' ') || 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Physical Health Condition
              </span>
              <p className="text-[#333333] capitalize">
                {senior.physicalHealthCondition || 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Living Condition
              </span>
              <p className="text-[#333333] capitalize">
                {senior.livingCondition?.replace('_', ' ') || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Monthly Income
              </span>
              <p className="text-[#333333] font-medium">
                ₱{senior.monthlyIncome?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Monthly Pension
              </span>
              <p className="text-[#333333] font-medium">
                ₱{senior.monthlyPension?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* ID Picture */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00af8f]" />
          ID Picture
        </h3>

        {senior.seniorIdPhoto ? (
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={senior.seniorIdPhoto}
                alt="Senior ID"
                className="w-32 h-40 object-cover rounded-lg border-2 border-[#E0DDD8]"
              />
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
                Valid ID
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-[#666666]">
                ID document has been uploaded and validated
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/10"
                onClick={() => window.open(senior.seniorIdPhoto, '_blank')}>
                <Eye className="w-4 h-4 mr-2" />
                View Full Size
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-2 border-dashed border-[#E0DDD8] rounded-xl text-center">
            <FileText className="w-8 h-8 text-[#666666] mx-auto mb-2" />
            <p className="text-[#666666] text-sm">No ID picture uploaded</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Beneficiaries */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
          <User className="w-5 h-5 text-[#00af8f]" />
          Beneficiaries
        </h3>

        {senior.beneficiaries && senior.beneficiaries.length > 0 ? (
          <div className="space-y-4">
            {senior.beneficiaries.map((beneficiary, index) => (
              <div
                key={index}
                className="p-4 border-2 border-[#E0DDD8] rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-[#333333]">
                    Beneficiary {index + 1}
                  </h4>
                  {beneficiary.isDependent && (
                    <Badge className="bg-[#ffd416] text-[#333333]">
                      Dependent
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-[#666666]">
                      Name
                    </span>
                    <p className="text-[#333333]">{beneficiary.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[#666666]">
                      Relationship
                    </span>
                    <p className="text-[#333333]">{beneficiary.relationship}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[#666666]">
                      Date of Birth
                    </span>
                    <p className="text-[#333333]">
                      {formatDate(beneficiary.dateOfBirth)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[#666666]">
                      Gender
                    </span>
                    <p className="text-[#333333] capitalize">
                      {beneficiary.gender}
                    </p>
                  </div>
                  {beneficiary.address && (
                    <div>
                      <span className="text-sm font-medium text-[#666666]">
                        Address
                      </span>
                      <p className="text-[#333333]">{beneficiary.address}</p>
                    </div>
                  )}
                  {beneficiary.contactPhone && (
                    <div>
                      <span className="text-sm font-medium text-[#666666]">
                        Contact Phone
                      </span>
                      <p className="text-[#333333]">
                        {beneficiary.contactPhone}
                      </p>
                    </div>
                  )}
                  {beneficiary.occupation && (
                    <div>
                      <span className="text-sm font-medium text-[#666666]">
                        Occupation
                      </span>
                      <p className="text-[#333333]">{beneficiary.occupation}</p>
                    </div>
                  )}
                  {beneficiary.monthlyIncome && (
                    <div>
                      <span className="text-sm font-medium text-[#666666]">
                        Monthly Income
                      </span>
                      <p className="text-[#333333] font-medium">
                        ₱{beneficiary.monthlyIncome.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#666666] text-sm">No beneficiaries recorded</p>
        )}
      </div>

      <Separator />

      {/* Documents */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00af8f]" />
          Documents
        </h3>

        <div>
          <span className="text-sm font-medium text-[#666666]">
            Available Documents
          </span>
          {senior.documents.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {senior.documents.map((document, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {document}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-[#666666] text-sm">No documents uploaded</p>
          )}
        </div>
      </div>

      <Separator />

      {/* System Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#00af8f]" />
          System Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Created At
              </span>
              <p className="text-[#333333] text-sm">
                {formatDate(senior.createdAt)}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Last Updated
              </span>
              <p className="text-[#333333] text-sm">
                {formatDate(senior.updatedAt)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-[#666666]">
                User ID
              </span>
              <p className="text-[#333333] text-sm font-mono">
                {senior.userId}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-[#666666]">
                Record ID
              </span>
              <p className="text-[#333333] text-sm font-mono">{senior.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onClose}
          className="bg-[#00af8f] hover:bg-[#00af90] text-white">
          Close
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[92vh] rounded-t-2xl p-0">
          <div className="p-4 border-b">
            <SheetHeader>
              <SheetTitle>{header}</SheetTitle>
              <SheetDescription className="hidden" />
            </SheetHeader>
          </div>
          <div className="px-4 pb-6 pt-4 overflow-y-auto h-[calc(92vh-56px)]">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>{header}</DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
