'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Eye,
  Headphones,
  PenTool,
  Zap,
  Play,
  Pause,
  Volume2,
  Image as ImageIcon,
  Table as TableIcon,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  Target,
  Clock,
  BookOpen,
  Video,
  Mic,
  Activity,
  FileText,
  Brain,
  X
} from 'lucide-react';
import { VARKModule, VARKModuleContentSection } from '@/types/vark-module';

// Dynamically import ReadAloudPlayer to avoid SSR issues
const ReadAloudPlayer = dynamic(
  () => import('./read-aloud-player'),
  { ssr: false }
);

interface VARKModulePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Partial<VARKModule>;
  currentStep: number;
  categories?: any[];
}

const learningStyleIcons = {
  everyone: Target,
  visual: Eye,
  auditory: Headphones,
  reading_writing: PenTool,
  kinesthetic: Zap
};

const learningStyleColors = {
  everyone: 'from-teal-500 to-teal-600',
  visual: 'from-blue-500 to-blue-600',
  auditory: 'from-green-500 to-green-600',
  reading_writing: 'from-purple-500 to-purple-600',
  kinesthetic: 'from-orange-500 to-orange-600'
};

const contentTypeIcons = {
  text: BookOpen,
  video: Video,
  audio: Mic,
  interactive: Play,
  activity: Activity,
  assessment: FileText,
  quick_check: CheckCircle,
  highlight: Brain,
  table: TableIcon,
  diagram: BarChart3
};

const getStepTitle = (step: number) => {
  const titles = {
    1: 'Basic Information',
    2: 'Content Structure',
    3: 'Multimedia Content',
    4: 'Interactive Elements',
    5: 'Assessment Questions',
    6: 'Complete Module'
  };
  return titles[step as keyof typeof titles] || 'Preview';
};

