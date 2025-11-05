'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table } from '../ui/table';
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  Target,
  BookOpen,
  Video,
  Image,
  Activity,
  ChevronRight,
  ChevronLeft,
  Eye,
  Brain,
  Zap,
  Headphones,
  PenTool,
  FileText,
  XCircle,
  AlertCircle,BarChart3
} from 'lucide-react';
import { VARKModule, VARKModuleContentSection } from '@/types/vark-module';
import { Textarea } from '@/components/ui/textarea';
import { VARKModulesAPI } from '@/lib/api/vark-modules';
import ModuleCompletionModal from './module-completion-modal';
import { toast } from 'sonner';
import FillInBlanksActivity from './fill-in-blanks-activity';

// Dynamically import ReadAloudPlayer to avoid SSR issues
const ReadAloudPlayer = dynamic(
  () => import('./read-aloud-player'),
  { ssr: false }
);

// Import mobile enhancement components
import {
  MobileBottomNavigation,
  MobileSectionList,
  MobileSectionHeader,
  MobileContentWrapper,
  SwipeHandler
} from './mobile-module-enhancements';

interface DynamicModuleViewerProps {
  module: VARKModule;
  onProgressUpdate?: (sectionId: string, completed: boolean) => void;
  onSectionComplete?: (sectionId: string) => void;
  initialProgress?: Record<string, boolean>;
  previewMode?: boolean;
  activeSectionIndex?: number;
  userId?: string; // Student ID for completion tracking
  userName?: string; // Student name for notifications
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

export default function DynamicModuleViewer({
  module,
  onProgressUpdate,
  onSectionComplete,
  initialProgress = {},
  previewMode = false,
  activeSectionIndex = 0,
  userId,
  userName
}: DynamicModuleViewerProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionProgress, setSectionProgress] =
    useState<Record<string, boolean>>(initialProgress);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [showQuizResults, setShowQuizResults] = useState<
    Record<string, boolean>
  >({});
  const [assessmentResults, setAssessmentResults] = useState<Record<string, any>>({});
  
  // ✅ MODULE COMPLETION STATE
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const [earnedBadge, setEarnedBadge] = useState<any>(null);
  const [startTime] = useState(Date.now());
  const [hasShownCompletion, setHasShownCompletion] = useState(false);

  const mountedRef = useRef(true);
  const previousSectionsRef = useRef<string[]>([]);

  const currentSection =
    module.content_structure.sections[
      previewMode ? activeSectionIndex : currentSectionIndex
    ];
  const totalSections = module.content_structure.sections.length;
  const completedSections =
    Object.values(sectionProgress).filter(Boolean).length;
  const progressPercentage = (completedSections / totalSections) * 100;

  // Memoize quiz options to prevent unnecessary re-renders
  const memoizedQuizOptions = useMemo(() => {
    const options = ['Option A', 'Option B', 'Option C', 'Option D'];
    return options;
  }, []);

  // Memoize sections to prevent unnecessary re-renders
  const memoizedSections = useMemo(() => {
    return module.content_structure.sections || [];
  }, [module.content_structure.sections]);

  // ✅ ASSESSMENT VALIDATION FUNCTIONS
  const validateAnswer = useCallback((question: any, userAnswer: any) => {
    if (!question.correct_answer) {
      // No correct answer defined, give full credit
      return { isCorrect: true, earnedPoints: question.points || 1 };
    }

    const { type, correct_answer, points = 1 } = question;
    
    switch (type) {
      case 'single_choice':
      case 'true_false':
        return {
          isCorrect: userAnswer === correct_answer,
          earnedPoints: userAnswer === correct_answer ? points : 0
        };
        
      case 'multiple_choice':
        if (!Array.isArray(correct_answer) || !Array.isArray(userAnswer)) {
          return { isCorrect: false, earnedPoints: 0 };
        }
        const correctSet = new Set(correct_answer);
        const userSet = new Set(userAnswer);
        const isCorrect = 
          correctSet.size === userSet.size &&
          [...correctSet].every(ans => userSet.has(ans));
        return { isCorrect, earnedPoints: isCorrect ? points : 0 };
        
      case 'short_answer':
        // Case-insensitive comparison, trim whitespace
        const userAns = String(userAnswer || '').trim().toLowerCase();
        const correctAns = String(correct_answer || '').trim().toLowerCase();
        const isMatch = userAns === correctAns;
        return { isCorrect: isMatch, earnedPoints: isMatch ? points : 0 };
        
      default:
        // For other types (audio, visual, interactive), give full credit if answered
        return { 
          isCorrect: !!userAnswer, 
          earnedPoints: userAnswer ? points : 0 
        };
    }
  }, []);

