export interface User {
  id: string;
  email: string;
  role: 'student' | 'teacher';
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  profilePhoto?: string;
  learningStyle?: 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
  preferredModules?: string[]; // ["Visual", "Aural", "Read/Write", "Kinesthetic", "General Module"]
  learningType?: string; // "Unimodal", "Bimodal", "Trimodal", "Multimodal"
  gradeLevel?: string;
  onboardingCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: 'student' | 'teacher'; // Make role optional for flexible login
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  role: 'student' | 'teacher';
  gradeLevel?: string;
  learningStyle?: 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
}

export interface ForgotPasswordData {
  email: string;
  role?: 'student' | 'teacher'; // Make role optional since it's not needed for password reset
}
