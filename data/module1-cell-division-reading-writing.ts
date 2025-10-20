import { VARKModule, VARKModuleCategory } from '@/types/vark-module';

export const module1CellDivisionReadingWriting: VARKModule = {
  id: 'module1-cell-division-reading-writing-001',
  category_id: '14b8bda7-5fe0-4e10-88d0-db4ba8b55137', // Biology category UUID from database
  title: '📖 Lesson 1: Understanding Cell Divisionss - Reading/Writing Focus',
  description:
    'A comprehensive reading/writing focused module on cell division, mitosis, and meiosis. This module emphasizes text-based learning, note-taking, and written comprehension activities.',
  learning_objectives: [
    'Differentiate between mitosis and meiosis by identifying their purposes, number of daughter cells produced, and chromosome count',
    'Explain how meiosis contributes to sexual reproduction by producing genetically unique gametes and forming a diploid zygote during fertilization',
    'Draw and identify the key stages of the cell cycle, mitosis and meiosis including the major events in each phase',
    'Describe the importance of cell division in relations to growth, repair, and reproduction'
  ],
  content_structure: {
    sections: [
      {
        id: 'lesson-intro',
        title: '📚 Introduction',
        content_type: 'text',
        content_data: {
          text: `Have you ever wondered how your body grows, heals, or even how life begins? It all starts with tiny cells working behind the scenes. Every living thing from the smallest insect to the tallest tree is made up of cells. These cells don't just stay the same; they divide, multiply, and change to help the body grow, repair itself, and create new life.

In this lesson, you'll learn about cell division, the process that allows one cell to become two or more. You'll explore two types of cell division, mitosis and meiosis, and discover how they help living organisms grow and reproduce. By the end, you'll understand how your body keeps building itself and how new life begins from just a single cell.`
        },
        position: 1,
        is_required: true,
        time_estimate_minutes: 5,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          key_points: [
            'Cell division is fundamental to life',
            'Two main types: mitosis and meiosis',
            'Growth, repair, and reproduction'
          ]
        }
      },
      {
        id: 'content-overview',
        title: '📋 Content Overview',
        content_type: 'text',
        content_data: {
          text: `This lesson will cover the following topics:

• Cell Division - Understanding the basic process
• Cell Cycle - The complete cycle cells follow
• Mitosis - Cell division for growth and repair
• Stages of Mitosis - Detailed breakdown of each phase
• Meiosis - Cell division for reproduction
• Stages of Meiosis - The two rounds of division

Each section builds upon the previous one, so make sure to read and understand each part before moving to the next.`
        },
        position: 2,
        is_required: true,
        time_estimate_minutes: 3,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          key_points: [
            'Sequential learning approach',
            'Building knowledge step by step',
            'Comprehensive coverage'
          ]
        }
      },
      {
        id: 'content-standards',
        title: '🎯 Content Standards',
        content_type: 'text',
        content_data: {
          text: `Content Standards:
Cells are the basic unit of life and mitosis, and meiosis are the basic forms of cell division.

Learning Competency:
Recognize that cells reproduce through two types of cell division, mitosis and meiosis, and describe mitosis as cell division for growth and repair.`
        },
        position: 3,
        is_required: true,
        time_estimate_minutes: 2,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          key_points: ['Educational standards', 'Learning competencies']
        }
      },
      {
        id: 'objectives-section',
        title: '🎓 Learning Objectives',
        content_type: 'text',
        content_data: {
          text: `At the end of the lessons, the students will be able to:

1. Differentiate between mitosis and meiosis by identifying their purposes, number of daughter cells produced, and chromosome count.

2. Explain how meiosis contributes to sexual reproduction by producing genetically unique gametes and forming a diploid zygote during fertilization.

3. Draw and identify the key stages of the cell cycle, mitosis and meiosis including the major events in each phase.

4. Describe the importance of cell division in relations to growth, repair, and reproduction.`
        },
        position: 4,
        is_required: true,
        time_estimate_minutes: 3,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          key_points: [
            'Clear learning goals',
            'Measurable outcomes',
            'Comprehensive understanding'
          ]
        }
      },
      {
        id: 'pre-test-section',
        title: '📝 Pre-Test',
        content_type: 'assessment',
        content_data: {
          quiz_data: {
            question: 'Pre-Test: Let us first check what you already know!',
            type: 'single_choice',
            options: ['Pre-Test Questions'],
            correct_answer: 'Complete all questions',
            explanation:
              'This pre-test helps us understand your current knowledge of cell division concepts.',
            points: 50,
            feedback: {
              correct:
                'Excellent! You have a good foundation in cell division concepts.',
              incorrect:
                "Don't worry! This pre-test helps us understand what we need to focus on. Let's learn together!"
            }
          }
        },
        position: 5,
        is_required: true,
        time_estimate_minutes: 8,
        learning_style_tags: ['reading_writing', 'kinesthetic'],
        interactive_elements: ['interactive_quizzes'],
        metadata: {
          difficulty: 'beginner',
          key_points: ['Baseline assessment', 'Knowledge check']
        }
      },
      {
        id: 'lesson-proper-intro',
        title: '📖 Lesson Proper',
        content_type: 'text',
        content_data: {
          text: `Let's Start Discovering!

Cell Division

Cell division is an important biological process where one parent cell splits to create two or more new cells, called daughter cells.

The cells multiply through two different types of cell division: mitosis and meiosis. Each type plays an important role in growth, repair, and reproduction of every living organism.

Understanding what cell division is, is just the beginning. So let us explore its importance!`
        },
        position: 6,
        is_required: true,
        time_estimate_minutes: 4,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          key_points: [
            'Biological process definition',
            'Two types of cell division',
            'Importance exploration'
          ]
        }
      },
      {
        id: 'importance-cell-division',
        title: '🌟 Importance of Cell Division',
        content_type: 'text',
        content_data: {
          text: `Importance of cell division in living organisms:

1. Growth and Development
   - It helps organisms grow and form new tissues
   - How does it happen?
   - As the cells divide through mitosis, they produce new cells that are genetically identical. These new cells add to body size and help form tissues like muscles, bones, and skin.
   - Example: Imagine a baby, it continuously grows into a child because cells keep dividing and multiplying.

2. Repair and Regeneration
   - It replaces damaged or worn-out cells
   - How does it happen?
   - Imagine getting a cut or wound, the skin cells around the wound or cut divide to replace the lost and damaged skins.

3. Reproduction
   - It allows organisms to produce offspring or create new life
   - How does it happen?
   - There are different types of reproduction in which cell division plays an important role.
   - For example, in asexual reproduction, one parent cell divides to form offspring (e.g., bacteria through binary fission). While in sexual reproduction, special cells called gametes (sperm and egg) are made through meiosis. These gametes combine during fertilization to form a zygote, which grows into a new organism.`
        },
        position: 7,
        is_required: true,
        time_estimate_minutes: 6,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          key_points: [
            'Three main purposes',
            'Real-world examples',
            'Practical applications'
          ]
        }
      },
      {
        id: 'cell-cycle-section',
        title: '🔄 Cell Cycle',
        content_type: 'text',
        content_data: {
          text: `The cell cycle is the process that cells follow to grow, copy their contents, and create new cells.

The cell cycle has two major stages:

1. Interphase – the time between cell divisions
2. Mitotic Phase – the stage when the cell actually divides

Interphase

Interphase is the first and longest period between mitotic divisions that have 3 subphases such as G1, S, and G2.

G1 Phase (Gap 1)
This is the first part of interphase, where the cell grows and gets ready to divide. It builds up the materials and energy needed for the next steps.

S Phase (Synthesis)
During this phase, the cell copies all of its DNA. "S" stands for synthesis, which means making or building. This ensures that each new cell will have a complete set of genetic instructions.

G2 Phase (Gap 2)
In G2, the cell checks the copied DNA and begins organizing and condensing the genetic material. It prepares everything needed for division, making sure there's a full extra set of chromosomes.

Mitotic Phase (M Phase)

After interphase, the cell enters the M phase, which stands for mitosis. In this stage, the two complete sets of genetic material are separated into two new cells (Notes: That Mitosis stage includes stages such as prophase, metaphase, anaphase, telophase and cytokinesis, to complete the division of cells.)

Once mitosis is finished, the cell divides, leaving behind two daughter cells. These cells may either continue growing or begin the cycle again.

What Happens After Division?
After the cell divides and has fully matured, it either stops growing or divides to make more cells. This process helps the body grow, repair damaged tissues, and increase the number of cells when needed.`
        },
        position: 8,
        is_required: true,
        time_estimate_minutes: 8,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          key_points: [
            'Two major stages',
            'Interphase subphases',
            'M Phase process'
          ]
        }
      },
      {
        id: 'mitosis-section',
        title: '🔬 Mitosis',
        content_type: 'text',
        content_data: {
          text: `Mitosis

Mitosis is a type of cell division that produces two (2) daughter cells having the same genetic material as its parent. The daughter cells have the same diploid chromosome number as the parent cell. The main purpose of this process is to help multicellular organisms grow, heal injuries, and reproduce without needing a partner (asexual reproduction).

Stages of Mitosis

Stage 1 - Prophase
This phase occupies over half of mitosis. The cell prepares for cell division by copying the DNA and the nuclear membrane and nucleolus are starting to break down in this process. Chromatin condenses into chromosomes. A centromere binds the double-stranded chromosomes together at one point. Spindle fibers begin to form, which are microscopic protein structures that help divide the genetic material in the cell.

Stage 2 - Metaphase
At the equator of the cell known as Metaphase plate, the now double stranded chromosomes called chromatids align themselves. Each chromatid is connected to the spindle by a structure called kinetochore in the centromere.

Stage 3 - Anaphase
This is the shortest stage. The chromatids are pushed by forces originating from the poles to pass. Consequently, the centromere divides into new, single-stranded chromosomes, splitting the chromatids. After that, the chromosomes travel towards their respective poles.

Stage 4 - Telophase
During this stage, the opposite poles have now reached the chromosomes, and the spindle fibers disappear. The chromosomes uncoil at the poles and the nucleolus and nuclear membrane start reforming. But the cell is not yet completely separated.

Cytokinesis
To complete the cell division after stages of mitosis, a process called cytokinesis takes place. In this process, the cytoplasm simultaneously divides, and the cell is separated into two by a plasma membrane. The formation of the new plasma membrane completely divides the cell, forming two identical daughter cells.

Cytokinesis happens differently between the animal and plant cells.

In animal cells, the creation of a cleavage furrow is necessary for cytokinesis, where the cytoplasm divides and the parent cell becomes two daughter cells. It pinches the cell off or splits it into two.

In plant cells, cells do not pinch off. Instead, between the two nuclei, a new structure called the cell plate forms to develop into a new cell wall.`
        },
        position: 9,
        is_required: true,
        time_estimate_minutes: 10,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          difficulty: 'intermediate',
          key_points: [
            'Four main stages',
            'Cytokinesis process',
            'Animal vs plant differences'
          ]
        }
      },
      {
        id: 'meiosis-section',
        title: '🧬 Meiosis',
        content_type: 'text',
        content_data: {
          text: `Meiosis

Meiosis is a special type of cell division that takes place in cells with two sets of chromosomes known as diploid cells (2n). It creates four genetically unique daughter cells called gametes (sperm cells in male and egg cells in females). These gametes carry only one set of chromosomes (haploid cells = n) which is half the number of chromosomes found in the parent cell. This process includes one round of DNA replication, followed by two cycles of division: Meiosis I and Meiosis II.

Meiosis I: First Division

It is the first round of cell division in meiosis. This stage starts after DNA replication and reduces the number of chromosomes by half meaning it changes one diploid cell (2n) that contains two sets of chromosomes into two haploid cells each containing only one set of chromosomes (n).

Stages of Meiosis I

Stage 1 - Prophase I
In this stage, the chromosomes have already been duplicated. Each chromosome is made up of two sister chromatids joined at the centromere. The homologous chromosomes (one from each parent) pair up in a process called synapsis, forming structures called tetrads (four chromatids in total, which two from each homologous chromosomes). While in this position, the process known crossing-over occurs, where genetic material is exchanged between homologous chromosomes, increasing genetic variation.

Stage 2 - Metaphase I
During this stage, the tetrads (paired homologous chromosomes) line up along the equatorial plate also known as Metaphase Plate. Their arrangement is random, contributing to genetic diversity.

Stage 3 - Anaphase I
The homologous chromosomes separate and move to opposite poles. The direction each chromosome moves is random and does not depend on its partner.

Stage 4 - Telophase I and Cytokinesis
The chromosomes reached the opposite poles and a new nuclear membrane formed. To complete the division of cells the cell goes through the process of cytokinesis, forming two haploid daughter cells (n), in which contains one chromosome from each homologous pair, resulting in a haploid chromosome number.

After meiosis I it will undergo the second round of meiosis known as meiosis II.

Meiosis II: Second Division

It is the second round of cell division in meiosis. In this round, there is no DNA replication involved. This process is similar to mitosis where the separation of the sister chromatid occurs. However, this process starts with two haploid cells that are formed in meiosis I. These cells divide forming four haploid daughter cells. Each cell contains one complete set of chromosomes.

Stage 1 - Prophase II
Prophase II begins after Telophase I and cytokinesis; no DNA replication occurs. Sister chromatids remain attached at the centromere and the nuclear membrane breaks down.

Stage 2 - Metaphase II
During this stage, the chromosomes line up individually along the equatorial plate known as metaphase plate.

Stage 3 - Anaphase II
The centromeres split, and sister chromatids are pulled to opposite poles of the cell.

Stage 4 - Telophase II and Cytokinesis
In this stage the chromatids move to the opposite poles of the cell and the nuclear envelope is formed. After, the cytokinesis occurs where the cell division is completed. In which, a total of four haploid cells are produced, each containing single-stranded chromosomes. These cells are now ready to function as gametes (sperm or egg cells).`
        },
        position: 10,
        is_required: true,
        time_estimate_minutes: 12,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          difficulty: 'advanced',
          key_points: [
            'Two rounds of division',
            'Genetic variation',
            'Gamete formation'
          ]
        }
      },
      {
        id: 'meiosis-life-cycle',
        title: '🌱 Importance of Meiosis in Life Cycle',
        content_type: 'text',
        content_data: {
          text: `Importance of Meiosis in Life Cycle of Animals

Meiosis helps animals make special cells called gametes. These are the egg cells in females and sperm cells in males. These cells are important for reproduction.

During fertilization, an egg and a sperm join together to form a zygote. This zygote has two sets of chromosomes—one from the mother and one from the father. In humans, each parent gives 23 chromosomes, so the zygote ends up with 46 chromosomes. The zygote then divides many times and grows into a new organism.

Meiosis in Males
Sperm cells are made in the testes. Meiosis creates four small sperm cells, all the same size.
Each sperm has:
- A head with the nucleus (where the DNA is stored)
- A middle part with mitochondria (which give energy)
- A tail that helps it swim

Meiosis in Females
Egg cells are made in the ovaries.
Meiosis makes one big egg cell and tiny cells that break down.
The big egg keeps nutrients to help the baby grow. The sperm only gives its DNA when it joins with the egg.`
        },
        position: 11,
        is_required: true,
        time_estimate_minutes: 5,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          key_points: [
            'Sexual reproduction',
            'Male vs female meiosis',
            'Fertilization process'
          ]
        }
      },
      {
        id: 'mitosis-vs-meiosis-table',
        title: '⚖️ Differences between Mitosis and Meiosis',
        content_type: 'table',
        content_data: {
          table_data: {
            headers: ['Features', 'MITOSIS', 'MEIOSIS'],
            rows: [
              [
                'Purpose',
                'Mitosis helps multicellular organisms grow, heal injuries, and reproduce without needing a partner (asexual reproduction).',
                'Meiosis is used in sexual reproduction to produce gametes—sperm in males and eggs in females.'
              ],
              [
                'Genetic Identity',
                'Identical (Genetically the same to parent Cell)',
                'Unique (Genetically different from the parent cell and from one another.)'
              ],
              [
                'Number of Daughter Cells Produced',
                'Produces 2 genetically identical daughter cells.',
                'Produces 4 genetically distinct daughter cells.'
              ],
              [
                'Chromosome Number in Daughter Cells',
                'Daughter cells have the same diploid chromosome number as the parent cell.',
                'Daughter cells have a haploid chromosome number (half the number of the parent cell)'
              ]
            ],
            caption: 'Comparison of Mitosis and Meiosis',
            styling: {
              zebra_stripes: true,
              highlight_header: true,
              responsive: true
            }
          }
        },
        position: 12,
        is_required: true,
        time_estimate_minutes: 6,
        learning_style_tags: ['reading_writing', 'visual'],
        interactive_elements: [],
        metadata: {
          difficulty: 'intermediate',
          key_points: [
            'Key differences',
            'Purpose comparison',
            'Genetic outcomes'
          ]
        }
      },
      {
        id: 'activity-1-section',
        title: '📝 Activity 1: Fill-in-the-Blanks Summary',
        content_type: 'activity',
        content_data: {
          activity_data: {
            title: 'Fill-in-the-Blanks Summary',
            description:
              'Complete the sentences using the correct words from the lesson',
            type: 'discussion',
            word_bank: [
              'growth',
              'gametes',
              'identical',
              'four',
              'zygote',
              'mitosis',
              'meiosis',
              'cell cycle',
              '23',
              '46'
            ],
            questions: [
              'Cell division is important for __________, repair and reproduction.',
              'Meiosis is the type of cell division that produces sex cells, also called __________.',
              'Mitosis produces two daughter cells that are genetically __________ to the parent cell.',
              'Meiosis produces __________ daughter cells that are genetically unique with one another.',
              'In humans, sex cells join together to form a __________ during fertilization.',
              '__________ helps heal wounds because it makes new skin cells.',
              '__________ makes special cells known as gametes.',
              '__________ is the process that cells follow to grow, copy their contents, and create new cells.',
              'In humans each parent gives ______ chromosomes and during fertilization chromosomes combine to form zygote with ____ chromosomes.'
            ],
            instructions: [
              'Read each sentence carefully and fill in the blanks using the correct word.',
              'Use the word bank provided to guide your answer.',
              'Note: Some words may be used more than once.'
            ],
            expected_outcome:
              'Complete understanding of key cell division concepts through written exercises',
            assessment_criteria: [
              'Correct word selection',
              'Understanding of concepts',
              'Completion of all blanks'
            ]
          }
        },
        position: 13,
        is_required: true,
        time_estimate_minutes: 10,
        learning_style_tags: ['reading_writing'],
        interactive_elements: ['text_editor', 'note_taking'],
        metadata: {
          difficulty: 'intermediate',
          key_points: [
            'Written comprehension',
            'Key concept reinforcement',
            'Vocabulary building'
          ]
        }
      },
      {
        id: 'activity-2-section',
        title: '🔗 Activity 2: Match and Write!',
        content_type: 'activity',
        content_data: {
          activity_data: {
            title: 'Match and Write!',
            description:
              'Match the correct description with the appropriate term',
            type: 'matching',
            matching_pairs: [
              {
                description:
                  'It is known as a special sex cell that is made through meiosis.',
                term: 'Gametes'
              },
              {
                description:
                  'It is a type of cell division that produces two genetically identical daughter cells.',
                term: 'Mitosis'
              },
              {
                description:
                  'It is a process where the sperm and egg cells are joined together to form zygote.',
                term: 'Fertilization'
              },
              {
                description:
                  'It is a type of cell division that produces four genetically unique daughter cells.',
                term: 'Meiosis'
              },
              {
                description:
                  'It is an important biological process where one parent cell splits to create two or more new cells.',
                term: 'Cell Division'
              }
            ],
            instructions: [
              'Match the correct description in Column A with the appropriate word in Column B.',
              'Write the letter of your answer in the space provided.'
            ],
            expected_outcome:
              'Mastery of cell division terminology and processes',
            assessment_criteria: [
              'Correct matching',
              'Understanding of definitions',
              'Terminology accuracy'
            ]
          }
        },
        position: 14,
        is_required: true,
        time_estimate_minutes: 8,
        learning_style_tags: ['reading_writing'],
        interactive_elements: ['text_editor'],
        metadata: {
          difficulty: 'intermediate',
          key_points: [
            'Terminology matching',
            'Concept understanding',
            'Written assessment'
          ]
        }
      },
      {
        id: 'post-test-section',
        title: '📊 Post-Test',
        content_type: 'assessment',
        content_data: {
          quiz_data: {
            question:
              'Post-Test: Are you ready to check what you have learned?',
            type: 'single_choice',
            options: ['Post-Test Questions'],
            correct_answer: 'Complete all questions',
            explanation:
              'These questions test your comprehensive understanding of cell division, mitosis, meiosis, and their roles in reproduction.',
            points: 100,
            feedback: {
              correct:
                'Excellent work! You have mastered the concepts of cell division!',
              incorrect:
                'Good effort! Review the material and try again. Understanding takes time!'
            }
          }
        },
        position: 15,
        is_required: true,
        time_estimate_minutes: 15,
        learning_style_tags: ['reading_writing', 'kinesthetic'],
        interactive_elements: ['interactive_quizzes'],
        metadata: {
          difficulty: 'intermediate',
          key_points: [
            'Comprehensive assessment',
            'Multiple topics covered',
            'Final evaluation'
          ]
        }
      },
      {
        id: 'scoring-feedback',
        title: '🎉 Scoring & Feedback',
        content_type: 'text',
        content_data: {
          text: `Scoring System:

10/10 → Excellent! 🎊 Congratulations! You have mastered cell division concepts!
7-9/10 → Great job! 👍 You have a solid understanding. Just review a bit more.
Below 7 → Don't worry, keep practicing. You'll get it! 💪

Remember: Learning is a process. Each attempt helps you understand better. Keep studying and practicing!`
        },
        position: 16,
        is_required: true,
        time_estimate_minutes: 2,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          key_points: [
            'Performance levels',
            'Encouraging feedback',
            'Growth mindset'
          ]
        }
      }
    ],
    learning_path: [
      {
        id: 'intro-path',
        name: 'Introduction & Overview',
        description:
          'Start with the basics and understand the importance of cell division',
        modules: [],
        current_module_index: 0,
        progress_percentage: 0,
        estimated_completion_time: 20
      },
      {
        id: 'core-content-path',
        name: 'Core Content Learning',
        description:
          'Deep dive into mitosis, meiosis, and cell cycle processes',
        modules: [],
        current_module_index: 0,
        progress_percentage: 0,
        estimated_completion_time: 40
      },
      {
        id: 'application-path',
        name: 'Application & Assessment',
        description: 'Apply knowledge through activities and assessments',
        modules: [],
        current_module_index: 0,
        progress_percentage: 0,
        estimated_completion_time: 30
      }
    ],
    prerequisites_checklist: [
      'Basic understanding of cells',
      'Knowledge of DNA structure',
      'Familiarity with biological processes',
      'Reading comprehension skills'
    ],
    completion_criteria: [
      'Complete all required sections',
      'Score 80% or higher on assessments',
      'Complete all written activities',
      'Demonstrate understanding through post-test'
    ]
  },
  difficulty_level: 'intermediate',
  estimated_duration_minutes: 90,
  prerequisites: [
    'Basic cell biology knowledge',
    'Understanding of DNA and chromosomes',
    'Familiarity with biological processes',
    'Reading and writing skills'
  ],
  multimedia_content: {
    videos: [],
    images: [],
    diagrams: [],
    podcasts: [],
    audio_lessons: [],
    discussion_guides: [
      'Cell division discussion questions',
      'Mitosis vs meiosis comparison guide',
      'Meiosis in reproduction discussion'
    ],
    interactive_simulations: [],
    hands_on_activities: [],
    animations: [],
    virtual_labs: [],
    interactive_diagrams: []
  },
  interactive_elements: {
    drag_and_drop: false,
    visual_builder: false,
    simulation: false,
    audio_playback: false,
    discussion_forum: true,
    voice_recording: false,
    text_editor: true,
    note_taking: true,
    physical_activities: false,
    experiments: false,
    interactive_quizzes: true,
    progress_tracking: true,
    virtual_laboratory: false,
    gamification: false
  },
  assessment_questions: [
    // Pre-Test Questions
    {
      id: 'pre-test-1',
      question: 'What is the main purpose of cell division?',
      type: 'single_choice',
      options: [
        'A. To produce energy',
        'B. To stop cell growth',
        'C. To create new cells for growth, repair, and reproduction',
        'D. To eliminate old cells'
      ],
      correct_answer:
        'C. To create new cells for growth, repair, and reproduction',
      points: 10
    },
    {
      id: 'pre-test-2',
      question:
        'Which type of cell division results in genetically identical daughter cells?',
      type: 'single_choice',
      options: [
        'A. Mitosis',
        'B. Fertilization',
        'C. Binary fission',
        'D. Meiosis'
      ],
      correct_answer: 'A. Mitosis',
      points: 10
    },
    {
      id: 'pre-test-3',
      question: 'What phase of the cell cycle involves DNA replication?',
      type: 'single_choice',
      options: ['A. M Phase', 'B. G2 Phase', 'C. S Phase', 'D. G1 Phase'],
      correct_answer: 'C. S Phase',
      points: 10
    },
    {
      id: 'pre-test-4',
      question: 'How many daughter cells are produced in meiosis?',
      type: 'single_choice',
      options: ['A. 2', 'B. 8', 'C. 4', 'D. 6'],
      correct_answer: 'C. 4',
      points: 10
    },
    {
      id: 'pre-test-5',
      question:
        'Which process contributes to genetic variation during meiosis?',
      type: 'single_choice',
      options: [
        'A. Chromosome duplication',
        'B. DNA replication',
        'C. Cytokinesis',
        'D. Crossing-over'
      ],
      correct_answer: 'D. Crossing-over',
      points: 10
    },
    // Post-Test Questions
    {
      id: 'post-test-1',
      question:
        'What is the chromosome number in human gametes produced by meiosis?',
      type: 'single_choice',
      options: ['A. 23', 'B. 92', 'C. 46', 'D. 12'],
      correct_answer: 'A. 23',
      points: 10
    },
    {
      id: 'post-test-2',
      question:
        'Which phase of meiosis involves homologous chromosomes separating?',
      type: 'single_choice',
      options: [
        'A. Metaphase II',
        'B. Anaphase I',
        'C. Telophase II',
        'D. Prophase I'
      ],
      correct_answer: 'B. Anaphase I',
      points: 10
    },
    {
      id: 'post-test-3',
      question: 'What structure forms during synapsis in Prophase I?',
      type: 'single_choice',
      options: [
        'A. Spindle fiber',
        'B. Chromatid',
        'C. Tetrad',
        'D. Centromere'
      ],
      correct_answer: 'C. Tetrad',
      points: 10
    },
    {
      id: 'post-test-4',
      question: 'What is the result of fertilization in humans?',
      type: 'single_choice',
      options: [
        'A. Four gametes',
        'B. A diploid zygote',
        'C. Two haploid cells',
        'D. A single sperm cell'
      ],
      correct_answer: 'B. A diploid zygote',
      points: 10
    },
    {
      id: 'post-test-5',
      question:
        'Which phase of the cell cycle prepares the cell for division by checking DNA and organizing chromosomes?',
      type: 'single_choice',
      options: ['A. M Phase', 'B. G2 Phase', 'C. G1 Phase', 'D. S Phase'],
      correct_answer: 'B. G2 Phase',
      points: 10
    },
    {
      id: 'post-test-6',
      question: 'What happens during Metaphase II of meiosis?',
      type: 'single_choice',
      options: [
        'A. DNA replication occurs',
        'B. Sister chromatids separate',
        'C. Chromosomes line up individually along the equatorial plate',
        'D. Homologous chromosomes pair up'
      ],
      correct_answer:
        'C. Chromosomes line up individually along the equatorial plate',
      points: 10
    },
    {
      id: 'post-test-7',
      question: 'Which organ produces sperm cells through meiosis?',
      type: 'single_choice',
      options: ['A. Ovary', 'B. Brain', 'C. Testes', 'D. Liver'],
      correct_answer: 'C. Testes',
      points: 10
    },
    {
      id: 'post-test-8',
      question: 'What is the role of mitochondria in sperm cells?',
      type: 'single_choice',
      options: [
        'A. Provide energy for movement',
        'B. Store DNA',
        'C. Help fertilization',
        'D. Form the tail'
      ],
      correct_answer: 'A. Provide energy for movement',
      points: 10
    },
    {
      id: 'post-test-9',
      question:
        'What happens to the tiny cells produced during meiosis in females?',
      type: 'single_choice',
      options: [
        'A. They fertilize the egg',
        'B. They develop into embryos',
        'C. They become sperm cells',
        'D. They break down'
      ],
      correct_answer: 'D. They break down',
      points: 10
    },
    {
      id: 'post-test-10',
      question: 'Why is meiosis important for sexual reproduction?',
      type: 'single_choice',
      options: [
        'A. It creates genetically unique gametes',
        'B. It produces identical cells',
        'C. It repairs damaged tissues',
        'D. It increases chromosome number'
      ],
      correct_answer: 'A. It creates genetically unique gametes',
      points: 10
    }
  ],
  module_metadata: {
    content_standards: [
      'Cells are the basic unit of life',
      'Mitosis and meiosis are the basic forms of cell division'
    ],
    learning_competencies: [
      'Recognize that cells reproduce through two types of cell division, mitosis and meiosis',
      'Describe mitosis as cell division for growth and repair'
    ],
    key_concepts: [
      'Cell division',
      'Mitosis',
      'Meiosis',
      'Cell cycle',
      'Genetic variation',
      'Gametes',
      'Fertilization'
    ],
    vocabulary: [
      'Mitosis',
      'Meiosis',
      'Gametes',
      'Haploid',
      'Diploid',
      'Crossing-over',
      'Synapsis',
      'Cytokinesis',
      'Chromatids',
      'Homologous chromosomes'
    ],
    real_world_applications: [
      'Understanding cancer and cell growth',
      'Reproductive biology',
      'Genetic diversity in populations',
      'Tissue regeneration and healing'
    ],
    extension_activities: [
      'Write a summary of mitosis vs meiosis',
      'Create a cell division timeline',
      'Research genetic disorders related to meiosis',
      'Write about the importance of cell division in daily life'
    ],
    assessment_rubrics: {
      knowledge_understanding: {
        excellent: 'Demonstrates comprehensive understanding of all concepts',
        good: 'Shows solid understanding with minor gaps',
        needs_improvement: 'Has significant gaps in understanding'
      },
      application: {
        excellent: 'Successfully applies concepts to new situations',
        good: 'Applies concepts with some guidance',
        needs_improvement: 'Struggles to apply concepts'
      },
      written_communication: {
        excellent: 'Clear, accurate written responses',
        good: 'Mostly clear with minor errors',
        needs_improvement: 'Unclear or inaccurate written responses'
      }
    },
    accessibility_features: [
      'Screen reader compatible',
      'High contrast mode',
      'Keyboard navigation',
      'Alternative text for images',
      'Text-to-speech support'
    ],
    estimated_completion_time: 90,
    difficulty_indicators: [
      'Intermediate biology concepts',
      'Reading comprehension required',
      'Written assessment based',
      'Text-heavy content'
    ]
  },
  // Class targeting fields
  target_class_id: '',
  target_learning_styles: ['reading_writing'],
  is_published: true,
  created_by: 'teacher-001',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z'
};

export const module1BiologyCategory: VARKModuleCategory = {
  id: '14b8bda7-5fe0-4e10-88d0-db4ba8b55137',
  name: 'Biology & Life Sciences',
  description:
    'Explore the fascinating world of living organisms, from cells to ecosystems',
  subject: 'Biology',
  grade_level: 'High School',
  learning_style: 'reading_writing',
  icon_name: 'book-open',
  color_scheme: 'from-blue-500 to-indigo-600',
  is_active: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z'
};
