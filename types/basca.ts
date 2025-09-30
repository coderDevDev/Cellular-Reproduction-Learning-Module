export interface BascaMember {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  barangay: string;
  barangayCode: string;
  address: string;
  addressData?: {
    region?: { region_code: string; region_name: string };
    province?: { province_code: string; province_name: string };
    city?: { city_code: string; city_name: string };
    barangay?: { brgy_code: string; brgy_name: string };
  };
  position:
    | 'president'
    | 'vice_president'
    | 'secretary'
    | 'treasurer'
    | 'member'
    | 'coordinator';
  department?: string;
  employeeId?: string;
  isActive: boolean;
  joinDate: string;
  profilePicture?: string;
  idPhoto: string;
  notes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  trainingCertifications?: string[];
  lastTrainingDate?: string;
  nextTrainingDate?: string;
  attendanceRate?: number;
  totalMeetingsAttended?: number;
  totalMeetingsConducted?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateBascaMemberData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  barangay: string;
  barangayCode: string;
  address: string;
  addressData?: {
    region?: { region_code: string; region_name: string };
    province?: { province_code: string; province_name: string };
    city?: { city_code: string; city_name: string };
    barangay?: { brgy_code: string; brgy_name: string };
  };
  position:
    | 'president'
    | 'vice_president'
    | 'secretary'
    | 'treasurer'
    | 'member'
    | 'coordinator';
  department?: string;
  employeeId?: string;
  joinDate: string;
  profilePicture?: string;
  idPhoto: string;
  notes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface UpdateBascaMemberData extends Partial<CreateBascaMemberData> {
  id: string;
  isActive?: boolean;
  trainingCertifications?: string[];
  lastTrainingDate?: string;
  nextTrainingDate?: string;
  attendanceRate?: number;
  totalMeetingsAttended?: number;
  totalMeetingsConducted?: number;
}

// New interfaces for BASCA meetings
export interface BascaMeeting {
  id: string;
  title: string;
  description?: string;
  meetingDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  barangay: string;
  barangayCode: string;
  meetingType: 'regular' | 'emergency' | 'training' | 'planning' | 'other';
  agenda: string[];
  minutes?: string;
  attendeesCount: number;
  isConducted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBascaMeetingData {
  title: string;
  description?: string;
  meetingDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  barangay: string;
  barangayCode: string;
  meetingType: 'regular' | 'emergency' | 'training' | 'planning' | 'other';
  agenda: string[];
  minutes?: string;
}

export interface UpdateBascaMeetingData
  extends Partial<CreateBascaMeetingData> {
  id: string;
  attendeesCount?: number;
  isConducted?: boolean;
}

// New interfaces for BASCA training
export interface BascaTrainingSession {
  id: string;
  title: string;
  description?: string;
  trainingDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  trainerName?: string;
  trainerOrganization?: string;
  trainingType:
    | 'basic'
    | 'advanced'
    | 'specialized'
    | 'refresher'
    | 'certification';
  maxParticipants?: number;
  currentParticipants: number;
  isCompleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBascaTrainingSessionData {
  title: string;
  description?: string;
  trainingDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  trainerName?: string;
  trainerOrganization?: string;
  trainingType:
    | 'basic'
    | 'advanced'
    | 'specialized'
    | 'refresher'
    | 'certification';
  maxParticipants?: number;
}

export interface UpdateBascaTrainingSessionData
  extends Partial<CreateBascaTrainingSessionData> {
  id: string;
  currentParticipants?: number;
  isCompleted?: boolean;
}

// New interfaces for BASCA activities
export interface BascaActivity {
  id: string;
  title: string;
  description?: string;
  activityDate: string;
  endDate?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  barangay: string;
  barangayCode: string;
  activityType:
    | 'community_service'
    | 'training'
    | 'outreach'
    | 'fundraising'
    | 'celebration'
    | 'advocacy'
    | 'other';
  targetAudience?: string;
  expectedParticipants?: number;
  minParticipants?: number;
  maxParticipants?: number;
  actualParticipants: number;
  budget?: number;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceDays?: string[];
  requireRegistration: boolean;
  requireApproval: boolean;
  isPublic: boolean;
  expectedOutcome?: string;
  objectives?: string[];
  requirements?: string[];
  notes?: string;
  isCompleted: boolean;
  outcomes?: string;
  challenges?: string;
  recommendations?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBascaActivityData {
  title: string;
  description?: string;
  activityDate: string;
  endDate?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  barangay: string;
  barangayCode: string;
  activityType:
    | 'community_service'
    | 'training'
    | 'outreach'
    | 'fundraising'
    | 'celebration'
    | 'advocacy'
    | 'other';
  targetAudience?: string;
  expectedParticipants?: number;
  minParticipants?: number;
  maxParticipants?: number;
  budget?: number;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceDays?: string[];
  requireRegistration: boolean;
  requireApproval: boolean;
  isPublic: boolean;
  expectedOutcome?: string;
  objectives?: string[];
  requirements?: string[];
  notes?: string;
}

export interface UpdateBascaActivityData
  extends Partial<CreateBascaActivityData> {
  id: string;
  actualParticipants?: number;
  isCompleted?: boolean;
  outcomes?: string;
  challenges?: string;
  recommendations?: string;
}

// New interfaces for attendance and participation
export interface BascaMeetingAttendee {
  id: string;
  meetingId: string;
  memberId: string;
  userId: string;
  isPresent: boolean;
  arrivalTime?: string;
  departureTime?: string;
  notes?: string;
  createdAt: string;
}

export interface BascaTrainingParticipant {
  id: string;
  trainingSessionId: string;
  memberId: string;
  userId: string;
  isRegistered: boolean;
  isAttended: boolean;
  completionCertificate?: string;
  score?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BascaActivityParticipant {
  id: string;
  activityId: string;
  memberId: string;
  userId: string;
  role: 'organizer' | 'participant' | 'supervisor' | 'volunteer';
  hoursContributed: number;
  notes?: string;
  createdAt: string;
}
