import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { optimizeImage, optimizeThumbnail, optimizeGalleryImage, optimizeLogo, validateImageFile, formatFileSize } from './imageOptimization';

/**
 * Upload a file to Firebase Storage with automatic optimization
 * @param file - The file to upload
 * @param path - The storage path (e.g., 'projects/thumbnails/image.jpg')
 * @param optimize - Whether to optimize the image (default: true for images)
 * @returns Promise<string> - The download URL of the uploaded file
 */
export async function uploadFile(file: File, path: string, optimize: boolean = true): Promise<string> {
  try {
    console.log(`Uploading file to: ${path}`);
    console.log(`Original file size: ${formatFileSize(file.size)}`);

    let fileToUpload = file;

    // Optimize image if it's an image file and optimization is enabled
    if (optimize && file.type.startsWith('image/')) {
      // Validate image file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Determine optimization type based on path
      let optimizationResult;
      if (path.includes('thumbnails') || path.includes('logo')) {
        optimizationResult = await optimizeThumbnail(file);
      } else if (path.includes('gallery')) {
        optimizationResult = await optimizeGalleryImage(file);
      } else {
        // Default optimization
        optimizationResult = await optimizeImage(file);
      }

      fileToUpload = optimizationResult.file;
      console.log(`Optimized file size: ${formatFileSize(optimizationResult.optimizedSize)}`);
      console.log(`Compression ratio: ${optimizationResult.compressionRatio.toFixed(1)}%`);
    }

    // Create a storage reference
    const storageRef = ref(storage, path);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, fileToUpload);
    console.log('File uploaded successfully:', snapshot.metadata.name);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload multiple files to Firebase Storage with optimization
 * @param files - Array of files to upload
 * @param basePath - Base path for storage (e.g., 'projects/gallery/')
 * @param optimize - Whether to optimize images (default: true)
 * @returns Promise<string[]> - Array of download URLs
 */
export async function uploadFiles(files: File[], basePath: string, optimize: boolean = true): Promise<string[]> {
  try {
    const uploadPromises = files.map((file, index) => {
      const path = `${basePath}${Date.now()}_${index}_${file.name}`;
      return uploadFile(file, path, optimize);
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload project thumbnail with optimization
 * @param file - Thumbnail image file
 * @param projectId - Project ID for path
 * @returns Promise<string> - Download URL
 */
export async function uploadProjectThumbnail(file: File, projectId: string): Promise<string> {
  const path = `projects/thumbnails/${projectId}_${Date.now()}_${file.name}`;
  return uploadFile(file, path, true);
}

/**
 * Upload project gallery images with optimization
 * @param files - Array of gallery image files
 * @param projectId - Project ID for path
 * @returns Promise<string[]> - Array of download URLs
 */
export async function uploadProjectGallery(files: File[], projectId: string): Promise<string[]> {
  const basePath = `projects/gallery/${projectId}/`;
  return uploadFiles(files, basePath, true);
}

/**
 * Upload project logo with optimization
 * @param file - Logo image file
 * @param projectId - Project ID for path
 * @returns Promise<string> - Download URL
 */
export async function uploadProjectLogo(file: File, projectId: string): Promise<string> {
  const path = `projects/logos/${projectId}_${Date.now()}_${file.name}`;
  return uploadFile(file, path, true);
}

/**
 * Delete a file from Firebase Storage
 * @param url - The download URL of the file to delete
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    // Extract the path from the URL
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get file size in a human-readable format
 * @param bytes - File size in bytes
 * @returns string - Formatted file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file type and size
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @param maxSizeInMB - Maximum file size in MB
 * @returns boolean - Whether the file is valid
 */
export function validateFile(
  file: File, 
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxSizeInMB: number = 5
): { isValid: boolean; error?: string } {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  
  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size too large. Maximum size: ${maxSizeInMB}MB`
    };
  }
  
  return { isValid: true };
}

/**
 * Generate a unique file path
 * @param originalName - Original file name
 * @param folder - Storage folder (e.g., 'projects/thumbnails')
 * @returns string - Unique file path
 */
export function generateFilePath(originalName: string, folder: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `${folder}/${timestamp}_${randomId}_${cleanName}`;
}
