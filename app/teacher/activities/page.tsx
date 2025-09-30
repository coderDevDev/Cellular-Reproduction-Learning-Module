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
  Activity,
  Clock,
  Users,
  FileText,
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
  TrendingUp,
  Upload,
  Download
} from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade_level: string;
  activity_type: 'assignment' | 'project' | 'presentation' | 'research';
  vark_tag: 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
  is_published: boolean;
  student_count: number;
  submitted_count: number;
  graded_count: number;
  total_points: number;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export default function TeacherActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockActivities: Activity[] = [
      {
        id: '1',
        title: 'Calculus Problem Set',
        description: 'Complete problems 1-20 from Chapter 3 on derivatives',
        subject: 'Mathematics',
        grade_level: 'Grade 12',
        activity_type: 'assignment',
        vark_tag: 'kinesthetic',
        is_published: true,
        student_count: 24,
        submitted_count: 22,
        graded_count: 18,
        total_points: 100,
        due_date: '2024-02-01',
        created_at: '2024-01-15',
        updated_at: '2024-01-20'
      },
      {
        id: '2',
        title: 'Literature Analysis Essay',
        description: 'Write a 1000-word essay analyzing the themes in Macbeth',
        subject: 'English',
        grade_level: 'Grade 11',
        activity_type: 'project',
        vark_tag: 'reading_writing',
        is_published: true,
        student_count: 18,
        submitted_count: 15,
        graded_count: 12,
        total_points: 150,
        due_date: '2024-01-30',
        created_at: '2024-01-10',
        updated_at: '2024-01-15'
      },
      {
        id: '3',
        title: 'Physics Lab Report',
        description: 'Conduct experiments and write a lab report on motion',
        subject: 'Physics',
        grade_level: 'Grade 10',
        activity_type: 'research',
        vark_tag: 'kinesthetic',
        is_published: false,
        student_count: 0,
        submitted_count: 0,
        graded_count: 0,
        total_points: 75,
        due_date: '2024-02-15',
        created_at: '2024-01-05',
        updated_at: '2024-01-05'
      },
      {
        id: '4',
        title: 'History Presentation',
        description: 'Create a presentation on a significant historical event',
        subject: 'History',
        grade_level: 'Grade 9',
        activity_type: 'presentation',
        vark_tag: 'visual',
        is_published: true,
        student_count: 15,
        submitted_count: 10,
        graded_count: 8,
        total_points: 80,
        due_date: '2024-01-25',
        created_at: '2024-01-08',
        updated_at: '2024-01-12'
      }
    ];

    setTimeout(() => {
      setActivities(mockActivities);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      filterSubject === 'all' || activity.subject === filterSubject;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && activity.is_published) ||
      (filterStatus === 'draft' && !activity.is_published);
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const subjects = [
    'all',
    ...Array.from(new Set(activities.map(activity => activity.subject)))
  ];

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return FileText;
      case 'project':
        return Target;
      case 'presentation':
        return TrendingUp;
      case 'research':
        return Search;
      default:
        return Activity;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-100 text-blue-800';
      case 'project':
        return 'bg-green-100 text-green-800';
      case 'presentation':
        return 'bg-purple-100 text-purple-800';
      case 'research':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVarkColor = (vark: string) => {
    switch (vark) {
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

  const getSubmissionProgress = (submitted: number, total: number) => {
    const percentage = (submitted / total) * 100;
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
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
          <h1 className="text-3xl font-bold text-gray-900">My Activities</h1>
          <p className="text-gray-600">
            Create and manage assignments for your students
          </p>
        </div>
        <Button className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white border-0 shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Create New Activity
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {activities.length}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  Total Activities
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {activities.filter(activity => activity.is_published).length}
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
                  {activities.reduce(
                    (sum, activity) => sum + activity.submitted_count,
                    0
                  )}
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  Submissions
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700">
                  {activities.reduce(
                    (sum, activity) => sum + activity.graded_count,
                    0
                  )}
                </p>
                <p className="text-sm text-purple-600 font-medium">Graded</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
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
                  placeholder="Search activities..."
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

      {/* Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredActivities.map(activity => {
          const ActivityIcon = getActivityTypeIcon(activity.activity_type);
          return (
            <Card
              key={activity.id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {activity.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {activity.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Activity Info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Subject:</span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800">
                      {activity.subject}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Grade Level:</span>
                    <span className="font-medium text-gray-900">
                      {activity.grade_level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <Badge
                      variant="secondary"
                      className={getActivityTypeColor(activity.activity_type)}>
                      <ActivityIcon className="w-3 h-3 mr-1" />
                      {activity.activity_type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">VARK Tag:</span>
                    <Badge
                      variant="secondary"
                      className={getVarkColor(activity.vark_tag)}>
                      {activity.vark_tag.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Points:</span>
                    <span className="font-medium text-gray-900">
                      {activity.total_points}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Due Date:</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {new Date(activity.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Submissions:</span>
                      <span className="font-medium text-gray-900">
                        {activity.submitted_count}/{activity.student_count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getSubmissionProgress(
                          activity.submitted_count,
                          activity.student_count
                        )}`}
                        style={{
                          width: `${
                            (activity.submitted_count /
                              activity.student_count) *
                            100
                          }%`
                        }}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Graded:</span>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {activity.graded_count}/{activity.submitted_count}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <Badge
                      variant={activity.is_published ? 'default' : 'secondary'}>
                      {activity.is_published ? 'Published' : 'Draft'}
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
                      {activity.is_published ? (
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
          );
        })}
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterSubject !== 'all' || filterStatus !== 'all'
                ? 'No activities found'
                : 'No activities yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterSubject !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first activity to get started'}
            </p>
            {!searchTerm &&
              filterSubject === 'all' &&
              filterStatus === 'all' && (
                <Button className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Activity
                </Button>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}





