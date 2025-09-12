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

            {/* File Upload Option */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
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
                {isUploading ? "Uploading..." : "Upload File"}
              </Button>
              <span className="text-xs text-muted-foreground">
                Max 5MB, JPG/PNG/WebP
              </span>
            </div>
          </div>

          {/* Gallery Images Grid */}
          {galleryUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {galleryUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="relative w-full h-24 border rounded-lg overflow-hidden">
                    <Image
                      src={url}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={() => handleRemoveImage(index)}
                    />
                    <Button
                      onClick={() => handleRemoveImage(index)}
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
