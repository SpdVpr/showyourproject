import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { mockCategories } from "@/lib/mockData";

export default function CategoryNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        {/* 404 Icon */}
        <div className="text-8xl mb-6">🔍</div>
        
        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Category Not Found
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          The category you're looking for doesn't exist or may have been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild variant="default">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href="/search" className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Search All Projects
            </Link>
          </Button>
        </div>

        {/* Available Categories */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Available Categories
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockCategories.map((category) => (
              <Link 
                key={category.id}
                href={`/category/${category.slug}`}
                className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow text-center group"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-${category.color}-100 flex items-center justify-center group-hover:bg-${category.color}-200 transition-colors`}>
                  <span className="text-lg">{category.icon}</span>
                </div>
                <h3 className="font-medium text-sm text-gray-900 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {category.projectCount} projects
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg max-w-md mx-auto">
          <h3 className="font-semibold text-blue-900 mb-2">
            Can't find what you're looking for?
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Try browsing all projects or submit your own project to create a new category.
          </p>
          <Button asChild size="sm" className="w-full">
            <Link href="/submit">
              Submit Your Project
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
