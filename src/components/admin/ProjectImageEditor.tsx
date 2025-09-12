"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Plus, Image as ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import type { Project } from "@/types";

interface ProjectImageEditorProps {
  project: Project;
  onSave: (updates: Partial<Project>) => Promise<void>;
  onCancel: () => void;
  isProcessing: boolean;
}

export function ProjectImageEditor({ project, onSave, onCancel, isProcessing }: ProjectImageEditorProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState(project.thumbnailUrl || "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(project.galleryUrls || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setGalleryUrls(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setGalleryUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const updates: Partial<Project> = {
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      galleryUrls: galleryUrls.filter(url => url.trim())
    };

    await onSave(updates);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', project.id);

      // Upload to your image hosting service (implement this endpoint)
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await response.json();
      
      // Add to gallery
      setGalleryUrls(prev => [...prev, url]);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. You can still add images by URL.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      alert('Please drop image files only');
      return;
    }

    // Process each image file
    for (const file of imageFiles) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 5MB.`);
        continue;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', project.id);

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const { url } = await response.json();
        setGalleryUrls(prev => [...prev, url]);

      } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Edit Project Images: {project.name}
        </CardTitle>
        <CardDescription>
          Update thumbnail and gallery images for this project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Thumbnail Section */}
        <div>
          <Label htmlFor="thumbnail-url" className="text-base font-semibold">
            Thumbnail Image
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Main project image displayed in cards and listings
          </p>
          
          <div className="space-y-3">
            <Input
              id="thumbnail-url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full"
            />
            
            {thumbnailUrl && (
              <div className="relative w-48 h-32 border rounded-lg overflow-hidden">
                <Image
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  fill
                  className="object-cover"
                  onError={() => setThumbnailUrl("")}
                />
              </div>
            )}
          </div>
        </div>

        {/* Gallery Section */}
        <div>
          <Label className="text-base font-semibold">
            Gallery Images
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Additional images shown in project detail page
          </p>

          {/* Add New Image */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
              />
              <Button 
                onClick={handleAddImage}
                disabled={!newImageUrl.trim()}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {/* File Upload & Drag Drop Zone */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {isUploading ? "Uploading..." : "Upload Files"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  Max 5MB each, JPG/PNG/WebP
                </span>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center transition-colors
                  ${isDragging
                    ? 'border-blue-400 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400 text-gray-500'
                  }
                `}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">
                  {isDragging ? 'Drop images here' : 'Drag & drop images here'}
                </p>
                <p className="text-xs mt-1">
                  Or click "Upload Files" to browse
                </p>
              </div>
            </div>
          </div>

          {/* Gallery Images Grid */}
          {galleryUrls.length > 0 && (
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Gallery Images ({galleryUrls.length})</p>
                <Button
                  onClick={() => setGalleryUrls([])}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-24 border rounded-lg overflow-hidden bg-gray-50">
                      <Image
                        src={url}
                        alt={`Gallery image ${index + 1}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        onError={() => handleRemoveImage(index)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <Button
                        onClick={() => handleRemoveImage(index)}
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      Image {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {galleryUrls.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No gallery images yet</p>
              <p className="text-sm">Add images using URL or file upload</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? "Saving..." : "Save Images"}
          </Button>
          
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
