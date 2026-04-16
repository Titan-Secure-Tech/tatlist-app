export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 w-96 bg-muted rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-[600px] bg-muted rounded-lg mx-auto animate-pulse" />
        </div>

        {/* Collections Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card">
              {/* Image Skeleton */}
              <div className="aspect-video bg-muted rounded-t-lg animate-pulse" />

              {/* Content Skeleton */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-12 bg-muted rounded-full animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
