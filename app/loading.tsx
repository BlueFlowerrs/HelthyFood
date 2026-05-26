'use client'

export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-wine/30 border-t-wine rounded-full animate-spin mx-auto" />
        <p className="text-text-muted text-sm">Đang tải...</p>
      </div>
    </div>
  )
}
