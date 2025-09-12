export default function ProjectLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Back button */}
        <div className="h-10 w-20 bg-gray-200 rounded mb-6"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="flex space-x-2">
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
            </div>

            {/* Screenshot */}
            <div className="h-64 bg-gray-200 rounded-lg"></div>

            {/* Description */}
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-16"></div>
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-14 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="border rounded-lg p-6 space-y-4">
              <div className="h-5 bg-gray-200 rounded w-24"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center space-y-1">
                  <div className="h-6 bg-gray-200 rounded w-12 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
                <div className="text-center space-y-1">
                  <div className="h-6 bg-gray-200 rounded w-12 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="border rounded-lg p-6 space-y-4">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Related Projects */}
            <div className="border rounded-lg p-6 space-y-4">
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
