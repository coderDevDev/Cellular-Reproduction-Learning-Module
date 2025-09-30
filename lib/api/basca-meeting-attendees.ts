import { supabase } from '@/lib/supabase';
import type { BascaMeetingAttendee } from '@/types/basca';

export class BascaMeetingAttendeesAPI {
  static async addAttendee(
    meetingId: string,
    memberId: string,
    userId: string,
    isPresent: boolean = false
  ): Promise<BascaMeetingAttendee> {
    try {
      const { data, error } = await supabase
        .from('basca_meeting_attendees')
        .insert({
          meeting_id: meetingId,
          member_id: memberId,
          user_id: userId,
          is_present: isPresent
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add attendee: ${error.message}`);
      }

      return this.mapDatabaseToInterface(data);
    } catch (error) {
      console.error('Error adding attendee:', error);
      throw error;
    }
  }

  static async updateAttendance(
    id: string,
    isPresent: boolean,
    arrivalTime?: string,
    departureTime?: string,
    notes?: string
  ): Promise<BascaMeetingAttendee> {
    try {
      const updateData: any = {
        is_present: isPresent
      };

      if (arrivalTime !== undefined) updateData.arrival_time = arrivalTime;
      if (departureTime !== undefined)
        updateData.departure_time = departureTime;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from('basca_meeting_attendees')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update attendance: ${error.message}`);
      }

      return this.mapDatabaseToInterface(data);
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  }

  static async removeAttendee(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('basca_meeting_attendees')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to remove attendee: ${error.message}`);
      }
    } catch (error) {
      console.error('Error removing attendee:', error);
      throw error;
    }
  }

  static async getMeetingAttendees(
    meetingId: string
  ): Promise<BascaMeetingAttendee[]> {
    try {
      const { data, error } = await supabase
        .from('basca_meeting_attendees')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch meeting attendees: ${error.message}`);
      }

      return data.map(attendee => this.mapDatabaseToInterface(attendee));
    } catch (error) {
      console.error('Error fetching meeting attendees:', error);
      throw error;
    }
  }

  static async getMemberAttendance(
    memberId: string,
    limit: number = 50
  ): Promise<BascaMeetingAttendee[]> {
    try {
      const { data, error } = await supabase
        .from('basca_meeting_attendees')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch member attendance: ${error.message}`);
      }

      return data.map(attendee => this.mapDatabaseToInterface(attendee));
    } catch (error) {
      console.error('Error fetching member attendance:', error);
      throw error;
    }
  }

  static async getAttendanceStatistics(meetingId: string): Promise<{
    total: number;
    present: number;
    absent: number;
    attendanceRate: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('basca_meeting_attendees')
        .select('*')
        .eq('meeting_id', meetingId);

      if (error) {
        throw new Error(
          `Failed to fetch attendance statistics: ${error.message}`
        );
      }

      const attendees = data.map(attendee =>
        this.mapDatabaseToInterface(attendee)
      );
      const total = attendees.length;
      const present = attendees.filter(a => a.isPresent).length;
      const absent = total - present;
      const attendanceRate = total > 0 ? (present / total) * 100 : 0;

      return { total, present, absent, attendanceRate };
    } catch (error) {
      console.error('Error getting attendance statistics:', error);
      throw error;
    }
  }

  static async bulkUpdateAttendance(
    meetingId: string,
    attendances: Array<{
      memberId: string;
      isPresent: boolean;
      arrivalTime?: string;
      departureTime?: string;
      notes?: string;
    }>
  ): Promise<BascaMeetingAttendee[]> {
    try {
      const updatedAttendees: BascaMeetingAttendee[] = [];

      for (const attendance of attendances) {
        // Check if attendee already exists
        const { data: existing } = await supabase
          .from('basca_meeting_attendees')
          .select('*')
          .eq('meeting_id', meetingId)
          .eq('member_id', attendance.memberId)
          .single();

        if (existing) {
          // Update existing attendance
          const updated = await this.updateAttendance(
            existing.id,
            attendance.isPresent,
            attendance.arrivalTime,
            attendance.departureTime,
            attendance.notes
          );
          updatedAttendees.push(updated);
        } else {
          // Add new attendance record
          const added = await this.addAttendee(
            meetingId,
            attendance.memberId,
            attendance.memberId, // Using memberId as userId for now
            attendance.isPresent
          );
          updatedAttendees.push(added);
        }
      }

      return updatedAttendees;
    } catch (error) {
      console.error('Error bulk updating attendance:', error);
      throw error;
    }
  }

  static async getMemberAttendanceRate(
    memberId: string,
    days: number = 30
  ): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from('basca_meeting_attendees')
        .select('*, basca_meetings!inner(meeting_date)')
        .eq('member_id', memberId)
        .gte(
          'basca_meetings.meeting_date',
          cutoffDate.toISOString().split('T')[0]
        );

      if (error) {
        throw new Error(
          `Failed to fetch member attendance rate: ${error.message}`
        );
      }

      if (data.length === 0) return 0;

      const present = data.filter(attendee => attendee.is_present).length;
      return (present / data.length) * 100;
    } catch (error) {
      console.error('Error getting member attendance rate:', error);
      throw error;
    }
  }

  private static mapDatabaseToInterface(data: any): BascaMeetingAttendee {
    return {
      id: data.id,
      meetingId: data.meeting_id,
      memberId: data.member_id,
      userId: data.user_id,
      isPresent: data.is_present || false,
      arrivalTime: data.arrival_time,
      departureTime: data.departure_time,
      notes: data.notes,
      createdAt: data.created_at
    };
  }
}
