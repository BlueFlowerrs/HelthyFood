'use client'

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-bg-main">
      <div className="bg-brand-green-dark text-white py-12">
        <div className="container-main">
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      <div className="container-main py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-3" />
              <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
        {/* Content */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="h-6 w-40 bg-gray-100 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
