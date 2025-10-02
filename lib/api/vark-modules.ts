import { supabase } from '@/lib/supabase';
import {
  VARKModule,
  VARKModuleCategory,
  VARKModuleProgress,
  VARKModuleAssignment,
  VARKLearningPath,
  VARKModuleFeedback,
  CreateVARKModuleData,
  UpdateVARKModuleData,
  VARKModuleFilters,
  VARKModuleStats
} from '@/types/vark-module';

export class VARKModulesAPI {
  private supabase = supabase;

  // VARK Module Categories
  async getCategories(): Promise<VARKModuleCategory[]> {
    const { data, error } = await this.supabase
      .from('vark_module_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    console.log('📚 Categories query result:', { data, error });

    if (error) {
      console.error('Error fetching VARK module categories:', error);
      throw new Error('Failed to fetch VARK module categories');
    }

    // If no categories exist, create a default one
    if (!data || data.length === 0) {
      console.warn('⚠️ No categories found, creating default category...');
      return await this.createDefaultCategory();
    }

    return data || [];
  }

  async createDefaultCategory(): Promise<VARKModuleCategory[]> {
    console.log('🆕 Creating default category...');

    const defaultCategory = {
      name: 'General Education',
      description: 'General educational content covering various subjects',
      subject: 'General',
      grade_level: 'All Levels',
      learning_style: 'visual',
      icon_name: 'book-open',
      color_scheme: 'from-blue-500 to-indigo-600',
      is_active: true
    };

    console.log('📝 Inserting default category:', defaultCategory);

    const { data, error } = await this.supabase
      .from('vark_module_categories')
      .insert(defaultCategory)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating default category:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to create default category: ${error.message}`);
    }

    console.log('✅ Default category created:', data);
    return [data];
  }

  async getCategoryById(id: string): Promise<VARKModuleCategory | null> {
    const { data, error } = await this.supabase
      .from('vark_module_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching VARK module category:', error);
      throw new Error('Failed to fetch VARK module category');
    }

    return data;
  }

  // VARK Modules
  async getModules(filters?: VARKModuleFilters): Promise<VARKModule[]> {
    console.log('Fetching VARK modules...');

    let query = this.supabase.from('vark_modules').select(
      `
        *,
        profiles:created_by (
          first_name,
          last_name
        )
      `
    );

    if (filters) {
      if (filters.subject) {
        query = query.contains('target_learning_styles', [filters.subject]);
      }
      if (filters.grade_level) {
        query = query.eq('target_class_id', filters.grade_level);
      }
      if (filters.learning_style) {
        query = query.contains('target_learning_styles', [
          filters.learning_style
        ]);
      }
      if (filters.difficulty_level) {
        query = query.eq('difficulty_level', filters.difficulty_level);
      }
      if (filters.searchTerm) {
        query = query.or(
          `title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`
        );
      }
    }

    const { data, error } = await query.order('created_at', {
      ascending: false
    });

    if (error) {
      console.error('Error fetching VARK modules:', error);
      throw new Error('Failed to fetch VARK modules');
    }

    // Transform data to include computed fields
    return (data || []).map(module => ({
      ...module,
      teacher_name: module.profiles
        ? `${module.profiles.first_name} ${module.profiles.last_name}`
        : 'Unknown Teacher'
    }));
  }

  async getModuleById(id: string): Promise<VARKModule | null> {
    const { data, error } = await this.supabase
      .from('vark_modules')
      .select(
        `
        *,
        profiles:created_by (
          first_name,
          last_name
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching VARK module:', error);
      throw new Error('Failed to fetch VARK module');
    }

    if (data) {
      return {
        ...data,
        teacher_name: data.profiles
          ? `${data.profiles.first_name} ${data.profiles.last_name}`
          : 'Unknown Teacher'
      };
    }

    return null;
  }

  async createModule(moduleData: CreateVARKModuleData): Promise<VARKModule> {
    console.log('Creating VARK module with data:', moduleData);

    // Ensure no id field is passed for new modules
    const { id, ...cleanModuleData } = moduleData as any;
    if (id !== undefined) {
      console.warn(
        'ID field was included in createModule call, removing it:',
        id
      );
    }

    // Handle category_id - use default if not provided
    if (
      !cleanModuleData.category_id ||
      cleanModuleData.category_id === 'default-category-id'
    ) {
      console.log(
        '🔄 No category_id provided, ensuring we have a valid category...'
      );

      console.log('🔄 No category_id provided, using default category...');
      cleanModuleData.category_id = 'general-education';
    } else {
      console.log(
        '✅ Using provided category_id:',
        cleanModuleData.category_id
      );
    }

    console.log('Clean module data (without id):', cleanModuleData);
    console.log('Attempting to insert into vark_modules table...');

    try {
      const { data, error } = await this.supabase
        .from('vark_modules')
        .insert(cleanModuleData)
        .select()
        .single();

      if (error) {
        console.error('❌ Database insertion failed:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to create VARK module: ${error.message}`);
      }

      console.log('✅ Successfully created VARK module:', data);
      console.log('Module ID:', data.id);
      console.log('Module Title:', data.title);

      return data;
    } catch (error) {
      console.error('❌ Error in createModule:', error);
      if (error instanceof Error) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while creating module');
    }
  }

  async updateModule(
    id: string,
    moduleData: UpdateVARKModuleData
  ): Promise<VARKModule> {
    const { data, error } = await this.supabase
      .from('vark_modules')
      .update(moduleData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating VARK module:', error);
      throw new Error('Failed to update VARK module');
    }

    return data;
  }

  async deleteModule(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('vark_modules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting VARK module:', error);
      throw new Error('Failed to delete VARK module');
    }
  }

  async toggleModulePublish(id: string, isPublished: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('vark_modules')
      .update({ is_published: isPublished })
      .eq('id', id);

    if (error) {
      console.error('Error toggling module publish status:', error);
      throw new Error('Failed to toggle module publish status');
    }
  }

  // VARK Module Progress
  async getStudentModuleProgress(
    studentId: string
  ): Promise<VARKModuleProgress[]> {
    const { data, error } = await this.supabase
      .from('vark_module_progress')
      .select(
        `
        *,
        vark_modules(title)
      `
      )
      .eq('student_id', studentId)
      .order('last_accessed_at', { ascending: false });

    if (error) {
      console.error('Error fetching student module progress:', error);
      throw new Error('Failed to fetch student module progress');
    }

    // Transform data to include computed fields
    return (data || []).map(progress => ({
      ...progress,
      module_title: progress.vark_modules?.title || 'Unknown Module'
    }));
  }

  async getModuleProgress(
    moduleId: string,
    studentId: string
  ): Promise<VARKModuleProgress | null> {
    const { data, error } = await this.supabase
      .from('vark_module_progress')
      .select('*')
      .eq('module_id', moduleId)
      .eq('student_id', studentId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching module progress:', error);
      throw new Error('Failed to fetch module progress');
    }

    return data;
  }

  async updateModuleProgress(
    progressData: Partial<VARKModuleProgress>
  ): Promise<VARKModuleProgress> {
    const { data, error } = await this.supabase
      .from('vark_module_progress')
      .upsert(progressData, { onConflict: 'student_id,module_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating module progress:', error);
      throw new Error('Failed to update module progress');
    }

    return data;
  }

  async startModule(
    moduleId: string,
    studentId: string
  ): Promise<VARKModuleProgress> {
    const progressData = {
      student_id: studentId,
      module_id: moduleId,
      status: 'in_progress' as const,
      progress_percentage: 0,
      started_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString()
    };

    return this.updateModuleProgress(progressData);
  }

  async completeModuleSection(
    moduleId: string,
    studentId: string,
    sectionId: string
  ): Promise<void> {
    const currentProgress = await this.getModuleProgress(moduleId, studentId);

    if (!currentProgress) {
      throw new Error('Module progress not found');
    }

    const completedSections = currentProgress.completed_sections || [];
    if (!completedSections.includes(sectionId)) {
      completedSections.push(sectionId);
    }

    const progressPercentage = Math.round((completedSections.length / 4) * 100); // Assuming 4 sections per module
    const status = progressPercentage === 100 ? 'completed' : 'in_progress';

    await this.updateModuleProgress({
      student_id: studentId,
      module_id: moduleId,
      status,
      progress_percentage: progressPercentage,
      completed_sections: completedSections,
      completed_at:
        status === 'completed' ? new Date().toISOString() : undefined,
      last_accessed_at: new Date().toISOString()
    });
  }

  // VARK Module Assignments
  async getModuleAssignments(
    assignedToType: 'student' | 'class',
    assignedToId: string
  ): Promise<VARKModuleAssignment[]> {
    const { data, error } = await this.supabase
      .from('vark_module_assignments')
      .select(
        `
        *,
        vark_modules(*),
        profiles!vark_module_assignments_assigned_by_fkey(first_name, last_name)
      `
      )
      .eq('assigned_to_type', assignedToType)
      .eq('assigned_to_id', assignedToId)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching module assignments:', error);
      throw new Error('Failed to fetch module assignments');
    }

    // Transform data to include computed fields
    return (data || []).map(assignment => ({
      ...assignment,
      module: assignment.vark_modules,
      assigned_by_name: assignment.profiles
        ? `${assignment.profiles.first_name} ${assignment.profiles.last_name}`
        : 'Unknown Teacher'
    }));
  }

