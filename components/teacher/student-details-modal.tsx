'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  User,
  BookOpen,
  Target,
  Clock,
  Trophy,
  TrendingUp,
  Download,
  Mail,
  CheckCircle,
  Award
} from 'lucide-react';
import { VARKModulesAPI } from '@/lib/api/vark-modules';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

export default function StudentDetailsModal({
  isOpen,
  onClose,
  studentId,
  studentName
}: StudentDetailsModalProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && studentId) {
      loadStudentData();
    }
  }, [isOpen, studentId]);

  const loadStudentData = async () => {
    try {
      const varkAPI = new VARKModulesAPI();
      const studentStats = await varkAPI.getStudentStats(studentId);
      setStats(studentStats);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    // TODO: Implement PDF report generation
    alert('Report download coming soon!');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            {studentName}'s Progress
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading student data...</p>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalModulesCompleted}
                  </p>
                  <p className="text-sm text-gray-600">Modules</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {stats.averageScore}%
                  </p>
                  <p className="text-sm text-gray-600">Avg Score</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.floor(stats.totalTimeSpent / 60)}h
                  </p>
                  <p className="text-sm text-gray-600">Study Time</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.totalBadges}
                  </p>
                  <p className="text-sm text-gray-600">Badges</p>
                </CardContent>
              </Card>
            </div>

            {/* Completion History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Module Completion History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentCompletions && stats.recentCompletions.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentCompletions.map((completion: any) => (
                      <div
                        key={completion.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {completion.vark_modules?.title || 'Module'}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              {new Date(completion.completion_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {Math.floor(completion.time_spent_minutes / 60)}h {completion.time_spent_minutes % 60}m
                            </span>
                            {completion.perfect_sections > 0 && (
                              <Badge className="bg-yellow-500">
                                ⭐ {completion.perfect_sections} Perfect
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            completion.final_score >= 90
                              ? 'text-green-600'
                              : completion.final_score >= 80
                              ? 'text-blue-600'
                              : 'text-gray-600'
                          }`}>
                            {completion.final_score}%
                          </div>
                          {completion.post_test_score && completion.pre_test_score && (
                            <Badge className="mt-2 bg-purple-600">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              +{Math.round(completion.post_test_score - completion.pre_test_score)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No completions yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Badges Earned */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Badges Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentBadges && stats.recentBadges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stats.recentBadges.map((badge: any) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="text-3xl">{badge.badge_icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{badge.badge_name}</h4>
                          <p className="text-sm text-gray-600">
                            {badge.badge_description}
                          </p>
                        </div>
                        <Badge variant="outline">{badge.badge_rarity}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No badges earned yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={downloadReport} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Send Feedback
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No data available
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
