export interface Beneficiary {
  id: string;
  seniorCitizenId: string;
  name: string;
  relationship: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address?: string;
  contactPhone?: string;
  occupation?: string;
  monthlyIncome?: number;
  isDependent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeniorCitizen {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  barangay: string;
  barangayCode: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  // New address structure
  addressData?: {
    region?: {
      region_code: string;
      region_name: string;
    };
    province?: {
      province_code: string;
      province_name: string;
    };
    city?: {
      city_code: string;
      city_name: string;
    };
    barangay?: {
      brgy_code: string;
      brgy_name: string;
    };
  };
  contactPerson?: string;
  contactPhone?: string;
  contactRelationship?: string;
  medicalConditions: string[];
  medications: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  oscaId?: string;
  seniorIdPhoto?: string;
  profilePicture?: string;
  documents: string[];
  status: 'active' | 'deceased' | 'inactive';
  registrationDate: string;
  lastMedicalCheckup?: string;
  notes?: string;
  // New fields
  housingCondition:
    | 'owned'
    | 'rented'
    | 'with_family'
    | 'institution'
    | 'other';
  physicalHealthCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  monthlyIncome: number;
  monthlyPension: number;
  livingCondition:
    | 'independent'
    | 'with_family'
    | 'with_caregiver'
    | 'institution'
    | 'other';
  beneficiaries: Beneficiary[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'emergency' | 'benefit' | 'birthday';
  targetBarangay?: string;
  isUrgent: boolean;
  expiresAt?: string;
  smsSent: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  seniorCitizenId: string;
  appointmentType: string;
  appointmentDate: string;
  appointmentTime: string;
  purpose: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRequest {
  id: string;
  seniorCitizenId: string;
  documentType: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Benefit {
  id: string;
  seniorCitizenId: string;
  benefitType: string;
  benefitName: string;
  description?: string;
  amount?: number;
  status: 'active' | 'expired' | 'suspended';
  startDate: string;
  endDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CensusRecord {
  id: string;
  barangay: string;
  barangayCode: string;
  year: number;
  month: number;
  totalSeniors: number;
  activeSeniors: number;
  deceasedSeniors: number;
  newRegistrations: number;
  maleCount: number;
  femaleCount: number;
  createdAt: string;
  updatedAt: string;
}
