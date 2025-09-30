'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  PhilippineAddressSelector,
  AddressData
} from '@/components/ui/philippine-address-selector';
import {
  MultiStepForm,
  Step,
  PersonalInfoStep,
  AddressStep,
  ContactStep,
  EmergencyContactStep,
  MedicalStep,
  LivingConditionsStep,
  BeneficiariesStep
} from './multi-step-form';
import {
  X,
  Plus,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  AlertTriangle,
  Edit,
  Home,
  Users,
  Camera
} from 'lucide-react';
import type { SeniorCitizen } from '@/types/property';
import { toast } from 'sonner';

const beneficiarySchema = z.object({
  name: z.string().min(2, 'Beneficiary name must be at least 2 characters'),
  relationship: z.string().min(2, 'Relationship is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string().optional(),
  contactPhone: z.string().optional(),
  occupation: z.string().optional(),
  monthlyIncome: z
    .number()
    .min(0, 'Monthly income must be 0 or greater')
    .optional(),
  isDependent: z.boolean().default(false)
});

const editSeniorSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(date => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      let calculatedAge = age;
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        calculatedAge--;
      }

      return calculatedAge >= 60;
    }, 'Senior citizen must be at least 60 years old'),
  gender: z.enum(['male', 'female', 'other']),
  barangay: z.string().min(1, 'Barangay is required'),
  barangayCode: z.string().min(1, 'Barangay code is required'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  addressData: z
    .object({
      region: z
        .object({
          region_code: z.string(),
          region_name: z.string()
        })
        .optional(),
      province: z
        .object({
          province_code: z.string(),
          province_name: z.string()
        })
        .optional(),
      city: z
        .object({
          city_code: z.string(),
          city_name: z.string()
        })
        .optional(),
      barangay: z
        .object({
          brgy_code: z.string(),
          brgy_name: z.string()
        })
        .optional()
    })
    .optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactRelationship: z.string().optional(),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z
    .string()
    .min(10, 'Emergency contact phone is required'),
  emergencyContactRelationship: z
    .string()
    .min(2, 'Emergency contact relationship is required'),
  medicalConditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  seniorIdPhoto: z.string().optional(),
  profilePicture: z.string().optional(),
  // New fields
  housingCondition: z.enum([
    'owned',
    'rented',
    'with_family',
    'institution',
    'other'
  ]),
  physicalHealthCondition: z.enum([
    'excellent',
    'good',
    'fair',
    'poor',
    'critical'
  ]),
  monthlyIncome: z.number().min(0, 'Monthly income must be 0 or greater'),
  monthlyPension: z.number().min(0, 'Monthly pension must be 0 or greater'),
  livingCondition: z.enum([
    'independent',
    'with_family',
    'with_caregiver',
    'institution',
    'other'
  ]),
  beneficiaries: z.array(beneficiarySchema).default([]),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'deceased'])
});

type EditSeniorFormData = z.infer<typeof editSeniorSchema>;

interface EditSeniorModalProps {
  isOpen: boolean;
  onClose: () => void;
  senior: SeniorCitizen;
  onSuccess: () => void;
}

