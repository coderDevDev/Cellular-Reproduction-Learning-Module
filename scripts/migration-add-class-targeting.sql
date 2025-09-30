-- Migration: Add Class Targeting Fields to VARK Modules
-- This script adds the missing columns for class targeting functionality

-- Add target_class_id column (UUID, nullable, references classes table)
ALTER TABLE public.vark_modules 
ADD COLUMN IF NOT EXISTS target_class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL;

-- Add target_learning_styles column (JSONB array of learning styles)
ALTER TABLE public.vark_modules 
ADD COLUMN IF NOT EXISTS target_learning_styles JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.vark_modules.target_class_id IS 'Reference to the target class for this module (optional)';
COMMENT ON COLUMN public.vark_modules.target_learning_styles IS 'Array of learning styles this module targets (visual, auditory, reading_writing, kinesthetic)';

-- Update existing rows to have empty arrays for target_learning_styles
UPDATE public.vark_modules 
SET target_learning_styles = '[]'::jsonb 
WHERE target_learning_styles IS NULL;

-- Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vark_modules' 
AND column_name IN ('target_class_id', 'target_learning_styles')
ORDER BY column_name;

-- Show sample data structure
SELECT 
    id,
    title,
    target_class_id,
    target_learning_styles
FROM public.vark_modules 
LIMIT 5;
