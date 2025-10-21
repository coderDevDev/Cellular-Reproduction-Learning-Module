'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Headphones,
  PenTool,
  Zap,
  Type,
  Video,
  Mic,
  Play,
  Activity,
  FileText,
  CheckCircle,
  Brain,
  Table,
  BarChart3,
  Clock,
  Target,
  BookOpen,
  Sparkles,
  Code
} from 'lucide-react';
import { VARKModule, VARKModuleContentSection } from '@/types/vark-module';

// Dynamically import CKEditor to avoid SSR issues
const CKEditorContentEditor = dynamic(
  () => import('../ckeditor-content-editor'),
  { ssr: false }
);

interface ContentStructureStepProps {
  formData: Partial<VARKModule>;
  updateFormData: (updates: Partial<VARKModule>) => void;
  addContentSection: () => void;
  updateContentSection: (
    index: number,
    updates: Partial<VARKModuleContentSection>
  ) => void;
  removeContentSection: (index: number) => void;
}

const contentTypeOptions = [
  {
    value: 'text',
    label: 'Text Content',
    icon: Type,
    description: 'Rich text with formatting',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    value: 'video',
    label: 'Video',
    icon: Video,
    description: 'Video content with controls',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    value: 'audio',
    label: 'Audio',
    icon: Mic,
    description: 'Audio lessons or podcasts',
    color: 'from-teal-600 to-emerald-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    value: 'read_aloud',
    label: 'Read Aloud',
    icon: Headphones,
    description: 'Text-to-Speech with word highlighting',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    value: 'interactive',
    label: 'Interactive',
    icon: Play,
    description: 'Interactive simulations',
    color: 'from-emerald-600 to-teal-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    value: 'activity',
    label: 'Activity',
    icon: Activity,
    description: 'Hands-on learning tasks',
    color: 'from-teal-700 to-emerald-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    value: 'assessment',
    label: 'Assessment',
    icon: FileText,
    description: 'Quiz or test questions',
    color: 'from-emerald-700 to-teal-800',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    value: 'quick_check',
    label: 'Quick Check',
    icon: CheckCircle,
    description: 'Self-assessment checkpoints',
    color: 'from-teal-500 to-emerald-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    value: 'highlight',
    label: 'Highlight',
    icon: Brain,
    description: 'Key concepts and important points',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    value: 'table',
    label: 'Table',
    icon: Table,
    description: 'Data tables and structured information',
    color: 'from-teal-600 to-emerald-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    value: 'diagram',
    label: 'Diagram',
    icon: BarChart3,
    description: 'Visual diagrams and charts',
    color: 'from-emerald-600 to-teal-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  }
];

const learningStyleOptions = [
  {
    value: 'visual',
    label: 'Visual',
    icon: Eye,
    color: 'from-blue-500 to-blue-600'
  },
  {
    value: 'auditory',
    label: 'Auditory',
    icon: Headphones,
    color: 'from-green-500 to-green-600'
  },
  {
    value: 'reading_writing',
    label: 'Reading/Writing',
    icon: PenTool,
    color: 'from-purple-500 to-purple-600'
  },
  {
    value: 'kinesthetic',
    label: 'Kinesthetic',
    icon: Zap,
    color: 'from-orange-500 to-orange-600'
  }
];

export default function ContentStructureStep({
  formData,
  updateFormData,
  addContentSection,
  updateContentSection,
  removeContentSection
}: ContentStructureStepProps) {
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<
    number | null
  >(null);
  // ✅ Removed useEditorJS toggle - Editor.js is always embedded in the form
  const sections = formData.content_structure?.sections || [];

  // Filter assessment questions based on section ID
  const getFilteredAssessmentQuestions = (sectionId: string) => {
    const allQuestions = formData.assessment_questions || [];

    if (sectionId === 'pre-test-section') {
      return allQuestions.filter(q => q.id.startsWith('pre-test'));
    } else if (sectionId === 'post-test-section') {
      return allQuestions.filter(q => q.id.startsWith('post-test'));
    }

    // For other assessment sections, show all questions
    return allQuestions;
  };

  const renderContentTypeForm = (
    section: VARKModuleContentSection,
    index: number
  ) => {
    const { content_type } = section;

    switch (content_type) {
      case 'text':
        // ✅ Use CKEditor for rich text content
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-gray-700">
                Rich Content Editor (WYSIWYG)
              </Label>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Sparkles className="w-3 h-3 mr-1" />
                CKEditor Active
              </Badge>
            </div>
            <CKEditorContentEditor
              key={section.id}
              data={section.content_data?.text || ''}
              onChange={(content) => {
                console.log(`💾 Auto-saving Section ${index + 1}:`, {
                  sectionId: section.id,
                  contentLength: content.length,
                  hasContent: content.length > 0,
                  preview: content.substring(0, 100)
                });
                
                updateContentSection(index, {
                  content_data: {
                    ...section.content_data,
                    text: content
                  }
                });
              }}
              placeholder="Start writing your content... Use the toolbar to format text, add images, tables, and more!"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Content is auto-saved as you type! Use the toolbar for formatting, images, tables, and more.
            </p>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Table Caption
                </Label>
                <Input
                  placeholder="Enter table caption..."
                  value={section.content_data?.table_data?.caption || ''}
                  onChange={e =>
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        table_data: {
                          headers: section.content_data?.table_data
                            ?.headers || ['Header 1', 'Header 2'],
                          rows: section.content_data?.table_data?.rows || [
                            ['Row 1 Col 1', 'Row 1 Col 2']
                          ],
                          caption: e.target.value,
                          styling:
                            section.content_data?.table_data?.styling || {}
                        }
                      }
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Number of Columns
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="3"
                  value={section.content_data?.table_data?.headers?.length || 2}
                  onChange={e => {
                    const columnCount = parseInt(e.target.value) || 2;
                    const currentHeaders = section.content_data?.table_data
                      ?.headers || ['Header 1', 'Header 2'];
                    const currentRows = section.content_data?.table_data
                      ?.rows || [['Row 1 Col 1', 'Row 1 Col 2']];

                    // Adjust headers
                    let newHeaders = [...currentHeaders];
                    if (columnCount > currentHeaders.length) {
                      for (
                        let i = currentHeaders.length;
                        i < columnCount;
                        i++
                      ) {
                        newHeaders.push(`Header ${i + 1}`);
                      }
                    } else if (columnCount < currentHeaders.length) {
                      newHeaders = newHeaders.slice(0, columnCount);
                    }

                    // Adjust rows
                    let newRows = [...currentRows];
                    newRows = newRows.map(row => {
                      let newRow = [...row];
                      if (columnCount > row.length) {
                        for (let i = row.length; i < columnCount; i++) {
                          newRow.push(
                            `Row ${newRows.indexOf(row) + 1} Col ${i + 1}`
                          );
                        }
                      } else if (columnCount < row.length) {
                        newRow = newRow.slice(0, columnCount);
                      }
                      return newRow;
                    });

                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        table_data: {
                          headers: newHeaders,
                          rows: newRows,
                          caption:
                            section.content_data?.table_data?.caption || '',
                          styling:
                            section.content_data?.table_data?.styling || {}
                        }
                      }
                    });
                  }}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Table Headers
              </Label>
              <div className="space-y-2">
                {(
                  section.content_data?.table_data?.headers || [
                    'Header 1',
                    'Header 2'
                  ]
                ).map((header, headerIndex) => (
                  <div
                    key={headerIndex}
                    className="flex items-center space-x-2">
                    <Input
                      placeholder={`Header ${headerIndex + 1}`}
                      value={header}
                      onChange={e => {
                        const newHeaders = [
                          ...(section.content_data?.table_data?.headers || [
                            'Header 1',
                            'Header 2'
                          ])
                        ];
                        newHeaders[headerIndex] = e.target.value;
                        updateContentSection(index, {
                          content_data: {
                            ...section.content_data,
                            table_data: {
                              headers: newHeaders,
                              rows: section.content_data?.table_data?.rows || [
                                ['Row 1 Col 1', 'Row 1 Col 2']
                              ],
                              caption:
                                section.content_data?.table_data?.caption || '',
                              styling:
                                section.content_data?.table_data?.styling || {}
                            }
                          }
                        });
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newHeaders = (
                          section.content_data?.table_data?.headers || [
                            'Header 1',
                            'Header 2'
                          ]
                        ).filter((_, i) => i !== headerIndex);
                        const newRows = (
                          section.content_data?.table_data?.rows || [
                            ['Row 1 Col 1', 'Row 1 Col 2']
                          ]
                        ).map(row => row.filter((_, i) => i !== headerIndex));
                        updateContentSection(index, {
                          content_data: {
                            ...section.content_data,
                            table_data: {
                              headers: newHeaders,
                              rows: newRows,
                              caption:
                                section.content_data?.table_data?.caption || '',
                              styling:
                                section.content_data?.table_data?.styling || {}
                            }
                          }
                        });
                      }}
                      className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newHeaders = [
                      ...(section.content_data?.table_data?.headers || [
                        'Header 1',
                        'Header 2'
                      ]),
                      `Header ${
                        (
                          section.content_data?.table_data?.headers || [
                            'Header 1',
                            'Header 2'
                          ]
                        ).length + 1
                      }`
                    ];
                    const newRows = (
                      section.content_data?.table_data?.rows || [
                        ['Row 1 Col 1', 'Row 1 Col 2']
                      ]
                    ).map(row => [
                      ...row,
                      `Row ${newRows.indexOf(row) + 1} Col ${newHeaders.length}`
                    ]);
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        table_data: {
                          headers: newHeaders,
                          rows: newRows,
                          caption:
                            section.content_data?.table_data?.caption || '',
                          styling:
                            section.content_data?.table_data?.styling || {}
                        }
                      }
                    });
                  }}
                  className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Column
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Table Rows
              </Label>
              <div className="space-y-2">
                {(
                  section.content_data?.table_data?.rows || [
                    ['Row 1 Col 1', 'Row 1 Col 2']
                  ]
                ).map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center space-x-2">
                    {row.map((cell, cellIndex) => (
                      <Input
                        key={cellIndex}
                        placeholder={`Row ${rowIndex + 1} Col ${cellIndex + 1}`}
                        value={cell}
                        onChange={e => {
                          const newRows = [
                            ...(section.content_data?.table_data?.rows || [
                              ['Row 1 Col 1', 'Row 1 Col 2']
                            ])
                          ];
                          newRows[rowIndex] = [...newRows[rowIndex]];
                          newRows[rowIndex][cellIndex] = e.target.value;
                          updateContentSection(index, {
                            content_data: {
                              ...section.content_data,
                              table_data: {
                                headers: section.content_data?.table_data
                                  ?.headers || ['Header 1', 'Header 2'],
                                rows: newRows,
                                caption:
                                  section.content_data?.table_data?.caption ||
                                  '',
                                styling:
                                  section.content_data?.table_data?.styling ||
                                  {}
                              }
                            }
                          });
                        }}
                        className="flex-1"
                      />
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newRows = (
                          section.content_data?.table_data?.rows || [
                            ['Row 1 Col 1', 'Row 1 Col 2']
                          ]
                        ).filter((_, i) => i !== rowIndex);
                        updateContentSection(index, {
                          content_data: {
                            ...section.content_data,
                            table_data: {
                              headers: section.content_data?.table_data
                                ?.headers || ['Header 1', 'Header 2'],
                              rows: newRows,
                              caption:
                                section.content_data?.table_data?.caption || '',
                              styling:
                                section.content_data?.table_data?.styling || {}
                            }
                          }
                        });
                      }}
                      className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const columnCount = (
                      section.content_data?.table_data?.headers || [
                        'Header 1',
                        'Header 2'
                      ]
                    ).length;
                    const newRow = Array.from(
                      { length: columnCount },
                      (_, i) =>
                        `Row ${
                          (
                            section.content_data?.table_data?.rows || [
                              ['Row 1 Col 1', 'Row 1 Col 2']
                            ]
                          ).length + 1
                        } Col ${i + 1}`
                    );
                    const newRows = [
                      ...(section.content_data?.table_data?.rows || [
                        ['Row 1 Col 1', 'Row 1 Col 2']
                      ]),
                      newRow
                    ];
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        table_data: {
                          headers: section.content_data?.table_data
                            ?.headers || ['Header 1', 'Header 2'],
                          rows: newRows,
                          caption:
                            section.content_data?.table_data?.caption || '',
                          styling:
                            section.content_data?.table_data?.styling || {}
                        }
                      }
                    });
                  }}
                  className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Row
                </Button>
              </div>
            </div>
          </div>
        );

      case 'assessment':
        return (
          <div className="space-y-6">
            {/* Assessment Title */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Assessment Title *
              </Label>
              <Input
                placeholder="Enter assessment title (e.g., Pre-Test, Post-Test, Quiz)"
                value={section.content_data?.quiz_data?.question || ''}
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      quiz_data: {
                        ...section.content_data?.quiz_data,
                        question: e.target.value
                      }
                    }
                  })
                }
              />
              {!section.content_data?.quiz_data?.question && (
                <p className="text-sm text-red-500 mt-1">
                  Assessment title is required
                </p>
              )}
            </div>

            {/* Multiple Questions Support */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Assessment Questions
                  </Label>
                  {section.id === 'pre-test-section' && (
                    <p className="text-xs text-blue-600 mt-1">
                      📝 Pre-Test Questions (5 questions)
                    </p>
                  )}
                  {section.id === 'post-test-section' && (
                    <p className="text-xs text-green-600 mt-1">
                      📊 Post-Test Questions (10 questions)
                    </p>
                  )}
                  {section.id !== 'pre-test-section' &&
                    section.id !== 'post-test-section' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Showing all assessment questions
                      </p>
                    )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Add a new question to the assessment_questions array
                    const currentQuestions =
                      formData.assessment_questions || [];

                    // Generate ID prefix based on section
                    let idPrefix = 'question';
                    if (section.id === 'pre-test-section') {
                      idPrefix = 'pre-test';
                    } else if (section.id === 'post-test-section') {
                      idPrefix = 'post-test';
                    }

                    const newQuestion = {
                      id: `${idPrefix}-${Date.now()}`,
                      type: 'single_choice' as const,
                      question: '',
                      options: [''],
                      correct_answer: '',
                      points: 10
                    };
                    updateFormData({
                      assessment_questions: [...currentQuestions, newQuestion]
                    });
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Question
                </Button>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {getFilteredAssessmentQuestions(section.id).map(
                  (question, qIndex) => (
                    <Card key={question.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Question Header */}
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              Question {qIndex + 1}
                            </h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedQuestions = (
                                  formData.assessment_questions || []
                                ).filter((_, i) => i !== qIndex);
                                updateFormData({
                                  assessment_questions: updatedQuestions
                                });
                              }}
                              className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Question Text */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Question Text
                            </Label>
                            <Textarea
                              placeholder="Enter the question..."
                              value={question.question || ''}
                              onChange={e => {
                                const updatedQuestions = [
                                  ...(formData.assessment_questions || [])
                                ];
                                updatedQuestions[qIndex] = {
                                  ...updatedQuestions[qIndex],
                                  question: e.target.value
                                };
                                updateFormData({
                                  assessment_questions: updatedQuestions
                                });
                              }}
                              className="min-h-[80px] resize-none"
                            />
                          </div>

                          {/* Question Type */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Question Type
                            </Label>
                            <Select
                              value={question.type || 'single_choice'}
                              onValueChange={value => {
                                const updatedQuestions = [
                                  ...(formData.assessment_questions || [])
                                ];
                                updatedQuestions[qIndex] = {
                                  ...updatedQuestions[qIndex],
                                  type: value as
                                    | 'single_choice'
                                    | 'multiple_choice'
                                    | 'true_false'
                                    | 'short_answer'
                                };
                                updateFormData({
                                  assessment_questions: updatedQuestions
                                });
                              }}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single_choice">
                                  Single Choice
                                </SelectItem>
                                <SelectItem value="multiple_choice">
                                  Multiple Choice
                                </SelectItem>
                                <SelectItem value="true_false">
                                  True/False
                                </SelectItem>
                                <SelectItem value="short_answer">
                                  Short Answer
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Options for Multiple Choice */}
                          {question.type === 'single_choice' && (
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Options
                              </Label>
                              <div className="space-y-2">
                                {(question.options || ['']).map(
                                  (option, optionIndex) => (
                                    <div
                                      key={optionIndex}
                                      className="flex items-center space-x-2">
                                      <Input
                                        placeholder={`Option ${
                                          optionIndex + 1
                                        }`}
                                        value={option}
                                        onChange={e => {
                                          const updatedQuestions = [
                                            ...(formData.assessment_questions ||
                                              [])
                                          ];
                                          const newOptions = [
                                            ...(updatedQuestions[qIndex]
                                              .options || [])
                                          ];
                                          newOptions[optionIndex] =
                                            e.target.value;
                                          updatedQuestions[qIndex] = {
                                            ...updatedQuestions[qIndex],
                                            options: newOptions
                                          };
                                          updateFormData({
                                            assessment_questions:
                                              updatedQuestions
                                          });
                                        }}
                                        className="flex-1"
                                      />
                                      {(question.options || []).length > 1 && (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const updatedQuestions = [
                                              ...(formData.assessment_questions ||
                                                [])
                                            ];
                                            const newOptions = (
                                              updatedQuestions[qIndex]
                                                .options || []
                                            ).filter(
                                              (_, i) => i !== optionIndex
                                            );
                                            updatedQuestions[qIndex] = {
                                              ...updatedQuestions[qIndex],
                                              options: newOptions
                                            };
                                            updateFormData({
                                              assessment_questions:
                                                updatedQuestions
                                            });
                                          }}
                                          className="text-red-600 hover:text-red-700">
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  )
                                )}
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const updatedQuestions = [
                                      ...(formData.assessment_questions || [])
                                    ];
                                    const newOptions = [
                                      ...(updatedQuestions[qIndex].options ||
                                        []),
                                      ''
                                    ];
                                    updatedQuestions[qIndex] = {
                                      ...updatedQuestions[qIndex],
                                      options: newOptions
                                    };
                                    updateFormData({
                                      assessment_questions: updatedQuestions
                                    });
                                  }}
                                  className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Option
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Correct Answer */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Correct Answer
                            </Label>
                            <Input
                              placeholder="Enter the correct answer..."
                              value={question.correct_answer || ''}
                              onChange={e => {
                                const updatedQuestions = [
                                  ...(formData.assessment_questions || [])
                                ];
                                updatedQuestions[qIndex] = {
                                  ...updatedQuestions[qIndex],
                                  correct_answer: e.target.value
                                };
                                updateFormData({
                                  assessment_questions: updatedQuestions
                                });
                              }}
                            />
                          </div>

                          {/* Points */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Points
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="10"
                              value={question.points || ''}
                              onChange={e => {
                                const updatedQuestions = [
                                  ...(formData.assessment_questions || [])
                                ];
                                updatedQuestions[qIndex] = {
                                  ...updatedQuestions[qIndex],
                                  points: parseInt(e.target.value) || 0
                                };
                                updateFormData({
                                  assessment_questions: updatedQuestions
                                });
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}

                {getFilteredAssessmentQuestions(section.id).length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No assessment questions yet</p>
                    <p className="text-sm">
                      Click "Add Question" to get started
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Question Type and Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Question Type *
                </Label>
                <Select
                  value={
                    section.content_data?.quiz_data?.type || 'single_choice'
                  }
                  onValueChange={value => {
                    const newType = value as any;
                    let newOptions: string[] = [];
                    let newCorrectAnswer: string | string[] = '';

                    // Set appropriate defaults based on question type
                    switch (newType) {
                      case 'multiple_choice':
                        newOptions = [
                          'Option A',
                          'Option B',
                          'Option C',
                          'Option D'
                        ];
                        newCorrectAnswer = 'Option A';
                        break;
                      case 'true_false':
                        newOptions = ['True', 'False'];
                        newCorrectAnswer = 'True';
                        break;
                      case 'matching':
                        newOptions = [
                          'Match A',
                          'Match B',
                          'Match C',
                          'Match D'
                        ];
                        newCorrectAnswer = [
                          'Match A',
                          'Match B',
                          'Match C',
                          'Match D'
                        ];
                        break;
                      case 'short_answer':
                        newOptions = [];
                        newCorrectAnswer = '';
                        break;
                      case 'interactive':
                        newOptions = ['Interactive Element'];
                        newCorrectAnswer = 'Interactive Element';
                        break;
                    }

                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        quiz_data: {
                          ...section.content_data?.quiz_data,
                          type: newType,
                          options: newOptions,
                          correct_answer: newCorrectAnswer
                        }
                      }
                    });
                  }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_choice">Single Choice</SelectItem>
                    <SelectItem value="multiple_choice">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="matching">Matching</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Points *
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="1"
                  value={section.content_data?.quiz_data?.points || 1}
                  onChange={e => {
                    const points = Math.max(
                      1,
                      Math.min(100, parseInt(e.target.value) || 1)
                    );
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        quiz_data: {
                          ...section.content_data?.quiz_data,
                          points
                        }
                      }
                    });
                  }}
                />
              </div>
            </div>

            {/* Options Section - Dynamic based on question type */}
            {(section.content_data?.quiz_data?.type === 'single_choice' ||
              section.content_data?.quiz_data?.type === 'multiple_choice' ||
              section.content_data?.quiz_data?.type === 'matching') && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Options *
                </Label>
                <div className="space-y-2">
                  {(section.content_data?.quiz_data?.options || []).map(
                    (option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center space-x-2">
                        <Input
                          placeholder={`Option ${String.fromCharCode(
                            65 + optionIndex
                          )}`}
                          value={option}
                          onChange={e => {
                            const newOptions = [
                              ...(section.content_data?.quiz_data?.options ||
                                [])
                            ];
                            newOptions[optionIndex] = e.target.value;
                            updateContentSection(index, {
                              content_data: {
                                ...section.content_data,
                                quiz_data: {
                                  ...section.content_data?.quiz_data,
                                  options: newOptions
                                }
                              }
                            });
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newOptions = (
                              section.content_data?.quiz_data?.options || []
                            ).filter((_, i) => i !== optionIndex);
                            updateContentSection(index, {
                              content_data: {
                                ...section.content_data,
                                quiz_data: {
                                  ...section.content_data?.quiz_data,
                                  options: newOptions
                                }
                              }
                            });
                          }}
                          disabled={
                            (section.content_data?.quiz_data?.options || [])
                              .length <= 2
                          }>
                          Remove
                        </Button>
                      </div>
                    )
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = [
                        ...(section.content_data?.quiz_data?.options || []),
                        `Option ${String.fromCharCode(
                          65 +
                            (section.content_data?.quiz_data?.options || [])
                              .length
                        )}`
                      ];
                      updateContentSection(index, {
                        content_data: {
                          ...section.content_data,
                          quiz_data: {
                            ...section.content_data?.quiz_data,
                            options: newOptions
                          }
                        }
                      });
                    }}>
                    Add Option
                  </Button>
                </div>
                {(section.content_data?.quiz_data?.options || []).length <
                  2 && (
                  <p className="text-sm text-red-500 mt-1">
                    At least 2 options are required
                  </p>
                )}
              </div>
            )}

            {/* Correct Answer Section - Dynamic based on question type */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Correct Answer *
              </Label>

              {section.content_data?.quiz_data?.type === 'single_choice' && (
                <Select
                  value={
                    (section.content_data?.quiz_data
                      ?.correct_answer as string) || ''
                  }
                  onValueChange={value =>
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        quiz_data: {
                          ...section.content_data?.quiz_data,
                          correct_answer: value
                        }
                      }
                    })
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(section.content_data?.quiz_data?.options || []).map(
                      (option, optionIndex) => (
                        <SelectItem key={optionIndex} value={option}>
                          {option}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}

              {section.content_data?.quiz_data?.type === 'true_false' && (
                <Select
                  value={
                    (section.content_data?.quiz_data
                      ?.correct_answer as string) || ''
                  }
                  onValueChange={value =>
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        quiz_data: {
                          ...section.content_data?.quiz_data,
                          correct_answer: value
                        }
                      }
                    })
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="True">True</SelectItem>
                    <SelectItem value="False">False</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {section.content_data?.quiz_data?.type === 'matching' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Drag and drop the options in the correct order:
                  </p>
                  {(section.content_data?.quiz_data?.options || []).map(
                    (option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center space-x-2">
                        <span className="text-sm font-medium w-8">
                          {optionIndex + 1}.
                        </span>
                        <Input
                          value={option}
                          onChange={e => {
                            const newOptions = [
                              ...(section.content_data?.quiz_data?.options ||
                                [])
                            ];
                            newOptions[optionIndex] = e.target.value;
                            updateContentSection(index, {
                              content_data: {
                                ...section.content_data,
                                quiz_data: {
                                  ...section.content_data?.quiz_data,
                                  options: newOptions
                                }
                              }
                            });
                          }}
                        />
                      </div>
                    )
                  )}
                  <p className="text-sm text-gray-500">
                    The order shown above is the correct answer sequence
                  </p>
                </div>
              )}

              {section.content_data?.quiz_data?.type === 'short_answer' && (
                <div className="space-y-2">
                  <Input
                    placeholder="Enter the correct answer..."
                    value={
                      (section.content_data?.quiz_data
                        ?.correct_answer as string) || ''
                    }
                    onChange={e =>
                      updateContentSection(index, {
                        content_data: {
                          ...section.content_data,
                          quiz_data: {
                            ...section.content_data?.quiz_data,
                            correct_answer: e.target.value
                          }
                        }
                      })
                    }
                  />
                  <p className="text-sm text-gray-500">
                    You can also add multiple acceptable answers separated by
                    commas
                  </p>
                </div>
              )}

              {section.content_data?.quiz_data?.type === 'interactive' && (
                <div className="space-y-2">
                  <Input
                    placeholder="Describe the expected interaction..."
                    value={
                      (section.content_data?.quiz_data
                        ?.correct_answer as string) || ''
                    }
                    onChange={e =>
                      updateContentSection(index, {
                        content_data: {
                          ...section.content_data,
                          quiz_data: {
                            ...section.content_data?.quiz_data,
                            correct_answer: e.target.value
                          }
                        }
                      })
                    }
                  />
                  <p className="text-sm text-gray-500">
                    Describe what the student should do to complete this
                    interactive element
                  </p>
                </div>
              )}

              {!section.content_data?.quiz_data?.correct_answer && (
                <p className="text-sm text-red-500 mt-1">
                  Correct answer is required
                </p>
              )}
            </div>

            {/* Additional Assessment Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Time Limit (seconds)
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0 (no limit)"
                  value={
                    section.content_data?.quiz_data?.time_limit_seconds || 0
                  }
                  onChange={e => {
                    const timeLimit = Math.max(
                      0,
                      parseInt(e.target.value) || 0
                    );
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        quiz_data: {
                          ...section.content_data?.quiz_data,
                          time_limit_seconds: timeLimit
                        }
                      }
                    });
                  }}
                />
                <p className="text-sm text-gray-500 mt-1">0 = no time limit</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Hints
                </Label>
                <div className="space-y-2">
                  {(section.content_data?.quiz_data?.hints || []).map(
                    (hint, hintIndex) => (
                      <div
                        key={hintIndex}
                        className="flex items-center space-x-2">
                        <Input
                          placeholder={`Hint ${hintIndex + 1}`}
                          value={hint}
                          onChange={e => {
                            const newHints = [
                              ...(section.content_data?.quiz_data?.hints || [])
                            ];
                            newHints[hintIndex] = e.target.value;
                            updateContentSection(index, {
                              content_data: {
                                ...section.content_data,
                                quiz_data: {
                                  ...section.content_data?.quiz_data,
                                  hints: newHints
                                }
                              }
                            });
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newHints = (
                              section.content_data?.quiz_data?.hints || []
                            ).filter((_, i) => i !== hintIndex);
                            updateContentSection(index, {
                              content_data: {
                                ...section.content_data,
                                quiz_data: {
                                  ...section.content_data?.quiz_data,
                                  hints: newHints
                                }
                              }
                            });
                          }}>
                          Remove
                        </Button>
                      </div>
                    )
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newHints = [
                        ...(section.content_data?.quiz_data?.hints || []),
                        ''
                      ];
                      updateContentSection(index, {
                        content_data: {
                          ...section.content_data,
                          quiz_data: {
                            ...section.content_data?.quiz_data,
                            hints: newHints
                          }
                        }
                      });
                    }}>
                    Add Hint
                  </Button>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Explanation
              </Label>
              <Textarea
                placeholder="Explain why this answer is correct..."
                value={section.content_data?.quiz_data?.explanation || ''}
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      quiz_data: {
                        ...section.content_data?.quiz_data,
                        explanation: e.target.value
                      }
                    }
                  })
                }
                className="min-h-[80px] resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                This will be shown to students after they complete the
                assessment
              </p>
            </div>

            {/* Feedback Messages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Correct Answer Feedback
                </Label>
                <Input
                  placeholder="Correct! Well done!"
                  value={
                    section.content_data?.quiz_data?.feedback?.correct || ''
                  }
                  onChange={e =>
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        quiz_data: {
                          ...section.content_data?.quiz_data,
                          feedback: {
                            ...section.content_data?.quiz_data?.feedback,
                            correct: e.target.value
                          }
                        }
                      }
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Incorrect Answer Feedback
                </Label>
                <Input
                  placeholder="Incorrect. Try again!"
                  value={
                    section.content_data?.quiz_data?.feedback?.incorrect || ''
                  }
                  onChange={e =>
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        quiz_data: {
                          ...section.content_data?.quiz_data,
                          feedback: {
                            ...section.content_data?.quiz_data?.feedback,
                            incorrect: e.target.value
                          }
                        }
                      }
                    })
                  }
                />
              </div>
            </div>

            {/* Validation Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Assessment Validation
              </h4>
              <div className="space-y-1 text-sm">
                <div
                  className={`flex items-center space-x-2 ${
                    section.content_data?.quiz_data?.question
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Question:{' '}
                    {section.content_data?.quiz_data?.question
                      ? '✓'
                      : '✗ Required'}
                  </span>
                </div>
                <div
                  className={`flex items-center space-x-2 ${
                    section.content_data?.quiz_data?.correct_answer
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Correct Answer:{' '}
                    {section.content_data?.quiz_data?.correct_answer
                      ? '✓'
                      : '✗ Required'}
                  </span>
                </div>
                {(section.content_data?.quiz_data?.type === 'single_choice' ||
                  section.content_data?.quiz_data?.type === 'multiple_choice' ||
                  section.content_data?.quiz_data?.type === 'matching') && (
                  <div
                    className={`flex items-center space-x-2 ${
                      (section.content_data?.quiz_data?.options || []).length >=
                      2
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      Options:{' '}
                      {(section.content_data?.quiz_data?.options || [])
                        .length >= 2
                        ? '✓'
                        : '✗ At least 2 required'}
                    </span>
                  </div>
                )}
                <div className="text-green-600 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Points: {section.content_data?.quiz_data?.points || 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-6">
            {/* Activity Title */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Activity Title *
              </Label>
              <Input
                placeholder="Enter activity title..."
                value={section.content_data?.activity_data?.title || ''}
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      activity_data: {
                        ...section.content_data?.activity_data,
                        title: e.target.value
                      }
                    }
                  })
                }
              />
              {!section.content_data?.activity_data?.title && (
                <p className="text-sm text-red-500 mt-1">
                  Activity title is required
                </p>
              )}
            </div>

            {/* Activity Description */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Activity Description
              </Label>
              <Textarea
                placeholder="Describe the activity..."
                value={section.content_data?.activity_data?.description || ''}
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      activity_data: {
                        ...section.content_data?.activity_data,
                        description: e.target.value
                      }
                    }
                  })
                }
              />
            </div>

            {/* Activity Type */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Activity Type *
              </Label>
              <Select
                value={
                  section.content_data?.activity_data?.type || 'discussion'
                }
                onValueChange={value =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      activity_data: {
                        ...section.content_data?.activity_data,
                        type: value as any
                      }
                    }
                  })
                }>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discussion">Fill-in-the-Blanks</SelectItem>
                  <SelectItem value="matching">Matching</SelectItem>
                  <SelectItem value="labeling">Labeling</SelectItem>
                  <SelectItem value="drag_drop">Drag & Drop</SelectItem>
                  <SelectItem value="simulation">Simulation</SelectItem>
                  <SelectItem value="experiment">Experiment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fill-in-the-Blanks Activity */}
            {section.content_data?.activity_data?.type === 'discussion' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Type className="w-4 h-4 mr-2" />
                    Fill-in-the-Blanks Activity
                  </h4>
                  <p className="text-sm text-blue-700">
                    Create interactive fill-in-the-blank questions with a word
                    bank
                  </p>
                </div>

                {/* Word Bank */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Word Bank
                  </Label>
                  <div className="space-y-2">
                    {(
                      section.content_data?.activity_data?.word_bank || ['']
                    ).map((word, wordIndex) => (
                      <div
                        key={wordIndex}
                        className="flex items-center space-x-2">
                        <Input
                          placeholder={`Word ${wordIndex + 1}`}
                          value={word}
                          onChange={e => {
                            const currentWordBank = section.content_data
                              ?.activity_data?.word_bank || [''];
                            const newWordBank = [...currentWordBank];
                            newWordBank[wordIndex] = e.target.value;
                            updateContentSection(index, {
                              content_data: {
                                ...section.content_data,
                                activity_data: {
                                  ...section.content_data?.activity_data,
                                  word_bank: newWordBank
                                }
                              }
                            });
                          }}
                          className="flex-1"
                        />
                        {(section.content_data?.activity_data?.word_bank || [])
                          .length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentWordBank = section.content_data
                                ?.activity_data?.word_bank || [''];
                              const newWordBank = currentWordBank.filter(
                                (_, i) => i !== wordIndex
                              );
                              updateContentSection(index, {
                                content_data: {
                                  ...section.content_data,
                                  activity_data: {
                                    ...section.content_data?.activity_data,
                                    word_bank: newWordBank
                                  }
                                }
                              });
                            }}
                            className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const currentWordBank = section.content_data
                          ?.activity_data?.word_bank || [''];
                        updateContentSection(index, {
                          content_data: {
                            ...section.content_data,
                            activity_data: {
                              ...section.content_data?.activity_data,
                              word_bank: [...currentWordBank, '']
                            }
                          }
                        });
                      }}
                      className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Word to Bank
                    </Button>
                  </div>
                </div>

                {/* Fill-in-the-Blank Questions */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Fill-in-the-Blank Questions
                  </Label>
                  <div className="space-y-3">
                    {(
                      section.content_data?.activity_data?.questions || ['']
                    ).map((question, qIndex) => (
                      <div key={qIndex} className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600 w-8">
                          {qIndex + 1}.
                        </span>
                        <Input
                          placeholder="Enter question with blanks (use _____ for blanks)"
                          value={question}
                          onChange={e => {
                            const currentQuestions = section.content_data
                              ?.activity_data?.questions || [''];
                            const newQuestions = [...currentQuestions];
                            newQuestions[qIndex] = e.target.value;
                            updateContentSection(index, {
                              content_data: {
                                ...section.content_data,
                                activity_data: {
                                  ...section.content_data?.activity_data,
                                  questions: newQuestions
                                }
                              }
                            });
                          }}
                          className="flex-1"
                        />
                        {(section.content_data?.activity_data?.questions || [])
                          .length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentQuestions = section.content_data
                                ?.activity_data?.questions || [''];
                              const newQuestions = currentQuestions.filter(
                                (_, i) => i !== qIndex
                              );
                              updateContentSection(index, {
                                content_data: {
                                  ...section.content_data,
                                  activity_data: {
                                    ...section.content_data?.activity_data,
                                    questions: newQuestions
                                  }
                                }
                              });
                            }}
                            className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const currentQuestions = section.content_data
                          ?.activity_data?.questions || [''];
                        updateContentSection(index, {
                          content_data: {
                            ...section.content_data,
                            activity_data: {
                              ...section.content_data?.activity_data,
                              questions: [...currentQuestions, '']
                            }
                          }
                        });
                      }}
                      className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Matching Activity */}
            {section.content_data?.activity_data?.type === 'matching' && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <Table className="w-4 h-4 mr-2" />
                    Matching Activity
                  </h4>
                  <p className="text-sm text-green-700">
                    Create matching pairs between descriptions and terms
                  </p>
                </div>

                {/* Matching Pairs */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Matching Pairs
                  </Label>
                  <div className="space-y-3">
                    {(
                      section.content_data?.activity_data?.matching_pairs || [
                        { description: '', term: '' }
                      ]
                    ).map((pair, pairIndex) => (
                      <Card key={pairIndex} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Column A (Description)
                              </Label>
                              <Textarea
                                placeholder="Enter description..."
                                value={pair.description || ''}
                                onChange={e => {
                                  const currentPairs = section.content_data
                                    ?.activity_data?.matching_pairs || [
                                    { description: '', term: '' }
                                  ];
                                  const newPairs = [...currentPairs];
                                  newPairs[pairIndex] = {
                                    ...newPairs[pairIndex],
                                    description: e.target.value
                                  };
                                  updateContentSection(index, {
                                    content_data: {
                                      ...section.content_data,
                                      activity_data: {
                                        ...section.content_data?.activity_data,
                                        matching_pairs: newPairs
                                      }
                                    }
                                  });
                                }}
                                className="min-h-[80px] resize-none"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Column B (Term)
                              </Label>
                              <Input
                                placeholder="Enter term..."
                                value={pair.term || ''}
                                onChange={e => {
                                  const currentPairs = section.content_data
                                    ?.activity_data?.matching_pairs || [
                                    { description: '', term: '' }
                                  ];
                                  const newPairs = [...currentPairs];
                                  newPairs[pairIndex] = {
                                    ...newPairs[pairIndex],
                                    term: e.target.value
                                  };
                                  updateContentSection(index, {
                                    content_data: {
                                      ...section.content_data,
                                      activity_data: {
                                        ...section.content_data?.activity_data,
                                        matching_pairs: newPairs
                                      }
                                    }
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end mt-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentPairs = section.content_data
                                  ?.activity_data?.matching_pairs || [
                                  { description: '', term: '' }
                                ];
                                const newPairs = currentPairs.filter(
                                  (_, i) => i !== pairIndex
                                );
                                updateContentSection(index, {
                                  content_data: {
                                    ...section.content_data,
                                    activity_data: {
                                      ...section.content_data?.activity_data,
                                      matching_pairs: newPairs
                                    }
                                  }
                                });
                              }}
                              className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove Pair
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const currentPairs = section.content_data?.activity_data
                          ?.matching_pairs || [{ description: '', term: '' }];
                        updateContentSection(index, {
                          content_data: {
                            ...section.content_data,
                            activity_data: {
                              ...section.content_data?.activity_data,
                              matching_pairs: [
                                ...currentPairs,
                                { description: '', term: '' }
                              ]
                            }
                          }
                        });
                      }}
                      className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Matching Pair
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* General Instructions */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Instructions
              </Label>
              <Textarea
                placeholder="Enter step-by-step instructions..."
                value={
                  section.content_data?.activity_data?.instructions?.join(
                    '\n'
                  ) || ''
                }
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      activity_data: {
                        ...section.content_data?.activity_data,
                        instructions: e.target.value
                          .split('\n')
                          .filter(line => line.trim())
                      }
                    }
                  })
                }
              />
            </div>

            {/* Expected Outcome */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Expected Outcome
              </Label>
              <Input
                placeholder="What should students achieve?"
                value={
                  section.content_data?.activity_data?.expected_outcome || ''
                }
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      activity_data: {
                        ...section.content_data?.activity_data,
                        expected_outcome: e.target.value
                      }
                    }
                  })
                }
              />
            </div>

            {/* Assessment Criteria */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Assessment Criteria
              </Label>
              <div className="space-y-2">
                {(
                  section.content_data?.activity_data?.assessment_criteria || [
                    ''
                  ]
                ).map((criteria, criteriaIndex) => (
                  <div
                    key={criteriaIndex}
                    className="flex items-center space-x-2">
                    <Input
                      placeholder={`Criteria ${criteriaIndex + 1}`}
                      value={criteria}
                      onChange={e => {
                        const currentCriteria = section.content_data
                          ?.activity_data?.assessment_criteria || [''];
                        const newCriteria = [...currentCriteria];
                        newCriteria[criteriaIndex] = e.target.value;
                        updateContentSection(index, {
                          content_data: {
                            ...section.content_data,
                            activity_data: {
                              ...section.content_data?.activity_data,
                              assessment_criteria: newCriteria
                            }
                          }
                        });
                      }}
                      className="flex-1"
                    />
                    {(
                      section.content_data?.activity_data
                        ?.assessment_criteria || []
                    ).length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentCriteria = section.content_data
                            ?.activity_data?.assessment_criteria || [''];
                          const newCriteria = currentCriteria.filter(
                            (_, i) => i !== criteriaIndex
                          );
                          updateContentSection(index, {
                            content_data: {
                              ...section.content_data,
                              activity_data: {
                                ...section.content_data?.activity_data,
                                assessment_criteria: newCriteria
                              }
                            }
                          });
                        }}
                        className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentCriteria = section.content_data?.activity_data
                      ?.assessment_criteria || [''];
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        activity_data: {
                          ...section.content_data?.activity_data,
                          assessment_criteria: [...currentCriteria, '']
                        }
                      }
                    });
                  }}
                  className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Assessment Criteria
                </Button>
              </div>
            </div>
          </div>
        );

      case 'quick_check':
        return (
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              Quick Check Text
            </Label>
            <Textarea
              placeholder="Enter the quick check question or prompt..."
              value={section.content_data?.text || ''}
              onChange={e =>
                updateContentSection(index, {
                  content_data: {
                    ...section.content_data,
                    text: e.target.value
                  }
                })
              }
              className="min-h-[100px] resize-none"
            />
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Video Title
                </Label>
                <Input
                  placeholder="Enter video title..."
                  value={section.content_data?.video_data?.title || ''}
                  onChange={e =>
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        video_data: {
                          ...section.content_data?.video_data,
                          title: e.target.value
                        }
                      }
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Video Duration (seconds)
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="120"
                  value={section.content_data?.video_data?.duration || ''}
                  onChange={e =>
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        video_data: {
                          ...section.content_data?.video_data,
                          duration: parseInt(e.target.value) || 0
                        }
                      }
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Video URL or Embed Code
              </Label>
              <Input
                placeholder="https://youtube.com/watch?v=... or embed code"
                value={section.content_data?.video_data?.url || ''}
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      video_data: {
                        ...section.content_data?.video_data,
                        url: e.target.value
                      }
                    }
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Video Description
              </Label>
              <Textarea
                placeholder="Describe what this video covers..."
                value={section.content_data?.video_data?.description || ''}
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      video_data: {
                        ...section.content_data?.video_data,
                        description: e.target.value
                      }
                    }
                  })
                }
                className="min-h-[100px] resize-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`autoplay-${index}`}
                checked={section.content_data?.video_data?.autoplay || false}
                onCheckedChange={checked =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      video_data: {
                        ...section.content_data?.video_data,
                        autoplay: checked as boolean
                      }
                    }
                  })
                }
              />
              <Label htmlFor={`autoplay-${index}`} className="text-sm">
                Autoplay video
              </Label>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Audio Title
                </Label>
                <Input
                  placeholder="Enter audio title..."
                  value={section.content_data?.audio_data?.title || ''}
                  onChange={e =>
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        audio_data: {
                          ...section.content_data?.audio_data,
                          title: e.target.value
                        }
                      }
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Audio Duration (seconds)
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="180"
                  value={section.content_data?.audio_data?.duration || ''}
                  onChange={e =>
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        audio_data: {
                          ...section.content_data?.audio_data,
                          duration: parseInt(e.target.value) || 0
                        }
                      }
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Audio File URL
              </Label>
              <Input
                placeholder="https://example.com/audio.mp3"
                value={section.content_data?.audio_data?.url || ''}
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      audio_data: {
                        ...section.content_data?.audio_data,
                        url: e.target.value
                      }
                    }
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Audio Transcript
              </Label>
              <Textarea
                placeholder="Provide a transcript of the audio content..."
                value={section.content_data?.audio_data?.transcript || ''}
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      audio_data: {
                        ...section.content_data?.audio_data,
                        transcript: e.target.value
                      }
                    }
                  })
                }
                className="min-h-[100px] resize-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`show-transcript-${index}`}
                checked={
                  section.content_data?.audio_data?.show_transcript || false
                }
                onCheckedChange={checked =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      audio_data: {
                        ...section.content_data?.audio_data,
                        show_transcript: checked as boolean
                      }
                    }
                  })
                }
              />
              <Label htmlFor={`show-transcript-${index}`} className="text-sm">
                Show transcript to students
              </Label>
            </div>
          </div>
        );

      case 'interactive':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Interactive Title
                </Label>
                <Input
                  placeholder="Enter interactive title..."
                  value={section.content_data?.interactive_data?.title || ''}
                  onChange={e =>
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        interactive_data: {
                          ...section.content_data?.interactive_data,
                          title: e.target.value
                        }
                      }
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Interactive Type
                </Label>
                <Select
                  value={
                    section.content_data?.interactive_data?.type || 'simulation'
                  }
                  onValueChange={value =>
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        interactive_data: {
                          ...section.content_data?.interactive_data,
                          type: value
                        }
                      }
                    })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simulation">Simulation</SelectItem>
                    <SelectItem value="game">Educational Game</SelectItem>
                    <SelectItem value="virtual_lab">
                      Virtual Laboratory
                    </SelectItem>
                    <SelectItem value="interactive_diagram">
                      Interactive Diagram
                    </SelectItem>
                    <SelectItem value="quiz">Interactive Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Interactive URL or Embed Code
              </Label>
              <Input
                placeholder="https://example.com/interactive or embed code"
                value={section.content_data?.interactive_data?.url || ''}
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      interactive_data: {
                        ...section.content_data?.interactive_data,
                        url: e.target.value
                      }
                    }
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Instructions
              </Label>
              <Textarea
                placeholder="Provide instructions for using this interactive element..."
                value={
                  section.content_data?.interactive_data?.instructions || ''
                }
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      interactive_data: {
                        ...section.content_data?.interactive_data,
                        instructions: e.target.value
                      }
                    }
                  })
                }
                className="min-h-[100px] resize-none"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Learning Objectives
              </Label>
              <Textarea
                placeholder="What should students learn from this interactive experience?"
                value={
                  section.content_data?.interactive_data?.learning_objectives ||
                  ''
                }
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      interactive_data: {
                        ...section.content_data?.interactive_data,
                        learning_objectives: e.target.value
                      }
                    }
                  })
                }
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        );

      case 'highlight':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Highlight Title
              </Label>
              <Input
                placeholder="Enter highlight title..."
                value={section.content_data?.highlight_data?.title || ''}
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      highlight_data: {
                        ...section.content_data?.highlight_data,
                        title: e.target.value
                      }
                    }
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Key Concept
              </Label>
              <Textarea
                placeholder="Enter the key concept or important point to highlight..."
                value={section.content_data?.highlight_data?.concept || ''}
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      highlight_data: {
                        ...section.content_data?.highlight_data,
                        concept: e.target.value
                      }
                    }
                  })
                }
                className="min-h-[100px] resize-none"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Explanation
              </Label>
              <Textarea
                placeholder="Provide a detailed explanation of this concept..."
                value={section.content_data?.highlight_data?.explanation || ''}
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      highlight_data: {
                        ...section.content_data?.highlight_data,
                        explanation: e.target.value
                      }
                    }
                  })
                }
                className="min-h-[100px] resize-none"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Examples (one per line)
              </Label>
              <Textarea
                placeholder="Example 1&#10;Example 2&#10;Example 3"
                value={
                  section.content_data?.highlight_data?.examples?.join('\n') ||
                  ''
                }
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      highlight_data: {
                        ...section.content_data?.highlight_data,
                        examples: e.target.value.split('\n').filter(Boolean)
                      }
                    }
                  })
                }
                className="min-h-[100px] resize-none"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Highlight Style
              </Label>
              <Select
                value={section.content_data?.highlight_data?.style || 'info'}
                onValueChange={value =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      highlight_data: {
                        ...section.content_data?.highlight_data,
                        style: value
                      }
                    }
                  })
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="warning">Warning/Important</SelectItem>
                  <SelectItem value="success">Success/Tip</SelectItem>
                  <SelectItem value="error">Error/Common Mistake</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'diagram':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Diagram Title
                </Label>
                <Input
                  placeholder="Enter diagram title..."
                  value={section.content_data?.diagram_data?.title || ''}
                  onChange={e =>
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        diagram_data: {
                          ...section.content_data?.diagram_data,
                          title: e.target.value
                        }
                      }
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Diagram Type
                </Label>
                <Select
                  value={
                    section.content_data?.diagram_data?.type || 'flowchart'
                  }
                  onValueChange={value =>
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        diagram_data: {
                          ...section.content_data?.diagram_data,
                          type: value
                        }
                      }
                    })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flowchart">Flowchart</SelectItem>
                    <SelectItem value="mind_map">Mind Map</SelectItem>
                    <SelectItem value="venn_diagram">Venn Diagram</SelectItem>
                    <SelectItem value="timeline">Timeline</SelectItem>
                    <SelectItem value="hierarchy">Hierarchy Chart</SelectItem>
                    <SelectItem value="process">Process Diagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Diagram Image URL
              </Label>
              <Input
                placeholder="https://example.com/diagram.png or upload path"
                value={section.content_data?.diagram_data?.image_url || ''}
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      diagram_data: {
                        ...section.content_data?.diagram_data,
                        image_url: e.target.value
                      }
                    }
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Diagram Description
              </Label>
              <Textarea
                placeholder="Describe what this diagram shows and how to interpret it..."
                value={section.content_data?.diagram_data?.description || ''}
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      diagram_data: {
                        ...section.content_data?.diagram_data,
                        description: e.target.value
                      }
                    }
                  })
                }
                className="min-h-[100px] resize-none"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Key Elements (one per line)
              </Label>
              <Textarea
                placeholder="Element 1: Description&#10;Element 2: Description&#10;Element 3: Description"
                value={
                  section.content_data?.diagram_data?.key_elements?.join(
                    '\n'
                  ) || ''
                }
                onChange={e =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      diagram_data: {
                        ...section.content_data?.diagram_data,
                        key_elements: e.target.value.split('\n').filter(Boolean)
                      }
                    }
                  })
                }
                className="min-h-[100px] resize-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`interactive-diagram-${index}`}
                checked={
                  section.content_data?.diagram_data?.is_interactive || false
                }
                onCheckedChange={checked =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      diagram_data: {
                        ...section.content_data?.diagram_data,
                        is_interactive: checked as boolean
                      }
                    }
                  })
                }
              />
              <Label
                htmlFor={`interactive-diagram-${index}`}
                className="text-sm">
                Make diagram interactive (clickable elements)
              </Label>
            </div>
          </div>
        );

      case 'read_aloud':
        return (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor={`read-aloud-title-${index}`}>Title *</Label>
              <Input
                id={`read-aloud-title-${index}`}
                value={section.content_data?.read_aloud_data?.title || ''}
                onChange={(e) =>
                  updateContentSection(index, {
                    content_data: {
                      ...section.content_data,
                      read_aloud_data: {
                        ...section.content_data?.read_aloud_data,
                        title: e.target.value,
                        content: section.content_data?.read_aloud_data?.content || ''
                      }
                    }
                  })
                }
                placeholder="e.g., Introduction to Cell Division"
              />
            </div>

            {/* Content Editor */}
            <div>
              <Label>Content to Read Aloud *</Label>
              <div className="mt-2">
                <CKEditorContentEditor
                  data={section.content_data?.read_aloud_data?.content || ''}
                  onChange={(data) =>
                    updateContentSection(index, {
                      content_data: {
                        ...section.content_data,
                        read_aloud_data: {
                          ...section.content_data?.read_aloud_data,
                          title: section.content_data?.read_aloud_data?.title || '',
                          content: data
                        }
                      }
                    })
                  }
                  placeholder="Enter content for text-to-speech..."
                />
              </div>
            </div>

            {/* Info Badge */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Headphones className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <h5 className="font-medium text-purple-900 mb-1">Read-Aloud with Highlighting</h5>
                  <p className="text-sm text-purple-700">
                    Content will be read aloud with synchronized word highlighting using Text-to-Speech.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md aspect-video bg-gray-200 rounded-lg mb-2">
              {section.content_data?.audio_data?.url ? (
                <audio
                  src={section.content_data.audio_data.url}
                  controls
                  className="w-full h-full rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No audio URL provided.
                </div>
              )}
            </div>
            <p className="text-sm text-gray-700">
              {section.content_data?.audio_data?.title || 'Audio Preview'}
            </p>
            <p className="text-xs text-gray-500">
              {section.content_data?.audio_data?.duration || 0} seconds
            </p>
          </div>
        );
      case 'interactive':
        return (
          <div className="prose dark:prose-invert">
            <p>
              {section.content_data?.interactive_data?.instructions ||
                'No interactive instructions provided.'}
            </p>
          </div>
        );
      case 'assessment':
        return (
          <div className="prose dark:prose-invert">
            <p>
              {section.content_data?.quiz_data?.question ||
                'No assessment question provided.'}
            </p>
            <p className="text-sm text-gray-700 mt-2">
              Options:{' '}
              {section.content_data?.quiz_data?.options?.join(', ') || 'None'}
            </p>
            <p className="text-sm text-gray-700">
              Correct Answer:{' '}
              {section.content_data?.quiz_data?.correct_answer || 'N/A'}
            </p>
            <p className="text-sm text-gray-700">
              Explanation:{' '}
              {section.content_data?.quiz_data?.explanation || 'N/A'}
            </p>
          </div>
        );
      case 'activity':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900 text-lg mb-2 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                {section.content_data?.activity_data?.title ||
                  'Activity Preview'}
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                {section.content_data?.activity_data?.description ||
                  'No activity description provided.'}
              </p>

              {/* Activity Type Badge */}
              <div className="mb-3">
                <Badge className="bg-blue-100 text-blue-800">
                  {section.content_data?.activity_data?.type === 'discussion'
                    ? 'Fill-in-the-Blanks'
                    : section.content_data?.activity_data?.type === 'matching'
                    ? 'Matching Activity'
                    : section.content_data?.activity_data?.type || 'Activity'}
                </Badge>
              </div>

              {/* Fill-in-the-Blanks Preview */}
              {section.content_data?.activity_data?.type === 'discussion' && (
                <div className="space-y-3">
                  {/* Word Bank Preview */}
                  {section.content_data?.activity_data?.word_bank &&
                    section.content_data.activity_data.word_bank.length > 0 && (
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-2">
                          Word Bank:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {section.content_data.activity_data.word_bank.map(
                            (word, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-white text-blue-700">
                                {word}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Questions Preview */}
                  {section.content_data?.activity_data?.questions &&
                    section.content_data.activity_data.questions.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-800">
                          Questions:
                        </h5>
                        {section.content_data.activity_data.questions
                          .slice(0, 3)
                          .map((question, index) => (
                            <p key={index} className="text-sm text-gray-700">
                              {index + 1}. {question}
                            </p>
                          ))}
                        {section.content_data.activity_data.questions.length >
                          3 && (
                          <p className="text-xs text-gray-500">
                            ... and{' '}
                            {section.content_data.activity_data.questions
                              .length - 3}{' '}
                            more questions
                          </p>
                        )}
                      </div>
                    )}
                </div>
              )}

              {/* Matching Activity Preview */}
              {section.content_data?.activity_data?.type === 'matching' && (
                <div className="space-y-3">
                  {section.content_data?.activity_data?.matching_pairs &&
                    section.content_data.activity_data.matching_pairs.length >
                      0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-800">
                          Matching Pairs:
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {section.content_data.activity_data.matching_pairs
                            .slice(0, 3)
                            .map((pair, index) => (
                              <div
                                key={index}
                                className="p-2 bg-green-50 rounded border border-green-200">
                                <p className="text-xs text-gray-600 mb-1">
                                  Description:
                                </p>
                                <p className="text-sm text-gray-800 mb-2">
                                  {pair.description}
                                </p>
                                <p className="text-xs text-gray-600 mb-1">
                                  Term:
                                </p>
                                <p className="text-sm font-medium text-green-800">
                                  {pair.term}
                                </p>
                              </div>
                            ))}
                        </div>
                        {section.content_data.activity_data.matching_pairs
                          .length > 3 && (
                          <p className="text-xs text-gray-500">
                            ... and{' '}
                            {section.content_data.activity_data.matching_pairs
                              .length - 3}{' '}
                            more pairs
                          </p>
                        )}
                      </div>
                    )}
                </div>
              )}

              {/* Instructions Preview */}
              {section.content_data?.activity_data?.instructions &&
                section.content_data.activity_data.instructions.length > 0 && (
                  <div className="mt-3">
                    <h5 className="font-medium text-gray-800 mb-2">
                      Instructions:
                    </h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {section.content_data.activity_data.instructions.map(
                        (instruction, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {instruction}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* Expected Outcome */}
              {section.content_data?.activity_data?.expected_outcome && (
                <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                  <h5 className="font-medium text-green-800 mb-1">
                    Expected Outcome:
                  </h5>
                  <p className="text-sm text-green-700">
                    {section.content_data.activity_data.expected_outcome}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case 'quick_check':
        return (
          <div className="prose dark:prose-invert">
            <p>
              {section.content_data?.text ||
                'No quick check question or prompt provided.'}
            </p>
          </div>
        );
      case 'highlight':
        return (
          <div className="prose dark:prose-invert">
            <h4 className="font-medium text-gray-900 text-sm">
              {section.content_data?.highlight_data?.title ||
                'Highlight Preview'}
            </h4>
            <p className="text-sm text-gray-700">
              Concept:{' '}
              {section.content_data?.highlight_data?.concept ||
                'No concept provided.'}
            </p>
            <p className="text-sm text-gray-700">
              Explanation:{' '}
              {section.content_data?.highlight_data?.explanation ||
                'No explanation provided.'}
            </p>
            <p className="text-sm text-gray-700">
              Examples:{' '}
              {section.content_data?.highlight_data?.examples?.join(', ') ||
                'None'}
            </p>
          </div>
        );
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Header
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {section.content_data?.table_data?.headers?.map(
                  (header, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {header}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {section.content_data?.table_data?.rows?.[0]?.[index] ||
                          'N/A'}
                      </td>
                    </tr>
                  )
                )}
                {section.content_data?.table_data?.caption && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <i>{section.content_data.table_data.caption}</i>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case 'diagram':
        return (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md aspect-video bg-gray-200 rounded-lg mb-2">
              {section.content_data?.diagram_data?.image_url ? (
                <img
                  src={section.content_data.diagram_data.image_url}
                  alt={
                    section.content_data.diagram_data.title || 'Diagram Preview'
                  }
                  className="w-full h-full rounded-lg object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No diagram image URL provided.
                </div>
              )}
            </div>
            <p className="text-sm text-gray-700">
              {section.content_data?.diagram_data?.title || 'Diagram Preview'}
            </p>
            <p className="text-xs text-gray-500">
              {section.content_data?.diagram_data?.description ||
                'No description provided.'}
            </p>
          </div>
        );
      default:
        return (
          <div className="prose dark:prose-invert">
            <p>No preview available for this content type.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      {/* <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full blur-3xl opacity-30"></div>
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Content Structure
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Build the dynamic content sections that make up your learning
              module. Each section can contain different types of content to
              engage various learning styles.
            </p>
          </div>
        </div>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Section List */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Content Sections</CardTitle>
                <Button
                  onClick={addContentSection}
                  size="sm"
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedSectionIndex === index
                        ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-emerald-50 shadow-lg'
                        : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/30'
                    }`}
                    onClick={() => {
                      console.log(`📂 Loading Section ${index + 1}:`, {
                        sectionId: section.id,
                        title: section.title || `Section ${index + 1}`,
                        hasText: !!section.content_data?.text,
                        textLength: section.content_data?.text?.length || 0,
                        textPreview: section.content_data?.text?.substring(0, 100) || '(empty)'
                      });
                      setSelectedSectionIndex(index);
                    }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {section.title || `Section ${index + 1}`}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          removeContentSection(index);
                          if (selectedSectionIndex === index) {
                            setSelectedSectionIndex(null);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {section.content_type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {section.time_estimate_minutes} min
                      </span>
                    </div>
                  </div>
                ))}
                {sections.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No content sections yet</p>
                    <p className="text-sm">
                      Click "Add Section" to get started
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Section Editor */}
        <div className="lg:col-span-2">
          {selectedSectionIndex !== null && sections[selectedSectionIndex] ? (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Edit Section:{' '}
                    {sections[selectedSectionIndex].title ||
                      `Section ${selectedSectionIndex + 1}`}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Auto-Save Enabled
                  </Badge>
                </div>
              </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                  {/* Basic Section Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Section Title ✏️
                      </Label>
                      <Input
                        placeholder={`Section ${selectedSectionIndex + 1}`}
                        value={sections[selectedSectionIndex].title || ''}
                        onChange={e =>
                          updateContentSection(selectedSectionIndex, {
                            title: e.target.value
                          })
                        }
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Default: "Section {selectedSectionIndex + 1}" (You can edit this)
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Content Type
                      </Label>
                      <Select
                        value={sections[selectedSectionIndex].content_type}
                        onValueChange={value =>
                          updateContentSection(selectedSectionIndex, {
                            content_type: value as any,
                            content_data: {} // Reset content data when type changes
                          })
                        }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {contentTypeOptions.map(option => {
                            const Icon = option.icon;
                            return (
                              <SelectItem
                                key={option.value}
                                value={option.value}>
                                <div className="flex items-center space-x-2">
                                  <Icon className="w-4 h-4" />
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Time Estimate (min)
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={
                          sections[selectedSectionIndex]
                            .time_estimate_minutes || ''
                        }
                        onChange={e =>
                          updateContentSection(selectedSectionIndex, {
                            time_estimate_minutes: parseInt(e.target.value) || 0
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Position
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={sections[selectedSectionIndex].position || ''}
                        onChange={e =>
                          updateContentSection(selectedSectionIndex, {
                            position: parseInt(e.target.value) || 0
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id={`required-${selectedSectionIndex}`}
                        checked={
                          sections[selectedSectionIndex].is_required || false
                        }
                        onCheckedChange={checked =>
                          updateContentSection(selectedSectionIndex, {
                            is_required: checked as boolean
                          })
                        }
                      />
                      <Label
                        htmlFor={`required-${selectedSectionIndex}`}
                        className="text-sm">
                        Required Section
                      </Label>
                    </div>
                  </div>

                  {/* Learning Style Tags */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Learning Style Tags
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {learningStyleOptions.map(style => {
                        const Icon = style.icon;
                        const isSelected = sections[
                          selectedSectionIndex
                        ].learning_style_tags?.includes(style.value);
                        return (
                          <Button
                            key={style.value}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              const currentTags =
                                sections[selectedSectionIndex]
                                  .learning_style_tags || [];
                              const newTags = isSelected
                                ? currentTags.filter(tag => tag !== style.value)
                                : [...currentTags, style.value];
                              updateContentSection(selectedSectionIndex, {
                                learning_style_tags: newTags
                              });
                            }}
                            className={
                              isSelected
                                ? `bg-gradient-to-r ${style.color}`
                                : ''
                            }>
                            <Icon className="w-4 h-4 mr-1" />
                            {style.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Content Type Specific Form */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Content Configuration
                    </Label>
                    {renderContentTypeForm(
                      sections[selectedSectionIndex],
                      selectedSectionIndex
                    )}
                  </div>

                  {/* Key Points */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Key Points
                    </Label>
                    <div className="space-y-2">
                      {(
                        sections[selectedSectionIndex].metadata?.key_points || [
                          ''
                        ]
                      ).map((point, pointIndex) => (
                        <div
                          key={pointIndex}
                          className="flex items-center space-x-2">
                          <Input
                            placeholder={`Key point ${pointIndex + 1}`}
                            value={point}
                            onChange={e => {
                              const currentPoints = sections[
                                selectedSectionIndex
                              ].metadata?.key_points || [''];
                              const newPoints = [...currentPoints];
                              newPoints[pointIndex] = e.target.value;
                              updateContentSection(selectedSectionIndex, {
                                metadata: {
                                  ...sections[selectedSectionIndex].metadata,
                                  key_points: newPoints
                                }
                              });
                            }}
                          />
                          {(
                            sections[selectedSectionIndex].metadata
                              ?.key_points || []
                          ).length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentPoints = sections[
                                  selectedSectionIndex
                                ].metadata?.key_points || [''];
                                const newPoints = currentPoints.filter(
                                  (_, i) => i !== pointIndex
                                );
                                updateContentSection(selectedSectionIndex, {
                                  metadata: {
                                    ...sections[selectedSectionIndex].metadata,
                                    key_points: newPoints
                                  }
                                });
                              }}
                              className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const currentPoints = sections[selectedSectionIndex]
                            .metadata?.key_points || [''];
                          updateContentSection(selectedSectionIndex, {
                            metadata: {
                              ...sections[selectedSectionIndex].metadata,
                              key_points: [...currentPoints, '']
                            }
                          });
                        }}
                        className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Key Point
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Section Selected
                </h3>
                <p className="text-gray-500">
                  Select a content section from the list to edit its properties
                  and content.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Preview Section */}
    </div>
  );
}
