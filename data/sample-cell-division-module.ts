import { VARKModule, VARKModuleCategory } from '@/types/vark-module';

export const sampleCellDivisionModule: VARKModule = {
  id: 'cell-division-mitosis-meiosis-001',
  category_id: '14b8bda7-5fe0-4e10-88d0-db4ba8b55137', // Biology category UUID from database
  title: '📘 Lesson Module: Cell Division – Mitosis & Meiosis',
  description:
    'Explore the fascinating world of cell division through mitosis and meiosis. Learn how cells grow, repair, and reproduce to sustain life.',
  learning_objectives: [
    'Differentiate between mitosis and meiosis (purpose, number of daughter cells, chromosome count)',
    'Explain how meiosis contributes to sexual reproduction (unique gametes → diploid zygote)',
    'Describe the importance of cell division',
    'Identify and summarize the key stages of the cell cycle, mitosis, and meiosis'
  ],
  content_structure: {
    sections: [
      {
        id: 'intro-section',
        title: '✨ Introduction',
        content_type: 'text',
        content_data: {
          text: `Have you ever wondered how your body grows, heals, or even how life begins?
It all starts with tiny cells working behind the scenes. Every living thing—from the smallest insect to the tallest tree—is made up of cells.

These cells do not stay the same; they divide, multiply, and change to help the body grow, repair itself, and create new life.

In this lesson, you'll explore:
• Mitosis → cell division for growth and repair
• Meiosis → cell division for reproduction

By the end, you'll understand how your body keeps building itself and how life begins from a single cell.`
        },
        position: 1,
        is_required: true,
        time_estimate_minutes: 3,
        learning_style_tags: ['reading_writing', 'visual'],
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
        title: '📑 Content',
        content_type: 'text',
        content_data: {
          text: `This comprehensive lesson covers:
• Cell division fundamentals
• Stages of Mitosis
• Stages of Meiosis
• Interactive activities and assessments`
        },
        position: 2,
        is_required: true,
        time_estimate_minutes: 2,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          key_points: [
            'Comprehensive coverage',
            'Interactive elements',
            'Practical applications'
          ]
        }
      },
      {
        id: 'standards-section',
        title: '🎯 Content Standards',
        content_type: 'text',
        content_data: {
          text: `• Cells are the basic unit of life.
• Mitosis and meiosis are the basic forms of cell division.`
        },
        position: 3,
        is_required: true,
        time_estimate_minutes: 2,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          key_points: ['Basic unit of life', 'Forms of cell division']
        }
      },
      {
        id: 'competency-section',
        title: '🏆 Learning Competency',
        content_type: 'text',
        content_data: {
          text: `• Recognize that cells reproduce through two types of cell division, mitosis and meiosis.
• Describe mitosis as cell division for growth and repair.`
        },
        position: 4,
        is_required: true,
        time_estimate_minutes: 2,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          key_points: ['Two types of cell division', 'Purpose of mitosis']
        }
      },
      {
        id: 'objectives-section',
        title: '🎓 Objectives',
        content_type: 'text',
        content_data: {
          text: `By the end of this lesson, students will be able to:
• Differentiate between mitosis and meiosis (purpose, number of daughter cells, chromosome count)
• Explain how meiosis contributes to sexual reproduction (unique gametes → diploid zygote)
• Describe the importance of cell division
• Identify and summarize the key stages of the cell cycle, mitosis, and meiosis`
        },
        position: 5,
        is_required: true,
        time_estimate_minutes: 3,
        learning_style_tags: ['reading_writing'],
        interactive_elements: [],
        metadata: {
          key_points: [
            'Differentiation skills',
            'Understanding processes',
            'Stage identification'
          ]
        }
      },
      {
        id: 'pre-test-section',
        title: '📝 Pre-Test',
        content_type: 'assessment',
        content_data: {
          quiz_data: {
            question: 'What is the main purpose of cell division?',
            type: 'multiple_choice',
            options: [
              'A. Produce energy',
              'B. Stop cell growth',
              'C. Create new cells for growth, repair, and reproduction',
              'D. Eliminate old cells'
            ],
            correct_answer:
              'C. Create new cells for growth, repair, and reproduction',
            explanation:
              'Cell division creates new cells for growth, repair, and reproduction - the fundamental processes that sustain life.',
            points: 10,
            feedback: {
              correct:
                'Excellent! You understand the fundamental purpose of cell division.',
              incorrect:
                'Think about what happens when cells divide - they create new cells for various purposes.'
            }
          }
        },
        position: 6,
        is_required: true,
        time_estimate_minutes: 5,
        learning_style_tags: ['kinesthetic', 'visual'],
        interactive_elements: ['interactive_quizzes'],
        metadata: {
          difficulty: 'beginner',
          key_points: ['Purpose of cell division', 'Multiple choice assessment']
        }
      },
      {
        id: 'lesson-proper-intro',
        title: '📖 Lesson Proper',
        content_type: 'text',
        content_data: {
          text: `🔬 Cell Division

The biological process where one parent cell splits to form daughter cells.

Importance of Cell Division:
• Growth and development → organisms grow & form tissues
• Repair and regeneration → replaces damaged/worn-out cells  
• Reproduction → new organisms`
        },
        position: 7,
        is_required: true,
        time_estimate_minutes: 4,
        learning_style_tags: ['reading_writing', 'visual'],
        interactive_elements: [],
        metadata: {
          key_points: [
            'Biological process',
            'Three main purposes',
            'Life processes'
          ]
        }
      },
      {
        id: 'mitosis-vs-meiosis-table',
        title: '⚖️ Mitosis vs. Meiosis',
        content_type: 'table',
        content_data: {
          table_data: {
            headers: ['Feature', 'Mitosis', 'Meiosis'],
            rows: [
              [
                'Purpose',
                'Growth, repair, asexual reproduction',
                'Sexual reproduction (gamete formation)'
              ],
              ['# of Daughter Cells', '2', '4'],
              ['Genetic Makeup', 'Identical to parent', 'Genetically unique'],
              ['Chromosome Count', 'Diploid (2n)', 'Haploid (n)']
            ],
            caption: 'Comparison of Mitosis and Meiosis',
            styling: {
              zebra_stripes: true,
              highlight_header: true,
              responsive: true
            }
          }
        },
        position: 8,
        is_required: true,
        time_estimate_minutes: 5,
        learning_style_tags: ['visual', 'reading_writing'],
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
        id: 'cell-cycle-section',
        title: '🔄 Cell Cycle',
        content_type: 'text',
        content_data: {
          text: `Interphase
• G1 → Cell grows, prepares materials
• S → DNA replication  
• G2 → Checks DNA, prepares for division

M Phase (Mitosis)
• Division of nucleus & cytoplasm`
        },
        position: 9,
        is_required: true,
        time_estimate_minutes: 4,
        learning_style_tags: ['reading_writing', 'visual'],
        interactive_elements: [],
        metadata: {
          key_points: ['Interphase stages', 'M Phase', 'DNA replication']
        }
      },
      {
        id: 'meiosis-overview',
        title: '🧬 Meiosis',
        content_type: 'text',
        content_data: {
          text: `Special type of cell division → produces gametes (sperm/egg).

📌 Meiosis I
• Prophase I: Synapsis & crossing-over (↑ genetic variation)
• Metaphase I: Homologous chromosomes align randomly
• Anaphase I: Homologous chromosomes separate
• Telophase I: 2 haploid cells form

📌 Meiosis II
• Prophase II: No DNA replication
• Metaphase II: Chromosomes line up
• Anaphase II: Sister chromatids separate
• Telophase II: 4 haploid gametes form

✨ Key Highlight: Crossing-over → ensures genetic diversity in offspring.`
        },
        position: 10,
        is_required: true,
        time_estimate_minutes: 8,
        learning_style_tags: ['reading_writing', 'visual'],
        interactive_elements: [],
        metadata: {
          difficulty: 'advanced',
          key_points: ['Two phases', 'Genetic variation', 'Crossing-over']
        }
      },
      {
        id: 'gender-differences',
        title: '👩‍🦰 Meiosis in Females vs 👨 Meiosis in Males',
        content_type: 'text',
        content_data: {
          text: `👩‍🦰 Meiosis in Females
• Produces 1 egg + polar bodies (which break down)
• Egg keeps nutrients for baby development

👨 Meiosis in Males  
• Produces 4 sperm cells (all functional)
• Each sperm: head (DNA), middle (mitochondria), tail (movement)`
        },
        position: 11,
        is_required: true,
        time_estimate_minutes: 4,
        learning_style_tags: ['reading_writing', 'visual'],
        interactive_elements: [],
        metadata: {
          key_points: [
            'Female meiosis',
            'Male meiosis',
            'Structural differences'
          ]
        }
      },
      {
        id: 'quick-check',
        title: '✅ Quick Check',
        content_type: 'quick_check',
        content_data: {
          text: `Do you feel ready to move on to the activities?
☐ Yes, let's go!
☐ Not yet, I'd like to review a bit more.`
        },
        position: 12,
        is_required: true,
        time_estimate_minutes: 2,
        learning_style_tags: ['kinesthetic'],
        interactive_elements: ['progress_tracking'],
        metadata: {
          key_points: ['Self-assessment', 'Readiness check']
        }
      },
      {
        id: 'activities-section',
        title: '🎯 Activities',
        content_type: 'activity',
        content_data: {
          activity_data: {
            title: 'Interactive Learning Activities',
            description:
              'Engage with the content through various interactive exercises',
            type: 'matching',
            instructions: [
              'Match the stages of mitosis/meiosis with their descriptions',
              'Label the cell cycle diagram correctly',
              'Complete the short quiz identifying mitosis vs meiosis purposes'
            ],
            materials_needed: [
              'Computer/tablet',
              'Interactive diagrams',
              'Quiz interface'
            ],
            expected_outcome:
              'Mastery of cell division concepts through hands-on learning',
            assessment_criteria: [
              'Correct matching of stages',
              'Accurate diagram labeling',
              'Quiz score above 80%'
            ]
          }
        },
        position: 13,
        is_required: true,
        time_estimate_minutes: 15,
        learning_style_tags: ['kinesthetic', 'visual'],
        interactive_elements: [
          'drag_and_drop',
          'simulation',
          'interactive_quizzes'
        ],
        metadata: {
          difficulty: 'intermediate',
          key_points: [
            'Hands-on learning',
            'Multiple activity types',
            'Assessment criteria'
          ]
        }
      },
      {
        id: 'post-test-section',
        title: '📝 Post-Test',
        content_type: 'assessment',
        content_data: {
          quiz_data: {
            question: 'Complete the post-test to assess your understanding',
            type: 'multiple_choice',
            options: [
              'A. Human gametes chromosome number?',
              'B. 23',
              'C. 92',
              'D. 46'
            ],
            correct_answer: 'B. 23',
            explanation:
              'Human gametes are haploid, containing 23 chromosomes (n), while somatic cells are diploid with 46 chromosomes (2n).',
            points: 10,
            feedback: {
              correct: 'Perfect! You understand that gametes are haploid.',
              incorrect:
                'Remember that gametes are haploid cells with half the chromosome number of somatic cells.'
            }
          }
        },
        position: 14,
        is_required: true,
        time_estimate_minutes: 10,
        learning_style_tags: ['kinesthetic', 'visual'],
        interactive_elements: ['interactive_quizzes'],
        metadata: {
          difficulty: 'intermediate',
          key_points: [
            'Comprehensive assessment',
            'Multiple topics',
            'Immediate feedback'
          ]
        }
      },
      {
        id: 'scoring-feedback',
        title: '🎉 Scoring & Feedback',
        content_type: 'text',
        content_data: {
          text: `10/10 → Excellent! 🎊 Congrats!
7–9/10 → Great job! 👍 Just review a bit more.
Below 7 → Don't worry, keep practicing. You'll get it! 💪`
        },
        position: 15,
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
        estimated_completion_time: 15
      },
      {
        id: 'core-content-path',
        name: 'Core Content Learning',
        description:
          'Deep dive into mitosis, meiosis, and cell cycle processes',
        modules: [],
        current_module_index: 0,
        progress_percentage: 0,
        estimated_completion_time: 25
      },
      {
        id: 'application-path',
        name: 'Application & Assessment',
        description: 'Apply knowledge through activities and assessments',
        modules: [],
        current_module_index: 0,
        progress_percentage: 0,
        estimated_completion_time: 20
      }
    ],
    prerequisites_checklist: [
      'Basic understanding of cells',
      'Knowledge of DNA structure',
      'Familiarity with biological processes'
    ],
    completion_criteria: [
      'Complete all required sections',
      'Score 80% or higher on assessments',
      'Participate in interactive activities',
      'Demonstrate understanding through post-test'
    ]
  },
  difficulty_level: 'intermediate',
  estimated_duration_minutes: 60,
  prerequisites: [
    'Basic cell biology knowledge',
    'Understanding of DNA and chromosomes',
    'Familiarity with biological processes'
  ],
  multimedia_content: {
    videos: [
      'https://example.com/cell-division-overview.mp4',
      'https://example.com/mitosis-stages.mp4',
      'https://example.com/meiosis-process.mp4'
    ],
    images: [
      'https://example.com/cell-cycle-diagram.png',
      'https://example.com/mitosis-stages.png',
      'https://example.com/meiosis-comparison.png'
    ],
    diagrams: [
      'https://example.com/interactive-cell-cycle.svg',
      'https://example.com/mitosis-meiosis-comparison.svg'
    ],
    interactive_simulations: [
      'https://example.com/cell-division-simulator',
      'https://example.com/chromosome-manipulation-lab'
    ],
    virtual_labs: [
      'https://example.com/virtual-cell-lab',
      'https://example.com/interactive-meiosis-lab'
    ]
  },
  interactive_elements: {
    drag_and_drop: true,
    visual_builder: true,
    simulation: true,
    interactive_quizzes: true,
    progress_tracking: true,
    virtual_laboratory: true,
    gamification: true
  },
  assessment_questions: [
    {
      id: 'pre-test-1',
      question: 'What is the main purpose of cell division?',
      type: 'multiple_choice',
      options: [
        'A. Produce energy',
        'B. Stop cell growth',
        'C. Create new cells for growth, repair, and reproduction',
        'D. Eliminate old cells'
      ],
      correct_answer:
        'C. Create new cells for growth, repair, and reproduction',
      points: 10
    },
    {
      id: 'pre-test-2',
      question:
        'Which type of cell division results in genetically identical daughter cells?',
      type: 'multiple_choice',
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
      id: 'post-test-1',
      question: 'Human gametes chromosome number?',
      type: 'multiple_choice',
      options: ['A. 23', 'B. 92', 'C. 46', 'D. 12'],
      correct_answer: 'A. 23',
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
      'Genetic variation'
    ],
    vocabulary: [
      'Mitosis',
      'Meiosis',
      'Gametes',
      'Haploid',
      'Diploid',
      'Crossing-over',
      'Synapsis',
      'Cytokinesis'
    ],
    real_world_applications: [
      'Understanding cancer and cell growth',
      'Reproductive biology',
      'Genetic diversity in populations',
      'Tissue regeneration and healing'
    ],
    extension_activities: [
      'Research on cancer and uncontrolled cell division',
      'Create a cell division timeline',
      'Compare mitosis in different organisms',
      'Investigate genetic disorders related to meiosis'
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
      }
    },
    accessibility_features: [
      'Screen reader compatible',
      'High contrast mode',
      'Keyboard navigation',
      'Audio descriptions',
      'Alternative text for images'
    ],
    estimated_completion_time: 60,
    difficulty_indicators: [
      'Intermediate biology concepts',
      'Visual learning required',
      'Interactive engagement needed',
      'Assessment-based learning'
    ]
  },
  // Class targeting fields
  target_class_id: '',
  target_learning_styles: [
    'visual',
    'auditory',
    'reading_writing',
    'kinesthetic'
  ],
  is_published: true,
  created_by: 'teacher-001',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z'
};

export const sampleBiologyCategory: VARKModuleCategory = {
  id: '11111111-1111-1111-1111-111111111111', // Biology category UUID from database
  name: 'Biology & Life Sciences',
  description:
    'Explore the fascinating world of living organisms, from cells to ecosystems',
  subject: 'Biology',
  grade_level: 'High School',
  learning_style: 'visual',
  icon_name: 'microscope',
  color_scheme: 'from-green-500 to-emerald-600',
  is_active: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z'
};
