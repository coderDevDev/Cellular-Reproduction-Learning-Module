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
  Users,
  GraduationCap,
  BookOpen,
  Activity,
  FileText,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  Phone,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Target,
  Headphones
} from 'lucide-react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  grade_level: string;
  learning_style: 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
  enrollment_date: string;
  class_count: number;
  lesson_progress: number;
  quiz_average: number;
  activity_completion: number;
  last_active: string;
  status: 'active' | 'inactive' | 'graduated';
}

export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterLearningStyle, setFilterLearningStyle] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        email: 'john.doe@student.edu',
        grade_level: 'Grade 12',
        learning_style: 'visual',
        enrollment_date: '2023-09-01',
        class_count: 4,
        lesson_progress: 85,
        quiz_average: 88.5,
        activity_completion: 92,
        last_active: '2024-01-20',
        status: 'active'
      },
      {
        id: '2',
        first_name: 'Jane',
        last_name: 'Smith',
        full_name: 'Jane Smith',
        email: 'jane.smith@student.edu',
        grade_level: 'Grade 11',
        learning_style: 'auditory',
        enrollment_date: '2023-09-01',
        class_count: 3,
        lesson_progress: 78,
        quiz_average: 82.3,
        activity_completion: 85,
        last_active: '2024-01-19',
        status: 'active'
      },
      {
        id: '3',
        first_name: 'Mike',
        last_name: 'Johnson',
        full_name: 'Mike Johnson',
        email: 'mike.johnson@student.edu',
        grade_level: 'Grade 10',
        learning_style: 'kinesthetic',
        enrollment_date: '2023-09-01',
        class_count: 2,
        lesson_progress: 92,
        quiz_average: 90.1,
        activity_completion: 95,
        last_active: '2024-01-20',
        status: 'active'
      },
      {
        id: '4',
        first_name: 'Sarah',
        last_name: 'Williams',
        full_name: 'Sarah Williams',
        email: 'sarah.williams@student.edu',
        grade_level: 'Grade 9',
        learning_style: 'reading_writing',
        enrollment_date: '2023-09-01',
        class_count: 1,
        lesson_progress: 65,
        quiz_average: 72.8,
        activity_completion: 68,
        last_active: '2024-01-18',
        status: 'active'
      }
    ];

    setTimeout(() => {
      setStudents(mockStudents);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade =
      filterGrade === 'all' || student.grade_level === filterGrade;
    const matchesLearningStyle =
      filterLearningStyle === 'all' ||
      student.learning_style === filterLearningStyle;
    return matchesSearch && matchesGrade && matchesLearningStyle;
  });

  const gradeLevels = [
    'all',
    ...Array.from(new Set(students.map(student => student.grade_level)))
  ];
  const learningStyles = [
    'all',
    ...Array.from(new Set(students.map(student => student.learning_style)))
  ];

  const getLearningStyleIcon = (style: string) => {
    switch (style) {
      case 'visual':
        return Eye;
      case 'auditory':
        return Headphones;
      case 'reading_writing':
        return FileText;
      case 'kinesthetic':
        return Activity;
      default:
        return Target;
    }
  };

  const getLearningStyleColor = (style: string) => {
    switch (style) {
      case 'visual':
        return 'bg-blue-100 text-blue-800';
      case 'auditory':
        return 'bg-green-100 text-green-800';
      case 'reading_writing':
        return 'bg-purple-100 text-purple-800';
      case 'kinesthetic':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 80) return 'text-blue-600';
    if (progress >= 70) return 'text-yellow-600';
    if (progress >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressBadgeColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-100 text-green-800';
    if (progress >= 80) return 'bg-blue-100 text-blue-800';
    if (progress >= 70) return 'bg-yellow-100 text-yellow-800';
    if (progress >= 60) return 'bg-orange-100 text-orange-800';
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
          <h1 className="text-3xl font-bold text-gray-900">
            Student Masterlist
          </h1>
          <p className="text-gray-600">
            View and manage your student enrollments
          </p>
        </div>
        <Button className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white border-0 shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Add New Student
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {students.length}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  Total Students
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {
                    students.filter(student => student.status === 'active')
                      .length
                  }
                </p>
                <p className="text-sm text-green-600 font-medium">
                  Active Students
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700">
                  {students.reduce(
                    (sum, student) => sum + student.class_count,
                    0
                  )}
                </p>
                <p className="text-sm text-purple-600 font-medium">
                  Total Enrollments
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-700">
                  {(
                    students.reduce(
                      (sum, student) => sum + student.lesson_progress,
                      0
                    ) / students.length
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  Avg Progress
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
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
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterGrade}
                onChange={e => setFilterGrade(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent">
                {gradeLevels.map(grade => (
                  <option key={grade} value={grade}>
                    {grade === 'all' ? 'All Grades' : grade}
                  </option>
                ))}
              </select>
              <select
                value={filterLearningStyle}
                onChange={e => setFilterLearningStyle(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent">
                {learningStyles.map(style => (
                  <option key={style} value={style}>
                    {style === 'all'
                      ? 'All Learning Styles'
                      : style.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <Button variant="outline" className="border-gray-300">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map(student => {
          const LearningStyleIcon = getLearningStyleIcon(
            student.learning_style
          );
          return (
            <Card
              key={student.id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {student.full_name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Student Info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Grade Level:</span>
                    <span className="font-medium text-gray-900">
                      {student.grade_level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Learning Style:</span>
                    <Badge
                      variant="secondary"
                      className={getLearningStyleColor(student.learning_style)}>
                      <LearningStyleIcon className="w-3 h-3 mr-1" />
                      {student.learning_style.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Enrolled Classes:</span>
                    <span className="font-medium text-gray-900">
                      {student.class_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Enrollment Date:</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {new Date(student.enrollment_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Lesson Progress:</span>
                      <Badge
                        variant="secondary"
                        className={getProgressBadgeColor(
                          student.lesson_progress
                        )}>
                        {student.lesson_progress}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Quiz Average:</span>
                      <Badge
                        variant="secondary"
                        className={getProgressBadgeColor(student.quiz_average)}>
                        {student.quiz_average.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Activity Completion:
                      </span>
                      <Badge
                        variant="secondary"
                        className={getProgressBadgeColor(
                          student.activity_completion
                        )}>
                        {student.activity_completion}%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Active:</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {new Date(student.last_active).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <Badge
                      variant={
                        student.status === 'active' ? 'default' : 'secondary'
                      }>
                      {student.status.charAt(0).toUpperCase() +
                        student.status.slice(1)}
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
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ||
              filterGrade !== 'all' ||
              filterLearningStyle !== 'all'
                ? 'No students found'
                : 'No students yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ||
              filterGrade !== 'all' ||
              filterLearningStyle !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first student to get started'}
            </p>
            {!searchTerm &&
              filterGrade === 'all' &&
              filterLearningStyle === 'all' && (
                <Button className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Student
                </Button>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}





