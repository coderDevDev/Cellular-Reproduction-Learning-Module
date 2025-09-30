-- Insert sample data for testing the student dashboard
-- This script creates sample lessons, quizzes, activities, and progress data

-- Insert sample lessons
INSERT INTO public.lessons (id, title, content_url, subject, grade_level, vark_tag, resource_type, is_published, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Introduction to Mathematics', 'https://example.com/math-intro', 'Mathematics', '7', 'visual', 'video', true, '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440002', 'Basic Algebra', 'https://example.com/basic-algebra', 'Mathematics', '7', 'kinesthetic', 'interactive', true, '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440003', 'Science Fundamentals', 'https://example.com/science-fundamentals', 'Science', '7', 'auditory', 'podcast', true, '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440004', 'Reading Comprehension', 'https://example.com/reading-comp', 'English', '7', 'reading_writing', 'document', true, '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440005', 'Creative Writing', 'https://example.com/creative-writing', 'English', '7', 'reading_writing', 'document', true, '550e8400-e29b-41d4-a716-446655440010');

-- Insert sample quizzes
INSERT INTO public.quizzes (id, title, description, type, is_published, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Math Pre-Test', 'Assessment of basic math knowledge', 'pre', true, '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440012', 'Math Post-Test', 'Assessment after math lessons', 'post', true, '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440013', 'Science Quiz', 'General science knowledge test', 'pre', true, '550e8400-e29b-41d4-a716-446655440010');

-- Insert sample quiz questions
INSERT INTO public.quiz_questions (id, quiz_id, question, question_type, options, correct_answer, points, position) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 'What is 2 + 2?', 'multiple_choice', '["3", "4", "5", "6"]', '4', 1, 1),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440011', 'What is 5 x 5?', 'multiple_choice', '["20", "25", "30", "35"]', '25', 1, 2),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440012', 'What is 10 - 3?', 'multiple_choice', '["5", "6", "7", "8"]', '7', 1, 1);

-- Insert sample activities
INSERT INTO public.activities (id, title, description, rubric_url, deadline, grading_mode, is_published, assigned_by) VALUES
('550e8400-e29b-41d4-a716-446655440031', 'Math Problem Set', 'Complete 10 algebra problems', 'https://example.com/rubric1', '2024-12-31 23:59:59+00', 'points', true, '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440032', 'Science Report', 'Write a report on photosynthesis', 'https://example.com/rubric2', '2024-12-25 23:59:59+00', 'rubric', true, '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440033', 'Creative Essay', 'Write a 500-word creative story', 'https://example.com/rubric3', '2024-12-28 23:59:59+00', 'rubric', true, '550e8400-e29b-41d4-a716-446655440010');

-- Insert sample lesson progress for a student (assuming student ID exists)
-- Note: Replace 'STUDENT_USER_ID' with an actual student user ID from your auth.users table
INSERT INTO public.lesson_progress (id, student_id, lesson_id, status, progress_percentage, time_spent_minutes, last_accessed_at) VALUES
('550e8400-e29b-41d4-a716-446655440041', 'STUDENT_USER_ID', '550e8400-e29b-41d4-a716-446655440001', 'completed', 100, 45, '2024-12-20 10:00:00+00'),
('550e8400-e29b-41d4-a716-446655440042', 'STUDENT_USER_ID', '550e8400-e29b-41d4-a716-446655440002', 'in_progress', 60, 30, '2024-12-21 14:30:00+00'),
('550e8400-e29b-41d4-a716-446655440043', 'STUDENT_USER_ID', '550e8400-e29b-41d4-a716-446655440003', 'not_started', 0, 0, '2024-12-21 15:00:00+00'),
('550e8400-e29b-41d4-a716-446655440044', 'STUDENT_USER_ID', '550e8400-e29b-41d4-a716-446655440004', 'completed', 100, 40, '2024-12-19 16:00:00+00'),
('550e8400-e29b-41d4-a716-446655440045', 'STUDENT_USER_ID', '550e8400-e29b-41d4-a716-446655440005', 'not_started', 0, 0, '2024-12-21 15:00:00+00');

-- Insert sample quiz results for a student
INSERT INTO public.quiz_results (id, quiz_id, student_id, score, total_points, responses, attempt_number, submitted_at) VALUES
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440011', 'STUDENT_USER_ID', 8, 10, '{"1": "4", "2": "25"}', 1, '2024-12-18 11:00:00+00'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440012', 'STUDENT_USER_ID', 9, 10, '{"1": "7"}', 1, '2024-12-20 13:00:00+00'),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440013', 'STUDENT_USER_ID', 7, 10, '{"1": "A", "2": "B", "3": "C"}', 1, '2024-12-19 15:00:00+00');

-- Insert sample activity submissions for a student
INSERT INTO public.submissions (id, activity_id, student_id, file_url, submitted_at, score, feedback, graded_at, graded_by) VALUES
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440031', 'STUDENT_USER_ID', 'https://example.com/submission1.pdf', '2024-12-20 16:00:00+00', 85, 'Good work on most problems, review problem 7', '2024-12-21 09:00:00+00', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440032', 'STUDENT_USER_ID', 'https://example.com/submission2.pdf', '2024-12-22 14:00:00+00', 92, 'Excellent research and presentation', '2024-12-23 10:00:00+00', '550e8400-e29b-41d4-a716-446655440010');

-- Insert quiz assignments for the student
INSERT INTO public.quiz_assignees (quiz_id, student_id, assigned_at) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'STUDENT_USER_ID', '2024-12-17 09:00:00+00'),
('550e8400-e29b-41d4-a716-446655440012', 'STUDENT_USER_ID', '2024-12-19 09:00:00+00'),
('550e8400-e29b-41d4-a716-446655440013', 'STUDENT_USER_ID', '2024-12-16 09:00:00+00');

-- Insert activity assignments for the student
INSERT INTO public.activity_assignees (activity_id, student_id, assigned_at) VALUES
('550e8400-e29b-41d4-a716-446655440031', 'STUDENT_USER_ID', '2024-12-17 09:00:00+00'),
('550e8400-e29b-41d4-a716-446655440032', 'STUDENT_USER_ID', '2024-12-18 09:00:00+00'),
('550e8400-e29b-41d4-a716-446655440033', 'STUDENT_USER_ID', '2024-12-19 09:00:00+00');

-- Note: Before running this script, you need to:
-- 1. Replace 'STUDENT_USER_ID' with an actual student user ID from your auth.users table
-- 2. Replace '550e8400-e29b-41d4-a716-446655440010' with an actual teacher user ID
-- 3. Ensure the profiles table has the corresponding user records

-- To find a student user ID, run:
-- SELECT id, email, role FROM auth.users WHERE role = 'student' LIMIT 1;

-- To find a teacher user ID, run:
-- SELECT id, email, role FROM auth.users WHERE role = 'teacher' LIMIT 1;
