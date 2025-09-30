-- Populate VARK Module Categories
-- This script inserts the necessary category data for VARK modules

-- First, let's check if the table exists and has data
SELECT COUNT(*) as existing_categories FROM public.vark_module_categories;

-- Insert the Biology category that the sample module expects
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
  'biology-science-001'::uuid, -- Convert string to UUID
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
    gen_random_uuid(),
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
    gen_random_uuid(),
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
    gen_random_uuid(),
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
    gen_random_uuid(),
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
    gen_random_uuid(),
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
    gen_random_uuid(),
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
    gen_random_uuid(),
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
    gen_random_uuid(),
    'Science - Interactive Labs',
    'Science through hands-on experiments, simulations, and physical activities',
    'Science',
    'High School',
    'kinesthetic',
    'zap',
    'from-orange-500 to-orange-600',
    true
  ),
  (
    gen_random_uuid(),
    'English - Visual Literature',
    'Literature and language through visual storytelling, graphic novels, and visual aids',
    'English',
    'High School',
    'visual',
    'book-open',
    'from-blue-500 to-blue-600',
    true
  ),
  (
    gen_random_uuid(),
    'English - Auditory Learning',
    'Language learning through audio books, discussions, and verbal communication',
    'English',
    'High School',
    'auditory',
    'headphones',
    'from-green-500 to-green-600',
    true
  ),
  (
    gen_random_uuid(),
    'English - Reading/Writing',
    'Language arts through traditional reading, writing, and text analysis',
    'English',
    'High School',
    'reading_writing',
    'pen-tool',
    'from-purple-500 to-purple-600',
    true
  ),
  (
    gen_random_uuid(),
    'English - Interactive Drama',
    'Language learning through role-playing, drama activities, and interactive storytelling',
    'English',
    'High School',
    'kinesthetic',
    'zap',
    'from-orange-500 to-orange-600',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
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
  id,
  name,
  subject,
  grade_level,
  learning_style
FROM public.vark_module_categories 
WHERE name = 'Biology & Life Sciences';

-- Count total categories
SELECT COUNT(*) as total_categories FROM public.vark_module_categories;
