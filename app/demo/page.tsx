'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Target,
  Brain,
  Zap,
  Eye,
  Headphones,
  PenTool,
  ArrowRight,
  Play,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

const demos = [
  {
    id: 'cell-division',
    title: '📘 Cell Division – Mitosis & Meiosis',
    description:
      'Interactive learning module covering cell division processes with assessments, activities, and multimedia content.',
    features: [
      'Dynamic content sections',
      'Interactive assessments',
      'Progress tracking',
      'Learning style support',
      'Rich multimedia content'
    ],
    difficulty: 'Intermediate',
    duration: '60 min',
    learningStyles: ['visual', 'reading_writing', 'kinesthetic'],
    href: '/demo/cell-division-module',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'vark-assessment',
    title: '🧠 VARK Learning Style Assessment',
    description:
      'Comprehensive assessment to determine your preferred learning style with personalized recommendations.',
    features: [
      'Learning style detection',
      'Personalized results',
      'Style-specific tips',
      'Progress tracking'
    ],
    difficulty: 'Beginner',
    duration: '15 min',
    learningStyles: ['kinesthetic', 'visual'],
    href: '/onboarding/vark',
    icon: Brain,
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'vark-module-builder',
    title: 'VARK Module Builder',
    description:
      'Comprehensive builder for teachers to create dynamic, interactive VARK learning modules with step-by-step guidance.',
    features: [
      '6-step creation process',
      'Dynamic content types',
      'Learning style tagging',
      'Interactive elements',
      'Assessment builder',
      'Real-time validation'
    ],
    difficulty: 'Advanced',
    duration: '30 min',
    learningStyles: ['visual', 'reading_writing', 'kinesthetic'],
    href: '/demo/vark-module-builder',
    icon: BookOpen,
    color: 'from-green-500 to-emerald-600'
  }
];

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

export default function DemoIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            VARK Learning System Demos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the power of personalized learning with our interactive
            VARK modules. Each demo showcases different aspects of our dynamic
            content management system.
          </p>
        </div>

        {/* Demos Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {demos.map(demo => {
            const Icon = demo.icon;
            return (
              <Card
                key={demo.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader
                  className={`bg-gradient-to-r ${demo.color} text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <Badge
                            variant="secondary"
                            className="bg-white/20 text-white border-white/30">
                            {demo.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-bold text-white mb-2">
                        {demo.title}
                      </CardTitle>
                      <p className="text-white/90 text-lg">
                        {demo.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Key Features:
                    </h4>
                    <ul className="space-y-2">
                      {demo.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center space-x-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Learning Styles */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Learning Style Support:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {demo.learningStyles.map(style => {
                        const StyleIcon =
                          learningStyleIcons[
                            style as keyof typeof learningStyleIcons
                          ];
                        const color =
                          learningStyleColors[
                            style as keyof typeof learningStyleColors
                          ];
                        return (
                          <Badge
                            key={style}
                            className={`bg-gradient-to-r ${color} text-white`}>
                            <StyleIcon className="w-3 h-3 mr-1" />
                            {style.replace('_', ' ')}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{demo.difficulty}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Play className="w-4 h-4" />
                        <span>{demo.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link href={demo.href}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Try Demo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* VARK Module Builder */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">VARK Module Builder</CardTitle>
                <p className="text-gray-600">
                  Comprehensive module creation with VARK learning style
                  integration
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                Experience the step-by-step VARK Module Builder that allows
                teachers to create dynamic, interactive learning modules
                tailored to different learning styles.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/demo/vark-module-builder">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Demo Builder
                  </Button>
                </Link>
                <Link href="/teacher/vark-modules">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-purple-300 text-purple-700 hover:bg-purple-50">
                    <Target className="w-4 h-4 mr-2" />
                    Try in Teacher Portal
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Target className="w-6 h-6 mr-3 text-blue-600" />
              VARK Learning System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Visual Learners
                </h4>
                <p className="text-sm text-gray-600">
                  Interactive diagrams, charts, videos, and visual content
                  organization
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Auditory Learners
                </h4>
                <p className="text-sm text-gray-600">
                  Audio lessons, podcasts, discussions, and verbal explanations
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PenTool className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Reading/Writing
                </h4>
                <p className="text-sm text-gray-600">
                  Text-based content, note-taking tools, and written activities
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Kinesthetic Learners
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Hands-on activities, simulations, experiments, and interactive
                experiences
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Experience Personalized Learning?
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Start with any demo above to see how our VARK system adapts to your
            learning style
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo/cell-division-module">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4">
                <BookOpen className="w-5 h-5 mr-2" />
                Try Cell Division Module
              </Button>
            </Link>
            <Link href="/onboarding/vark">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 border-2 border-gray-300 hover:border-blue-500">
                <Brain className="w-5 h-5 mr-2" />
                Take VARK Assessment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
