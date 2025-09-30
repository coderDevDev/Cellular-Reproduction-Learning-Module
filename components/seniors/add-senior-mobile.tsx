'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  PhilippineAddressSelector,
  AddressData
} from '@/components/ui/philippine-address-selector';
import {
  X,
  Plus,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  AlertTriangle,
  Home,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { BascaMembersAPI } from '@/lib/api/basca-members';
import React, { useRef } from 'react';
import type { SeniorCitizen } from '@/types/property';
import { getOfflineDB } from '@/lib/db/offline-db';

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

const addSeniorSchema = z.object({
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
  email: z.string().email('Please enter a valid email address')
});

type AddSeniorFormData = z.infer<typeof addSeniorSchema>;

interface AddSeniorMobileProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'create' | 'edit';
  initialData?: any; // Accept API-shaped senior with possible snake_case and joined users
}

const steps = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Basic personal details',
    icon: User,
    isRequired: true
  },
  {
    id: 'address',
    title: 'Address Information',
    description: 'Location and address details',
    icon: MapPin,
    isRequired: true
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'Primary contact details',
    icon: Phone,
    isRequired: false
  },
  {
    id: 'emergency',
    title: 'Emergency Contact',
    description: 'Emergency contact information',
    icon: AlertTriangle,
    isRequired: true
  },
  {
    id: 'medical',
    title: 'Medical Information',
    description: 'Health conditions and medications',
    icon: FileText,
    isRequired: false
  },
  {
    id: 'living',
    title: 'Living Conditions',
    description: 'Housing and income information',
    icon: Home,
    isRequired: true
  },
  {
    id: 'beneficiaries',
    title: 'Beneficiaries',
    description: 'Family members and dependents',
    icon: Users,
    isRequired: false
  },
  {
    id: 'credentials',
    title: 'Login Credentials',
    description: 'Email and password setup',
    icon: User,
    isRequired: true
  }
];

