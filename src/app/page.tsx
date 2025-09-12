"use client";

import { useEffect } from "react";
import { preloadCriticalData } from "@/lib/cache";
import { FeaturedProjects } from "@/components/homepage/FeaturedProjects";
import { NewProjects } from "@/components/homepage/NewProjects";
import { CategoriesGrid } from "@/components/homepage/CategoriesGrid";
import { motion } from "framer-motion";

// Optimized animation variants

export default function Home() {
  // Preload critical data on component mount
  useEffect(() => {
    preloadCriticalData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section - H1 must be first for SEO */}
      <section className="relative overflow-hidden bg-purple-50 py-12 sm:py-16">
        {/* Smooth transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-white"></div>

        <div className="container relative mx-auto px-4">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Promote <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">Your Website For Free</span>
              <br />
            </motion.h1>

            <motion.p
              className="mt-6 text-lg leading-8 text-gray-700 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Submit your website for free promotion on ShowYourProject.com. Get discovered by thousands of visitors
              and earn valuable backlinks to boost your SEO.
            </motion.p>


          </motion.div>
        </div>
      </section>

      {/* Featured Projects - Show examples right after CTA */}
      <FeaturedProjects />

      {/* New Projects */}
      <NewProjects />

      {/* Categories Grid with Popular Tags */}
      <CategoriesGrid />
    </div>
  );
}
