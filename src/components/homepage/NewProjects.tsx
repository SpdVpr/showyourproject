"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project/ProjectCard";
import { projectService } from "@/lib/firebaseServices";
import type { Project } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function NewProjects() {
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);
  const projectsPerPage = 16; // 4x4 grid

  // Load new projects from Firebase
  useEffect(() => {
    const loadNewProjects = async () => {
      try {
        setLoading(true);
        console.log("Loading new projects...");

        // Get new projects (now with caching)
        const newProjects = await projectService.getNewProjects();
        console.log("Loaded new projects:", newProjects);
        setProjects(newProjects);
      } catch (error) {
        console.error('Error loading new projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadNewProjects();
  }, []);

  // Force grid layout after component mounts
  useEffect(() => {
    const forceGridLayout = () => {
      const grids = document.querySelectorAll('.new-projects-grid');
      grids.forEach(grid => {
        const element = grid as HTMLElement;
        element.style.display = 'grid';
        element.style.gridTemplateColumns = window.innerWidth >= 1024 ? 'repeat(4, 1fr)' :
                                           window.innerWidth >= 768 ? 'repeat(3, 1fr)' :
                                           window.innerWidth >= 640 ? 'repeat(2, 1fr)' : '1fr';
        element.style.gap = '1.5rem';
        console.log('Forced grid layout:', element.style.gridTemplateColumns);
      });
    };

    // Force layout immediately and after a delay
    forceGridLayout();
    const timer = setTimeout(forceGridLayout, 100);

    // Also force on window resize
    window.addEventListener('resize', forceGridLayout);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', forceGridLayout);
    };
  }, [projects]);

  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const currentProjects = projects.slice(startIndex, startIndex + projectsPerPage);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <section className="py-12 bg-white relative">
      {/* Smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-white to-blue-50"></div>
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            🚀 New Projects
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Discover the latest websites and startups that have joined ShowYourProject.com
          </p>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No projects available yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Be the first to submit your project!</p>
          </div>
        ) : (
          /* Projects Grid - 4x4 */
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10"
            data-version="4-columns-final"
            key={`grid-${forceUpdate}`}
          >
            {currentProjects.map((project, index) => (
              <motion.div
                key={`${project.id}-${currentPage}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <ProjectCard project={project} layout="vertical" />
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-10 h-10"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
