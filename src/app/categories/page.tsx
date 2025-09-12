"use client";

import { useState, useEffect } from "react";
import { CategoryCard } from "@/components/homepage/CategoryCard";
import { mockCategories } from "@/lib/mockData";
import { projectService } from "@/lib/firebaseServices";
import { Project, Category } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryCounts = async () => {
      try {
        setLoading(true);

        // Get all approved projects
        const projects = await projectService.getProjects(200);

        if (!projects || !Array.isArray(projects)) {
          console.warn('No projects data received, using mock categories');
          setCategories(mockCategories);
          return;
        }

        // Count projects by category
        const categoryCounts: { [key: string]: number } = {};
        projects.forEach((project: Project) => {
          if (project.status === 'approved') {
            categoryCounts[project.category] = (categoryCounts[project.category] || 0) + 1;
          }
        });

        // Update categories with real counts
        const updatedCategories = mockCategories.map(category => ({
          ...category,
          projectCount: categoryCounts[category.name] || 0
        }));

        setCategories(updatedCategories);
      } catch (error) {
        console.error('Error loading category counts:', error);
        // Fallback to mock categories on error
        setCategories(mockCategories);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryCounts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">All Categories</h1>
        <p className="text-muted-foreground">
          Explore projects organized by category on ShowYourProject.com to find exactly what you're looking for
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading category counts...</p>
        </div>
      )}
    </div>
  );
}
