import { z } from 'zod';

// Appointment form validation schema
export const appointmentFormSchema = z.object({
  senior_citizen_id: z.string().min(1, 'Please select a senior citizen'),
  appointment_type: z.enum(
    ['bhw', 'basca', 'medical', 'consultation', 'home_visit'],
    {
      required_error: 'Please select an appointment type'
    }
  ),
  appointment_date: z
    .string()
    .min(1, 'Please select an appointment date')
    .refine(date => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Appointment date cannot be in the past'),
  appointment_time: z.string().min(1, 'Please select an appointment time'),
  purpose: z
    .string()
    .min(10, 'Purpose must be at least 10 characters')
    .max(500, 'Purpose cannot exceed 500 characters'),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  priority_level: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  location: z
    .string()
    .max(200, 'Location cannot exceed 200 characters')
    .optional(),
  estimated_duration: z
    .number()
    .min(15, 'Minimum duration is 15 minutes')
    .max(480, 'Maximum duration is 8 hours')
    .optional(),
  requirements: z.array(z.string()).optional(),
  follow_up_required: z.boolean().optional()
});

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

// Validation function for appointment form
export const validateAppointmentForm = (
  data: any
): { success: boolean; errors?: Record<string, string> } => {
  try {
    appointmentFormSchema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

// Business hours validation
export const validateBusinessHours = (
  time: string,
  appointmentType: string
): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;

  // Standard business hours: 8:00 AM to 5:00 PM
  const startTime = 8 * 60; // 8:00 AM
  const endTime = 17 * 60; // 5:00 PM

  // Medical appointments have more restricted hours: 8:00 AM to 4:30 PM
  if (appointmentType === 'medical') {
    const medicalEndTime = 16 * 60 + 30; // 4:30 PM
    return timeInMinutes >= startTime && timeInMinutes <= medicalEndTime;
  }

  return timeInMinutes >= startTime && timeInMinutes <= endTime;
};

// Weekend validation
export const isWeekend = (date: string): boolean => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
};

// Holiday validation (Philippine holidays)
export const isHoliday = (date: string): boolean => {
  const dateObj = new Date(date);
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  // Common Philippine holidays (simplified)
  const holidays = [
    { month: 1, day: 1 }, // New Year's Day
    { month: 4, day: 9 }, // Araw ng Kagitingan
    { month: 5, day: 1 }, // Labor Day
    { month: 6, day: 12 }, // Independence Day
    { month: 8, day: 21 }, // Ninoy Aquino Day
    { month: 8, day: 29 }, // National Heroes Day (last Monday of August - approximation)
    { month: 11, day: 30 }, // Bonifacio Day
    { month: 12, day: 25 }, // Christmas Day
    { month: 12, day: 30 }, // Rizal Day
    { month: 12, day: 31 } // New Year's Eve
  ];

  return holidays.some(
    holiday => holiday.month === month && holiday.day === day
  );
};

// Comprehensive date validation
export const validateAppointmentDate = (
  date: string,
  appointmentType: string
): {
  valid: boolean;
  message?: string;
} => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if date is in the past
  if (selectedDate < today) {
    return { valid: false, message: 'Appointment date cannot be in the past' };
  }

  // Check if it's a weekend (for certain appointment types)
  if (
    isWeekend(date) &&
    (appointmentType === 'medical' || appointmentType === 'basca')
  ) {
    return {
      valid: false,
      message: 'Medical and BASCA appointments are not available on weekends'
    };
  }

  // Check if it's a holiday
  if (isHoliday(date)) {
    return {
      valid: false,
      message: 'Appointments are not available on holidays'
    };
  }

  // Check if date is too far in the future (6 months limit)
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  if (selectedDate > sixMonthsFromNow) {
    return {
      valid: false,
      message: 'Appointments can only be scheduled up to 6 months in advance'
    };
  }

  return { valid: true };
};

