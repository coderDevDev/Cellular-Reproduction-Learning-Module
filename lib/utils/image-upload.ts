/**
 * Image Upload Utility for Editor.js
 * Handles image uploads and returns URLs
 */

export interface ImageUploadResponse {
  success: 1 | 0;
  file: {
    url: string;
  };
}

/**
 * Upload image by file
 * For now, converts to base64 for simplicity
 * TODO: Implement actual file upload to cloud storage (e.g., Supabase Storage)
 */
export async function uploadImageByFile(file: File): Promise<ImageUploadResponse> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      reject(new Error('Image size must be less than 5MB'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      resolve({
        success: 1,
        file: {
          url: base64 // Base64 data URL
        }
      });
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Upload image by URL
 * Validates and returns the URL
 */
export async function uploadImageByUrl(url: string): Promise<ImageUploadResponse> {
  return new Promise((resolve, reject) => {
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      reject(new Error('Invalid URL'));
      return;
    }

    // Check if it's an image URL (basic check)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    );

    if (!hasImageExtension && !url.includes('image')) {
      console.warn('URL may not be an image');
    }

    resolve({
      success: 1,
      file: {
        url: url
      }
    });
  });
}

/**
 * Future: Upload to Supabase Storage
 * Uncomment and configure when ready to use cloud storage
 */
/*
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function uploadImageToSupabase(file: File): Promise<ImageUploadResponse> {
  const supabase = createClientComponentClient();
  
  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = file.name.split('.').pop();
  const filename = `${timestamp}-${randomString}.${extension}`;
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('module-images') // Create this bucket in Supabase
    .upload(`content/${filename}`, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('module-images')
    .getPublicUrl(data.path);
  
  return {
    success: 1,
    file: {
      url: urlData.publicUrl
    }
  };
}
*/
