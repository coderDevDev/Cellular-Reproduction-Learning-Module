    -- VARK Modules Database Schema
    -- This schema extends the existing Cellular Reproduction Learning Module with VARK-specific content

    -- Create custom types
    CREATE TYPE IF NOT EXISTS progress_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused');
    CREATE TYPE IF NOT EXISTS learning_style AS ENUM ('visual', 'auditory', 'reading_writing', 'kinesthetic');

    -- VARK Module Categories (e.g., Math, Science, English for each learning style)
    CREATE TABLE IF NOT EXISTS public.vark_module_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      subject TEXT NOT NULL,
      grade_level TEXT NOT NULL,
      learning_style TEXT NOT NULL,
      icon_name TEXT,
      color_scheme TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- VARK Modules (individual learning units within categories)
    CREATE TABLE IF NOT EXISTS public.vark_modules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category_id UUID NOT NULL REFERENCES public.vark_module_categories(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      learning_objectives JSONB, -- Array of learning objectives
      content_structure JSONB, -- Structured content with sections, activities, etc.
      difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
      estimated_duration_minutes INTEGER,
      prerequisites JSONB, -- Array of prerequisite module IDs
      multimedia_content JSONB, -- URLs for videos, images, audio, interactive elements
      interactive_elements JSONB, -- Drag & drop, simulations, etc.
      assessment_questions JSONB, -- Built-in assessment questions
      module_metadata JSONB, -- Additional metadata like content standards, competencies, etc.
      is_published BOOLEAN DEFAULT FALSE,
      created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- VARK Module Content Sections (detailed content breakdown)
    CREATE TABLE IF NOT EXISTS public.vark_module_sections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      module_id UUID NOT NULL REFERENCES public.vark_modules(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content_type TEXT NOT NULL CHECK (content_type IN ('text', 'video', 'audio', 'interactive', 'activity', 'assessment', 'quick_check', 'highlight', 'table', 'diagram')),
      content_data JSONB NOT NULL, -- Flexible content storage
      position INTEGER DEFAULT 1,
      is_required BOOLEAN DEFAULT TRUE,
      time_estimate_minutes INTEGER,
      learning_style_tags JSONB, -- Array of learning style tags
      interactive_elements JSONB, -- Array of interactive element types
      metadata JSONB, -- Additional metadata like difficulty, key points, etc.
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- VARK Module Progress (student progress tracking)
    CREATE TABLE IF NOT EXISTS public.vark_module_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      module_id UUID NOT NULL REFERENCES public.vark_modules(id) ON DELETE CASCADE,
      status progress_status DEFAULT 'not_started',
      progress_percentage INTEGER DEFAULT 0,
      current_section_id UUID REFERENCES public.vark_module_sections(id),
      time_spent_minutes INTEGER DEFAULT 0,
      completed_sections JSONB, -- Array of completed section IDs
      assessment_scores JSONB, -- Scores for built-in assessments
      started_at TIMESTAMP WITH TIME ZONE,
      completed_at TIMESTAMP WITH TIME ZONE,
      last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(student_id, module_id)
    );

    -- VARK Module Assignments (teacher assigns modules to students/classes)
    CREATE TABLE IF NOT EXISTS public.vark_module_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      module_id UUID NOT NULL REFERENCES public.vark_modules(id) ON DELETE CASCADE,
      assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      assigned_to_type TEXT NOT NULL CHECK (assigned_to_type IN ('student', 'class')),
      assigned_to_id UUID NOT NULL, -- Either student_id or class_id
      due_date TIMESTAMP WITH TIME ZONE,
      is_required BOOLEAN DEFAULT TRUE,
      assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- VARK Learning Paths (curated sequences of modules)
    CREATE TABLE IF NOT EXISTS public.vark_learning_paths (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      subject TEXT NOT NULL,
      grade_level TEXT NOT NULL,
      learning_style learning_style NOT NULL,
      module_sequence JSONB NOT NULL, -- Array of module IDs in order
      total_duration_hours INTEGER,
      difficulty_progression TEXT CHECK (difficulty_progression IN ('linear', 'adaptive', 'branching')),
      is_published BOOLEAN DEFAULT FALSE,
      created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- VARK Module Feedback (student feedback and ratings)
    CREATE TABLE IF NOT EXISTS public.vark_module_feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      module_id UUID NOT NULL REFERENCES public.vark_modules(id) ON DELETE CASCADE,
      student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      feedback_text TEXT,
      difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
      engagement_rating INTEGER CHECK (engagement_rating >= 1 AND engagement_rating <= 5),
      submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(student_id, module_id)
    );

    -- Enable Row Level Security
    ALTER TABLE public.vark_module_categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.vark_modules ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.vark_module_sections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.vark_module_progress ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.vark_module_assignments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.vark_learning_paths ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.vark_module_feedback ENABLE ROW LEVEL SECURITY;

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_vark_modules_category_id ON public.vark_modules(category_id);
    CREATE INDEX IF NOT EXISTS idx_vark_modules_learning_style ON public.vark_modules(learning_style);
    CREATE INDEX IF NOT EXISTS idx_vark_module_progress_student_module ON public.vark_module_progress(student_id, module_id);
    CREATE INDEX IF NOT EXISTS idx_vark_module_assignments_assigned_to ON public.vark_module_assignments(assigned_to_type, assigned_to_id);

    -- Insert sample VARK module categories
    INSERT INTO public.vark_module_categories (name, description, subject, grade_level, learning_style, icon_name, color_scheme) VALUES
    ('Visual Math Foundations', 'Mathematics concepts through visual representations, diagrams, and charts', 'Mathematics', 'Grade 7', 'visual', 'Eye', 'blue'),
    ('Auditory Math Concepts', 'Mathematics learning through audio explanations, discussions, and verbal problem-solving', 'Mathematics', 'Grade 7', 'auditory', 'Headphones', 'green'),
    ('Reading Math Fundamentals', 'Mathematics through text-based explanations, formulas, and written problem-solving', 'Mathematics', 'Grade 7', 'reading_writing', 'PenTool', 'purple'),
    ('Hands-on Math Activities', 'Mathematics through interactive simulations, manipulatives, and real-world applications', 'Mathematics', 'Grade 7', 'kinesthetic', 'Zap', 'orange'),
    ('Visual Science Discovery', 'Scientific concepts through visual models, diagrams, and interactive visualizations', 'Science', 'Grade 7', 'visual', 'Eye', 'blue'),
    ('Auditory Science Learning', 'Science through audio explanations, discussions, and verbal concept exploration', 'Science', 'Grade 7', 'auditory', 'Headphones', 'green'),
    ('Reading Science Concepts', 'Science through text-based explanations, research papers, and written analysis', 'Science', 'Grade 7', 'reading_writing', 'PenTool', 'purple'),
    ('Interactive Science Labs', 'Science through hands-on experiments, simulations, and physical activities', 'Science', 'Grade 7', 'kinesthetic', 'Zap', 'orange');

    -- Insert sample VARK modules
    INSERT INTO public.vark_modules (category_id, title, description, learning_objectives, content_structure, difficulty_level, estimated_duration_minutes, multimedia_content, interactive_elements, assessment_questions, is_published, created_by) VALUES
    (
      (SELECT id FROM public.vark_module_categories WHERE name = 'Visual Math Foundations' LIMIT 1),
      'Introduction to Algebraic Expressions',
      'Learn algebraic expressions through visual representations, diagrams, and interactive visualizations',
      '["Understand what algebraic expressions are", "Identify variables and constants", "Create visual representations of expressions", "Solve simple algebraic problems visually"]',
      '{"sections": ["Overview", "Visual Examples", "Interactive Practice", "Assessment"]}',
      'beginner',
      45,
      '{"videos": ["https://example.com/algebra-intro.mp4"], "images": ["https://example.com/algebra-diagrams.png"], "diagrams": ["https://example.com/expression-flowchart.svg"]}',
      '{"drag_and_drop": true, "visual_builder": true, "simulation": false}',
      '{"questions": [{"type": "multiple_choice", "question": "Which of the following is an algebraic expression?", "options": ["2 + 3", "x + 5", "5 = 5", "Hello"], "correct": 1}]}',
      true,
      (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)
    ),
    (
      (SELECT id FROM public.vark_module_categories WHERE name = 'Auditory Math Concepts' LIMIT 1),
      'Algebraic Expressions Through Discussion',
      'Master algebraic expressions through audio explanations, group discussions, and verbal problem-solving',
      '["Listen to clear explanations of algebraic concepts", "Participate in group discussions", "Explain solutions verbally", "Understand through audio examples"]',
      '{"sections": ["Audio Introduction", "Group Discussion", "Verbal Problem Solving", "Audio Assessment"]}',
      'beginner',
      50,
      '{"podcasts": ["https://example.com/algebra-podcast.mp3"], "audio_lessons": ["https://example.com/algebra-audio.mp3"], "discussion_guides": ["https://example.com/discussion-guide.pdf"]}',
      '{"audio_playback": true, "discussion_forum": true, "voice_recording": true}',
      '{"questions": [{"type": "audio_response", "question": "Explain in your own words what an algebraic expression is", "max_duration": 60}]}',
      true,
      (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)
    );

    -- Create updated_at trigger function if it doesn't exist
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Add updated_at triggers to all VARK tables
    CREATE TRIGGER handle_vark_module_categories_updated_at
      BEFORE UPDATE ON public.vark_module_categories
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

    CREATE TRIGGER handle_vark_modules_updated_at
      BEFORE UPDATE ON public.vark_modules
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

    CREATE TRIGGER handle_vark_module_sections_updated_at
      BEFORE UPDATE ON public.vark_module_sections
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

    CREATE TRIGGER handle_vark_module_progress_updated_at
      BEFORE UPDATE ON public.vark_module_progress
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

    CREATE TRIGGER handle_vark_module_assignments_updated_at
      BEFORE UPDATE ON public.vark_module_assignments
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

    CREATE TRIGGER handle_vark_learning_paths_updated_at
      BEFORE UPDATE ON public.vark_learning_paths
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

    CREATE TRIGGER handle_vark_module_feedback_updated_at
      BEFORE UPDATE ON public.vark_module_feedback
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
