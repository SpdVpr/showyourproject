"use client";

import { useEffect } from "react";
import { projectService } from "@/lib/firebaseServices";
import { trackProjectView } from "@/lib/analytics";

interface ProjectViewTrackerProps {
  projectId: string;
  projectName: string;
}

export function ProjectViewTracker({ projectId, projectName }: ProjectViewTrackerProps) {
  useEffect(() => {
    // Track view only once when component mounts
    const trackView = async () => {
      try {
        // Increment view count in Firebase
        await projectService.incrementViewCount(projectId);
        
        // Track in analytics
        trackProjectView(projectId, projectName);
        
        console.log(`Tracked view for project: ${projectName}`);
      } catch (error) {
        console.error('Error tracking project view:', error);
      }
    };

    // Add a small delay to avoid tracking bots/crawlers
    const timer = setTimeout(trackView, 1000);
    
    return () => clearTimeout(timer);
  }, [projectId, projectName]);

  // This component doesn't render anything
  return null;
}
