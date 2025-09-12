"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { projectService, pointsService } from "@/lib/firebaseServices";
import { useAuth } from "@/components/auth/AuthProvider";
import { POINTS_CONFIG } from "@/types";
import { trackProjectVisit } from "@/lib/analytics";
import Link from "next/link";

interface ProjectVisitButtonProps {
  projectId: string;
  projectName: string;
  websiteUrl: string;
  className?: string;
  size?: "default" | "sm" | "lg";
}

export function ProjectVisitButton({
  projectId,
  projectName,
  websiteUrl,
  className,
  size = "lg"
}: ProjectVisitButtonProps) {
  const { user, refreshUser } = useAuth();

  const handleVisit = async () => {
    try {
      // Increment click count in Firebase
      await projectService.incrementClickCount(projectId);

      // Award points to user if logged in
      if (user) {
        try {
          await pointsService.awardPoints(user.id, 'click', projectId, POINTS_CONFIG.CLICK_PROJECT);
          console.log(`Awarded ${POINTS_CONFIG.CLICK_PROJECT} points to user for clicking project`);
          // Refresh user data immediately to show updated points
          refreshUser();
        } catch (error) {
          console.error('Error awarding click points:', error);
          // Don't block the visit if points fail
        }
      }

      // Track in analytics
      trackProjectVisit(projectId, projectName);

      console.log(`Tracked click for project: ${projectName}`);
    } catch (error) {
      console.error('Error tracking project click:', error);
    }
  };

  return (
    <Button
      className={`${className} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0`}
      size={size}
      asChild
      onClick={handleVisit}
    >
      <Link
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3"
      >
        <ExternalLink className="h-5 w-5" />
        <span>Visit Website</span>
      </Link>
    </Button>
  );
}
