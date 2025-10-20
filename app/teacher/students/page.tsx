'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { StudentAPI } from '@/lib/api/students';
import { toast } from 'sonner';
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
  Headphones,
  Trash2,
  Upload,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Table as TableIcon,
  LayoutGrid,
  X,
  Save
} from 'lucide-react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  grade_level: string;
  learning_style: 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
  preferred_modules?: string[];
  learning_type?: string;
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
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: 'learn2025',
    gradeLevel: 'Grade 7',
    learningStyle: 'reading_writing' as any,
    preferredModules: [] as string[],
    learningType: '',
    bypassOnboarding: true
  });
  
  const availableModules = ['Visual', 'Aural', 'Read/Write', 'Kinesthetic', 'General Module'];
  const learningTypes = ['Unimodal', 'Bimodal', 'Trimodal', 'Multimodal'];
  
  // Bulk import states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<{
    total: number;
    success: number;
    failed: number;
    skipped: number;
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch students from database
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    const result = await StudentAPI.getStudents();
    if (result.success && result.data) {
      // Map database fields to component interface
      const mappedStudents = result.data.map((s: any) => ({
        id: s.id,
        first_name: s.first_name || '',
        last_name: s.last_name || '',
        full_name: s.full_name || `${s.first_name} ${s.last_name}`,
        email: s.email,
        grade_level: s.grade_level || 'Grade 7',
        learning_style: s.learning_style || 'reading_writing',
        preferred_modules: s.preferred_modules || [],
        learning_type: s.learning_type || null,
        enrollment_date: s.created_at,
        class_count: 0,
        lesson_progress: 0,
        quiz_average: 0,
        activity_completion: 0,
        last_active: s.updated_at || s.created_at,
        status: (s.onboarding_completed ? 'active' : 'inactive') as 'active' | 'inactive' | 'graduated'
      }));
      setStudents(mappedStudents);
    }
    setIsLoading(false);
  };

  // Create student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await StudentAPI.createStudent({
      ...formData,
      onboardingCompleted: formData.bypassOnboarding
    });

    if (result.success) {
      toast.success('Student created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchStudents();
    } else {
      toast.error(`Failed to create student: ${result.error}`);
    }
  };

  // Bulk import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setImportFile(file);
    } else {
      toast.error('Please select a valid JSON file');
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportProgress({ total: 0, success: 0, failed: 0, skipped: 0 });

    try {
      const text = await importFile.text();
      const students = JSON.parse(text);

      if (!Array.isArray(students)) {
        throw new Error('Invalid JSON format. Expected an array of students.');
      }

      setImportProgress({ total: students.length, success: 0, failed: 0, skipped: 0 });

      const results = await StudentAPI.bulkImportStudents(students);
      
      setImportProgress({
        total: students.length,
        success: results.success,
        failed: results.failed,
        skipped: results.skipped
      });

      if (results.errors.length > 0) {
        console.error('Import errors:', results.errors);
      }

      toast.success(`Imported ${results.success} students successfully!`);
      
      setTimeout(() => {
        setShowBulkImportModal(false);
        setImportFile(null);
        setImportProgress(null);
        fetchStudents();
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import students');
    } finally {
      setIsImporting(false);
    }
  };

  // Delete student
  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    const result = await StudentAPI.deleteStudent(id);
    if (result.success) {
      toast.success('Student deleted successfully');
      fetchStudents();
    } else {
      toast.error(`Failed to delete student: ${result.error}`);
    }
  };

  //View student
  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  // Edit student
  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.first_name,
      middleName: '',
      lastName: student.last_name,
      email: student.email,
      password: 'learn2025',
      gradeLevel: student.grade_level,
      learningStyle: student.learning_style,
      preferredModules: student.preferred_modules || [],
      learningType: student.learning_type || '',
      bypassOnboarding: student.status === 'active'
    });
    setShowEditModal(true);
  };

  // Update student
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const result = await StudentAPI.updateStudent(selectedStudent.id, {
      ...formData,
      onboardingCompleted: formData.bypassOnboarding
    });

    if (result.success) {
      toast.success('Student updated successfully!');
      setShowEditModal(false);
      setSelectedStudent(null);
      resetForm();
      fetchStudents();
    } else {
      toast.error(`Failed to update student: ${result.error}`);
    }
  };

  const toggleModule = (module: string) => {
    setFormData(prev => ({
      ...prev,
      preferredModules: prev.preferredModules.includes(module)
        ? prev.preferredModules.filter(m => m !== module)
        : [...prev.preferredModules, module]
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      password: 'learn2025',
      gradeLevel: 'Grade 7',
      learningStyle: 'reading_writing',
      preferredModules: [],
      learningType: '',
      bypassOnboarding: true
    });
  };

  // Bulk selection
  const toggleSelectAll = () => {
    if (selectedStudents.length === paginatedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(paginatedStudents.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    
    if (!confirm(`Delete ${selectedStudents.length} selected students?`)) return;

    let successCount = 0;
    for (const id of selectedStudents) {
      const result = await StudentAPI.deleteStudent(id);
      if (result.success) successCount++;
    }

    toast.success(`Deleted ${successCount} students`);
    setSelectedStudents([]);
    fetchStudents();
  };

  // Density padding
  const getDensityPadding = () => {
    switch (density) {
      case 'compact': return 'py-2';
      case 'comfortable': return 'py-4';
      case 'spacious': return 'py-6';
    }
  };

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

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterGrade, filterLearningStyle, rowsPerPage]);

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
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowBulkImportModal(true)}
            variant="outline"
            className="border-2 border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f] hover:text-white">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import JSON
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white border-0 shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Add New Student
          </Button>
        </div>
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
              
              {/* View Toggle */}
              <div className="flex border-2 border-gray-300 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' ? 'bg-[#00af8f] text-white hover:bg-[#00af90]' : ''}>
                  <TableIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-[#00af8f] text-white hover:bg-[#00af90]' : ''}>
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="border-0 shadow-lg">
          {/* Table Controls */}
          <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-4">
              {selectedStudents.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selectedStudents.length}
                </Button>
              )}
              <span className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Density:</span>
              <select
                value={density}
                onChange={(e) => setDensity(e.target.value as any)}
                className="px-2 py-1 border border-gray-300 rounded text-sm">
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
                <option value="spacious">Spacious</option>
              </select>
              <span className="text-sm text-gray-600 ml-2">Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <CardContent className="p-0">
            {/* Scrollable Table Container */}
            <div className="overflow-auto max-h-[600px] relative">
              <table className="w-full">
                {/* Sticky Header */}
                <thead className="bg-gradient-to-r from-[#00af8f] to-[#00af90] sticky top-0 z-10 shadow-md">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <Checkbox
                        checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0}
                        onCheckedChange={toggleSelectAll}
                        className="border-white"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Learning Style
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Preferred Modules
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Status
                    </th>
                    {/* Sticky Actions Column */}
                    <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider sticky right-0 bg-gradient-to-r from-[#00af8f] to-[#00af90]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedStudents.map(student => {
                    const LearningStyleIcon = getLearningStyleIcon(student.learning_style);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className={`px-4 ${getDensityPadding()} whitespace-nowrap`}>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => toggleSelectStudent(student.id)}
                          />
                        </td>
                        <td className={`px-6 ${getDensityPadding()} whitespace-nowrap`}>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {student.first_name[0]}{student.last_name[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.full_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 ${getDensityPadding()} whitespace-nowrap`}>
                          <div className="text-sm text-gray-900">{student.email}</div>
                        </td>
                        <td className={`px-6 ${getDensityPadding()} whitespace-nowrap`}>
                          <div className="text-sm text-gray-900">{student.grade_level}</div>
                        </td>
                        <td className={`px-6 ${getDensityPadding()} whitespace-nowrap`}>
                          <Badge variant="secondary" className={getLearningStyleColor(student.learning_style)}>
                            <LearningStyleIcon className="w-3 h-3 mr-1" />
                            {student.learning_style.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className={`px-6 ${getDensityPadding()}`}>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {student.preferred_modules && student.preferred_modules.length > 0 ? (
                              student.preferred_modules.map((module, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {module}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </div>
                        </td>
                        <td className={`px-6 ${getDensityPadding()} whitespace-nowrap`}>
                          {student.learning_type ? (
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                              {student.learning_type}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">Not set</span>
                          )}
                        </td>
                        <td className={`px-6 ${getDensityPadding()} whitespace-nowrap`}>
                          <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                            {student.status}
                          </Badge>
                        </td>
                        <td className={`px-6 ${getDensityPadding()} whitespace-nowrap text-right sticky right-0 bg-white`}>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewStudent(student)}
                              className="text-blue-600 hover:text-blue-900 hover:bg-blue-50">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStudent(student)}
                              className="text-green-600 hover:text-green-900 hover:bg-green-50">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id, student.full_name)}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No students found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </CardContent>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}>
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}>
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? 'bg-[#00af8f] hover:bg-[#00af90]' : ''}>
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}>
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}>
                  Last
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewStudent(student)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditStudent(student)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteStudent(student.id, student.full_name)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

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

      {/* Create Student Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Create a new student account. Default password is 'learn2025'.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Juan"
                />
              </div>
              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                  placeholder="Santos"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Dela Cruz"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="juan.delacruz@student.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <select
                  id="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Grade 7</option>
                  <option>Grade 8</option>
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="learningStyle">Learning Style</Label>
              <select
                id="learningStyle"
                value={formData.learningStyle}
                onChange={(e) => setFormData({...formData, learningStyle: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="reading_writing">Reading/Writing</option>
                <option value="kinesthetic">Kinesthetic</option>
              </select>
            </div>

            <div>
              <Label>Preferred Modules</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableModules.map((module) => (
                  <div
                    key={module}
                    onClick={() => toggleModule(module)}
                    className={`px-3 py-2 rounded-md border-2 cursor-pointer transition-all ${
                      formData.preferredModules.includes(module)
                        ? 'bg-[#00af8f] text-white border-[#00af8f]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#00af8f]'
                    }`}>
                    {module}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="learningType">Learning Type</Label>
              <select
                id="learningType"
                value={formData.learningType}
                onChange={(e) => setFormData({...formData, learningType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Not specified</option>
                {learningTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="bypassOnboarding"
                checked={formData.bypassOnboarding}
                onCheckedChange={(checked) => 
                  setFormData({...formData, bypassOnboarding: checked as boolean})
                }
              />
              <Label htmlFor="bypassOnboarding" className="text-sm">
                Bypass VARK Assessment (set onboarding_completed = true)
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#00af8f] hover:bg-[#00af90]">
                Create Student
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Modal */}
      <Dialog open={showBulkImportModal} onOpenChange={setShowBulkImportModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Import Students</DialogTitle>
            <DialogDescription>
              Upload a JSON file with student data. Students with existing emails will be skipped.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              {!importFile ? (
                <div>
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}>
                    Select JSON File
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload student_logins.json
                  </p>
                </div>
              ) : (
                <div>
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <p className="font-medium">{importFile.name}</p>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setImportFile(null)}
                    className="text-red-600">
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {importProgress && (
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold">Import Progress</h4>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-2xl font-bold text-blue-600">{importProgress.total}</div>
                    <div className="text-gray-600">Total</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-2xl font-bold text-green-600">{importProgress.success}</div>
                    <div className="text-gray-600">Success</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-2xl font-bold text-yellow-600">{importProgress.skipped}</div>
                    <div className="text-gray-600">Skipped</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-2xl font-bold text-red-600">{importProgress.failed}</div>
                    <div className="text-gray-600">Failed</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowBulkImportModal(false);
                  setImportFile(null);
                  setImportProgress(null);
                }}
                disabled={isImporting}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleBulkImport}
                disabled={!importFile || isImporting}
                className="bg-[#00af8f] hover:bg-[#00af90]">
                {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isImporting ? 'Importing...' : 'Import Students'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Student Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
            <DialogDescription>
              View complete student information
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4">
              {/* Student Header */}
              <div className="flex items-center space-x-4 pb-4 border-b">
                <div className="h-16 w-16 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedStudent.first_name[0]}{selectedStudent.last_name[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedStudent.full_name}</h3>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                </div>
              </div>

              {/* Student Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500 text-sm">Grade Level</Label>
                  <p className="font-medium text-gray-900">{selectedStudent.grade_level}</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedStudent.status === 'active' ? 'default' : 'secondary'}>
                      {selectedStudent.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-500 text-sm">Learning Style</Label>
                <div className="mt-1">
                  <Badge variant="secondary" className={getLearningStyleColor(selectedStudent.learning_style)}>
                    {(() => {
                      const Icon = getLearningStyleIcon(selectedStudent.learning_style);
                      return <Icon className="w-3 h-3 mr-1" />;
                    })()}
                    {selectedStudent.learning_style.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {selectedStudent.preferred_modules && selectedStudent.preferred_modules.length > 0 && (
                <div>
                  <Label className="text-gray-500 text-sm">Preferred Modules</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedStudent.preferred_modules.map((module, idx) => (
                      <Badge key={idx} variant="outline">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedStudent.learning_type && (
                <div>
                  <Label className="text-gray-500 text-sm">Learning Type</Label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                      {selectedStudent.learning_type}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-gray-500 text-sm">Enrollment Date</Label>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedStudent.enrollment_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Last Active</Label>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedStudent.last_active).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditStudent(selectedStudent);
                  }}
                  className="bg-[#00af8f] hover:bg-[#00af90]">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Student
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="editFirstName">First Name *</Label>
                <Input
                  id="editFirstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editMiddleName">Middle Name</Label>
                <Input
                  id="editMiddleName"
                  value={formData.middleName}
                  onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name *</Label>
                <Input
                  id="editLastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editEmail">Email *</Label>
              <Input
                id="editEmail"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editPassword">Password</Label>
                <Input
                  id="editPassword"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div>
                <Label htmlFor="editGradeLevel">Grade Level</Label>
                <select
                  id="editGradeLevel"
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Grade 7</option>
                  <option>Grade 8</option>
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="editLearningStyle">Learning Style</Label>
              <select
                id="editLearningStyle"
                value={formData.learningStyle}
                onChange={(e) => setFormData({...formData, learningStyle: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="reading_writing">Reading/Writing</option>
                <option value="kinesthetic">Kinesthetic</option>
              </select>
            </div>

            <div>
              <Label>Preferred Modules</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableModules.map((module) => (
                  <div
                    key={module}
                    onClick={() => toggleModule(module)}
                    className={`px-3 py-2 rounded-md border-2 cursor-pointer transition-all ${
                      formData.preferredModules.includes(module)
                        ? 'bg-[#00af8f] text-white border-[#00af8f]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#00af8f]'
                    }`}>
                    {module}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="editLearningType">Learning Type</Label>
              <select
                id="editLearningType"
                value={formData.learningType}
                onChange={(e) => setFormData({...formData, learningType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Not specified</option>
                {learningTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="editBypassOnboarding"
                checked={formData.bypassOnboarding}
                onCheckedChange={(checked) => 
                  setFormData({...formData, bypassOnboarding: checked as boolean})
                }
              />
              <Label htmlFor="editBypassOnboarding" className="text-sm">
                Mark as active (onboarding completed)
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStudent(null);
                  resetForm();
                }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#00af8f] hover:bg-[#00af90]">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

