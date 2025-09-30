-- Teacher Sample Data Insertion Script
-- This script creates sample data for testing the teacher dashboard
-- Run this after creating teacher and student accounts

-- Note: Replace TEACHER_USER_ID and STUDENT_USER_IDs with actual UUIDs from your profiles table
-- You can find these by running: SELECT id, email, role FROM profiles WHERE role IN ('teacher', 'student');

-- 1. Create sample classes
INSERT INTO public.classes (name, description, subject, grade_level, created_by) VALUES
('Mathematics 101', 'Introduction to basic mathematics concepts', 'Mathematics', 'Grade 7', 'TEACHER_USER_ID'),
('Science Fundamentals', 'Basic science principles and experiments', 'Science', 'Grade 7', 'TEACHER_USER_ID'),
('English Literature', 'Reading and writing skills development', 'English', 'Grade 7', 'TEACHER_USER_ID');

-- 2. Enroll students in classes (replace STUDENT_USER_IDs with actual UUIDs)
INSERT INTO public.class_students (class_id, student_id) VALUES
-- Mathematics 101 students
((SELECT id FROM public.classes WHERE name = 'Mathematics 101' LIMIT 1), 'STUDENT_USER_ID_1'),
((SELECT id FROM public.classes WHERE name = 'Mathematics 101' LIMIT 1), 'STUDENT_USER_ID_2'),

-- Science Fundamentals students
((SELECT id FROM public.classes WHERE name = 'Science Fundamentals' LIMIT 1), 'STUDENT_USER_ID_2'),
((SELECT id FROM public.classes WHERE name = 'Science Fundamentals' LIMIT 1), 'STUDENT_USER_ID_3'),

-- English Literature students
((SELECT id FROM public.classes WHERE name = 'English Literature' LIMIT 1), 'STUDENT_USER_ID_1'),
((SELECT id FROM public.classes WHERE name = 'English Literature' LIMIT 1), 'STUDENT_USER_ID_4');

-- 3. Create sample lessons
INSERT INTO public.lessons (title, content_url, subject, grade_level, vark_tag, resource_type, is_published, created_by) VALUES
('Introduction to Algebra', 'https://example.com/algebra-intro.pdf', 'Mathematics', 'Grade 7', 'visual', 'document', true, 'TEACHER_USER_ID'),
('Basic Chemical Reactions', 'https://example.com/chemical-reactions.mp4', 'Science', 'Grade 7', 'kinesthetic', 'video', true, 'TEACHER_USER_ID'),
('Reading Comprehension Strategies', 'https://example.com/reading-strategies.pdf', 'English', 'Grade 7', 'reading_writing', 'document', true, 'TEACHER_USER_ID'),
('Geometry Basics', 'https://example.com/geometry-basics.pdf', 'Mathematics', 'Grade 7', 'visual', 'document', false, 'TEACHER_USER_ID');

-- 4. Create sample quizzes
INSERT INTO public.quizzes (title, description, type, is_published, created_by) VALUES
('Algebra Pre-Test', 'Assessment of basic algebra knowledge', 'pre', true, 'TEACHER_USER_ID'),
('Algebra Post-Test', 'Assessment after algebra lessons', 'type', 'post', true, 'TEACHER_USER_ID'),
('Science Quiz 1', 'Chemical reactions and basic principles', 'post', true, 'TEACHER_USER_ID');

-- 5. Create quiz questions
INSERT INTO public.quiz_questions (quiz_id, question, question_type, options, correct_answer, points, position) VALUES
-- Algebra Pre-Test questions
((SELECT id FROM public.quizzes WHERE title = 'Algebra Pre-Test' LIMIT 1), 'What is the value of x in 2x + 5 = 11?', 'multiple_choice', '["2", "3", "4", "5"]', '3', 1, 1),
((SELECT id FROM public.quizzes WHERE title = 'Algebra Pre-Test' LIMIT 1), 'Simplify: 3x + 2x + 5', 'multiple_choice', '["5x + 5", "6x + 5", "5x + 2", "6x + 2"]', '5x + 5', 1, 2),

-- Algebra Post-Test questions
((SELECT id FROM public.quizzes WHERE title = 'Algebra Post-Test' LIMIT 1), 'What is the value of x in 2x + 5 = 11?', 'multiple_choice', '["2", "3", "4", "5"]', '3', 1, 1),
((SELECT id FROM public.quizzes WHERE title = 'Algebra Post-Test' LIMIT 1), 'Simplify: 3x + 2x + 5', 'multiple_choice', '["5x + 5", "6x + 5", "5x + 2", "6x + 2"]', '5x + 5', 1, 2),

-- Science Quiz questions
((SELECT id FROM public.quizzes WHERE title = 'Science Quiz 1' LIMIT 1), 'What is a chemical reaction?', 'multiple_choice', '["A change in physical state", "A process that forms new substances", "A change in temperature", "A change in color"]', 'A process that forms new substances', 1, 1);

