"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { projectService } from "@/lib/firebaseServices";
import { Project } from "@/types";

export function TagSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Load all tags when component mounts
  useEffect(() => {
    const loadTags = async () => {
      try {
        setLoading(true);
        const projects = await projectService.getProjects(200);
        
        const tags = new Set<string>();
        projects.forEach((project: Project) => {
          project.tags?.forEach(tag => tags.add(tag));
        });
        
        const sortedTags = Array.from(tags).sort();
        setAllTags(sortedTags);
        setFilteredTags(sortedTags.slice(0, 10)); // Show first 10 initially
      } catch (error) {
        console.error('Error loading tags:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && allTags.length === 0) {
      loadTags();
    }
  }, [isOpen, allTags.length]);

  // Filter tags based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTags(allTags.slice(0, 10));
    } else {
      const filtered = allTags
        .filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 10);
      setFilteredTags(filtered);
    }
  }, [searchTerm, allTags]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTagClick = (tag: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('tags', tag);
    router.push(`/search?${searchParams.toString()}`);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search Tags</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tags or projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Popular Tags</div>
              
              {loading ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {filteredTags.map((tag, index) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      onClick={() => handleTagClick(tag)}
                      className={`
                        cursor-pointer transition-all duration-200 hover:scale-105 text-xs px-3 py-1 rounded-full
                        ${index % 4 === 0 ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' : ''}
                        ${index % 4 === 1 ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : ''}
                        ${index % 4 === 2 ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' : ''}
                        ${index % 4 === 3 ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' : ''}
                      `}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {filteredTags.length === 0 && searchTerm && !loading && (
                <div className="text-sm text-gray-500 text-center py-4">
                  No tags found for "{searchTerm}"
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  router.push('/search');
                  setIsOpen(false);
                }}
                className="w-full text-sm"
              >
                Advanced Search
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
