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
  FileText,
  Clock,
  Users,
  BarChart3,
  Edit,
  Eye,
  Trash2,
  Filter,
  MoreHorizontal,
  Calendar,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Target,
  TrendingUp
} from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade_level: string;
  question_count: number;
  time_limit: number;
  total_points: number;
  is_published: boolean;
  student_count: number;
  average_score: number;
  created_at: string;
  updated_at: string;
  due_date?: string;
}

export default function TeacherQuizzesPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockQuizzes: Quiz[] = [
      {
        id: '1',
        title: 'Calculus Fundamentals Quiz',
        description: 'Test your knowledge of basic calculus concepts',
        subject: 'Mathematics',
        grade_level: 'Grade 12',
        question_count: 20,
        time_limit: 45,
        total_points: 100,
        is_published: true,
        student_count: 24,
        average_score: 78.5,
        created_at: '2024-01-15',
        updated_at: '2024-01-20',
        due_date: '2024-02-01'
      },
      {
        id: '2',
        title: 'Literature Analysis Test',
        description: 'Comprehensive test on literary devices and analysis',
        subject: 'English',
        grade_level: 'Grade 11',
        question_count: 25,
        time_limit: 60,
        total_points: 125,
        is_published: true,
        student_count: 18,
        average_score: 82.3,
        created_at: '2024-01-10',
        updated_at: '2024-01-15',
        due_date: '2024-01-30'
      },
      {
        id: '3',
        title: 'Physics Laws Assessment',
        description: "Quiz covering Newton's laws and basic physics",
        subject: 'Physics',
        grade_level: 'Grade 10',
        question_count: 15,
        time_limit: 30,
        total_points: 75,
        is_published: false,
        student_count: 0,
        average_score: 0,
        created_at: '2024-01-05',
        updated_at: '2024-01-05'
      },
      {
        id: '4',
        title: 'Historical Events Quiz',
        description: 'Test knowledge of major historical events',
        subject: 'History',
        grade_level: 'Grade 9',
        question_count: 18,
        time_limit: 40,
        total_points: 90,
        is_published: true,
        student_count: 15,
        average_score: 75.8,
        created_at: '2024-01-08',
        updated_at: '2024-01-12',
        due_date: '2024-01-25'
      }
    ];

    setTimeout(() => {
      setQuizzes(mockQuizzes);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      filterSubject === 'all' || quiz.subject === filterSubject;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && quiz.is_published) ||
      (filterStatus === 'draft' && !quiz.is_published);
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const subjects = [
    'all',
    ...Array.from(new Set(quizzes.map(quiz => quiz.subject)))
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
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
          <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
          <p className="text-gray-600">
            Create and manage assessments for your students
          </p>
        </div>
        <Button className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white border-0 shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Create New Quiz
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {quizzes.length}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  Total Quizzes
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {quizzes.filter(quiz => quiz.is_published).length}
                </p>
                <p className="text-sm text-green-600 font-medium">Published</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-700">
                  {quizzes.filter(quiz => !quiz.is_published).length}
                </p>
                <p className="text-sm text-orange-600 font-medium">Drafts</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700">
                  {quizzes.reduce((sum, quiz) => sum + quiz.student_count, 0)}
                </p>
                <p className="text-sm text-purple-600 font-medium">
                  Total Students
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterSubject}
                onChange={e => setFilterSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent">
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent">
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
              <Button variant="outline" className="border-gray-300">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredQuizzes.map(quiz => (
          <Card
            key={quiz.id}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                    {quiz.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {quiz.description}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="ml-2">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Quiz Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subject:</span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800">
                    {quiz.subject}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Grade Level:</span>
                  <span className="font-medium text-gray-900">
                    {quiz.grade_level}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Questions:</span>
                  <span className="font-medium text-gray-900">
                    {quiz.question_count}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Time Limit:</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {quiz.time_limit} min
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Points:</span>
                  <span className="font-medium text-gray-900">
                    {quiz.total_points}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Students:</span>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {quiz.student_count}
                    </span>
                  </div>
                </div>
                {quiz.is_published && quiz.average_score > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Avg Score:</span>
                    <Badge
                      variant="secondary"
                      className={getScoreBadgeColor(quiz.average_score)}>
                      {quiz.average_score.toFixed(1)}%
                    </Badge>
                  </div>
                )}
                {quiz.due_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Due Date:</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {new Date(quiz.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <Badge variant={quiz.is_published ? 'default' : 'secondary'}>
                    {quiz.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    {quiz.is_published ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Publish
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredQuizzes.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterSubject !== 'all' || filterStatus !== 'all'
                ? 'No quizzes found'
                : 'No quizzes yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterSubject !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first quiz to get started'}
            </p>
            {!searchTerm &&
              filterSubject === 'all' &&
              filterStatus === 'all' && (
                <Button className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Quiz
                </Button>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}





