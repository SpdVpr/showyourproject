"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { projectSubmissionSchema } from "@/lib/validations";
import { mockCategories } from "@/lib/mockData";
import { ChevronLeft, ChevronRight, Upload, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProjectSubmission } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { projectService } from "@/lib/firebaseServices";
import { uploadProjectThumbnail, uploadProjectGallery, downloadAndUploadImage } from "@/lib/storage";
import { formatFileSize } from "@/lib/imageOptimization";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useRouter } from "next/navigation";
import { invalidateCache } from "@/lib/cache";

const steps = [
  { id: 1, title: "Project Details", description: "Fill in all project information" },
  { id: 2, title: "Review & Submit", description: "Review and confirm your submission" },
];

export function SubmissionForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlMetadata, setUrlMetadata] = useState<any>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);


  const form = useForm<ProjectSubmission>({
    resolver: zodResolver(projectSubmissionSchema),
    defaultValues: {
      name: "",
      tagline: "",
      description: "",
      websiteUrl: "",
      category: "",
      teamSize: "1",
      foundedYear: new Date().getFullYear(),
      socialLinks: {
        twitter: "",
        github: "",
        producthunt: "",
      },
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = form;

  const addTag = () => {
    if (!newTag.trim()) return;

    // Split by comma and process each tag
    const newTags = newTag
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && !tags.includes(tag));

    // Add new tags up to the limit of 8 total
    const availableSlots = 8 - tags.length;
    const tagsToAdd = newTags.slice(0, availableSlots);

    if (tagsToAdd.length > 0) {
      const updatedTags = [...tags, ...tagsToAdd];
      setTags(updatedTags);
      setValue("tags", updatedTags);
    }

    setNewTag("");
  };

  const removeTag = (indexOrTag: number | string) => {
    let updatedTags: string[];
    if (typeof indexOrTag === 'number') {
      updatedTags = tags.filter((_, index) => index !== indexOrTag);
    } else {
      updatedTags = tags.filter(tag => tag !== indexOrTag);
    }
    setTags(updatedTags);
    setValue("tags", updatedTags);
  };

  const scrollToFirstError = () => {
    setTimeout(() => {
      const firstErrorElement = document.querySelector('[data-error="true"]');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };

  const nextStep = async () => {
    setValidationErrors([]);
    let fieldsToValidate: (keyof ProjectSubmission)[] = [];

    switch (currentStep) {
      case 1:
        // Validate all fields in step 1 (all project details)
        fieldsToValidate = ["name", "websiteUrl", "tagline", "description", "category", "teamSize", "foundedYear"];
        break;
    }

    const isValid = await trigger(fieldsToValidate);

    // Check for validation errors and collect them
    const currentErrors: string[] = [];
    fieldsToValidate.forEach(field => {
      if (errors[field]) {
        currentErrors.push(`${field}: ${errors[field]?.message}`);
      }
    });

    // Check tags separately since it's not in the form schema
    if (tags.length === 0) {
      currentErrors.push("tags: At least one tag is required");
    }

    // Check thumbnail requirement
    if (currentStep === 1) {
      const hasThumbnail = thumbnailFile || (urlMetadata && urlMetadata.image);
      if (!hasThumbnail) {
        currentErrors.push("thumbnail: Thumbnail is required - either upload an image or wait for website metadata to load");
      }
    }

    if (currentErrors.length > 0) {
      setValidationErrors(currentErrors);
      scrollToFirstError();
      return;
    }

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Function to normalize URL by adding https:// if missing
  const normalizeUrl = (url: string): string => {
    if (!url) return url;

    // Remove any leading/trailing whitespace
    url = url.trim();

    // If URL already has protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If URL starts with www., add https://
    if (url.startsWith('www.')) {
      return `https://${url}`;
    }

    // If URL looks like a domain (contains dot and no spaces), add https://
    if (url.includes('.') && !url.includes(' ') && url.length > 3) {
      return `https://${url}`;
    }

    return url;
  };

  const fetchUrlMetadata = async (url: string) => {
    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl || !normalizedUrl.startsWith('http')) return;

    setIsLoadingMetadata(true);
    try {
      const response = await fetch('/api/fetch-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { metadata } = await response.json();
      setUrlMetadata(metadata);

      // Auto-fill form fields with real data
      if (metadata.title) {
        // Limit project name to 27 characters
        const limitedTitle = metadata.title.slice(0, 27);
        form.setValue('name', limitedTitle);
      }
      if (metadata.description) {
        // Use description for both tagline (short) and full description
        const shortDesc = metadata.description.substring(0, 160); // SEO friendly length
        form.setValue('tagline', shortDesc);
        form.setValue('description', metadata.description);
      }

      // Thumbnail will be automatically used from metadata if available

    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      setUrlMetadata(null);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDragOver(null);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => handleFileUpload(file, type));
  };

  const handleFileUpload = (file: File, type: string) => {
    if (type === 'thumbnail') {
      setThumbnailFile(file);
    } else if (type === 'gallery' && galleryFiles.length < 5) {
      setGalleryFiles(prev => [...prev, file]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProjectSubmission) => {
    console.log("🚀 onSubmit function called!");
    console.log("Submit attempt - User:", user);
    console.log("User ID:", user?.id);
    console.log("Form data:", data);
    console.log("Tags:", tags);
    console.log("Thumbnail file:", thumbnailFile);
    console.log("URL metadata:", urlMetadata);

    // Clear previous errors
    setSubmitError("");

    if (!user || !user.id) {
      console.error("User not authenticated:", { user, hasId: !!user?.id });
      setSubmitError("Please log in to submit a project.");
      return;
    }

    // Final validation before submit
    const hasThumbnail = thumbnailFile || (urlMetadata && urlMetadata.image);
    if (!hasThumbnail) {
      setSubmitError("Thumbnail is required. Please upload an image or ensure website metadata loads properly.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine thumbnail URL
      let thumbnailUrl = "";
      if (thumbnailFile) {
        // User uploaded a file
        console.log("Uploading and optimizing thumbnail...");
        const tempProjectId = `temp_${Date.now()}`;
        try {
          thumbnailUrl = await uploadProjectThumbnail(thumbnailFile, tempProjectId);
        } catch (uploadError) {
          console.error("Thumbnail upload failed:", uploadError);
          throw new Error("Failed to upload thumbnail image. Please try a different image or check your internet connection.");
        }
      } else if (urlMetadata && urlMetadata.image) {
        // Download and upload auto-detected image from metadata to Firebase Storage
        console.log("Downloading and uploading thumbnail from metadata...");
        const tempProjectId = `temp_${Date.now()}`;
        try {
          thumbnailUrl = await downloadAndUploadImage(urlMetadata.image, tempProjectId, 'thumbnail');
        } catch (downloadError) {
          console.error("Thumbnail download failed:", downloadError);
          throw new Error("Failed to download thumbnail from website. Please upload a custom thumbnail image instead.");
        }
      }

      // Upload gallery images with optimization (optional)
      const galleryUrls: string[] = [];
      if (galleryFiles.length > 0) {
        console.log("Uploading and optimizing gallery images...");
        const tempProjectId = `temp_${Date.now()}`;
        try {
          const urls = await uploadProjectGallery(galleryFiles, tempProjectId);
          galleryUrls.push(...urls);
        } catch (galleryError) {
          console.error("Gallery upload failed:", galleryError);
          // Gallery is optional, so we continue without it but log the error
          console.warn("Gallery images failed to upload, continuing without them");
        }
      }

      // Prepare project data
      const projectData = {
        name: data.name,
        tagline: data.tagline || "",
        description: data.description,
        websiteUrl: data.websiteUrl,
        category: data.category,
        tags: tags,
        teamSize: data.teamSize,
        foundedYear: data.foundedYear,
        submitterId: user.id,
        submitterEmail: user.email || "",
        submitterName: user.displayName || user.email?.split('@')[0] || "Anonymous",
        status: "pending" as const,
        featured: false,
        logoUrl: thumbnailUrl, // Keep for logo display
        screenshotUrl: thumbnailUrl, // Use thumbnail as main screenshot
        galleryUrls: galleryUrls,
        voteCount: 0,
        viewCount: 0,
        clickCount: 0,
        socialLinks: {
          twitter: "",
          github: "",
          producthunt: "",
        },
        metadata: urlMetadata || null,
      };

      console.log("User object:", user);
      console.log("Submitting project data:", projectData);

      // Validate required fields
      if (!projectData.submitterId) {
        throw new Error("Authentication error: User ID is missing. Please log out and log back in.");
      }
      if (!projectData.name) {
        throw new Error("Project name is required and cannot be empty.");
      }
      if (!projectData.websiteUrl) {
        throw new Error("Website URL is required and cannot be empty.");
      }
      if (!thumbnailUrl) {
        throw new Error("Thumbnail image is required. Please upload an image or ensure website metadata loads properly.");
      }

      // Submit to Firebase
      const projectId = await projectService.submitProject(projectData);

      console.log("Project submitted with ID:", projectId);

      // Invalidate cache on client-side to ensure fresh data
      invalidateCache('projects');
      invalidateCache('new_projects');
      invalidateCache('pending');

      // Check if project was auto-approved or needs review
      const autoApproved = projectData.status === 'approved';
      const message = autoApproved
        ? "🎉 Project submitted and published successfully! Your project is now live on ShowYourProject.com."
        : "🎉 Project submitted successfully! We'll review it within 24 hours and notify you via email.";

      alert(message);

      // Reset form
      form.reset();
      setTags([]);
      setThumbnailFile(null);
      setGalleryFiles([]);
      setUrlMetadata(null);
      setCurrentStep(1);

      // Redirect to homepage after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error: any) {
      console.error("Error submitting project:", error);

      // Handle specific error types with detailed messages
      let errorMessage = "❌ Failed to submit project. ";

      if (error.message) {
        if (error.message.includes('duplicate URL') || error.message.includes('URL already exists')) {
          errorMessage = "❌ A project with this URL already exists. Please use a different website URL.";
        } else if (error.message.includes('thumbnail') || error.message.includes('image')) {
          errorMessage = `❌ Image Error: ${error.message}`;
        } else if (error.message.includes('Authentication') || error.message.includes('User ID')) {
          errorMessage = `❌ Authentication Error: ${error.message}`;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "❌ Network Error: Please check your internet connection and try again.";
        } else if (error.message.includes('storage') || error.message.includes('upload')) {
          errorMessage = `❌ Upload Error: ${error.message}`;
        } else {
          errorMessage = `❌ Error: ${error.message}`;
        }
      } else {
        errorMessage = "❌ An unexpected error occurred. Please try again or contact support if the problem persists.";
      }

      setSubmitError(errorMessage);

      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4 md:space-y-8"
          >
            {/* URL Input - FIRST */}
            <div className="relative" data-error={!!errors.websiteUrl}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl md:rounded-2xl blur-xl"></div>
              <div className={`relative bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border shadow-lg ${
                errors.websiteUrl ? 'border-red-300' : 'border-gray-100'
              }`}>
                <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">Project URL</h3>
                    <p className="text-sm md:text-base text-gray-600">We'll automatically fetch project details</p>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    id="websiteUrl"
                    {...register("websiteUrl")}
                    placeholder="your-awesome-project.com"
                    className="h-10 md:h-14 text-sm md:text-lg pl-3 md:pl-4 pr-10 md:pr-12 border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-purple-500 focus:ring-0 transition-all duration-200"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    onBlur={(e) => {
                      const url = e.target.value;
                      if (url) {
                        const normalizedUrl = normalizeUrl(url);
                        // Update the form field with normalized URL
                        if (normalizedUrl !== url) {
                          setValue('websiteUrl', normalizedUrl);
                        }
                        // Fetch metadata if URL is valid
                        if (normalizedUrl.startsWith('http')) {
                          fetchUrlMetadata(normalizedUrl);
                        }
                      }
                    }}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {isLoadingMetadata ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
                    ) : (
                      <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        watch('websiteUrl') && (watch('websiteUrl').startsWith('http') || normalizeUrl(watch('websiteUrl')).startsWith('http')) ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                </div>

                {errors.websiteUrl && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.websiteUrl.message}
                  </p>
                )}

                {isLoadingMetadata && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="animate-pulse w-8 h-8 bg-blue-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="animate-pulse h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
                        <div className="animate-pulse h-3 bg-blue-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <p className="text-blue-700 text-sm mt-2">🔍 Analyzing your website...</p>
                  </div>
                )}

                {/* Success State */}
                {urlMetadata && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200"
                  >
                    <div className="flex items-start space-x-4">
                      {urlMetadata.image && (
                        <img
                          src={urlMetadata.image}
                          alt="Project preview"
                          className="w-16 h-16 rounded-xl object-cover border-2 border-green-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-green-800">Metadata loaded!</h4>
                        </div>
                        <p className="text-green-700 text-sm mb-2">
                          {urlMetadata.title && `Found: ${urlMetadata.title.slice(0, 27)}${urlMetadata.title.length > 27 ? '... (trimmed to 27 chars)' : ''}`}
                        </p>
                        <p className="text-green-600 text-xs">
                          ✨ Auto-filled: Project Name & Short Description. You can edit everything below.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}


              </div>
            </div>

            {/* Project Name Input */}
            <div className="relative" data-error={!!errors.name}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl md:rounded-2xl blur-xl"></div>
              <div className={`relative bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border shadow-lg ${
                errors.name ? 'border-red-300' : 'border-gray-100'
              }`}>
                <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">Project Name</h3>
                    <p className="text-sm md:text-base text-gray-600">What's your project called?</p>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g. TaskFlow Pro, AI Assistant..."
                    className="h-10 md:h-14 text-sm md:text-lg pl-3 md:pl-4 pr-16 md:pr-20 border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200"
                    maxLength={27}
                    onChange={(e) => {
                      // Enforce 27 character limit
                      const value = e.target.value.slice(0, 27);
                      setValue("name", value);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                  />
                  <div className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <span className="text-xs text-gray-500">
                        {watch('name')?.length || 0}/27
                      </span>
                      <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        watch('name') && watch('name').length >= 3 ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    </div>
                  </div>
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Short Description Input */}
            <div className="relative" data-error={!!errors.tagline}>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 rounded-xl md:rounded-2xl blur-xl"></div>
              <div className={`relative bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border shadow-lg ${
                errors.tagline ? 'border-red-300' : 'border-gray-100'
              }`}>
                <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">Short Description</h3>
                    <p className="text-sm md:text-base text-gray-600">Brief tagline (max 160 chars)</p>
                  </div>
                </div>

                <div className="relative">
                  <Textarea
                    id="tagline"
                    {...register("tagline")}
                    placeholder="e.g. The ultimate productivity tool for modern teams..."
                    className="min-h-[60px] md:min-h-[80px] text-sm md:text-lg pl-3 md:pl-4 pr-16 md:pr-20 border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-emerald-500 focus:ring-0 transition-all duration-200 resize-none"
                    maxLength={160}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                      }
                    }}
                  />
                  <div className="absolute right-2 md:right-4 bottom-2 md:bottom-4">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <span className="text-xs text-gray-500">
                        {watch('tagline')?.length || 0}/160
                      </span>
                      <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        watch('tagline') && watch('tagline').length > 10 ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    </div>
                  </div>
                </div>
                {errors.tagline && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.tagline.message}
                  </p>
                )}
              </div>
            </div>

            {/* Full Description */}
            <div className="relative" data-error={!!errors.description}>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-xl md:rounded-2xl blur-xl"></div>
              <div className={`relative bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border shadow-lg ${
                errors.description ? 'border-red-300' : 'border-gray-100'
              }`}>
                <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">Full Description</h3>
                    <p className="text-sm md:text-base text-gray-600">Detailed description of your project</p>
                  </div>
                </div>

                <div className="relative">
                  <RichTextEditor
                    content={watch('description') || ''}
                    onChange={(content) => setValue('description', content)}
                    placeholder="Describe your project in detail. What does it do? What problem does it solve?"
                    className="text-sm md:text-lg"
                  />
                </div>

                {/* Character Counter */}
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center space-x-2">
                    {errors.description && (
                      <p className="text-sm text-red-500 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {(() => {
                      const description = watch('description') || '';
                      // Remove HTML tags for character count
                      const textOnly = description.replace(/<[^>]*>/g, '');
                      const charCount = textOnly.length;
                      const isLong = charCount > 500;
                      const isVeryLong = charCount > 1000;

                      return (
                        <span className={`${isVeryLong ? 'text-red-500' : isLong ? 'text-orange-500' : 'text-gray-500'}`}>
                          {charCount.toLocaleString()} characters
                          {isVeryLong && ' (very long)'}
                          {isLong && !isVeryLong && ' (long)'}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Category */}
              <div className="relative" data-error={!!errors.category}>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-2xl blur-xl"></div>
                <div className={`relative bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border shadow-lg min-h-[200px] md:min-h-[280px] flex flex-col ${
                  errors.category ? 'border-red-300' : 'border-gray-100'
                }`}>
                  <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900">Category</h3>
                      <p className="text-sm md:text-base text-gray-600">Choose the best fit</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <Select onValueChange={(value) => setValue("category", value)}>
                      <SelectTrigger className="h-10 md:h-12 text-sm md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-orange-500">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.category && (
                    <p className="text-sm text-red-500 mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="relative" data-error={tags.length === 0}>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 to-cyan-600/10 rounded-2xl blur-xl"></div>
                <div className={`relative bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border shadow-lg min-h-[200px] md:min-h-[280px] flex flex-col ${
                  tags.length === 0 ? 'border-red-300' : 'border-gray-100'
                }`}>
                  <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900">Tags</h3>
                        <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                          tags.length >= 8
                            ? 'bg-red-100 text-red-700'
                            : tags.length >= 6
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          {tags.length}/8
                        </span>
                      </div>
                      <p className="text-sm md:text-base text-gray-600">Add relevant keywords (max 8)</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex space-x-2 mb-3 md:mb-4">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tags (separate with commas)..."
                        className="flex-1 h-8 md:h-12 text-sm md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-teal-500 focus:ring-0"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addTag}
                        disabled={!newTag.trim() || tags.length >= 8}
                        className="h-12 px-6 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex-1 flex items-start">
                      {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2 max-w-full">
                          {tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-3 py-1 bg-teal-100 text-teal-800 hover:bg-teal-200 transition-colors flex-shrink-0 max-w-full"
                            >
                              <span className="truncate max-w-[120px]">{tag}</span>
                              <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="ml-2 text-teal-500 hover:text-teal-700 transition-colors flex-shrink-0"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">No tags added yet</div>
                      )}
                    </div>

                    {tags.length === 0 && (
                      <p className="text-sm text-red-500 mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        At least one tag is required
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Team Size & Founded Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Team Size */}
              <div className="relative" data-error={!!errors.teamSize}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-xl md:rounded-2xl blur-xl"></div>
                <div className={`relative bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border shadow-lg min-h-[200px] md:min-h-[280px] flex flex-col ${
                  errors.teamSize ? 'border-red-300' : 'border-gray-100'
                }`}>
                  <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900">Team Size</h3>
                      <p className="text-sm md:text-base text-gray-600">How many people work on this?</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <Select onValueChange={(value) => setValue("teamSize", value as any)} defaultValue="1">
                      <SelectTrigger className="h-10 md:h-12 text-sm md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-blue-500">
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 person (Solo)</SelectItem>
                        <SelectItem value="2">2 people</SelectItem>
                        <SelectItem value="3-5">3-5 people</SelectItem>
                        <SelectItem value="5-10">5-10 people</SelectItem>
                        <SelectItem value="10+">10+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.teamSize && (
                    <p className="text-sm text-red-500 mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.teamSize.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Founded Year */}
              <div className="relative" data-error={!!errors.foundedYear}>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-xl md:rounded-2xl blur-xl"></div>
                <div className={`relative bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border shadow-lg min-h-[200px] md:min-h-[280px] flex flex-col ${
                  errors.foundedYear ? 'border-red-300' : 'border-gray-100'
                }`}>
                  <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900">Founded Year</h3>
                      <p className="text-sm md:text-base text-gray-600">When was this project started?</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <Select onValueChange={(value) => setValue("foundedYear", parseInt(value))} defaultValue={new Date().getFullYear().toString()}>
                      <SelectTrigger className="h-10 md:h-12 text-sm md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-green-500">
                        <SelectValue placeholder="Select founded year" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {Array.from({ length: 31 }, (_, i) => 2030 - i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.foundedYear && (
                    <p className="text-sm text-red-500 mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.foundedYear.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Images Upload */}
            <div className="space-y-6">
              {/* Thumbnail Upload */}
              <div className="relative" data-error={!thumbnailFile && !(urlMetadata && urlMetadata.image)}>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-rose-600/10 rounded-2xl blur-xl"></div>
                <div className={`relative bg-white rounded-2xl p-8 border shadow-lg ${
                  !thumbnailFile && !(urlMetadata && urlMetadata.image) ? 'border-red-300' : 'border-gray-100'
                }`}>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Project Thumbnail
                        <span className="text-red-500 ml-1">*</span>
                      </h3>
                      <p className="text-gray-600">Main image for your project card (required)</p>
                    </div>
                  </div>

                  {/* Auto-detected thumbnail preview */}
                  {urlMetadata && urlMetadata.image && !thumbnailFile && (
                    <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-900">Thumbnail auto-detected!</h4>
                          <p className="text-sm text-green-700">Using image from website metadata</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-green-900 mb-1">Selected thumbnail</p>
                          <p className="text-xs text-green-600">This image will be used as your project thumbnail</p>
                        </div>
                        <div className="w-full">
                          <img
                            src={urlMetadata.image}
                            alt="Auto-detected thumbnail"
                            className="w-full h-auto max-h-64 object-contain rounded-lg border-2 border-green-300 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 text-center">You can upload a different image below if needed</p>
                      </div>
                    </div>
                  )}

                  {/* Drag & drop area - always show */}
                  <div className="space-y-2">
                    {urlMetadata && urlMetadata.image && !thumbnailFile && (
                      <p className="text-sm text-gray-600 text-center">
                        Or upload a different image:
                      </p>
                    )}
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        dragOver === 'thumbnail'
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
                      }`}
                      onDragOver={(e) => handleDragOver(e, 'thumbnail')}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'thumbnail')}
                    >
                      {thumbnailFile ? (
                        <div className="space-y-4">
                          <img
                            src={URL.createObjectURL(thumbnailFile)}
                            alt="Thumbnail preview"
                            className="w-32 h-32 object-cover rounded-xl mx-auto border-2 border-pink-200"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{thumbnailFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(thumbnailFile.size)}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Will be optimized before upload
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setThumbnailFile(null)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-pink-100 rounded-xl flex items-center justify-center mx-auto">
                            <Upload className="h-8 w-8 text-pink-600" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900">Upload thumbnail</p>
                            <p className="text-gray-600">Drag & drop or click to browse</p>
                            <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                            <p className="text-xs text-green-600 mt-1">Images will be automatically optimized</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'thumbnail');
                            }}
                            className="hidden"
                            id="thumbnail-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('thumbnail-upload')?.click()}
                            className="border-pink-300 text-pink-700 hover:bg-pink-50"
                          >
                            Choose File
                          </Button>
                        </div>
                      )}
                    </div>

                    {!thumbnailFile && !(urlMetadata && urlMetadata.image) && (
                      <p className="text-sm text-red-500 mt-4 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Thumbnail is required - either upload an image or wait for website metadata to load
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Gallery Upload */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-purple-600/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Gallery Images</h3>
                      <p className="text-gray-600">Additional screenshots (optional, up to 5)</p>
                    </div>
                  </div>

                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                      dragOver === 'gallery'
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50'
                    }`}
                    onDragOver={(e) => handleDragOver(e, 'gallery')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'gallery')}
                  >
                    {galleryFiles.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {galleryFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-violet-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        {galleryFiles.length < 5 && (
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                files.forEach(file => {
                                  if (galleryFiles.length < 5) {
                                    handleFileUpload(file, 'gallery');
                                  }
                                });
                              }}
                              className="hidden"
                              id="gallery-upload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('gallery-upload')?.click()}
                              className="border-violet-300 text-violet-700 hover:bg-violet-50"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add More ({galleryFiles.length}/5)
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-violet-100 rounded-xl flex items-center justify-center mx-auto">
                          <Upload className="h-8 w-8 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">Upload gallery images</p>
                          <p className="text-gray-600">Drag & drop or click to browse</p>
                          <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB each (max 5 images)</p>
                          <p className="text-xs text-green-600 mt-1">Images will be automatically optimized</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach(file => handleFileUpload(file, 'gallery'));
                          }}
                          className="hidden"
                          id="gallery-upload-initial"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('gallery-upload-initial')?.click()}
                          className="border-violet-300 text-violet-700 hover:bg-violet-50"
                        >
                          Choose Files
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        const formData = watch();
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Review & Submit
              </h3>
              <p className="text-gray-600">
                Review your project details and submit for approval
              </p>
            </div>

            {/* Realistic Project Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                  🎯 How your project will look on the website
                </h4>

                {/* Realistic Project Detail Page Preview */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 max-w-4xl mx-auto">
                  <div className="space-y-4">
                      {/* Project Header Card */}
                      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <div className="text-center space-y-4">
                          <div>
                            <h1 className="text-2xl font-bold mb-2 text-gray-900">
                              {formData.name || "Your Project Name"}
                            </h1>
                            <p className="text-lg text-gray-600 mb-3">
                              {formData.tagline || "Your project tagline will appear here"}
                            </p>

                            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                              <span className="flex items-center">
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Launched Today
                              </span>
                              <span className="flex items-center">
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                By You
                              </span>
                            </div>

                            <div className="flex items-center justify-center space-x-2">
                              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                                {formData.category || "Category"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Project Gallery Preview */}
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                          {thumbnailFile ? (
                            <img
                              src={URL.createObjectURL(thumbnailFile)}
                              alt="Project preview"
                              className="w-full h-full object-contain"
                            />
                          ) : (urlMetadata && urlMetadata.image) ? (
                            <img
                              src={urlMetadata.image}
                              alt="Project preview"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="text-center text-gray-500">
                              <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm">Your project screenshot will appear here</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Project Description Preview */}
                      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          About {formData.name || "Your Project"}
                        </h3>
                        <div className="prose prose-gray max-w-none">
                          <div className="html-content text-gray-600 leading-relaxed">
                            {formData.description ? (
                              <div dangerouslySetInnerHTML={{ __html: formData.description }} />
                            ) : (
                              <p className="text-gray-500 italic">Your detailed project description will appear here...</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tags Preview */}
                      <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {tags.length > 0 ? (
                            tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 italic text-sm">Your project tags will appear here...</span>
                          )}
                        </div>
                      </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    ✨ This is exactly how your project will appear to visitors on showyourproject.com
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-6">Submission Summary</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Project Info</h5>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li><strong>Name:</strong> {formData.name || "Not set"}</li>
                      <li><strong>URL:</strong> {formData.websiteUrl || "Not set"}</li>
                      <li><strong>Category:</strong> {formData.category || "Not set"}</li>
                      <li><strong>Tags:</strong> {tags.length > 0 ? tags.join(", ") : "None"}</li>
                      <li><strong>Team Size:</strong> {formData.teamSize || "Not set"}</li>
                      <li><strong>Founded:</strong> {formData.foundedYear || "Not set"}</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Content</h5>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li><strong>Tagline:</strong> {formData.tagline ? "✅ Set" : "❌ Missing"}</li>
                      <li><strong>Description:</strong> {formData.description ? "✅ Set" : "❌ Missing"}</li>
                      <li><strong>Thumbnail:</strong> {
                        thumbnailFile || (urlMetadata && urlMetadata.image)
                          ? "✅ Set"
                          : "❌ Missing"
                      }</li>
                      <li><strong>Metadata:</strong> {urlMetadata ? "✅ Loaded" : "❌ Not loaded"}</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-800 font-medium">Ready to submit!</p>
                  </div>
                  <p className="text-green-700 text-sm mt-2">
                    Your project will be reviewed within 24 hours and you'll receive an email notification.
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="text-center pb-6 md:pb-8 px-4 md:px-8">
          <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Submit Your Project
          </CardTitle>
          <CardDescription className="text-base md:text-lg text-gray-600 mt-2">
            Share your amazing project with the world
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="mt-6 md:mt-8">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs md:text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 md:w-16 h-1 mx-1 md:mx-2 rounded-full transition-all duration-300 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h4 className="text-base md:text-lg font-semibold text-gray-900">{steps[currentStep - 1].title}</h4>
              <p className="text-xs md:text-sm text-gray-600">{steps[currentStep - 1].description}</p>
            </div>
          </div>

          {/* Error Messages */}
          {submitError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Submission Error</h3>
                  <p className="text-sm text-red-700 mt-1">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Please fix the following issues:</h3>
                  <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error.split(': ')[1] || error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <div>
          <CardContent className="px-4 md:px-8 pb-6 md:pb-8">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 w-full sm:w-auto order-2 sm:order-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto order-1 sm:order-2"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit(
                    (data) => {
                      // Add tags to form data before validation
                      const dataWithTags = { ...data, tags };
                      console.log("Form data with tags:", dataWithTags);
                      onSubmit(dataWithTags);
                    },
                    (errors) => {
                      console.log("Form validation failed:", errors);
                      // Show specific error messages
                      const errorMessages = Object.entries(errors).map(([field, error]) => {
                        return `${field}: ${error?.message || 'Invalid'}`;
                      }).join('\n');
                      alert(`Please fix the following errors:\n\n${errorMessages}`);
                    }
                  )}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 w-full sm:w-auto order-1 sm:order-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Project</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
