'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  BookOpen,
  Target,
  Activity,
  Video,
  Gamepad2,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import VARKModuleBuilder from '@/components/vark-modules/vark-module-builder';
import { VARKModule } from '@/types/vark-module';

// Mock categories for demo
const mockCategories = [
  {
    id: 'biology-1',
    name: 'Biology Fundamentals',
    description: 'Core concepts in biology',
    subject: 'Biology',
    grade_level: 'Grade 10',
    learning_style: 'visual' as const,
    icon_name: 'dna',
    color_scheme: 'blue',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'chemistry-1',
    name: 'Chemistry Basics',
    description: 'Introduction to chemistry',
    subject: 'Chemistry',
    grade_level: 'Grade 10',
    learning_style: 'kinesthetic' as const,
    icon_name: 'flask',
    color_scheme: 'green',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export default function VARKModuleBuilderDemo() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [savedModule, setSavedModule] = useState<VARKModule | null>(null);

  const handleSave = (module: VARKModule) => {
    setSavedModule(module);
    setShowBuilder(false);
    console.log('Saved module:', module);
  };

  const handleCancel = () => {
    setShowBuilder(false);
  };

  if (showBuilder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <VARKModuleBuilder
          onSave={handleSave}
          onCancel={handleCancel}
          categories={mockCategories}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/demo">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Demos
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            VARK Module Builder Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the comprehensive VARK Module Builder that allows
            teachers to create dynamic, interactive learning modules tailored to
            different learning styles.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Step-by-Step Creation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                6 intuitive steps guide you through creating comprehensive
                learning modules
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">
                Learning Style Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Tag content with VARK learning styles for personalized student
                experiences
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Dynamic Content</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Support for text, tables, assessments, activities, and
                interactive elements
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Multimedia Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Rich multimedia content including videos, images, diagrams, and
                audio
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Interactive Elements</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Choose from 14+ interactive features to engage different
                learning styles
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Assessment Tools</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Create various question types with points, explanations, and
                feedback
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Builder Preview */}
        <Card className="border-0 shadow-lg mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Ready to Build Your Module?
            </CardTitle>
            <p className="text-gray-600">
              Click the button below to start creating your first VARK learning
              module
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => setShowBuilder(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <BookOpen className="w-6 h-6 mr-2" />
              Start Building Module
            </Button>
          </CardContent>
        </Card>

        {/* Saved Module Display */}
        {savedModule && (
          <Card className="border-0 shadow-lg bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Module Created Successfully!</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">
                    Module Details:
                  </h4>
                  <p className="text-green-700">
                    <strong>Title:</strong> {savedModule.title}
                  </p>
                  <p className="text-green-700">
                    <strong>Description:</strong> {savedModule.description}
                  </p>
                  <p className="text-green-700">
                    <strong>Difficulty:</strong> {savedModule.difficulty_level}
                  </p>
                  <p className="text-green-700">
                    <strong>Duration:</strong>{' '}
                    {savedModule.estimated_duration_minutes} minutes
                  </p>
                  <p className="text-green-700">
                    <strong>Content Sections:</strong>{' '}
                    {savedModule.content_structure.sections.length}
                  </p>
                  <p className="text-green-700">
                    <strong>Assessment Questions:</strong>{' '}
                    {savedModule.assessment_questions.length}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => setShowBuilder(true)}
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100">
                    Create Another Module
                  </Button>
                  <Button
                    onClick={() => setSavedModule(null)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100">
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Technical Details */}
        <Card className="border-0 shadow-lg mt-12">
          <CardHeader>
            <CardTitle className="text-xl">Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Component Architecture:
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Main Builder: VARKModuleBuilder</li>
                  <li>
                    • Step Components: BasicInfo, ContentStructure, Multimedia
                  </li>
                  <li>• Interactive Elements, Assessment, Review</li>
                  <li>• Form Validation & Progress Tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Data Structure:
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• TypeScript interfaces for type safety</li>
                  <li>• JSONB-compatible data structure</li>
                  <li>• Learning style tagging system</li>
                  <li>• Dynamic content type support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
