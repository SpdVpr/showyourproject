'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface ProjectGalleryProps {
  mainImage: string;
  galleryImages: string[];
  projectName: string;
}

export function ProjectGallery({ mainImage, galleryImages, projectName }: ProjectGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Combine main image with gallery images
  const allImages = [mainImage, ...galleryImages];

  // Fix hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle keyboard events for modal
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeModal();
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleGlobalKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Gallery</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <div className="animate-pulse bg-gray-300 w-full h-full rounded-lg"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Project Gallery</CardTitle>
        </CardHeader>
        <CardContent className="p-6" onKeyDown={handleKeyDown} tabIndex={0}>
          <div className="space-y-4">
            {/* Main Image Display with Navigation */}
            <div className="relative h-96 rounded-lg overflow-hidden bg-gray-100 group flex items-center justify-center cursor-pointer" onClick={openModal}>
              <Image
                src={allImages[currentImageIndex]}
                alt={`${projectName} image ${currentImageIndex + 1}`}
                fill
                className="object-contain transition-all duration-300 hover:scale-105"
              />

              {/* Expand Icon */}
              <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="h-4 w-4" />
              </div>

            {/* Navigation Arrows - only show if more than 1 image */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity w-14 h-14 p-0 rounded-full shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity w-14 h-14 p-0 rounded-full shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            {allImages.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            )}
          </div>

          {/* Thumbnail Navigation - only show if more than 1 image */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className={`relative w-16 h-16 rounded cursor-pointer flex-shrink-0 transition-all ${
                    index === currentImageIndex
                      ? 'ring-2 ring-blue-500 opacity-100'
                      : 'opacity-60 hover:opacity-80'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
          </div>
        </CardContent>
      </Card>

      {/* Full-Screen Modal Gallery */}
    {isModalOpen && (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          onClick={closeModal}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Image Counter */}
        <div className="absolute top-4 left-4 z-10 text-white bg-black/50 px-3 py-1 rounded">
          {currentImageIndex + 1} / {allImages.length}
        </div>

        {/* Main Modal Image */}
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <Image
            src={allImages[currentImageIndex]}
            alt={`${projectName} image ${currentImageIndex + 1}`}
            fill
            className="object-contain"
          />
        </div>

        {/* Navigation Arrows - only show if more than 1 image */}
        {allImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="lg"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 w-16 h-16 p-0 rounded-full"
              onClick={prevImage}
            >
              <ChevronLeft className="h-10 w-10" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 w-16 h-16 p-0 rounded-full"
              onClick={nextImage}
            >
              <ChevronRight className="h-10 w-10" />
            </Button>
          </>
        )}

        {/* Thumbnail Navigation at Bottom */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <div className="flex gap-2 bg-black/50 p-2 rounded-lg">
              {allImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className={`relative w-12 h-12 rounded cursor-pointer flex-shrink-0 transition-all ${
                    index === currentImageIndex
                      ? 'ring-2 ring-white opacity-100'
                      : 'opacity-60 hover:opacity-80'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={imageUrl}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
    </>
  );
}
