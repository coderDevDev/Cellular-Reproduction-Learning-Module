'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Trophy } from 'lucide-react';
import { VARKModulesAPI } from '@/lib/api/vark-modules';

interface ModuleCompletionBadgeProps {
  moduleId: string;
  studentId: string;
}

export default function ModuleCompletionBadge({
  moduleId,
  studentId
}: ModuleCompletionBadgeProps) {
  const [completion, setCompletion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompletion();
  }, [moduleId, studentId]);

  const loadCompletion = async () => {
    try {
      const varkAPI = new VARKModulesAPI();
      const data = await varkAPI.getStudentModuleCompletion(
        studentId,
        moduleId
      );
      setCompletion(data);
    } catch (error) {
      console.error('Error loading completion:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !completion) return null;

  const hours = Math.floor(completion.time_spent_minutes / 60);
  const minutes = completion.time_spent_minutes % 60;

  return (
    <div className="flex flex-wrap gap-2">
      {/* Completion Badge */}
      <Badge className="bg-green-600 text-white flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Completed
      </Badge>

      {/* Score Badge */}
      {/* <Badge
        className={
          completion.final_score >= 90
            ? 'bg-green-600'
            : completion.final_score >= 80
            ? 'bg-blue-600'
            : completion.final_score >= 60
            ? 'bg-yellow-600'
            : 'bg-gray-600'
        }>
        <Trophy className="w-3 h-3 mr-1" />
        {completion.final_score}%
      </Badge> */}

      {/* Time Badge */}
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
      </Badge>

      {/* Perfect Sections Badge */}
      {completion.perfect_sections > 0 && (
        <Badge className="bg-yellow-500 text-white">
          ⭐ {completion.perfect_sections} Perfect
        </Badge>
      )}

      {/* Improvement Badge */}
      {completion.post_test_score && completion.pre_test_score && (
        <Badge className="bg-purple-600 text-white">
          +{Math.round(completion.post_test_score - completion.pre_test_score)}%
          Growth
        </Badge>
      )}
    </div>
  );
}
