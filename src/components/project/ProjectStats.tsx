"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MousePointer, Heart, TrendingUp, Calendar, Trophy } from "lucide-react";
import { projectService } from "@/lib/firebaseServices";
import type { Project } from "@/types";

interface ProjectStatsProps {
  project: Project;
}

interface ProjectRanking {
  categoryRank: number;
  totalInCategory: number;
  overallRank: number;
  totalProjects: number;
}

export function ProjectStats({ project }: ProjectStatsProps) {
  const [ranking, setRanking] = useState<ProjectRanking | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate click-through rate
  const clickThroughRate = project.viewCount > 0
    ? ((project.clickCount / project.viewCount) * 100).toFixed(1)
    : "0.0";

  // Calculate days since launch
  const daysSinceLaunch = project.createdAt
    ? Math.floor((Date.now() - (project.createdAt.toDate?.() || new Date(project.createdAt)).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Load ranking data
  useEffect(() => {
    const loadRanking = async () => {
      try {
        setLoading(true);

        // Use the new ranking service
        const rankingData = await projectService.getProjectRanking(project.id, project.category);
        setRanking(rankingData);

      } catch (error) {
        console.error('Error loading project ranking:', error);
        // Set default values on error
        setRanking({
          categoryRank: 0,
          totalInCategory: 0,
          overallRank: 0,
          totalProjects: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, [project.id, project.category]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Project Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {project.viewCount.toLocaleString()}
            </div>
            <div className="text-xs text-blue-700">Views</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <MousePointer className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">
              {project.clickCount.toLocaleString()}
            </div>
            <div className="text-xs text-green-700">Clicks</div>
          </div>

          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-900">
              {project.voteCount.toLocaleString()}
            </div>
            <div className="text-xs text-red-700">Votes</div>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {clickThroughRate}%
            </div>
            <div className="text-xs text-purple-700">CTR</div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rank in category:</span>
              <span className="font-medium">
                {loading ? "Loading..." : ranking?.categoryRank ? `#${ranking.categoryRank} of ${ranking.totalInCategory}` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overall rank:</span>
              <span className="font-medium">
                {loading ? "Loading..." : ranking?.overallRank ? `#${ranking.overallRank} of ${ranking.totalProjects}` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Days since launch:</span>
              <span className="font-medium">{daysSinceLaunch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-medium ${project.status === 'approved' ? 'text-green-600' : project.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                {project.status === 'approved' ? 'Live' : project.status === 'pending' ? 'Under Review' : 'Rejected'}
              </span>
            </div>
            {project.featured && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Featured:</span>
                <span className="font-medium text-yellow-600 flex items-center">
                  <Trophy className="h-3 w-3 mr-1" />
                  Yes
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
