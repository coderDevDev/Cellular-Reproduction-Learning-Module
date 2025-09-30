'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (photoUrl: string) => void;
  className?: string;
}

export function ProfilePhotoUpload({
  currentPhoto,
  onPhotoChange,
  className
}: ProfilePhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        onPhotoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onPhotoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayPhoto = previewUrl || currentPhoto;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col items-center space-y-4">
        {/* Photo Display */}
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={displayPhoto || ''} alt="Profile" />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-[#00af8f] to-[#00af90] text-white">
              <Camera className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>

          {/* Remove Button */}
          {displayPhoto && (
            <Button
              size="sm"
              variant="outline"
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0 bg-white border-2 border-red-500 hover:bg-red-500 hover:text-white"
              onClick={handleRemovePhoto}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Upload Area */}
        <div
          className={cn(
            'w-full max-w-md p-6 border-2 border-dashed rounded-xl text-center transition-colors cursor-pointer',
            isDragging
              ? 'border-[#00af8f] bg-[#00af8f]/5'
              : 'border-gray-300 hover:border-[#00af8f] hover:bg-gray-50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium text-[#00af8f]">Click to upload</span>{' '}
            or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Upload Button */}
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f] hover:text-white">
          <Camera className="w-4 h-4 mr-2" />
          Choose Photo
        </Button>
      </div>
    </div>
  );
}

