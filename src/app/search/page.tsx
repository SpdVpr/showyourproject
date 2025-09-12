"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ProjectCard } from "@/components/project/ProjectCard";
import { mockCategories } from "@/lib/mockData";
import { projectService } from "@/lib/firebaseServices";
import { Project } from "@/types";
import { Search, Filter, X, Loader2 } from "lucide-react";

type SortOption = "relevance" | "newest" | "oldest" | "votes" | "views";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filters from URL parameters
  useEffect(() => {
    const tagsParam = searchParams.get("tags");
    const categoriesParam = searchParams.get("categories");

    if (tagsParam) {
      setSelectedTags(tagsParam.split(","));
    }
    if (categoriesParam) {
      setSelectedCategories(categoriesParam.split(","));
    }
  }, [searchParams]);

  // Load projects from Firebase
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all approved projects
        const allProjects = await projectService.getProjects(200);

        // Convert Firebase Timestamps to Date objects
        const convertedProjects = allProjects.map(project => ({
          ...project,
          createdAt: project.createdAt?.toDate?.() || new Date(project.createdAt || Date.now()),
          approvedAt: project.approvedAt?.toDate?.() || null,
          updatedAt: project.updatedAt?.toDate?.() || null,
          submittedAt: project.submittedAt?.toDate?.() || new Date(project.submittedAt || Date.now()),
          featuredPurchasedAt: project.featuredPurchasedAt?.toDate?.() || null,
          featuredUntil: project.featuredUntil?.toDate?.() || null,
        }));

        setProjects(convertedProjects);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Get all unique tags from projects
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(project => {
      project.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      // Text search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        project.name.toLowerCase().includes(searchLower) ||
        project.tagline.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.tags?.some(tag => tag.toLowerCase().includes(searchLower));

      // Category filter
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(project.category);

      // Tag filter
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => project.tags?.includes(tag));

      return matchesSearch && matchesCategory && matchesTags;
    });

    // Sort results
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => {
          const aDate = a.createdAt || a.submittedAt || new Date(0);
          const bDate = b.createdAt || b.submittedAt || new Date(0);
          return bDate.getTime() - aDate.getTime();
        });
        break;
      case "oldest":
        filtered.sort((a, b) => {
          const aDate = a.createdAt || a.submittedAt || new Date(0);
          const bDate = b.createdAt || b.submittedAt || new Date(0);
          return aDate.getTime() - bDate.getTime();
        });
        break;
      case "votes":
        filtered.sort((a, b) => b.voteCount - a.voteCount);
        break;
      case "views":
        filtered.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case "relevance":
      default:
        // For relevance, prioritize exact matches in name/tagline
        filtered.sort((a, b) => {
          const searchLower = searchQuery.toLowerCase();
          const aNameMatch = a.name.toLowerCase().includes(searchLower);
          const bNameMatch = b.name.toLowerCase().includes(searchLower);
          const aTaglineMatch = a.tagline.toLowerCase().includes(searchLower);
          const bTaglineMatch = b.tagline.toLowerCase().includes(searchLower);
          
          if (aNameMatch && !bNameMatch) return -1;
          if (!aNameMatch && bNameMatch) return 1;
          if (aTaglineMatch && !bTaglineMatch) return -1;
          if (!aTaglineMatch && bTaglineMatch) return 1;
          
          return b.voteCount - a.voteCount;
        });
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategories, selectedTags, sortBy, projects]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    }
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags(prev => [...prev, tag]);
    } else {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setSortBy("relevance");
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0 || sortBy !== "relevance";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Projects</h1>
        <p className="text-muted-foreground">
          Discover amazing projects from our community
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, technologies, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 text-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </CardTitle>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sort Options */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Sort by</Label>
                <div className="space-y-2">
                  {[
                    { value: "relevance", label: "Relevance" },
                    { value: "newest", label: "Newest" },
                    { value: "oldest", label: "Oldest" },
                    { value: "votes", label: "Most Voted" },
                    { value: "views", label: "Most Viewed" },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sort-${option.value}`}
                        checked={sortBy === option.value}
                        onCheckedChange={() => setSortBy(option.value as SortOption)}
                      />
                      <Label htmlFor={`sort-${option.value}`} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Categories</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mockCategories.map((category) => (
                    <div key={category.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.name}`}
                        checked={selectedCategories.includes(category.name)}
                        onCheckedChange={(checked) => 
                          handleCategoryChange(category.name, checked as boolean)
                        }
                      />
                      <Label htmlFor={`category-${category.name}`} className="text-sm">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Tags</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {allTags.slice(0, 20).map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={(checked) => 
                          handleTagChange(tag, checked as boolean)
                        }
                      />
                      <Label htmlFor={`tag-${tag}`} className="text-sm">
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
              </h2>
              {searchQuery && (
                <p className="text-muted-foreground">
                  Results for "{searchQuery}"
                </p>
              )}
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="flex items-center space-x-1">
                    <span>{category}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleCategoryChange(category, false)}
                    />
                  </Badge>
                ))}
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleTagChange(tag, false)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Results Grid */}
          {loading ? (
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold mb-2">Loading projects...</h3>
                <p className="text-muted-foreground">
                  Please wait while we fetch the latest projects
                </p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold mb-2">Error loading projects</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try again
                </Button>
              </CardContent>
            </Card>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  layout="vertical"
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-4">
                  {projects.length === 0
                    ? "No projects available yet"
                    : "Try adjusting your search terms or filters"
                  }
                </p>
                {projects.length > 0 && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear all filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
