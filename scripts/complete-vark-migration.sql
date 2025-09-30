-- Complete VARK Modules Migration Script
-- This script handles both schema updates and data population
-- Run this in your Supabase SQL Editor

-- ===========================================
-- STEP 1: Add Missing Columns to Tables
-- ===========================================

-- Add missing columns to vark_modules table
ALTER TABLE public.vark_modules 
ADD COLUMN IF NOT EXISTS module_metadata JSONB DEFAULT '{}';

-- Add missing columns to vark_module_sections table
ALTER TABLE public.vark_module_sections 
ADD COLUMN IF NOT EXISTS learning_style_tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS interactive_elements JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update content_type check constraint to include new types
ALTER TABLE public.vark_module_sections 
DROP CONSTRAINT IF EXISTS vark_module_sections_content_type_check;

ALTER TABLE public.vark_module_sections 
ADD CONSTRAINT vark_module_sections_content_type_check 
CHECK (content_type IN ('text', 'video', 'audio', 'interactive', 'activity', 'assessment', 'quick_check', 'highlight', 'table', 'diagram'));

-- ===========================================
-- STEP 2: Create Custom Types
-- ===========================================

-- Create custom types if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'progress_status') THEN
        CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'learning_style') THEN
        CREATE TYPE learning_style AS ENUM ('visual', 'auditory', 'reading_writing', 'kinesthetic');
    END IF;
END $$;

-- ===========================================
-- STEP 3: Populate VARK Module Categories
-- ===========================================

-- First, let's check if the table exists and has data
SELECT 'Checking existing categories...' as status;
SELECT COUNT(*) as existing_categories FROM public.vark_module_categories;

-- Insert the Biology category that the sample module expects
-- Note: We'll use a specific UUID that matches the sample data
INSERT INTO public.vark_module_categories (
  id,
  name, 
  description, 
  subject, 
  grade_level, 
  learning_style, 
  icon_name, 
  color_scheme,
  is_active
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid, -- Use a specific UUID for consistency
  'Biology & Life Sciences',
  'Explore the fascinating world of living organisms, from cells to ecosystems',
  'Biology',
  'High School',
  'visual',
  'microscope',
  'from-green-500 to-emerald-600',
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  subject = EXCLUDED.subject,
  grade_level = EXCLUDED.grade_level,
  learning_style = EXCLUDED.learning_style,
  icon_name = EXCLUDED.icon_name,
  color_scheme = EXCLUDED.color_scheme,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Insert additional categories for different subjects and learning styles
INSERT INTO public.vark_module_categories (
  id,
  name, 
  description, 
  subject, 
  grade_level, 
  learning_style, 
  icon_name, 
  color_scheme,
  is_active
) VALUES 
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Mathematics - Visual Learning',
    'Mathematics concepts through visual representations, diagrams, and charts',
    'Mathematics',
    'High School',
    'visual',
    'calculator',
    'from-blue-500 to-blue-600',
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Mathematics - Auditory Learning',
    'Mathematics learning through audio explanations, discussions, and verbal problem-solving',
    'Mathematics',
    'High School',
    'auditory',
    'headphones',
    'from-green-500 to-green-600',
    true
  ),
  (
    '44444444-4444-4444-4444-444444444444'::uuid,
    'Mathematics - Reading/Writing',
    'Mathematics through text-based explanations, formulas, and written problem-solving',
    'Mathematics',
    'High School',
    'reading_writing',
    'book',
    'from-purple-500 to-purple-600',
    true
  ),
  (
    '55555555-5555-5555-5555-555555555555'::uuid,
    'Mathematics - Kinesthetic',
    'Mathematics through interactive simulations, manipulatives, and real-world applications',
    'Mathematics',
    'High School',
    'kinesthetic',
    'zap',
    'from-orange-500 to-orange-600',
    true
  ),
  (
    '66666666-6666-6666-6666-666666666666'::uuid,
    'Science - Visual Discovery',
    'Scientific concepts through visual models, diagrams, and interactive visualizations',
    'Science',
    'High School',
    'visual',
    'flask',
    'from-blue-500 to-blue-600',
    true
  ),
  (
    '77777777-7777-7777-7777-777777777777'::uuid,
    'Science - Auditory Learning',
    'Science through audio explanations, discussions, and verbal concept exploration',
    'Science',
    'High School',
    'auditory',
    'headphones',
    'from-green-500 to-green-600',
    true
  ),
  (
    '88888888-8888-8888-8888-888888888888'::uuid,
    'Science - Reading/Writing',
    'Science through text-based explanations, research papers, and written analysis',
    'Science',
    'High School',
    'reading_writing',
    'book-open',
    'from-purple-500 to-purple-600',
    true
  ),
  (
    '99999999-9999-9999-9999-999999999999'::uuid,
    'Science - Interactive Labs',
    'Science through hands-on experiments, simulations, and physical activities',
    'Science',
    'High School',
    'kinesthetic',
    'zap',
    'from-orange-500 to-orange-600',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- STEP 4: Update Existing Records
-- ===========================================

-- Update existing records to have default values
UPDATE public.vark_modules 
SET module_metadata = '{}' 
WHERE module_metadata IS NULL;

UPDATE public.vark_module_sections 
SET learning_style_tags = '[]', 
    interactive_elements = '[]', 
    metadata = '{}' 
WHERE learning_style_tags IS NULL 
   OR interactive_elements IS NULL 
   OR metadata IS NULL;

-- ===========================================
-- STEP 5: Add Documentation Comments
-- ===========================================

-- Add comments for documentation
COMMENT ON COLUMN public.vark_modules.module_metadata IS 'Additional metadata like content standards, competencies, key concepts, vocabulary, real-world applications, extension activities, assessment rubrics, accessibility features, estimated completion time, and difficulty indicators';
COMMENT ON COLUMN public.vark_module_sections.learning_style_tags IS 'Array of learning style tags (visual, auditory, reading_writing, kinesthetic)';
COMMENT ON COLUMN public.vark_module_sections.interactive_elements IS 'Array of interactive element types for this section';
COMMENT ON COLUMN public.vark_module_sections.metadata IS 'Additional metadata like difficulty, key points, visual aids, audio clips';

-- ===========================================
-- STEP 6: Verification
-- ===========================================

-- Verify the migration worked
SELECT 'Migration completed! Verifying results...' as status;

-- Check columns exist
SELECT 
    'vark_modules' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vark_modules' 
  AND column_name IN ('module_metadata')
ORDER BY column_name;

SELECT 
    'vark_module_sections' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vark_module_sections' 
  AND column_name IN ('learning_style_tags', 'interactive_elements', 'metadata')
ORDER BY column_name;

-- Verify categories were inserted
SELECT 
  id,
  name,
  subject,
  grade_level,
  learning_style,
  is_active
FROM public.vark_module_categories 
ORDER BY subject, learning_style;

-- Show the specific Biology category
SELECT 
  'Biology category ID for sample module:' as info,
  id,
  name,
  subject,
  grade_level,
  learning_style
FROM public.vark_module_categories 
WHERE name = 'Biology & Life Sciences';

-- Count total categories
SELECT COUNT(*) as total_categories FROM public.vark_module_categories;

-- ===========================================
-- STEP 7: Next Steps
-- ===========================================

SELECT 'Migration completed successfully!' as status;
SELECT 'Next steps:' as info;
SELECT '1. Update your sample data to use the Biology category ID shown above' as step;
SELECT '2. Try creating a VARK module again' as step;
SELECT '3. The module_metadata column error should be resolved' as step;





