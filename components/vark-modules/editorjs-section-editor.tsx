'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Eye,
  Headphones,
  PenTool,
  Zap,
  Clock,
  Save,
  X,
  Sparkles,
  FileText
} from 'lucide-react';
import { OutputData } from '@editorjs/editorjs';
import dynamic from 'next/dynamic';
import { VARKModuleContentSection } from '@/types/vark-module';
import {
  editorJsToPlainText,
  editorJsToHtml,
  plainTextToEditorJs,
  extractKeyPoints
} from '@/lib/utils/editorjs-converter';

// Dynamically import Editor.js to avoid SSR issues
const EditorJSContentEditor = dynamic(
  () => import('./editorjs-content-editor'),
  { ssr: false }
);

interface EditorJSSectionEditorProps {
  section: VARKModuleContentSection;
  sectionIndex: number;
  onSave: (index: number, updates: Partial<VARKModuleContentSection>) => void;
  onCancel: () => void;
}

const learningStyleOptions = [
  { value: 'visual', label: 'Visual', icon: Eye, color: 'bg-blue-500' },
  { value: 'auditory', label: 'Auditory', icon: Headphones, color: 'bg-green-500' },
  { value: 'reading_writing', label: 'Reading/Writing', icon: PenTool, color: 'bg-purple-500' },
  { value: 'kinesthetic', label: 'Kinesthetic', icon: Zap, color: 'bg-orange-500' }
];

export default function EditorJSSectionEditor({
  section,
  sectionIndex,
  onSave,
  onCancel
}: EditorJSSectionEditorProps) {
  const [editedSection, setEditedSection] = useState<VARKModuleContentSection>(section);
  const [editorData, setEditorData] = useState<OutputData>(() => {
    // Initialize editor data from existing content
    if (section.content_data?.editorjs_data) {
      return section.content_data.editorjs_data;
    } else if (section.content_data?.text) {
      return plainTextToEditorJs(section.content_data.text);
    } else {
      return {
        blocks: [
          {
            type: 'paragraph',
            data: { text: '' }
          }
        ]
      };
    }
  });

  const handleEditorChange = (data: OutputData) => {
    setEditorData(data);
    
    // Auto-extract key points
    const keyPoints = extractKeyPoints(data);
    
    setEditedSection(prev => ({
      ...prev,
      content_data: {
        ...prev.content_data,
        editorjs_data: data,
        text: editorJsToPlainText(data),
        html: editorJsToHtml(data)
      },
      metadata: {
        ...prev.metadata,
        key_points: keyPoints.length > 0 ? keyPoints : prev.metadata?.key_points || []
      }
    }));
  };

  const handleSave = () => {
    onSave(sectionIndex, editedSection);
  };

  const toggleLearningStyle = (style: string) => {
    const currentStyles = editedSection.learning_style_tags || [];
    const newStyles = currentStyles.includes(style)
      ? currentStyles.filter(s => s !== style)
      : [...currentStyles, style];
    
    setEditedSection(prev => ({
      ...prev,
      learning_style_tags: newStyles
    }));
  };

  return (
    <Card className="border-2 border-teal-300 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                ✨ Edit Section with Editor.js
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                WYSIWYG editor for rich content creation
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-teal-700 border-teal-300">
            Section {sectionIndex + 1}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="editor" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Content Editor</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Section Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Editor Tab */}
          <TabsContent value="editor" className="space-y-6">
            {/* Section Title */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Section Title *
              </Label>
              <Input
                placeholder="e.g., 📚 Introduction to Cell Division"
                value={editedSection.title}
                onChange={e =>
                  setEditedSection(prev => ({ ...prev, title: e.target.value }))
                }
                className="text-lg font-medium"
              />
            </div>

            {/* Editor.js Content */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Content (WYSIWYG Editor)
              </Label>
              <div className="bg-gray-50 rounded-lg p-1">
                <EditorJSContentEditor
                  data={editorData}
                  onChange={handleEditorChange}
                  placeholder="Start writing your lesson content here... Use the + button to add different block types!"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 <strong>Tip:</strong> Click the <strong>+</strong> button on the left to add headers, lists, tables, quotes, code blocks, and more!
              </p>
            </div>

            {/* Preview Generated HTML */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                📝 Plain Text Preview
              </h4>
              <p className="text-sm text-blue-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-blue-100 max-h-40 overflow-y-auto">
                {editorJsToPlainText(editorData) || 'No content yet...'}
              </p>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Learning Style Tags */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                Target Learning Styles *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {learningStyleOptions.map(style => {
                  const Icon = style.icon;
                  const isSelected = editedSection.learning_style_tags?.includes(style.value);
                  
                  return (
                    <div
                      key={style.value}
                      onClick={() => toggleLearningStyle(style.value)}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? `${style.color} bg-opacity-10 border-current`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <Checkbox checked={isSelected} />
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-current' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                        {style.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Estimate */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Estimated Time (minutes)
              </Label>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={editedSection.time_estimate_minutes}
                  onChange={e =>
                    setEditedSection(prev => ({
                      ...prev,
                      time_estimate_minutes: parseInt(e.target.value) || 5
                    }))
                  }
                  className="w-24"
                />
                <span className="text-sm text-gray-600">minutes</span>
              </div>
            </div>

            {/* Required Section */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Checkbox
                checked={editedSection.is_required}
                onCheckedChange={checked =>
                  setEditedSection(prev => ({
                    ...prev,
                    is_required: checked as boolean
                  }))
                }
              />
              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Required Section
                </Label>
                <p className="text-xs text-gray-500">
                  Students must complete this section to progress
                </p>
              </div>
            </div>

            {/* Content Type */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Content Type
              </Label>
              <Select
                value={editedSection.content_type}
                onValueChange={value =>
                  setEditedSection(prev => ({
                    ...prev,
                    content_type: value as any
                  }))
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">📝 Text Content</SelectItem>
                  <SelectItem value="activity">🎯 Activity</SelectItem>
                  <SelectItem value="assessment">✅ Assessment</SelectItem>
                  <SelectItem value="highlight">💡 Highlight</SelectItem>
                  <SelectItem value="quick_check">🔍 Quick Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auto-Generated Key Points */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Auto-Generated Key Points
              </h4>
              <div className="space-y-1">
                {(editedSection.metadata?.key_points || []).length > 0 ? (
                  (editedSection.metadata?.key_points || []).map((point, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span className="text-sm text-green-800">{point}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-green-700 italic">
                    Key points will be auto-extracted from headers and lists
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-gray-300 hover:bg-gray-50">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Section
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