  async assignModuleToStudent(
    moduleId: string,
    studentId: string,
    assignedBy: string,
    dueDate?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('vark_module_assignments')
      .insert({
        module_id: moduleId,
        assigned_by: assignedBy,
        assigned_to_type: 'student',
        assigned_to_id: studentId,
        due_date: dueDate,
        is_required: true
      });

    if (error) {
      console.error('Error assigning module to student:', error);
      throw new Error('Failed to assign module to student');
    }
  }

  async assignModuleToClass(
    moduleId: string,
    classId: string,
    assignedBy: string,
    dueDate?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('vark_module_assignments')
      .insert({
        module_id: moduleId,
        assigned_by: assignedBy,
        assigned_to_type: 'class',
        assigned_to_id: classId,
        due_date: dueDate,
        is_required: true
      });

    if (error) {
      console.error('Error assigning module to class:', error);
      throw new Error('Failed to assign module to class');
    }
  }

  // VARK Learning Paths
  async getLearningPaths(learningStyle?: string): Promise<VARKLearningPath[]> {
    let query = this.supabase
      .from('vark_learning_paths')
      .select(
        `
        *,
        profiles!vark_learning_paths_created_by_fkey(first_name, last_name)
      `
      )
      .eq('is_published', true);

    if (learningStyle) {
      query = query.eq('learning_style', learningStyle);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false
    });

