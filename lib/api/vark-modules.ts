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

  // Extract base64 images from HTML and upload to storage
  async extractAndUploadImages(
    html: string,
    moduleId: string
  ): Promise<string> {
    try {
      console.log('🖼️ Processing images in HTML content...');

      // Find all base64 images in HTML
      const base64ImageRegex =
        /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"/g;
      let match;
      let processedHtml = html;
      let imageCount = 0;

      while ((match = base64ImageRegex.exec(html)) !== null) {
        const [fullMatch, imageType, base64Data] = match;
        imageCount++;

        try {
          // Convert base64 to blob
          const byteCharacters = atob(base64Data);
          const byteArrays = [];
          for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
          }
          const blob = new Blob([new Uint8Array(byteArrays)], {
            type: `image/${imageType}`
          });

          // Generate unique filename
          const timestamp = Date.now();
          const filename = `module-${moduleId}-image-${timestamp}-${imageCount}.${imageType}`;
          const filepath = `module-images/${filename}`;

          // Upload to storage
          const { error } = await this.supabase.storage
            .from('module-backups')
            .upload(filepath, blob, {
              contentType: `image/${imageType}`,
              upsert: false
            });

          if (!error) {
            // Get public URL
            const { data: urlData } = this.supabase.storage
              .from('module-backups')
              .getPublicUrl(filepath);

            // Replace base64 with URL in HTML
            processedHtml = processedHtml.replace(
              `data:image/${imageType};base64,${base64Data}`,
              urlData.publicUrl
            );

            console.log(
              `✅ Image ${imageCount} uploaded and replaced with URL`
            );
          }
        } catch (imgError) {
          console.warn(`⚠️ Failed to process image ${imageCount}:`, imgError);
        }
      }

      if (imageCount > 0) {
        console.log(`✅ Processed ${imageCount} images in HTML`);
      }

      return processedHtml;
    } catch (error) {
      console.error('❌ Error processing images:', error);
      return html; // Return original if processing fails
    }
  }

  // Upload JSON backup to Supabase Storage
  private async uploadModuleBackup(
    moduleData: any,
    moduleId: string
  ): Promise<string | null> {
    try {
      console.log('📤 Uploading JSON backup to storage...');

      // Create JSON blob
      const jsonString = JSON.stringify(moduleData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Check size limit (Supabase free tier: 50MB per file)
      const sizeInMB = blob.size / (1024 * 1024);
      console.log(`📊 Backup size: ${sizeInMB.toFixed(2)} MB`);

      if (sizeInMB > 45) {
        console.warn('⚠️ Backup too large, skipping upload');
        return null;
      }

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5);
      const filename = `module-backup-${moduleId}-${timestamp}.json`;
      const filepath = `vark-modules/${filename}`;

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('module-backups') // Storage bucket name
        .upload(filepath, blob, {
          contentType: 'application/json',
          upsert: false
        });

      if (error) {
        console.error('❌ Failed to upload JSON backup:', error);
        console.error('Error details:', error.message);
        return null;
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('module-backups')
        .getPublicUrl(filepath);

      console.log('✅ JSON backup uploaded:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ Error uploading JSON backup:', error);
      return null;
    }
  }

  // VARK Module Categories
  // Categories are now handled as simple text fields, not foreign keys

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
    const { id, _export_info, _exported_at, _note, ...cleanModuleData } =
      moduleData as any;
    if (id !== undefined) {
      console.warn(
        'ID field was included in createModule call, removing it:',
        id
      );
    }

    // Remove any other underscore-prefixed fields (export metadata)
    Object.keys(cleanModuleData).forEach(key => {
      if (key.startsWith('_')) {
        console.warn(`Removing export metadata field: ${key}`);
        delete cleanModuleData[key];
      }
    });

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
      // Generate temporary ID for image processing
      const tempId = crypto.randomUUID();

      // Process images in content sections to reduce payload size
      if (cleanModuleData.content_structure?.sections) {
        console.log(
          '🖼️ Processing images in sections before database insert...'
        );

        for (
          let i = 0;
          i < cleanModuleData.content_structure.sections.length;
          i++
        ) {
          const section = cleanModuleData.content_structure.sections[i];

          if (section.content_type === 'text' && section.content_data?.text) {
            // Extract base64 images and upload to storage
            const processedHtml = await this.extractAndUploadImages(
              section.content_data.text,
              tempId
            );

            // Update section with processed HTML
            cleanModuleData.content_structure.sections[i].content_data.text =
              processedHtml;
          }
        }

        console.log('✅ All images processed, payload size reduced');
      }

      // First, insert the module to get the ID
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

      // Upload JSON backup to storage
      const backupUrl = await this.uploadModuleBackup(data, data.id);

      // Update module with backup URL if upload was successful
      if (backupUrl) {
        const { error: updateError } = await this.supabase
          .from('vark_modules')
          .update({ json_backup_url: backupUrl })
          .eq('id', data.id);

        if (updateError) {
          console.warn('⚠️ Failed to save backup URL to module:', updateError);
        } else {
          console.log('✅ JSON backup URL saved to module');
          data.json_backup_url = backupUrl;
        }
      }

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
    console.log('📝 Updating VARK module:', id);
    console.log('Update data:', moduleData);

    // Clean the data - remove fields that shouldn't be updated
    const {
      id: _,
      created_at,
      created_by,
      _export_info,
      _exported_at,
      _note,
      exported_by,
      exported_at,
      teacher_name,
      category,
      progress,
      target_class,
      target_students,
      ...cleanModuleData
    } = moduleData as any;

    // Remove any other underscore-prefixed fields (export metadata)
    Object.keys(cleanModuleData).forEach(key => {
      if (key.startsWith('_')) {
        console.warn(`Removing export metadata field from update: ${key}`);
        delete cleanModuleData[key];
      }
    });

    // Handle category_id - use default if not provided
    if (
      !cleanModuleData.category_id ||
      cleanModuleData.category_id === 'default-category-id'
    ) {
      console.log('🔄 No category_id provided, using default category...');
      cleanModuleData.category_id = 'general-education';
    } else {
      console.log(
        '✅ Using provided category_id:',
        cleanModuleData.category_id
      );
    }

    // Add updated_at timestamp
    cleanModuleData.updated_at = new Date().toISOString();

    console.log('Clean update data:', cleanModuleData);

    try {
      // Process images in content sections to reduce payload size
      if (cleanModuleData.content_structure?.sections) {
        console.log('🖼️ Processing images in sections before update...');

        for (
          let i = 0;
          i < cleanModuleData.content_structure.sections.length;
          i++
        ) {
          const section = cleanModuleData.content_structure.sections[i];

          if (section.content_type === 'text' && section.content_data?.text) {
            // Extract base64 images and upload to storage
            const processedHtml = await this.extractAndUploadImages(
              section.content_data.text,
              id
            );

            // Update section with processed HTML
            cleanModuleData.content_structure.sections[i].content_data.text =
              processedHtml;
          }
        }

        console.log('✅ All images processed, payload size reduced');
      }

      // Upload JSON backup (optional, with timeout - don't block update)
      console.log('📦 Attempting JSON backup to storage...');
      try {
        const tempModuleData = {
          id,
          ...cleanModuleData
        };

        // Add 5-second timeout for backup upload
        const backupPromise = this.uploadModuleBackup(tempModuleData, id);
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Backup timeout')), 5000)
        );

        const backupUrl = await Promise.race([backupPromise, timeoutPromise]);

        if (backupUrl) {
          console.log('✅ JSON backup uploaded:', backupUrl);
          cleanModuleData.json_backup_url = backupUrl;
        }
      } catch (backupError) {
        console.warn('⚠️ JSON backup failed (non-critical):', backupError);
        // Continue with update even if backup fails
      }

      console.log('Attempting to update vark_modules table...');
      console.log({ cleanModuleData, id });

      // Single database update with all data including backup URL
      const { data, error } = await this.supabase
        .from('vark_modules')
        .update(cleanModuleData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Database update failed:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to update VARK module: ${error.message}`);
      }

      console.log('✅ Successfully updated VARK module with backup URL:', data);

      return data;
    } catch (error) {
      console.error('❌ Error in updateModule:', error);
      throw error;
    }
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

  // Get ALL progress for a student (from module_completions table)
  async getStudentProgress(studentId: string): Promise<VARKModuleProgress[]> {
    try {
      // Get completed modules from module_completions table
      const { data: completionsData, error: completionsError } = await this.supabase
        .from('module_completions')
        .select('module_id, completion_date, final_score, time_spent_minutes')
        .eq('student_id', studentId);

      if (completionsError) {
        console.error('Error fetching module completions:', completionsError);
        return [];
      }

      // Convert completions to progress format
      const progressData: VARKModuleProgress[] = (completionsData || []).map(completion => ({
        student_id: studentId,
        module_id: completion.module_id,
        progress_percentage: 100,
        status: 'completed' as const,
        completed_at: completion.completion_date,
        started_at: completion.completion_date,
        last_accessed_at: completion.completion_date,
        completed_sections: []
      }));

      console.log('✅ Loaded progress for', progressData.length, 'completed modules');
      return progressData;
    } catch (error) {
      console.error('Error in getStudentProgress:', error);
      return [];
    }
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

  async completeModule(completionData: {
    student_id: string;
    module_id: string;
    final_score: number;
    time_spent_minutes: number;
    pre_test_score?: number;
    post_test_score?: number;
    sections_completed: number;
    perfect_sections: number;
  }) {
    console.log('🎯 [API] Saving module completion:', completionData);

    const { data, error } = await this.supabase
      .from('module_completions')
      .upsert(
        {
          ...completionData,
          completion_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'student_id,module_id'
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error saving module completion:', error);
      throw new Error('Failed to save module completion');
    }

    return data;
  }

  async awardBadge(badgeData: {
    student_id: string;
    badge_type: string;
    badge_name: string;
    badge_description: string;
    badge_icon: string;
    badge_rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
    module_id?: string;
    criteria_met: any;
  }) {
    const { data, error } = await this.supabase
      .from('student_badges')
      .insert(badgeData)
      .select()
      .single();

    if (error) {
      console.error('Error awarding badge:', error);
      throw new Error('Failed to award badge');
    }

    return data;
  }

  // ==================== STUDENT SUBMISSIONS ====================

  /**
   * Save or update student's work for a specific section
   * This is called automatically as students work through sections
   */
  async saveSubmission(submissionData: {
    student_id: string;
    module_id: string;
    section_id: string;
    section_title: string;
    section_type: string; // NEW: track section type
    submission_data: any; // answers, activity responses, etc.
    assessment_results?: any; // scores if it's an assessment
    time_spent_seconds?: number;
    submission_status?: 'draft' | 'submitted' | 'reviewed';
  }) {
    console.log('💾 [API] Saving submission:', {
      section: submissionData.section_title,
      type: submissionData.section_type,
      status: submissionData.submission_status,
      hasAnswers: !!submissionData.submission_data?.answers,
      hasAssessment: !!submissionData.assessment_results
    });

    const { data, error } = await this.supabase
      .from('student_module_submissions')
      .upsert(
        {
          ...submissionData,
          updated_at: new Date().toISOString(),
          submitted_at:
            submissionData.submission_status === 'submitted'
              ? new Date().toISOString()
              : undefined
        },
        {
          onConflict: 'student_id,module_id,section_id'
        }
      )
      .select()
      .single();

    if (error) {
      console.error('❌ [API] Error saving submission:', error);
      console.error('❌ [API] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to save submission: ${error.message}`);
    }

    console.log('✅ [API] Submission saved successfully!');
    return data;
  }

  /**
   * Get all submissions for a student's module
   */
  async getStudentSubmissions(
    studentId: string,
    moduleId: string
  ): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('student_module_submissions')
      .select('*')
      .eq('student_id', studentId)
      .eq('module_id', moduleId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching submissions:', error);
      throw new Error('Failed to fetch submissions');
    }

    return data || [];
  }

  /**
   * Get all student submissions for a specific module (teacher view)
   */
  async getModuleSubmissions(moduleId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('student_module_submissions')
      .select(
        `
        *,
        student:profiles!student_module_submissions_student_id_fkey(
          id,
          first_name,
          last_name,
          email,
          learning_style,
          preferred_modules
        )
      `
      )
      .eq('module_id', moduleId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching module submissions:', error);
      throw new Error('Failed to fetch module submissions');
    }

    return data || [];
  }

  /**
   * Teacher reviews and provides feedback on submission
   */
  async reviewSubmission(
    submissionId: string,
    reviewData: {
      teacher_feedback?: string;
      teacher_score?: number;
      submission_status: 'reviewed';
    }
  ) {
    const { data, error } = await this.supabase
      .from('student_module_submissions')
      .update({
        ...reviewData,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) {
      console.error('Error reviewing submission:', error);
      throw new Error('Failed to review submission');
    }

    return data;
  }

  /**
   * Get submission statistics for a module
   */
  async getModuleSubmissionStats(moduleId: string): Promise<{
    totalStudents: number;
    submittedCount: number;
    reviewedCount: number;
    averageScore: number;
    completionRate: number;
  }> {
    // Get total number of students from profiles table
    const { data: studentsData, error: studentsError } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student');

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      throw new Error('Failed to fetch students');
    }

    const totalStudents = studentsData?.length || 0;

    // Get module completions
    const { data: completionsData, error: completionsError } = await this.supabase
      .from('module_completions')
      .select('student_id, final_score')
      .eq('module_id', moduleId);

    if (completionsError) {
      console.error('Error fetching module completions:', completionsError);
      throw new Error('Failed to fetch module completions');
    }

    const completions = completionsData || [];
    const submittedCount = completions.length;

    // Calculate average score from final_score field
    const scores = completions
      .filter((c: any) => c.final_score !== null && c.final_score !== undefined)
      .map((c: any) => c.final_score);
    
    const averageScore =
      scores.length > 0
        ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length
        : 0;

    const completionRate = totalStudents > 0
      ? Math.round((submittedCount / totalStudents) * 100)
      : 0;

    return {
      totalStudents,
      submittedCount,
      reviewedCount: 0, // Not applicable for module completions
      averageScore: Math.round(averageScore),
      completionRate
    };
  }

  async notifyTeacher(notificationData: {
    teacher_id: string;
    type: string;
    title: string;
    message: string;
    student_id?: string;
    module_id?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  }) {
    const { data, error } = await this.supabase
      .from('teacher_notifications')
      .insert({
        ...notificationData,
        priority: notificationData.priority || 'normal'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }

    return data;
  }

  // =====================================================
  // COMPLETION DATA RETRIEVAL
  // =====================================================

  async getStudentCompletions(studentId: string) {
    const { data, error } = await this.supabase
      .from('module_completions')
      .select(`
        *,
        vark_modules (
          id,
          title,
          category_id,
          difficulty_level
        )
      `)
      .eq('student_id', studentId)
      .order('completion_date', { ascending: false });

    if (error) {
      console.error('Error fetching completions:', error);
      throw new Error('Failed to fetch completions');
    }

    return data || [];
  }

  async getStudentBadges(studentId: string) {
    const { data, error } = await this.supabase
      .from('student_badges')
      .select('*')
      .eq('student_id', studentId)
      .order('earned_date', { ascending: false });

    if (error) {
      console.error('Error fetching badges:', error);
      throw new Error('Failed to fetch badges');
    }

    return data || [];
  }

  async getStudentStats(studentId: string) {
    const completions = await this.getStudentCompletions(studentId);
    const badges = await this.getStudentBadges(studentId);

    const totalModulesCompleted = completions.length;
    const averageScore = completions.length > 0
      ? completions.reduce((sum, c) => sum + (c.final_score || 0), 0) / completions.length
      : 0;
    const totalTimeSpent = completions.reduce((sum, c) => sum + (c.time_spent_minutes || 0), 0);
    const totalBadges = badges.length;

    return {
      totalModulesCompleted,
      averageScore: Math.round(averageScore),
      totalTimeSpent,
      totalBadges,
      recentCompletions: completions.slice(0, 5),
      recentBadges: badges.slice(0, 5)
    };
  }

  async getStudentModuleCompletion(studentId: string, moduleId: string) {
    const { data, error } = await this.supabase
      .from('module_completions')
      .select('*')
      .eq('student_id', studentId)
      .eq('module_id', moduleId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching student module completion:', error);
      throw new Error('Failed to fetch student module completion');
    }

    return data || null;
  }

  async getModuleCompletions(moduleId: string) {
    const { data, error } = await this.supabase
      .from('module_completions')
      .select(`
        *,
        profiles!module_completions_student_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('module_id', moduleId)
      .order('completion_date', { ascending: false });

    if (error) {
      console.error('Error fetching module completions:', error);
      throw new Error('Failed to fetch module completions');
    }

    return data || [];
  }
}
