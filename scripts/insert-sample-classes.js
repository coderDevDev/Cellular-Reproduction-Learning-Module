const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log(
    'SUPABASE_SERVICE_ROLE_KEY:',
    supabaseServiceKey ? 'Set' : 'Missing'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertSampleClasses() {
  try {
    console.log('🚀 Starting sample class insertion...');

    // First, get a teacher user to create classes for
    const { data: teachers, error: teacherError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'teacher')
      .limit(1);

    if (teacherError) {
      throw new Error(`Error fetching teachers: ${teacherError.message}`);
    }

    if (!teachers || teachers.length === 0) {
      console.log(
        '❌ No teachers found. Please create a teacher account first.'
      );
      return;
    }

    const teacher = teachers[0];
    console.log(`📚 Creating classes for teacher: ${teacher.full_name}`);

    // Sample class data
    const sampleClasses = [
      {
        name: 'Advanced Mathematics',
        description:
          'Advanced level mathematics focusing on calculus, algebra, and mathematical analysis. Students will develop critical thinking and problem-solving skills.',
        subject: 'Mathematics',
        grade_level: 'Grade 12',
        created_by: teacher.id
      },
      {
        name: 'English Literature & Composition',
        description:
          'Study of classic and contemporary literature with emphasis on critical analysis, writing skills, and literary appreciation.',
        subject: 'English',
        grade_level: 'Grade 11',
        created_by: teacher.id
      },
      {
        name: 'Physics Fundamentals',
        description:
          'Introduction to physics concepts and principles including mechanics, thermodynamics, and modern physics applications.',
        subject: 'Science',
        grade_level: 'Grade 10',
        created_by: teacher.id
      },
      {
        name: 'World History & Cultures',
        description:
          'Comprehensive study of world civilizations, major historical events, and cultural developments from ancient times to present.',
        subject: 'History',
        grade_level: 'Grade 9',
        created_by: teacher.id
      },
      {
        name: 'Computer Science Principles',
        description:
          'Introduction to computer science concepts, programming fundamentals, and computational thinking for modern problem-solving.',
        subject: 'Computer Science',
        grade_level: 'Grade 11',
        created_by: teacher.id
      },
      {
        name: 'Biology & Life Sciences',
        description:
          'Study of living organisms, cellular processes, genetics, and ecological systems with hands-on laboratory experiences.',
        subject: 'Science',
        grade_level: 'Grade 10',
        created_by: teacher.id
      },
      {
        name: 'Creative Writing Workshop',
        description:
          'Advanced writing course focusing on creative expression, narrative techniques, and developing unique writing styles.',
        subject: 'English',
        grade_level: 'Grade 12',
        created_by: teacher.id
      },
      {
        name: 'Environmental Science',
        description:
          'Study of environmental systems, sustainability, climate change, and human impact on natural resources.',
        subject: 'Science',
        grade_level: 'Grade 11',
        created_by: teacher.id
      }
    ];

    console.log(`📝 Inserting ${sampleClasses.length} sample classes...`);

    // Insert classes
    const { data: insertedClasses, error: insertError } = await supabase
      .from('classes')
      .insert(sampleClasses)
      .select();

    if (insertError) {
      throw new Error(`Error inserting classes: ${insertError.message}`);
    }

    console.log(`✅ Successfully inserted ${insertedClasses.length} classes:`);
    insertedClasses.forEach((cls, index) => {
      console.log(
        `   ${index + 1}. ${cls.name} (${cls.subject} - ${cls.grade_level})`
      );
    });

    // Now let's add some students to these classes
    console.log('\n👥 Adding students to classes...');

    // Get some student profiles
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, full_name, grade_level')
      .eq('role', 'student')
      .limit(20);

    if (studentsError) {
      console.log(
        '⚠️  Could not fetch students for enrollment:',
        studentsError.message
      );
    } else if (students && students.length > 0) {
      console.log(`📚 Found ${students.length} students to enroll`);

      // Create class enrollments
      const enrollments = [];

      // Distribute students across classes
      students.forEach((student, index) => {
        const classIndex = index % insertedClasses.length;
        enrollments.push({
          class_id: insertedClasses[classIndex].id,
          student_id: student.id
        });
      });

      if (enrollments.length > 0) {
        const { error: enrollmentError } = await supabase
          .from('class_students')
          .insert(enrollments);

        if (enrollmentError) {
          console.log(
            '⚠️  Could not create enrollments:',
            enrollmentError.message
          );
        } else {
          console.log(`✅ Successfully enrolled students in classes`);
        }
      }
    }

    console.log('\n🎉 Sample class data insertion completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Classes created: ${insertedClasses.length}`);
    console.log(`   - Teacher: ${teacher.full_name}`);
    console.log(
      `   - Students available for enrollment: ${students?.length || 0}`
    );
  } catch (error) {
    console.error('❌ Error inserting sample classes:', error.message);
    process.exit(1);
  }
}

// Run the script
insertSampleClasses()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });






