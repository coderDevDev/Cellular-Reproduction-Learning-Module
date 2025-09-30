'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IDPictureUpload } from '@/components/ui/id-picture-upload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { IDValidationResult } from '@/lib/utils/id-validation';

export default function TestIDValidationPage() {
  const [validationResults, setValidationResults] = useState<
    IDValidationResult[]
  >([]);

  const handleValidationChange = (
    isValid: boolean,
    result: IDValidationResult
  ) => {
    setValidationResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setValidationResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-[#333333]">
          ID Document Validation Test
        </h1>
        <p className="text-[#666666] max-w-2xl mx-auto">
          Test the ID document validation functionality. Upload various ID
          documents to see how the system detects and validates them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="border-2 border-[#E0DDD8]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#333333]">
              <FileText className="w-5 h-5 text-[#00af8f]" />
              Upload ID Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IDPictureUpload
              onChange={value =>
                console.log('ID uploaded:', value ? 'Yes' : 'No')
              }
              onValidationChange={handleValidationChange}
              enableValidation={true}
              onValidationToggle={(enabled) => {
                console.log('Validation toggled:', enabled);
              }}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="border-2 border-[#E0DDD8]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[#333333]">
                <CheckCircle className="w-5 h-5 text-[#00af8f]" />
                Validation Results
              </CardTitle>
              <Button
                onClick={clearResults}
                variant="outline"
                size="sm"
                className="text-[#666666]">
                Clear Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationResults.length === 0 ? (
                <div className="text-center py-8">
                  <Info className="w-8 h-8 text-[#666666] mx-auto mb-2" />
                  <p className="text-[#666666] text-sm">
                    Upload an ID document to see validation results
                  </p>
                </div>
              ) : (
                validationResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      result.isValid
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.isValid ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium text-[#333333]">
                          {result.documentType
                            ?.replace('_', ' ')
                            .toUpperCase() || 'Unknown Document'}
                        </span>
                      </div>
                      <Badge
                        variant={result.isValid ? 'default' : 'destructive'}
                        className={result.isValid ? 'bg-green-500' : ''}>
                        {result.isValid ? 'Valid' : 'Invalid'}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#666666]">Confidence:</span>
                        <span
                          className={`font-medium ${
                            result.confidence >= 0.8
                              ? 'text-green-600'
                              : result.confidence >= 0.6
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}>
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                      </div>

                      {result.detectedText.length > 0 && (
                        <div>
                          <span className="text-[#666666]">Detected Text:</span>
                          <div className="mt-1 p-2 bg-white rounded border text-xs font-mono max-h-20 overflow-y-auto">
                            {result.detectedText.slice(0, 3).join('\n')}
                            {result.detectedText.length > 3 && '...'}
                          </div>
                        </div>
                      )}

                      {result.errors.length > 0 && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <ul className="list-disc list-inside space-y-1">
                              {result.errors.map((error, errorIndex) => (
                                <li key={errorIndex} className="text-xs">
                                  {error}
                                </li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card className="border-2 border-[#E0DDD8]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#333333]">
            <Info className="w-5 h-5 text-[#00af8f]" />
            How ID Validation Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-[#333333]">
                Supported Document Types:
              </h4>
              <ul className="space-y-1 text-sm text-[#666666]">
                <li>• Philippine Passport</li>
                <li>• Driver's License (LTO)</li>
                <li>• National ID (PhilSys)</li>
                <li>• Senior Citizen ID (OSCA)</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-[#333333]">
                Validation Process:
              </h4>
              <ul className="space-y-1 text-sm text-[#666666]">
                <li>• File format and size validation</li>
                <li>• OCR text extraction</li>
                <li>• Document type detection</li>
                <li>• Content validation</li>
                <li>• Confidence scoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
