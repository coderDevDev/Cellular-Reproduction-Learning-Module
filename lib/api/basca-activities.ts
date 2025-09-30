import { supabase } from '@/lib/supabase';
import type {
  BascaActivity,
  CreateBascaActivityData,
  UpdateBascaActivityData
} from '@/types/basca';

export class BascaActivitiesAPI {
  static async createActivity(
    data: CreateBascaActivityData,
    userId: string
  ): Promise<BascaActivity> {
    try {
      const { data: activity, error } = await supabase
        .from('basca_activities')
        .insert({
          title: data.title,
          description: data.description,
          activity_date: data.activityDate,
          end_date: data.endDate,
          start_time: data.startTime,
          end_time: data.endTime,
          location: data.location,
          barangay: data.barangay,
          barangay_code: data.barangayCode,
          activity_type: data.activityType,
          target_audience: data.targetAudience,
          expected_participants: data.expectedParticipants,
          min_participants: data.minParticipants,
          max_participants: data.maxParticipants,
          budget: data.budget,
          is_recurring: data.isRecurring,
          recurrence_pattern: data.recurrencePattern,
          recurrence_days: data.recurrenceDays,
          require_registration: data.requireRegistration,
          require_approval: data.requireApproval,
          is_public: data.isPublic,
          expected_outcome: data.expectedOutcome,
          objectives: data.objectives,
          requirements: data.requirements,
          notes: data.notes,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create activity: ${error.message}`);
      }

      return this.mapDatabaseToInterface(activity);
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  static async updateActivity(
    data: UpdateBascaActivityData,
    userId: string
  ): Promise<BascaActivity> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
        updated_by: userId
      };

      if (data.title) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.activityDate) updateData.activity_date = data.activityDate;
      if (data.endDate !== undefined) updateData.end_date = data.endDate;
      if (data.startTime) updateData.start_time = data.startTime;
      if (data.endTime !== undefined) updateData.end_time = data.endTime;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.barangay) updateData.barangay = data.barangay;
      if (data.barangayCode) updateData.barangay_code = data.barangayCode;
      if (data.activityType) updateData.activity_type = data.activityType;
      if (data.targetAudience !== undefined)
        updateData.target_audience = data.targetAudience;
      if (data.expectedParticipants !== undefined)
        updateData.expected_participants = data.expectedParticipants;
      if (data.minParticipants !== undefined)
        updateData.min_participants = data.minParticipants;
      if (data.maxParticipants !== undefined)
        updateData.max_participants = data.maxParticipants;
      if (data.actualParticipants !== undefined)
        updateData.actual_participants = data.actualParticipants;
      if (data.budget !== undefined) updateData.budget = data.budget;
      if (data.isRecurring !== undefined)
        updateData.is_recurring = data.isRecurring;
      if (data.recurrencePattern !== undefined)
        updateData.recurrence_pattern = data.recurrencePattern;
      if (data.recurrenceDays !== undefined)
        updateData.recurrence_days = data.recurrenceDays;
      if (data.requireRegistration !== undefined)
        updateData.require_registration = data.requireRegistration;
      if (data.requireApproval !== undefined)
        updateData.require_approval = data.requireApproval;
      if (data.isPublic !== undefined) updateData.is_public = data.isPublic;
      if (data.expectedOutcome !== undefined)
        updateData.expected_outcome = data.expectedOutcome;
      if (data.objectives !== undefined)
        updateData.objectives = data.objectives;
      if (data.requirements !== undefined)
        updateData.requirements = data.requirements;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.isCompleted !== undefined)
        updateData.is_completed = data.isCompleted;
      if (data.outcomes !== undefined) updateData.outcomes = data.outcomes;
      if (data.challenges !== undefined)
        updateData.challenges = data.challenges;
      if (data.recommendations !== undefined)
        updateData.recommendations = data.recommendations;

      const { data: activity, error } = await supabase
        .from('basca_activities')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update activity: ${error.message}`);
      }

      return this.mapDatabaseToInterface(activity);
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  }

  static async deleteActivity(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('basca_activities')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete activity: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  static async getActivity(id: string): Promise<BascaActivity | null> {
    try {
      const { data, error } = await supabase
        .from('basca_activities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to fetch activity: ${error.message}`);
      }

      return this.mapDatabaseToInterface(data);
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  }

  static async getAllActivities(barangay?: string): Promise<BascaActivity[]> {
    try {
      let query = supabase.from('basca_activities').select('*');

      if (barangay) {
        query = query.eq('barangay', barangay);
      }

      const { data, error } = await query.order('activity_date', {
        ascending: false
      });

      if (error) {
        throw new Error(`Failed to fetch activities: ${error.message}`);
      }

      return data.map(activity => this.mapDatabaseToInterface(activity));
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  static async getUpcomingActivities(
    barangay?: string,
    limit: number = 10
  ): Promise<BascaActivity[]> {
    try {
      let query = supabase
        .from('basca_activities')
        .select('*')
        .gte('activity_date', new Date().toISOString().split('T')[0])
        .eq('is_completed', false)
        .order('activity_date', { ascending: true });

      if (barangay) {
        query = query.eq('barangay', barangay);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(
          `Failed to fetch upcoming activities: ${error.message}`
        );
      }

      return data.map(activity => this.mapDatabaseToInterface(activity));
    } catch (error) {
      console.error('Error fetching upcoming activities:', error);
      throw error;
    }
  }

  static async getActivitiesByType(
    activityType: string,
    barangay?: string
  ): Promise<BascaActivity[]> {
    try {
      let query = supabase
        .from('basca_activities')
        .select('*')
        .eq('activity_type', activityType)
        .order('activity_date', { ascending: false });

      if (barangay) {
        query = query.eq('barangay', barangay);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch activities by type: ${error.message}`);
      }

      return data.map(activity => this.mapDatabaseToInterface(activity));
    } catch (error) {
      console.error('Error fetching activities by type:', error);
      throw error;
    }
  }

  static async markActivityAsCompleted(
    id: string,
    actualParticipants: number,
    outcomes?: string,
    challenges?: string,
    recommendations?: string
  ): Promise<BascaActivity> {
    try {
      const updateData: any = {
        is_completed: true,
        actual_participants: actualParticipants,
        updated_at: new Date().toISOString()
      };

      if (outcomes !== undefined) updateData.outcomes = outcomes;
      if (challenges !== undefined) updateData.challenges = challenges;
      if (recommendations !== undefined)
        updateData.recommendations = recommendations;

      const { data, error } = await supabase
        .from('basca_activities')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Failed to mark activity as completed: ${error.message}`
        );
      }

      return this.mapDatabaseToInterface(data);
    } catch (error) {
      console.error('Error marking activity as completed:', error);
      throw error;
    }
  }

  static async getActivityStatistics(barangay?: string): Promise<{
    total: number;
    completed: number;
    upcoming: number;
    byType: Record<string, number>;
  }> {
    try {
      let query = supabase.from('basca_activities').select('*');

      if (barangay) {
        query = query.eq('barangay', barangay);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(
          `Failed to fetch activities for statistics: ${error.message}`
        );
      }

      const activities = data.map(activity =>
        this.mapDatabaseToInterface(activity)
      );
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const total = activities.length;
      const completed = activities.filter(a => a.isCompleted).length;
      const upcoming = activities.filter(
        a => !a.isCompleted && a.activityDate >= today
      ).length;

      const byType: Record<string, number> = {};
      activities.forEach(activity => {
        byType[activity.activityType] =
          (byType[activity.activityType] || 0) + 1;
      });

      return { total, completed, upcoming, byType };
    } catch (error) {
      console.error('Error getting activity statistics:', error);
      throw error;
    }
  }

  private static mapDatabaseToInterface(data: any): BascaActivity {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      activityDate: data.activity_date,
      endDate: data.end_date,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location,
      barangay: data.barangay,
      barangayCode: data.barangay_code,
      activityType: data.activity_type,
      targetAudience: data.target_audience,
      expectedParticipants: data.expected_participants,
      minParticipants: data.min_participants,
      maxParticipants: data.max_participants,
      actualParticipants: data.actual_participants || 0,
      budget: data.budget,
      isRecurring: data.is_recurring || false,
      recurrencePattern: data.recurrence_pattern,
      recurrenceDays: data.recurrence_days || [],
      requireRegistration: data.require_registration || false,
      requireApproval: data.require_approval || false,
      isPublic: data.is_public !== false,
      expectedOutcome: data.expected_outcome,
      objectives: data.objectives || [],
      requirements: data.requirements || [],
      notes: data.notes,
      isCompleted: data.is_completed || false,
      outcomes: data.outcomes,
      challenges: data.challenges,
      recommendations: data.recommendations,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
