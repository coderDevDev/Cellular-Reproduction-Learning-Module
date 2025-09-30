-- Migration Script: Add Missing Columns to VARK Modules Tables
-- This script adds the missing columns that the TypeScript types expect
-- Run this script on your existing database to update the schema

-- Step 1: Add missing columns to vark_modules table
ALTER TABLE public.vark_modules 
ADD COLUMN IF NOT EXISTS module_metadata JSONB DEFAULT '{}';

-- Step 2: Add missing columns to vark_module_sections table
ALTER TABLE public.vark_module_sections 
ADD COLUMN IF NOT EXISTS learning_style_tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS interactive_elements JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Step 3: Update content_type check constraint to include new types
ALTER TABLE public.vark_module_sections 
DROP CONSTRAINT IF EXISTS vark_module_sections_content_type_check;

ALTER TABLE public.vark_module_sections 
ADD CONSTRAINT vark_module_sections_content_type_check 
CHECK (content_type IN ('text', 'video', 'audio', 'interactive', 'activity', 'assessment', 'quick_check', 'highlight', 'table', 'diagram'));

-- Step 4: Create custom types if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'progress_status') THEN
        CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'learning_style') THEN
        CREATE TYPE learning_style AS ENUM ('visual', 'auditory', 'reading_writing', 'kinesthetic');
    END IF;
END $$;

-- Step 5: Update existing records to have default values
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

-- Step 6: Add comments for documentation
COMMENT ON COLUMN public.vark_modules.module_metadata IS 'Additional metadata like content standards, competencies, key concepts, vocabulary, real-world applications, extension activities, assessment rubrics, accessibility features, estimated completion time, and difficulty indicators';
COMMENT ON COLUMN public.vark_module_sections.learning_style_tags IS 'Array of learning style tags (visual, auditory, reading_writing, kinesthetic)';
COMMENT ON COLUMN public.vark_module_sections.interactive_elements IS 'Array of interactive element types for this section';
COMMENT ON COLUMN public.vark_module_sections.metadata IS 'Additional metadata like difficulty, key points, visual aids, audio clips';

-- Step 7: Verify the migration
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

-- Migration completed successfully!
-- You can now save VARK modules with all the required fields.