// Time slot validation
export const validateTimeSlot = (
  time: string,
  appointmentType: string
): {
  valid: boolean;
  message?: string;
} => {
  if (!validateBusinessHours(time, appointmentType)) {
    const hours =
      appointmentType === 'medical'
        ? '8:00 AM to 4:30 PM'
        : '8:00 AM to 5:00 PM';
    return {
      valid: false,
      message: `${
        appointmentType === 'medical' ? 'Medical' : 'Regular'
      } appointments are only available during business hours (${hours})`
    };
  }

  return { valid: true };
};

// Appointment conflict validation
export const validateNoConflict = async (
  seniorCitizenId: string,
  date: string,
  time: string,
  excludeAppointmentId?: string
): Promise<{ valid: boolean; message?: string }> => {
  // This would typically make an API call to check for conflicts
  // For now, we'll return a simple validation
  if (!seniorCitizenId || !date || !time) {
    return { valid: false, message: 'Missing required appointment details' };
  }

  return { valid: true };
};

// Get appointment type display names
export const getAppointmentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    medical: 'Medical Consultation',
    bhw: 'Barangay Health Worker Visit',
    basca: 'BASCA Consultation',
    consultation: 'General Consultation',
    home_visit: 'Home Visit'
  };

  return labels[type] || type;
};

// Get priority level colors and labels
export const getPriorityConfig = (priority: string) => {
  const configs: Record<
    string,
    { label: string; color: string; bgColor: string }
  > = {
    low: {
      label: 'Low Priority',
      color: 'text-green-700',
      bgColor: 'bg-green-100'
    },
    medium: {
      label: 'Medium Priority',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100'
    },
    high: {
      label: 'High Priority',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100'
    },
    urgent: { label: 'Urgent', color: 'text-red-700', bgColor: 'bg-red-100' }
  };

  return configs[priority] || configs['medium'];
};

// Generate appointment summary
export const generateAppointmentSummary = (appointment: any): string => {
  const date = new Date(appointment.appointment_date).toLocaleDateString();
  const time = appointment.appointment_time;
  const type = getAppointmentTypeLabel(appointment.appointment_type);

  return `${type} on ${date} at ${time}`;
};

// Validation messages
export const validationMessages = {
  required: 'This field is required',
  invalidDate: 'Please select a valid date',
  invalidTime: 'Please select a valid time',
  pastDate: 'Date cannot be in the past',
  weekend: 'Appointments not available on weekends',
  holiday: 'Appointments not available on holidays',
  businessHours: 'Please select a time during business hours',
  conflict: 'Senior citizen already has an appointment at this time',
  purposeLength: 'Purpose must be between 10-500 characters',
  notesLength: 'Notes cannot exceed 1000 characters'
};

// Form field configurations
export const appointmentTypeOptions = [
  {
    value: 'medical',
    label: 'Medical Consultation',
    description: 'Health check-up, consultation with medical staff'
  },
  {
    value: 'bhw',
    label: 'BHW Home Visit',
    description: 'Barangay Health Worker home visit'
  },
  {
    value: 'basca',
    label: 'BASCA Consultation',
    description: 'Consultation with Barangay Senior Citizens Association'
  },
  {
    value: 'consultation',
    label: 'General Consultation',
    description: 'General consultation or inquiry'
  },
  {
    value: 'home_visit',
    label: 'Home Visit',
    description: "Staff visit to senior citizen's home"
  }
];

export const priorityOptions = [
  {
    value: 'low',
    label: 'Low Priority',
    description: 'Routine, non-urgent matters'
  },
  {
    value: 'medium',
    label: 'Medium Priority',
    description: 'Standard appointment'
  },
  {
    value: 'high',
    label: 'High Priority',
    description: 'Important, needs prompt attention'
  },
  {
    value: 'urgent',
    label: 'Urgent',
    description: 'Requires immediate attention'
  }
];

export const commonRequirements = [
  'Medical records',
  'OSCA ID',
  'Birth certificate',
  'Prescription medications',
  'Previous test results',
  'Insurance documents',
  'Contact person present',
  'Wheelchair accessibility',
  'Interpreter needed',
  'Transportation assistance'
];
