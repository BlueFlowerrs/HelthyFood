'use client'

import { Suspense } from 'react'
import ShopPageContent from './ShopPageClient'

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-main flex items-center justify-center"><p>Loading...</p></div>}>
      <ShopPageContent />
    </Suspense>
  )
}
