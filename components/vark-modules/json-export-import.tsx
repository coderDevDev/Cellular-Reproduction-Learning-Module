'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, FileJson, CheckCircle, AlertCircle } from 'lucide-react';
import { VARKModule } from '@/types/vark-module';
import {
  exportModuleToJSON,
  importModuleFromJSON,
  validateModuleData,
  downloadSampleTemplate
} from '@/lib/utils/module-json-handler';

interface JSONExportImportProps {
  formData: Partial<VARKModule>;
  onImport: (data: Partial<VARKModule>) => void;
}

export default function JSONExportImport({ formData, onImport }: JSONExportImportProps) {
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const filename = formData.title
      ? `${formData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`
      : `vark-module-${Date.now()}.json`;

    const success = exportModuleToJSON(formData, filename);

    if (success) {
      setImportStatus({
        type: 'success',
        message: '✅ Module exported successfully! Check your downloads folder.'
      });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);
    } else {
      setImportStatus({
        type: 'error',
        message: '❌ Failed to export module. Please try again.'
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await importModuleFromJSON(file);

      // Validate data
      const validation = validateModuleData(data);

      if (!validation.valid) {
        setImportStatus({
          type: 'error',
          message: `❌ Invalid module data: ${validation.errors.join(', ')}`
        });
        return;
      }

      // Import successful
      onImport(data);
      setImportStatus({
        type: 'success',
        message: `✅ Module imported successfully! Title: "${data.title}", Sections: ${data.content_structure?.sections?.length || 0}`
      });

      // Clear file input
      event.target.value = '';

      setTimeout(() => setImportStatus({ type: null, message: '' }), 8000);
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus({
        type: 'error',
        message: `❌ Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const handleDownloadTemplate = () => {
    downloadSampleTemplate();
    setImportStatus({
      type: 'success',
      message: '✅ Template downloaded! Use this as a starting point.'
    });
    setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileJson className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">JSON Export/Import</CardTitle>
          </div>
          <CardDescription>
            Save your work as JSON or load a previously saved module
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Alert */}
          {importStatus.type && (
            <Alert
              variant={importStatus.type === 'error' ? 'destructive' : 'default'}
              className={
                importStatus.type === 'success'
                  ? 'bg-green-50 border-green-200'
                  : ''
              }>
              {importStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{importStatus.message}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Export Button */}
            <Button
              onClick={handleExport}
              variant="outline"
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
              disabled={!formData.title}>
              <Download className="w-4 h-4 mr-2" />
              Export to JSON
            </Button>

            {/* Import Button */}
            <Button
              onClick={handleImportClick}
              variant="outline"
              className="w-full border-green-300 text-green-700 hover:bg-green-50">
              <Upload className="w-4 h-4 mr-2" />
              Import from JSON
            </Button>

            {/* Download Template Button */}
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
              <FileJson className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Info Text */}
          <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
            <p>
              💡 <strong>Export:</strong> Save your current work as a JSON file
              (works even if incomplete)
            </p>
            <p>
              💡 <strong>Import:</strong> Load a previously saved JSON file to
              continue editing
            </p>
            <p>
              💡 <strong>Template:</strong> Download a sample JSON structure to
              see the format
            </p>
          </div>

          {/* Module Info */}
          {formData.title && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <h4 className="font-medium text-gray-700 mb-2">
                Current Module Info:
              </h4>
              <ul className="space-y-1 text-gray-600">
                <li>
                  📝 <strong>Title:</strong> {formData.title}
                </li>
                <li>
                  📋 <strong>Sections:</strong>{' '}
                  {formData.content_structure?.sections?.length || 0}
                </li>
                <li>
                  🎯 <strong>Objectives:</strong>{' '}
                  {formData.learning_objectives?.length || 0}
                </li>
                <li>
                  ❓ <strong>Questions:</strong>{' '}
                  {formData.assessment_questions?.length || 0}
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