    if (error) {
      console.error('Error fetching learning paths:', error);
      throw new Error('Failed to fetch learning paths');
    }

    // Transform data to include computed fields
    return (data || []).map(path => ({
      ...path,
      teacher_name: path.profiles
        ? `${path.profiles.first_name} ${path.profiles.last_name}`
        : 'Unknown Teacher'
    }));
  }

  // VARK Module Feedback
  async submitModuleFeedback(
    feedbackData: Omit<VARKModuleFeedback, 'id' | 'created_at' | 'updated_at'>
  ): Promise<VARKModuleFeedback> {
    const { data, error } = await this.supabase
      .from('vark_module_feedback')
      .upsert(feedbackData, { onConflict: 'student_id,module_id' })
      .select()
      .single();

    if (error) {
      console.error('Error submitting module feedback:', error);
      throw new Error('Failed to submit module feedback');
    }

    return data;
  }

  async getModuleFeedback(moduleId: string): Promise<VARKModuleFeedback[]> {
    const { data, error } = await this.supabase
      .from('vark_module_feedback')
      .select(
        `
        *,
        profiles!vark_module_feedback_student_id_fkey(first_name, last_name)
      `
      )
      .eq('module_id', moduleId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching module feedback:', error);
      throw new Error('Failed to fetch module feedback');
    }

    // Transform data to include computed fields
    return (data || []).map(feedback => ({
      ...feedback,
      student_name: feedback.profiles
        ? `${feedback.profiles.first_name} ${feedback.profiles.last_name}`
        : 'Unknown Student'
    }));
  }

  // VARK Module Statistics
  async getModuleStats(moduleId: string): Promise<VARKModuleStats> {
    const { data: progressData, error: progressError } = await this.supabase
      .from('vark_module_progress')
      .select('status, progress_percentage, time_spent_minutes')
      .eq('module_id', moduleId);

    if (progressError) {
      console.error('Error fetching module progress for stats:', progressError);
      throw new Error('Failed to fetch module statistics');
    }

    const { data: feedbackData, error: feedbackError } = await this.supabase
      .from('vark_module_feedback')
      .select('rating')
      .eq('module_id', moduleId);

    if (feedbackError) {
      console.error('Error fetching module feedback for stats:', feedbackError);
      throw new Error('Failed to fetch module statistics');
    }

    const totalModules = progressData?.length || 0;
    const completedModules =
      progressData?.filter(p => p.status === 'completed').length || 0;
    const inProgressModules =
      progressData?.filter(p => p.status === 'in_progress').length || 0;
    const notStartedModules =
      progressData?.filter(p => p.status === 'not_started').length || 0;

    const completionRate =
      totalModules > 0
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

    const ratings = feedbackData?.map(f => f.rating) || [];
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    const totalTimeSpent =
      progressData?.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) ||
      0;

    return {
      total_modules: totalModules,
      completed_modules: completedModules,
      in_progress_modules: inProgressModules,
      not_started_modules: notStartedModules,
      completion_rate: completionRate,
      average_rating: Math.round(averageRating * 10) / 10,
      total_time_spent: totalTimeSpent
    };
  }

  // Get modules by learning style for personalized recommendations
  async getModulesByLearningStyle(
    learningStyle: string,
    limit: number = 6
  ): Promise<VARKModule[]> {
    const { data, error } = await this.supabase
      .from('vark_modules')
      .select(
        `
        *,
        category: vark_module_categories(*),
        profiles!vark_modules_created_by_fkey(first_name, last_name)
      `
      )
      .eq('is_published', true)
      .eq('vark_module_categories.learning_style', learningStyle)
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching modules by learning style:', error);
      throw new Error('Failed to fetch modules by learning style');
    }

    // Transform data to include computed fields
    return (data || []).map(module => ({
      ...module,
      teacher_name: module.profiles
        ? `${module.profiles.first_name} ${module.profiles.last_name}`
        : 'Unknown Teacher'
    }));
  }

  // Get student's recommended modules based on their learning style
  async getRecommendedModules(
    studentId: string,
    limit: number = 6
  ): Promise<VARKModule[]> {
    // First get the student's learning style
    const { data: profileData, error: profileError } = await this.supabase
      .from('profiles')
      .select('learning_style')
      .eq('id', studentId)
      .single();

    if (profileError) {
      console.error('Error fetching student profile:', profileError);
      throw new Error('Failed to fetch student profile');
    }

    if (!profileData?.learning_style) {
      return [];
    }

    // Get modules that match the student's learning style and they haven't completed
    const { data, error } = await this.supabase
      .from('vark_modules')
      .select(
        `
        *,
        category: vark_module_categories(*),
        profiles!vark_modules_created_by_fkey(first_name, last_name),
        vark_module_progress!left(status)
      `
      )
      .eq('is_published', true)
      .eq('vark_module_categories.learning_style', profileData.learning_style)
      .or(
        `vark_module_progress.status.is.null,vark_module_progress.status.eq.not_started`
      )
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recommended modules:', error);
      throw new Error('Failed to fetch recommended modules');
    }

    // Transform data to include computed fields
    return (data || []).map(module => ({
      ...module,
      teacher_name: module.profiles
        ? `${module.profiles.first_name} ${module.profiles.last_name}`
        : 'Unknown Teacher'
    }));
  }
}
