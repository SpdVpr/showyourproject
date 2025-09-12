export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button Skeleton */}
        <div className="mb-6">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Category Header Skeleton */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse mr-4"></div>
            <div className="text-left">
              <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="h-6 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>

        {/* Projects Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border p-6 animate-pulse">
              {/* Project Image Skeleton */}
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
              
              {/* Project Title Skeleton */}
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              
              {/* Project Description Skeleton */}
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              
              {/* Project Meta Skeleton */}
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Related Categories Skeleton */}
        <div className="mt-16 pt-16 border-t border-gray-200">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border animate-pulse">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gray-200"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
