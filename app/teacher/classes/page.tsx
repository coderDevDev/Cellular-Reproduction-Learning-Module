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
  BookOpen,
  Calendar,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  Filter,
  MoreHorizontal,
  Settings,
  BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ClassesAPI } from '@/lib/api/classes';
import { Class, CreateClassData, UpdateClassData } from '@/types/class';
import {
  ClassFormModal,
  DeleteClassDialog,
  StudentManagementModal
} from '@/components/classes';

export default function TeacherClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);

  // Action states
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch classes on component mount
  useEffect(() => {
    if (user?.id) {
      fetchClasses();
    }
  }, [user?.id]);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const data = await ClassesAPI.getTeacherClasses(user!.id);
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch classes. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClass = async (
    classData: CreateClassData | UpdateClassData
  ) => {
    try {
      const newClass = await ClassesAPI.createClass({
        ...(classData as CreateClassData),
        created_by: user!.id
      });
      setClasses([newClass, ...classes]);
      toast({
        title: 'Success',
        description: 'Class created successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error creating class:', error);
      throw new Error('Failed to create class. Please try again.');
    }
  };

  const handleEditClass = async (
    classData: CreateClassData | UpdateClassData
  ) => {
    if (!selectedClass) return;

    try {
      const updatedClass = await ClassesAPI.updateClass(
        selectedClass.id,
        classData as UpdateClassData
      );
      setClasses(
        classes.map(cls =>
          cls.id === selectedClass.id ? { ...cls, ...updatedClass } : cls
        )
      );
      toast({
        title: 'Success',
        description: 'Class updated successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating class:', error);
      throw new Error('Failed to update class. Please try again.');
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;

    try {
      setIsDeleting(true);
      await ClassesAPI.deleteClass(selectedClass.id);
      setClasses(classes.filter(cls => cls.id !== selectedClass.id));
      toast({
        title: 'Success',
        description: 'Class deleted successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete class. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenStudentManagement = async (classData: Class) => {
    try {
      // Get the most up-to-date class data with students
      const updatedClass = await ClassesAPI.getClassById(classData.id);
      if (updatedClass) {
        setSelectedClass(updatedClass);

        // Also update the class in the main list
        setClasses(prevClasses =>
          prevClasses.map(cls => (cls.id === classData.id ? updatedClass : cls))
        );
      } else {
        setSelectedClass(classData);
      }

      // Fetch available students for this class
      const available = await ClassesAPI.getAvailableStudents(
        classData.id,
        user!.id
      );
      setAvailableStudents(available);

      setIsStudentModalOpen(true);
    } catch (error) {
      console.error('Error fetching available students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student data. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleAddStudents = async (studentIds: string[]) => {
    if (!selectedClass) return;

    try {
      await ClassesAPI.addStudentsToClass(selectedClass.id, studentIds);

      // Refresh the class data to get updated student count
      const updatedClass = await ClassesAPI.getClassById(selectedClass.id);
      if (updatedClass) {
        setClasses(
          classes.map(cls => (cls.id === selectedClass.id ? updatedClass : cls))
        );
        setSelectedClass(updatedClass);
      }

      // Refresh available students
      const available = await ClassesAPI.getAvailableStudents(
        selectedClass.id,
        user!.id
      );
      setAvailableStudents(available);
    } catch (error) {
      console.error('Error adding students:', error);
      throw new Error('Failed to add students. Please try again.');
    }
  };

  const handleRemoveStudents = async (studentIds: string[]) => {
    if (!selectedClass) return;

    try {
      await ClassesAPI.removeStudentsFromClass(selectedClass.id, studentIds);

      // Refresh the class data to get updated student count
      const updatedClass = await ClassesAPI.getClassById(selectedClass.id);
      if (updatedClass) {
        setClasses(
          classes.map(cls => (cls.id === selectedClass.id ? updatedClass : cls))
        );
        setSelectedClass(updatedClass);
      }

      // Refresh available students
      const available = await ClassesAPI.getAvailableStudents(
        selectedClass.id,
        user!.id
      );
      setAvailableStudents(available);
    } catch (error) {
      console.error('Error removing students:', error);
      throw new Error('Failed to remove students. Please try again.');
    }
  };

  const openEditModal = (classData: Class) => {
    setSelectedClass(classData);
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (classData: Class) => {
    setSelectedClass(classData);
    setIsDeleteDialogOpen(true);
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      filterSubject === 'all' || cls.subject === filterSubject;
    const matchesGrade =
      filterGrade === 'all' || cls.grade_level === filterGrade;
    return matchesSearch && matchesSubject && matchesGrade;
  });

  const subjects = [
    'all',
    ...Array.from(new Set(classes.map(cls => cls.subject)))
  ];
  const gradeLevels = [
    'all',
    ...Array.from(new Set(classes.map(cls => cls.grade_level)))
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600">
            Manage your classes and student enrollments
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white border-0 shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Create New Class
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {classes.length}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  Total Classes
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {classes.reduce((sum, cls) => sum + cls.student_count, 0)}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  Total Students
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700">
                  {classes.filter(cls => cls.student_count > 0).length}
                </p>
                <p className="text-sm text-purple-600 font-medium">
                  Active Classes
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
                  {classes.length > 0
                    ? Math.round(
                        classes.reduce(
                          (sum, cls) => sum + cls.student_count,
                          0
                        ) / classes.length
                      )
                    : 0}
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  Avg Students
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
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
                  placeholder="Search classes..."
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
                value={filterGrade}
                onChange={e => setFilterGrade(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent">
                {gradeLevels.map(grade => (
                  <option key={grade} value={grade}>
                    {grade === 'all' ? 'All Grades' : grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClasses.map(cls => (
          <Card
            key={cls.id}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                    {cls.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {cls.description}
                  </p>
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
                {/* Class Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subject:</span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800">
                    {cls.subject}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Grade Level:</span>
                  <span className="font-medium text-gray-900">
                    {cls.grade_level}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Students:</span>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {cls.student_count}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(cls.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenStudentManagement(cls)}>
                    <Users className="w-4 h-4 mr-2" />
                    Students
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(cls)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDeleteDialog(cls)}>
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
      {filteredClasses.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterSubject !== 'all' || filterGrade !== 'all'
                ? 'No classes found'
                : 'No classes yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterSubject !== 'all' || filterGrade !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first class to get started'}
            </p>
            {!searchTerm &&
              filterSubject === 'all' &&
              filterGrade === 'all' && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Class
                </Button>
              )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ClassFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateClass}
        mode="create"
      />

      <ClassFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditClass}
        classData={selectedClass}
        mode="edit"
      />

      <DeleteClassDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteClass}
        classData={selectedClass}
        isDeleting={isDeleting}
      />

      <StudentManagementModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        classId={selectedClass?.id || ''}
        currentStudents={selectedClass?.students || []}
        availableStudents={availableStudents}
        onAddStudents={handleAddStudents}
        onRemoveStudents={handleRemoveStudents}
      />

      {/* Debug info */}
      {isStudentModalOpen && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50">
          <div>Selected Class ID: {selectedClass?.id}</div>
          <div>Students Count: {selectedClass?.students?.length || 0}</div>
          <div>Available Students: {availableStudents.length}</div>
        </div>
      )}
    </div>
  );
}
