/**
 * Module JSON Export/Import Utilities
 * Allows exporting module data to JSON file and importing it back
 */

import { VARKModule, CreateVARKModuleData } from '@/types/vark-module';

/**
 * Export module data to JSON file
 */
export function exportModuleToJSON(moduleData: Partial<VARKModule> | CreateVARKModuleData, filename?: string) {
  try {
    // Create a clean copy without undefined values
    const cleanData = JSON.parse(JSON.stringify(moduleData));

    // Create blob with JSON data
    const jsonString = JSON.stringify(cleanData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `vark-module-${Date.now()}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    console.log('✅ Module exported to JSON successfully');
    return true;
  } catch (error) {
    console.error('❌ Error exporting module to JSON:', error);
    return false;
  }
}

/**
 * Import module data from JSON file
 */
export function importModuleFromJSON(file: File): Promise<Partial<VARKModule>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const moduleData = JSON.parse(jsonString);

        console.log('✅ Module imported from JSON successfully');
        console.log('Module title:', moduleData.title);
        console.log('Sections count:', moduleData.content_structure?.sections?.length || 0);

        resolve(moduleData);
      } catch (error) {
        console.error('❌ Error parsing JSON file:', error);
        reject(new Error('Invalid JSON file format'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Validate imported module data
 */
export function validateModuleData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Missing or invalid title');
  }

  if (!data.content_structure || typeof data.content_structure !== 'object') {
    errors.push('Missing or invalid content_structure');
  }

  if (!Array.isArray(data.content_structure?.sections)) {
    errors.push('content_structure.sections must be an array');
  }

  // Check sections
  if (data.content_structure?.sections) {
    data.content_structure.sections.forEach((section: any, index: number) => {
      if (!section.id) {
        errors.push(`Section ${index + 1} missing id`);
      }
      if (!section.content_type) {
        errors.push(`Section ${index + 1} missing content_type`);
      }
      if (!section.content_data || typeof section.content_data !== 'object') {
        errors.push(`Section ${index + 1} missing or invalid content_data`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create a sample module JSON template
 */
export function createSampleModuleJSON(): Partial<VARKModule> {
  return {
    title: 'Sample Module',
    description: 'This is a sample module template',
    learning_objectives: ['Objective 1', 'Objective 2'],
    content_structure: {
      sections: [
        {
          id: 'section-sample-1',
          title: 'Introduction',
          content_type: 'text',
          content_data: {
            editorjs_data: {
              time: Date.now(),
              blocks: [
                {
                  type: 'header',
                  data: {
                    text: 'Sample Header',
                    level: 2
                  }
                },
                {
                  type: 'paragraph',
                  data: {
                    text: 'This is a sample paragraph. Replace this with your content.'
                  }
                }
              ],
              version: '2.28.0'
            }
          },
          position: 1,
          is_required: true,
          time_estimate_minutes: 10,
          learning_style_tags: ['visual', 'reading_writing'],
          interactive_elements: [],
          metadata: {}
        }
      ],
      learning_path: [],
      prerequisites_checklist: [],
      completion_criteria: []
    },
    difficulty_level: 'beginner',
    estimated_duration_minutes: 30,
    prerequisites: [],
    multimedia_content: {
      videos: [],
      images: [],
      diagrams: [],
      podcasts: [],
      audio_lessons: []
    },
    interactive_elements: {
      drag_and_drop: false,
      visual_builder: false,
      simulation: false,
      audio_playback: false,
      discussion_forum: false,
      voice_recording: false,
      text_editor: false,
      note_taking: false
    },
    assessment_questions: [],
    module_metadata: {
      content_standards: [],
      learning_competencies: [],
      key_concepts: [],
      vocabulary: [],
      real_world_applications: [],
      extension_activities: [],
      assessment_rubrics: {},
      accessibility_features: [],
      estimated_completion_time: 30,
      difficulty_indicators: []
    },
    is_published: false
  };
}

/**
 * Download sample module template
 */
export function downloadSampleTemplate() {
  const sample = createSampleModuleJSON();
  return exportModuleToJSON(sample, 'vark-module-template.json');
}
