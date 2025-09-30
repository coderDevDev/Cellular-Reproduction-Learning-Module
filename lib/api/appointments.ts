import { supabase } from '@/lib/supabase';

export interface SeniorCitizen {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  barangay: string;
  date_of_birth: string;
  gender: string;
  contact_phone: string;
  status: 'active' | 'inactive' | 'deceased';
}

export interface Appointment {
  id: string;
  senior_citizen_id: string;
  appointment_type: 'bhw' | 'basca' | 'medical' | 'consultation' | 'home_visit';
  appointment_date: string;
  appointment_time: string;
  purpose: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;

  // Joined senior citizen data
  senior_name?: string;
  senior_age?: number;
  senior_phone?: string;
  senior_barangay?: string;
  senior_gender?: string;

  // Additional fields for comprehensive management
  priority_level?: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  estimated_duration?: number; // in minutes
  requirements?: string[];
  assigned_staff?: string;
  follow_up_required?: boolean;
  reminder_sent?: boolean;
}

export interface AppointmentFormData {
  senior_citizen_id: string;
  appointment_type: 'bhw' | 'basca' | 'medical' | 'consultation' | 'home_visit';
  appointment_date: string;
  appointment_time: string;
  purpose: string;
  notes?: string;
  priority_level?: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  estimated_duration?: number;
  requirements?: string[];
  follow_up_required?: boolean;
}

export interface AppointmentFilters {
  status?: string;
  type?: string;
  date_range?: string;
  barangay?: string;
  search?: string;
  priority?: string;
}

export interface AppointmentStats {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  cancelled: number;
  today: number;
  thisWeek: number;
  overdue: number;
  upcoming: number;
}

export class AppointmentsAPI {
  // Get all senior citizens for selection
  static async getSeniorCitizens(
    search?: string,
    barangay?: string
  ): Promise<SeniorCitizen[]> {
    try {
      let query = supabase
        .from('senior_citizens')
        .select(
          `
           id,
           user_id,
           barangay,
           date_of_birth,
           gender,
           contact_phone,
           status,
           users!senior_citizens_user_id_fkey (
             first_name,
             last_name,
             phone
           )
         `
        )
        .eq('status', 'active')
        .order('users(last_name)', { ascending: true });

      if (barangay && barangay !== 'all') {
        query = query.eq('barangay', barangay);
      }

      const { data: allData, error } = await query.limit(200);

      if (error) throw error;

      let filteredData: any[] = allData || [];

      // Apply client-side search filtering to avoid PostgREST parsing issues
      if (search) {
        const searchTerm = search.trim().toLowerCase();
        filteredData = filteredData.filter(item => {
          const user = Array.isArray(item.users) ? item.users[0] : item.users;
          const firstName = user?.first_name?.toLowerCase() || '';
          const lastName = user?.last_name?.toLowerCase() || '';
          const fullName = `${firstName} ${lastName}`.trim();
          const barangay = item.barangay?.toLowerCase() || '';

          return (
            firstName.includes(searchTerm) ||
            lastName.includes(searchTerm) ||
            fullName.includes(searchTerm) ||
            barangay.includes(searchTerm)
          );
        });
      }

      // Limit results after filtering
      const limitedData = filteredData.slice(0, 100);

      return (
        limitedData?.map(item => {
          // Handle case where users might be an array or object
          const user = Array.isArray(item.users) ? item.users[0] : item.users;
          return {
            id: item.id,
            user_id: item.user_id,
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            barangay: item.barangay,
            date_of_birth: item.date_of_birth,
            gender: item.gender,
            contact_phone: user?.phone || item.contact_phone || '',
            status: item.status
          };
        }) || []
      );
    } catch (error) {
      console.error('Error fetching senior citizens:', error);
      throw new Error('Failed to fetch senior citizens');
    }
  }

