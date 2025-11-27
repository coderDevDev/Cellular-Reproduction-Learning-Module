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
      const htmlSize = (new Blob([html]).size / (1024 * 1024)).toFixed(2);
      // console.log(`🖼️ Processing images in HTML content (${htmlSize} MB)...`);

      // Find all base64 images in HTML - more flexible regex
      // Matches: src="data:image/...", src='data:image/...', src=data:image/...
      const base64ImageRegex =
        /src=["']?(data:image\/[^;]+;base64,[^"'\s>]+)["']?/gi;
      let match;
      let processedHtml = html;
      let imageCount = 0;
      let successCount = 0;
      
      // Count total images first
      const matches = html.match(base64ImageRegex);
      const totalImages = matches ? matches.length : 0;
      

      if(totalImages>0){
    console.log({html,totalImages})
      }

      // console.log({html,totalImages})
      if (totalImages === 0) {
        // Debug: Show a sample of the HTML to help diagnose
        const htmlSample = html.substring(0, 500);
        console.log('ℹ️ No base64 images found in this content');
        if (html.includes('data:image')) {
          console.warn('⚠️ HTML contains "data:image" but regex did not match!');
          console.warn('Sample:', htmlSample);
        }
        return html;
      }
      
      console.log(`🔍 Found ${totalImages} base64 images to extract`);
      const startTime = Date.now();

      while ((match = base64ImageRegex.exec(html)) !== null) {
        const [fullMatch, dataUrl] = match;
        imageCount++;
        
        // Extract image type and base64 data from the data URL
        const dataUrlMatch = dataUrl.match(/data:image\/([^;]+);base64,(.+)/);
        if (!dataUrlMatch) {
          console.warn(`⚠️ Could not parse data URL for image ${imageCount}`);
          continue;
        }
        
        const [, imageType, base64Data] = dataUrlMatch;

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

          // Upload to storage (use module-images bucket)
          const { error } = await this.supabase.storage
            .from('module-images')
            .upload(filepath, blob, {
              contentType: `image/${imageType}`,
              upsert: true
            });

          if (!error) {
            // Get public URL
            const { data: urlData } = this.supabase.storage
              .from('module-images')
              .getPublicUrl(filepath);

            // Replace base64 with URL in HTML (replace the full data URL)
            processedHtml = processedHtml.replace(
              dataUrl,
              urlData.publicUrl
            );

            successCount++;
            
            // Log progress every 10 images
            if (imageCount % 10 === 0 || imageCount === totalImages) {
              console.log(`✅ Image ${imageCount}/${totalImages} uploaded and replaced with URL`);
            }
          } else {
            console.error(`❌ Image ${imageCount} upload FAILED:`, error.message);
            console.error('Bucket: module-images, Path:', filepath);
          }
        } catch (imgError) {
          console.error(`❌ Failed to process image ${imageCount}:`, imgError);
        }
      }

      if (imageCount > 0) {
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(1);
        const originalSize = new Blob([html]).size / (1024 * 1024);
        const processedSize = new Blob([processedHtml]).size / (1024 * 1024);
        const reduction = originalSize - processedSize;
        const reductionPercent = ((reduction / originalSize) * 100).toFixed(1);
        
        console.log(`✅ Processed ${successCount}/${imageCount} images successfully in ${duration}s`);
        
        if (successCount > 0) {
          console.log(`📊 Size reduction: ${originalSize.toFixed(2)} MB → ${processedSize.toFixed(2)} MB (-${reduction.toFixed(2)} MB, ${reductionPercent}% smaller)`);
        } else {
          console.error(`❌❌❌ NO IMAGES WERE EXTRACTED! Size unchanged: ${originalSize.toFixed(2)} MB`);
          console.error('Check if "module-images" bucket exists and is PUBLIC');
        }
      }

      return processedHtml;
    } catch (error) {
      console.error('❌ Error processing images:', error);
      return html; // Return original if processing fails
    }
  }

  // Upload full module JSON to Supabase Storage
  private async uploadModuleJSON(
    moduleData: any,
    moduleId: string
  ): Promise<string | null> {
    try {
      console.log('📤 Uploading module JSON to storage...');

      // Create JSON blob
      const jsonString = JSON.stringify(moduleData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Check size limit (Supabase free tier: 50MB per file)
      const sizeInMB = blob.size / (1024 * 1024);
      console.log(`📊 Module JSON size: ${sizeInMB.toFixed(2)} MB`);

      // if (sizeInMB > 45) {
      //   throw new Error(`Module JSON too large: ${sizeInMB.toFixed(2)} MB (max 45 MB)`);
      // }

      // Use consistent filename (no timestamp) for easy retrieval
      const filename = `module-${moduleId}.json`;
      const filepath = `vark-modules/${filename}`;

      // Upload to Supabase Storage (upsert to allow updates)

      console.log({here:true})
      const { data, error } = await this.supabase.storage
        .from('module-content') // Dedicated bucket for module content
        .upload(filepath, blob, {
          contentType: 'application/json',
          upsert: true // Allow overwriting on updates
        });

              console.log({here:true})
      if (error) {
        console.error('❌ Failed to upload module JSON:', error);
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('module-content')
        .getPublicUrl(filepath);

      console.log('✅ Module JSON uploaded:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ Error uploading module JSON:', error);
      throw error;
    }
  }

  // Delete module JSON from storage (cleanup on failure)
  private async deleteModuleJSON(moduleId: string): Promise<void> {
    try {
      const filename = `module-${moduleId}.json`;
      const filepath = `vark-modules/${filename}`;

      await this.supabase.storage
        .from('module-content')
        .remove([filepath]);

      console.log('🗑️ Cleaned up module JSON:', filepath);
    } catch (error) {
      console.warn('⚠️ Failed to cleanup module JSON:', error);
    }
  }

  // Fetch full module content from storage URL
  async fetchModuleContent(jsonUrl: string): Promise<any> {
    try {
      console.log('📥 Fetching module content from:', jsonUrl);

      // Add cache-busting to ensure fresh content
      const cacheBustUrl = `${jsonUrl}?t=${Date.now()}`;
      console.log('🔄 Cache-busted URL:', cacheBustUrl);

      const response = await fetch(cacheBustUrl, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const content = await response.json();
      console.log('✅ Module content fetched successfully');
      console.log('📊 Fetched content keys:', Object.keys(content));
      console.log('🔄 Fetched sections count:', content.content_structure?.sections?.length || 0);
      console.log('📋 Fetched section titles:', content.content_structure?.sections?.map((s: any) => s.title) || []);
      
      return content;
    } catch (error) {
      console.error('❌ Error fetching module content:', error);
      throw new Error('Failed to load module content');
    }
  }

  // Legacy method for backward compatibility (backup uploads)
  private async uploadModuleBackup(
    moduleData: any,
    moduleId: string
  ): Promise<string | null> {
    // Just use the new uploadModuleJSON method
    return this.uploadModuleJSON(moduleData, moduleId);
  }

  // VARK Module Categories
  // Categories are now handled as simple text fields, not foreign keys

  // VARK Modules
  async getModules(filters?: VARKModuleFilters): Promise<VARKModule[]> {
    console.log('Fetching VARK modules (lightweight listing)...');

    // Fetch ONLY fields needed for listing (exclude heavy content)
    let query = this.supabase.from('vark_modules').select(
      `
        id,
        title,
        description,
        category_id,
        difficulty_level,
        estimated_duration_minutes,
        is_published,
        created_by,
        created_at,
        updated_at,
        target_learning_styles,
        target_class_id,
        learning_objectives,
        json_content_url,
        content_summary,
        prerequisite_module_id,
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
      const module: VARKModule = {
        ...data,
        teacher_name: data.profiles
          ? `${data.profiles.first_name} ${data.profiles.last_name}`
          : 'Unknown Teacher'
      };

      // If module has json_content_url, fetch and merge the full content
      if (data.json_content_url) {
        try {
          console.log('📥 Fetching full module data from storage...');
          const fullModuleData = await this.fetchModuleContent(data.json_content_url);
          
          // Merge ALL fields from storage (content is source of truth)
          // But preserve DB-only metadata fields (DB is source of truth for these)
          Object.assign(module, {
            ...fullModuleData,
            // Preserve DB-only fields (these are NOT stored in JSON)
            id: data.id,
            created_at: data.created_at,
            created_by: data.created_by,
            updated_at: data.updated_at,
            json_content_url: data.json_content_url,
            is_published: data.is_published, // DB is source of truth for publish status
            teacher_name: module.teacher_name
          });
          
          console.log('✅ Full module data merged from storage');
          console.log('📊 Total size:', JSON.stringify(fullModuleData).length, 'bytes');
        } catch (error) {
          console.warn('⚠️ Failed to fetch module content from storage:', error);
          console.log('Using database fallback (if available)');
          // If fetching fails, the module will use whatever is in the database
          // This provides backward compatibility for old modules
        }
      }

      return module;
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

      // Process images in content sections
      if (cleanModuleData.content_structure?.sections) {
        const totalSections = cleanModuleData.content_structure.sections.length;
        console.log(
          `🖼️ Processing images in ${totalSections} sections...`
        );

        let sectionsProcessed = 0;
        for (
          let i = 0;
          i < cleanModuleData.content_structure.sections.length;
          i++
        ) {
          const section = cleanModuleData.content_structure.sections[i];

          // Check multiple possible locations for HTML content
          let htmlContent: string | null = null;
          let contentPath: string = '';

          if (section.content_data?.text) {
            htmlContent = section.content_data.text;
            contentPath = 'content_data.text';
          } else if (section.content_data?.read_aloud_data?.content) {
            htmlContent = section.content_data.read_aloud_data.content;
            contentPath = 'content_data.read_aloud_data.content';
          }

          if (htmlContent) {
            console.log(`Processing section ${i + 1}/${totalSections}: "${section.title}" (type: ${section.content_type}, path: ${contentPath})`);
            
            // Extract base64 images and upload to storage
            const processedHtml = await this.extractAndUploadImages(
              htmlContent,
              tempId
            );

            // Update section with processed HTML at the correct location
            if (contentPath === 'content_data.text') {
              cleanModuleData.content_structure.sections[i].content_data.text = processedHtml;
            } else if (contentPath === 'content_data.read_aloud_data.content') {
              cleanModuleData.content_structure.sections[i].content_data.read_aloud_data.content = processedHtml;
            }
              
            sectionsProcessed++;
          }
        }

        console.log(`✅ Processed ${sectionsProcessed}/${totalSections} sections with HTML content`);
      }

      // Upload full module JSON to storage FIRST (before database insert)
      console.log('📤 Uploading full module JSON to storage...');
      const jsonUrl = await this.uploadModuleJSON(cleanModuleData, tempId);
      
      if (!jsonUrl) {
        throw new Error('Failed to upload module JSON to storage');
      }
      
      console.log('✅ Module JSON uploaded:', jsonUrl);

      // Prepare lightweight metadata for database (WITHOUT heavy content)
      const dbMetadata = {
        id: tempId,
        category_id: cleanModuleData.category_id,
        title: cleanModuleData.title,
        description: cleanModuleData.description,
        learning_objectives: cleanModuleData.learning_objectives,
        difficulty_level: cleanModuleData.difficulty_level,
        estimated_duration_minutes: cleanModuleData.estimated_duration_minutes,
        prerequisites: cleanModuleData.prerequisites,
        is_published: cleanModuleData.is_published,
        created_by: cleanModuleData.created_by,
        target_class_id: cleanModuleData.target_class_id,
        target_learning_styles: cleanModuleData.target_learning_styles,
        json_content_url: jsonUrl,
        // Store only summary, not full content
        content_summary: {
          sections_count: cleanModuleData.content_structure?.sections?.length || 0,
          assessment_count: cleanModuleData.assessment_questions?.length || 0,
          has_multimedia: Object.values(cleanModuleData.multimedia_content || {}).some(
            v => v && (Array.isArray(v) ? v.length > 0 : true)
          )
        }
      };

      // Insert lightweight metadata into database
      console.log('💾 Inserting module metadata into database...');
      const { data, error } = await this.supabase
        .from('vark_modules')
        .insert(dbMetadata)
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
        
        // Clean up uploaded JSON if database insert fails
        await this.deleteModuleJSON(tempId);
        
        throw new Error(`Failed to create VARK module: ${error.message}`);
      }

      console.log('✅ Successfully created VARK module:', data);
      console.log('Module ID:', data.id);
      console.log('Module Title:', data.title);
      console.log('JSON URL:', data.json_content_url);
      console.log('📊 Database payload size: ~', JSON.stringify(dbMetadata).length, 'bytes');
      console.log('📊 Full content in storage: ~', JSON.stringify(cleanModuleData).length, 'bytes');

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
        const totalSections = cleanModuleData.content_structure.sections.length;
        console.log(
          `🖼️ Processing images in ${totalSections} sections before update...`
        );

        let sectionsProcessed = 0;
        for (
          let i = 0;
          i < cleanModuleData.content_structure.sections.length;
          i++
        ) {
          const section = cleanModuleData.content_structure.sections[i];

          // Check multiple possible locations for HTML content
          let htmlContent: string | null = null;
          let contentPath: string = '';

          if (section.content_data?.text) {
            htmlContent = section.content_data.text;
            contentPath = 'content_data.text';
          } else if (section.content_data?.read_aloud_data?.content) {
            htmlContent = section.content_data.read_aloud_data.content;
            contentPath = 'content_data.read_aloud_data.content';
          }

          if (htmlContent) {
            console.log(`Processing section ${i + 1}/${totalSections}: "${section.title}" (type: ${section.content_type}, path: ${contentPath})`);
            
            // Extract base64 images and upload to storage
            const processedHtml = await this.extractAndUploadImages(
              htmlContent,
              id
            );

            // Update section with processed HTML at the correct location
            if (contentPath === 'content_data.text') {
              cleanModuleData.content_structure.sections[i].content_data.text = processedHtml;
            } else if (contentPath === 'content_data.read_aloud_data.content') {
              cleanModuleData.content_structure.sections[i].content_data.read_aloud_data.content = processedHtml;
            }
              
            sectionsProcessed++;
          }
        }

        console.log(`✅ Processed ${sectionsProcessed}/${totalSections} sections with HTML content`);
      }

      // Upload full module JSON to storage
      console.log('� Uploading updated module JSON to storage...');
      const fullModuleData = {
        id,
        ...cleanModuleData
      };
      
      const jsonUrl = await this.uploadModuleJSON(fullModuleData, id);
      
      if (!jsonUrl) {
        throw new Error('Failed to upload module JSON to storage');
      }
      
      console.log('✅ Module JSON uploaded:', jsonUrl);

      // Prepare lightweight metadata for database (WITHOUT heavy content)
      const dbMetadata: any = {
        category_id: cleanModuleData.category_id,
        title: cleanModuleData.title,
        description: cleanModuleData.description,
        learning_objectives: cleanModuleData.learning_objectives,
        difficulty_level: cleanModuleData.difficulty_level,
        estimated_duration_minutes: cleanModuleData.estimated_duration_minutes,
        prerequisites: cleanModuleData.prerequisites,
        is_published: cleanModuleData.is_published,
        target_class_id: cleanModuleData.target_class_id,
        target_learning_styles: cleanModuleData.target_learning_styles,
        prerequisite_module_id: cleanModuleData.prerequisite_module_id,
        json_content_url: jsonUrl,
        updated_at: cleanModuleData.updated_at,
        // Update content summary
        content_summary: {
          sections_count: cleanModuleData.content_structure?.sections?.length || 0,
          assessment_count: cleanModuleData.assessment_questions?.length || 0,
          has_multimedia: Object.values(cleanModuleData.multimedia_content || {}).some(
            v => v && (Array.isArray(v) ? v.length > 0 : true)
          )
        }
      };

      console.log('💾 Updating module metadata in database...');
      console.log('📊 Database payload size: ~', JSON.stringify(dbMetadata).length, 'bytes');
      console.log('📊 Full content in storage: ~', JSON.stringify(fullModuleData).length, 'bytes');

      // Update only metadata in database
      const { data, error } = await this.supabase
        .from('vark_modules')
        .update(dbMetadata)
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

      console.log('✅ Successfully updated VARK module:', data);

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
        // If table doesn't exist (406) or other errors, silently return empty array
        if (completionsError.code === 'PGRST116' || completionsError.message.includes('does not exist')) {
          console.log('ℹ️ module_completions table not found, returning empty progress');
        } else {
          console.warn('⚠️ Error fetching module completions:', completionsError.message);
        }
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

    if (error) {
      // Silently handle missing table or no data found
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return null;
      }
      console.warn('⚠️ Error fetching student module completion:', error.message);
      return null; // Return null instead of throwing
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
      // Silently handle missing table
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return [];
      }
      console.warn('⚠️ Error fetching module completions:', error.message);
      return []; // Return empty array instead of throwing
    }

    return data || [];
  }
}
