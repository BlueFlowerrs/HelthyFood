'use client'

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-bg-main">
      <div className="bg-brand-green-dark text-white py-20">
        <div className="container-main">
          <div className="h-10 w-64 bg-white/10 rounded animate-pulse" />
          <div className="h-5 w-96 bg-white/10 rounded animate-pulse mt-3" />
        </div>
      </div>

      <div className="container-main py-12">
        <div className="flex gap-8 mb-12">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-64 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
          {/* Products grid skeleton */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
                  <div className="h-5 w-1/2 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
