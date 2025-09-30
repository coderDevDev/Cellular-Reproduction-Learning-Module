import Tesseract from 'tesseract.js';

export interface IDValidationResult {
  isValid: boolean;
  confidence: number;
  detectedText: string[];
  documentType?:
    | 'passport'
    | 'drivers_license'
    | 'national_id'
    | 'senior_citizen_id'
    | 'unknown';
  errors: string[];
}

export interface IDValidationOptions {
  minConfidence?: number;
  requiredKeywords?: string[];
  maxFileSize?: number; // in bytes
  allowedFormats?: string[];
}

const DEFAULT_OPTIONS: IDValidationOptions = {
  minConfidence: 0.6,
  requiredKeywords: [
    'REPUBLIC',
    'PHILIPPINES',
    'PASSPORT',
    'DRIVER',
    'LICENSE',
    'NATIONAL',
    'IDENTIFICATION',
    'SENIOR',
    'CITIZEN',
    'OSCA',
    'DEPARTMENT',
    'TRANSPORTATION',
    'LTO',
    'DFA',
    'PSA'
  ],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};

export class IDValidator {
  private options: IDValidationOptions;

  constructor(options: IDValidationOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Validates if the uploaded file is a valid ID document
   */
  async validateIDDocument(file: File): Promise<IDValidationResult> {
    const result: IDValidationResult = {
      isValid: false,
      confidence: 0,
      detectedText: [],
      documentType: 'unknown',
      errors: []
    };

    try {
      // Step 1: Basic file validation
      const fileValidation = this.validateFile(file);
      if (!fileValidation.isValid) {
        result.errors.push(...fileValidation.errors);
        return result;
      }

      // Step 2: Image preprocessing
      const processedImage = await this.preprocessImage(file);

      // Step 3: OCR text extraction
      const ocrResult = await this.extractText(processedImage);
      result.detectedText = ocrResult.text;
      result.confidence = ocrResult.confidence;

      // Step 4: Document type detection
      const documentType = this.detectDocumentType(ocrResult.text);
      result.documentType = documentType;

      // Step 5: Content validation
      const contentValidation = this.validateContent(
        ocrResult.text,
        documentType
      );

      // Step 6: Determine if valid
      result.isValid =
        contentValidation.isValid &&
        ocrResult.confidence >= (this.options.minConfidence || 0.6);

      if (!result.isValid) {
        result.errors.push(...contentValidation.errors);
        if (ocrResult.confidence < (this.options.minConfidence || 0.6)) {
          result.errors.push(
            `OCR confidence too low: ${(ocrResult.confidence * 100).toFixed(
              1
            )}%`
          );
        }
      }
    } catch (error) {
      result.errors.push(
        `Validation error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }

    return result;
  }

  /**
   * Validates basic file properties
   */
  private validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size
    if (file.size > (this.options.maxFileSize || 10 * 1024 * 1024)) {
      errors.push(
        `File size too large: ${(file.size / 1024 / 1024).toFixed(1)}MB`
      );
    }

    // Check file format
    const allowedFormats = this.options.allowedFormats || [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];
    if (!allowedFormats.includes(file.type)) {
      errors.push(
        `Invalid file format: ${
          file.type
        }. Allowed formats: ${allowedFormats.join(', ')}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Preprocesses the image for better OCR results
   */
  private async preprocessImage(file: File): Promise<string> {
    try {
      // Simple approach: convert file to base64 without preprocessing
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Image preprocessing error:', error);
      // Fallback: convert file to base64 without preprocessing
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  /**
   * Extracts text from image using OCR
   */
  private async extractText(
    imageBase64: string
  ): Promise<{ text: string[]; confidence: number }> {
    try {
      const result = await Tesseract.recognize(imageBase64, 'eng', {
        logger: m => console.log(m), // Optional: for debugging
        errorHandler: err => console.error(err)
      });

      const text = result.data.text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const confidence = result.data.confidence / 100; // Convert to 0-1 scale

      return { text, confidence };
    } catch (error) {
      console.error('OCR extraction error:', error);
      return { text: [], confidence: 0 };
    }
  }

  /**
   * Detects the type of document based on extracted text
   */
  private detectDocumentType(
    text: string[]
  ):
    | 'passport'
    | 'drivers_license'
    | 'national_id'
    | 'senior_citizen_id'
    | 'unknown' {
    const joinedText = text.join(' ').toUpperCase();

    if (joinedText.includes('PASSPORT') || joinedText.includes('DFA')) {
      return 'passport';
    }

    if (
      joinedText.includes('DRIVER') ||
      joinedText.includes('LICENSE') ||
      joinedText.includes('LTO')
    ) {
      return 'drivers_license';
    }

    if (
      joinedText.includes('NATIONAL') &&
      joinedText.includes('IDENTIFICATION')
    ) {
      return 'national_id';
    }

    if (
      (joinedText.includes('SENIOR') && joinedText.includes('CITIZEN')) ||
      joinedText.includes('OSCA')
    ) {
      return 'senior_citizen_id';
    }

    return 'unknown';
  }

  /**
   * Validates the content of the document
   */
  private validateContent(
    text: string[],
    documentType: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const joinedText = text.join(' ').toUpperCase();
    const requiredKeywords = this.options.requiredKeywords || [];

    // Check for required keywords
    const foundKeywords = requiredKeywords.filter(keyword =>
      joinedText.includes(keyword.toUpperCase())
    );

    if (foundKeywords.length === 0) {
      errors.push('No valid ID document keywords detected');
    }

    // Check for common ID document patterns
    const hasDatePattern = /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(joinedText);
    const hasNumberPattern = /\d{6,}/.test(joinedText); // ID numbers are usually 6+ digits

    if (!hasDatePattern && !hasNumberPattern) {
      errors.push('No date or ID number patterns detected');
    }

    // Document type specific validations
    switch (documentType) {
      case 'passport':
        if (
          !joinedText.includes('REPUBLIC') &&
          !joinedText.includes('PHILIPPINES')
        ) {
          errors.push('Passport should contain "REPUBLIC" or "PHILIPPINES"');
        }
        break;

      case 'drivers_license':
        if (!joinedText.includes('LICENSE') && !joinedText.includes('LTO')) {
          errors.push('Driver\'s license should contain "LICENSE" or "LTO"');
        }
        break;

      case 'national_id':
        if (
          !joinedText.includes('NATIONAL') ||
          !joinedText.includes('IDENTIFICATION')
        ) {
          errors.push('National ID should contain "NATIONAL IDENTIFICATION"');
        }
        break;

      case 'senior_citizen_id':
        if (
          !joinedText.includes('SENIOR') &&
          !joinedText.includes('CITIZEN') &&
          !joinedText.includes('OSCA')
        ) {
          errors.push(
            'Senior Citizen ID should contain "SENIOR", "CITIZEN", or "OSCA"'
          );
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates if the image contains a face (basic check)
   */
  async validateFaceDetection(imageBase64: string): Promise<boolean> {
    // This is a simplified face detection check
    // In a real implementation, you might use a face detection library
    // For now, we'll check if the image has reasonable dimensions and aspect ratio

    try {
      // Create an image element to check dimensions
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;

          // Check if image is portrait-oriented (typical for ID photos)
          const aspectRatio = width / height;
          const isPortrait = aspectRatio < 1.2;

          // Check if image has reasonable dimensions
          const hasReasonableSize = width >= 200 && height >= 200;

          resolve(isPortrait && hasReasonableSize);
        };
        img.onerror = () => {
          resolve(false);
        };
        img.src = imageBase64;
      });
    } catch (error) {
      console.error('Face detection validation error:', error);
      return false;
    }
  }
}

/**
 * Utility function to create a validator with default settings
 */
export function createIDValidator(options?: IDValidationOptions): IDValidator {
  return new IDValidator(options);
}

/**
 * Quick validation function for common use cases
 */
export async function validateIDDocument(
  file: File,
  options?: IDValidationOptions
): Promise<IDValidationResult> {
  const validator = createIDValidator(options);
  return await validator.validateIDDocument(file);
}
