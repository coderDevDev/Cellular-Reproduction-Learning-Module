'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { VARKModulesAPI } from '@/lib/api/vark-modules';
import {
  FileText,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Trophy,
  Target,
  BarChart3,
  Loader2,
  Calendar,
  Award,
  TrendingUp,
  AlertCircle,
  Star,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface ModuleSubmission {
  module_id: string;
  module_title: string;
  total_students: number;
  submitted_count: number;
  average_score: number;
  completion_rate: number;
}

interface StudentResult {
  student_id: string;
  student_name: string;
  student_email: string;
  module_id: string;
  module_title: string;
  completion_date: string;
  final_score: number;
  time_spent_minutes: number;
  sections_completed: number;
  perfect_sections: number;
}

export default function TeacherSubmissionsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<ModuleSubmission[]>([]);
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudentData, setSelectedStudentData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const varkAPI = new VARKModulesAPI();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedModule !== 'all') {
      loadStudentResults(selectedModule);
    }
  }, [selectedModule]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all modules
      const modulesData = await varkAPI.getModules();
      setModules(modulesData);

      // Load submission statistics for each module
      const submissionsData: ModuleSubmission[] = [];

      for (const module of modulesData) {
        try {
          const stats = await varkAPI.getModuleSubmissionStats(module.id);
          submissionsData.push({
            module_id: module.id,
            module_title: module.title,
            total_students: stats.totalStudents,
            submitted_count: stats.submittedCount,
            average_score: stats.averageScore,
            completion_rate: stats.completionRate
          });
        } catch (error) {
          console.error(`Error loading stats for module ${module.id}:`, error);
        }
      }

      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error loading submissions data:', error);
      toast.error('Failed to load submissions data');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentResults = async (moduleId: string) => {
    try {
      // Load all completions for this module
      const completions = await varkAPI.getModuleCompletions(moduleId);
      
      const results: StudentResult[] = completions.map((completion: any) => ({
        student_id: completion.student_id,
        student_name: `${completion.profiles?.first_name || ''} ${completion.profiles?.last_name || ''}`.trim() || 'Unknown Student',
        student_email: completion.profiles?.email || 'N/A',
        module_id: completion.module_id,
        module_title: modules.find(m => m.id === completion.module_id)?.title || 'Unknown Module',
        completion_date: completion.completion_date,
        final_score: completion.final_score || 0,
        time_spent_minutes: completion.time_spent_minutes || 0,
        sections_completed: completion.sections_completed || 0,
        perfect_sections: completion.perfect_sections || 0
      }));

      setStudentResults(results);
    } catch (error) {
      console.error('Error loading student results:', error);
      toast.error('Failed to load student results');
    }
  };

  const handleViewDetails = async (studentId: string, moduleId: string) => {
    try {
      setLoadingDetails(true);
      setShowDetailsModal(true);

      // Load module data
      const module = await varkAPI.getModuleById(moduleId);

      // Load completion data
      const completionData = await varkAPI.getStudentModuleCompletion(
        studentId,
        moduleId
      );

      // Load all section submissions
      const submissionsData = await varkAPI.getStudentSubmissions(
        studentId,
        moduleId
      );

      // Get student info
      const studentResult = studentResults.find(
        s => s.student_id === studentId && s.module_id === moduleId
      );

      setSelectedStudentData({
        student: studentResult,
        module,
        completion: completionData,
        submissions: submissionsData
      });
    } catch (error) {
      console.error('Error loading details:', error);
      toast.error('Failed to load student details');
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const downloadReport = () => {
    const data = selectedModule === 'all' ? submissions : studentResults;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `submissions-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  const filteredResults = studentResults.filter(result =>
    result.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.student_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
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
            Student Submissions
          </h1>
          <p className="text-gray-600">
            View and manage student module completions
          </p>
        </div>
        <Button 
          onClick={downloadReport} 
          variant="outline"
          className="border-2 border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f] hover:text-white">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-full md:w-64">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Module Overview Cards (when all modules selected) */}
      {selectedModule === 'all' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Module Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((submission) => (
              <Card
                key={submission.module_id}
                className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => setSelectedModule(submission.module_id)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-[#00af8f] transition-colors">
                        {submission.module_title}
                      </h3>
                      <Badge
                        className={`${
                          submission.completion_rate >= 80
                            ? 'bg-green-100 text-green-800'
                            : submission.completion_rate >= 50
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {submission.completion_rate}% Complete
                      </Badge>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </span>
                      <span className="font-bold text-gray-900">
                        {submission.submitted_count} / {submission.total_students}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Trophy className="w-4 h-4 mr-2" />
                        Avg Score
                      </span>
                      <span className="font-bold text-gray-900">
                        {submission.average_score}%
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Completion Rate</span>
                        <span>{submission.completion_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            submission.completion_rate >= 80
                              ? 'bg-green-500'
                              : submission.completion_rate >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${submission.completion_rate}%` }}
                        />
                      </div>
                    </div>

                    {/* <div className="pt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{submission.completion_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            submission.completion_rate >= 80
                              ? 'bg-green-500'
                              : submission.completion_rate >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${submission.completion_rate}%` }}
                        />
                      </div>
                    </div> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Student Results Table (when specific module selected) */}
      {selectedModule !== 'all' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {modules.find(m => m.id === selectedModule)?.title}
              </h2>
              <p className="text-sm text-gray-600">
                {filteredResults.length} student{filteredResults.length !== 1 ? 's' : ''} completed
              </p>
            </div>
            <Button
              onClick={() => setSelectedModule('all')}
              variant="outline"
              size="sm">
              ← Back to Overview
            </Button>
          </div>

          {filteredResults.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No submissions found for this module.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredResults.map((result) => (
                <Card
                  key={`${result.student_id}-${result.module_id}`}
                  className="border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {result.student_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {result.student_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {result.student_email}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">
                                Final Score
                              </p>
                              <div className="flex items-center space-x-2">
                                <Trophy
                                  className={`w-4 h-4 ${
                                    result.final_score >= 90
                                      ? 'text-green-600'
                                      : result.final_score >= 80
                                      ? 'text-blue-600'
                                      : 'text-yellow-600'
                                  }`}
                                />
                                <span className="font-bold text-lg">
                                  {result.final_score}%
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-gray-600 mb-1">
                                Time Spent
                              </p>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold">
                                  {Math.floor(result.time_spent_minutes / 60) > 0
                                    ? `${Math.floor(result.time_spent_minutes / 60)}h ${result.time_spent_minutes % 60}m`
                                    : `${result.time_spent_minutes}m`}
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-gray-600 mb-1">
                                Sections
                              </p>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="font-semibold">
                                  {result.sections_completed}
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-gray-600 mb-1">
                                Completed On
                              </p>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold text-sm">
                                  {new Date(result.completion_date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() =>
                            handleViewDetails(result.student_id, result.module_id)
                          }
                          className="ml-4 bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white border-0">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Student Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Student Performance Details
            </DialogTitle>
            <DialogDescription>
              {selectedStudentData?.student?.student_name} -{' '}
              {selectedStudentData?.module?.title}
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : selectedStudentData ? (
            <div className="space-y-6 mt-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Trophy className="w-6 h-6" />
                      <Badge className="bg-white text-green-600 text-xs">
                        Score
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold">
                      {selectedStudentData.completion?.final_score || 0}%
                    </div>
                    <p className="text-green-100 text-sm mt-1">
                      {(selectedStudentData.completion?.final_score || 0) >= 90
                        ? 'Excellent!'
                        : (selectedStudentData.completion?.final_score || 0) >= 80
                        ? 'Great!'
                        : 'Good!'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-6 h-6" />
                      <Badge className="bg-white text-blue-600 text-xs">
                        Time
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold">
                      {Math.floor(
                        (selectedStudentData.completion?.time_spent_minutes || 0) / 60
                      ) > 0
                        ? `${Math.floor(
                            (selectedStudentData.completion?.time_spent_minutes || 0) / 60
                          )}h`
                        : `${selectedStudentData.completion?.time_spent_minutes || 0}m`}
                    </div>
                    <p className="text-blue-100 text-sm mt-1">Study time</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="w-6 h-6" />
                      <Badge className="bg-white text-purple-600 text-xs">
                        Sections
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold">
                      {selectedStudentData.completion?.sections_completed || 0}
                    </div>
                    <p className="text-purple-100 text-sm mt-1">
                      {selectedStudentData.completion?.perfect_sections || 0} perfect
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Section Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    Section Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedStudentData.submissions?.length === 0 ? (
                      <p className="text-gray-600 text-center py-4">
                        No submissions found.
                      </p>
                    ) : (
                      selectedStudentData.submissions?.map(
                        (submission: any, index: number) => (
                          <div
                            key={submission.section_id}
                            className="border rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-semibold text-sm">
                                    {index + 1}. {submission.section_title}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {submission.section_type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {new Date(
                                    submission.submitted_at
                                  ).toLocaleString()}
                                </p>
                              </div>

                              {submission.assessment_results && (
                                <div className="text-right">
                                  <div
                                    className={`text-xl font-bold ${
                                      submission.assessment_results.passed
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}>
                                    {submission.assessment_results.percentage.toFixed(
                                      1
                                    )}
                                    %
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {submission.assessment_results.correct_count}/
                                    {submission.assessment_results.total_questions}{' '}
                                    correct
                                  </p>
                                </div>
                              )}
                            </div>

                            {submission.assessment_results && (
                              <Progress
                                value={submission.assessment_results.percentage}
                                className="h-2 mt-2"
                              />
                            )}
                          </div>
                        )
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
