import { supabase } from '@/lib/supabase';
import type {
  BascaMeeting,
  CreateBascaMeetingData,
  UpdateBascaMeetingData
} from '@/types/basca';

export class BascaMeetingsAPI {
  static async createMeeting(
    data: CreateBascaMeetingData,
    userId: string
  ): Promise<BascaMeeting> {
    try {
      const { data: meeting, error } = await supabase
        .from('basca_meetings')
        .insert({
          title: data.title,
          description: data.description,
          meeting_date: data.meetingDate,
          start_time: data.startTime,
          end_time: data.endTime,
          location: data.location,
          barangay: data.barangay,
          barangay_code: data.barangayCode,
          meeting_type: data.meetingType,
          agenda: data.agenda,
          minutes: data.minutes,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create meeting: ${error.message}`);
      }

      return this.mapDatabaseToInterface(meeting);
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  static async updateMeeting(
    data: UpdateBascaMeetingData,
    userId: string
  ): Promise<BascaMeeting> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
        updated_by: userId
      };

      if (data.title) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.meetingDate) updateData.meeting_date = data.meetingDate;
      if (data.startTime) updateData.start_time = data.startTime;
      if (data.endTime !== undefined) updateData.end_time = data.endTime;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.barangay) updateData.barangay = data.barangay;
      if (data.barangayCode) updateData.barangay_code = data.barangayCode;
      if (data.meetingType) updateData.meeting_type = data.meetingType;
      if (data.agenda) updateData.agenda = data.agenda;
      if (data.minutes !== undefined) updateData.minutes = data.minutes;
      if (data.attendeesCount !== undefined)
        updateData.attendees_count = data.attendeesCount;
      if (data.isConducted !== undefined)
        updateData.is_conducted = data.isConducted;

      const { data: meeting, error } = await supabase
        .from('basca_meetings')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update meeting: ${error.message}`);
      }

      return this.mapDatabaseToInterface(meeting);
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  static async deleteMeeting(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('basca_meetings')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete meeting: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }

  static async getMeeting(id: string): Promise<BascaMeeting | null> {
    try {
      const { data, error } = await supabase
        .from('basca_meetings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to fetch meeting: ${error.message}`);
      }

      return this.mapDatabaseToInterface(data);
    } catch (error) {
      console.error('Error fetching meeting:', error);
      throw error;
    }
  }

  static async getAllMeetings(barangay?: string): Promise<BascaMeeting[]> {
    try {
      let query = supabase.from('basca_meetings').select('*');

      if (barangay) {
        query = query.eq('barangay', barangay);
      }

      const { data, error } = await query.order('meeting_date', {
        ascending: false
      });

      if (error) {
        throw new Error(`Failed to fetch meetings: ${error.message}`);
      }

      return data.map(meeting => this.mapDatabaseToInterface(meeting));
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  }

  static async getUpcomingMeetings(
    barangay?: string,
    limit: number = 10
  ): Promise<BascaMeeting[]> {
    try {
      let query = supabase
        .from('basca_meetings')
        .select('*')
        .gte('meeting_date', new Date().toISOString().split('T')[0])
        .order('meeting_date', { ascending: true });

      if (barangay) {
        query = query.eq('barangay', barangay);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch upcoming meetings: ${error.message}`);
      }

      return data.map(meeting => this.mapDatabaseToInterface(meeting));
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
      throw error;
    }
  }

  static async getMeetingsByType(
    meetingType: string,
    barangay?: string
  ): Promise<BascaMeeting[]> {
    try {
      let query = supabase
        .from('basca_meetings')
        .select('*')
        .eq('meeting_type', meetingType)
        .order('meeting_date', { ascending: false });

      if (barangay) {
        query = query.eq('barangay', barangay);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch meetings by type: ${error.message}`);
      }

      return data.map(meeting => this.mapDatabaseToInterface(meeting));
    } catch (error) {
      console.error('Error fetching meetings by type:', error);
      throw error;
    }
  }

  static async markMeetingAsConducted(
    id: string,
    attendeesCount: number
  ): Promise<BascaMeeting> {
    try {
      const { data, error } = await supabase
        .from('basca_meetings')
        .update({
          is_conducted: true,
          attendees_count: attendeesCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Failed to mark meeting as conducted: ${error.message}`
        );
      }

      return this.mapDatabaseToInterface(data);
    } catch (error) {
      console.error('Error marking meeting as conducted:', error);
      throw error;
    }
  }

  private static mapDatabaseToInterface(data: any): BascaMeeting {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      meetingDate: data.meeting_date,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location,
      barangay: data.barangay,
      barangayCode: data.barangay_code,
      meetingType: data.meeting_type,
      agenda: data.agenda || [],
      minutes: data.minutes,
      attendeesCount: data.attendees_count || 0,
      isConducted: data.is_conducted || false,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
