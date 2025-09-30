'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Video,
  Image,
  BarChart3,
  Mic,
  Play,
  Activity,
  Brain,
  Zap,
  Beaker
} from 'lucide-react';
import { VARKModule } from '@/types/vark-module';

interface MultimediaStepProps {
  formData: Partial<VARKModule>;
  updateFormData: (updates: Partial<VARKModule>) => void;
  addArrayItem: (field: keyof VARKModule, item: string) => void;
  removeArrayItem: (field: keyof VARKModule, index: number) => void;
  updateArrayItem: (
    field: keyof VARKModule,
    index: number,
    value: string
  ) => void;
}

const multimediaCategories = [
  {
    key: 'videos',
    label: 'Videos',
    icon: Video,
    description: 'Educational videos, lectures, demonstrations',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    key: 'images',
    label: 'Images',
    icon: Image,
    description: 'Photos, illustrations, diagrams',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    key: 'diagrams',
    label: 'Diagrams',
    icon: BarChart3,
    description: 'Charts, graphs, flowcharts',
    color: 'from-teal-600 to-emerald-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    key: 'podcasts',
    label: 'Podcasts',
    icon: Mic,
    description: 'Audio lessons, interviews, discussions',
    color: 'from-emerald-600 to-teal-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    key: 'audio_lessons',
    label: 'Audio Lessons',
    icon: Mic,
    description: 'Narrated content, sound effects',
    color: 'from-teal-700 to-emerald-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    key: 'discussion_guides',
    label: 'Discussion Guides',
    icon: Brain,
    description: 'Conversation starters, debate topics',
    color: 'from-emerald-700 to-teal-800',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    key: 'interactive_simulations',
    label: 'Interactive Simulations',
    icon: Play,
    description: 'Virtual labs, simulations, games',
    color: 'from-teal-500 to-emerald-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    key: 'hands_on_activities',
    label: 'Hands-on Activities',
    icon: Activity,
    description: 'Physical experiments, crafts, projects',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    key: 'animations',
    label: 'Animations',
    icon: Zap,
    description: 'Animated explanations, motion graphics',
    color: 'from-teal-600 to-emerald-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  {
    key: 'virtual_labs',
    label: 'Virtual Labs',
    icon: Beaker,
    description: 'Virtual laboratory experiments',
    color: 'from-emerald-600 to-teal-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    key: 'interactive_diagrams',
    label: 'Interactive Diagrams',
    icon: BarChart3,
    description: 'Clickable diagrams and charts',
    color: 'from-teal-700 to-emerald-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  }
];

export default function MultimediaStep({
  formData,
  updateFormData,
  addArrayItem,
  removeArrayItem,
  updateArrayItem
}: MultimediaStepProps) {
  const renderMultimediaCategory = (
    category: (typeof multimediaCategories)[0]
  ) => {
    const Icon = category.icon;
    const currentItems = (formData.multimedia_content?.[
      category.key as keyof typeof formData.multimedia_content
    ] as string[]) || [''];

    return (
      <Card key={category.key} className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{category.label}</CardTitle>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder={`Enter ${category.label.toLowerCase()} URL or description...`}
                  value={item}
                  onChange={e =>
                    updateArrayItem(
                      category.key as keyof VARKModule,
                      index,
                      e.target.value
                    )
                  }
                  className="flex-1"
                />
                {currentItems.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      removeArrayItem(category.key as keyof VARKModule, index)
                    }
                    className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem(category.key as keyof VARKModule, '')}
              className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400">
              <Plus className="w-4 h-4 mr-2" />
              Add {category.label}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full blur-3xl opacity-30"></div>
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl">
                <Video className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Multimedia Content
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Add rich multimedia resources to enhance the learning experience.
              Engage different learning styles with videos, images, audio, and
              interactive elements.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {multimediaCategories.map(renderMultimediaCategory)}
      </div>

      {/* Quick Tips */}
      <Card className="border-0 shadow-sm bg-blue-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Multimedia Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">For Visual Learners:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use high-quality images and diagrams</li>
                <li>Include color-coded charts and graphs</li>
                <li>Add interactive visual elements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">For Auditory Learners:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Provide clear audio narration</li>
                <li>Include podcast-style content</li>
                <li>Add discussion guides and debates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
