const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function insertSampleData() {
  try {
    console.log('🔍 Finding users...');

    // Find a student user
    const { data: students, error: studentError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('role', 'student')
      .limit(1);

    if (studentError || !students || students.length === 0) {
      console.error(
        '❌ No student users found. Please create a student account first.'
      );
      return;
    }

    // Find a teacher user
    const { data: teachers, error: teacherError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('role', 'teacher')
      .limit(1);

    if (teacherError || !teachers || teachers.length === 0) {
      console.error(
        '❌ No teacher users found. Please create a teacher account first.'
      );
      return;
    }

    const studentId = students[0].id;
    const teacherId = teachers[0].id;

    console.log(`👨‍🎓 Student: ${students[0].email} (${studentId})`);
    console.log(`👨‍🏫 Teacher: ${teachers[0].email} (${teacherId})`);

    // Insert sample lessons
    console.log('\n📚 Inserting sample lessons...');
    const lessons = [
      {
        title: 'Introduction to Mathematics',
        content_url: 'https://example.com/math-intro',
        subject: 'Mathematics',
        grade_level: '7',
        vark_tag: 'visual',
        resource_type: 'video',
        is_published: true,
        created_by: teacherId
      },
      {
        title: 'Basic Algebra',
        content_url: 'https://example.com/basic-algebra',
        subject: 'Mathematics',
        grade_level: '7',
        vark_tag: 'kinesthetic',
        resource_type: 'interactive',
        is_published: true,
        created_by: teacherId
      },
      {
        title: 'Science Fundamentals',
        content_url: 'https://example.com/science-fundamentals',
        subject: 'Science',
        grade_level: '7',
        vark_tag: 'auditory',
        resource_type: 'podcast',
        is_published: true,
        created_by: teacherId
      },
      {
        title: 'Reading Comprehension',
        content_url: 'https://example.com/reading-comp',
        subject: 'English',
        grade_level: '7',
        vark_tag: 'reading_writing',
        resource_type: 'document',
        is_published: true,
        created_by: teacherId
      },
      {
        title: 'Creative Writing',
        content_url: 'https://example.com/creative-writing',
        subject: 'English',
        grade_level: '7',
        vark_tag: 'reading_writing',
        resource_type: 'document',
        is_published: true,
        created_by: teacherId
      }
    ];

    const { data: insertedLessons, error: lessonError } = await supabase
      .from('lessons')
      .insert(lessons)
      .select('id, title');

    if (lessonError) {
      console.error('❌ Error inserting lessons:', lessonError);
      return;
    }

    console.log(`✅ Inserted ${insertedLessons.length} lessons`);

    // Insert sample quizzes
    console.log('\n📝 Inserting sample quizzes...');
    const quizzes = [
      {
        title: 'Math Pre-Test',
        description: 'Assessment of basic math knowledge',
        type: 'pre',
        is_published: true,
        created_by: teacherId
      },
      {
        title: 'Math Post-Test',
        description: 'Assessment after math lessons',
        type: 'post',
        is_published: true,
        created_by: teacherId
      },
      {
        title: 'Science Quiz',
        description: 'General science knowledge test',
        type: 'pre',
        is_published: true,
        created_by: teacherId
      }
    ];

    const { data: insertedQuizzes, error: quizError } = await supabase
      .from('quizzes')
      .insert(quizzes)
      .select('id, title');

    if (quizError) {
      console.error('❌ Error inserting quizzes:', quizError);
      return;
    }

    console.log(`✅ Inserted ${insertedQuizzes.length} quizzes`);

    // Insert sample activities
    console.log('\n📋 Inserting sample activities...');
    const activities = [
      {
        title: 'Math Problem Set',
        description: 'Complete 10 algebra problems',
        rubric_url: 'https://example.com/rubric1',
        deadline: new Date('2024-12-31T23:59:59Z').toISOString(),
        grading_mode: 'points',
        is_published: true,
        assigned_by: teacherId
      },
      {
        title: 'Science Report',
        description: 'Write a report on photosynthesis',
        rubric_url: 'https://example.com/rubric2',
        deadline: new Date('2024-12-25T23:59:59Z').toISOString(),
        grading_mode: 'rubric',
        is_published: true,
        assigned_by: teacherId
      },
      {
        title: 'Creative Essay',
        description: 'Write a 500-word creative story',
        rubric_url: 'https://example.com/rubric3',
        deadline: new Date('2024-12-28T23:59:59Z').toISOString(),
        grading_mode: 'rubric',
        is_published: true,
        assigned_by: teacherId
      }
    ];

    const { data: insertedActivities, error: activityError } = await supabase
      .from('activities')
      .insert(activities)
      .select('id, title');

    if (activityError) {
      console.error('❌ Error inserting activities:', activityError);
      return;
    }

    console.log(`✅ Inserted ${insertedActivities.length} activities`);

    // Insert lesson progress
    console.log('\n📊 Inserting lesson progress...');
    const lessonProgress = [
      {
        student_id: studentId,
        lesson_id: insertedLessons[0].id,
        status: 'completed',
        progress_percentage: 100,
        time_spent_minutes: 45,
        last_accessed_at: new Date('2024-12-20T10:00:00Z').toISOString()
      },
      {
        student_id: studentId,
        lesson_id: insertedLessons[1].id,
        status: 'in_progress',
        progress_percentage: 60,
        time_spent_minutes: 30,
        last_accessed_at: new Date('2024-12-21T14:30:00Z').toISOString()
      },
      {
        student_id: studentId,
        lesson_id: insertedLessons[2].id,
        status: 'not_started',
        progress_percentage: 0,
        time_spent_minutes: 0,
        last_accessed_at: new Date('2024-12-21T15:00:00Z').toISOString()
      },
      {
        student_id: studentId,
        lesson_id: insertedLessons[3].id,
        status: 'completed',
        progress_percentage: 100,
        time_spent_minutes: 40,
        last_accessed_at: new Date('2024-12-19T16:00:00Z').toISOString()
      },
      {
        student_id: studentId,
        lesson_id: insertedLessons[4].id,
        status: 'not_started',
        progress_percentage: 0,
        time_spent_minutes: 0,
        last_accessed_at: new Date('2024-12-21T15:00:00Z').toISOString()
      }
    ];

    const { data: insertedProgress, error: progressError } = await supabase
      .from('lesson_progress')
      .insert(lessonProgress)
      .select('id, status');

    if (progressError) {
      console.error('❌ Error inserting lesson progress:', progressError);
      return;
    }

    console.log(
      `✅ Inserted ${insertedProgress.length} lesson progress records`
    );

    // Insert quiz results
    console.log('\n📈 Inserting quiz results...');
    const quizResults = [
      {
        quiz_id: insertedQuizzes[0].id,
        student_id: studentId,
        score: 8,
        total_points: 10,
        responses: { 1: '4', 2: '25' },
        attempt_number: 1,
        submitted_at: new Date('2024-12-18T11:00:00Z').toISOString()
      },
      {
        quiz_id: insertedQuizzes[1].id,
        student_id: studentId,
        score: 9,
        total_points: 10,
        responses: { 1: '7' },
        attempt_number: 1,
        submitted_at: new Date('2024-12-20T13:00:00Z').toISOString()
      },
      {
        quiz_id: insertedQuizzes[2].id,
        student_id: studentId,
        score: 7,
        total_points: 10,
        responses: { 1: 'A', 2: 'B', 3: 'C' },
        attempt_number: 1,
        submitted_at: new Date('2024-12-19T15:00:00Z').toISOString()
      }
    ];

    const { data: insertedQuizResults, error: quizResultError } = await supabase
      .from('quiz_results')
      .insert(quizResults)
      .select('id, score');

    if (quizResultError) {
      console.error('❌ Error inserting quiz results:', quizResultError);
      return;
    }

    console.log(`✅ Inserted ${insertedQuizResults.length} quiz results`);

    // Insert activity submissions
    console.log('\n📤 Inserting activity submissions...');
    const submissions = [
      {
        activity_id: insertedActivities[0].id,
        student_id: studentId,
        file_url: 'https://example.com/submission1.pdf',
        submitted_at: new Date('2024-12-20T16:00:00Z').toISOString(),
        score: 85,
        feedback: 'Good work on most problems, review problem 7',
        graded_at: new Date('2024-12-21T09:00:00Z').toISOString(),
        graded_by: teacherId
      },
      {
        activity_id: insertedActivities[1].id,
        student_id: studentId,
        file_url: 'https://example.com/submission2.pdf',
        submitted_at: new Date('2024-12-22T14:00:00Z').toISOString(),
        score: 92,
        feedback: 'Excellent research and presentation',
        graded_at: new Date('2024-12-23T10:00:00Z').toISOString(),
        graded_by: teacherId
      }
    ];

    const { data: insertedSubmissions, error: submissionError } = await supabase
      .from('submissions')
      .insert(submissions)
      .select('id, score');

    if (submissionError) {
      console.error('❌ Error inserting submissions:', submissionError);
      return;
    }

    console.log(`✅ Inserted ${insertedSubmissions.length} submissions`);

    // Insert assignments
    console.log('\n📋 Inserting assignments...');

    // Quiz assignments
    const quizAssignments = insertedQuizzes.map(quiz => ({
      quiz_id: quiz.id,
      student_id: studentId,
      assigned_at: new Date().toISOString()
    }));

    const { data: insertedQuizAssignments, error: quizAssignmentError } =
      await supabase
        .from('quiz_assignees')
        .insert(quizAssignments)
        .select('quiz_id');

    if (quizAssignmentError) {
      console.error(
        '❌ Error inserting quiz assignments:',
        quizAssignmentError
      );
      return;
    }

    // Activity assignments
    const activityAssignments = insertedActivities.map(activity => ({
      activity_id: activity.id,
      student_id: studentId,
      assigned_at: new Date().toISOString()
    }));

    const {
      data: insertedActivityAssignments,
      error: activityAssignmentError
    } = await supabase
      .from('activity_assignees')
      .insert(activityAssignments)
      .select('activity_id');

    if (activityAssignmentError) {
      console.error(
        '❌ Error inserting activity assignments:',
        activityAssignmentError
      );
      return;
    }

    console.log(
      `✅ Inserted ${insertedQuizAssignments.length} quiz assignments`
    );
    console.log(
      `✅ Inserted ${insertedActivityAssignments.length} activity assignments`
    );

    console.log('\n🎉 Sample data insertion completed successfully!');
    console.log('\n📊 Dashboard should now show:');
    console.log(
      `   • ${
        insertedProgress.filter(p => p.status === 'completed').length
      } completed lessons`
    );
    console.log(`   • ${insertedProgress.length} total lessons`);
    console.log(`   • Quiz average: ${Math.round(((8 + 9 + 7) / 3) * 10)}%`);
    console.log(`   • ${insertedSubmissions.length} submitted activities`);
    console.log(`   • ${insertedActivities.length} total activities`);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
insertSampleData();
