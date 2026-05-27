'use client'

import { Suspense } from 'react'
import ShopPageContent from './ShopPageClient'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-bg-main flex items-center justify-center"><p>Loading...</p></div>}>
        <ShopPageContent />
      </Suspense>
      <Footer />
    </>
  )
}
