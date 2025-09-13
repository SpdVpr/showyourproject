"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  Calendar,
  User,
  Globe,
  MessageSquare,
  Eye,
  Edit,
  Star,
  Trash2,
  Share2,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types";
import { projectService, adminService } from "@/lib/firebaseServices";
import { invalidateCache } from "@/lib/cache";
import { ProjectImageEditor } from "./ProjectImageEditor";

interface AdminProjectReviewProps {
  projects: Project[];
  onProjectUpdate?: () => void; // Callback to refresh projects list
  isApprovedView?: boolean; // Whether this is showing approved projects
}

export function AdminProjectReview({ projects, onProjectUpdate, isApprovedView = false }: AdminProjectReviewProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Partial<Project>>({});
  const [isTogglingFeatured, setIsTogglingFeatured] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingImages, setIsEditingImages] = useState(false);


  // Helper function to format dates
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";

    // Handle Firestore Timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }

    // Handle regular Date
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }

    // Handle string dates
    return new Date(timestamp).toLocaleDateString();
  };

  const handleApprove = async (project: Project) => {
    setIsProcessing(true);

    try {
      console.log("Approving project:", project.id, "Notes:", reviewNotes);

      // Use real Firebase service to approve project
      await projectService.approveProject(project.id, reviewNotes);

      alert(`Project "${project.name}" has been approved!`);

      // Invalidate cache on client-side to ensure fresh data
      invalidateCache('projects');
      invalidateCache('new_projects');
      invalidateCache('pending');
      invalidateCache('featured');

      // Reset form and refresh projects list
      setSelectedProject(null);
      setReviewNotes("");

      // Trigger parent component to refresh projects
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      console.error("Error approving project:", error);
      alert("Failed to approve project. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (project: Project) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Rejecting project:", project.id, "Reason:", rejectionReason);

      // Use real Firebase service to reject project
      await projectService.rejectProject(project.id, rejectionReason);

      alert(`Project "${project.name}" has been rejected.`);

      // Reset form and refresh projects list
      setSelectedProject(null);
      setRejectionReason("");
      setReviewNotes("");

      // Trigger parent component to refresh projects
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      console.error("Error rejecting project:", error);
      alert("Failed to reject project. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);

    try {
      console.log("Deleting project:", project.id);

      // Use Firebase service to delete project
      await projectService.deleteProject(project.id);

      alert(`Project "${project.name}" has been permanently deleted.`);

      // Invalidate cache on client-side to ensure fresh data
      invalidateCache('projects');
      invalidateCache('new_projects');
      invalidateCache('pending');
      invalidateCache('featured');

      // Reset form and refresh projects list
      setSelectedProject(null);
      setShowDeleteConfirm(false);
      setReviewNotes("");
      setRejectionReason("");

      // Trigger parent component to refresh projects
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setEditedProject({
      name: project.name,
      tagline: project.tagline,
      description: project.description,
      category: project.category,
      featured: project.featured || false,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedProject || !editedProject) return;

    setIsProcessing(true);

    try {
      console.log("Updating project:", selectedProject.id, "Changes:", editedProject);

      // Use real Firebase service to update project
      await projectService.updateProject(selectedProject.id, editedProject);

      alert(`Project "${selectedProject.name}" has been updated!`);

      // Reset form and refresh projects list
      setSelectedProject(null);
      setEditedProject({});
      setIsEditing(false);

      // Trigger parent component to refresh projects
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveImages = async (imageUpdates: Partial<Project>) => {
    if (!selectedProject) return;

    setIsProcessing(true);

    try {
      console.log("Updating project images:", selectedProject.id, "Changes:", imageUpdates);

      // Use real Firebase service to update project images
      await projectService.updateProject(selectedProject.id, imageUpdates);

      alert(`Images for "${selectedProject.name}" have been updated!`);

      // Reset form and refresh projects list
      setSelectedProject(null);
      setIsEditingImages(false);

      // Trigger parent component to refresh projects
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      console.error("Error updating project images:", error);
      alert("Failed to update project images. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };



  const handleToggleFeatured = async (project: Project) => {
    setIsProcessing(true);

    try {
      const newFeaturedStatus = !project.featured;
      console.log("Toggling featured status:", project.id, "to", newFeaturedStatus);

      await projectService.updateProject(project.id, { featured: newFeaturedStatus });

      alert(`Project "${project.name}" ${newFeaturedStatus ? 'added to' : 'removed from'} featured!`);

      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      console.error("Error toggling featured status:", error);
      alert("Failed to update featured status. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Review Queue</CardTitle>
          <CardDescription>
            Review and approve submitted projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              No projects pending review at this time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project Review Queue</span>
            <Badge variant="destructive">{projects.length} pending</Badge>
          </CardTitle>
          <CardDescription>
            Review and approve submitted projects. Click on a project to view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedProject?.id === project.id
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex items-start space-x-4">
                  <Image
                    src={project.logoUrl || '/placeholder-logo.png'}
                    alt={`${project.name} logo`}
                    width={48}
                    height={48}
                    className="rounded-lg border"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <Badge variant="secondary">{project.category}</Badge>
                      {project.autoApproved && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Auto-Approved
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-2">
                      {project.tagline}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {project.submitterName}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(project.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        {new URL(project.websiteUrl).hostname}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(project.websiteUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Detail Review */}
      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle>Review: {selectedProject.name}</CardTitle>
            <CardDescription>
              Detailed review and approval process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Project Information</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm">{selectedProject.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Tagline</Label>
                    <p className="text-sm">{selectedProject.tagline}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.description}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Badge variant="outline">{selectedProject.category}</Badge>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProject.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Website</Label>
                    <Link 
                      href={selectedProject.websiteUrl} 
                      target="_blank"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      {selectedProject.websiteUrl}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Visual Assets</h4>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Screenshot</Label>
                    <div className="mt-2 relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <Image
                        src={selectedProject.screenshotUrl || '/placeholder-screenshot.png'}
                        alt={`${selectedProject.name} screenshot`}
                        width={400}
                        height={300}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Logo</Label>
                    <div className="mt-2">
                      <Image
                        src={selectedProject.logoUrl || '/placeholder-logo.png'}
                        alt={`${selectedProject.name} logo`}
                        width={80}
                        height={80}
                        className="rounded-lg border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Actions */}
            <div className="border-t pt-6">
              <h4 className="font-semibold mb-4">Review Actions</h4>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reviewNotes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="reviewNotes"
                    placeholder="Add any notes about this project review..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason (Required for rejection)</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Explain why this project is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex space-x-3">
                  {isApprovedView ? (
                    // Approved projects - Edit and Featured toggle
                    <>
                      <Button
                        onClick={() => handleEdit(selectedProject)}
                        disabled={isProcessing}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Project
                      </Button>

                      <Button
                        onClick={() => setIsEditingImages(true)}
                        disabled={isProcessing}
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Edit Images
                      </Button>

                      <Button
                        onClick={() => handleToggleFeatured(selectedProject)}
                        disabled={isProcessing}
                        variant={selectedProject.featured ? "destructive" : "default"}
                        className={selectedProject.featured ? "" : "bg-yellow-600 hover:bg-yellow-700"}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        {isProcessing ? "Updating..." : selectedProject.featured ? "Remove Featured" : "Make Featured"}
                      </Button>



                      <Button
                        onClick={() => handleDelete(selectedProject)}
                        disabled={isDeleting}
                        variant={showDeleteConfirm ? "destructive" : "outline"}
                        className={showDeleteConfirm ? "bg-red-600 hover:bg-red-700" : "border-red-300 text-red-600 hover:bg-red-50"}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting ? "Deleting..." : showDeleteConfirm ? "Confirm Delete" : "Delete Project"}
                      </Button>
                    </>
                  ) : (
                    // Pending projects - Approve and Reject
                    <>
                      <Button
                        onClick={() => handleApprove(selectedProject)}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {isProcessing ? "Approving..." : "Approve Project"}
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => handleReject(selectedProject)}
                        disabled={isProcessing || !rejectionReason.trim()}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {isProcessing ? "Rejecting..." : "Reject Project"}
                      </Button>



                      <Button
                        onClick={() => handleDelete(selectedProject)}
                        disabled={isDeleting}
                        variant={showDeleteConfirm ? "destructive" : "outline"}
                        className={showDeleteConfirm ? "bg-red-600 hover:bg-red-700" : "border-red-300 text-red-600 hover:bg-red-50"}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting ? "Deleting..." : showDeleteConfirm ? "Confirm Delete" : "Delete Project"}
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProject(null);
                      setReviewNotes("");
                      setRejectionReason("");
                      setIsEditing(false);
                      setEditedProject({});
                      setShowDeleteConfirm(false);
                      setIsEditingImages(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>


              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Project Dialog */}
      {isEditing && selectedProject && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Edit Project: {selectedProject.name}</CardTitle>
            <CardDescription>
              Update project details and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Project Name</Label>
                <Input
                  id="edit-name"
                  value={editedProject.name || ''}
                  onChange={(e) => {
                    // Enforce 27 character limit
                    const value = e.target.value.slice(0, 27);
                    setEditedProject(prev => ({ ...prev, name: value }));
                  }}
                  placeholder="Enter project name"
                  maxLength={27}
                />
              </div>

              <div>
                <Label htmlFor="edit-tagline">Tagline</Label>
                <Input
                  id="edit-tagline"
                  value={editedProject.tagline || ''}
                  onChange={(e) => setEditedProject(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Enter project tagline"
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editedProject.description || ''}
                  onChange={(e) => setEditedProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter project description"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editedProject.category || ''}
                  onChange={(e) => setEditedProject(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Enter project category"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-featured"
                  checked={editedProject.featured || false}
                  onChange={(e) => setEditedProject(prev => ({ ...prev, featured: e.target.checked }))}
                />
                <Label htmlFor="edit-featured">Featured Project</Label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSaveEdit}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? "Saving..." : "Save Changes"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedProject({});
                    setSelectedProject(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Editor Dialog */}
      {isEditingImages && selectedProject && (
        <ProjectImageEditor
          project={selectedProject}
          onSave={handleSaveImages}
          onCancel={() => {
            setIsEditingImages(false);
            setSelectedProject(null);
          }}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
