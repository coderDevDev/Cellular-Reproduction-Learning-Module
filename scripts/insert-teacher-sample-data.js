const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function insertTeacherSampleData() {
  try {
    console.log('🔍 Finding teacher and students...');

    // Find a teacher
    const { data: teachers, error: teacherError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('role', 'teacher')
      .limit(1);

    if (teacherError || !teachers || teachers.length === 0) {
      console.error(
        '❌ No teacher found. Please create a teacher account first.'
      );
      return;
    }

    // Find some students
    const { data: students, error: studentError } = await supabase
      .from('profiles')
      .select('id, email, role, learning_style')
      .eq('role', 'student')
      .limit(5);

    if (studentError || !students || students.length === 0) {
      console.error(
        '❌ No students found. Please create student accounts first.'
      );
      return;
    }

    const teacherId = teachers[0].id;
    const studentIds = students.map(s => s.id);

    console.log(`👨‍🏫 Teacher: ${teachers[0].email} (${teacherId})`);
    console.log(`👨‍🎓 Students: ${students.length} found`);

    // 1. Create sample classes
    console.log('\n📚 Creating sample classes...');
    const classes = [
      {
        name: 'Mathematics 101',
        description: 'Introduction to basic mathematics concepts',
        subject: 'Mathematics',
        grade_level: 'Grade 7',
        created_by: teacherId
      },
      {
        name: 'Science Fundamentals',
        description: 'Basic science principles and experiments',
        subject: 'Science',
        grade_level: 'Grade 7',
        created_by: teacherId
      },
      {
        name: 'English Literature',
        description: 'Reading and writing skills development',
        subject: 'English',
        grade_level: 'Grade 7',
        created_by: teacherId
      }
    ];

    const { data: createdClasses, error: classesError } = await supabase
      .from('classes')
      .insert(classes)
      .select('id, name');

    if (classesError) {
      console.error('❌ Error creating classes:', classesError);
      return;
    }

    console.log(`✅ Created ${createdClasses.length} classes`);

    // 2. Enroll students in classes
    console.log('\n👥 Enrolling students in classes...');
    const enrollments = [];
    createdClasses.forEach((cls, classIndex) => {
      // Enroll 2-3 students per class
      const studentsForClass = studentIds.slice(
        classIndex * 2,
        (classIndex + 1) * 2
      );
      studentsForClass.forEach(studentId => {
        enrollments.push({
          class_id: cls.id,
          student_id: studentId
        });
      });
    });

    const { error: enrollmentError } = await supabase
      .from('class_students')
      .insert(enrollments);

    if (enrollmentError) {
      console.error('❌ Error enrolling students:', enrollmentError);
      return;
    }

    console.log(`✅ Enrolled students in classes`);

    // 3. Create sample lessons
    console.log('\n📖 Creating sample lessons...');
    const lessons = [
      {
        title: 'Introduction to Algebra',
        content_url: 'https://example.com/algebra-intro.pdf',
        subject: 'Mathematics',
        grade_level: 'Grade 7',
        vark_tag: 'visual',
        resource_type: 'document',
        is_published: true,
        created_by: teacherId
      },
      {
        title: 'Basic Chemical Reactions',
        content_url: 'https://example.com/chemical-reactions.mp4',
        subject: 'Science',
        grade_level: 'Grade 7',
        vark_tag: 'kinesthetic',
        resource_type: 'video',
        is_published: true,
        created_by: teacherId
      },
      {
        title: 'Reading Comprehension Strategies',
        content_url: 'https://example.com/reading-strategies.pdf',
        subject: 'English',
        grade_level: 'Grade 7',
        vark_tag: 'reading_writing',
        resource_type: 'document',
        is_published: true,
        created_by: teacherId
      },
      {
        title: 'Geometry Basics',
        content_url: 'https://example.com/geometry-basics.pdf',
        subject: 'Mathematics',
        grade_level: 'Grade 7',
        vark_tag: 'visual',
        resource_type: 'document',
        is_published: false,
        created_by: teacherId
      }
    ];

    const { data: createdLessons, error: lessonsError } = await supabase
      .from('lessons')
      .insert(lessons)
      .select('id, title');

    if (lessonsError) {
      console.error('❌ Error creating lessons:', lessonsError);
      return;
    }

    console.log(`✅ Created ${createdLessons.length} lessons`);

    // 4. Create sample quizzes
    console.log('\n📝 Creating sample quizzes...');
    const quizzes = [
      {
        title: 'Algebra Pre-Test',
        description: 'Assessment of basic algebra knowledge',
        type: 'pre',
        is_published: true,
        created_by: teacherId
      },
      {
        title: 'Algebra Post-Test',
        description: 'Assessment after algebra lessons',
        type: 'post',
        is_published: true,
        created_by: teacherId
      },
      {
        title: 'Science Quiz 1',
        description: 'Chemical reactions and basic principles',
        type: 'post',
        is_published: true,
        created_by: teacherId
      }
    ];

    const { data: createdQuizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .insert(quizzes)
      .select('id, title');

    if (quizzesError) {
      console.error('❌ Error creating quizzes:', quizzesError);
      return;
    }

    console.log(`✅ Created ${createdQuizzes.length} quizzes`);

    // 5. Create quiz questions
    console.log('\n❓ Creating quiz questions...');
    const quizQuestions = [];

    // Algebra Pre-Test questions
    createdQuizzes.forEach((quiz, quizIndex) => {
      if (quiz.title.includes('Algebra')) {
        const questions = [
          {
            quiz_id: quiz.id,
            question: 'What is the value of x in 2x + 5 = 11?',
            question_type: 'multiple_choice',
            options: ['2', '3', '4', '5'],
            correct_answer: '3',
            points: 1,
            position: 1
          },
          {
            quiz_id: quiz.id,
            question: 'Simplify: 3x + 2x + 5',
            question_type: 'multiple_choice',
            options: ['5x + 5', '6x + 5', '5x + 2', '6x + 2'],
            correct_answer: '5x + 5',
            points: 1,
            position: 2
          }
        ];
        quizQuestions.push(...questions);
      } else if (quiz.title.includes('Science')) {
        const questions = [
          {
            quiz_id: quiz.id,
            question: 'What is a chemical reaction?',
            question_type: 'multiple_choice',
            options: [
              'A change in physical state',
              'A process that forms new substances',
              'A change in temperature',
              'A change in color'
            ],
            correct_answer: 'A process that forms new substances',
            points: 1,
            position: 1
          }
        ];
        quizQuestions.push(...questions);
      }
    });

    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(quizQuestions);

    if (questionsError) {
      console.error('❌ Error creating quiz questions:', questionsError);
      return;
    }

    console.log(`✅ Created ${quizQuestions.length} quiz questions`);

    // 6. Assign quizzes to students
    console.log('\n📋 Assigning quizzes to students...');
    const quizAssignments = [];
    createdQuizzes.forEach(quiz => {
      studentIds.forEach(studentId => {
        quizAssignments.push({
          quiz_id: quiz.id,
          student_id: studentId
        });
      });
    });

    const { error: quizAssignmentError } = await supabase
      .from('quiz_assignees')
      .insert(quizAssignments);

    if (quizAssignmentError) {
      console.error('❌ Error assigning quizzes:', quizAssignmentError);
      return;
    }

    console.log(`✅ Assigned quizzes to students`);

    // 7. Create sample activities
    console.log('\n📋 Creating sample activities...');
    const activities = [
      {
        title: 'Algebra Problem Set',
        description: 'Complete the assigned algebra problems',
        rubric_url: 'https://example.com/algebra-rubric.pdf',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        grading_mode: 'points',
        is_published: true,
        assigned_by: teacherId
      },
      {
        title: 'Science Experiment Report',
        description: 'Write a report on the chemical reaction experiment',
        rubric_url: 'https://example.com/science-rubric.pdf',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        grading_mode: 'rubric',
        is_published: true,
        assigned_by: teacherId
      }
    ];

    const { data: createdActivities, error: activitiesError } = await supabase
      .from('activities')
      .insert(activities)
      .select('id, title');

    if (activitiesError) {
      console.error('❌ Error creating activities:', activitiesError);
      return;
    }

    console.log(`✅ Created ${createdActivities.length} activities`);

    // 8. Assign activities to students
    console.log('\n📋 Assigning activities to students...');
    const activityAssignments = [];
    createdActivities.forEach(activity => {
      studentIds.forEach(studentId => {
        activityAssignments.push({
          activity_id: activity.id,
          student_id: studentId
        });
      });
    });

    const { error: activityAssignmentError } = await supabase
      .from('activity_assignees')
      .insert(activityAssignments);

    if (activityAssignmentError) {
      console.error('❌ Error assigning activities:', activityAssignmentError);
      return;
    }

    console.log(`✅ Assigned activities to students`);

    // 9. Create some quiz results
    console.log('\n📊 Creating sample quiz results...');
    const quizResults = [];
    createdQuizzes.forEach(quiz => {
      studentIds.forEach((studentId, studentIndex) => {
        // Simulate different scores
        const score = Math.floor(Math.random() * 40) + 60; // 60-100
        quizResults.push({
          quiz_id: quiz.id,
          student_id: studentId,
          score: score,
          total_points: 100,
          responses: { q1: 'answer1', q2: 'answer2' },
          attempt_number: 1
        });
      });
    });

    const { error: quizResultsError } = await supabase
      .from('quiz_results')
      .insert(quizResults);

    if (quizResultsError) {
      console.error('❌ Error creating quiz results:', quizResultsError);
      return;
    }

    console.log(`✅ Created ${quizResults.length} quiz results`);

    // 10. Create some activity submissions
    console.log('\n📄 Creating sample activity submissions...');
    const submissions = [];
    createdActivities.forEach((activity, activityIndex) => {
      studentIds.forEach((studentId, studentIndex) => {
        // Some submissions graded, some pending
        const isGraded = studentIndex % 2 === 0;
        submissions.push({
          activity_id: activity.id,
          student_id: studentId,
          file_url: `https://example.com/submission-${activity.id}-${studentId}.pdf`,
          submitted_at: new Date(
            Date.now() - (studentIndex + 1) * 24 * 60 * 60 * 1000
          ).toISOString(),
          score: isGraded ? Math.floor(Math.random() * 20) + 80 : null, // 80-100 if graded
          feedback: isGraded ? 'Good work! Keep it up.' : null,
          graded_at: isGraded ? new Date().toISOString() : null,
          graded_by: isGraded ? teacherId : null
        });
      });
    });

    const { error: submissionsError } = await supabase
      .from('submissions')
      .insert(submissions);

    if (submissionsError) {
      console.error('❌ Error creating submissions:', submissionsError);
      return;
    }

    console.log(`✅ Created ${submissions.length} submissions`);

    console.log('\n🎉 Teacher sample data insertion completed successfully!');
    console.log('\n📊 Teacher dashboard should now show:');
    console.log(`   • Total Students: ${studentIds.length}`);
    console.log(
      `   • Active Lessons: ${lessons.filter(l => l.is_published).length}`
    );
    console.log(`   • Quizzes Created: ${createdQuizzes.length}`);
    console.log(
      `   • Pending Grades: ${submissions.filter(s => s.score === null).length}`
    );
    console.log(`   • Classes: ${createdClasses.length}`);
    console.log(`   • Activities: ${createdActivities.length}`);
    console.log(
      '\n🔗 You can now test the teacher dashboard at /teacher/dashboard'
    );
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

insertTeacherSampleData();
