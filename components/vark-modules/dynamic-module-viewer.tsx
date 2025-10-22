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
  AlertCircle
} from 'lucide-react';
import { VARKModule, VARKModuleContentSection } from '@/types/vark-module';
import { Textarea } from '@/components/ui/textarea';
import { VARKModulesAPI } from '@/lib/api/vark-modules';
import ModuleCompletionModal from './module-completion-modal';
import { toast } from 'sonner';

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
        // Handle multiple assessment questions (Pre-Test/Post-Test)
        if (
          module.assessment_questions &&
          module.assessment_questions.length > 0
        ) {
          // Filter questions based on section type
          let assessmentQuestions = module.assessment_questions;

          if (section.id === 'pre-test-section') {
            // Show only Pre-Test questions (first 5)
            assessmentQuestions = module.assessment_questions.filter(q =>
              q.id.startsWith('pre-test')
            );
          } else if (section.id === 'post-test-section') {
            // Show only Post-Test questions (last 10)
            assessmentQuestions = module.assessment_questions.filter(q =>
              q.id.startsWith('post-test')
            );
          }

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

      case 'activity':
        if (content_data.activity_data) {
          const activity = content_data.activity_data;

          // Fill-in-the-Blanks Activity
          if (activity.type === 'discussion') {
            return (
              <div className="space-y-6">
                {/* Activity Header */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-blue-800">
                        📝 Fill-in-the-Blanks Activity
                      </h4>
                      <h5 className="text-lg font-semibold text-blue-700">
                        {activity.title}
                      </h5>
                    </div>
                  </div>
                  <p className="text-blue-700 mb-4">{activity.description}</p>

                  {/* Instructions */}
                  <div className="space-y-3">
                    <h6 className="font-semibold text-blue-800 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Instructions:
                    </h6>
                    <ul className="list-decimal list-inside space-y-2 text-blue-700">
                      {activity.instructions.map((instruction, index) => (
                        <li key={index} className="font-medium">
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Word Bank */}
                {activity.word_bank && activity.word_bank.length > 0 && (
                  <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <h6 className="font-bold text-blue-800 mb-4 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      WORD BANK
                    </h6>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {activity.word_bank.map((word, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white border border-blue-300 rounded-lg text-center font-semibold text-blue-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          data-word-bank-item>
                          {word}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questions */}
                {activity.questions && activity.questions.length > 0 && (
                  <div className="space-y-4">
                    <h6 className="font-bold text-gray-800 text-lg flex items-center">
                      <PenTool className="w-5 h-5 mr-2" />
                      Questions:
                    </h6>
                    {activity.questions.map((question, index) => (
                      <div
                        key={index}
                        className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex items-start space-x-3">
                          <span className="text-lg font-bold text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium mb-3">
                              {question.replace(/_____/g, '__________')}
                            </p>
                            <div className="mt-2">
                              <input
                                type="text"
                                className="w-full px-3 py-2 border-2 border-blue-400 bg-blue-50 rounded-lg text-blue-800 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                                placeholder="Type your answer here..."
                                data-question-index={index}
                                onChange={e => {
                                  const inputValue = e.target.value
                                    .toLowerCase()
                                    .trim();
                                  // Disable/enable word bank items based on input
                                  const wordBankItems =
                                    document.querySelectorAll(
                                      `[data-word-bank-item]`
                                    );
                                  wordBankItems.forEach((item: any) => {
                                    const word = item.textContent
                                      ?.toLowerCase()
                                      .trim();
                                    if (word === inputValue) {
                                      item.classList.add(
                                        'opacity-50',
                                        'cursor-not-allowed'
                                      );
                                      item.style.pointerEvents = 'none';
                                    } else {
                                      item.classList.remove(
                                        'opacity-50',
                                        'cursor-not-allowed'
                                      );
                                      item.style.pointerEvents = 'auto';
                                    }
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete Fill-in-the-Blanks Activity
                </Button>
              </div>
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
                            {activity.matching_pairs.map((pair, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-3">
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-center font-semibold focus:outline-none focus:border-green-500"
                                    placeholder="?"
                                    maxLength={1}
                                  />
                                </td>
                                <td className="border border-gray-300 px-4 py-3">
                                  <span className="font-medium text-gray-800">
                                    {index + 1}. {pair.description}
                                  </span>
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
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete Matching Activity
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

                <div className="space-y-3">
                  <h6 className="font-medium text-purple-800">Instructions:</h6>
                  <ul className="list-decimal list-inside space-y-1 text-purple-700">
                    {activity.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>

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
