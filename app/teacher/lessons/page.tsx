'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  Eye as EyeIcon,
  Headphones,
  PenTool,
  Zap,
  FileText,
  Video,
  Image,
  Link,
  Play,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Globe,
  Lock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LessonsAPI } from '@/lib/api/lessons';
import { Lesson, CreateLessonData, UpdateLessonData } from '@/types/lesson';
import {
  LessonFormModal,
  DeleteLessonDialog,
  LessonViewModal
} from '@/components/lessons';

const varkIcons = {
  visual: EyeIcon,
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

export default function TeacherLessonsPage() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: 'all',
    grade_level: 'all',
    vark_tag: 'all',
    resource_type: 'all',
    published: 'all'
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Action states
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch lessons on component mount
  useEffect(() => {
    if (user?.id) {
      fetchLessons();
    }
  }, [user?.id]);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const data = await LessonsAPI.getTeacherLessons(user!.id);
      setLessons(data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch lessons. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLesson = async (
    lessonData: CreateLessonData | UpdateLessonData
  ) => {
    try {
      const newLesson = await LessonsAPI.createLesson({
        ...(lessonData as CreateLessonData),
        created_by: user!.id
      });
      setLessons([newLesson, ...lessons]);
      toast({
        title: 'Success',
        description: 'Lesson created successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw new Error('Failed to create lesson. Please try again.');
    }
  };

  const handleEditLesson = async (
    lessonData: CreateLessonData | UpdateLessonData
  ) => {
    if (!selectedLesson) return;

    try {
      const updatedLesson = await LessonsAPI.updateLesson(
        selectedLesson.id,
        lessonData as UpdateLessonData
      );
      setLessons(
        lessons.map(lesson =>
          lesson.id === selectedLesson.id
            ? { ...lesson, ...updatedLesson }
            : lesson
        )
      );
      toast({
        title: 'Success',
        description: 'Lesson updated successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw new Error('Failed to update lesson. Please try again.');
    }
  };

  const handleDeleteLesson = async () => {
    if (!selectedLesson) return;

    try {
      setIsDeleting(true);
      await LessonsAPI.deleteLesson(selectedLesson.id);
      setLessons(lessons.filter(lesson => lesson.id !== selectedLesson.id));
      toast({
        title: 'Success',
        description: 'Lesson deleted successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete lesson. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    try {
      await LessonsAPI.toggleLessonPublish(lesson.id, !lesson.is_published);
      setLessons(
        lessons.map(l =>
          l.id === lesson.id ? { ...l, is_published: !l.is_published } : l
        )
      );
      toast({
        title: 'Success',
        description: `Lesson ${
          !lesson.is_published ? 'published' : 'unpublished'
        } successfully!`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error toggling lesson publish status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lesson status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const openEditModal = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsDeleteDialogOpen(true);
  };

  const openViewModal = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsViewModalOpen(true);
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      filters.subject === 'all' || lesson.subject === filters.subject;
    const matchesGrade =
      filters.grade_level === 'all' ||
      lesson.grade_level === filters.grade_level;
    const matchesVark =
      filters.vark_tag === 'all' || lesson.vark_tag === filters.vark_tag;
    const matchesResource =
      filters.resource_type === 'all' ||
      lesson.resource_type === filters.resource_type;
    const matchesPublished =
      filters.published === 'all' ||
      (filters.published === 'published' && lesson.is_published) ||
      (filters.published === 'draft' && !lesson.is_published);

    return (
      matchesSearch &&
      matchesSubject &&
      matchesGrade &&
      matchesVark &&
      matchesResource &&
      matchesPublished
    );
  });

  const subjects = [
    'all',
    ...Array.from(new Set(lessons.map(lesson => lesson.subject)))
  ];
  const gradeLevels = [
    'all',
    ...Array.from(new Set(lessons.map(lesson => lesson.grade_level)))
  ];
  const resourceTypes = [
    'all',
    ...Array.from(new Set(lessons.map(lesson => lesson.resource_type)))
  ];

  const getResourceTypeIcon = (type: string) => {
    const Icon =
      resourceTypeIcons[type as keyof typeof resourceTypeIcons] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00af8f]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Lessons</h1>
          <p className="text-gray-600">
            Create and manage your educational content
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white border-0 shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Create New Lesson
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {lessons.length}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  Total Lessons
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {lessons.filter(l => l.is_published).length}
                </p>
                <p className="text-sm text-green-600 font-medium">Published</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700">
                  {lessons.filter(l => !l.is_published).length}
                </p>
                <p className="text-sm text-purple-600 font-medium">Drafts</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-700">
                  {lessons.reduce(
                    (sum, lesson) => sum + lesson.progress_count,
                    0
                  )}
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  Total Students
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <select
                value={filters.subject}
                onChange={e =>
                  setFilters({ ...filters, subject: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent text-sm">
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>

              <select
                value={filters.grade_level}
                onChange={e =>
                  setFilters({ ...filters, grade_level: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent text-sm">
                {gradeLevels.map(grade => (
                  <option key={grade} value={grade}>
                    {grade === 'all' ? 'All Grades' : grade}
                  </option>
                ))}
              </select>

              <select
                value={filters.vark_tag}
                onChange={e =>
                  setFilters({ ...filters, vark_tag: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent text-sm">
                <option value="all">All Learning Styles</option>
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="reading_writing">Reading/Writing</option>
                <option value="kinesthetic">Kinesthetic</option>
              </select>

              <select
                value={filters.resource_type}
                onChange={e =>
                  setFilters({ ...filters, resource_type: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent text-sm">
                {resourceTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>

              <select
                value={filters.published}
                onChange={e =>
                  setFilters({ ...filters, published: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent text-sm">
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLessons.map(lesson => (
          <Card
            key={lesson.id}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {lesson.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800">
                      {lesson.subject}
                    </Badge>
                    <Badge variant="outline">{lesson.grade_level}</Badge>
                    <Badge className={varkColors[lesson.vark_tag]}>
                      {(() => {
                        const Icon = varkIcons[lesson.vark_tag];
                        return <Icon className="w-3 h-3 mr-1" />;
                      })()}
                      {lesson.vark_tag.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <Button variant="ghost" size="sm" className="ml-2">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Resource Type */}
                <div className="flex items-center space-x-2 text-sm">
                  {getResourceTypeIcon(lesson.resource_type)}
                  <span className="text-gray-600">{lesson.resource_type}</span>
                </div>

                {/* Student Progress */}
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {lesson.progress_count} students
                  </span>
                </div>

                {/* Created Date */}
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {new Date(lesson.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openViewModal(lesson)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(lesson)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleTogglePublish(lesson)}>
                    {lesson.is_published ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Publish
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDeleteDialog(lesson)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredLessons.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || Object.values(filters).some(f => f !== 'all')
                ? 'No lessons found'
                : 'No lessons yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || Object.values(filters).some(f => f !== 'all')
                ? 'Try adjusting your search or filters'
                : 'Create your first lesson to get started'}
            </p>
            {!searchTerm && Object.values(filters).every(f => f === 'all') && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Lesson
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <LessonFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateLesson}
        mode="create"
      />

      <LessonFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditLesson}
        lessonData={selectedLesson}
        mode="edit"
      />

      <DeleteLessonDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteLesson}
        lessonData={selectedLesson}
        isDeleting={isDeleting}
      />

      <LessonViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        lessonData={selectedLesson}
      />
    </div>
  );
}
