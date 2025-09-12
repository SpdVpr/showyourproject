"use client";

import { useState, useEffect } from "react";
import { CategoryCard } from "./CategoryCard";
import { ClickableTag } from "@/components/project/ClickableTag";
import { mockCategories } from "@/lib/mockData";
import { projectService } from "@/lib/firebaseServices";
import { Project, Category } from "@/types";
import { motion } from "framer-motion";
import { Hash, TrendingUp } from "lucide-react";

export function CategoriesGrid() {
  const [popularTags, setPopularTags] = useState<{ tag: string; count: number }[]>([]);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get all projects
        const projects = await projectService.getProjects(200);

        if (!projects || !Array.isArray(projects)) {
          console.warn('No projects data received, using mock categories');
          setCategories(mockCategories);
          return;
        }

        // Count tag occurrences
        const tagCounts: { [key: string]: number } = {};
        projects.forEach((project: Project) => {
          project.tags?.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        // Sort by count and get top 8 (smaller number for compact display)
        const sortedTags = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        setPopularTags(sortedTags);

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
        console.error('Error loading data:', error);
        // Fallback to mock categories on error
        setCategories(mockCategories);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <section className="py-12 bg-blue-50 relative">
      {/* Smooth transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-blue-50 to-transparent"></div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            🎯 Browse by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Find projects in your area of interest and discover new innovative solutions on ShowYourProject.com
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <CategoryCard category={category} />
            </motion.div>
          ))}
        </div>

        {/* Popular Tags Section */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-blue-100 p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Popular Technologies</h3>
          </div>

          {loading ? (
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {popularTags.map(({ tag, count }, index) => (
                <div key={tag} className="relative group">
                  <ClickableTag
                    tag={tag}
                    index={index}
                    size="sm"
                    className="text-xs px-3 py-1.5 font-medium shadow-sm hover:shadow-md"
                  />
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Click any tag to explore related projects
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
