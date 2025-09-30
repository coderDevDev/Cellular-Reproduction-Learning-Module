import { supabase } from '@/lib/supabase';
import type {
  BascaTrainingSession,
  CreateBascaTrainingSessionData,
  UpdateBascaTrainingSessionData
} from '@/types/basca';

export class BascaTrainingAPI {
  static async createTrainingSession(
    data: CreateBascaTrainingSessionData,
    userId: string
  ): Promise<BascaTrainingSession> {
    try {
      const { data: training, error } = await supabase
        .from('basca_training_sessions')
        .insert({
          title: data.title,
          description: data.description,
          training_date: data.trainingDate,
          start_time: data.startTime,
          end_time: data.endTime,
          location: data.location,
          trainer_name: data.trainerName,
          trainer_organization: data.trainerOrganization,
          training_type: data.trainingType,
          max_participants: data.maxParticipants,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create training session: ${error.message}`);
      }

      return this.mapDatabaseToInterface(training);
    } catch (error) {
      console.error('Error creating training session:', error);
      throw error;
    }
  }

  static async updateTrainingSession(
    data: UpdateBascaTrainingSessionData,
    userId: string
  ): Promise<BascaTrainingSession> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
        updated_by: userId
      };

      if (data.title) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.trainingDate) updateData.training_date = data.trainingDate;
      if (data.startTime) updateData.start_time = data.startTime;
      if (data.endTime !== undefined) updateData.end_time = data.endTime;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.trainerName !== undefined)
        updateData.trainer_name = data.trainerName;
      if (data.trainerOrganization !== undefined)
        updateData.trainer_organization = data.trainerOrganization;
      if (data.trainingType) updateData.training_type = data.trainingType;
      if (data.maxParticipants !== undefined)
        updateData.max_participants = data.maxParticipants;
      if (data.currentParticipants !== undefined)
        updateData.current_participants = data.currentParticipants;
      if (data.isCompleted !== undefined)
        updateData.is_completed = data.isCompleted;

      const { data: training, error } = await supabase
        .from('basca_training_sessions')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update training session: ${error.message}`);
      }

      return this.mapDatabaseToInterface(training);
    } catch (error) {
      console.error('Error updating training session:', error);
      throw error;
    }
  }

  static async deleteTrainingSession(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('basca_training_sessions')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete training session: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting training session:', error);
      throw error;
    }
  }

  static async getTrainingSession(
    id: string
  ): Promise<BascaTrainingSession | null> {
    try {
      const { data, error } = await supabase
        .from('basca_training_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to fetch training session: ${error.message}`);
      }

      return this.mapDatabaseToInterface(data);
    } catch (error) {
      console.error('Error fetching training session:', error);
      throw error;
    }
  }

  static async getAllTrainingSessions(
    barangay?: string
  ): Promise<BascaTrainingSession[]> {
    try {
      let query = supabase.from('basca_training_sessions').select('*');

      if (barangay) {
        query = query.eq('barangay', barangay);
      }

      const { data, error } = await query.order('training_date', {
        ascending: false
      });

      if (error) {
        throw new Error(`Failed to fetch training sessions: ${error.message}`);
      }

      return data.map(training => this.mapDatabaseToInterface(training));
    } catch (error) {
      console.error('Error fetching training sessions:', error);
      throw error;
    }
  }

  static async getUpcomingTrainingSessions(
    barangay?: string,
    limit: number = 10
  ): Promise<BascaTrainingSession[]> {
    try {
      let query = supabase
        .from('basca_training_sessions')
        .select('*')
        .gte('training_date', new Date().toISOString().split('T')[0])
        .eq('is_completed', false)
        .order('training_date', { ascending: true });

      if (barangay) {
        query = query.eq('barangay', barangay);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(
          `Failed to fetch upcoming training sessions: ${error.message}`
        );
      }

      return data.map(training => this.mapDatabaseToInterface(training));
    } catch (error) {
      console.error('Error fetching upcoming training sessions:', error);
      throw error;
    }
  }

  static async getTrainingSessionsByType(
    trainingType: string,
    barangay?: string
  ): Promise<BascaTrainingSession[]> {
    try {
      let query = supabase
        .from('basca_training_sessions')
        .select('*')
        .eq('training_type', trainingType)
        .order('training_date', { ascending: false });

      if (barangay) {
        query = query.eq('barangay', barangay);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(
          `Failed to fetch training sessions by type: ${error.message}`
        );
      }

      return data.map(training => this.mapDatabaseToInterface(training));
    } catch (error) {
      console.error('Error fetching training sessions by type:', error);
      throw error;
    }
  }

  static async markTrainingSessionAsCompleted(
    id: string
  ): Promise<BascaTrainingSession> {
    try {
      const { data, error } = await supabase
        .from('basca_training_sessions')
        .update({
          is_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Failed to mark training session as completed: ${error.message}`
        );
      }

      return this.mapDatabaseToInterface(data);
    } catch (error) {
      console.error('Error marking training session as completed:', error);
      throw error;
    }
  }

  static async updateParticipantCount(
    id: string,
    currentParticipants: number
  ): Promise<BascaTrainingSession> {
    try {
      const { data, error } = await supabase
        .from('basca_training_sessions')
        .update({
          current_participants: currentParticipants,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update participant count: ${error.message}`);
      }

      return this.mapDatabaseToInterface(data);
    } catch (error) {
      console.error('Error updating participant count:', error);
      throw error;
    }
  }

  private static mapDatabaseToInterface(data: any): BascaTrainingSession {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      trainingDate: data.training_date,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location,
      trainerName: data.trainer_name,
      trainerOrganization: data.trainer_organization,
      trainingType: data.training_type,
      maxParticipants: data.max_participants,
      currentParticipants: data.current_participants || 0,
      isCompleted: data.is_completed || false,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