export function EditSeniorModal({
  isOpen,
  onClose,
  senior,
  onSuccess
}: EditSeniorModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [addressData, setAddressData] = useState<AddressData>({});
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger
  } = useForm<EditSeniorFormData>({
    resolver: zodResolver(editSeniorSchema)
  });

  // Calculate age when date of birth changes
  const watchDateOfBirth = watch('dateOfBirth');

  useEffect(() => {
    if (watchDateOfBirth) {
      const birthDate = new Date(watchDateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      setCalculatedAge(age);
    } else {
      setCalculatedAge(null);
    }
  }, [watchDateOfBirth]);

  // Define steps
  const steps: Step[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic personal details',
      icon: User,
      isCompleted: false,
      isRequired: true
    },
    {
      id: 'photos',
      title: 'Photos & Identification',
      description: 'Profile picture and ID photo',
      icon: Camera,
      isCompleted: false,
      isRequired: false
    },
    {
      id: 'address',
      title: 'Address Information',
      description: 'Location and address details',
      icon: MapPin,
      isCompleted: false,
      isRequired: true
    },
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'Primary contact details',
      icon: Phone,
      isCompleted: false,
      isRequired: false
    },
    {
      id: 'emergency',
      title: 'Emergency Contact',
      description: 'Emergency contact information',
      icon: AlertTriangle,
      isCompleted: false,
      isRequired: true
    },
    {
      id: 'medical',
      title: 'Medical Information',
      description: 'Health conditions and medications',
      icon: FileText,
      isCompleted: false,
      isRequired: false
    },
    {
      id: 'living',
      title: 'Living Conditions',
      description: 'Housing and income information',
      icon: Home,
      isCompleted: false,
      isRequired: true
    },
    {
      id: 'beneficiaries',
      title: 'Beneficiaries',
      description: 'Family members and dependents',
      icon: Users,
      isCompleted: false,
      isRequired: false
    }
  ];

  // Pre-fill form with senior data
  useEffect(() => {
    if (senior && isOpen) {
      setValue('firstName', senior.firstName || '');
      setValue('lastName', senior.lastName || '');
      setValue('dateOfBirth', senior.dateOfBirth);
      setValue('gender', senior.gender);
      setValue('barangay', senior.barangay);
      setValue('barangayCode', senior.barangayCode);
      setValue('address', senior.address);
      setValue('contactPerson', senior.contactPerson || '');
      setValue('contactPhone', senior.contactPhone || '');
      setValue('contactRelationship', senior.contactRelationship || '');
      setValue('emergencyContactName', senior.emergencyContactName || '');
      setValue('emergencyContactPhone', senior.emergencyContactPhone || '');
      setValue(
        'emergencyContactRelationship',
        senior.emergencyContactRelationship || ''
      );
      setValue('notes', senior.notes || '');
      setValue('status', senior.status);
      // New fields - with fallback values for the form
      setValue('housingCondition', senior.housingCondition || 'owned');
      setValue(
        'physicalHealthCondition',
        senior.physicalHealthCondition || 'good'
      );
      setValue('monthlyIncome', senior.monthlyIncome || 0);
      setValue('monthlyPension', senior.monthlyPension || 0);
      setValue('livingCondition', senior.livingCondition || 'independent');
      setValue('profilePicture', senior.profilePicture || '');

      setMedicalConditions(senior.medicalConditions || []);
      setMedications(senior.medications || []);
      setBeneficiaries(senior.beneficiaries || []);
      setProfilePicture(senior.profilePicture || '');

      // Set address data if available
      if (senior.addressData) {
        setAddressData(senior.addressData);
      }
    }
  }, [senior, isOpen, setValue]);

  // Validation functions for each step
  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 0: // Personal Information
        return await trigger([
          'firstName',
          'lastName',
          'dateOfBirth',
          'gender',
          'status'
        ]);
      case 1: // Photos & Identification
        return true; // Optional step
      case 2: // Address Information
        return await trigger(['barangay', 'barangayCode', 'address']);
      case 3: // Contact Information
        return true; // Optional step
      case 4: // Emergency Contact
        return await trigger([
          'emergencyContactName',
          'emergencyContactPhone',
          'emergencyContactRelationship'
        ]);
      case 5: // Medical Information
        return true; // Optional step
      case 6: // Living Conditions
        return await trigger([
          'housingCondition',
          'physicalHealthCondition',
          'monthlyIncome',
          'monthlyPension',
          'livingCondition'
        ]);
      case 7: // Beneficiaries
        return true; // Optional step
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const onSubmit = async (data: EditSeniorFormData) => {
    setIsLoading(true);

    try {
      // Import the API
      const { SeniorCitizensAPI } = await import('@/lib/api/senior-citizens');

      // Prepare the data for the API
      const apiData = {
        id: senior.id,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        barangay: data.barangay,
        barangayCode: data.barangayCode,
        address: data.address,
        addressData,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        contactRelationship: data.contactRelationship,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactRelationship: data.emergencyContactRelationship,
        medicalConditions,
        medications,
        notes: data.notes,
        housingCondition: data.housingCondition,
        physicalHealthCondition: data.physicalHealthCondition,
        monthlyIncome: data.monthlyIncome,
        monthlyPension: data.monthlyPension,
        livingCondition: data.livingCondition,
        profilePicture,
        seniorIdPhoto: data.seniorIdPhoto,
        beneficiaries
      };

      console.log('Updating senior citizen:', apiData);

      const result = await SeniorCitizensAPI.updateSeniorCitizen(apiData);

      if (result.success) {
        console.log('Senior citizen updated successfully:', result.data);

        toast.success('Senior citizen updated successfully!', {
          style: {
            background: '#10B981',
            color: '#FFFFFF',
            border: '1px solid #059669'
          },
          duration: 4000
        });

        onSuccess();
      } else {
        throw new Error('Failed to update senior citizen');
      }
    } catch (error) {
      console.error('Error updating senior citizen:', error);
      toast.error('Failed to update senior citizen', {
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
          border: '1px solid #DC2626'
        },
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCondition = () => {
    if (
      newCondition.trim() &&
      !medicalConditions.includes(newCondition.trim())
    ) {
      setMedicalConditions([...medicalConditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (condition: string) => {
    setMedicalConditions(medicalConditions.filter(c => c !== condition));
  };

  const handleAddMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication('');
    }
  };

  const handleRemoveMedication = (medication: string) => {
    setMedications(medications.filter(m => m !== medication));
  };

  const handleClose = () => {
    reset();
    setMedicalConditions([]);
    setMedications([]);
    setBeneficiaries([]);
    setAddressData({});
    setNewCondition('');
    setNewMedication('');
    setCurrentStep(0);
    onClose();
  };

  // Check if current step can proceed
  const canProceed = (): boolean => {
    const formValues = watch();
    switch (currentStep) {
      case 0: // Personal Information
        return !!(
          formValues.firstName &&
          formValues.lastName &&
          formValues.dateOfBirth &&
          formValues.gender &&
          formValues.status
        );
      case 1: // Photos & Identification
        return true; // Optional
      case 2: // Address Information
        return !!(
          formValues.barangay &&
          formValues.barangayCode &&
          formValues.address
        );
      case 3: // Contact Information
        return true; // Optional
      case 4: // Emergency Contact
        return !!(
          formValues.emergencyContactName &&
          formValues.emergencyContactPhone &&
          formValues.emergencyContactRelationship
        );
      case 5: // Medical Information
        return true; // Optional
      case 6: // Living Conditions
        return !!(
          formValues.housingCondition &&
          formValues.physicalHealthCondition &&
          formValues.monthlyIncome !== undefined &&
          formValues.monthlyPension !== undefined &&
          formValues.livingCondition
        );
      case 7: // Beneficiaries
        return true; // Optional
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <PersonalInfoStep>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-[#333333] font-medium">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-[#333333] font-medium">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="dateOfBirth"
                  className="text-[#333333] font-medium">
                  Date of Birth *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('dateOfBirth')}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-[#333333] font-medium">
                  Gender *
                </Label>
                <Select
                  value={watch('gender') || 'other'}
                  onValueChange={value =>
                    setValue('gender', value as 'male' | 'female' | 'other')
                  }>
                  <SelectTrigger className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-red-500 text-sm">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-[#333333] font-medium">
                  Status *
                </Label>
                <Select
                  value={watch('status') || 'active'}
                  onValueChange={value =>
                    setValue(
                      'status',
                      value as 'active' | 'inactive' | 'deceased'
                    )
                  }>
                  <SelectTrigger className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="deceased">Deceased</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-red-500 text-sm">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
          </PersonalInfoStep>
        );

      case 1: // Photos & Identification
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Picture */}
              <div className="space-y-4">
                <Label className="text-[#333333] font-semibold text-lg block">
                  Profile Picture
                </Label>
                <div className="border-2 border-dashed border-[#E0DDD8] rounded-2xl p-6 text-center hover:border-[#00af8f] transition-colors duration-200">
                  {profilePicture ? (
                    <div className="space-y-4">
                      <img
                        src={profilePicture}
                        alt="Profile preview"
                        className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-[#00af8f]"
                      />
                      <div className="space-y-2">
                        <p className="text-sm text-[#666666]">
                          Profile picture uploaded
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setProfilePicture('')}
                          className="border-red-300 text-red-600 hover:bg-red-50">
                          Remove Picture
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-[#00af8f]/10 rounded-full flex items-center justify-center mx-auto">
                        <Camera className="w-8 h-8 text-[#00af8f]" />
                      </div>
                      <div>
                        <p className="text-[#333333] font-medium mb-1">
                          Upload Profile Picture
                        </p>
                        <p className="text-sm text-[#666666] mb-4">
                          Choose a clear photo for identification
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = e => {
                                const result = e.target?.result as string;
                                setProfilePicture(result);
                                setValue('profilePicture', result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="block w-full text-sm text-[#666666] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#00af8f] file:text-white hover:file:bg-[#00af90] file:cursor-pointer cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Senior ID Photo */}
              <div className="space-y-4">
                <Label className="text-[#333333] font-semibold text-lg block">
                  Senior ID Photo
                </Label>
                <div className="border-2 border-dashed border-[#E0DDD8] rounded-2xl p-6 text-center hover:border-[#00af8f] transition-colors duration-200">
                  {watch('seniorIdPhoto') ? (
                    <div className="space-y-4">
                      <img
                        src={watch('seniorIdPhoto')}
                        alt="ID preview"
                        className="w-32 h-20 object-cover rounded-lg mx-auto border-2 border-[#00af8f]"
                      />
                      <div className="space-y-2">
                        <p className="text-sm text-[#666666]">
                          ID photo uploaded
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setValue('seniorIdPhoto', '')}
                          className="border-red-300 text-red-600 hover:bg-red-50">
                          Remove Photo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-[#00af8f]/10 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="w-8 h-8 text-[#00af8f]" />
                      </div>
                      <div>
                        <p className="text-[#333333] font-medium mb-1">
                          Upload ID Photo
                        </p>
                        <p className="text-sm text-[#666666] mb-4">
                          Valid government ID or senior citizen ID
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = e => {
                                const result = e.target?.result as string;
                                setValue('seniorIdPhoto', result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="block w-full text-sm text-[#666666] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#00af8f] file:text-white hover:file:bg-[#00af90] file:cursor-pointer cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Address Information
        return (
          <AddressStep>
            <div className="space-y-4">
              <PhilippineAddressSelector
                value={addressData}
                onChange={data => {
                  setAddressData(data);
                  if (data.barangay) {
                    setValue('barangay', data.barangay.brgy_name);
                    setValue('barangayCode', data.barangay.brgy_code);
                  }
                  if (
                    data.region &&
                    data.province &&
                    data.city &&
                    data.barangay
                  ) {
                    const fullAddress = `${data.barangay.brgy_name}, ${data.city.city_name}, ${data.province.province_name}, ${data.region.region_name}`;
                    setValue('address', fullAddress);
                  }
                }}
                required={true}
                className="w-full"
              />

              <div className="space-y-2">
                <Label htmlFor="address" className="text-[#333333] font-medium">
                  Additional Address Details
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter street address, building number, or additional details"
                  className="min-h-[80px] text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('address')}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </AddressStep>
        );

      case 3: // Contact Information
        return (
          <ContactStep>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="contactPerson"
                  className="text-[#333333] font-medium">
                  Contact Person
                </Label>
                <Input
                  id="contactPerson"
                  placeholder="Enter contact person name"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('contactPerson')}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="contactPhone"
                  className="text-[#333333] font-medium">
                  Contact Phone
                </Label>
                <Input
                  id="contactPhone"
                  placeholder="Enter contact phone"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('contactPhone')}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="contactRelationship"
                  className="text-[#333333] font-medium">
                  Relationship
                </Label>
                <Input
                  id="contactRelationship"
                  placeholder="e.g., Son, Daughter"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('contactRelationship')}
                />
              </div>
            </div>
          </ContactStep>
        );

      case 4: // Emergency Contact
        return (
          <EmergencyContactStep>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="emergencyContactName"
                  className="text-[#333333] font-medium">
                  Emergency Contact Name *
                </Label>
                <Input
                  id="emergencyContactName"
                  placeholder="Enter emergency contact name"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('emergencyContactName')}
                />
                {errors.emergencyContactName && (
                  <p className="text-red-500 text-sm">
                    {errors.emergencyContactName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="emergencyContactPhone"
                  className="text-[#333333] font-medium">
                  Emergency Contact Phone *
                </Label>
                <Input
                  id="emergencyContactPhone"
                  placeholder="Enter emergency contact phone"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('emergencyContactPhone')}
                />
                {errors.emergencyContactPhone && (
                  <p className="text-red-500 text-sm">
                    {errors.emergencyContactPhone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="emergencyContactRelationship"
                  className="text-[#333333] font-medium">
                  Relationship *
                </Label>
                <Input
                  id="emergencyContactRelationship"
                  placeholder="e.g., Son, Daughter, Spouse"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('emergencyContactRelationship')}
                />
                {errors.emergencyContactRelationship && (
                  <p className="text-red-500 text-sm">
                    {errors.emergencyContactRelationship.message}
                  </p>
                )}
              </div>
            </div>
          </EmergencyContactStep>
        );

      case 5: // Medical Information
        return (
          <MedicalStep>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-[#333333] font-medium">
                  Medical Conditions
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add medical condition"
                    value={newCondition}
                    onChange={e => setNewCondition(e.target.value)}
                    className="flex-1 h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCondition}
                    className="bg-[#00af8f] hover:bg-[#00af90] text-white px-4">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {medicalConditions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {medicalConditions.map((condition, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm">
                        {condition}
                        <button
                          type="button"
                          onClick={() => handleRemoveCondition(condition)}
                          className="ml-2 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-[#333333] font-medium">
                  Medications
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add medication"
                    value={newMedication}
                    onChange={e => setNewMedication(e.target.value)}
                    className="flex-1 h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  />
                  <Button
                    type="button"
                    onClick={handleAddMedication}
                    className="bg-[#00af8f] hover:bg-[#00af90] text-white px-4">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {medications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {medications.map((medication, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {medication}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(medication)}
                          className="ml-2 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-[#333333] font-medium">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes or special requirements"
                  className="min-h-[80px] text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('notes')}
                />
              </div>
            </div>
          </MedicalStep>
        );

      case 6: // Living Conditions & Income
        return (
          <LivingConditionsStep>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="housingCondition"
                  className="text-[#333333] font-medium">
                  Housing Condition *
                </Label>
                <Select
                  value={watch('housingCondition') || 'owned'}
                  onValueChange={value =>
                    setValue('housingCondition', value as any)
                  }>
                  <SelectTrigger className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
                    <SelectValue placeholder="Select housing condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="with_family">
                      Living with Family
                    </SelectItem>
                    <SelectItem value="institution">Institution</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.housingCondition && (
                  <p className="text-red-500 text-sm">
                    {errors.housingCondition.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="physicalHealthCondition"
                  className="text-[#333333] font-medium">
                  Physical Health Condition *
                </Label>
                <Select
                  value={watch('physicalHealthCondition') || 'good'}
                  onValueChange={value =>
                    setValue('physicalHealthCondition', value as any)
                  }>
                  <SelectTrigger className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
                    <SelectValue placeholder="Select health condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                {errors.physicalHealthCondition && (
                  <p className="text-red-500 text-sm">
                    {errors.physicalHealthCondition.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="monthlyIncome"
                  className="text-[#333333] font-medium">
                  Monthly Income (₱) *
                </Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="Enter monthly income"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('monthlyIncome', { valueAsNumber: true })}
                />
                {errors.monthlyIncome && (
                  <p className="text-red-500 text-sm">
                    {errors.monthlyIncome.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="monthlyPension"
                  className="text-[#333333] font-medium">
                  Monthly Pension (₱) *
                </Label>
                <Input
                  id="monthlyPension"
                  type="number"
                  placeholder="Enter monthly pension"
                  className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                  {...register('monthlyPension', { valueAsNumber: true })}
                />
                {errors.monthlyPension && (
                  <p className="text-red-500 text-sm">
                    {errors.monthlyPension.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="livingCondition"
                  className="text-[#333333] font-medium">
                  Living Condition *
                </Label>
                <Select
                  value={watch('livingCondition') || 'independent'}
                  onValueChange={value =>
                    setValue('livingCondition', value as any)
                  }>
                  <SelectTrigger className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
                    <SelectValue placeholder="Select living condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="independent">Independent</SelectItem>
                    <SelectItem value="with_family">
                      Living with Family
                    </SelectItem>
                    <SelectItem value="with_caregiver">
                      With Caregiver
                    </SelectItem>
                    <SelectItem value="institution">In Institution</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.livingCondition && (
                  <p className="text-red-500 text-sm">
                    {errors.livingCondition.message}
                  </p>
                )}
              </div>
            </div>
          </LivingConditionsStep>
        );

      case 7: // Beneficiaries
        return (
          <BeneficiariesStep>
            <div className="space-y-4">
              {beneficiaries.map((beneficiary, index) => (
                <div
                  key={index}
                  className="p-4 border-2 border-[#E0DDD8] rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-[#333333]">
                      Beneficiary {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newBeneficiaries = beneficiaries.filter(
                          (_, i) => i !== index
                        );
                        setBeneficiaries(newBeneficiaries);
                      }}
                      className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Name *
                      </Label>
                      <Input
                        placeholder="Enter beneficiary name"
                        value={beneficiary.name || ''}
                        onChange={e => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].name = e.target.value;
                          setBeneficiaries(newBeneficiaries);
                        }}
                        className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Relationship *
                      </Label>
                      <Input
                        placeholder="e.g., Son, Daughter, Grandchild"
                        value={beneficiary.relationship || ''}
                        onChange={e => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].relationship = e.target.value;
                          setBeneficiaries(newBeneficiaries);
                        }}
                        className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Date of Birth *
                      </Label>
                      <Input
                        type="date"
                        value={beneficiary.dateOfBirth || ''}
                        onChange={e => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].dateOfBirth = e.target.value;
                          setBeneficiaries(newBeneficiaries);
                        }}
                        className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Gender *
                      </Label>
                      <Select
                        value={beneficiary.gender || 'other'}
                        onValueChange={value => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].gender = value as
                            | 'male'
                            | 'female'
                            | 'other';
                          setBeneficiaries(newBeneficiaries);
                        }}>
                        <SelectTrigger className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Address
                      </Label>
                      <Input
                        placeholder="Enter address"
                        value={beneficiary.address || ''}
                        onChange={e => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].address = e.target.value;
                          setBeneficiaries(newBeneficiaries);
                        }}
                        className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Contact Phone
                      </Label>
                      <Input
                        placeholder="Enter contact phone"
                        value={beneficiary.contactPhone || ''}
                        onChange={e => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].contactPhone = e.target.value;
                          setBeneficiaries(newBeneficiaries);
                        }}
                        className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Occupation
                      </Label>
                      <Input
                        placeholder="Enter occupation"
                        value={beneficiary.occupation || ''}
                        onChange={e => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].occupation = e.target.value;
                          setBeneficiaries(newBeneficiaries);
                        }}
                        className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#333333] font-medium">
                        Monthly Income (₱)
                      </Label>
                      <Input
                        type="number"
                        placeholder="Enter monthly income"
                        value={beneficiary.monthlyIncome || ''}
                        onChange={e => {
                          const newBeneficiaries = [...beneficiaries];
                          newBeneficiaries[index].monthlyIncome =
                            parseFloat(e.target.value) || 0;
                          setBeneficiaries(newBeneficiaries);
                        }}
                        className="h-12 text-lg border-2 border-[#E0DDD8] focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`dependent-${index}`}
                      checked={beneficiary.isDependent || false}
                      onChange={e => {
                        const newBeneficiaries = [...beneficiaries];
                        newBeneficiaries[index].isDependent = e.target.checked;
                        setBeneficiaries(newBeneficiaries);
                      }}
                      className="w-4 h-4 text-[#00af8f] border-[#E0DDD8] rounded focus:ring-[#00af8f]"
                    />
                    <Label
                      htmlFor={`dependent-${index}`}
                      className="text-[#333333] font-medium">
                      Is Dependent
                    </Label>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                onClick={() => {
                  setBeneficiaries([
                    ...beneficiaries,
                    {
                      name: '',
                      relationship: '',
                      dateOfBirth: '',
                      gender: 'other',
                      address: '',
                      contactPhone: '',
                      occupation: '',
                      monthlyIncome: 0,
                      isDependent: false
                    }
                  ]);
                }}
                className="bg-[#00af8f] hover:bg-[#00af90] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Beneficiary
              </Button>
            </div>
          </BeneficiariesStep>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff] border-0 shadow-2xl rounded-3xl">
        <DialogHeader className="pb-6 border-b border-[#E0DDD8]/30">
          <DialogTitle className="flex items-center gap-3 text-3xl font-bold text-[#333333]">
            <div className="w-12 h-12 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-2xl flex items-center justify-center shadow-lg">
              <Edit className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-[#00af8f] to-[#00af90] bg-clip-text text-transparent">
                Edit Senior Citizen
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-[#666666] text-lg mt-2 ml-15">
            Update senior citizen information. Complete all required steps to
            save the changes.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(95vh-140px)] scrollbar-thin scrollbar-thumb-[#E0DDD8] scrollbar-track-transparent">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <MultiStepForm
              steps={steps}
              currentStep={currentStep}
              onStepChange={handleStepChange}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSubmit={handleSubmit(onSubmit)}
              isSubmitting={isLoading}
              canProceed={canProceed()}
              submitLabel="Update Senior Citizen">
              {renderStepContent()}
            </MultiStepForm>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
