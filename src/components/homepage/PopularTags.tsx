"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClickableTag } from "@/components/project/ClickableTag";
import { projectService } from "@/lib/firebaseServices";
import { Project } from "@/types";
import { Hash, TrendingUp } from "lucide-react";

export function PopularTags() {
  const [popularTags, setPopularTags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPopularTags = async () => {
      try {
        setLoading(true);
        
        // Get all projects
        const projects = await projectService.getProjects(200);
        
        // Count tag occurrences
        const tagCounts: { [key: string]: number } = {};
        projects.forEach((project: Project) => {
          project.tags?.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        // Sort by count and get top 12
        const sortedTags = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 12);

        setPopularTags(sortedTags);
      } catch (error) {
        console.error('Error loading popular tags:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPopularTags();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Tags</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover projects by popular technologies and topics
            </p>
          </div>
          
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="flex flex-wrap gap-3 justify-center">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (popularTags.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Popular Tags</h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover projects by popular technologies and topics. Click any tag to explore related projects.
          </p>
        </div>
        
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center text-lg font-semibold text-gray-800">
              <Hash className="h-5 w-5 text-blue-500 mr-2" />
              Trending Technologies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {popularTags.map(({ tag, count }, index) => (
                <div key={tag} className="relative group">
                  <ClickableTag
                    tag={tag}
                    index={index}
                    size="sm"
                    className="text-xs px-3 py-1.5 font-medium shadow-sm hover:shadow-md"
                  />
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {count}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                Hover over tags to see project count • Click to explore projects
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
