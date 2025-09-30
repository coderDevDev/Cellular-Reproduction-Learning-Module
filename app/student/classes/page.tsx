'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ClassesAPI } from '@/lib/api/classes';
import { type Class } from '@/types/class';
import {
  BookOpen,
  Users,
  Target,
  Search,
  Filter,
  Calendar,
  GraduationCap,
  TrendingUp,
  Eye,
  Headphones,
  PenTool,
  Zap,
  Loader2,
  Plus,
  Clock,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const learningStyleIcons = {
  visual: Eye,
  auditory: Headphones,
  reading_writing: PenTool,
  kinesthetic: Zap
};

const learningStyleColors = {
  visual: 'from-blue-500 to-blue-600',
  auditory: 'from-green-500 to-green-600',
  reading_writing: 'from-purple-500 to-purple-600',
  kinesthetic: 'from-orange-500 to-orange-600'
};

const learningStyleLabels = {
  visual: 'Visual',
  auditory: 'Auditory',
  reading_writing: 'Reading/Writing',
  kinesthetic: 'Kinesthetic'
};

const subjectColors = {
  Mathematics: 'from-blue-500 to-blue-600',
  Science: 'from-green-500 to-green-600',
  English: 'from-purple-500 to-purple-600',
  History: 'from-orange-500 to-orange-600',
  Geography: 'from-red-500 to-red-600',
  Literature: 'from-indigo-500 to-indigo-600',
  Physics: 'from-teal-500 to-teal-600',
  Chemistry: 'from-pink-500 to-pink-600',
  Biology: 'from-emerald-500 to-emerald-600'
};

export default function StudentClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'students'>(
    'recent'
  );

  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const classesData = await ClassesAPI.getStudentClasses(user!.id);
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === 'all' || classItem.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const sortedClasses = [...filteredClasses].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'students':
        return b.student_count - a.student_count;
      case 'recent':
      default:
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  });

  const subjects = Array.from(new Set(classes.map(c => c.subject))).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00af8f]" />
          <p className="text-lg text-gray-600">Loading your classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#feffff] via-[#ffffff] to-[#feffff]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
                <p className="text-gray-600">
                  {classes.length} class{classes.length !== 1 ? 'es' : ''}{' '}
                  enrolled
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => (window.location.href = '/student/dashboard')}
                className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af90] text-white border-0">
                <TrendingUp className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search classes by name or subject..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div className="sm:w-48">
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00af8f] focus:border-transparent">
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00af8f] focus:border-transparent">
                <option value="recent">Most Recent</option>
                <option value="name">Name A-Z</option>
                <option value="students">Most Students</option>
              </select>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        {sortedClasses.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedSubject !== 'all'
                  ? 'No classes found'
                  : 'No classes enrolled'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedSubject !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : "You haven't been enrolled in any classes yet."}
              </p>
              {!searchTerm && selectedSubject === 'all' && (
                <Button
                  onClick={() => (window.location.href = '/student/dashboard')}
                  className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af90] text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Explore Available Classes
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedClasses.map(classItem => {
              const subjectColor =
                subjectColors[
                  classItem.subject as keyof typeof subjectColors
                ] || 'from-gray-500 to-gray-600';

              return (
                <Card
                  key={classItem.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${subjectColor} rounded-lg flex items-center justify-center`}>
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {classItem.student_count} students
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-[#00af8f] transition-colors">
                      {classItem.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {classItem.description || 'No description available.'}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Subject:</span>
                        <Badge variant="secondary" className="text-xs">
                          {classItem.subject}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Grade Level:</span>
                        <span className="font-medium">
                          {classItem.grade_level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Teacher:</span>
                        <span className="font-medium truncate max-w-24">
                          {classItem.teacher_name}
                        </span>
                      </div>
                    </div>

                    {/* Learning Style Distribution */}
                    {classItem.students && classItem.students.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">
                          Learning Styles:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(
                            classItem.students.reduce((acc: any, student) => {
                              if (student.learning_style) {
                                acc[student.learning_style] =
                                  (acc[student.learning_style] || 0) + 1;
                              }
                              return acc;
                            }, {})
                          ).map(([style, count]) => {
                            const Icon =
                              learningStyleIcons[
                                style as keyof typeof learningStyleIcons
                              ];
                            return (
                              <Badge
                                key={style}
                                variant="outline"
                                className="text-xs">
                                <Icon className="w-3 h-3 mr-1" />
                                {
                                  learningStyleLabels[
                                    style as keyof typeof learningStyleLabels
                                  ]
                                }{' '}
                                ({count})
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <Link href={`/student/classes/${classItem.id}`}>
                        <Button className="w-full bg-[#00af8f] hover:bg-[#00af90] text-white">
                          <Eye className="w-4 h-4 mr-2" />
                          View Class
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        {classes.length > 0 && (
          <div className="mt-12">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-[#00af8f]/5 to-[#00af90]/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Class Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00af8f]">
                      {classes.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Classes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Array.from(new Set(classes.map(c => c.subject))).length}
                    </div>
                    <div className="text-sm text-gray-600">Subjects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {classes.reduce((sum, c) => sum + c.student_count, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {classes.reduce(
                        (sum, c) => sum + (c.students?.length || 0),
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Classmates</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}