const renderBasicInfoPreview = (formData: Partial<VARKModule>) => (
  <div className="space-y-6">
    {/* Module Header */}
    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        {formData.title || 'Module Title'}
      </h1>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto">
        {formData.description || 'Module description will appear here'}
      </p>
    </div>

    {/* Module Details */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {(
              formData.learning_objectives || [
                'Learning objective 1',
                'Learning objective 2'
              ]
            ).map((objective, index) => (
              <li
                key={index}
                className="flex items-start space-x-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{objective || `Learning objective ${index + 1}`}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-600" />
            Module Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Difficulty:</span>
            <Badge variant="outline" className="capitalize">
              {formData.difficulty_level || 'beginner'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Duration:</span>
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {formData.estimated_duration_minutes || 30} min
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Category:</span>
            <Badge variant="outline">
              {formData.category_id ? 'Selected' : 'Not selected'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-600" />
            Prerequisites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {(
              formData.prerequisites || ['Prerequisite 1', 'Prerequisite 2']
            ).map((prereq, index) => (
              <li
                key={index}
                className="flex items-start space-x-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{prereq || `Prerequisite ${index + 1}`}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
);

const renderContentStructurePreview = (formData: Partial<VARKModule>) => {
  const sections = formData.content_structure?.sections || [];

  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
        <h2 className="text-2xl font-bold text-purple-900 mb-2">
          Content Structure Preview
        </h2>
        <p className="text-purple-700">
          {sections.length} content sections •{' '}
          {formData.estimated_duration_minutes || 0} minutes total
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No content sections yet</p>
          <p className="text-sm">Add sections to see them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => {
            const Icon =
              contentTypeIcons[
                section.content_type as keyof typeof contentTypeIcons
              ] || BookOpen;

            return (
              <Card key={section.id || index} className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {section.title || `Section ${index + 1}`}
                        </CardTitle>
                        <p className="text-sm text-gray-600 capitalize">
                          {section.content_type} •{' '}
                          {section.time_estimate_minutes || 0} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {section.is_required && (
                        <Badge
                          variant="outline"
                          className="border-red-300 text-red-700">
                          Required
                        </Badge>
                      )}
                      <Badge variant="outline">{index + 1}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Content Preview */}
                  <div className="mb-4">{renderContentPreview(section)}</div>

                  {/* Learning Style Tags */}
                  {section.learning_style_tags &&
                    section.learning_style_tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {section.learning_style_tags.map((tag, tagIndex) => {
                          const StyleIcon =
                            learningStyleIcons[
                              tag as keyof typeof learningStyleIcons
                            ];
                          const color =
                            learningStyleColors[
                              tag as keyof typeof learningStyleColors
                            ];
                          return (
                            <Badge
                              key={tagIndex}
                              className={`bg-gradient-to-r ${color} text-white`}>
                              <StyleIcon className="w-3 h-3 mr-1" />
                              {tag.replace('_', ' ')}
                            </Badge>
                          );
                        })}
                      </div>
                    )}

                  {/* Key Points */}
                  {section.metadata?.key_points &&
                    section.metadata.key_points.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Key Points:
                        </h4>
                        <ul className="space-y-1">
                          {section.metadata.key_points.map(
                            (point, pointIndex) => (
                              <li
                                key={pointIndex}
                                className="text-sm text-gray-600 flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{point}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const renderContentPreview = (section: VARKModuleContentSection) => {
  const { content_type, content_data } = section;

  switch (content_type) {
    case 'text':
      // CKEditor content is stored as HTML
      const htmlContent = content_data?.text || '<p class="text-gray-500 italic">Text content will appear here...</p>';
      
      return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          {/* Render CKEditor HTML content with enhanced styling */}
          <div 
            className="prose prose-sm max-w-none
              prose-headings:text-gray-900 prose-headings:font-bold
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
              prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
              prose-li:text-gray-700 prose-li:mb-1
              prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4 prose-blockquote:bg-blue-50 prose-blockquote:py-2
              prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:my-4
              [&_img]:mx-auto [&_img]:block [&_img]:rounded-lg [&_img]:shadow-lg [&_img]:my-6 [&_img]:max-w-full
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:shadow-md [&_table]:rounded-lg [&_table]:overflow-hidden
              [&_thead]:bg-gradient-to-r [&_thead]:from-blue-500 [&_thead]:to-blue-600
              [&_th]:text-white [&_th]:font-semibold [&_th]:p-3 [&_th]:text-left [&_th]:border-r [&_th]:border-blue-400 [&_th:last-child]:border-r-0
              [&_td]:p-3 [&_td]:border [&_td]:border-gray-200 [&_td]:bg-white
              [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-blue-50
              [&_iframe]:rounded-lg [&_iframe]:shadow-lg [&_iframe]:my-4"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      );

    case 'video':
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
              <Play className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">
                {content_data?.video_data?.title || 'Video Title'}
              </h4>
              <p className="text-sm text-gray-600">
                {content_data?.video_data?.description ||
                  'Video description...'}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>
                  Duration: {content_data?.video_data?.duration || 0}s
                </span>
                {content_data?.video_data?.autoplay && (
                  <Badge variant="outline" className="text-xs">
                    Autoplay
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      );

    case 'audio':
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
              <Volume2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">
                {content_data?.audio_data?.title || 'Audio Title'}
              </h4>
              <p className="text-sm text-gray-600">
                Duration: {content_data?.audio_data?.duration || 0}s
              </p>
              {content_data?.audio_data?.show_transcript && (
                <Badge variant="outline" className="text-xs mt-2">
                  Transcript Available
                </Badge>
              )}
            </div>
          </div>
        </div>
      );

    case 'read_aloud':
      return (
        <div>
          {content_data?.read_aloud_data ? (
            <ReadAloudPlayer 
              data={content_data.read_aloud_data}
              onComplete={() => console.log('Read-aloud preview completed')}
            />
          ) : (
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Headphones className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    Read Aloud (Text-to-Speech)
                  </h4>
                  <p className="text-sm text-gray-600">
                    Text-to-speech with synchronized word highlighting
                  </p>
                  <Badge variant="outline" className="text-xs mt-2 border-purple-300 text-purple-700">
                    Auditory Learning
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case 'table':
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {(
                    content_data?.table_data?.headers || [
                      'Header 1',
                      'Header 2',
                      'Header 3'
                    ]
                  ).map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  content_data?.table_data?.rows || [
                    ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3']
                  ]
                ).map((row, rowIndex) => (
                  <tr key={rowIndex} className="bg-white">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-2 text-sm text-gray-700 border border-gray-200">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {content_data?.table_data?.caption && (
            <p className="text-sm text-gray-600 mt-2 text-center italic">
              {content_data.table_data.caption}
            </p>
          )}
        </div>
      );

    case 'assessment':
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">
              {content_data?.quiz_data?.question ||
                'Assessment question will appear here...'}
            </h4>
            <div className="space-y-2">
              {(
                content_data?.quiz_data?.options || [
                  'Option A',
                  'Option B',
                  'Option C',
                  'Option D'
                ]
              ).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  <span className="text-sm text-gray-700">{option}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'activity':
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            {content_data?.activity_data?.title || 'Activity Title'}
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            {content_data?.activity_data?.description ||
              'Activity description...'}
          </p>
          <div className="space-y-2">
            {(
              content_data?.activity_data?.instructions || [
                'Step 1',
                'Step 2',
                'Step 3'
              ]
            ).map((instruction, index) => (
              <div
                key={index}
                className="flex items-start space-x-2 text-sm text-gray-700">
                <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-orange-700">
                    {index + 1}
                  </span>
                </div>
                <span>{instruction}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'highlight':
      const style = content_data?.highlight_data?.style || 'info';
      const styleConfig = {
        info: {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: Info,
          color: 'text-blue-600'
        },
        warning: {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: AlertCircle,
          color: 'text-yellow-600'
        },
        success: {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: CheckCircle,
          color: 'text-green-600'
        },
        error: {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: AlertCircle,
          color: 'text-red-600'
        }
      };
      const config = styleConfig[style as keyof typeof styleConfig];
      const Icon = config.icon;

      return (
        <div
          className={`${config.bg} ${config.border} border-2 p-4 rounded-lg`}>
          <div className="flex items-start space-x-3">
            <Icon className={`w-5 h-5 ${config.color} mt-0.5 flex-shrink-0`} />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">
                {content_data?.highlight_data?.title || 'Highlight Title'}
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                {content_data?.highlight_data?.concept || 'Key concept...'}
              </p>
              <p className="text-sm text-gray-600">
                {content_data?.highlight_data?.explanation || 'Explanation...'}
              </p>
            </div>
          </div>
        </div>
      );

    case 'diagram':
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">
              {content_data?.diagram_data?.title || 'Diagram Title'}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Type: {content_data?.diagram_data?.type || 'flowchart'}
            </p>
            <p className="text-sm text-gray-700">
              {content_data?.diagram_data?.description ||
                'Diagram description...'}
            </p>
            {content_data?.diagram_data?.is_interactive && (
              <Badge variant="outline" className="mt-2">
                Interactive
              </Badge>
            )}
          </div>
        </div>
      );

    case 'quick_check':
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-medium text-gray-900">Quick Check</h4>
              <p className="text-sm text-gray-700">
                {content_data?.text || 'Quick check question or prompt...'}
              </p>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 text-center">
            Content preview for {content_type} will be displayed here
          </p>
        </div>
      );
  }
};

const renderMultimediaPreview = (formData: Partial<VARKModule>) => (
  <div className="space-y-6">
    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
      <h2 className="text-2xl font-bold text-blue-900 mb-2">
        Multimedia Content Preview
      </h2>
      <p className="text-blue-700">Rich media resources to enhance learning</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(formData.multimedia_content || {}).map(([key, items]) => {
        const itemCount = Array.isArray(items)
          ? items.filter(item => item.trim()).length
          : 0;
        if (itemCount === 0) return null;

        const multimediaIcons = {
          videos: Video,
          images: ImageIcon,
          diagrams: BarChart3,
          podcasts: Mic,
          audio_lessons: Mic,
          discussion_guides: Brain,
          interactive_simulations: Play,
          hands_on_activities: Activity,
          animations: Play,
          virtual_labs: Play,
          interactive_diagrams: BarChart3
        };

        const Icon =
          multimediaIcons[key as keyof typeof multimediaIcons] || Play;
        const label = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        return (
          <Card key={key} className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{label}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.isArray(items) &&
                  items.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-sm text-gray-700 truncate">
                      {item || `Item ${index + 1}`}
                    </div>
                  ))}
                {itemCount > 3 && (
                  <p className="text-xs text-gray-500">
                    +{itemCount - 3} more items
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </div>
);

const renderInteractiveElementsPreview = (formData: Partial<VARKModule>) => {
  const selectedElements = Object.entries(formData.interactive_elements || {})
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => key);

  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
        <h2 className="text-2xl font-bold text-orange-900 mb-2">
          Interactive Elements Preview
        </h2>
        <p className="text-orange-700">
          {selectedElements.length} interactive features selected
        </p>
      </div>

      {selectedElements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Play className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No interactive elements selected</p>
          <p className="text-sm">Choose elements to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedElements.map(element => {
            const elementName = element
              .replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());

            return (
              <div
                key={element}
                className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium text-green-800">
                    {elementName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const renderAssessmentPreview = (formData: Partial<VARKModule>) => {
  const questions = formData.assessment_questions || [];

  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
        <h2 className="text-2xl font-bold text-green-900 mb-2">
          Assessment Questions Preview
        </h2>
        <p className="text-green-700">
          {questions.length} question{questions.length !== 1 ? 's' : ''} • Total
          Points: {questions.reduce((sum, q) => sum + (q.points || 0), 0)}
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No assessment questions yet</p>
          <p className="text-sm">Add questions to see them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id || index} className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-700">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Question {index + 1}
                      </CardTitle>
                      <p className="text-sm text-gray-600 capitalize">
                        {question.type} • {question.points || 0} points
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {question.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Question:
                    </h4>
                    <p className="text-gray-700">
                      {question.question || 'Question text will appear here...'}
                    </p>
                  </div>

                  {(question.type === 'multiple_choice' ||
                    question.type === 'matching') &&
                    question.options && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Options:
                        </h4>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                              <span className="text-sm text-gray-700">
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Correct Answer:
                    </h4>
                    <p className="text-gray-700">
                      {question.correct_answer || 'Answer will appear here...'}
                    </p>
                  </div>

                  {question.max_duration && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Time Limit:
                      </h4>
                      <p className="text-gray-700">
                        {question.max_duration} seconds
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const renderCompleteModulePreview = (formData: Partial<VARKModule>) => (
  <div className="space-y-6">
    <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
      <h2 className="text-3xl font-bold text-purple-900 mb-3">
        Complete Module Preview
      </h2>
      <p className="text-purple-700 text-lg">
        This is exactly how your module will appear to students
      </p>
    </div>

    {/* Module Overview */}
    {renderBasicInfoPreview(formData)}

    <Separator />

    {/* Content Structure */}
    {renderContentStructurePreview(formData)}

    <Separator />

    {/* Multimedia */}
    {renderMultimediaPreview(formData)}

    <Separator />

    {/* Interactive Elements */}
    {renderInteractiveElementsPreview(formData)}

    <Separator />

    {/* Assessment */}
    {renderAssessmentPreview(formData)}
  </div>
);

export default function VARKModulePreview({
  isOpen,
  onClose,
  formData,
  currentStep,
  categories
}: VARKModulePreviewProps) {
  const renderStepPreview = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoPreview(formData);
      case 2:
        return renderContentStructurePreview(formData);
      case 3:
        return renderMultimediaPreview(formData);
      case 4:
        return renderInteractiveElementsPreview(formData);
      case 5:
        return renderAssessmentPreview(formData);
      case 6:
        return renderCompleteModulePreview(formData);
      default:
        return renderBasicInfoPreview(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {getStepTitle(currentStep)} Preview
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-gray-600">
            See exactly how your content will appear to students
          </p>
        </DialogHeader>

        <div className="py-4">{renderStepPreview()}</div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
          <Button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700">
            Continue Editing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}