-- 6. Assign quizzes to students
INSERT INTO public.quiz_assignees (quiz_id, student_id) VALUES
-- Algebra Pre-Test assignments
((SELECT id FROM public.quizzes WHERE title = 'Algebra Pre-Test' LIMIT 1), 'STUDENT_USER_ID_1'),
((SELECT id FROM public.quizzes WHERE title = 'Algebra Pre-Test' LIMIT 1), 'STUDENT_USER_ID_2'),
((SELECT id FROM public.quizzes WHERE title = 'Algebra Pre-Test' LIMIT 1), 'STUDENT_USER_ID_3'),
((SELECT id FROM public.quizzes WHERE title = 'Algebra Pre-Test' LIMIT 1), 'STUDENT_USER_ID_4'),

-- Algebra Post-Test assignments
((SELECT id FROM public.quizzes WHERE title = 'Algebra Post-Test' LIMIT 1), 'STUDENT_USER_ID_1'),
((SELECT id FROM public.quizzes WHERE title = 'Algebra Post-Test' LIMIT 1), 'STUDENT_USER_ID_2'),
((SELECT id FROM public.quizzes WHERE title = 'Algebra Post-Test' LIMIT 1), 'STUDENT_USER_ID_3'),
((SELECT id FROM public.quizzes WHERE title = 'Algebra Post-Test' LIMIT 1), 'STUDENT_USER_ID_4'),

-- Science Quiz assignments
((SELECT id FROM public.quizzes WHERE title = 'Science Quiz 1' LIMIT 1), 'STUDENT_USER_ID_1'),
((SELECT id FROM public.quizzes WHERE title = 'Science Quiz 1' LIMIT 1), 'STUDENT_USER_ID_2'),
((SELECT id FROM public.quizzes WHERE title = 'Science Quiz 1' LIMIT 1), 'STUDENT_USER_ID_3'),
((SELECT id FROM public.quizzes WHERE title = 'Science Quiz 1' LIMIT 1), 'STUDENT_USER_ID_4');

-- 7. Create sample activities
INSERT INTO public.activities (title, description, rubric_url, deadline, grading_mode, is_published, assigned_by) VALUES
('Algebra Problem Set', 'Complete the assigned algebra problems', 'https://example.com/algebra-rubric.pdf', (NOW() + INTERVAL '7 days'), 'points', true, 'TEACHER_USER_ID'),
('Science Experiment Report', 'Write a report on the chemical reaction experiment', 'https://example.com/science-rubric.pdf', (NOW() + INTERVAL '5 days'), 'rubric', true, 'TEACHER_USER_ID');

-- 8. Assign activities to students
INSERT INTO public.activity_assignees (activity_id, student_id) VALUES
-- Algebra Problem Set assignments
((SELECT id FROM public.activities WHERE title = 'Algebra Problem Set' LIMIT 1), 'STUDENT_USER_ID_1'),
((SELECT id FROM public.activities WHERE title = 'Algebra Problem Set' LIMIT 1), 'STUDENT_USER_ID_2'),
((SELECT id FROM public.activities WHERE title = 'Algebra Problem Set' LIMIT 1), 'STUDENT_USER_ID_3'),
((SELECT id FROM public.activities WHERE title = 'Algebra Problem Set' LIMIT 1), 'STUDENT_USER_ID_4'),

-- Science Experiment Report assignments
((SELECT id FROM public.activities WHERE title = 'Science Experiment Report' LIMIT 1), 'STUDENT_USER_ID_1'),
((SELECT id FROM public.activities WHERE title = 'Science Experiment Report' LIMIT 1), 'STUDENT_USER_ID_2'),
((SELECT id FROM public.activities WHERE title = 'Science Experiment Report' LIMIT 1), 'STUDENT_USER_ID_3'),
((SELECT id FROM public.activities WHERE title = 'Science Experiment Report' LIMIT 1), 'STUDENT_USER_ID_4');

-- 9. Create some quiz results
INSERT INTO public.quiz_results (quiz_id, student_id, score, total_points, responses, attempt_number) VALUES
-- Algebra Pre-Test results
((SELECT id FROM public.quizzes WHERE title = 'Algebra Pre-Test' LIMIT 1), 'STUDENT_USER_ID_1', 85, 100, '{"q1": "3", "q2": "5x + 5"}', 1),
((SELECT id FROM public.quizzes WHERE title = 'Algebra Pre-Test' LIMIT 1), 'STUDENT_USER_ID_2', 92, 100, '{"q1": "3", "q2": "5x + 5"}', 1),
((SELECT id FROM public.quizzes WHERE title = 'Algebra Pre-Test' LIMIT 1), 'STUDENT_USER_ID_3', 78, 100, '{"q1": "4", "q2": "5x + 5"}', 1),
((SELECT id FROM public.quizzes WHERE title = 'Algebra Pre-Test' LIMIT 1), 'STUDENT_USER_ID_4', 95, 100, '{"q1": "3", "q2": "5x + 5"}', 1),