export function AddSeniorMobile({
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  initialData
}: AddSeniorMobileProps) {
  const { authState } = useAuth();
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
  const [isScrollable, setIsScrollable] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<AddSeniorFormData>({
    resolver: zodResolver(addSeniorSchema),
    defaultValues: {
      gender: 'other',
      medicalConditions: [],
      medications: [],
      housingCondition: 'owned',
      physicalHealthCondition: 'good',
      monthlyIncome: 0,
      monthlyPension: 0,
      livingCondition: 'independent',
      beneficiaries: [],
      email: ''
    }
  });

  // Calculate age when date of birth changes
  const watchDateOfBirth = form.watch('dateOfBirth');

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

  useEffect(() => {
    if (isOpen) {
      // If editing, prefill values from initialData
      if (mode === 'edit' && initialData) {
        const s: any = initialData;
        const firstName =
          s.firstName ?? s.first_name ?? s.users?.first_name ?? '';
        const lastName = s.lastName ?? s.last_name ?? s.users?.last_name ?? '';
        const email = s.email ?? s.users?.email ?? '';
        const phone = s.phone ?? s.users?.phone ?? s.contact_phone ?? '';
        const barangay = s.barangay ?? '';
        const barangayCode = s.barangayCode ?? s.barangay_code ?? '';
        const address = s.address ?? '';
        const dateOfBirth = s.dateOfBirth ?? s.date_of_birth ?? '';
        const gender = s.gender ?? 'other';
        const emergencyContactName =
          s.emergencyContactName ?? s.emergency_contact_name ?? '';
        const emergencyContactPhone =
          s.emergencyContactPhone ?? s.emergency_contact_phone ?? '';
        const emergencyContactRelationship =
          s.emergencyContactRelationship ??
          s.emergency_contact_relationship ??
          '';
        const medicalConds = s.medicalConditions ?? s.medical_conditions ?? [];
        const meds = s.medications ?? s.medications ?? [];
        const housingCondition =
          s.housingCondition ?? s.housing_condition ?? 'owned';
        const physicalHealthCondition =
          s.physicalHealthCondition ?? s.physical_health_condition ?? 'good';
        const monthlyIncome = s.monthlyIncome ?? s.monthly_income ?? 0;
        const monthlyPension = s.monthlyPension ?? s.monthly_pension ?? 0;
        const livingCondition =
          s.livingCondition ?? s.living_condition ?? 'independent';
        const seniorIdPhoto = s.seniorIdPhoto ?? s.senior_id_photo ?? '';
        const profilePic = s.profilePicture ?? s.profile_picture ?? '';
        const notes = s.notes ?? '';

        setMedicalConditions(medicalConds);
        setMedications(meds);
        setProfilePicture(profilePic);
        if (Array.isArray(s.beneficiaries)) {
          // beneficiaries may come joined in snake_case
          const mapped = s.beneficiaries.map((b: any) => ({
            name: b.name,
            relationship: b.relationship,
            dateOfBirth: b.dateOfBirth ?? b.date_of_birth ?? '',
            gender: b.gender ?? 'other',
            address: b.address ?? '',
            contactPhone: b.contactPhone ?? b.contact_phone ?? '',
            occupation: b.occupation ?? '',
            monthlyIncome: b.monthlyIncome ?? b.monthly_income ?? 0,
            isDependent: b.isDependent ?? b.is_dependent ?? false
          }));
          setBeneficiaries(mapped);
        }

        form.reset({
          firstName,
          lastName,
          email,
          contactPhone: phone,
          barangay,
          barangayCode,
          address,
          dateOfBirth,
          gender,
          emergencyContactName,
          emergencyContactPhone,
          emergencyContactRelationship,
          medicalConditions: medicalConds,
          medications: meds,
          housingCondition,
          physicalHealthCondition,
          monthlyIncome,
          monthlyPension,
          livingCondition,
          seniorIdPhoto,
          profilePicture: profilePic,
          beneficiaries,
          notes
        } as any);
      }

      // Pre-fill barangay from logged-in user
      if (authState.user?.barangay) {
        form.setValue('barangay', authState.user.barangay);
        // You might need to set barangayCode as well based on your data structure
      }

      // Fetch current user's BASCA member data and pre-fill address selection
      if (authState.user?.id) {
        const fetchBascaMember = async () => {
          try {
            const bascaMember = await BascaMembersAPI.getCurrentUserBascaMember(
              authState.user!.id
            );
            if (bascaMember && bascaMember.addressData) {
              setAddressData(bascaMember.addressData);

              // Construct and pre-fill detailed address
              const { region, province, city, barangay } =
                bascaMember.addressData;
              let fullAddress = '';
              if (barangay?.brgy_name) fullAddress += `${barangay.brgy_name}, `;
              if (city?.city_name) fullAddress += `${city.city_name}, `;
              if (province?.province_name)
                fullAddress += `${province.province_name}, `;
              if (region?.region_name) fullAddress += `${region.region_name}`;

              // Remove trailing comma and space if any
              fullAddress = fullAddress.replace(/, $/, '');

              form.setValue('address', fullAddress);
              form.setValue('barangayCode', barangay?.brgy_code || ''); // Ensure barangayCode is set
              form.setValue('barangay', barangay?.brgy_name || ''); // Set barangay name for form validation

              console.log('Pre-filled address data:', {
                fullAddress,
                barangayCode: barangay?.brgy_code,
                barangay: barangay?.brgy_name,
                addressData: bascaMember.addressData
              });
            }
          } catch (error) {
            console.error('Error fetching BASCA member data:', error);
            // Don't show error toast as this is optional
          }
        };
        fetchBascaMember();
      }
    }
  }, [isOpen, authState.user, form]);

  // Check scrollability when step changes or content updates
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const element = scrollContainerRef.current;
        const isScrollable = element.scrollHeight > element.clientHeight;
        setIsScrollable(isScrollable);
      }
    };

    // Check after a short delay to ensure content is rendered
    const timer = setTimeout(checkScroll, 100);

    return () => clearTimeout(timer);
  }, [currentStep, form.watch()]);

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 0: // Personal Information
        return await form.trigger([
          'firstName',
          'lastName',
          'dateOfBirth',
          'gender'
        ]);
      case 1: // Address Information
        // Only validate 'address' as barangay is now derived/pre-filled
        return await form.trigger(['address']);
      case 2: // Contact Information
        return true; // Optional step
      case 3: // Emergency Contact
        return await form.trigger([
          'emergencyContactName',
          'emergencyContactPhone',
          'emergencyContactRelationship'
        ]);
      case 4: // Medical Information
        return true; // Optional step
      case 5: // Living Conditions
        return await form.trigger([
          'housingCondition',
          'physicalHealthCondition',
          'monthlyIncome',
          'monthlyPension',
          'livingCondition'
        ]);
      case 6: // Beneficiaries
        return true; // Optional step
      case 7: // Login Credentials
        return await form.trigger(['email']);
      default:
        return true;
    }
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
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const canProceed = (): boolean => {
    const formValues = form.watch();
    console.log('canProceed called for step:', currentStep);
    console.log('Form values:', formValues);

    switch (currentStep) {
      case 0: // Personal Information
        const personalValid = !!(
          formValues.firstName &&
          formValues.lastName &&
          formValues.dateOfBirth &&
          formValues.gender
        );
        console.log('Personal step valid:', personalValid);
        return personalValid;
      case 1: // Address Information
        // Only check for 'address' as barangay is now derived/pre-filled
        const addressValid = !!(
          formValues.address &&
          addressData.region &&
          addressData.province &&
          addressData.city &&
          addressData.barangay
        );
        console.log('Address step valid:', addressValid);
        return addressValid;
      case 2: // Contact Information
        console.log('Contact step - optional, returning true');
        return true; // Optional
      case 3: // Emergency Contact
        const emergencyValid = !!(
          formValues.emergencyContactName &&
          formValues.emergencyContactPhone &&
          formValues.emergencyContactRelationship
        );
        console.log('Emergency step valid:', emergencyValid);
        return emergencyValid;
      case 4: // Medical Information
        console.log('Medical step - optional, returning true');
        return true; // Optional
      case 5: // Living Conditions
        const livingValid = !!(
          formValues.housingCondition &&
          formValues.physicalHealthCondition &&
          formValues.monthlyIncome !== undefined &&
          formValues.monthlyPension !== undefined &&
          formValues.livingCondition
        );
        console.log('Living step valid:', livingValid);
        return livingValid;
      case 6: // Beneficiaries
        console.log('Beneficiaries step - optional, returning true');
        return true; // Optional

      case 7: // Login Credentials
        const credentialsValid = !!formValues.email;
        console.log('Credentials step valid:', credentialsValid);
        return credentialsValid;

      default:
        console.log('Default case, returning true');
        return true;
    }
  };

  const onSubmit = async (data: AddSeniorFormData) => {
    console.log('onSubmit called with data:', data);
    console.log('Form is valid:', form.formState.isValid);
    console.log('Form errors:', form.formState.errors);
    console.log('Current step:', currentStep);
    console.log('Can proceed:', canProceed());

    setIsLoading(true);

    try {
      // Import the API
      const { SeniorCitizensAPI } = await import('@/lib/api/senior-citizens');
      const isOnline =
        typeof navigator !== 'undefined' ? navigator.onLine : true;

      if (mode === 'edit' && initialData?.id) {
        // Prepare update payload
        const updateData = {
          id: initialData.id,
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
          beneficiaries,
          updatedAt: new Date().toISOString()
        } as any;

        if (!isOnline) {
          const db = await getOfflineDB();
          await db.updateSenior(updateData);
          toast.success('Changes saved offline. They will sync when online.');
        } else {
          console.log('Updating senior citizen:', updateData);
          const result = await SeniorCitizensAPI.updateSeniorCitizen(
            updateData as any
          );

          if (result.success) {
            toast.success('Senior citizen updated successfully');
          } else {
            toast.error(result.message || 'Failed to update senior citizen');
          }
        }
      } else {
        // Ensure a password exists; if not, generate a simple one
        const passwordToUse =
          generatedPassword ||
          (() => {
            const words = [
              'happy',
              'sunny',
              'peace',
              'love',
              'hope',
              'joy',
              'life',
              'good',
              'nice',
              'warm'
            ];
            const numbers = ['123', '456', '789', '2024', '2025'];
            return `${words[Math.floor(Math.random() * words.length)]}${
              numbers[Math.floor(Math.random() * numbers.length)]
            }`;
          })();

        if (!isOnline) {
          // Save to offline DB and queue for sync
          const db = await getOfflineDB();
          const localId =
            (globalThis as any).crypto?.randomUUID?.() ||
            `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          const offlineSenior = {
            id: localId,
            email: data.email,
            password: passwordToUse,
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
            beneficiaries,
            status: 'active',
            registrationDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as any;
          await db.saveSenior(offlineSenior);
          toast.success('Saved offline. Will sync when back online.');
        } else {
          // Prepare the data for the API (create)
          const apiData = {
            email: data.email,
            password: passwordToUse,
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

          console.log('Adding senior citizen:', apiData);
          const result = await SeniorCitizensAPI.createSeniorCitizen(apiData);

          if (result.success) {
            console.log('Senior citizen created successfully:', result.data);
          } else {
            console.error('Failed to create senior citizen:', result.message);
            toast.error(result.message || 'Failed to create senior citizen');
          }
        }
      }

      // Reset form and close modal
      form.reset();
      setMedicalConditions([]);
      setMedications([]);
      setBeneficiaries([]);
      setAddressData({});
      setProfilePicture('');
      setNewCondition('');
      setNewMedication('');
      setCurrentStep(0);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating senior citizen:', error);
      toast.error('Failed to create senior citizen. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCondition = () => {
    const condition = prompt('Enter medical condition:');
    if (condition && condition.trim()) {
      setMedicalConditions(prev => [...prev, condition.trim()]);
    }
  };

  const handleRemoveCondition = (condition: string) => {
    setMedicalConditions(prev => prev.filter(c => c !== condition));
  };

  const handleAddMedication = () => {
    const medication = prompt('Enter medication:');
    if (medication && medication.trim()) {
      setMedications(prev => [...prev, medication.trim()]);
    }
  };

  const handleRemoveMedication = (medication: string) => {
    setMedications(prev => prev.filter(m => m !== medication));
  };

  const handleClose = () => {
    setCurrentStep(0);
    form.reset();
    setMedicalConditions([]);
    setMedications([]);
    setBeneficiaries([]);
    setAddressData({});
    setProfilePicture('');
    setNewCondition('');
    setNewMedication('');
    onClose();
  };

  const checkScrollability = (element: HTMLElement | null) => {
    if (element) {
      const isScrollable = element.scrollHeight > element.clientHeight;
      setIsScrollable(isScrollable);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Info
        return (
          <div className="space-y-6">
            {/* Personal Details Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#00af8f] to-[#00af90] rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Personal Details
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-semibold text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    {...form.register('firstName')}
                    placeholder="Enter first name"
                    className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-semibold text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    {...form.register('lastName')}
                    placeholder="Enter last name"
                    className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="dateOfBirth"
                  className="text-sm font-semibold text-gray-700">
                  Date of Birth *
                </Label>
                <div className="relative group">
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...form.register('dateOfBirth')}
                    className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white pr-12"
                  />
                  <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00af8f] transition-colors duration-200" />
                </div>
                {form.formState.errors.dateOfBirth && (
                  <p className="text-red-500 text-xs flex items-center mt-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {form.formState.errors.dateOfBirth.message}
                  </p>
                )}
                {calculatedAge !== null && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      Age:{' '}
                      <span className="font-bold">
                        {calculatedAge} years old
                      </span>
                    </p>
                  </div>
                )}
                {calculatedAge !== null && calculatedAge < 60 && (
                  <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-800 font-medium">
                      ⚠️ Person must be at least 60 years old to register as a
                      senior citizen
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="gender"
                  className="text-sm font-semibold text-gray-700">
                  Gender *
                </Label>
                <Select
                  onValueChange={value =>
                    form.setValue('gender', value as any)
                  }>
                  <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-gray-200 shadow-lg">
                    <SelectItem
                      value="male"
                      className="rounded-lg hover:bg-[#00af8f]/5">
                      Male
                    </SelectItem>
                    <SelectItem
                      value="female"
                      className="rounded-lg hover:bg-[#00af8f]/5">
                      Female
                    </SelectItem>
                    <SelectItem
                      value="other"
                      className="rounded-lg hover:bg-[#00af8f]/5">
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Photo and ID Upload */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#00af8f] to-[#00af90] rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Photos & Identification
                </h4>
              </div>

              <div className="space-y-4">
                {/* Profile Picture Upload */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-2xl border border-gray-200">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                      <User className="w-4 h-4 mr-2 text-[#00af8f]" />
                      Profile Picture
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-[#00af8f] transition-all duration-200 bg-white">
                      {profilePicture ? (
                        <div className="space-y-3">
                          <div className="relative w-20 h-20 mx-auto">
                            <img
                              src={profilePicture}
                              alt="Profile preview"
                              className="w-full h-full object-cover rounded-2xl shadow-lg"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white border-red-500 hover:bg-red-600 rounded-full shadow-lg"
                              onClick={() => {
                                setProfilePicture('');
                                form.setValue('profilePicture', '');
                              }}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5 rounded-xl"
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
                                    setProfilePicture(result);
                                    form.setValue('profilePicture', result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}>
                            Change Photo
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#00af8f]/10 to-[#00af8f]/20 rounded-2xl flex items-center justify-center">
                            <User className="w-8 h-8 text-[#00af8f]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Upload Profile Picture
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG or JPEG (max 5MB)
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5 rounded-xl"
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
                                    setProfilePicture(result);
                                    form.setValue('profilePicture', result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}>
                            Choose File
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                      <p className="text-xs text-blue-800">
                        <strong>Optional:</strong> A clear, recent photo of the
                        senior citizen for identification purposes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Valid ID Upload */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-2xl border border-gray-200">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-[#00af8f]" />
                      Valid ID Document
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-[#00af8f] transition-all duration-200 bg-white">
                      {form.watch('seniorIdPhoto') ? (
                        <div className="space-y-3">
                          <div className="relative w-20 h-20 mx-auto">
                            <img
                              src={form.watch('seniorIdPhoto')}
                              alt="ID preview"
                              className="w-full h-full object-cover rounded-2xl shadow-lg"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white border-red-500 hover:bg-red-600 rounded-full shadow-lg"
                              onClick={() => {
                                form.setValue('seniorIdPhoto', '');
                              }}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5 rounded-xl"
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
                                    form.setValue('seniorIdPhoto', result);
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
                          <div className="w-16 h-16 bg-gradient-to-br from-[#00af8f]/10 to-[#00af8f]/20 rounded-2xl flex items-center justify-center">
                            <FileText className="w-8 h-8 text-[#00af8f]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Upload Valid ID Document
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG or JPEG (max 5MB)
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5 rounded-xl"
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
                                    form.setValue('seniorIdPhoto', result);
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
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                      <p className="text-xs text-amber-800">
                        <strong>Required:</strong> Upload a clear photo of a
                        valid government ID (e.g., Senior Citizen ID, UMID,
                        Driver's License, Passport).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Address
        return (
          <div className="space-y-6">
            {/* Address Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#00af8f] to-[#00af90] rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Location Details
                </h4>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-2xl border border-gray-200">
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Address Selection *
                </Label>
                <PhilippineAddressSelector
                  value={addressData}
                  onChange={setAddressData}
                  disabled={true}
                />
                <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>Auto-filled:</strong> Address selection is
                    automatically populated from your BASCA member profile.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="address"
                      className="text-sm font-semibold text-gray-700">
                      Detailed Address *
                    </Label>
                    <Badge variant="secondary" className="text-xs">
                      Pre-filled
                    </Badge>
                  </div>

                  {addressData.region &&
                    addressData.province &&
                    addressData.city &&
                    addressData.barangay && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-700">
                          <strong>Pre-filled from your profile:</strong>{' '}
                          {addressData.barangay?.brgy_name},{' '}
                          {addressData.city?.city_name},{' '}
                          {addressData.province?.province_name},{' '}
                          {addressData.region?.region_name}
                        </p>
                      </div>
                    )}
                  <Textarea
                    id="address"
                    {...form.register('address')}
                    placeholder="Address is automatically filled from your profile. You can add additional details like street name, house number, etc."
                    className="min-h-[80px] text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                  />
                  {form.formState.errors.address && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {form.formState.errors.address.message}
                    </p>
                  )}

                  <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-xs text-green-800">
                      💡 <strong>Note:</strong> The address field is
                      automatically populated with your assigned barangay, city,
                      province, and region. You can add specific street details
                      if needed.
                    </p>
                  </div>

                  {addressData.region &&
                    addressData.province &&
                    addressData.city &&
                    addressData.barangay && (
                      <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <p className="text-xs text-emerald-800 flex items-center">
                          <Check className="w-3 h-3 mr-2" />
                          <strong>Ready:</strong> Address information is
                          complete. You can proceed to the next step.
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Contact
        return (
          <div className="space-y-6">
            {/* Contact Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#00af8f] to-[#00af90] rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Contact Details
                </h4>
                <Badge variant="secondary" className="ml-auto text-xs">
                  Optional
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="contactPerson"
                    className="text-sm font-semibold text-gray-700">
                    Contact Person
                  </Label>
                  <Input
                    id="contactPerson"
                    {...form.register('contactPerson')}
                    placeholder="Enter contact person name"
                    className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="contactPhone"
                    className="text-sm font-semibold text-gray-700">
                    Contact Phone
                  </Label>
                  <Input
                    id="contactPhone"
                    {...form.register('contactPhone')}
                    placeholder="Enter contact phone number"
                    className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="contactRelationship"
                    className="text-sm font-semibold text-gray-700">
                    Contact Relationship
                  </Label>
                  <Input
                    id="contactRelationship"
                    {...form.register('contactRelationship')}
                    placeholder="e.g., Son, Daughter, Spouse"
                    className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800 text-center">
                  💡 <strong>Tip:</strong> These contact details are optional
                  but helpful for communication purposes.
                </p>
              </div>
            </div>
          </div>
        );

      case 3: // Emergency Contact
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-[#333333]">Emergency Contact *</h4>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">
                Emergency Contact Name *
              </Label>
              <Input
                id="emergencyContactName"
                {...form.register('emergencyContactName')}
                placeholder="Enter emergency contact name"
                className="h-12 text-base"
              />
              {form.formState.errors.emergencyContactName && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.emergencyContactName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelationship">
                Relationship *
              </Label>
              <Input
                id="emergencyContactRelationship"
                {...form.register('emergencyContactRelationship')}
                placeholder="e.g., Son, Daughter, Spouse"
                className="h-12 text-base"
              />
              {form.formState.errors.emergencyContactRelationship && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.emergencyContactRelationship.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">
                Emergency Contact Phone *
              </Label>
              <Input
                id="emergencyContactPhone"
                {...form.register('emergencyContactPhone')}
                placeholder="Enter emergency contact phone"
                className="h-12 text-base"
              />
              {form.formState.errors.emergencyContactPhone && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.emergencyContactPhone.message}
                </p>
              )}
            </div>
          </div>
        );

      case 4: // Medical
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Medical Conditions</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCondition}
                  className="h-8 px-3">
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              {medicalConditions.length === 0 ? (
                <p className="text-[#666666] text-sm text-center py-4">
                  No medical conditions added
                </p>
              ) : (
                <div className="space-y-2">
                  {medicalConditions.map((condition, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">{condition}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCondition(condition)}
                        className="h-6 w-6 p-0 text-red-500">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Current Medications</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMedication}
                  className="h-8 px-3">
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              {medications.length === 0 ? (
                <p className="text-[#666666] text-sm text-center py-4">
                  No medications added
                </p>
              ) : (
                <div className="space-y-2">
                  {medications.map((medication, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">{medication}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMedication(medication)}
                        className="h-6 w-6 p-0 text-red-500">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 5: // Living Conditions
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="housingCondition">Housing Type *</Label>
              <Select
                onValueChange={value =>
                  form.setValue('housingCondition', value as any)
                }>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select housing type" />
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
              {form.formState.errors.housingCondition && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.housingCondition.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="physicalHealthCondition">
                Physical Health Condition *
              </Label>
              <Select
                onValueChange={value =>
                  form.setValue('physicalHealthCondition', value as any)
                }>
                <SelectTrigger className="h-12 text-base">
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
              {form.formState.errors.physicalHealthCondition && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.physicalHealthCondition.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income (₱) *</Label>
              <Input
                id="monthlyIncome"
                type="number"
                {...form.register('monthlyIncome', {
                  valueAsNumber: true
                })}
                placeholder="Enter monthly income"
                className="h-12 text-base"
              />
              {form.formState.errors.monthlyIncome && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.monthlyIncome.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyPension">Monthly Pension (₱) *</Label>
              <Input
                id="monthlyPension"
                type="number"
                {...form.register('monthlyPension', {
                  valueAsNumber: true
                })}
                placeholder="Enter monthly pension"
                className="h-12 text-base"
              />
              {form.formState.errors.monthlyPension && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.monthlyPension.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="livingCondition">Living Condition *</Label>
              <Select
                onValueChange={value =>
                  form.setValue('livingCondition', value as any)
                }>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select living condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Independent</SelectItem>
                  <SelectItem value="with_family">
                    Living with Family
                  </SelectItem>
                  <SelectItem value="with_caregiver">With Caregiver</SelectItem>
                  <SelectItem value="institution">Institution</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.livingCondition && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.livingCondition.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                {...form.register('notes')}
                placeholder="Any additional information about the senior citizen"
                className="min-h-[80px] text-base"
              />
            </div>
          </div>
        );

      case 6: // Beneficiaries
        return (
          <div className="space-y-6">
            {/* Beneficiaries Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#00af8f] to-[#00af90] rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Family Members & Dependents
                </h4>
                <Badge variant="secondary" className="ml-auto text-xs">
                  Optional
                </Badge>
              </div>

              {beneficiaries.length === 0 ? (
                <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
                  <Users className="w-16 h-16 text-[#00af8f] mx-auto mb-4 opacity-50" />
                  <h4 className="font-medium text-[#333333] mb-2">
                    No Beneficiaries Added
                  </h4>
                  <p className="text-[#666666] text-sm mb-4">
                    Add family members or dependents if needed
                  </p>
                  <Button
                    type="button"
                    variant="outline"
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
                    className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5 rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Beneficiary
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {beneficiaries.map((beneficiary, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-gray-50 to-white p-4 border-2 border-gray-200 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-900">
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
                          className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300 rounded-xl">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">
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
                            className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">
                            Relationship *
                          </Label>
                          <Input
                            placeholder="e.g., Son, Daughter, Grandchild"
                            value={beneficiary.relationship || ''}
                            onChange={e => {
                              const newBeneficiaries = [...beneficiaries];
                              newBeneficiaries[index].relationship =
                                e.target.value;
                              setBeneficiaries(newBeneficiaries);
                            }}
                            className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">
                            Date of Birth *
                          </Label>
                          <Input
                            type="date"
                            value={beneficiary.dateOfBirth || ''}
                            onChange={e => {
                              const newBeneficiaries = [...beneficiaries];
                              newBeneficiaries[index].dateOfBirth =
                                e.target.value;
                              setBeneficiaries(newBeneficiaries);
                            }}
                            className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">
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
                            <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-2 border-gray-200 shadow-lg">
                              <SelectItem
                                value="male"
                                className="rounded-lg hover:bg-[#00af8f]/5">
                                Male
                              </SelectItem>
                              <SelectItem
                                value="female"
                                className="rounded-lg hover:bg-[#00af8f]/5">
                                Female
                              </SelectItem>
                              <SelectItem
                                value="other"
                                className="rounded-lg hover:bg-[#00af8f]/5">
                                Other
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">
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
                            className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">
                            Contact Phone
                          </Label>
                          <Input
                            placeholder="Enter contact phone"
                            value={beneficiary.contactPhone || ''}
                            onChange={e => {
                              const newBeneficiaries = [...beneficiaries];
                              newBeneficiaries[index].contactPhone =
                                e.target.value;
                              setBeneficiaries(newBeneficiaries);
                            }}
                            className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">
                            Occupation
                          </Label>
                          <Input
                            placeholder="Enter occupation"
                            value={beneficiary.occupation || ''}
                            onChange={e => {
                              const newBeneficiaries = [...beneficiaries];
                              newBeneficiaries[index].occupation =
                                e.target.value;
                              setBeneficiaries(newBeneficiaries);
                            }}
                            className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">
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
                            className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 pt-2">
                        <input
                          type="checkbox"
                          id={`dependent-${index}`}
                          checked={beneficiary.isDependent || false}
                          onChange={e => {
                            const newBeneficiaries = [...beneficiaries];
                            newBeneficiaries[index].isDependent =
                              e.target.checked;
                            setBeneficiaries(newBeneficiaries);
                          }}
                          className="w-4 h-4 text-[#00af8f] border-gray-300 rounded focus:ring-[#00af8f] focus:ring-2"
                        />
                        <Label
                          htmlFor={`dependent-${index}`}
                          className="text-sm font-medium text-gray-700">
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
                    className="w-full h-14 bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Another Beneficiary
                  </Button>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800 text-center">
                  💡 <strong>Tip:</strong> Beneficiaries are family members or
                  dependents who may be eligible for benefits or assistance
                  programs.
                </p>
              </div>
            </div>
          </div>
        );

      case 7: // Login Credentials
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#00af8f] to-[#00af90] rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Login Credentials
                </h4>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="Enter email address"
                  className="h-12 text-base border-2 border-gray-200 focus:border-[#00af8f] focus:ring-4 focus:ring-[#00af8f]/10 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-xs flex items-center mt-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Generated Password
                </Label>
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        Password for{' '}
                        {form.watch('firstName') || 'Senior Citizen'}:
                      </p>
                      <p className="text-2xl font-bold text-blue-900 font-mono tracking-wider">
                        {generatedPassword}
                      </p>
                    </div>
                    <div className="ml-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const words = [
                            'happy',
                            'sunny',
                            'peace',
                            'love',
                            'hope',
                            'joy',
                            'life',
                            'good',
                            'nice',
                            'warm'
                          ];
                          const numbers = ['123', '456', '789', '2024', '2025'];
                          const randomWord =
                            words[Math.floor(Math.random() * words.length)];
                          const randomNumber =
                            numbers[Math.floor(Math.random() * numbers.length)];
                          const newPassword = `${randomWord}${randomNumber}`;
                          setGeneratedPassword(newPassword);
                        }}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 This is a simple, memorable password that the senior
                    citizen can easily remember.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Please save these login
                  credentials. The senior citizen will need them to access their
                  account.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-[#00af8f] via-[#00af90] to-[#00af8f] shadow-lg">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-2 text-white hover:bg-white/20 rounded-xl transition-all duration-200">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-center">
            <h2 className="text-xl font-bold text-white mb-1">
              {steps[currentStep].title}
            </h2>
            <p className="text-white/80 text-sm font-medium">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white scrollbar-hide scroll-smooth relative max-h-[calc(100vh-200px)]">
        {/* Top Scroll Fade Indicator */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-50/90 via-gray-50/50 to-transparent h-6 pointer-events-none" />

        <div className="p-4 pb-32">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step Header Card */}
            {/* <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-xl flex items-center justify-center shadow-lg">
                  {React.createElement(steps[currentStep].icon, {
                    className: 'w-5 h-5 text-white'
                  })}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {steps[currentStep].description}
                  </p>
                </div>
              </div>
            </div> */}

            {/* Form Content */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {/* Debug Info */}

              {renderStepContent()}
            </div>
          </form>
        </div>

        {/* Bottom Scroll Fade Indicator */}
        <div className="sticky bottom-0 z-10 bg-gradient-to-t from-gray-50/90 via-gray-50/50 to-transparent h-6 pointer-events-none" />

        {/* Scroll Hint (only visible when content is scrollable) */}
        {isScrollable && (
          <div className="absolute bottom-4 right-4 animate-pulse pointer-events-none">
            <div className="w-2 h-8 bg-gradient-to-b from-[#00af8f]/40 to-[#00af8f]/60 rounded-full shadow-lg"></div>
          </div>
        )}
      </div>

      {/* Mobile Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl">
        <div className="p-4">
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="flex-1 h-14 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium">
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 h-14 bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  // console.log('Submit button clicked!');
                  // console.log('Can proceed:', canProceed());
                  // console.log('Is loading:', isLoading);
                  // console.log('Current step:', currentStep);
                  // console.log('Form values:', form.watch());
                  form.handleSubmit(onSubmit)();
                }}
                disabled={!canProceed() || isLoading}
                className="flex-1 h-14 bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Save Senior Citizen
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="mt-3 flex justify-center">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-[#00af8f] scale-125'
                      : index < currentStep
                      ? 'bg-[#00af8f]/60'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
