'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Star,
  CheckCircle
} from 'lucide-react';
import { VARKModulesAPI } from '@/lib/api/vark-modules';

interface CompletionDashboardProps {
  studentId: string;
}

const rarityColors = {
  bronze: 'bg-gradient-to-r from-orange-400 to-orange-600',
  silver: 'bg-gradient-to-r from-gray-300 to-gray-500',
  gold: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
  platinum: 'bg-gradient-to-r from-purple-400 to-purple-600'
};

export default function CompletionDashboard({ studentId }: CompletionDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [studentId]);

  const loadStats = async () => {
    try {
      const varkAPI = new VARKModulesAPI();
      const studentStats = await varkAPI.getStudentStats(studentId);
      setStats(studentStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const hours = Math.floor(stats.totalTimeSpent / 60);
  const minutes = stats.totalTimeSpent % 60;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Modules Completed */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Modules Completed
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats.totalModulesCompleted}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.averageScore}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <Progress value={stats.averageScore} className="h-2 mt-3" />
          </CardContent>
        </Card>

        {/* Total Time */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Study Time
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {hours}h {minutes}m
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Earned */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Badges Earned
                </p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {stats.totalBadges}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Completions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Recent Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentCompletions && stats.recentCompletions.length > 0 ? (
              <div className="space-y-4">
                {stats.recentCompletions.map((completion: any) => (
                  <div
                    key={completion.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {completion.vark_modules?.title || 'Module'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(completion.completion_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={
                          completion.final_score >= 90
                            ? 'bg-green-600'
                            : completion.final_score >= 80
                            ? 'bg-blue-600'
                            : 'bg-gray-600'
                        }>
                        {completion.final_score}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No completions yet. Start learning!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Recent Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentBadges && stats.recentBadges.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBadges.map((badge: any) => (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-4 p-4 ${
                      rarityColors[badge.badge_rarity as keyof typeof rarityColors]
                    } text-white rounded-lg shadow-md`}>
                    <div className="text-4xl">{badge.badge_icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold">{badge.badge_name}</h4>
                      <p className="text-sm opacity-90">{badge.badge_description}</p>
                    </div>
                    <Badge className="bg-white/20 border-white/30 text-white">
                      {badge.badge_rarity.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No badges yet. Complete modules to earn badges!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
