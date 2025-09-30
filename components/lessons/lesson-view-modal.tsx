'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Lesson, LessonStats } from '@/types/lesson';
import { LessonsAPI } from '@/lib/api/lessons';
import {
  Eye,
  Headphones,
  PenTool,
  Zap,
  FileText,
  Video,
  Image,
  Link,
  ExternalLink,
  Users,
  CheckCircle,
  Clock,
  Play
} from 'lucide-react';

interface LessonViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonData: Lesson | null;
}

const varkIcons = {
  visual: Eye,
  auditory: Headphones,
  reading_writing: PenTool,
  kinesthetic: Zap
};

const varkColors = {
  visual: 'bg-blue-100 text-blue-800 border-blue-200',
  auditory: 'bg-green-100 text-green-800 border-green-200',
  reading_writing: 'bg-purple-100 text-purple-800 border-purple-200',
  kinesthetic: 'bg-orange-100 text-orange-800 border-orange-200'
};

const resourceTypeIcons = {
  Video: Video,
  Document: FileText,
  Presentation: FileText,
  Interactive: Play,
  Audio: Headphones,
  Image: Image,
  'Web Link': Link,
  PDF: FileText,
  Quiz: FileText,
  Simulation: Play
};

export default function LessonViewModal({
  isOpen,
  onClose,
  lessonData
}: LessonViewModalProps) {
  const [stats, setStats] = useState<LessonStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    if (isOpen && lessonData) {
      fetchLessonStats();
    }
  }, [isOpen, lessonData]);

  const fetchLessonStats = async () => {
    if (!lessonData) return;

    try {
      setIsLoadingStats(true);
      const lessonStats = await LessonsAPI.getLessonStats(lessonData.id);
      setStats(lessonStats);
    } catch (error) {
      console.error('Error fetching lesson stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lesson statistics.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const getResourceTypeIcon = (type: string) => {
    const Icon =
      resourceTypeIcons[type as keyof typeof resourceTypeIcons] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!lessonData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Lesson Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lesson Header */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {lessonData.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800">
                  {lessonData.subject}
                </Badge>
                <Badge variant="outline">{lessonData.grade_level}</Badge>
                <Badge className={varkColors[lessonData.vark_tag]}>
                  {(() => {
                    const Icon = varkIcons[lessonData.vark_tag];
                    return <Icon className="w-3 h-3 mr-1" />;
                  })()}
                  {lessonData.vark_tag.replace('_', ' ')}
                </Badge>
                <Badge
                  variant={lessonData.is_published ? 'default' : 'secondary'}>
                  {lessonData.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                {getResourceTypeIcon(lessonData.resource_type)}
                <span className="text-sm text-gray-600">
                  {lessonData.resource_type}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {lessonData.progress_count} students
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {new Date(lessonData.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getResourceTypeIcon(lessonData.resource_type)}
                    <div>
                      <p className="font-medium text-gray-900">Content URL</p>
                      <p className="text-sm text-gray-500 break-all">
                        {lessonData.content_url}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(lessonData.content_url, '_blank')
                    }>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00af8f]"></div>
                </div>
              ) : stats ? (
                <div className="space-y-4">
                  {/* Progress Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.total_students}
                      </p>
                      <p className="text-sm text-gray-600">Total Students</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {stats.completed_students}
                      </p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {stats.in_progress_students}
                      </p>
                      <p className="text-sm text-gray-600">In Progress</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">
                        {stats.not_started_students}
                      </p>
                      <p className="text-sm text-gray-600">Not Started</p>
                    </div>
                  </div>

                  {/* Completion Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion Rate</span>
                      <span className="font-medium">
                        {stats.completion_rate}%
                      </span>
                    </div>
                    <Progress value={stats.completion_rate} className="h-2" />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No statistics available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Student Progress List */}
          {lessonData.student_progress &&
            lessonData.student_progress.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Student Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lessonData.student_progress.map(progress => (
                      <div
                        key={progress.student_id}
                        className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {progress.first_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {progress.full_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {progress.learning_style && (
                                <span className="capitalize">
                                  {progress.learning_style}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(progress.status)}
                          <Badge className={getStatusColor(progress.status)}>
                            {progress.status.replace('_', ' ')}
                          </Badge>
                          {progress.completed_at && (
                            <span className="text-xs text-gray-500">
                              {new Date(
                                progress.completed_at
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}