  const calculateAssessmentScore = useCallback((questions: any[], answers: Record<string, any>) => {
    const results = questions.map((question, index) => {
      const answerKey = `question_${index}`;
      const userAnswerRaw = answers[answerKey];
      
      // Extract actual answer value based on question type
      let userAnswerValue;
      if (userAnswerRaw && typeof userAnswerRaw === 'object') {
        // Single choice uses 'selected', short answer uses 'answer', multiple choice uses array
        userAnswerValue = userAnswerRaw.selected || userAnswerRaw.answer || userAnswerRaw;
      } else {
        userAnswerValue = userAnswerRaw;
      }
      
      const validation = validateAnswer(question, userAnswerValue);
      
      return {
        questionId: question.id,
        questionNumber: index + 1,
        question: question.question,
        userAnswer: userAnswerValue,
        correctAnswer: question.correct_answer,
        explanation: question.explanation,
        ...validation
      };
    });
    
    const totalEarned = results.reduce((sum, r) => sum + r.earnedPoints, 0);
    const totalPossible = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const percentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    const correctCount = results.filter(r => r.isCorrect).length;
    
    return {
      results,
      totalEarned,
      totalPossible,
      percentage,
      correctCount,
      totalQuestions: questions.length,
      passed: percentage >= 60 // 60% passing score
    };
  }, [validateAnswer]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Initialize progress for all sections
    if (mountedRef.current) {
      const currentSections = memoizedSections;
      const currentSectionIds = currentSections.map(s => s.id);

      // Only update if sections have actually changed
      const sectionsChanged =
        JSON.stringify(currentSectionIds) !==
        JSON.stringify(previousSectionsRef.current);

      if (sectionsChanged) {
        previousSectionsRef.current = currentSectionIds;

        setSectionProgress(prevProgress => {
          // Only update if we don't already have progress for all sections
          const hasAllSections = currentSections.every(
            section => prevProgress[section.id] !== undefined
          );

          if (hasAllSections) {
            return prevProgress;
          }

          const initialSectionProgress: Record<string, boolean> = {};
          currentSections.forEach(section => {
            initialSectionProgress[section.id] =
              initialProgress[section.id] || false;
          });
          return { ...prevProgress, ...initialSectionProgress };
        });
      }
    }
  }, [memoizedSections, initialProgress]);

  const handleSectionComplete = useCallback(
    (sectionId: string) => {
      if (!mountedRef.current) return;

      setSectionProgress(prevProgress => {
        const newProgress = { ...prevProgress, [sectionId]: true };
        return newProgress;
      });

      // Call callbacks after state update, but only if component is still mounted
      // and callbacks are stable functions
      if (mountedRef.current) {
        try {
          if (typeof onProgressUpdate === 'function') {
            onProgressUpdate(sectionId, true);
          }
          if (typeof onSectionComplete === 'function') {
            onSectionComplete(sectionId);
          }
        } catch (error) {
          console.warn('Error calling progress callbacks:', error);
        }
      }
    },
    [onProgressUpdate, onSectionComplete]
  );

  const handleQuizSubmit = useCallback(
    (sectionId: string, answers: any, questions?: any[]) => {
      // Save answers
      setQuizAnswers(prev => ({ ...prev, [sectionId]: answers }));
      setShowQuizResults(prev => ({ ...prev, [sectionId]: true }));
      
      // ✅ Calculate scores and validate if questions provided
      if (questions && questions.length > 0) {
        const results = calculateAssessmentScore(questions, answers);
        setAssessmentResults(prev => ({ ...prev, [sectionId]: results }));
        
        console.log('📊 Assessment Results:', {
          sectionId,
          score: `${results.totalEarned}/${results.totalPossible}`,
          percentage: `${results.percentage.toFixed(1)}%`,
          passed: results.passed,
          correct: `${results.correctCount}/${results.totalQuestions}`
        });
      }
      
      handleSectionComplete(sectionId);
    },
    [handleSectionComplete, calculateAssessmentScore]
  );

  const handleQuizAnswerChange = useCallback(
    (sectionId: string, questionIndex: number, value: string) => {
      setQuizAnswers(prev => ({
        ...prev,
        [sectionId]: {
          ...(prev[sectionId] || {}),
          [`question_${questionIndex}`]: value
        }
      }));
    },
    []
  );

  // Clean inline styles from images for better display
  const cleanImageStyles = (html: string): string => {
    if (!html) return '';
    
    // Remove style attributes from img tags
    return html.replace(/<img([^>]*?)\s+style\s*=\s*["'][^"']*["']([^>]*?)>/gi, '<img$1$2>');
  };

  const renderContentSection = (section: VARKModuleContentSection) => {
    const { content_type, content_data, title, learning_style_tags, metadata } =
      section;

    switch (content_type) {
      case 'text':
        // CKEditor content is stored as HTML
        const rawHtmlContent = content_data?.text || '';
        // Clean inline styles from images for better responsive display
        const htmlContent = cleanImageStyles(rawHtmlContent);

        return (
          <div className="prose prose-lg max-w-none">
            {/* Render CKEditor HTML content with enhanced styling */}
            <div 
              className="text-gray-700 leading-relaxed
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-em:italic
                prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
                prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
                prose-li:text-gray-700 prose-li:mb-2
                prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-4 prose-blockquote:bg-blue-50 prose-blockquote:py-3 prose-blockquote:rounded-r-lg
                prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-6
                [&_img]:mx-auto [&_img]:block [&_img]:rounded-xl [&_img]:shadow-2xl [&_img]:my-8 [&_img]:max-w-full [&_img]:h-auto [&_img]:border-4 [&_img]:border-white
                [&_table]:w-full [&_table]:border-collapse [&_table]:my-8 [&_table]:shadow-xl [&_table]:rounded-xl [&_table]:overflow-hidden
                [&_thead]:bg-gradient-to-r [&_thead]:from-blue-600 [&_thead]:to-blue-700
                [&_th]:text-white [&_th]:font-bold [&_th]:p-4 [&_th]:text-left [&_th]:border-r [&_th]:border-blue-500 [&_th:last-child]:border-r-0
                [&_td]:p-4 [&_td]:border [&_td]:border-gray-200 [&_td]:bg-white
                [&_tbody_tr]:transition-all [&_tbody_tr:hover]:bg-blue-50 [&_tbody_tr:hover]:shadow-md
                [&_iframe]:rounded-xl [&_iframe]:shadow-2xl [&_iframe]:my-8"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
            {/* {metadata?.key_points && metadata.key_points.length > 0 && (
              <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Key Points:
                </h4>
                <ul className="list-disc list-inside space-y-2 text-blue-700">
                  {metadata.key_points.map((point, index) => (
                    <li key={index} className="leading-relaxed">{point}</li>
                  ))}
                </ul>
              </div>
            )} */}
          </div>
        );

      case 'table':
        if (content_data.table_data) {
          const { headers, rows, caption, styling } = content_data.table_data;
          return (
            <div className="overflow-x-auto">
              <table
                className={`w-full border-collapse ${
                  styling?.zebra_stripes ? 'striped' : ''
                }`}>
                {caption && (
                  <caption className="text-sm text-gray-600 mb-2">
                    {caption}
                  </caption>
                )}
                <thead>
                  <tr
                    className={`${
                      styling?.highlight_header ? 'bg-gray-100' : 'bg-gray-50'
                    }`}>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`${
                        styling?.zebra_stripes && rowIndex % 2 === 1
                          ? 'bg-gray-50'
                          : ''
                      } hover:bg-gray-100`}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return null;

      case 'video':
        if (content_data.video_data) {
          const video = content_data.video_data;
          return (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  {video.title || 'Video Content'}
                </h4>

                {video.description && (
                  <p className="text-gray-600 mb-4 text-center">
                    {video.description}
                  </p>
                )}

                {video.url ? (
                  <div className="w-full max-w-2xl mx-auto">
                    {/* Check if it's a YouTube URL and convert to embed */}
                    {video.url.includes('youtube.com/watch') ? (
                      <div className="aspect-video w-full">
                        <iframe
                          src={video.url.replace('watch?v=', 'embed/')}
                          title={video.title || 'Video'}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full rounded-lg"
                        />
                      </div>
                    ) : video.url.includes('vimeo.com') ? (
                      <div className="aspect-video w-full">
                        <iframe
                          src={`https://player.vimeo.com/video/${video.url
                            .split('/')
                            .pop()}`}
                          title={video.title || 'Video'}
                          allow="autoplay; fullscreen; picture-in-picture"
                          className="w-full h-full rounded-lg"
                        />
                      </div>
                    ) : video.url.includes('embed') ||
                      video.url.includes('player') ? (
                      <div className="aspect-video w-full">
                        <iframe
                          src={video.url}
                          title={video.title || 'Video'}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full rounded-lg"
                        />
                      </div>
                    ) : (
                      /* Direct video file */
                      <video
                        controls
                        className="w-full rounded-lg"
                        autoPlay={video.autoplay || false}
                        preload="metadata">
                        <source src={video.url} type="video/mp4" />
                        <source src={video.url} type="video/webm" />
                        <source src={video.url} type="video/ogg" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-gray-600">No video URL provided</p>
                  </div>
                )}

                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mt-4">
                  {video.duration && <span>Duration: {video.duration}s</span>}
                  {video.autoplay && (
                    <Badge variant="outline" className="text-xs">
                      Autoplay
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-red-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Video Content
            </h4>
            <p className="text-gray-600">
              Video content will be displayed here
            </p>
          </div>
        );

      case 'audio':
        if (content_data.audio_data) {
          const audio = content_data.audio_data;
          return (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  {audio.title || 'Audio Content'}
                </h4>

                {audio.url ? (
                  <div className="w-full max-w-md mx-auto">
                    <audio controls className="w-full" preload="metadata">
                      <source src={audio.url} type="audio/mpeg" />
                      <source src={audio.url} type="audio/ogg" />
                      <source src={audio.url} type="audio/wav" />
                      Your browser does not support the audio tag.
                    </audio>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Headphones className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-gray-600">No audio URL provided</p>
                  </div>
                )}

                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mt-4">
                  {audio.duration && <span>Duration: {audio.duration}s</span>}
                  {audio.show_transcript && (
                    <Badge variant="outline" className="text-xs">
                      Transcript Available
                    </Badge>
                  )}
                </div>

                {audio.transcript && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-800 mb-2">
                      Transcript:
                    </h5>
                    <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                      {audio.transcript}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }
        return (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Audio Content
            </h4>
            <p className="text-gray-600">
              Audio content will be displayed here
            </p>
          </div>
        );

      case 'read_aloud':
        if (content_data.read_aloud_data) {
          return (
            <div className="space-y-4">
              <ReadAloudPlayer 
                data={content_data.read_aloud_data}
                onComplete={() => {
                  console.log('Read-aloud section completed');
                  if (onSectionComplete) {
                    onSectionComplete(section.id);
                  }
                }}
              />
            </div>
          );
        }
        return (
          <div className="bg-purple-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Read Aloud (Text-to-Speech)
            </h4>
            <p className="text-gray-600">
              Text-to-speech with word highlighting will be displayed here
            </p>
          </div>
        );

      case 'highlight':
        if (content_data.highlight_data) {
          const highlight = content_data.highlight_data;
          const styleConfig = {
            info: {
              bg: 'bg-blue-50',
              border: 'border-blue-200',
              icon: Brain,
              color: 'text-blue-600'
            },
            warning: {
              bg: 'bg-yellow-50',
              border: 'border-yellow-200',
              icon: Brain,
              color: 'text-yellow-600'
            },
            success: {
              bg: 'bg-green-50',
              border: 'border-green-200',
              icon: Brain,
              color: 'text-green-600'
            },
            error: {
              bg: 'bg-red-50',
              border: 'border-red-200',
              icon: Brain,
              color: 'text-red-600'
            }
          };
          const config = styleConfig[highlight.style] || styleConfig.info;
          const Icon = config.icon;

          return (
            <div
              className={`${config.bg} ${config.border} border-2 p-4 rounded-lg`}>
              <div className="flex items-start space-x-3">
                <Icon
                  className={`w-5 h-5 ${config.color} mt-0.5 flex-shrink-0`}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {highlight.title || 'Key Highlight'}
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Concept:</strong> {highlight.concept}
                  </p>
                  <p className="text-sm text-gray-600">
                    {highlight.explanation}
                  </p>
                  {highlight.examples && highlight.examples.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Examples:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {highlight.examples.map((example, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Highlight Content
            </h4>
            <p className="text-gray-600">
              Highlight content will be displayed here
            </p>
          </div>
        );

      case 'diagram':
        if (content_data.diagram_data) {
          const diagram = content_data.diagram_data;
          return (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {diagram.title || 'Diagram Content'}
                </h4>
                <p className="text-gray-600 mb-3">Type: {diagram.type}</p>
                <p className="text-gray-700 mb-4">{diagram.description}</p>
                {diagram.image_url && (
                  <div className="mt-4">
                    <img
                      src={diagram.image_url}
                      alt={diagram.title || 'Diagram'}
                      className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                    />
                  </div>
                )}
                {diagram.key_elements && diagram.key_elements.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Key Elements:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {diagram.key_elements.map((element, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs">
                          {element}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {diagram.is_interactive && (
                  <Badge variant="outline" className="mt-2">
                    Interactive
                  </Badge>
                )}
              </div>
            </div>
          );
        }
        return (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Diagram Content
            </h4>
            <p className="text-gray-600">
              Diagram content will be displayed here
            </p>
          </div>
        );

      case 'interactive':
        if (content_data.interactive_data) {
          const interactive = content_data.interactive_data;
          return (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Interactive Content
                </h4>
                <p className="text-gray-600 mb-3">Type: {interactive.type}</p>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    Interactive content will be displayed here. This could
                    include:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>
                      •{' '}
                      {interactive.type === 'simulation'
                        ? 'Simulations'
                        : interactive.type === 'game'
                        ? 'Educational Games'
                        : interactive.type === 'virtual_lab'
                        ? 'Virtual Laboratory'
                        : interactive.type === 'interactive_diagram'
                        ? 'Interactive Diagrams'
                        : interactive.type === 'progress_tracker'
                        ? 'Progress Tracking'
                        : 'Interactive Elements'}
                    </li>
                    <li>
                      • User interactions:{' '}
                      {interactive.user_interactions.join(', ')}
                    </li>
                    <li>• Feedback: {interactive.feedback_mechanism}</li>
                  </ul>
                  {interactive.config &&
                    Object.keys(interactive.config).length > 0 && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                        <p className="font-medium">Configuration:</p>
                        <pre className="text-gray-600 overflow-x-auto">
                          {JSON.stringify(interactive.config, null, 2)}
                        </pre>
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Interactive Content
            </h4>
            <p className="text-gray-600">
              Interactive content will be displayed here
            </p>
          </div>
        );

      case 'assessment':
        // ✅ Use section-specific questions from content_data (PRIMARY)
        // Each section has its own questions in section.content_data.questions
        let assessmentQuestions = (section.content_data as any)?.questions || [];
        
        // 🔄 Fallback to global module.assessment_questions (BACKWARD COMPATIBILITY)
        // Only if section doesn't have its own questions
        if (assessmentQuestions.length === 0 && module.assessment_questions && module.assessment_questions.length > 0) {
          console.warn(`⚠️ Section "${section.title}" has no questions in content_data, falling back to module.assessment_questions`);
          
          // Filter questions based on section ID for backward compatibility
          if (section.id === 'pre-test-section' || section.id.includes('pre-test')) {
            assessmentQuestions = module.assessment_questions.filter(q =>
              q.id.startsWith('pre-test')
            );
          } else if (section.id === 'post-test-section' || section.id.includes('post-test')) {
            assessmentQuestions = module.assessment_questions.filter(q =>
              q.id.startsWith('post-test')
            );
          } else {
            // For other assessment sections, use all questions (old behavior)
            assessmentQuestions = module.assessment_questions;
          }
        }
        
        // 📊 Log for debugging
        console.log(`📝 Assessment section "${section.title}":`, {
          sectionId: section.id,
          questionsInSection: assessmentQuestions.length,
          source: (section.content_data as any)?.questions ? 'section.content_data.questions' : 'module.assessment_questions (fallback)'
        });
        
        if (assessmentQuestions.length > 0) {

          const sectionAnswers = quizAnswers[section.id] || {};
          const showResults = showQuizResults[section.id];

          const renderQuestion = (question: any, questionIndex: number) => {
            const questionAnswers =
              sectionAnswers[`question_${questionIndex}`] || {};

            const renderQuestionInput = () => {
              switch (question.type) {
                case 'single_choice':
                  return (
                    <RadioGroup
                      value={questionAnswers.selected || ''}
                      onValueChange={value => {
                        const newAnswers = {
                          ...questionAnswers,
                          selected: value
                        };
                        handleQuizAnswerChange(
                          section.id,
                          questionIndex,
                          newAnswers
                        );
                      }}>
                      <div className="space-y-3">
                        {(question.options || []).map(
                          (option: string, optionIndex: number) => (
                            <div
                              key={`${section.id}-q${questionIndex}-option-${optionIndex}`}
                              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value={option}
                                  id={`option_${section.id}_${questionIndex}_${optionIndex}`}
                                />
                                <Label
                                  htmlFor={`option_${section.id}_${questionIndex}_${optionIndex}`}
                                  className="text-sm font-medium text-gray-700 cursor-pointer">
                                  {option}
                                </Label>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </RadioGroup>
                  );

                case 'multiple_choice':
                  return (
                    <div className="space-y-3">
                      {(question.options || []).map(
                        (option: string, optionIndex: number) => (
                          <div
                            key={`${section.id}-q${questionIndex}-option-${optionIndex}`}
                            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`option_${section.id}_${questionIndex}_${optionIndex}`}
                                checked={
                                  questionAnswers[`option_${optionIndex}`] ===
                                  option
                                }
                                onCheckedChange={checked => {
                                  const newAnswers = {
                                    ...questionAnswers,
                                    [`option_${optionIndex}`]: checked
                                      ? option
                                      : ''
                                  };
                                  handleQuizAnswerChange(
                                    section.id,
                                    questionIndex,
                                    newAnswers
                                  );
                                }}
                              />
                              <Label
                                htmlFor={`option_${section.id}_${questionIndex}_${optionIndex}`}
                                className="text-sm font-medium text-gray-700 cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  );

                case 'true_false':
                  return (
                    <div className="space-y-3">
                      {['True', 'False'].map((option, optionIndex) => (
                        <div
                          key={`${section.id}-q${questionIndex}-option-${optionIndex}`}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <RadioGroup
                            value={
                              questionAnswers[`option_${optionIndex}`] || ''
                            }
                            onValueChange={value => {
                              const newAnswers = {
                                ...questionAnswers,
                                [`option_${optionIndex}`]: value
                              };
                              handleQuizAnswerChange(
                                section.id,
                                questionIndex,
                                newAnswers
                              );
                            }}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={option}
                                id={`option_${section.id}_${questionIndex}_${optionIndex}`}
                              />
                              <Label
                                htmlFor={`option_${section.id}_${questionIndex}_${optionIndex}`}
                                className="text-sm font-medium text-gray-700 cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                    </div>
                  );

                case 'short_answer':
                  return (
                    <div className="space-y-3">
                      <div className="p-3 border border-gray-200 rounded-lg">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Your Answer:
                        </Label>
                        <Textarea
                          placeholder="Type your answer here..."
                          value={questionAnswers[`answer`] || ''}
                          onChange={e => {
                            const newAnswers = {
                              ...questionAnswers,
                              [`answer`]: e.target.value
                            };
                            handleQuizAnswerChange(
                              section.id,
                              questionIndex,
                              newAnswers
                            );
                          }}
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                    </div>
                  );

                default:
                  return (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">
                        Question type "{question.type}" not yet supported in
                        preview.
                      </p>
                    </div>
                  );
              }
            };

            return (
              <div
                key={questionIndex}
                className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex items-start space-x-3 mb-4">
                  <span className="text-lg font-bold text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {questionIndex + 1}
                  </span>
                  <div className="flex-1">
                    <h5 className="text-lg font-semibold text-gray-900 mb-3">
                      {question.question}
                    </h5>
                    {question.points && (
                      <Badge variant="outline" className="text-xs mb-3">
                        {question.points} point
                        {question.points !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>

                {renderQuestionInput()}
              </div>
            );
          };

          return (
            <div className="space-y-6">
              {/* Assessment Header */}
              <div
                className={`p-6 bg-gradient-to-r ${
                  section.id === 'pre-test-section'
                    ? 'from-blue-50 to-blue-100 border-blue-200'
                    : section.id === 'post-test-section'
                    ? 'from-green-50 to-green-100 border-green-200'
                    : 'from-yellow-50 to-yellow-100 border-yellow-200'
                } border rounded-xl`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className={`p-2 rounded-lg ${
                      section.id === 'pre-test-section'
                        ? 'bg-blue-500'
                        : section.id === 'post-test-section'
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                    }`}>
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4
                      className={`text-xl font-bold ${
                        section.id === 'pre-test-section'
                          ? 'text-blue-800'
                          : section.id === 'post-test-section'
                          ? 'text-green-800'
                          : 'text-yellow-800'
                      }`}>
                      📝 {title || 'Assessment'}
                    </h4>
                    <p
                      className={`${
                        section.id === 'pre-test-section'
                          ? 'text-blue-700'
                          : section.id === 'post-test-section'
                          ? 'text-green-700'
                          : 'text-yellow-700'
                      }`}>
                      {section.id === 'pre-test-section'
                        ? 'Let us first check what you already know!'
                        : section.id === 'post-test-section'
                        ? 'Are you ready to check what you have learned?'
                        : 'Complete all questions to proceed'}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-4 text-sm ${
                    section.id === 'pre-test-section'
                      ? 'text-blue-700'
                      : section.id === 'post-test-section'
                      ? 'text-green-700'
                      : 'text-yellow-700'
                  }`}>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>{assessmentQuestions.length} Questions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {assessmentQuestions.reduce(
                        (sum: number, q: any) => sum + (q.points || 1),
                        0
                      )}{' '}
                      Total Points
                    </span>
                  </div>
                </div>
              </div>

              {!showResults ? (
                <div className="space-y-6">
                  {/* Questions */}
                  {assessmentQuestions.map(
                    (question: any, questionIndex: number) =>
                      renderQuestion(question, questionIndex)
                  )}

                  {/* Submit Button */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Button
                      onClick={() =>
                        handleQuizSubmit(section.id, sectionAnswers, assessmentQuestions)
                      }
                      className={`w-full bg-gradient-to-r ${
                        section.id === 'pre-test-section'
                          ? 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                          : section.id === 'post-test-section'
                          ? 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                          : 'from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800'
                      } text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300`}
                      disabled={assessmentQuestions.some(
                        (question: any, questionIndex: number) => {
                          const questionAnswers =
                            sectionAnswers[`question_${questionIndex}`] || {};
                          if (question.type === 'single_choice') {
                            return !questionAnswers.selected;
                          } else if (
                            question.type === 'multiple_choice' ||
                            question.type === 'true_false'
                          ) {
                            return !Object.values(questionAnswers).some(
                              answer => answer
                            );
                          } else if (question.type === 'short_answer') {
                            return !questionAnswers[`answer`];
                          }
                          return false;
                        }
                      )}>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {section.id === 'pre-test-section'
                        ? 'Submit Pre-Test'
                        : section.id === 'post-test-section'
                        ? 'Submit Post-Test'
                        : 'Submit Assessment'}
                    </Button>
                  </div>
                </div>
              ) : (
                (() => {
                  const results = assessmentResults[section.id];
                  if (!results) return null;
                  
                  return (
                    <div className="space-y-6">
                      {/* Score Summary */}
                      <div className={`p-6 rounded-xl border-2 ${
                        results.passed 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-yellow-50 border-yellow-300'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              results.passed ? 'bg-green-500' : 'bg-yellow-500'
                            }`}>
                              {results.passed ? (
                                <CheckCircle className="w-6 h-6 text-white" />
                              ) : (
                                <AlertCircle className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <h3 className={`text-2xl font-bold ${
                                results.passed ? 'text-green-800' : 'text-yellow-800'
                              }`}>
                                {results.passed ? '✅ Passed!' : '📝 Completed'}
                              </h3>
                              <p className={results.passed ? 'text-green-700' : 'text-yellow-700'}>
                                {results.passed 
                                  ? 'Great job! You passed the assessment.'
                                  : 'Keep practicing to improve your score.'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-4xl font-bold ${
                              results.passed ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {results.percentage.toFixed(0)}%
                            </div>
                            <div className={`text-sm ${
                              results.passed ? 'text-green-700' : 'text-yellow-700'
                            }`}>
                              {results.totalEarned}/{results.totalPossible} points
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="p-3 bg-white rounded-lg border">
                            <div className="text-sm text-gray-600">Correct Answers</div>
                            <div className="text-2xl font-bold text-green-600">
                              {results.correctCount}/{results.totalQuestions}
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-lg border">
                            <div className="text-sm text-gray-600">Wrong Answers</div>
                            <div className="text-2xl font-bold text-red-600">
                              {results.totalQuestions - results.correctCount}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Per-Question Results */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          Question-by-Question Results:
                        </h4>
                        
                        {results.results.map((result: any, idx: number) => (
                          <div key={idx} className={`p-4 rounded-lg border-2 ${
                            result.isCorrect 
                              ? 'bg-green-50 border-green-300' 
                              : 'bg-red-50 border-red-300'
                          }`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {result.isCorrect ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                )}
                                <span className="font-semibold">
                                  Question {result.questionNumber}
                                </span>
                              </div>
                              <Badge className={`${
                                result.isCorrect ? 'bg-green-600' : 'bg-red-600'
                              } text-white`}>
                                {result.earnedPoints}/{assessmentQuestions[idx]?.points || 1} pts
                              </Badge>
                            </div>
                            
                            <p className="text-sm font-medium mb-3 text-gray-800">
                              {result.question}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Your Answer:</span>
                                <p className={`mt-1 p-2 rounded ${
                                  result.isCorrect 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {typeof result.userAnswer === 'object' 
                                    ? result.userAnswer?.answer || JSON.stringify(result.userAnswer)
                                    : result.userAnswer || 'No answer'}
                                </p>
                              </div>
                              {!result.isCorrect && result.correctAnswer && (
                                <div>
                                  <span className="font-medium text-gray-700">Correct Answer:</span>
                                  <p className="mt-1 p-2 rounded bg-green-100 text-green-800">
                                    {typeof result.correctAnswer === 'object'
                                      ? JSON.stringify(result.correctAnswer)
                                      : result.correctAnswer}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {result.explanation && !result.isCorrect && (
                              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                <p className="text-sm text-blue-800">
                                  <strong className="flex items-center gap-1">
                                    <Brain className="w-4 h-4" />
                                    Explanation:
                                  </strong>
                                  <span className="mt-1 block">{result.explanation}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          );
        }

        // Handle single quiz data (legacy support)
        if (content_data.quiz_data) {
          const quiz = content_data.quiz_data;
          const sectionAnswers = quizAnswers[section.id] || {};
          const showResults = showQuizResults[section.id];

          console.log('Rendering assessment:', {
            sectionId: section.id,
            quiz,
            sectionAnswers
          });

          const renderQuestionInput = () => {
            switch (quiz.type) {
              case 'single_choice':
                return (
                  <RadioGroup
                    value={sectionAnswers.question_0 || ''}
                    onValueChange={value => {
                      handleQuizAnswerChange(section.id, 0, value);
                    }}>
                    <div className="space-y-4">
                      {(quiz.options || memoizedQuizOptions).map(
                        (option, index) => (
                          <div
                            key={`${section.id}-option-${index}`}
                            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={option}
                                id={`option_${section.id}_${index}`}
                              />
                              <Label
                                htmlFor={`option_${section.id}_${index}`}
                                className="text-sm font-medium text-gray-700 cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </RadioGroup>
                );

              case 'multiple_choice':
                return (
                  <div className="space-y-4">
                    {(quiz.options || memoizedQuizOptions).map(
                      (option, index) => (
                        <div
                          key={`${section.id}-option-${index}`}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`option_${section.id}_${index}`}
                              checked={
                                sectionAnswers[`question_${index}`] === option
                              }
                              onCheckedChange={checked => {
                                handleQuizAnswerChange(
                                  section.id,
                                  index,
                                  checked ? option : ''
                                );
                              }}
                            />
                            <Label
                              htmlFor={`option_${section.id}_${index}`}
                              className="text-sm font-medium text-gray-700 cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                );

              case 'true_false':
                return (
                  <div className="space-y-4">
                    {['True', 'False'].map((option, index) => (
                      <div
                        key={`${section.id}-option-${index}`}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <RadioGroup
                          key={`${section.id}-${index}`}
                          value={sectionAnswers[`question_${index}`] || ''}
                          onValueChange={value => {
                            handleQuizAnswerChange(section.id, index, value);
                          }}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              key={`${section.id}-${index}-${option}`}
                              value={option}
                              id={`option_${section.id}_${index}`}
                            />
                            <Label
                              htmlFor={`option_${section.id}_${index}`}
                              className="text-sm font-medium text-gray-700 cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                );

              case 'matching':
                return (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Arrange the items in the correct order:
                    </p>
                    {(quiz.options || []).map((option, index) => (
                      <div
                        key={`${section.id}-option-${index}`}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-500 w-8">
                          {index + 1}.
                        </span>
                        <span className="text-sm text-gray-700">{option}</span>
                      </div>
                    ))}
                    <p className="text-sm text-gray-500 italic">
                      This is a matching question. Students will arrange items
                      in the correct order.
                    </p>
                  </div>
                );

              case 'short_answer':
                return (
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Your Answer:
                      </Label>
                      <Textarea
                        placeholder="Type your answer here..."
                        value={sectionAnswers[`question_0`] || ''}
                        onChange={e => {
                          handleQuizAnswerChange(section.id, 0, e.target.value);
                        }}
                        className="min-h-[80px] resize-none"
                      />
                    </div>
                    <p className="text-sm text-gray-500 italic">
                      This is a short answer question. Provide a brief response.
                    </p>
                  </div>
                );

              case 'interactive':
                return (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Interactive Assessment
                      </h4>
                      <p className="text-sm text-blue-700 mb-3">
                        {quiz.correct_answer ||
                          'Complete the interactive element to proceed.'}
                      </p>
                      <div className="bg-white p-3 rounded border border-blue-200">
                        <p className="text-sm text-gray-600">
                          This assessment requires interaction with the content.
                          Complete the required actions to mark this section as
                          complete.
                        </p>
                      </div>
                    </div>
                  </div>
                );

              default:
                return (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                      Question type "{quiz.type}" not yet supported in preview.
                    </p>
                  </div>
                );
            }
          };

          return (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  📝 Assessment
                </h4>
                <p className="text-yellow-700">{quiz.question}</p>
                {quiz.time_limit_seconds && quiz.time_limit_seconds > 0 && (
                  <div className="mt-2 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">
                      Time limit: {quiz.time_limit_seconds} seconds
                    </span>
                  </div>
                )}
                {quiz.points && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {quiz.points} point{quiz.points !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </div>

              {!showResults ? (
                <div className="space-y-4">
                  {renderQuestionInput()}

                  {/* Hints */}
                  {quiz.hints && quiz.hints.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">
                        💡 Hints:
                      </h5>
                      <ul className="space-y-1">
                        {quiz.hints.map((hint, index) => (
                          <li
                            key={index}
                            className="text-sm text-blue-700 flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{hint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => handleQuizSubmit(section.id, sectionAnswers, [{ ...quiz, id: section.id }])}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={
                      quiz.type === 'single_choice'
                        ? !sectionAnswers.question_0
                        : quiz.type === 'multiple_choice' ||
                          quiz.type === 'true_false'
                        ? !Object.values(sectionAnswers).some(answer => answer)
                        : quiz.type === 'short_answer'
                        ? !sectionAnswers[`question_0`]
                        : false
                    }>
                    Submit Answer
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">
                    ✅ Assessment Complete!
                  </h4>
                  <p className="text-green-700">
                    Great job! You've completed this assessment.
                  </p>
                  {quiz.explanation && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <p className="text-sm text-gray-700">
                        <strong>Explanation:</strong> {quiz.explanation}
                      </p>
                    </div>
                  )}
                  {quiz.feedback?.correct && (
                    <div className="mt-3 p-3 bg-green-100 rounded border border-green-200">
                      <p className="text-sm text-green-800">
                        <strong>Feedback:</strong> {quiz.feedback.correct}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }
        return null;

      case 'quick_check':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                ✅ Quick Check
              </h4>
              <div className="whitespace-pre-line text-blue-700">
                {content_data.text}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleSectionComplete(section.id)}>
                Yes, let's go!
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))
                }>
                Not yet, I'd like to review a bit more
              </Button>
            </div>
          </div>
        );

      case 'quick_write':
        const quickWriteAnswer = quizAnswers[section.id]?.quick_write_answer || '';
        return (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <PenTool className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-indigo-800">
                  ✍️ Quick Write
                </h4>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 bg-white border border-indigo-200 rounded-lg">
                  <p className="text-gray-800 font-medium whitespace-pre-line">
                    {content_data.prompt || 'No prompt provided'}
                  </p>
                  {content_data.instructions && (
                    <p className="text-sm text-gray-600 italic mt-2">
                      {content_data.instructions}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Your Answer:
                  </Label>
                  <Textarea
                    placeholder="Type your answer here..."
                    value={quickWriteAnswer}
                    onChange={(e) => {
                      setQuizAnswers(prev => ({
                        ...prev,
                        [section.id]: {
                          ...prev[section.id],
                          quick_write_answer: e.target.value
                        }
                      }));
                    }}
                    className="min-h-[150px] resize-y border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  
                  {/* Word count display */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Word count: {quickWriteAnswer.trim().split(/\s+/).filter(w => w.length > 0).length}
                    </span>
                    {(content_data.min_words > 0 || content_data.max_words > 0) && (
                      <span>
                        {content_data.min_words > 0 && `Min: ${content_data.min_words} words`}
                        {content_data.min_words > 0 && content_data.max_words > 0 && ' | '}
                        {content_data.max_words > 0 && `Max: ${content_data.max_words} words`}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    const wordCount = quickWriteAnswer.trim().split(/\s+/).filter(w => w.length > 0).length;
                    
                    // Validate word count if limits are set
                    if (content_data.min_words > 0 && wordCount < content_data.min_words) {
                      alert(`Please write at least ${content_data.min_words} words. Current: ${wordCount}`);
                      return;
                    }
                    if (content_data.max_words > 0 && wordCount > content_data.max_words) {
                      alert(`Please keep your answer under ${content_data.max_words} words. Current: ${wordCount}`);
                      return;
                    }
                    
                    if (!quickWriteAnswer || quickWriteAnswer.trim() === '') {
                      alert('Please write your answer before continuing.');
                      return;
                    }
                    
                    handleSectionComplete(section.id);
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  Submit Answer & Continue
                </Button>
              </div>
            </div>
          </div>
        );

      case 'activity':
        if (content_data.activity_data) {
          const activity = content_data.activity_data;

          // Fill-in-the-Blanks Activity
          if (activity.type === 'discussion') {
            return (
              <FillInBlanksActivity
                activity={activity}
                onComplete={() => handleSectionComplete(section.id)}
              />
            );
          }

          // Matching Activity
          if (activity.type === 'matching') {
            return (
              <div className="space-y-6">
                {/* Activity Header */}
                <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-green-800">
                        🔗 Matching Activity
                      </h4>
                      <h5 className="text-lg font-semibold text-green-700">
                        {activity.title}
                      </h5>
                    </div>
                  </div>
                  <p className="text-green-700 mb-4">{activity.description}</p>

                  {/* Instructions */}
                  <div className="space-y-3">
                    <h6 className="font-semibold text-green-800 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Instructions:
                    </h6>
                    <ul className="list-decimal list-inside space-y-2 text-green-700">
                      {activity.instructions.map((instruction, index) => (
                        <li key={index} className="font-medium">
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Matching Table */}
                {activity.matching_pairs &&
                  activity.matching_pairs.length > 0 && (
                    <div className="space-y-4">
                      <h6 className="font-bold text-gray-800 text-lg flex items-center">
                        <PenTool className="w-5 h-5 mr-2" />
                        Match the Following:
                      </h6>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-lg">
                          <thead className="bg-green-100">
                            <tr>
                              <th className="border border-gray-300 px-4 py-3 text-left font-bold text-green-800">
                                Answer
                              </th>
                              <th className="border border-gray-300 px-4 py-3 text-left font-bold text-green-800">
                                Column A
                              </th>
                              <th className="border border-gray-300 px-4 py-3 text-left font-bold text-green-800">
                                Column B
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {activity.matching_pairs.map((pair, index) => {
                              const matchingAnswers = quizAnswers[section.id]?.matching_answers || {};
                              const studentAnswer = matchingAnswers[index] || '';
                              const isSubmitted = quizAnswers[section.id]?.matching_submitted || false;
                              const isCorrect = isSubmitted && studentAnswer.toUpperCase() === pair.correct_answer?.toUpperCase();
                              const isIncorrect = isSubmitted && studentAnswer && studentAnswer.toUpperCase() !== pair.correct_answer?.toUpperCase();
                              
                              return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-3">
                                  <input
                                    type="text"
                                    value={studentAnswer}
                                    onChange={(e) => {
                                      const value = e.target.value.toUpperCase();
                                      if (value === '' || /^[A-Z]$/.test(value)) {
                                        setQuizAnswers(prev => ({
                                          ...prev,
                                          [section.id]: {
                                            ...prev[section.id],
                                            matching_answers: {
                                              ...prev[section.id]?.matching_answers,
                                              [index]: value
                                            }
                                          }
                                        }));
                                      }
                                    }}
                                    disabled={isSubmitted}
                                    className={`w-full px-2 py-1 border-2 rounded text-center font-semibold focus:outline-none ${
                                      isCorrect ? 'border-green-500 bg-green-50 text-green-700' :
                                      isIncorrect ? 'border-red-500 bg-red-50 text-red-700' :
                                      'border-gray-300 focus:border-green-500'
                                    }`}
                                    placeholder="?"
                                    maxLength={1}
                                  />
                                  {isSubmitted && (
                                    <div className="text-center mt-1">
                                      {isCorrect ? (
                                        <span className="text-xs text-green-600 font-semibold">✓</span>
                                      ) : isIncorrect ? (
                                        <span className="text-xs text-red-600 font-semibold">✗ {pair.correct_answer}</span>
                                      ) : null}
                                    </div>
                                  )}
                                </td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-gray-700">{index + 1}.</span>
                                    {pair.has_image && pair.image_url ? (
                                      <div className="flex-1">
                                        <img 
                                          src={pair.image_url} 
                                          alt={pair.description || `Diagram ${index + 1}`}
                                          className="max-w-full h-32 object-contain border border-gray-200 rounded p-2 bg-white"
                                          onError={(e) => {
                                            // Fallback to description if image fails to load
                                            const parent = (e.target as HTMLElement).parentElement;
                                            if (parent) {
                                              parent.innerHTML = `<span class="text-gray-600 italic">${pair.description || 'Image not available'}</span>`;
                                            }
                                          }}
                                        />
                                        {pair.description && (
                                          <p className="text-xs text-gray-500 mt-1 italic">{pair.description}</p>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="font-medium text-gray-800">
                                        {pair.description}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <div className="grid grid-cols-1 gap-2">
                                    {activity.matching_pairs &&
                                      activity.matching_pairs.map(
                                        (pair, termIndex) => (
                                          <div
                                            key={termIndex}
                                            className="p-2 bg-gray-100 rounded text-center font-medium text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors">
                                            {String.fromCharCode(
                                              65 + termIndex
                                            )}
                                            . {pair.term}
                                          </div>
                                        )
                                      )}
                                  </div>
                                </td>
                              </tr>
                            );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Score Display */}
                {quizAnswers[section.id]?.matching_submitted && (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-xl">
                    <div className="text-center">
                      <h6 className="text-2xl font-bold text-green-800 mb-2">
                        Your Score: {quizAnswers[section.id]?.matching_score || 0} / {activity.matching_pairs?.length || 0}
                      </h6>
                      <p className="text-lg text-green-700">
                        {Math.round(((quizAnswers[section.id]?.matching_score || 0) / (activity.matching_pairs?.length || 1)) * 100)}% Correct
                      </p>
                      <div className="mt-4 flex items-center justify-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 font-bold text-xl">✓</span>
                          <span className="text-gray-700">{quizAnswers[section.id]?.matching_score || 0} Correct</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-red-600 font-bold text-xl">✗</span>
                          <span className="text-gray-700">{(activity.matching_pairs?.length || 0) - (quizAnswers[section.id]?.matching_score || 0)} Incorrect</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expected Outcome */}
                {activity.expected_outcome && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h6 className="font-semibold text-green-800 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Expected Outcome:
                    </h6>
                    <p className="text-green-700">{activity.expected_outcome}</p>
                  </div>
                )}

                {/* Submit/Complete Button */}
                {!quizAnswers[section.id]?.matching_submitted ? (
                  <Button
                    onClick={() => {
                      const matchingAnswers = quizAnswers[section.id]?.matching_answers || {};
                      const totalQuestions = activity.matching_pairs?.length || 0;
                      
                      // Check if all answers are filled
                      let allAnswered = true;
                      for (let i = 0; i < totalQuestions; i++) {
                        if (!matchingAnswers[i]) {
                          allAnswered = false;
                          break;
                        }
                      }
                      
                      if (!allAnswered) {
                        alert('Please answer all questions before submitting.');
                        return;
                      }
                      
                      // Calculate score
                      let score = 0;
                      activity.matching_pairs?.forEach((pair, index) => {
                        if (matchingAnswers[index]?.toUpperCase() === pair.correct_answer?.toUpperCase()) {
                          score++;
                        }
                      });
                      
                      // Save score and mark as submitted
                      setQuizAnswers(prev => ({
                        ...prev,
                        [section.id]: {
                          ...prev[section.id],
                          matching_submitted: true,
                          matching_score: score
                        }
                      }));
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Answers
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSectionComplete(section.id)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete Matching Activity
                  </Button>
                )}
              </div>
            );
          }

          // True/False with Correction Activity
          if (activity.type === 'true_false_correction') {
            return (
              <div className="space-y-6">
                {/* Activity Header */}
                <div className="p-6 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-amber-800">
                        ✓✗ True or False Activity
                      </h4>
                      <h5 className="text-lg font-semibold text-amber-700">
                        {activity.title}
                      </h5>
                    </div>
                  </div>
                  <p className="text-amber-700 mb-4">{activity.description}</p>

                  {/* Instructions */}
                  {activity.instructions && activity.instructions.length > 0 && (
                    <div className="space-y-3">
                      <h6 className="font-semibold text-amber-800 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Instructions:
                      </h6>
                      <ol className="list-decimal list-inside space-y-2 text-amber-700">
                        {activity.instructions.map((instruction, index) => (
                          <li key={index} className="font-medium">
                            {instruction}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                {/* Statements Table */}
                {activity.statements && activity.statements.length > 0 && (
                  <div className="space-y-4">
                    <h6 className="font-bold text-gray-800 text-lg flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Statements:
                    </h6>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-lg">
                        <thead className="bg-amber-100">
                          <tr>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-amber-800 w-20">
                              #
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-amber-800">
                              Statement
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-bold text-amber-800 w-32">
                              True/False
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-amber-800">
                              If False, Correct the Statement
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {activity.statements.map((item, index) => {
                            const statementKey = `${section.id}_statement_${index}`;
                            const answerData = quizAnswers[section.id]?.statements?.[index] || {};
                            const isSubmitted = quizAnswers[section.id]?.tf_correction_submitted;
                            const correctAnswer = item.is_true ? 'true' : 'false';
                            const isCorrect = answerData.answer === correctAnswer;
                            
                            return (
                              <tr key={index} className={`hover:bg-gray-50 ${
                                isSubmitted 
                                  ? isCorrect 
                                    ? 'bg-green-50' 
                                    : 'bg-red-50'
                                  : ''
                              }`}>
                                <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                                  {index + 1}
                                </td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <p className="text-gray-800">{item.statement}</p>
                                </td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <div className="flex justify-center items-center space-x-4">
                                    <div className="flex space-x-4">
                                      <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={statementKey}
                                          value="true"
                                          checked={answerData.answer === 'true'}
                                          disabled={isSubmitted}
                                          onChange={(e) => {
                                            setQuizAnswers(prev => ({
                                              ...prev,
                                              [section.id]: {
                                                ...prev[section.id],
                                                statements: {
                                                  ...prev[section.id]?.statements,
                                                  [index]: {
                                                    ...answerData,
                                                    answer: 'true'
                                                  }
                                                }
                                              }
                                            }));
                                          }}
                                          className="w-4 h-4 text-green-600"
                                        />
                                        <span className="text-sm font-medium text-green-700">True</span>
                                      </label>
                                      <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={statementKey}
                                          value="false"
                                          checked={answerData.answer === 'false'}
                                          disabled={isSubmitted}
                                          onChange={(e) => {
                                            setQuizAnswers(prev => ({
                                              ...prev,
                                              [section.id]: {
                                                ...prev[section.id],
                                                statements: {
                                                  ...prev[section.id]?.statements,
                                                  [index]: {
                                                    ...answerData,
                                                    answer: 'false'
                                                  }
                                                }
                                              }
                                            }));
                                          }}
                                          className="w-4 h-4 text-red-600"
                                        />
                                        <span className="text-sm font-medium text-red-700">False</span>
                                      </label>
                                    </div>
                                    {isSubmitted && (
                                      <div className="flex items-center">
                                        {isCorrect ? (
                                          <span className="text-green-600 font-bold text-xl">✓</span>
                                        ) : (
                                          <div className="flex items-center space-x-1">
                                            <span className="text-red-600 font-bold text-xl">✗</span>
                                            <span className="text-xs text-gray-600">
                                              ({item.is_true ? 'TRUE' : 'FALSE'})
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <Textarea
                                    placeholder="If false, write the correct statement here..."
                                    value={answerData.correction || ''}
                                    disabled={isSubmitted}
                                    onChange={(e) => {
                                      setQuizAnswers(prev => ({
                                        ...prev,
                                        [section.id]: {
                                          ...prev[section.id],
                                          statements: {
                                            ...prev[section.id]?.statements,
                                            [index]: {
                                              ...answerData,
                                              correction: e.target.value
                                            }
                                          }
                                        }
                                      }));
                                    }}
                                    className="min-h-[80px] resize-y text-sm"
                                    disabled={answerData.answer === 'true'}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Score Display */}
                {quizAnswers[section.id]?.tf_correction_submitted && (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-xl">
                    <div className="text-center">
                      <h6 className="text-2xl font-bold text-green-800 mb-2">
                        Your Score: {quizAnswers[section.id]?.tf_correction_score || 0} / {activity.statements?.length || 0}
                      </h6>
                      <p className="text-lg text-green-700">
                        {Math.round(((quizAnswers[section.id]?.tf_correction_score || 0) / (activity.statements?.length || 1)) * 100)}% Correct (True/False)
                      </p>
                      <div className="mt-4 flex items-center justify-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 font-bold text-xl">✓</span>
                          <span className="text-gray-700">{quizAnswers[section.id]?.tf_correction_score || 0} Correct</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-red-600 font-bold text-xl">✗</span>
                          <span className="text-gray-700">{(activity.statements?.length || 0) - (quizAnswers[section.id]?.tf_correction_score || 0)} Incorrect</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-3 italic">
                        Your corrections will be reviewed by your teacher
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit/Complete Button */}
                {!quizAnswers[section.id]?.tf_correction_submitted ? (
                  <Button
                    onClick={() => {
                      // Validate that all statements have been answered
                      const statements = activity.statements || [];
                      const answers = quizAnswers[section.id]?.statements || {};
                      
                      let allAnswered = true;
                      for (let i = 0; i < statements.length; i++) {
                        if (!answers[i]?.answer) {
                          allAnswered = false;
                          break;
                        }
                        // Check if false answer has correction
                        if (answers[i]?.answer === 'false' && !answers[i]?.correction?.trim()) {
                          alert(`Please provide a correction for statement ${i + 1}`);
                          return;
                        }
                      }
                      
                      if (!allAnswered) {
                        alert('Please answer all statements before continuing.');
                        return;
                      }
                      
                      // Calculate score (only for True/False part)
                      let score = 0;
                      statements.forEach((stmt, index) => {
                        const correctAnswer = stmt.is_true ? 'true' : 'false';
                        if (answers[index]?.answer === correctAnswer) {
                          score++;
                        }
                      });
                      
                      // Save score and mark as submitted
                      setQuizAnswers(prev => ({
                        ...prev,
                        [section.id]: {
                          ...prev[section.id],
                          tf_correction_submitted: true,
                          tf_correction_score: score
                        }
                      }));
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Answers
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSectionComplete(section.id)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete True/False Activity
                  </Button>
                )}
              </div>
            );
          }

          // Simple True/False Activity
          if (activity.type === 'true_false_simple') {
            return (
              <div className="space-y-6">
                {/* Activity Header */}
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-indigo-800">
                        ✓✗ True or False
                      </h4>
                      <h5 className="text-lg font-semibold text-indigo-700">
                        {activity.title}
                      </h5>
                    </div>
                  </div>
                  <p className="text-indigo-700">{activity.description}</p>
                </div>

                {/* Statements */}
                {activity.statements && activity.statements.length > 0 && (
                  <div className="space-y-4">
                    {activity.statements.map((item, index) => {
                      const studentAnswer = quizAnswers[section.id]?.simple_tf_answers?.[index];
                      const isSubmitted = quizAnswers[section.id]?.simple_tf_submitted;
                      const isCorrect = studentAnswer === (item.is_true ? 'true' : 'false');
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-4 border-2 rounded-lg ${
                            isSubmitted 
                              ? isCorrect 
                                ? 'border-green-400 bg-green-50' 
                                : 'border-red-400 bg-red-50'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="font-bold text-gray-700 text-lg">{index + 1}.</span>
                            <div className="flex-1 space-y-3">
                              <p className="text-gray-800 font-medium">{item.statement}</p>
                              
                              <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`simple_tf_${section.id}_${index}`}
                                    value="true"
                                    checked={studentAnswer === 'true'}
                                    disabled={isSubmitted}
                                    onChange={() => {
                                      setQuizAnswers(prev => ({
                                        ...prev,
                                        [section.id]: {
                                          ...prev[section.id],
                                          simple_tf_answers: {
                                            ...prev[section.id]?.simple_tf_answers,
                                            [index]: 'true'
                                          }
                                        }
                                      }));
                                    }}
                                    className="w-4 h-4 text-green-600"
                                  />
                                  <span className="text-sm font-semibold text-green-700">TRUE</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`simple_tf_${section.id}_${index}`}
                                    value="false"
                                    checked={studentAnswer === 'false'}
                                    disabled={isSubmitted}
                                    onChange={() => {
                                      setQuizAnswers(prev => ({
                                        ...prev,
                                        [section.id]: {
                                          ...prev[section.id],
                                          simple_tf_answers: {
                                            ...prev[section.id]?.simple_tf_answers,
                                            [index]: 'false'
                                          }
                                        }
                                      }));
                                    }}
                                    className="w-4 h-4 text-red-600"
                                  />
                                  <span className="text-sm font-semibold text-red-700">FALSE</span>
                                </label>
                                
                                {isSubmitted && (
                                  <div className="flex items-center space-x-2">
                                    {isCorrect ? (
                                      <span className="text-green-600 font-bold text-xl">✓</span>
                                    ) : (
                                      <>
                                        <span className="text-red-600 font-bold text-xl">✗</span>
                                        <span className="text-sm text-gray-600">
                                          Correct: <span className="font-bold">{item.is_true ? 'TRUE' : 'FALSE'}</span>
                                        </span>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Score Display */}
                {quizAnswers[section.id]?.simple_tf_submitted && (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-xl">
                    <div className="text-center">
                      <h6 className="text-2xl font-bold text-green-800 mb-2">
                        Your Score: {quizAnswers[section.id]?.simple_tf_score || 0} / {activity.statements?.length || 0}
                      </h6>
                      <p className="text-lg text-green-700">
                        {Math.round(((quizAnswers[section.id]?.simple_tf_score || 0) / (activity.statements?.length || 1)) * 100)}% Correct
                      </p>
                      <div className="mt-4 flex items-center justify-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 font-bold text-xl">✓</span>
                          <span className="text-gray-700">{quizAnswers[section.id]?.simple_tf_score || 0} Correct</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-red-600 font-bold text-xl">✗</span>
                          <span className="text-gray-700">{(activity.statements?.length || 0) - (quizAnswers[section.id]?.simple_tf_score || 0)} Incorrect</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit/Complete Button */}
                {!quizAnswers[section.id]?.simple_tf_submitted ? (
                  <Button
                    onClick={() => {
                      const statements = activity.statements || [];
                      const answers = quizAnswers[section.id]?.simple_tf_answers || {};
                      
                      // Check all answered
                      let allAnswered = true;
                      for (let i = 0; i < statements.length; i++) {
                        if (!answers[i]) {
                          allAnswered = false;
                          break;
                        }
                      }
                      
                      if (!allAnswered) {
                        alert('Please answer all statements before submitting.');
                        return;
                      }
                      
                      // Calculate score
                      let score = 0;
                      statements.forEach((stmt, index) => {
                        const correctAnswer = stmt.is_true ? 'true' : 'false';
                        if (answers[index] === correctAnswer) {
                          score++;
                        }
                      });
                      
                      // Save score and mark as submitted
                      setQuizAnswers(prev => ({
                        ...prev,
                        [section.id]: {
                          ...prev[section.id],
                          simple_tf_submitted: true,
                          simple_tf_score: score
                        }
                      }));
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Answers
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSectionComplete(section.id)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete True/False Activity
                  </Button>
                )}
              </div>
            );
          }

          // Think, Write, Understand Activity
          if (activity.type === 'think_write_understand') {
            return (
              <div className="space-y-6">
                {/* Activity Header */}
                <div className="p-6 bg-gradient-to-r from-cyan-50 to-cyan-100 border border-cyan-200 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-cyan-500 rounded-lg">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-cyan-800">
                        💡 Think, Write, Understand
                      </h4>
                      <h5 className="text-lg font-semibold text-cyan-700">
                        {activity.title}
                      </h5>
                    </div>
                  </div>
                  <p className="text-cyan-700">{activity.description}</p>
                </div>

                {/* Part I: Sentence Completion */}
                {activity.part1_title && activity.sentences && activity.sentences.length > 0 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                      <h5 className="font-bold text-cyan-800 text-lg">{activity.part1_title}</h5>
                      {activity.part1_instruction && (
                        <p className="text-sm text-cyan-700 mt-1">
                          <strong>Instruction:</strong> {activity.part1_instruction}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {activity.sentences.map((sentence, index) => {
                        const sentenceKey = `sentence_${index}`;
                        const answer = quizAnswers[section.id]?.sentences?.[index] || '';
                        
                        return (
                          <div key={index} className="p-4 bg-white border border-gray-300 rounded-lg">
                            <div className="space-y-2">
                              <p className="text-gray-800 font-medium">{sentence.prompt}</p>
                              <div className="border-b-2 border-gray-400 pb-2">
                                <Textarea
                                  placeholder="Complete the sentence..."
                                  value={answer}
                                  onChange={(e) => {
                                    setQuizAnswers(prev => ({
                                      ...prev,
                                      [section.id]: {
                                        ...prev[section.id],
                                        sentences: {
                                          ...prev[section.id]?.sentences,
                                          [index]: e.target.value
                                        }
                                      }
                                    }));
                                  }}
                                  className="min-h-[80px] resize-y border-0 focus:ring-0 px-0"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Part II: Creative Writing */}
                {activity.part2_title && activity.writing_prompt && (
                  <div className="space-y-4">
                    <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                      <h5 className="font-bold text-cyan-800 text-lg">{activity.part2_title}</h5>
                    </div>

                    {activity.writing_prompt.title && (
                      <div className="p-4 bg-white border border-gray-300 rounded-lg">
                        <h6 className="font-semibold text-gray-800 mb-3">
                          <strong>Instructions:</strong>
                        </h6>
                        {activity.writing_prompt.instructions && activity.writing_prompt.instructions.length > 0 && (
                          <ol className="space-y-2 text-gray-700">
                            {activity.writing_prompt.instructions.map((instruction, index) => (
                              <li key={index} className="text-sm">
                                {instruction.trim().startsWith('-') ? (
                                  <span className="ml-4">{instruction}</span>
                                ) : (
                                  <span>{index + 1}. {instruction}</span>
                                )}
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    )}

                    {/* Writing Box */}
                    <div className="p-4 bg-white border-2 border-gray-400 rounded-lg min-h-[300px]">
                      <Textarea
                        placeholder="Write your poem or creative response here..."
                        value={quizAnswers[section.id]?.creative_writing || ''}
                        onChange={(e) => {
                          setQuizAnswers(prev => ({
                            ...prev,
                            [section.id]: {
                              ...prev[section.id],
                              creative_writing: e.target.value
                            }
                          }));
                        }}
                        className="min-h-[250px] resize-y border-0 focus:ring-0"
                      />
                    </div>
                  </div>
                )}

                {/* Assessment Rubric Display */}
                {activity.rubric && activity.rubric.length > 0 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                      <h5 className="font-bold text-cyan-800 text-lg flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Assessment Rubric
                      </h5>
                      <p className="text-sm text-cyan-700 mt-1">
                        Your work will be evaluated based on the following criteria:
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-lg">
                        <thead className="bg-cyan-100">
                          <tr>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-cyan-800 w-1/4">
                              Criteria
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-cyan-800">
                              Excellent (10)
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-cyan-800">
                              Good (7-9)
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-cyan-800">
                              Needs Improvement (1-6)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {activity.rubric.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-800 bg-gray-50">
                                {row.criteria}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                {row.excellent}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                {row.good}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                {row.needs_improvement}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Complete Button */}
                <Button
                  onClick={() => {
                    // Validate that all sentences are completed
                    const sentences = activity.sentences || [];
                    const sentenceAnswers = quizAnswers[section.id]?.sentences || {};
                    
                    let allSentencesCompleted = true;
                    for (let i = 0; i < sentences.length; i++) {
                      if (!sentenceAnswers[i]?.trim()) {
                        allSentencesCompleted = false;
                        break;
                      }
                    }
                    
                    if (!allSentencesCompleted) {
                      alert('Please complete all sentences before continuing.');
                      return;
                    }
                    
                    // Check creative writing
                    const creativeWriting = quizAnswers[section.id]?.creative_writing || '';
                    if (!creativeWriting.trim()) {
                      alert('Please complete the creative writing section before continuing.');
                      return;
                    }
                    
                    handleSectionComplete(section.id);
                  }}
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete Activity
                </Button>
              </div>
            );
          }

          // Table + Questions Activity
          if (activity.type === 'table_and_questions') {
            return (
              <div className="space-y-6">
                {/* Activity Header */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Table className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-blue-800">
                        📊 Table + Questions Activity
                      </h4>
                      <h5 className="text-lg font-semibold text-blue-700">
                        {activity.title}
                      </h5>
                    </div>
                  </div>
                  <p className="text-blue-700">{activity.description}</p>
                </div>

                {/* Part A: Fill in the Table */}
                {activity.part_a_title && activity.table && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-bold text-blue-800 text-lg">{activity.part_a_title}</h5>
                      {activity.part_a_instruction && (
                        <p className="text-sm text-blue-700 mt-1">
                          {activity.part_a_instruction}
                        </p>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-lg">
                        <thead className="bg-blue-100">
                          <tr>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-blue-800">
                              Features
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-blue-800">
                              Sexual Reproduction
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-blue-800">
                              Asexual Reproduction
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {activity.table.rows?.map((row, index) => {
                            const rowAnswers = quizAnswers[section.id]?.table_rows?.[index] || {};
                            
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-800 bg-gray-50">
                                  {row.feature}
                                </td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <Textarea
                                    placeholder={row.sexual || 'Type your answer...'}
                                    value={rowAnswers.sexual || ''}
                                    onChange={(e) => {
                                      setQuizAnswers(prev => ({
                                        ...prev,
                                        [section.id]: {
                                          ...prev[section.id],
                                          table_rows: {
                                            ...prev[section.id]?.table_rows,
                                            [index]: {
                                              ...rowAnswers,
                                              sexual: e.target.value
                                            }
                                          }
                                        }
                                      }));
                                    }}
                                    className="min-h-[60px] resize-y text-sm"
                                  />
                                </td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <Textarea
                                    placeholder={row.asexual || 'Type your answer...'}
                                    value={rowAnswers.asexual || ''}
                                    onChange={(e) => {
                                      setQuizAnswers(prev => ({
                                        ...prev,
                                        [section.id]: {
                                          ...prev[section.id],
                                          table_rows: {
                                            ...prev[section.id]?.table_rows,
                                            [index]: {
                                              ...rowAnswers,
                                              asexual: e.target.value
                                            }
                                          }
                                        }
                                      }));
                                    }}
                                    className="min-h-[60px] resize-y text-sm"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Part B: Generalization Questions */}
                {activity.part_b_title && activity.questions && activity.questions.length > 0 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-bold text-blue-800 text-lg">{activity.part_b_title}</h5>
                      {activity.part_b_instruction && (
                        <p className="text-sm text-blue-700 mt-1">
                          {activity.part_b_instruction}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {activity.questions.map((question, index) => {
                        const questionText = typeof question === 'string' ? question : question.question || '';
                        const questionPoints = typeof question === 'object' ? question.points || 5 : 5;
                        const questionRubric = typeof question === 'object' ? question.rubric || '' : '';
                        const answer = quizAnswers[section.id]?.generalization_answers?.[index] || '';
                        
                        return (
                          <div key={index} className="p-4 bg-white border border-gray-300 rounded-lg">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <p className="text-gray-800 font-medium flex-1">
                                  <span className="font-bold">{index + 1}.</span> {questionText}
                                </p>
                                <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                  {questionPoints} pts
                                </span>
                              </div>
                              {questionRubric && (
                                <p className="text-xs text-gray-500 italic">
                                  Rubric: {questionRubric}
                                </p>
                              )}
                              <Textarea
                                placeholder="Write your answer here..."
                                value={answer}
                                onChange={(e) => {
                                  setQuizAnswers(prev => ({
                                    ...prev,
                                    [section.id]: {
                                      ...prev[section.id],
                                      generalization_answers: {
                                        ...prev[section.id]?.generalization_answers,
                                        [index]: e.target.value
                                      }
                                    }
                                  }));
                                }}
                                className="min-h-[100px] resize-y"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Score Display */}
                {quizAnswers[section.id]?.table_submitted && (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-xl">
                    <div className="text-center">
                      <h6 className="text-2xl font-bold text-green-800 mb-4">
                        🎯 Activity Results
                      </h6>
                      
                      {/* Part A Score */}
                      <div className="mb-4 p-4 bg-white rounded-lg">
                        <h6 className="text-lg font-semibold text-gray-800 mb-2">Part A: Table Score</h6>
                        <p className="text-3xl font-bold text-blue-600">
                          {quizAnswers[section.id]?.table_score || 0} / {(activity.table?.rows?.length || 0) * 2}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {Math.round(((quizAnswers[section.id]?.table_score || 0) / ((activity.table?.rows?.length || 1) * 2)) * 100)}% Correct
                        </p>
                      </div>

                      {/* Part B Info */}
                      <div className="p-4 bg-white rounded-lg">
                        <h6 className="text-lg font-semibold text-gray-800 mb-2">Part B: Generalization Questions</h6>
                        <p className="text-sm text-gray-600">
                          Total Points Available: <span className="font-bold text-blue-600">
                            {activity.questions?.reduce((sum, q) => sum + (typeof q === 'object' ? q.points || 5 : 5), 0) || 0} points
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Your answers will be reviewed by your teacher
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit/Complete Button */}
                {!quizAnswers[section.id]?.table_submitted ? (
                  <Button
                    onClick={() => {
                      // Validate that all table cells are filled
                      const rows = activity.table?.rows || [];
                      const tableAnswers = quizAnswers[section.id]?.table_rows || {};
                      
                      let allTableFilled = true;
                      for (let i = 0; i < rows.length; i++) {
                        if (!tableAnswers[i]?.sexual?.trim() || !tableAnswers[i]?.asexual?.trim()) {
                          allTableFilled = false;
                          break;
                        }
                      }
                      
                      if (!allTableFilled) {
                        alert('Please fill in all table cells before continuing.');
                        return;
                      }
                      
                      // Validate that all questions are answered
                      const questions = activity.questions || [];
                      const generalizationAnswers = quizAnswers[section.id]?.generalization_answers || {};
                      
                      let allQuestionsAnswered = true;
                      for (let i = 0; i < questions.length; i++) {
                        if (!generalizationAnswers[i]?.trim()) {
                          allQuestionsAnswered = false;
                          break;
                        }
                      }
                      
                      if (!allQuestionsAnswered) {
                        alert('Please answer all generalization questions before continuing.');
                        return;
                      }
                      
                      // Auto-grade Part A (Table)
                      let tableScore = 0;
                      rows.forEach((row, index) => {
                        const studentSexual = tableAnswers[index]?.sexual?.toLowerCase().trim() || '';
                        const studentAsexual = tableAnswers[index]?.asexual?.toLowerCase().trim() || '';
                        const correctSexual = row.answer_sexual?.toLowerCase() || '';
                        const correctAsexual = row.answer_asexual?.toLowerCase() || '';
                        
                        // Check if student answer contains key words from correct answer
                        if (correctSexual && studentSexual.includes(correctSexual.toLowerCase())) {
                          tableScore++;
                        }
                        if (correctAsexual) {
                          // For multiple acceptable answers (e.g., "Budding, Binary fission")
                          const acceptableAnswers = correctAsexual.split(',').map(a => a.trim().toLowerCase());
                          if (acceptableAnswers.some(ans => studentAsexual.includes(ans))) {
                            tableScore++;
                          }
                        }
                      });
                      
                      // Save score and mark as submitted
                      setQuizAnswers(prev => ({
                        ...prev,
                        [section.id]: {
                          ...prev[section.id],
                          table_submitted: true,
                          table_score: tableScore
                        }
                      }));
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Answers
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSectionComplete(section.id)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete Activity
                  </Button>
                )}
              </div>
            );
          }

          // Experiment Activity
          if (activity.type === 'experiment') {
            return (
              <div className="space-y-6">
                {/* Activity Header */}
                <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-purple-800">
                        🔬 Experiment Activity
                      </h4>
                      <h5 className="text-lg font-semibold text-purple-700">
                        {activity.title}
                      </h5>
                    </div>
                  </div>
                  <p className="text-purple-700 mb-4">{activity.description}</p>

                  {/* Instructions */}
                  {activity.instructions && activity.instructions.length > 0 && (
                    <div className="space-y-3">
                      <h6 className="font-semibold text-purple-800 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Quick Instructions:
                      </h6>
                      <ul className="list-decimal list-inside space-y-2 text-purple-700">
                        {activity.instructions.map((instruction, index) => (
                          <li key={index} className="font-medium">
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Materials Needed */}
                {activity.materials && activity.materials.length > 0 && (
                  <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
                    <h6 className="font-bold text-purple-800 mb-4 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      MATERIALS NEEDED
                    </h6>
                    <ul className="space-y-2">
                      {activity.materials.map((material, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-purple-700">
                          <span className="text-purple-500 font-bold">•</span>
                          <span>{material}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Detailed Instructions */}
                {activity.detailed_instructions && (
                  <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <h6 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      DETAILED INSTRUCTIONS
                    </h6>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: activity.detailed_instructions
                      }}
                    />
                  </div>
                )}

                {/* Process Questions */}
                {activity.process_questions &&
                  activity.process_questions.length > 0 && (
                    <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <h6 className="font-bold text-blue-800 mb-4 flex items-center">
                        <Brain className="w-5 h-5 mr-2" />
                        PROCESS QUESTIONS
                      </h6>
                      <div className="space-y-4">
                        {activity.process_questions.map((question, index) => (
                          <div
                            key={index}
                            className="p-4 bg-white border border-blue-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <span className="text-lg font-bold text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <p className="text-gray-800 font-medium mb-3">
                                  {question}
                                </p>
                                <textarea
                                  className="w-full px-3 py-2 border-2 border-blue-400 bg-blue-50 rounded-lg text-blue-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-colors min-h-[100px] resize-none"
                                  placeholder="Type your answer here..."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Assessment Rubric */}
                {activity.rubric && activity.rubric.length > 0 && (
                  <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <h6 className="font-bold text-yellow-800 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      ASSESSMENT RUBRIC
                    </h6>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white">
                        <thead className="bg-gradient-to-r from-yellow-100 to-yellow-200">
                          <tr>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800">
                              Criteria
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-green-700">
                              Excellent (4 pts)
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-blue-700">
                              Good (3 pts)
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-yellow-700">
                              Fair (2 pts)
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-red-700">
                              Needs Improvement (1 pt)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {activity.rubric.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-800">
                                {row.criteria}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                {row.excellent}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                {row.good}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                {row.fair}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                {row.needs_improvement}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Expected Outcome */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h6 className="font-semibold text-green-800 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Expected Outcome:
                  </h6>
                  <p className="text-green-700">{activity.expected_outcome}</p>
                </div>

                {/* Complete Button */}
                <Button
                  onClick={() => handleSectionComplete(section.id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete Experiment Activity
                </Button>
              </div>
            );
          }

          // Default Activity (for other types)
          return (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">
                  🎯 Interactive Activity
                </h4>
                <h5 className="text-lg font-medium text-purple-700 mb-2">
                  {activity.title}
                </h5>
                <p className="text-purple-700 mb-4">{activity.description}</p>

                {activity.instructions && activity.instructions.length > 0 && (
                  <div className="space-y-3">
                    <h6 className="font-medium text-purple-800">Instructions:</h6>
                    <ul className="list-decimal list-inside space-y-1 text-purple-700">
                      {activity.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activity.materials_needed && (
                  <div className="mt-4">
                    <h6 className="font-medium text-purple-800 mb-2">
                      Materials Needed:
                    </h6>
                    <div className="flex flex-wrap gap-2">
                      {activity.materials_needed.map((material, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-purple-100 text-purple-800">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h6 className="font-medium text-gray-800 mb-2">
                  Expected Outcome:
                </h6>
                <p className="text-gray-700">{activity.expected_outcome}</p>
              </div>

              <Button
                onClick={() => handleSectionComplete(section.id)}
                className="w-full bg-purple-600 hover:bg-purple-700">
                Mark Activity as Complete
              </Button>
            </div>
          );
        }
        return null;

      default:
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Content type "{content_type}" not yet supported.
            </p>
          </div>
        );
    }
  };

  const renderLearningStyleTags = (tags: string[]) => {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map(tag => {
          const Icon =
            learningStyleIcons[tag as keyof typeof learningStyleIcons];
          const color =
            learningStyleColors[tag as keyof typeof learningStyleColors];
          return (
            <Badge key={tag} className={`bg-gradient-to-r ${color} text-white`}>
              <Icon className="w-3 h-3 mr-1" />
              {tag.replace('_', ' ')}
            </Badge>
          );
        })}
      </div>
    );
  };

  // ✅ VALIDATION: Check if section is complete before allowing navigation
  const isSectionComplete = useCallback((sectionId: string) => {
    return sectionProgress[sectionId] === true;
  }, [sectionProgress]);

  const canNavigateToNext = useCallback(() => {
    const currentSectionId = currentSection.id;
    const isComplete = isSectionComplete(currentSectionId);
    
    // Check if section has assessment that needs completion
    const hasAssessment = currentSection.content_type === 'assessment';
    const hasSubmittedAssessment = showQuizResults[currentSectionId];
    
    if (hasAssessment && !hasSubmittedAssessment) {
      return {
        allowed: false,
        reason: 'Please complete and submit the assessment before proceeding.'
      };
    }
    
    // Check if section is marked complete
    if (!isComplete) {
      return {
        allowed: false,
        reason: 'Please complete this section before moving to the next one.'
      };
    }
    
    return { allowed: true, reason: '' };
  }, [currentSection, isSectionComplete, showQuizResults]);

  const goToNextSection = () => {
    const validation = canNavigateToNext();
    
    if (!validation.allowed) {
      // Show warning toast
      alert(validation.reason);
      return;
    }
    
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ✅ MODULE COMPLETION HANDLER
  const handleModuleCompletion = useCallback(async () => {
    if (!userId || !userName || previewMode || hasShownCompletion) return;

    try {
      const varkAPI = new VARKModulesAPI();
      
      // Calculate time spent (in minutes)
      const timeSpentMinutes = Math.round((Date.now() - startTime) / 60000);
      
      // Get assessment scores
      const preTestResult = Object.entries(assessmentResults).find(([key]) => 
        key.includes('pre-test')
      )?.[1];
      const postTestResult = Object.entries(assessmentResults).find(([key]) => 
        key.includes('post-test')
      )?.[1];
      
      const preTestScore = preTestResult?.percentage || 0;
      const postTestScore = postTestResult?.percentage || 0;
      
      // Calculate final score (average of all assessments or post-test)
      const allScores = Object.values(assessmentResults)
        .filter((result: any) => result?.percentage)
        .map((result: any) => result.percentage);
      const finalScore = allScores.length > 0
        ? Math.round(allScores.reduce((sum: number, score: number) => sum + score, 0) / allScores.length)
        : postTestScore || 0;
      
      // Count perfect sections (100% score)
      const perfectSections = Object.values(assessmentResults)
        .filter((result: any) => result?.percentage === 100).length;

      console.log('🎉 Module Completion Data:', {
        finalScore,
        timeSpentMinutes,
        preTestScore,
        postTestScore,
        sectionsCompleted: totalSections,
        perfectSections
      });

      // Save completion to database
      await varkAPI.completeModule({
        student_id: userId,
        module_id: module.id,
        final_score: finalScore,
        time_spent_minutes: timeSpentMinutes,
        pre_test_score: preTestScore > 0 ? preTestScore : undefined,
        post_test_score: postTestScore > 0 ? postTestScore : undefined,
        sections_completed: totalSections,
        perfect_sections: perfectSections
      });

      // Determine badge based on score
      let badge = null;
      if (finalScore >= 100) {
        badge = {
          name: 'Perfect Mastery',
          icon: '💎',
          description: `Achieved perfect score on ${module.title}!`,
          rarity: 'platinum' as const
        };
        await varkAPI.awardBadge({
          student_id: userId,
          badge_type: 'perfect_score',
          badge_name: badge.name,
          badge_description: badge.description,
          badge_icon: badge.icon,
          badge_rarity: badge.rarity,
          module_id: module.id,
          criteria_met: { score: finalScore, perfect_sections: perfectSections }
        });
      } else if (finalScore >= 90) {
        badge = {
          name: `${module.title} Master`,
          icon: '🏆',
          description: `Scored ${finalScore}% on ${module.title}!`,
          rarity: 'gold' as const
        };
        await varkAPI.awardBadge({
          student_id: userId,
          badge_type: 'high_scorer',
          badge_name: badge.name,
          badge_description: badge.description,
          badge_icon: badge.icon,
          badge_rarity: badge.rarity,
          module_id: module.id,
          criteria_met: { score: finalScore, improvement: postTestScore - preTestScore }
        });
      } else if (finalScore >= 80) {
        badge = {
          name: 'Excellence Achieved',
          icon: '🥈',
          description: `Great work on ${module.title}!`,
          rarity: 'silver' as const
        };
        await varkAPI.awardBadge({
          student_id: userId,
          badge_type: 'high_scorer',
          badge_name: badge.name,
          badge_description: badge.description,
          badge_icon: badge.icon,
          badge_rarity: badge.rarity,
          module_id: module.id,
          criteria_met: { score: finalScore }
        });
      } else {
        badge = {
          name: 'Module Completed',
          icon: '✅',
          description: `Finished ${module.title}`,
          rarity: 'bronze' as const
        };
        await varkAPI.awardBadge({
          student_id: userId,
          badge_type: 'completion',
          badge_name: badge.name,
          badge_description: badge.description,
          badge_icon: badge.icon,
          badge_rarity: badge.rarity,
          module_id: module.id,
          criteria_met: { completed: true }
        });
      }

      setEarnedBadge(badge);

      // Notify teacher
      if (module.created_by) {
        await varkAPI.notifyTeacher({
          teacher_id: module.created_by,
          type: 'module_completion',
          title: 'Student Completed Module',
          message: `${userName} completed "${module.title}" with a score of ${finalScore}%`,
          student_id: userId,
          module_id: module.id,
          priority: finalScore < 60 ? 'high' : 'normal'
        });
      }

      // Set completion data for modal
      setCompletionData({
        finalScore,
        timeSpent: timeSpentMinutes,
        preTestScore: preTestScore > 0 ? preTestScore : undefined,
        postTestScore: postTestScore > 0 ? postTestScore : undefined,
        sectionsCompleted: totalSections,
        totalSections,
        perfectSections
      });

      // Show completion modal
      setShowCompletionModal(true);
      setHasShownCompletion(true);

      toast.success('Module completed! 🎉');
    } catch (error) {
      console.error('Error handling module completion:', error);
      toast.error('Failed to save completion. Please try again.');
    }
  }, [
    userId,
    userName,
    module,
    totalSections,
    assessmentResults,
    startTime,
    previewMode,
    hasShownCompletion
  ]);

  // ✅ CHECK FOR MODULE COMPLETION
  useEffect(() => {
    if (
      !previewMode &&
      !hasShownCompletion &&
      completedSections === totalSections &&
      totalSections > 0 &&
      userId
    ) {
      // Small delay to ensure all state is updated
      const timer = setTimeout(() => {
        handleModuleCompletion();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [completedSections, totalSections, previewMode, hasShownCompletion, userId, handleModuleCompletion]);

  return (
    <div className="space-y-6 relative pb-24 md:pb-0">
      {/* ✨ Mobile Section List - Collapsible menu for mobile */}
      {!previewMode && (
        <MobileSectionList
          sections={memoizedSections}
          currentSectionIndex={currentSectionIndex}
          onSectionChange={(index) => {
            setCurrentSectionIndex(index);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          sectionProgress={sectionProgress}
        />
      )}

      {/* Progress Overview - Desktop only */}
      {!previewMode && (
        <Card className="hidden md:block bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Progress
                  </h3>
                  <p className="text-sm text-gray-600">
                    {completedSections} of {totalSections} sections completed
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-xs text-gray-600">Complete</div>
                </div>
                <Progress value={progressPercentage} className="w-32 h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✨ Swipe Handler for Mobile Gestures */}
      <SwipeHandler
      onSwipeLeft={() => {
        if (!previewMode && currentSectionIndex < totalSections - 1) {
          setCurrentSectionIndex(prev => prev + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }}
      onSwipeRight={() => {
        if (!previewMode && currentSectionIndex > 0) {
          setCurrentSectionIndex(prev => prev - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }}
    >
      {/* Mobile Section Header */}
      {!previewMode && (
        <MobileSectionHeader
          section={currentSection}
          sectionNumber={currentSectionIndex + 1}
          totalSections={totalSections}
          isCompleted={sectionProgress[currentSection.id]}
        />
      )}

      {/* Section Navigation - Desktop only */}
      {!previewMode && (
        <div className="hidden md:flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={goToPreviousSection}
            disabled={currentSectionIndex === 0}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-sm text-gray-600">
            Section {currentSectionIndex + 1} of {totalSections}
          </div>

          <Button
            variant="outline"
            onClick={goToNextSection}
            disabled={currentSectionIndex === totalSections - 1}
            className="flex items-center space-x-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Current Section - Enhanced for Mobile */}
      <MobileContentWrapper>
        <Card className="mb-6 border-0 shadow-lg">
          <CardHeader>
            {/* Desktop Section Title */}
            <div className="hidden md:block">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                    {currentSection.title}
                  </CardTitle>

                  {/* Learning Style Tags */}
                  {currentSection.learning_style_tags.length > 0 &&
                    renderLearningStyleTags(currentSection.learning_style_tags)}

                  {/* Section Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{currentSection.time_estimate_minutes} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>
                        {currentSection.is_required ? 'Required' : 'Optional'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section Status - Desktop only */}
                {!previewMode && (
                  <div className="flex items-center space-x-2">
                    {sectionProgress[currentSection.id] ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-300">
                        <Clock className="w-4 h-4 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {renderContentSection(currentSection)}

            {/* Mark as Complete Button - Mobile friendly */}
            {!previewMode && !sectionProgress[currentSection.id] && (
              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={() => handleSectionComplete(currentSection.id)}
                  className="w-full md:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </MobileContentWrapper>
    </SwipeHandler>

    {/* Section Navigation Footer - Desktop only */}
    {!previewMode && (
      <div className="hidden md:flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousSection}
          disabled={currentSectionIndex === 0}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Section
        </Button>

        <div className="text-sm text-gray-500">
          {currentSectionIndex + 1} of {totalSections} sections
        </div>

        <Button
          onClick={goToNextSection}
          disabled={currentSectionIndex === totalSections - 1 || !canNavigateToNext().allowed}
          className={`flex items-center space-x-2 ${
            !canNavigateToNext().allowed 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          title={!canNavigateToNext().allowed ? canNavigateToNext().reason : ''}
        >
          {currentSectionIndex === totalSections - 1
            ? 'Complete Module'
            : 'Next Section'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    )}

    {/* Mobile Bottom Navigation - Sticky bottom bar */}
    {!previewMode && (
      <MobileBottomNavigation
        sections={memoizedSections}
        currentSectionIndex={currentSectionIndex}
        onSectionChange={(index) => {
          setCurrentSectionIndex(index);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        sectionProgress={sectionProgress}
      />
    )}

    {/* ✅ MODULE COMPLETION MODAL */}
    {completionData && (
      <ModuleCompletionModal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          // Optionally redirect to dashboard or modules page
          if (typeof window !== 'undefined') {
            window.location.href = '/student/vark-modules';
          }
        }}
        moduleTitle={module.title}
        completionData={completionData}
        badge={earnedBadge}
        onDownloadCertificate={() => {
          // TODO: Implement certificate generation
          toast.info('Certificate generation coming soon!');
        }}
        onViewSummary={() => {
          // TODO: Navigate to detailed summary page
          toast.info('Detailed summary coming soon!');
        }}
      />
    )}
  </div>
  );
}
