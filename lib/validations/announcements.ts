import { z } from 'zod';

// Announcement form validation schema
export const announcementFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-.,!?()]+$/, 'Title contains invalid characters'),

  content: z
    .string()
    .min(10, 'Content must be at least 10 characters long')
    .max(500, 'Content cannot exceed 500 characters'),

  type: z.enum(['general', 'emergency', 'benefit', 'birthday'], {
    required_error: 'Please select an announcement type'
  }),

  targetBarangay: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val || val === '') return true;
        const validBarangays = [
          'Anayan',
          'Awod',
          'Bagong Sirang',
          'Binagasbasan',
          'Curry',
          'Del Rosario',
          'Himaao',
          'Kadlan',
          'Pawili',
          'Pinit',
          'Poblacion East',
          'Poblacion West',
          'Sagrada',
          'San Agustin',
          'San Isidro',
          'San Jose',
          'San Juan',
          'San Vicente',
          'Santa Cruz Norte',
          'Santa Cruz Sur',
          'Santo Domingo',
          'Tagbong'
        ];
        return validBarangays.includes(val);
      },
      {
        message: 'Please select a valid barangay from Pili, Camarines Sur'
      }
    ),

  isUrgent: z.boolean().default(false),

  expiresAt: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val || val === '') return true;
        const expiryDate = new Date(val);
        const now = new Date();
        return expiryDate > now;
      },
      {
        message: 'Expiry date must be in the future'
      }
    ),

  priorityLevel: z
    .number()
    .min(1, 'Priority level must be between 1 and 5')
    .max(5, 'Priority level must be between 1 and 5')
    .default(1),

  scheduledAt: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val || val === '') return true;
        const scheduledDate = new Date(val);
        const now = new Date();
        return scheduledDate > now;
      },
      {
        message: 'Scheduled date must be in the future'
      }
    ),

  status: z
    .enum(['draft', 'published', 'scheduled'], {
      required_error: 'Please select a status'
    })
    .default('published'),

  tags: z
    .array(z.string())
    .max(5, 'Cannot have more than 5 tags')
    .optional()
    .default([]),

  sendSMS: z.boolean().default(false)
});

export type AnnouncementFormData = z.infer<typeof announcementFormSchema>;

// Additional validation functions
export const validateAnnouncementForm = (
  data: any
): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  try {
    announcementFormSchema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        if (err.path.length > 0) {
          const path = err.path[0] as string;
          errors[path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
};

// Custom validation for SMS content length
export const validateSMSContent = (
  title: string,
  content: string,
  isUrgent: boolean,
  type: string,
  targetBarangay?: string
): {
  isValid: boolean;
  messageLength: number;
  message: string;
  warnings: string[];
} => {
  const urgentPrefix = isUrgent ? '[URGENT] ' : '';
  const typePrefix = type === 'emergency' ? '[EMERGENCY] ' : '';
  const barangayPrefix = targetBarangay ? `[${targetBarangay}] ` : '[OSCA] ';

  let message = `${urgentPrefix}${typePrefix}${barangayPrefix}${title}`;
  const warnings: string[] = [];

  // Check if we can fit the full content
  if (message.length + content.length + 15 <= 160) {
    message += `\n\n${content}\n\n- OSCA Pili`;
  } else {
    // Calculate available space for content
    const availableLength = 160 - message.length - 15;
    if (availableLength > 20) {
      message += `\n\n${content.substring(
        0,
        availableLength - 3
      )}...\n\n- OSCA Pili`;
      warnings.push('Content will be truncated in SMS due to character limit');
    } else {
      message += '\n\n- OSCA Pili';
      warnings.push('Content cannot be included in SMS due to character limit');
    }
  }

  return {
    isValid: message.length <= 160,
    messageLength: message.length,
    message,
    warnings
  };
};

// Validation for barangay senior citizens
export const validateBarangayRequirements = async (
  targetBarangay: string
): Promise<{
  isValid: boolean;
  seniorCount: number;
  message: string;
}> => {
  try {
    // This would typically call the API to check senior citizens in the barangay
    // For now, we'll simulate the validation
    const mockSeniorCounts: Record<string, number> = {
      Anayan: 45,
      Awod: 32,
      'Bagong Sirang': 28,
      Binagasbasan: 67,
      Curry: 23,
      'Del Rosario': 89,
      Himaao: 54,
      Kadlan: 31,
      Pawili: 42,
      Pinit: 38,
      'Poblacion East': 156,
      'Poblacion West': 142,
      Sagrada: 76,
      'San Agustin': 49,
      'San Isidro': 62,
      'San Jose': 71,
      'San Juan': 58,
      'San Vicente': 44,
      'Santa Cruz Norte': 83,
      'Santa Cruz Sur': 77,
      'Santo Domingo': 52,
      Tagbong: 36
    };

    const seniorCount = mockSeniorCounts[targetBarangay] || 0;

    if (seniorCount === 0) {
      return {
        isValid: false,
        seniorCount: 0,
        message: `No active senior citizens found in ${targetBarangay}. Please choose a different barangay or ensure senior citizens are registered first.`
      };
    }

    return {
      isValid: true,
      seniorCount,
      message: `${seniorCount} active senior citizens will receive this announcement in ${targetBarangay}.`
    };
  } catch (error) {
    return {
      isValid: false,
      seniorCount: 0,
      message: 'Unable to validate barangay requirements. Please try again.'
    };
  }
};

// Form field validation messages
export const validationMessages = {
  title: {
    required: 'Title is required',
    minLength: 'Title must be at least 3 characters long',
    maxLength: 'Title cannot exceed 100 characters',
    pattern: 'Title contains invalid characters'
  },
  content: {
    required: 'Content is required',
    minLength: 'Content must be at least 10 characters long',
    maxLength: 'Content cannot exceed 500 characters'
  },
  type: {
    required: 'Please select an announcement type'
  },
  targetBarangay: {
    invalid: 'Please select a valid barangay'
  },
  expiresAt: {
    future: 'Expiry date must be in the future'
  },
  scheduledAt: {
    future: 'Scheduled date must be in the future'
  },
  priorityLevel: {
    range: 'Priority level must be between 1 and 5'
  }
};

// Real-time form validation hook data
export const useFormValidation = () => {
  const validateField = (name: string, value: any, formData: any = {}) => {
    try {
      const fieldSchema =
        announcementFormSchema.shape[
          name as keyof typeof announcementFormSchema.shape
        ];
      if (fieldSchema) {
        fieldSchema.parse(value);
        return { isValid: true, message: '' };
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          message: error.errors[0]?.message || 'Invalid value'
        };
      }
    }
    return { isValid: true, message: '' };
  };

  return { validateField };
};
