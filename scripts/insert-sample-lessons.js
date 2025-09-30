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

async function insertSampleLessons() {
  try {
    console.log('🚀 Starting sample lesson insertion...');

    // First, get a teacher user to create lessons for
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
    console.log(`📚 Creating lessons for teacher: ${teacher.full_name}`);

    // Sample lesson data
    const sampleLessons = [
      {
        title: 'Introduction to Calculus: Limits and Derivatives',
        content_url: 'https://example.com/lessons/calculus-intro',
        subject: 'Mathematics',
        grade_level: 'Grade 12',
        vark_tag: 'visual',
        resource_type: 'Video',
        is_published: true,
        created_by: teacher.id
      },
      {
        title: "Shakespeare's Sonnets: Analysis and Interpretation",
        content_url: 'https://example.com/lessons/shakespeare-sonnets',
        subject: 'English',
        grade_level: 'Grade 11',
        vark_tag: 'reading_writing',
        resource_type: 'Document',
        is_published: true,
        created_by: teacher.id
      },
      {
        title: "Newton's Laws of Motion: Understanding Physics",
        content_url: 'https://example.com/lessons/newton-laws',
        subject: 'Physics',
        grade_level: 'Grade 10',
        vark_tag: 'kinesthetic',
        resource_type: 'Interactive',
        is_published: true,
        created_by: teacher.id
      },
      {
        title: 'World War II: Timeline and Key Events',
        content_url: 'https://example.com/lessons/ww2-timeline',
        subject: 'History',
        grade_level: 'Grade 9',
        vark_tag: 'visual',
        resource_type: 'Presentation',
        is_published: true,
        created_by: teacher.id
      },
      {
        title: 'Photosynthesis: The Process of Plant Growth',
        content_url: 'https://example.com/lessons/photosynthesis',
        subject: 'Biology',
        grade_level: 'Grade 10',
        vark_tag: 'visual',
        resource_type: 'Image',
        is_published: true,
        created_by: teacher.id
      },
      {
        title: 'Creative Writing Workshop: Narrative Techniques',
        content_url: 'https://example.com/lessons/creative-writing',
        subject: 'English',
        grade_level: 'Grade 12',
        vark_tag: 'reading_writing',
        resource_type: 'Document',
        is_published: false,
        created_by: teacher.id
      },
      {
        title: 'Introduction to Programming: Python Basics',
        content_url: 'https://example.com/lessons/python-basics',
        subject: 'Computer Science',
        grade_level: 'Grade 11',
        vark_tag: 'kinesthetic',
        resource_type: 'Interactive',
        is_published: true,
        created_by: teacher.id
      },
      {
        title: 'Environmental Science: Climate Change Impact',
        content_url: 'https://example.com/lessons/climate-change',
        subject: 'Science',
        grade_level: 'Grade 11',
        vark_tag: 'auditory',
        resource_type: 'Audio',
        is_published: true,
        created_by: teacher.id
      },
      {
        title: 'Art History: Renaissance Masterpieces',
        content_url: 'https://example.com/lessons/renaissance-art',
        subject: 'Art',
        grade_level: 'Grade 9',
        vark_tag: 'visual',
        resource_type: 'Image',
        is_published: true,
        created_by: teacher.id
      },
      {
        title: 'Music Theory: Understanding Harmony and Melody',
        content_url: 'https://example.com/lessons/music-theory',
        subject: 'Music',
        grade_level: 'Grade 10',
        vark_tag: 'auditory',
        resource_type: 'Audio',
        is_published: false,
        created_by: teacher.id
      },
      {
        title: 'Economics: Supply and Demand Principles',
        content_url: 'https://example.com/lessons/supply-demand',
        subject: 'Economics',
        grade_level: 'Grade 12',
        vark_tag: 'reading_writing',
        resource_type: 'Document',
        is_published: true,
        created_by: teacher.id
      },
      {
        title: 'Psychology: Cognitive Development Theories',
        content_url: 'https://example.com/lessons/cognitive-psychology',
        subject: 'Psychology',
        grade_level: 'Grade 11',
        vark_tag: 'reading_writing',
        resource_type: 'Document',
        is_published: true,
        created_by: teacher.id
      }
    ];

    console.log(`📝 Inserting ${sampleLessons.length} sample lessons...`);

    // Insert lessons
    const { data: insertedLessons, error: insertError } = await supabase
      .from('lessons')
      .insert(sampleLessons)
      .select();

    if (insertError) {
      throw new Error(`Error inserting lessons: ${insertError.message}`);
    }

    console.log(`✅ Successfully inserted ${insertedLessons.length} lessons:`);
    insertedLessons.forEach((lesson, index) => {
      console.log(
        `   ${index + 1}. ${lesson.title} (${lesson.subject} - ${
          lesson.grade_level
        })`
      );
    });

    // Now let's add some student progress for these lessons
    console.log('\n👥 Adding student progress to lessons...');

    // Get some student profiles
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'student')
      .limit(15);

    if (studentsError) {
      console.log(
        '⚠️  Could not fetch students for progress tracking:',
        studentsError.message
      );
    } else if (students && students.length > 0) {
      console.log(`📚 Found ${students.length} students to track progress`);

      // Create lesson progress entries
      const progressEntries = [];

      // Distribute students across lessons with different progress states
      students.forEach((student, index) => {
        const lessonIndex = index % insertedLessons.length;
        const progressStates = ['not_started', 'in_progress', 'completed'];
        const randomState =
          progressStates[Math.floor(Math.random() * progressStates.length)];

        progressEntries.push({
          lesson_id: insertedLessons[lessonIndex].id,
          student_id: student.id,
          status: randomState,
          completed_at:
            randomState === 'completed' ? new Date().toISOString() : null
        });
      });

      if (progressEntries.length > 0) {
        const { error: progressError } = await supabase
          .from('lesson_progress')
          .insert(progressEntries);

        if (progressError) {
          console.log(
            '⚠️  Could not create progress entries:',
            progressError.message
          );
        } else {
          console.log(
            `✅ Successfully created ${progressEntries.length} progress entries`
          );
        }
      }
    }

    console.log('\n🎉 Sample lesson data insertion completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Lessons created: ${insertedLessons.length}`);
    console.log(`   - Teacher: ${teacher.full_name}`);
    console.log(
      `   - Students available for progress tracking: ${students?.length || 0}`
    );
    console.log('\n🔍 Learning Style Distribution:');
    const varkCounts = {};
    insertedLessons.forEach(lesson => {
      varkCounts[lesson.vark_tag] = (varkCounts[lesson.vark_tag] || 0) + 1;
    });
    Object.entries(varkCounts).forEach(([style, count]) => {
      console.log(`   - ${style.replace('_', ' ')}: ${count} lessons`);
    });
  } catch (error) {
    console.error('❌ Error inserting sample lessons:', error.message);
    process.exit(1);
  }
}

// Run the script
insertSampleLessons()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
