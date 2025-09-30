'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MultiStepForm, Step } from '@/components/seniors/multi-step-form';
import {
  PhilippineAddressSelector,
  type AddressData
} from '@/components/ui/philippine-address-selector';
import { useToast } from '@/hooks/use-toast';
import { BascaMembersAPI } from '@/lib/api/basca-members';
import type { BascaMember, UpdateBascaMemberData } from '@/types/basca';
import { User, MapPin, Shield, FileText, X } from 'lucide-react';

const editBascaMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  barangay: z.string().min(1, 'Barangay is required'),
  barangayCode: z.string().min(1, 'Barangay code is required'),
  address: z.string().min(1, 'Address is required'),
  position: z.enum([
    'president',
    'vice_president',
    'secretary',
    'treasurer',
    'member',
    'coordinator'
  ]),
  department: z.string().optional(),
  employeeId: z.string().optional(),
  joinDate: z.string().min(1, 'Join date is required'),
  profilePicture: z.string().optional(),
  idPhoto: z.string().min(1, 'Valid ID document is required'),
  notes: z.string().optional(),
  isActive: z.boolean()
});

type EditBascaMemberFormData = z.infer<typeof editBascaMemberSchema>;

interface EditBascaMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: BascaMember;
  onSuccess: () => void;
}

export function EditBascaMemberModal({
  isOpen,
  onClose,
  member,
  onSuccess
}: EditBascaMemberModalProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressData, setAddressData] = useState<AddressData>({});
  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [profileThumbnail, setProfileThumbnail] = useState<string>('');
  const [idPhoto, setIdPhoto] = useState<string>('');
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic member details, photos & identification',
      icon: User,
      isCompleted: false,
      isRequired: true
    },
    {
      id: 'address',
      title: 'Address',
      description: 'Location and contact details',
      icon: MapPin,
      isCompleted: false,
      isRequired: true
    },
    {
      id: 'position',
      title: 'Position & Department',
      description: 'Role and organizational details',
      icon: Shield,
      isCompleted: false,
      isRequired: true
    },
    {
      id: 'additional',
      title: 'Additional Details',
      description: 'Notes and other information',
      icon: FileText,
      isCompleted: false,
      isRequired: false
    }
  ]);

  const form = useForm<EditBascaMemberFormData>({
    resolver: zodResolver(editBascaMemberSchema),
    defaultValues: {
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      barangay: member.barangay,
      barangayCode: member.barangayCode,
      address: member.address,
      position: member.position,
      department: member.department || '',
      employeeId: member.employeeId || '',
      joinDate: member.joinDate.split('T')[0],
      profilePicture: member.profilePicture || '',
      idPhoto: member.idPhoto || '',
      notes: member.notes || '',
      isActive: member.isActive
    }
  });

  // Update form when member changes
  useEffect(() => {
    if (member) {
      form.reset({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        barangay: member.barangay,
        barangayCode: member.barangayCode,
        address: member.address,
        position: member.position,
        department: member.department || '',
        employeeId: member.employeeId || '',
        joinDate: member.joinDate.split('T')[0],
        profilePicture: member.profilePicture || '',
        idPhoto: member.idPhoto || '',
        notes: member.notes || '',
        isActive: member.isActive
      });

      // Set profile and ID photo states
      if (member.profilePicture) {
        setProfileThumbnail(member.profilePicture);
        setProfileImages([member.profilePicture]);
      }
      if (member.idPhoto) {
        setIdPhoto(member.idPhoto);
      }

      // Set address data for proper population of address selector
      if (member.addressData) {
        setAddressData(member.addressData);
      }
    }
  }, [member, form]);

  // Watch idPhoto value for validation
  const watchedIdPhoto = form.watch('idPhoto');

  // Update idPhoto state when form value changes
  useEffect(() => {
    if (watchedIdPhoto) {
      setIdPhoto(watchedIdPhoto);
    }
  }, [watchedIdPhoto]);

  // Update form value when idPhoto state changes
  useEffect(() => {
    if (idPhoto) {
      form.setValue('idPhoto', idPhoto);
    }
  }, [idPhoto, form]);

  const validateStep = async (step: number): Promise<boolean> => {
    const fieldsToValidate: Record<number, (keyof EditBascaMemberFormData)[]> =
      {
        0: ['firstName', 'lastName', 'email', 'phone', 'idPhoto'],
        1: ['barangay', 'barangayCode', 'address'],
        2: ['position', 'joinDate'],
        3: []
      };

    const fields = fieldsToValidate[step] || [];
    const result = await form.trigger(fields);

    if (result) {
      // Update the step completion status
      setSteps(prevSteps =>
        prevSteps.map((s, index) =>
          index === step ? { ...s, isCompleted: true } : s
        )
      );
    }

    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const onSubmit = async (data: EditBascaMemberFormData) => {
    try {
      setIsSubmitting(true);

      const memberData: UpdateBascaMemberData = {
        id: member.id,
        ...data,
        profilePicture: profileThumbnail || profileImages[0] || '',
        addressData,
        idPhoto
      };

      await BascaMembersAPI.updateBascaMember(memberData);

      toast({
        title: 'Success',
        description: 'Basca member updated successfully'
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating basca member:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update basca member',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCurrentStep(0);
      setSteps(prevSteps =>
        prevSteps.map(step => ({ ...step, isCompleted: false }))
      );
      onClose();
    }
  };

  const canProceed = (): boolean => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return false;

    const requiredFields: Record<string, (keyof EditBascaMemberFormData)[]> = {
      personal: ['firstName', 'lastName', 'email', 'phone', 'idPhoto'],
      address: ['barangay', 'barangayCode', 'address'],
      position: ['position', 'joinDate'],
      additional: []
    };

    const fields = requiredFields[currentStepData.id] || [];

    // For address step, also check if addressData has been selected
    if (currentStepData.id === 'address') {
      return (
        fields.every(field => form.getValues(field)) &&
        Object.keys(addressData).length > 0
      );
    }

    return fields.every(field => {
      const value = form.getValues(field);
      return value && value.toString().trim() !== '';
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-[#feffff] to-[#ffffff] p-6 rounded-2xl border-2 border-[#E0DDD8]/50">
              <h4 className="text-lg font-semibold text-[#333333] mb-6 flex items-center">
                <User className="w-5 h-5 text-[#00af8f] mr-2" />
                Basic Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="group">
                  <Label
                    htmlFor="firstName"
                    className="text-[#333333] font-semibold text-sm mb-2 block">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...form.register('firstName')}
                    placeholder="Enter first name"
                    className="h-14 text-base border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-2xl bg-[#feffff] transition-all duration-200"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="group">
                  <Label
                    htmlFor="lastName"
                    className="text-[#333333] font-semibold text-sm mb-2 block">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...form.register('lastName')}
                    placeholder="Enter last name"
                    className="h-14 text-base border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-2xl bg-[#feffff] transition-all duration-200"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div className="group">
                  <Label
                    htmlFor="email"
                    className="text-[#333333] font-semibold text-sm mb-2 block">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="Enter email address"
                    className="h-14 text-base border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-2xl bg-[#feffff] transition-all duration-200"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="group">
                  <Label
                    htmlFor="phone"
                    className="text-[#333333] font-semibold text-sm mb-2 block">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="Enter phone number"
                    className="h-14 text-base border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-2xl bg-[#feffff] transition-all duration-200"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-2">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Photos & Identification */}
            <div className="bg-gradient-to-br from-[#feffff] to-[#ffffff] p-6 rounded-2xl border-2 border-[#E0DDD8]/50">
              <h4 className="text-lg font-semibold text-[#333333] mb-6 flex items-center">
                <FileText className="w-5 h-5 text-[#00af8f] mr-2" />
                Photos & Identification
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Picture */}
                <div className="space-y-4">
                  <Label className="text-[#333333] font-semibold text-sm">
                    Profile Picture
                  </Label>
                  <div className="border-2 border-dashed border-[#E0DDD8] rounded-2xl p-6 text-center hover:border-[#00af8f]/50 transition-all duration-200">
                    {profileThumbnail ? (
                      <div className="space-y-4">
                        <div className="relative w-32 h-32 mx-auto">
                          <img
                            src={profileThumbnail}
                            alt="Profile preview"
                            className="w-full h-full object-cover rounded-2xl"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute -top-2 -right-2 w-8 h-8 p-0 bg-red-500 text-white border-red-500 hover:bg-red-600 rounded-full"
                            onClick={() => {
                              setProfileThumbnail('');
                              setProfileImages([]);
                              form.setValue('profilePicture', '');
                            }}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = e => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = e => {
                                  const result = e.target?.result as string;
                                  setProfileThumbnail(result);
                                  setProfileImages([result]);
                                  form.setValue('profilePicture', result);
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}>
                          Change Profile Picture
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-[#00af8f]/10 rounded-2xl flex items-center justify-center">
                          <User className="w-8 h-8 text-[#00af8f]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#333333]">
                            Upload Profile Picture
                          </p>
                          <p className="text-xs text-[#666666] mt-1">
                            JPG, PNG or JPEG (max 5MB)
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = e => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = e => {
                                  const result = e.target?.result as string;
                                  setProfileThumbnail(result);
                                  setProfileImages([result]);
                                  form.setValue('profilePicture', result);
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}>
                          Choose Profile Picture
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#666666] bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <strong>Optional:</strong> A clear, recent photo of the
                    member for identification purposes.
                  </p>
                </div>

                {/* Valid ID Upload */}
                <div className="space-y-4">
                  <Label className="text-[#333333] font-semibold text-sm">
                    Valid ID Document
                  </Label>
                  <div className="border-2 border-dashed border-[#E0DDD8] rounded-2xl p-6 text-center hover:border-[#00af8f]/50 transition-all duration-200">
                    {idPhoto ? (
                      <div className="space-y-4">
                        <div className="relative w-32 h-32 mx-auto">
                          <img
                            src={idPhoto}
                            alt="ID preview"
                            className="w-full h-full object-cover rounded-2xl"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute -top-2 -right-2 w-8 h-8 p-0 bg-red-500 text-white border-red-500 hover:bg-red-600 rounded-full"
                            onClick={() => {
                              setIdPhoto('');
                              form.setValue('idPhoto', '');
                            }}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = e => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = e => {
                                  const result = e.target?.result as string;
                                  setIdPhoto(result);
                                  form.setValue('idPhoto', result);
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}>
                          Change ID Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-[#00af8f]/10 rounded-2xl flex items-center justify-center">
                          <FileText className="w-8 h-8 text-[#00af8f]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#333333]">
                            Upload Valid ID Document
                          </p>
                          <p className="text-xs text-[#666666] mt-1">
                            JPG, PNG or JPEG (max 5MB)
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = e => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = e => {
                                  const result = e.target?.result as string;
                                  setIdPhoto(result);
                                  form.setValue('idPhoto', result);
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}>
                          Choose ID File
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#666666] bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                    <strong>Required:</strong> Upload a clear photo of a valid
                    government ID (e.g., UMID, Driver's License, Passport).
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Address Selection *</Label>
              <PhilippineAddressSelector
                value={addressData}
                onChange={(data: AddressData) => {
                  setAddressData(data);
                  form.setValue('barangay', data.barangay?.brgy_name || '');
                  form.setValue('barangayCode', data.barangay?.brgy_code || '');
                  form.setValue(
                    'address',
                    `${data.barangay?.brgy_name || ''}, ${
                      data.city?.city_name || ''
                    }, ${data.province?.province_name || ''}`
                  );
                }}
              />
              {Object.keys(addressData).length > 0 && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                  <strong>Address Data Loaded:</strong> The address selector is
                  populated with the member's current address information.
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Textarea
                id="address"
                {...form.register('address')}
                placeholder="Enter complete address"
                rows={3}
                className="border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-2xl bg-[#feffff] transition-all duration-200"
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Select
                value={form.watch('position')}
                onValueChange={value =>
                  form.setValue('position', value as any)
                }>
                <SelectTrigger className="h-14 text-base border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-2xl bg-[#feffff] transition-all duration-200">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="president">President</SelectItem>
                  <SelectItem value="vice_president">Vice President</SelectItem>
                  <SelectItem value="secretary">Secretary</SelectItem>
                  <SelectItem value="treasurer">Treasurer</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.position && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.position.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  {...form.register('department')}
                  placeholder="Enter department"
                  className="h-14 text-base border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-2xl bg-[#feffff] transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  {...form.register('employeeId')}
                  placeholder="Enter employee ID"
                  className="h-14 text-base border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-2xl bg-[#feffff] transition-all duration-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinDate">Join Date *</Label>
              <Input
                id="joinDate"
                type="date"
                {...form.register('joinDate')}
                className="h-14 text-base border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-2xl bg-[#feffff] transition-all duration-200"
              />
              {form.formState.errors.joinDate && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.joinDate.message}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...form.register('notes')}
                placeholder="Enter any additional notes about the member"
                rows={3}
                className="border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-2xl bg-[#feffff] transition-all duration-200"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={form.watch('isActive')}
                onCheckedChange={checked => form.setValue('isActive', checked)}
                className="data-[state=checked]:bg-[#00af8f]"
              />
              <Label htmlFor="isActive" className="text-[#666666] font-medium">
                Active Member
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmitForm = () => {
    form.handleSubmit(onSubmit)();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Basca Member</DialogTitle>
          <DialogDescription>
            Update the information for {member.firstName} {member.lastName}.
          </DialogDescription>
        </DialogHeader>

        <MultiStepForm
          steps={steps}
          currentStep={currentStep}
          onStepChange={handleStepChange}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={handleSubmitForm}
          isSubmitting={isSubmitting}
          canProceed={canProceed()}
          submitLabel="Update Member">
          <form className="space-y-6">{renderStepContent()}</form>
        </MultiStepForm>
      </DialogContent>
    </Dialog>
  );
}
