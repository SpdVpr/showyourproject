"use client";

import { useState, useEffect } from "react";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Button } from "@/components/ui/button";
import { projectService } from "@/lib/firebaseServices";
import { Project } from "@/types";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function FeaturedProjects() {
  const [allFeaturedProjects, setAllFeaturedProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const PROJECTS_PER_PAGE = 3;
  const totalPages = Math.ceil(allFeaturedProjects.length / PROJECTS_PER_PAGE);
  const currentProjects = allFeaturedProjects.slice(
    currentPage * PROJECTS_PER_PAGE,
    (currentPage + 1) * PROJECTS_PER_PAGE
  );

  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        setLoading(true);
        console.log("Loading featured projects...");

        // Get all featured projects (sorted by purchase date)
        const projects = await projectService.getFeaturedProjects();
        console.log("Loaded featured projects:", projects);
        setAllFeaturedProjects(projects);
      } catch (error) {
        console.error('Error loading featured projects:', error);
        setAllFeaturedProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProjects();
  }, []);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <section className="py-12 bg-white relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            ✨ Featured Projects
          </h2>
        </motion.div>
        
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : allFeaturedProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No featured projects available at the moment</p>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 mb-8 ${
              currentProjects.length === 1
                ? 'grid-cols-1 max-w-sm mx-auto'
                : currentProjects.length === 2
                  ? 'grid-cols-1 lg:grid-cols-2 max-w-2xl mx-auto'
                  : 'grid-cols-1 lg:grid-cols-3'
            }`}>
              {currentProjects.map((project, index) => (
                <motion.div
                  key={`${project.id}-${currentPage}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ProjectCard project={project} featured layout="vertical" />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        index === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}
