-- Check and Populate VARK Module Categories
-- Run this in your Supabase SQL Editor

-- Step 1: Check if the table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'vark_module_categories'
    ) THEN 'Table exists'
    ELSE 'Table does not exist'
  END as table_status;

-- Step 2: If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.vark_module_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100) NOT NULL,
  grade_level VARCHAR(100) NOT NULL,
  learning_style VARCHAR(50) NOT NULL,
  icon_name VARCHAR(100),
  color_scheme VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Check current data
SELECT 'Current categories count:' as info, COUNT(*) as count FROM public.vark_module_categories;

-- Step 4: Insert the Biology category that the sample module expects
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
  '11111111-1111-1111-1111-111111111111'::uuid,
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

-- Step 5: Insert additional categories for different subjects and learning styles
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

-- Step 6: Verify the data was inserted
SELECT 'Categories after insertion:' as info;
SELECT 
  id,
  name,
  subject,
  grade_level,
  learning_style,
  is_active
FROM public.vark_module_categories 
ORDER BY subject, learning_style;

-- Step 7: Show the specific Biology category
SELECT 'Biology category ID for sample module:' as info;
SELECT 
  id,
  name,
  subject,
  grade_level,
  learning_style
FROM public.vark_module_categories 
WHERE name = 'Biology & Life Sciences';

-- Step 8: Final count
SELECT 'Total categories:' as info, COUNT(*) as count FROM public.vark_module_categories;
