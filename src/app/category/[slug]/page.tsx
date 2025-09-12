import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Globe, Smartphone, Brain, Code, ShoppingCart, Zap, Palette, DollarSign, LucideIcon } from "lucide-react";
import { projectService } from "@/lib/firebaseServices";
import { mockCategories } from "@/lib/mockData";
import { serializeProjects } from "@/lib/utils/serialization";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Globe,
  Smartphone,
  Brain,
  Code,
  ShoppingCart,
  Zap,
  Palette,
  DollarSign,
};

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Find category by slug
  const category = mockCategories.find(cat => cat.slug === slug);

  if (!category) {
    notFound();
  }

  // Get icon component
  const IconComponent = iconMap[category.icon] || Globe;

  // Get projects for this category
  let projects = [];
  try {
    // Use the dedicated getProjectsByCategory method
    const rawProjects = await projectService.getProjectsByCategory(category.name);

    // Convert Firebase Timestamps to plain objects for Client Components
    projects = serializeProjects(rawProjects);
  } catch (error) {
    console.error('Error loading category projects:', error);
    // Fallback: Get all projects and filter by category name
    try {
      const allProjects = await projectService.getProjects(100);
      const filteredProjects = allProjects.filter(project =>
        project.category === category.name ||
        project.category.toLowerCase() === category.name.toLowerCase()
      );

      // Convert Firebase Timestamps for fallback projects too
      projects = serializeProjects(filteredProjects);
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      projects = [];
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Category Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-16 h-16 rounded-xl bg-${category.color}-100 flex items-center justify-center mr-4`}>
              <IconComponent className={`h-8 w-8 text-${category.color}-600`} />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {category.name}
              </h1>
              <Badge variant="secondary" className="text-sm">
                {projects.length} projects
              </Badge>
            </div>
          </div>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {category.description}
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                layout="vertical"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 mb-6">
              There are no projects in the {category.name} category yet.
            </p>
            <Button asChild>
              <Link href="/submit">
                Submit the first {category.name} project
              </Link>
            </Button>
          </div>
        )}

        {/* Related Categories */}
        {projects.length > 0 && (
          <div className="mt-16 pt-16 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-center mb-8">
              Explore Other Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockCategories
                .filter(cat => cat.slug !== slug)
                .slice(0, 4)
                .map((relatedCategory) => (
                  <Link
                    key={relatedCategory.id}
                    href={`/category/${relatedCategory.slug}`}
                    className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow text-center"
                  >
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-lg bg-${relatedCategory.color}-100 flex items-center justify-center`}>
                      {(() => {
                        const RelatedIcon = iconMap[relatedCategory.icon] || Globe;
                        return <RelatedIcon className={`h-6 w-6 text-${relatedCategory.color}-600`} />;
                      })()}
                    </div>
                    <h3 className="font-medium text-sm">{relatedCategory.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {relatedCategory.projectCount} projects
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const category = mockCategories.find(cat => cat.slug === slug);
  
  if (!category) {
    return {
      title: 'Category Not Found - ShowYourProject.com',
      description: 'The requested category could not be found.',
    };
  }

  return {
    title: `${category.name} Projects - ShowYourProject.com`,
    description: `Discover innovative ${category.name.toLowerCase()} projects on ShowYourProject.com. ${category.description}`,
    keywords: [
      category.name.toLowerCase(),
      'projects',
      'startups',
      'showcase',
      'directory',
      'promotion',
      'backlinks'
    ],
    openGraph: {
      title: `${category.name} Projects - ShowYourProject.com`,
      description: `Discover innovative ${category.name.toLowerCase()} projects on ShowYourProject.com. ${category.description}`,
      type: 'website',
      url: `https://showyourproject.com/category/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} Projects - ShowYourProject.com`,
      description: `Discover innovative ${category.name.toLowerCase()} projects on ShowYourProject.com. ${category.description}`,
    },
  };
}

// Generate static params for better performance
export async function generateStaticParams() {
  return mockCategories.map((category) => ({
    slug: category.slug,
  }));
}
