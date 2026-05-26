'use client'

export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-bg-main">
      <div className="bg-brand-green-dark text-white py-12">
        <div className="container-main">
          <div className="h-8 w-64 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      <div className="container-main py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full animate-pulse mx-auto mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
