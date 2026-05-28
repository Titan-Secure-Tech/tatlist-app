export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Skeleton */}
      <div className="border-b bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Header Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-9 w-64 bg-gray-200 rounded-lg mb-2 animate-pulse" />
              <div className="h-5 w-96 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
          </div>

          {/* Search and Filters Skeleton */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="h-10 w-full md:w-96 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card flex flex-col h-full">
              {/* Image Skeleton */}
              <div className="aspect-square bg-gray-200 rounded-t-lg animate-pulse" />

              {/* Content Skeleton */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-6 w-full bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="mt-4">
                  <div className="h-8 w-24 bg-gray-200 rounded mb-3 animate-pulse" />
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