  // Get appointments with filters
  static async getAppointments(
    filters?: AppointmentFilters
  ): Promise<Appointment[]> {
    try {
      let query = supabase
        .from('appointments')
        .select(
          `
          *,
          senior_citizens!inner (
            id,
            barangay,
            date_of_birth,
            gender,
            users!senior_citizens_user_id_fkey (
              first_name,
              last_name,
              phone
            )
          )
        `
        )
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('appointment_type', filters.type);
      }

      if (filters?.barangay && filters.barangay !== 'all') {
        query = query.eq('senior_citizens.barangay', filters.barangay);
      }

      if (filters?.date_range) {
        const today = new Date();
        switch (filters.date_range) {
          case 'today':
            const todayStr = today.toISOString().split('T')[0];
            query = query.eq('appointment_date', todayStr);
            break;
          case 'tomorrow':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            query = query.eq('appointment_date', tomorrowStr);
            break;
          case 'week':
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            query = query
              .gte('appointment_date', today.toISOString().split('T')[0])
              .lte('appointment_date', weekEnd.toISOString().split('T')[0]);
            break;
          case 'month':
            const monthEnd = new Date(today);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            query = query
              .gte('appointment_date', today.toISOString().split('T')[0])
              .lte('appointment_date', monthEnd.toISOString().split('T')[0]);
            break;
        }
      }

      const { data: allData, error } = await query;

      if (error) throw error;

      let filteredData: any[] = allData || [];

      // Apply client-side search filtering for appointments
      if (filters?.search) {
        const searchTerm = filters.search.trim().toLowerCase();
        filteredData = filteredData.filter(appointment => {
          const senior = appointment.senior_citizens;
          const user = Array.isArray(senior?.users)
            ? senior.users[0]
            : senior?.users;

          const firstName = user?.first_name?.toLowerCase() || '';
          const lastName = user?.last_name?.toLowerCase() || '';
          const fullName = `${firstName} ${lastName}`.trim();
          const purpose = appointment.purpose?.toLowerCase() || '';
          const notes = appointment.notes?.toLowerCase() || '';

          return (
            firstName.includes(searchTerm) ||
            lastName.includes(searchTerm) ||
            fullName.includes(searchTerm) ||
            purpose.includes(searchTerm) ||
            notes.includes(searchTerm)
          );
        });
      }

      return (
        filteredData?.map(appointment => {
          const senior = appointment.senior_citizens;
          const user = senior.users;

          return {
            ...appointment,
            senior_name: `${user.first_name} ${user.last_name}`,
            senior_age:
              new Date().getFullYear() -
              new Date(senior.date_of_birth).getFullYear(),
            senior_phone: user.phone,
            senior_barangay: senior.barangay,
            senior_gender: senior.gender
          };
        }) || []
      );
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw new Error('Failed to fetch appointments');
    }
  }

  // Create new appointment
  static async createAppointment(
    appointmentData: AppointmentFormData
  ): Promise<Appointment> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            senior_citizen_id: appointmentData.senior_citizen_id,
            appointment_type: appointmentData.appointment_type,
            appointment_date: appointmentData.appointment_date,
            appointment_time: appointmentData.appointment_time,
            purpose: appointmentData.purpose,
            notes: appointmentData.notes || null,
            status: 'pending',
            created_by:
              (await supabase.auth.getUser()).data.user?.id || 'system'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Fetch the complete appointment with senior citizen details
      const appointments = await this.getAppointments();
      const newAppointment = appointments.find(apt => apt.id === data.id);

      if (!newAppointment)
        throw new Error('Failed to retrieve created appointment');

      return newAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw new Error('Failed to create appointment');
    }
  }

  // Update appointment
  static async updateAppointment(
    id: string,
    updates: Partial<AppointmentFormData>
  ): Promise<Appointment> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Fetch the complete appointment with senior citizen details
      const appointments = await this.getAppointments();
      const updatedAppointment = appointments.find(apt => apt.id === id);

      if (!updatedAppointment)
        throw new Error('Failed to retrieve updated appointment');

      return updatedAppointment;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw new Error('Failed to update appointment');
    }
  }

  // Update appointment status
  static async updateAppointmentStatus(
    id: string,
    status: string
  ): Promise<void> {
    try {
      // Get current user ID
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Simple update without triggering complex history logging
      const updateData: any = {
        status
        // Don't manually set updated_at - let the trigger handle it
        // Don't set updated_by here - let the trigger handle it
      };

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      // Provide more specific error information
      if (error && typeof error === 'object' && 'code' in error) {
        throw new Error(`Database error (${error.code}): ${error.message}`);
      }
      throw new Error('Failed to update appointment status');
    }
  }

  // Delete appointment
  static async deleteAppointment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw new Error('Failed to delete appointment');
    }
  }

  // Get appointment statistics
  static async getAppointmentStats(): Promise<AppointmentStats> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      const [
        totalResult,
        pendingResult,
        approvedResult,
        completedResult,
        cancelledResult,
        todayResult,
        weekResult,
        overdueResult
      ] = await Promise.all([
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved'),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed'),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'cancelled'),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('appointment_date', today),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .gte('appointment_date', today)
          .lte('appointment_date', weekEndStr),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .lt('appointment_date', today)
          .in('status', ['pending', 'approved'])
      ]);

      return {
        total: totalResult.count || 0,
        pending: pendingResult.count || 0,
        approved: approvedResult.count || 0,
        completed: completedResult.count || 0,
        cancelled: cancelledResult.count || 0,
        today: todayResult.count || 0,
        thisWeek: weekResult.count || 0,
        overdue: overdueResult.count || 0,
        upcoming: (weekResult.count || 0) - (todayResult.count || 0)
      };
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      throw new Error('Failed to fetch appointment statistics');
    }
  }

  // Get available time slots for a specific date
  static async getAvailableTimeSlots(
    date: string,
    appointmentType?: string
  ): Promise<string[]> {
    try {
      // Get existing appointments for the date
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', date)
        .in('status', ['pending', 'approved']);

      if (error) throw error;

      // Define available time slots based on appointment type
      const allTimeSlots =
        appointmentType === 'medical'
          ? [
              '08:00',
              '08:30',
              '09:00',
              '09:30',
              '10:00',
              '10:30',
              '11:00',
              '11:30',
              '13:00',
              '13:30',
              '14:00',
              '14:30',
              '15:00',
              '15:30',
              '16:00',
              '16:30'
            ]
          : [
              '08:00',
              '09:00',
              '10:00',
              '11:00',
              '13:00',
              '14:00',
              '15:00',
              '16:00',
              '17:00'
            ];

      // Filter out booked slots
      const bookedSlots =
        existingAppointments?.map(apt => apt.appointment_time) || [];
      const availableSlots = allTimeSlots.filter(
        slot => !bookedSlots.includes(slot)
      );

      return availableSlots;
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      throw new Error('Failed to fetch available time slots');
    }
  }

  // Get Pili, Camarines Sur barangays
  static async getPiliBarangays(): Promise<{ id: string; name: string }[]> {
    return [
      { id: 'bagong-sirang', name: 'Bagong Sirang' },
      { id: 'barangay-1', name: 'Barangay 1 (Poblacion)' },
      { id: 'barangay-2', name: 'Barangay 2 (Poblacion)' },
      { id: 'barangay-3', name: 'Barangay 3 (Poblacion)' },
      { id: 'barangay-4', name: 'Barangay 4 (Poblacion)' },
      { id: 'barangay-5', name: 'Barangay 5 (Poblacion)' },
      { id: 'barangay-6', name: 'Barangay 6 (Poblacion)' },
      { id: 'barangay-7', name: 'Barangay 7 (Poblacion)' },
      { id: 'barangay-8', name: 'Barangay 8 (Poblacion)' },
      { id: 'anayan', name: 'Anayan' },
      { id: 'bagacay', name: 'Bagacay' },
      { id: 'banga', name: 'Banga' },
      { id: 'binanuahan', name: 'Binanuahan' },
      { id: 'bolo', name: 'Bolo' },
      { id: 'buenavista', name: 'Buenavista' },
      { id: 'cadlan', name: 'Cadlan' },
      { id: 'caima-gimaga', name: 'Caima Gimaga' },
      { id: 'cale', name: 'Cale' },
      { id: 'curry', name: 'Curry' },
      { id: 'dita', name: 'Dita' },
      { id: 'kyamko', name: 'Kyamko' },
      { id: 'moises-r-espinosa', name: 'Moises R. Espinosa (Pinit)' },
      { id: 'palestina', name: 'Palestina' },
      { id: 'pawili', name: 'Pawili' },
      { id: 'sagrada-familia', name: 'Sagrada Familia' },
      { id: 'san-antonio', name: 'San Antonio' },
      { id: 'san-isidro', name: 'San Isidro' },
      { id: 'san-jose', name: 'San Jose' },
      { id: 'san-juan', name: 'San Juan' },
      { id: 'san-rafael-a', name: 'San Rafael A' },
      { id: 'san-rafael-b', name: 'San Rafael B' },
      { id: 'san-roque', name: 'San Roque' },
      { id: 'san-vicente', name: 'San Vicente' },
      { id: 'santa-cruz-norte', name: 'Santa Cruz Norte' },
      { id: 'santa-cruz-sur', name: 'Santa Cruz Sur' },
      { id: 'santo-niño', name: 'Santo Niño' },
      { id: 'himaao', name: 'Himaao' }
    ];
  }

  // Check for appointment conflicts
  static async checkConflicts(
    seniorCitizenId: string,
    date: string,
    time: string,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    try {
      let query = supabase
        .from('appointments')
        .select('id')
        .eq('senior_citizen_id', seniorCitizenId)
        .eq('appointment_date', date)
        .eq('appointment_time', time)
        .in('status', ['pending', 'approved']);

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking appointment conflicts:', error);
      return false;
    }
  }
}
