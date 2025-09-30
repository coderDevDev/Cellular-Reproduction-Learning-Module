-- Manual Migration: Add Class Targeting Fields
-- Run this directly in your Supabase SQL Editor

-- Add target_class_id column
ALTER TABLE public.vark_modules 
ADD COLUMN IF NOT EXISTS target_class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL;

-- Add target_learning_styles column
ALTER TABLE public.vark_modules 
ADD COLUMN IF NOT EXISTS target_learning_styles JSONB DEFAULT '[]'::jsonb;

-- Update existing rows
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





