'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Upload,
  X,
  ImageIcon,
  CheckCircle,
  AlertCircle,
  FileText,
  Camera,
  User,
  Shield,
  ShieldOff
} from 'lucide-react';
import {
  validateIDDocument,
  IDValidationResult
} from '@/lib/utils/id-validation';

interface IDPictureUploadProps {
  value?: string;
  onChange: (value: string, validationResult?: IDValidationResult) => void;
  onValidationChange?: (isValid: boolean, result: IDValidationResult) => void;
  disabled?: boolean;
  className?: string;
  maxFileSize?: number; // in bytes
  allowedFormats?: string[];
  minConfidence?: number;
  enableValidation?: boolean; // New prop to control validation
  onValidationToggle?: (enabled: boolean) => void; // New prop for validation toggle
}

export function IDPictureUpload({
  value,
  onChange,
  onValidationChange,
  disabled = false,
  className = '',
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  minConfidence = 0.6,
  enableValidation = true, // Default to enabled
  onValidationToggle
}: IDPictureUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] =
    useState<IDValidationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [validationEnabled, setValidationEnabled] = useState(enableValidation);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Basic file validation
    if (file.size > maxFileSize) {
      alert(
        `File size too large. Maximum size is ${(
          maxFileSize /
          1024 /
          1024
        ).toFixed(1)}MB`
      );
      return;
    }

    if (!allowedFormats.includes(file.type)) {
      alert(
        `Invalid file format. Allowed formats: ${allowedFormats.join(', ')}`
      );
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onChange(base64);
    };
    reader.readAsDataURL(file);

    // If validation is enabled, perform validation
    if (validationEnabled) {
      setIsValidating(true);
      setProgress(0);

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // Validate the ID document
        const result = await validateIDDocument(file, {
          minConfidence,
          maxFileSize,
          allowedFormats
        });

        clearInterval(progressInterval);
        setProgress(100);

        setValidationResult(result);
        onValidationChange?.(result.isValid, result);

        // Update the onChange with validation result
        const base64Result = await new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
        onChange(base64Result, result);
      } catch (error) {
        console.error('Validation error:', error);
        setValidationResult({
          isValid: false,
          confidence: 0,
          detectedText: [],
          errors: [`Validation error: ${error}`]
        });
        onValidationChange?.(false, {
          isValid: false,
          confidence: 0,
          detectedText: [],
          errors: [`Validation error: ${error}`]
        });
      } finally {
        setIsValidating(false);
        setProgress(0);
      }
    } else {
      // If validation is disabled, just upload without validation
      setValidationResult(null);
      onValidationChange?.(true, {
        isValid: true,
        confidence: 1,
        detectedText: [],
        errors: []
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = () => {
    onChange('');
    setValidationResult(null);
    onValidationChange?.(false, {
      isValid: false,
      confidence: 0,
      detectedText: [],
      errors: []
    });
  };

  const handleValidationToggle = (enabled: boolean) => {
    setValidationEnabled(enabled);
    onValidationToggle?.(enabled);

    // If validation is disabled and we have a current image, clear validation result
    if (!enabled && value) {
      setValidationResult(null);
      onValidationChange?.(true, {
        isValid: true,
        confidence: 1,
        detectedText: [],
        errors: []
      });
    }
  };

  const getDocumentTypeIcon = (type?: string) => {
    switch (type) {
      case 'passport':
        return <FileText className="w-4 h-4" />;
      case 'drivers_license':
        return <FileText className="w-4 h-4" />;
      case 'national_id':
        return <FileText className="w-4 h-4" />;
      case 'senior_citizen_id':
        return <User className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getDocumentTypeLabel = (type?: string) => {
    switch (type) {
      case 'passport':
        return 'Passport';
      case 'drivers_license':
        return "Driver's License";
      case 'national_id':
        return 'National ID';
      case 'senior_citizen_id':
        return 'Senior Citizen ID';
      default:
        return 'Unknown Document';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Validation Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          {validationEnabled ? (
            <Shield className="w-4 h-4 text-[#00af8f]" />
          ) : (
            <ShieldOff className="w-4 h-4 text-gray-400" />
          )}
          <Label htmlFor="validation-toggle" className="text-sm font-medium">
            Enable ID Validation
          </Label>
        </div>
        <Switch
          id="validation-toggle"
          checked={validationEnabled}
          onCheckedChange={handleValidationToggle}
          disabled={disabled}
        />
      </div>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragOver
            ? 'border-[#00af8f] bg-[#00af8f]/5'
            : value
            ? 'border-green-200 bg-green-50'
            : 'border-gray-300 hover:border-[#00af8f]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}>
        <CardContent className="p-6">
          {!value ? (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload ID Picture
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop your ID photo here, or click to browse
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <span>JPEG, PNG, WebP</span>
                <span>•</span>
                <span>Max {Math.round(maxFileSize / 1024 / 1024)}MB</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      ID Picture Uploaded
                    </h3>
                    <p className="text-sm text-gray-500">
                      {validationEnabled
                        ? 'Validation in progress...'
                        : 'Photo uploaded successfully'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Validation Results */}
              {validationEnabled && validationResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {validationResult.isValid ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        {validationResult.isValid ? 'Valid ID' : 'Invalid ID'}
                      </span>
                    </div>
                    <Badge
                      variant={
                        validationResult.isValid ? 'default' : 'destructive'
                      }>
                      {Math.round(validationResult.confidence * 100)}%
                      Confidence
                    </Badge>
                  </div>

                  {validationResult.documentType &&
                    validationResult.documentType !== 'unknown' && (
                      <div className="flex items-center space-x-2 text-sm">
                        {getDocumentTypeIcon(validationResult.documentType)}
                        <span className="text-gray-600">
                          Detected:{' '}
                          {getDocumentTypeLabel(validationResult.documentType)}
                        </span>
                      </div>
                    )}

                  {validationResult.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {validationResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationResult.detectedText.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Detected Text:
                      </h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        {validationResult.detectedText
                          .slice(0, 5)
                          .map((text, index) => (
                            <div key={index} className="truncate">
                              {text}
                            </div>
                          ))}
                        {validationResult.detectedText.length > 5 && (
                          <div className="text-gray-400">
                            ... and {validationResult.detectedText.length - 5}{' '}
                            more lines
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* No Validation Message */}
              {!validationEnabled && (
                <Alert>
                  <ShieldOff className="w-4 h-4" />
                  <AlertDescription>
                    ID validation is disabled. Photo uploaded without
                    validation.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Bar */}
      {isValidating && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Validating ID document...</span>
            <span className="text-gray-500">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={allowedFormats.join(',')}
        onChange={e => handleFileSelect(e.target.files)}
        disabled={disabled}
      />
    </div>
  );
}
