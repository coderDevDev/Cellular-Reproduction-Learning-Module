export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string;
          role: 'osca' | 'basca' | 'senior';
          avatar_url?: string;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
          last_login?: string;
          // OSCA specific fields
          department?: string;
          position?: string;
          employee_id?: string;
          // BASCA specific fields
          barangay?: string;
          barangay_code?: string;
          // Senior specific fields
          date_of_birth?: string;
          address?: string;
          osca_id?: string;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          emergency_contact_relationship?: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string;
          role: 'osca' | 'basca' | 'senior';
          avatar_url?: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
          department?: string;
          position?: string;
          employee_id?: string;
          barangay?: string;
          barangay_code?: string;
          date_of_birth?: string;
          address?: string;
          osca_id?: string;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          emergency_contact_relationship?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          role?: 'osca' | 'basca' | 'senior';
          avatar_url?: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
          department?: string;
          position?: string;
          employee_id?: string;
          barangay?: string;
          barangay_code?: string;
          date_of_birth?: string;
          address?: string;
          osca_id?: string;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          emergency_contact_relationship?: string;
        };
      };
      senior_citizens: {
        Row: {
          id: string;
          user_id: string;
          first_name?: string;
          last_name?: string;
          barangay: string;
          barangay_code: string;
          region_code?: string;
          province_code?: string;
          city_code?: string;
          date_of_birth: string;
          gender: 'male' | 'female' | 'other';
          address: string;
          contact_person?: string;
          contact_phone?: string;
          contact_relationship?: string;
          medical_conditions: string[];
          medications: string[];
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          emergency_contact_relationship?: string;
          osca_id?: string;
          senior_id_photo?: string;
          profile_picture?: string;
          documents: string[];
          status: 'active' | 'deceased' | 'inactive';
          registration_date: string;
          last_medical_checkup?: string;
          notes?: string;
          // New fields
          housing_condition:
            | 'owned'
            | 'rented'
            | 'with_family'
            | 'institution'
            | 'other';
          physical_health_condition:
            | 'excellent'
            | 'good'
            | 'fair'
            | 'poor'
            | 'critical';
          monthly_income: number;
          monthly_pension: number;
          living_condition:
            | 'independent'
            | 'with_family'
            | 'with_caregiver'
            | 'institution'
            | 'other';
          created_at: string;
          updated_at: string;
          created_by?: string;
          updated_by?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name?: string;
          last_name?: string;
          barangay: string;
          barangay_code: string;
          region_code?: string;
          province_code?: string;
          city_code?: string;
          date_of_birth: string;
          gender: 'male' | 'female' | 'other';
          address: string;
          contact_person?: string;
          contact_phone?: string;
          contact_relationship?: string;
          medical_conditions?: string[];
          medications?: string[];
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          emergency_contact_relationship?: string;
          osca_id?: string;
          senior_id_photo?: string;
          profile_picture?: string;
          documents?: string[];
          status?: 'active' | 'deceased' | 'inactive';
          registration_date?: string;
          last_medical_checkup?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          barangay?: string;
          barangay_code?: string;
          region_code?: string;
          province_code?: string;
          city_code?: string;
          date_of_birth?: string;
          gender?: 'male' | 'female' | 'other';
          address?: string;
          contact_person?: string;
          contact_phone?: string;
          contact_relationship?: string;
          medical_conditions?: string[];
          medications?: string[];
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          emergency_contact_relationship?: string;
          osca_id?: string;
          senior_id_photo?: string;
          profile_picture?: string;
          documents?: string[];
          status?: 'active' | 'deceased' | 'inactive';
          registration_date?: string;
          last_medical_checkup?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
        };
      };
      beneficiaries: {
        Row: {
          id: string;
          senior_citizen_id: string;
          name: string;
          relationship: string;
          date_of_birth: string;
          gender: 'male' | 'female' | 'other';
          address?: string;
          contact_phone?: string;
          occupation?: string;
          monthly_income: number;
          is_dependent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          senior_citizen_id: string;
          name: string;
          relationship: string;
          date_of_birth: string;
          gender: 'male' | 'female' | 'other';
          address?: string;
          contact_phone?: string;
          occupation?: string;
          monthly_income?: number;
          is_dependent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          senior_citizen_id?: string;
          name?: string;
          relationship?: string;
          date_of_birth?: string;
          gender?: 'male' | 'female' | 'other';
          address?: string;
          contact_phone?: string;
          occupation?: string;
          monthly_income?: number;
          is_dependent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          type: 'general' | 'emergency' | 'benefit' | 'birthday';
          target_barangay?: string;
          is_urgent: boolean;
          expires_at?: string;
          sms_sent: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          type?: 'general' | 'emergency' | 'benefit' | 'birthday';
          target_barangay?: string;
          is_urgent?: boolean;
          expires_at?: string;
          sms_sent?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          type?: 'general' | 'emergency' | 'benefit' | 'birthday';
          target_barangay?: string;
          is_urgent?: boolean;
          expires_at?: string;
          sms_sent?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          senior_citizen_id: string;
          appointment_type: string;
          appointment_date: string;
          appointment_time: string;
          purpose: string;
          status: 'pending' | 'approved' | 'completed' | 'cancelled';
          notes?: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          senior_citizen_id: string;
          appointment_type: string;
          appointment_date: string;
          appointment_time: string;
          purpose: string;
          status?: 'pending' | 'approved' | 'completed' | 'cancelled';
          notes?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          senior_citizen_id?: string;
          appointment_type?: string;
          appointment_date?: string;
          appointment_time?: string;
          purpose?: string;
          status?: 'pending' | 'approved' | 'completed' | 'cancelled';
          notes?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_requests: {
        Row: {
          id: string;
          senior_citizen_id: string;
          document_type: string;
          purpose: string;
          status: 'pending' | 'approved' | 'rejected' | 'completed';
          requested_at: string;
          processed_at?: string;
          processed_by?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          senior_citizen_id: string;
          document_type: string;
          purpose: string;
          status?: 'pending' | 'approved' | 'rejected' | 'completed';
          requested_at?: string;
          processed_at?: string;
          processed_by?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          senior_citizen_id?: string;
          document_type?: string;
          purpose?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'completed';
          requested_at?: string;
          processed_at?: string;
          processed_by?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      benefits: {
        Row: {
          id: string;
          senior_citizen_id: string;
          benefit_type: string;
          benefit_name: string;
          description?: string;
          amount?: number;
          status: 'active' | 'expired' | 'suspended';
          start_date: string;
          end_date?: string;
          approved_by?: string;
          approved_at?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          senior_citizen_id: string;
          benefit_type: string;
          benefit_name: string;
          description?: string;
          amount?: number;
          status?: 'active' | 'expired' | 'suspended';
          start_date: string;
          end_date?: string;
          approved_by?: string;
          approved_at?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          senior_citizen_id?: string;
          benefit_type?: string;
          benefit_name?: string;
          description?: string;
          amount?: number;
          status?: 'active' | 'expired' | 'suspended';
          start_date?: string;
          end_date?: string;
          approved_by?: string;
          approved_at?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      census_records: {
        Row: {
          id: string;
          barangay: string;
          barangay_code: string;
          year: number;
          month: number;
          total_seniors: number;
          active_seniors: number;
          deceased_seniors: number;
          new_registrations: number;
          male_count: number;
          female_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          barangay: string;
          barangay_code: string;
          year: number;
          month: number;
          total_seniors?: number;
          active_seniors?: number;
          deceased_seniors?: number;
          new_registrations?: number;
          male_count?: number;
          female_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          barangay?: string;
          barangay_code?: string;
          year?: number;
          month?: number;
          total_seniors?: number;
          active_seniors?: number;
          deceased_seniors?: number;
          new_registrations?: number;
          male_count?: number;
          female_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'osca' | 'basca' | 'senior';
      senior_status: 'active' | 'deceased' | 'inactive';
      appointment_status: 'pending' | 'approved' | 'completed' | 'cancelled';
      document_request_status:
        | 'pending'
        | 'approved'
        | 'rejected'
        | 'completed';
      benefit_status: 'active' | 'expired' | 'suspended';
      announcement_type: 'general' | 'emergency' | 'benefit' | 'birthday';
      housing_condition:
        | 'owned'
        | 'rented'
        | 'with_family'
        | 'institution'
        | 'other';
      physical_health_condition:
        | 'excellent'
        | 'good'
        | 'fair'
        | 'poor'
        | 'critical';
      living_condition:
        | 'independent'
        | 'with_family'
        | 'with_caregiver'
        | 'institution'
        | 'other';
    };
  };
}
