'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            Đã xảy ra lỗi
          </h1>
          <p className="text-text-muted text-sm">
            {error.message || 'Một lỗi không mong muốn đã xảy ra. Vui lòng thử lại.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-wine text-white rounded-xl font-medium hover:bg-wine-dark transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs text-gray-400 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
