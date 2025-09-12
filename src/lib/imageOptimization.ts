/**
 * Image optimization utilities for resizing and compressing images before upload
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'jpeg' | 'webp' | 'png';
}

export interface OptimizedImageResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

/**
 * Optimize image by resizing and compressing
 */
export async function optimizeImage(
  file: File, 
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.92,
    format = 'webp'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      const { width: newWidth, height: newHeight } = calculateDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      // Set canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to blob with compression
      const mimeType = format === 'png' ? 'image/png' : 
                      format === 'webp' ? 'image/webp' : 'image/jpeg';
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Create optimized file
          const optimizedFile = new File(
            [blob], 
            `optimized_${file.name.replace(/\.[^/.]+$/, '')}.${format}`,
            { type: mimeType }
          );

          const originalSize = file.size;
          const optimizedSize = optimizedFile.size;
          const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

          resolve({
            file: optimizedFile,
            originalSize,
            optimizedSize,
            compressionRatio
          });
        },
        mimeType,
        format === 'png' ? undefined : quality // PNG doesn't support quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image from file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight };

  // If image is smaller than max dimensions, don't upscale
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calculate scaling factor
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const scalingFactor = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(width * scalingFactor),
    height: Math.round(height * scalingFactor)
  };
}

/**
 * Optimize thumbnail image (high resolution, premium quality for readability)
 */
export async function optimizeThumbnail(file: File): Promise<OptimizedImageResult> {
  return optimizeImage(file, {
    maxWidth: 1600,
    maxHeight: 1200,
    quality: 0.95,
    format: 'webp'
  });
}

/**
 * Optimize gallery image (extra large size, premium quality for detail)
 */
export async function optimizeGalleryImage(file: File): Promise<OptimizedImageResult> {
  return optimizeImage(file, {
    maxWidth: 2000,
    maxHeight: 1500,
    quality: 0.95,
    format: 'webp'
  });
}

/**
 * Optimize logo image (smaller size, preserve quality for transparency)
 */
export async function optimizeLogo(file: File): Promise<OptimizedImageResult> {
  // Check if image has transparency (PNG)
  const isPng = file.type === 'image/png';
  
  return optimizeImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.9,
    format: isPng ? 'png' : 'jpeg' // Preserve PNG for transparency
  });
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate image file type and size
 */
export function validateImageFile(file: File, maxSizeBytes: number = 10 * 1024 * 1024): {
  isValid: boolean;
  error?: string;
} {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'File must be an image' };
  }

  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedTypes.includes(file.type)) {
    return { isValid: false, error: 'Supported formats: JPEG, PNG, WebP' };
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    return { 
      isValid: false, 
      error: `File size must be less than ${formatFileSize(maxSizeBytes)}` 
    };
  }

  return { isValid: true };
}
