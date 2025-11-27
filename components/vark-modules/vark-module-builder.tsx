'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Headphones,
  PenTool,
  Zap,
  BookOpen,
  Target,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Settings,
  FileText,
  Activity,
  Brain,
  Type,
  Table,
  BarChart3,
  Sparkles,
  GraduationCap,
  Lightbulb,
  Rocket,
  Database,
  Loader2,
  Upload,
  FileUp
} from 'lucide-react';
import {
  VARKModule,
  VARKModuleContentSection,
  VARKModuleCategory
} from '@/types/vark-module';
import { Class } from '@/types/class';
import { sampleCellDivisionModule } from '@/data/sample-cell-division-module';
import { module1CellDivisionReadingWriting } from '@/data/module1-cell-division-reading-writing';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import BasicInfoStep from './steps/basic-info-step';
import ContentStructureStep from './steps/content-structure-step';
import ReviewStep from './steps/review-step';
import DynamicModuleViewer from './dynamic-module-viewer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface VARKModuleBuilderProps {
  onSave: (module: VARKModule) => void;
  onCancel: () => void;
  initialData?: Partial<VARKModule>;
  categories?: VARKModuleCategory[];
  teacherClasses?: Class[];
  availableModules?: VARKModule[];
}

const learningStyleIcons = {
  everyone: Target,
  visual: Eye,
  auditory: Headphones,
  reading_writing: PenTool,
  kinesthetic: Zap
};

const learningStyleColors = {
  everyone: 'from-teal-500 to-teal-600',
  visual: 'from-blue-500 to-blue-600',
  auditory: 'from-green-500 to-green-600',
  reading_writing: 'from-purple-500 to-purple-600',
  kinesthetic: 'from-orange-500 to-orange-600'
};

const contentTypeIcons = {
  text: Type,
  // video: Video,
  // audio: Mic,
  // interactive: Play,
  activity: Activity,
  assessment: FileText,
  quick_check: CheckCircle,
  highlight: Brain,
  table: Table,
  diagram: BarChart3
};

const stepConfig = [
  {
    step: 1,
    title: 'Basic Info',
    description: 'Module fundamentals',
    icon: BookOpen,
    color: 'from-teal-500 to-teal-600'
  },
  {
    step: 2,
    title: 'Content Structure',
    description: 'Build your sections',
    icon: Activity,
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    step: 3,
    title: 'Review & Save',
    description: 'Finalize module',
    icon: CheckCircle,
    color: 'from-emerald-700 to-teal-800'
  }
];

