"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";
import { Eye, ExternalLink, Heart, Star, Share2 } from "lucide-react";
import { projectService, pointsService, voteService } from "@/lib/firebaseServices";
import { useAuth } from "@/components/auth/AuthProvider";
import { ClickableTag } from "@/components/project/ClickableTag";
import { SocialShareButton } from "@/components/project/SocialShareButton";
import { POINTS_CONFIG } from "@/types";
import { trackProjectVisit } from "@/lib/analytics";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export function ProjectCard({ project, featured = false, layout = 'horizontal' }: ProjectCardProps) {
  const { user, refreshUser } = useAuth();
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(project.voteCount);
  const [loading, setLoading] = useState(false);

  // Generate SEO-friendly URL
  const projectUrl = project.shortId
    ? `/project/${projectService.generateSlug(project.name, project.shortId)}`
    : `/project/${project.id}`;

  // Load user's vote status when component mounts
  useEffect(() => {
    const loadVoteStatus = async () => {
      if (user && project.id) {
        try {
          const voted = await voteService.hasUserVoted(project.id, user.id);
          setHasVoted(voted);
        } catch (error) {
          console.error('Error loading vote status:', error);
        }
      }
    };

    loadVoteStatus();
  }, [user, project.id]);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please log in to vote for projects');
      return;
    }

    if (loading) return; // Prevent double clicks

    setLoading(true);
    try {
      // Toggle vote in Firebase
      const isNowVoted = await voteService.voteForProject(project.id, user.id);

      // Update local state
      setHasVoted(isNowVoted);
      setVoteCount(prev => isNowVoted ? prev + 1 : prev - 1);

      // Award points only when adding a vote (not removing)
      if (isNowVoted) {
        try {
          await pointsService.awardPoints(user.id, 'like', project.id, POINTS_CONFIG.LIKE_PROJECT);
          console.log(`Awarded ${POINTS_CONFIG.LIKE_PROJECT} points to user for liking project`);
          // Refresh user data immediately to show updated points
          refreshUser();
        } catch (error) {
          console.error('Error awarding like points:', error);
          // Don't block the vote if points fail
        }
      }
    } catch (error) {
      console.error('Error voting for project:', error);
      alert('Failed to vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVisit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Track click in Firebase and analytics
      await projectService.incrementClickCount(project.id);
      trackProjectVisit(project.id, project.name);
    } catch (error) {
      console.error('Error tracking project visit:', error);
    }

    window.open(project.websiteUrl, '_blank');
  };

  if (layout === 'vertical') {
    return (
      <Link href={projectUrl} className="block">
        <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${
          featured
            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-md'
            : 'bg-white hover:bg-gray-50 border-gray-200 shadow-sm hover:shadow-md'
        } hover:scale-[1.01] hover:-translate-y-1`}>
        {featured && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center z-10 shadow-lg">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Featured
          </div>
        )}

        {/* Category Badge */}
        <div className={`absolute ${featured ? 'top-12' : 'top-3'} right-3 z-10`}>
          <Badge variant="secondary" className="text-xs font-medium bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
            {project.category}
          </Badge>
        </div>

        {/* Main Thumbnail Image - Full Width Cover */}
        <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={project.logoUrl || '/placeholder-screenshot.png'}
            alt={`${project.name} screenshot`}
            fill
            className="object-cover object-top transition-all duration-500 group-hover:scale-105"
            style={{ objectPosition: 'top center' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <CardContent className="p-6">
          {/* Minimalist content - just title and description */}
          <div className="text-center space-y-3">
            <h3 className="font-bold text-xl text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
              {project.name}
            </h3>

            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {project.tagline}
            </p>

            {/* Project Stats */}
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 pt-2">
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{project.voteCount || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{project.viewCount || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </Link>
    );
  }

  // Horizontal layout (original)
  return (
    <Link href={projectUrl} className="block">
      <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${
        featured ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white' : ''
      }`}>
      {featured && (
        <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
          <Star className="h-3 w-3 mr-1" />
          Featured
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative flex-shrink-0 bg-gray-50 rounded-lg border flex items-center justify-center" style={{width: 64, height: 64}}>
            <Image
              src={project.logoUrl || '/placeholder-logo.png'}
              alt={`${project.name} logo`}
              width={64}
              height={64}
              className="rounded-lg object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {project.name}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {project.category}
              </Badge>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {project.tagline}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {(project.voteCount || 0).toLocaleString()}
                </span>
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {(project.viewCount || 0).toLocaleString()}
                </span>
                <span className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  {(project.clickCount || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={hasVoted ? "default" : "outline"}
                  size="sm"
                  onClick={handleVote}
                  disabled={loading}
                  className={`h-9 px-3 rounded-full font-medium transition-all duration-200 hover:scale-105 ${
                    hasVoted
                      ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-md"
                      : "bg-white hover:bg-red-50 hover:text-red-600 border-red-200 hover:border-red-300"
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-1 ${hasVoted ? 'fill-current' : ''}`} />
                  {voteCount}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVisit}
                  className="h-9 px-3 rounded-full font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Visit
                </Button>

                <div onClick={(e) => e.preventDefault()}>
                  <SocialShareButton
                    projectId={project.id}
                    projectName={project.name}
                    projectUrl={`${process.env.NODE_ENV === 'production' ? 'https://showyourproject.com' : 'http://localhost:3001'}${projectUrl}`}
                    projectDescription={project.tagline}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag, index) => (
            <ClickableTag
              key={tag}
              tag={tag}
              index={index}
              size="sm"
            />
          ))}
          {project.tags.length > 3 && (
            <Badge variant="outline" className="text-xs px-3 py-1 rounded-full bg-gray-50 border-gray-200 text-gray-600 font-medium">
              +{project.tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