-- Algebra Post-Test results
((SELECT id FROM public.quizzes WHERE title = 'Algebra Post-Test' LIMIT 1), 'STUDENT_USER_ID_1', 90, 100, '{"q1": "3", "q2": "5x + 5"}', 1),
((SELECT id FROM public.quizzes WHERE title = 'Algebra Post-Test' LIMIT 1), 'STUDENT_USER_ID_2', 96, 100, '{"q1": "3", "q2": "5x + 5"}', 1),
((SELECT id FROM public.quizzes WHERE title = 'Algebra Post-Test' LIMIT 1), 'STUDENT_USER_ID_3', 88, 100, '{"q1": "3", "q2": "5x + 5"}', 1),
((SELECT id FROM public.quizzes WHERE title = 'Algebra Post-Test' LIMIT 1), 'STUDENT_USER_ID_4', 94, 100, '{"q1": "3", "q2": "5x + 5"}', 1),

-- Science Quiz results
((SELECT id FROM public.quizzes WHERE title = 'Science Quiz 1' LIMIT 1), 'STUDENT_USER_ID_1', 88, 100, '{"q1": "A process that forms new substances"}', 1),
((SELECT id FROM public.quizzes WHERE title = 'Science Quiz 1' LIMIT 1), 'STUDENT_USER_ID_2', 92, 100, '{"q1": "A process that forms new substances"}', 1),
((SELECT id FROM public.quizzes WHERE title = 'Science Quiz 1' LIMIT 1), 'STUDENT_USER_ID_3', 85, 100, '{"q1": "A process that forms new substances"}', 1),
((SELECT id FROM public.quizzes WHERE title = 'Science Quiz 1' LIMIT 1), 'STUDENT_USER_ID_4', 90, 100, '{"q1": "A process that forms new substances"}', 1);

-- 10. Create some activity submissions
INSERT INTO public.submissions (activity_id, student_id, file_url, submitted_at, score, feedback, graded_at, graded_by) VALUES
-- Algebra Problem Set submissions (some graded, some pending)
((SELECT id FROM public.activities WHERE title = 'Algebra Problem Set' LIMIT 1), 'STUDENT_USER_ID_1', 'https://example.com/submission-algebra-1.pdf', (NOW() - INTERVAL '1 day'), 88, 'Good work! Keep it up.', NOW(), 'TEACHER_USER_ID'),
((SELECT id FROM public.activities WHERE title = 'Algebra Problem Set' LIMIT 1), 'STUDENT_USER_ID_2', 'https://example.com/submission-algebra-2.pdf', (NOW() - INTERVAL '2 days'), NULL, NULL, NULL, NULL),
((SELECT id FROM public.activities WHERE title = 'Algebra Problem Set' LIMIT 1), 'STUDENT_USER_ID_3', 'https://example.com/submission-algebra-3.pdf', (NOW() - INTERVAL '3 days'), 92, 'Excellent work!', NOW(), 'TEACHER_USER_ID'),
((SELECT id FROM public.activities WHERE title = 'Algebra Problem Set' LIMIT 1), 'STUDENT_USER_ID_4', 'https://example.com/submission-algebra-4.pdf', (NOW() - INTERVAL '4 days'), NULL, NULL, NULL, NULL),

-- Science Experiment Report submissions
((SELECT id FROM public.activities WHERE title = 'Science Experiment Report' LIMIT 1), 'STUDENT_USER_ID_1', 'https://example.com/submission-science-1.pdf', (NOW() - INTERVAL '1 day'), 85, 'Good effort, but could improve analysis.', NOW(), 'TEACHER_USER_ID'),
((SELECT id FROM public.activities WHERE title = 'Science Experiment Report' LIMIT 1), 'STUDENT_USER_ID_2', 'https://example.com/submission-science-2.pdf', (NOW() - INTERVAL '2 days'), 90, 'Well done! Clear and thorough.', NOW(), 'TEACHER_USER_ID'),
((SELECT id FROM public.activities WHERE title = 'Science Experiment Report' LIMIT 1), 'STUDENT_USER_ID_3', 'https://example.com/submission-science-3.pdf', (NOW() - INTERVAL '3 days'), NULL, NULL, NULL, NULL),
((SELECT id FROM public.activities WHERE title = 'Science Experiment Report' LIMIT 1), 'STUDENT_USER_ID_4', 'https://example.com/submission-science-4.pdf', (NOW() - INTERVAL '4 days'), 87, 'Good work, keep improving.', NOW(), 'TEACHER_USER_ID');

-- Success message
SELECT 'Teacher sample data insertion completed successfully!' as message;
SELECT 
  'Dashboard should now show:' as info,
  (SELECT COUNT(*) FROM public.class_students cs JOIN public.classes c ON cs.class_id = c.id WHERE c.created_by = 'TEACHER_USER_ID') as total_students,
  (SELECT COUNT(*) FROM public.lessons WHERE created_by = 'TEACHER_USER_ID' AND is_published = true) as active_lessons,
  (SELECT COUNT(*) FROM public.quizzes WHERE created_by = 'TEACHER_USER_ID') as quizzes_created,
  (SELECT COUNT(*) FROM public.submissions s JOIN public.activities a ON s.activity_id = a.id WHERE a.assigned_by = 'TEACHER_USER_ID' AND s.score IS NULL) as pending_grades;