export default function VARKModuleBuilder({
  onSave,
  onCancel,
  initialData,
  categories = [],
  teacherClasses = [],
  availableModules = []
}: VARKModuleBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [sampleDataModal, setSampleDataModal] = useState({
    isOpen: false,
    type: 'warning' as const,
    sampleType: 'multi-style' as 'multi-style' | 'reading-writing'
  });
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: ''
  });
  const [formData, setFormData] = useState<Partial<VARKModule>>({
    id: initialData?.id || crypto.randomUUID(),
    category_id: initialData?.category_id || (categories.length > 0 ? categories[0].id : 'general-education'),
    title: initialData?.title || 'New VARK Module',
    description: initialData?.description || 'A comprehensive learning module designed for diverse learning styles.',
    learning_objectives: initialData?.learning_objectives || ['Understand the key concepts', 'Apply knowledge to real-world scenarios'],
    content_structure:
      initialData?.content_structure ||
      ({
        sections: [],
        learning_path: [],
        prerequisites_checklist: [''],
        completion_criteria: ['']
      } as any),
    difficulty_level: initialData?.difficulty_level || 'beginner',
    estimated_duration_minutes: initialData?.estimated_duration_minutes || 30,
    prerequisites: initialData?.prerequisites || [''],
    multimedia_content: initialData?.multimedia_content || {
      videos: [''],
      images: [''],
      diagrams: [''],
      podcasts: [''],
      audio_lessons: [''],
      discussion_guides: [''],
      interactive_simulations: [''],
      hands_on_activities: [''],
      animations: [''],
      virtual_labs: [''],
      interactive_diagrams: ['']
    },
    interactive_elements: initialData?.interactive_elements || {
      drag_and_drop: false,
      visual_builder: false,
      simulation: false,
      audio_playback: false,
      discussion_forum: false,
      voice_recording: false,
      text_editor: false,
      note_taking: false,
      physical_activities: false,
      experiments: false,
      interactive_quizzes: false,
      progress_tracking: false,
      virtual_laboratory: false,
      gamification: false
    },
    assessment_questions: initialData?.assessment_questions || [],
    module_metadata: initialData?.module_metadata || {
      content_standards: [''],
      learning_competencies: [''],
      key_concepts: [''],
      vocabulary: [''],
      real_world_applications: [''],
      extension_activities: [''],
      assessment_rubrics: {},
      accessibility_features: [''],
      estimated_completion_time: 30,
      difficulty_indicators: ['']
    },
    is_published: initialData?.is_published || false,
    created_by: initialData?.created_by || 'teacher-001',
    created_at: initialData?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Class targeting fields
    target_class_id: initialData?.target_class_id || '',
    target_learning_styles: initialData?.target_learning_styles || [],
    // Prerequisite field
    ...(initialData as any)?.prerequisite_module_id && { prerequisite_module_id: (initialData as any).prerequisite_module_id }
  });

  // Update form data when initialData changes (for async loading in edit mode)
  useEffect(() => {
    if (initialData) {
      console.log('📝 Updating form with fresh initialData after save');
      console.log('🔄 Content structure sections:', initialData.content_structure?.sections?.length || 0);
      console.log('📋 Section titles:', initialData.content_structure?.sections?.map(s => s.title) || []);
      console.log('📊 Full initialData keys:', Object.keys(initialData));
      console.log('📄 Content structure keys:', Object.keys(initialData.content_structure || {}));
      
      setFormData(prev => ({
        ...prev,
        ...initialData,
        prerequisite_module_id: (initialData as any)?.prerequisite_module_id || null
      }));
    }
  }, [initialData]);

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const updateFormData = (updates: Partial<VARKModule>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const addArrayItem = (field: keyof VARKModule, item: string) => {
    const currentArray = formData[field] as string[];
    updateFormData({ [field]: [...(currentArray || []), item] });
  };

  const removeArrayItem = (field: keyof VARKModule, index: number) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.filter((_, i) => i !== index);
    updateFormData({ [field]: newArray });
  };

  const updateArrayItem = (
    field: keyof VARKModule,
    index: number,
    value: string
  ) => {
    const currentArray = formData[field] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    updateFormData({ [field]: newArray });
  };

  const addContentSection = (afterIndex?: number) => {
    const currentSections = formData.content_structure?.sections || [];
    
    const newSection: VARKModuleContentSection = {
      id: crypto.randomUUID(),
      title: '',
      content_type: 'text',
      content_data: {
        // ✅ Simple text field for CKEditor (stores HTML)
        text: ''
      },
      position: 0, // Will be set below
      is_required: true,
      time_estimate_minutes: 5,
      learning_style_tags: ['reading_writing'],
      interactive_elements: [],
      metadata: {
        key_points: ['']
      }
    };

    let updatedSections: VARKModuleContentSection[];
    
    if (afterIndex === undefined) {
      // Add at the end (default behavior)
      updatedSections = [...currentSections, newSection];
    } else if (afterIndex === -1) {
      // Add at the beginning
      updatedSections = [newSection, ...currentSections];
    } else {
      // Insert after the specified index
      updatedSections = [
        ...currentSections.slice(0, afterIndex + 1),
        newSection,
        ...currentSections.slice(afterIndex + 1)
      ];
    }
    
    // Update position numbers for all sections (deep clone to avoid shared references)
    updatedSections = updatedSections.map((section, index) => ({
      ...JSON.parse(JSON.stringify(section)),
      position: index + 1
    }));
    
    updateFormData({
      content_structure: {
        ...formData.content_structure,
        sections: updatedSections
      } as any
    });
  };

  const updateContentSection = (
    index: number,
    updates: Partial<VARKModuleContentSection>
  ) => {
    const updatedSections = [...(formData.content_structure?.sections || [])];
    // Deep clone the current section to avoid any shared references
    const currentSection = JSON.parse(JSON.stringify(updatedSections[index]));
    
    // Deep merge function to handle nested objects
    const deepMerge = (target: any, source: any): any => {
      const output = { ...target };
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          output[key] = deepMerge(target[key] || {}, source[key]);
        } else {
          output[key] = source[key];
        }
      }
      return output;
    };
    
    // Merge updates into the cloned section
    updatedSections[index] = deepMerge(currentSection, updates);
    
    updateFormData({
      content_structure: {
        ...formData.content_structure,
        sections: updatedSections
      } as any
    });
  };

  const removeContentSection = (index: number) => {
    const updatedSections =
      formData.content_structure?.sections?.filter((_, i) => i !== index) || [];
    updateFormData({
      content_structure: {
        ...formData.content_structure,
        sections: updatedSections
      } as any
    });
  };

  const handleSave = async () => {
    // Validation checks
    if (formData.content_structure?.sections?.length === 0) {
      alert('Please add at least one content section before saving.');
      return;
    }

    if (!formData.title || formData.title.trim() === '') {
      alert('Please enter a title for your module.');
      return;
    }

    if (!formData.description || formData.description.trim() === '') {
      alert('Please enter a description for your module.');
      return;
    }

    if (
      !formData.target_learning_styles ||
      formData.target_learning_styles.length === 0
    ) {
      alert(
        'Please select at least one target learning style for your module.'
      );
      return;
    }

    try {
      setIsSaving(true);
      console.log('🔄 VARK Module Builder: Starting save process...');
      console.log('📋 Form data:', {
        title: formData.title,
        target_learning_styles: formData.target_learning_styles,
        target_class_id: formData.target_class_id,
        sections_count: formData.content_structure?.sections?.length || 0
      });

      // Set a default category_id if none provided (for database compatibility)
      const moduleData = {
        ...formData,
        category_id: formData.category_id || 'default-category-id' // We'll handle this in the API
      };

      await onSave(moduleData as VARKModule);

      console.log('✅ VARK Module Builder: Save completed successfully');
    } catch (error) {
      console.error('❌ VARK Module Builder: Save failed:', error);
      // Error handling is done in the parent component
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Import JSON functionality
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.json')) {
      toast.error('Please select a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        // Remove export-only fields
        const { _exported_at, _note, ...cleanData } = importedData;

        // Validate required fields
        if (!cleanData.title) {
          toast.error('Invalid JSON: Missing title field');
          return;
        }

        // Merge imported data with form data
        setFormData(prev => ({
          ...prev,
          ...cleanData,
          // Generate new ID for imported module (will be creating new)
          id: crypto.randomUUID(),
        }));

        toast.success(`Module data imported successfully! You can now continue editing.`);
        console.log('📥 Imported module data:', cleanData);
        
        // Reset to step 1 so user can review and edit
        setCurrentStep(1);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        toast.error('Failed to parse JSON file. Please check the file format.');
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
    };

    reader.readAsText(file);
    
    // Reset input so same file can be imported again
    event.target.value = '';
  };

  const getPreviewSectionIndex = () => {
    const sections = formData.content_structure?.sections || [];

    if (sections.length === 0) {
      return 0; // No sections yet, show placeholder
    }

    // If we're on step 2 (Content Structure), show the first content section
    if (currentStep === 2) {
      return 0; // Show first content section
    }

    // For other steps, try to find a relevant section based on step
    switch (currentStep) {
      case 1: // Basic Info - show first section
        return 0;
      case 3: // Review - show first section
        return 0;
      default:
        return 0;
    }
  };

  const openPreview = () => {
    setActiveSectionIndex(getPreviewSectionIndex());
    setIsPreviewOpen(true);
  };

  const populateSampleData = () => {
    setSampleDataModal({
      isOpen: true,
      type: 'warning',
      sampleType: 'multi-style'
    });
  };

  const confirmPopulateSampleData = () => {
    // Populate form with sample data from the cell division module
    const populatedData = {
      id: crypto.randomUUID(),
      category_id: sampleCellDivisionModule.category_id,
      title: sampleCellDivisionModule.title,
      description: sampleCellDivisionModule.description,
      learning_objectives: sampleCellDivisionModule.learning_objectives,
      content_structure: sampleCellDivisionModule.content_structure,
      difficulty_level: sampleCellDivisionModule.difficulty_level,
      estimated_duration_minutes:
        sampleCellDivisionModule.estimated_duration_minutes,
      prerequisites: sampleCellDivisionModule.prerequisites,
      multimedia_content: sampleCellDivisionModule.multimedia_content,
      interactive_elements: sampleCellDivisionModule.interactive_elements,
      assessment_questions: sampleCellDivisionModule.assessment_questions,
      module_metadata: sampleCellDivisionModule.module_metadata,
      is_published: false, // Keep as draft for editing
      created_by: initialData?.created_by || 'teacher-001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Class targeting fields
      target_class_id: '',
      target_learning_styles: [
        'visual',
        'auditory',
        'reading_writing',
        'kinesthetic'
      ]
    };

    console.log('Populating sample data:', populatedData);
    console.log('Assessment questions:', populatedData.assessment_questions);

    setFormData(populatedData);

    // Show success message
    setSuccessModal({
      isOpen: true,
      message:
        'Sample data populated successfully! You can now navigate through all steps to see how the form looks with real content.'
    });

    // Close the confirmation modal
    setSampleDataModal({
      isOpen: false,
      type: 'warning',
      sampleType: 'multi-style'
    });
  };

  const populateReadingWritingModule = () => {
    setSampleDataModal({
      isOpen: true,
      type: 'warning',
      sampleType: 'reading-writing'
    });
  };

  const confirmPopulateReadingWritingModule = () => {
    // Populate form with reading/writing focused module data
    const populatedData = {
      id: crypto.randomUUID(),
      category_id: module1CellDivisionReadingWriting.category_id,
      title: module1CellDivisionReadingWriting.title,
      description: module1CellDivisionReadingWriting.description,
      learning_objectives:
        module1CellDivisionReadingWriting.learning_objectives,
      content_structure: module1CellDivisionReadingWriting.content_structure,
      difficulty_level: module1CellDivisionReadingWriting.difficulty_level,
      estimated_duration_minutes:
        module1CellDivisionReadingWriting.estimated_duration_minutes,
      prerequisites: module1CellDivisionReadingWriting.prerequisites,
      multimedia_content: module1CellDivisionReadingWriting.multimedia_content,
      interactive_elements:
        module1CellDivisionReadingWriting.interactive_elements,
      assessment_questions:
        module1CellDivisionReadingWriting.assessment_questions,
      module_metadata: module1CellDivisionReadingWriting.module_metadata,
      is_published: false, // Keep as draft for editing
      created_by: initialData?.created_by || 'teacher-001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Class targeting fields
      target_class_id: '',
      target_learning_styles: ['reading_writing']
    };

    console.log('Populating reading/writing module data:', populatedData);

    setFormData(populatedData);

    // Show success message
    setSuccessModal({
      isOpen: true,
      message:
        'Reading/Writing focused module data populated successfully! This module emphasizes text-based learning and written comprehension activities.'
    });

    // Close the confirmation modal
    setSampleDataModal({
      isOpen: false,
      type: 'warning',
      sampleType: 'reading-writing'
    });
  };

  const handleSampleDataConfirmation = () => {
    if (sampleDataModal.sampleType === 'reading-writing') {
      confirmPopulateReadingWritingModule();
    } else {
      confirmPopulateSampleData();
    }
  };

  const getPreviewModuleData = useCallback((): VARKModule => {
    // Ensure we have at least one content section for preview
    const contentStructure = formData.content_structure || {
      sections: [],
      learning_path: [],
      prerequisites_checklist: [''],
      completion_criteria: ['']
    };

    const sections =
      (contentStructure.sections?.length || 0) > 0
        ? contentStructure.sections
        : [
            {
              id: 'preview-section',
              title: 'Preview Section',
              content_type: 'text',
              content_data: {
                text: 'This is a preview section. Add content sections to see the full preview.'
              },
              position: 1,
              is_required: true,
              time_estimate_minutes: 5,
              learning_style_tags: ['visual'],
              interactive_elements: [],
              metadata: { key_points: ['Preview mode'] }
            }
          ];

    // Ensure assessment questions have proper structure to prevent RadioGroup issues
    const safeAssessmentQuestions = (formData.assessment_questions || []).map(
      q => ({
        id: q.id || crypto.randomUUID(),
        type: q.type || 'multiple_choice',
        question: q.question || 'Question text',
        options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: q.correct_answer || 'Option A',
        points: q.points || 1,
        max_duration: q.max_duration || null,
        interactive_config: q.interactive_config || null
      })
    );

    return {
      ...formData,
      id: formData.id || crypto.randomUUID(),
      content_structure: {
        sections,
        learning_path: contentStructure.learning_path || [],
        prerequisites_checklist: contentStructure.prerequisites_checklist || [
          ''
        ],
        completion_criteria: contentStructure.completion_criteria || ['']
      },
      // Ensure other required fields have defaults
      multimedia_content: formData.multimedia_content || {
        videos: [''],
        images: [''],
        diagrams: [''],
        podcasts: [''],
        audio_lessons: [''],
        discussion_guides: [''],
        interactive_simulations: [''],
        hands_on_activities: [''],
        animations: [''],
        virtual_labs: [''],
        interactive_diagrams: ['']
      },
      interactive_elements: formData.interactive_elements || {
        drag_and_drop: false,
        visual_builder: false,
        simulation: false,
        audio_playback: false,
        discussion_forum: false,
        voice_recording: false,
        text_editor: false,
        note_taking: false,
        physical_activities: false,
        experiments: false,
        interactive_quizzes: false,
        progress_tracking: false
      },
      assessment_questions: safeAssessmentQuestions
    } as VARKModule;
  }, [formData]);

  // Memoize preview module data to prevent unnecessary re-renders
  const previewModuleData = useMemo(() => {
    return getPreviewModuleData();
  }, [getPreviewModuleData]);

  // Memoize callback functions to prevent infinite loops
  const handleProgressUpdate = useCallback(
    (sectionId: string, completed: boolean) => {
      // In preview mode, we can track progress but not save it
      console.log(
        `Section ${sectionId} ${completed ? 'completed' : 'in progress'}`
      );
    },
    []
  );

  const handleSectionComplete = useCallback((sectionId: string) => {
    // In preview mode, we can track completion but not save it
    console.log(`Section ${sectionId} completed`);
  }, []);

  const currentStepConfig = stepConfig.find(
    config => config.step === currentStep
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full blur-3xl opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div className="p-3 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mb-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                  Create VARK Learning Module
                </h1>
                
                {/* Import JSON Button */}
                <div className="relative">
                  <input
                    type="file"
                    id="import-json"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                  <label htmlFor="import-json">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 cursor-pointer"
                      onClick={() => document.getElementById('import-json')?.click()}
                      asChild
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Import JSON
                      </div>
                    </Button>
                  </label>
                </div>
              </div>
              {/* <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Build an interactive, dynamic learning experience tailored to
                different learning styles. Create engaging content that adapts
                to visual, auditory, reading/writing, and kinesthetic learners.
              </p> */}
              {/*                <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
                 <div className="flex items-center space-x-2">
                   <Rocket className="w-4 h-4 text-teal-500" />
                   <span>AI-Powered Builder</span>
                 </div>
                 <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                 <div className="flex items-center space-x-2">
                   <CheckCircle className="w-4 h-4 text-emerald-500" />
                   <span>Multi-Format Support</span>
                 </div>
                 <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                 <div className="flex items-center space-x-2">
                   <Eye className="w-4 h-4 text-teal-600" />
                   <span>Live Preview</span>
                 </div>
               </div> */}
            </div>
          </div>
        </div>

        {/* Sample Data Info */}
        {/* <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-800">
                    Quick Start with Sample Data
                  </h3>
                  <p className="text-emerald-700">
                    Click "Populate Sample Data" above to see how all form
                    fields look with real content. This will populate all steps
                    with a complete Cell Division module example.
                  </p>
                  <div className="mt-3 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-800 font-medium">
                      💾 <strong>Database Integration:</strong> When you click
                      "Save Module" on the final step, your module will be saved
                      to the database and appear in the teacher's VARK modules
                      list where you can view, edit, update, and delete it.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={populateSampleData}
                size="sm"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                <Database className="w-4 h-4 mr-2" />
                Try Sample Data
              </Button>
            </div>
          </CardContent>
        </Card> */}

        {/* Enhanced Progress Bar */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Step Progress */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Progress
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      Step {currentStep} of {totalSteps}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">
                    Completion
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(progressPercentage)}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <Progress
                  value={progressPercentage}
                  className="h-3 bg-gray-100 rounded-full overflow-hidden"
                />
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>Getting Started</span>
                  <span>Almost Done</span>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="grid grid-cols-3 gap-4">
                {stepConfig.map(step => {
                  const isActive = step.step === currentStep;
                  const isCompleted = step.step < currentStep;
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.step}
                      className={`relative group cursor-pointer transition-all duration-300 ${
                        isActive ? 'scale-110' : 'hover:scale-105'
                      }`}
                      onClick={() => setCurrentStep(step.step)}>
                      <div
                        className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                          isActive
                            ? `bg-gradient-to-br ${step.color} border-transparent shadow-lg`
                            : isCompleted
                            ? 'bg-green-50 border-green-200 shadow-md'
                            : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}>
                        <div
                          className={`flex flex-col items-center space-y-2 ${
                            isActive
                              ? 'text-white'
                              : isCompleted
                              ? 'text-green-700'
                              : 'text-gray-600'
                          }`}>
                          <div
                            className={`p-2 rounded-lg ${
                              isActive
                                ? 'bg-white/20'
                                : isCompleted
                                ? 'bg-green-100'
                                : 'bg-gray-100'
                            }`}>
                            <Icon
                              className={`w-5 h-5 ${
                                isActive
                                  ? 'text-white'
                                  : isCompleted
                                  ? 'text-green-600'
                                  : 'text-gray-500'
                              }`}
                            />
                          </div>
                          <div className="text-center">
                            <p
                              className={`text-xs font-semibold ${
                                isActive
                                  ? 'text-white'
                                  : isCompleted
                                  ? 'text-green-800'
                                  : 'text-gray-700'
                              }`}>
                              {step.title}
                            </p>
                            <p
                              className={`text-xs ${
                                isActive
                                  ? 'text-white/80'
                                  : isCompleted
                                  ? 'text-green-600'
                                  : 'text-gray-500'
                              }`}>
                              {step.description}
                            </p>
                          </div>
                        </div>

                        {/* Completion Check */}
                        {isCompleted && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Step Content */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-2xl bg-gradient-to-br ${
                    currentStepConfig?.color || 'from-gray-500 to-gray-600'
                  }`}>
                  {currentStepConfig?.icon &&
                    React.createElement(currentStepConfig.icon, {
                      className: 'w-8 h-8 text-white'
                    })}
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {currentStepConfig?.title}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {currentStepConfig?.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Sample Data Buttons */}
                <div className="flex items-center space-x-2">
                  {/* <Button
                    variant="outline"
                    onClick={populateSampleData}
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-200 shadow-md hover:shadow-lg">
                    <Database className="w-4 h-4 mr-2" />
                    Multi-Style Sample
                  </Button> */}

                  <Button
                    variant="outline"
                    onClick={populateReadingWritingModule}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 shadow-md hover:shadow-lg">
                    <PenTool className="w-4 h-4 mr-2" />
                    Reading/Writing Sample
                  </Button>
                </div>

                {/* Preview Button */}
                <Button
                  variant="outline"
                  onClick={openPreview}
                  className="border-teal-300 text-teal-700 hover:bg-teal-50 hover:border-teal-400 transition-all duration-200 shadow-md hover:shadow-lg">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Module
                  {formData.content_structure?.sections &&
                    formData.content_structure.sections.length > 0 && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {formData.content_structure.sections.length} sections
                      </Badge>
                    )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {currentStep === 1 && (
              <BasicInfoStep
                formData={formData}
                updateFormData={updateFormData}
                categories={categories}
                teacherClasses={teacherClasses}
                availableModules={availableModules}
              />
            )}

            {currentStep === 2 && (
              <ContentStructureStep
                formData={formData}
                updateFormData={updateFormData}
                addContentSection={addContentSection}
                updateContentSection={updateContentSection}
                removeContentSection={removeContentSection}
              />
            )}

            {currentStep === 3 && (
              <ReviewStep formData={formData} onSave={handleSave} />
            )}
          </CardContent>
        </Card>

        {/* Enhanced Navigation */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-6 py-3 border-2 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Previous</span>
              </Button>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200">
                  Cancel
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                    <span>Next Step</span>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{initialData?.id ? 'Updating Module...' : 'Creating Module...'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{initialData?.id ? 'Update Module' : 'Create Module'}</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced VARK Module Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 border-b border-teal-100">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-3xl font-bold flex items-center space-x-3 text-gray-900">
                <div className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span>Module Preview</span>
                  <p className="text-lg font-normal text-gray-600 mt-1">
                    See exactly how your module will appear to students
                  </p>
                </div>
              </DialogTitle>

              {/* Section Selector */}
              {previewModuleData?.content_structure?.sections &&
                previewModuleData.content_structure.sections.length > 1 && (
                  <div className="flex items-center space-x-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Preview Section:
                    </Label>
                    <Select
                      value={activeSectionIndex.toString()}
                      onValueChange={value =>
                        setActiveSectionIndex(parseInt(value))
                      }>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {previewModuleData.content_structure.sections.map(
                          (section, index) => (
                            <SelectItem
                              key={section.id}
                              value={index.toString()}>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">
                                  {section.title || `Section ${index + 1}`}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {section.content_type}
                                </Badge>
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[70vh] pr-2 p-6">
            {/* Section Preview Indicator */}
            {previewModuleData?.content_structure?.sections &&
              previewModuleData.content_structure.sections.length > 1 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <Eye className="w-4 h-4" />
                    <span>
                      Previewing:{' '}
                      <strong>
                        {previewModuleData.content_structure.sections[
                          activeSectionIndex
                        ]?.title || `Section ${activeSectionIndex + 1}`}
                      </strong>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {previewModuleData.content_structure.sections[
                          activeSectionIndex
                        ]?.content_type || 'content'}
                      </Badge>
                    </span>
                  </div>
                </div>
              )}

            {previewModuleData ? (
              <DynamicModuleViewer
                key={previewModuleData.id}
                module={previewModuleData}
                onProgressUpdate={handleProgressUpdate}
                onSectionComplete={handleSectionComplete}
                previewMode={true}
                activeSectionIndex={activeSectionIndex} // Show the active section being edited
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-teal-600" />
                </div>
                <p className="text-gray-500 text-lg">Loading preview...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sample Data Confirmation Modal */}
      <ConfirmationModal
        isOpen={sampleDataModal.isOpen}
        onClose={() =>
          setSampleDataModal({
            isOpen: false,
            type: 'warning',
            sampleType: 'multi-style'
          })
        }
        onConfirm={handleSampleDataConfirmation}
        title={
          sampleDataModal.sampleType === 'reading-writing'
            ? 'Populate Reading/Writing Module'
            : 'Populate Sample Data'
        }
        description={
          sampleDataModal.sampleType === 'reading-writing'
            ? 'This will populate all form fields with a reading/writing focused Cell Division module. This module emphasizes text-based learning and written comprehension activities. Any existing data will be replaced. Continue?'
            : 'This will populate all form fields with sample data from a comprehensive Cell Division module with multiple learning styles. Any existing data will be replaced. Continue?'
        }
        confirmText={
          sampleDataModal.sampleType === 'reading-writing'
            ? 'Yes, Populate Reading/Writing Module'
            : 'Yes, Populate Data'
        }
        cancelText="Cancel"
        type="warning"
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        onConfirm={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Success!"
        description={successModal.message}
        confirmText="OK"
        cancelText=""
        type="success"
      />
    </div>
  );
}
