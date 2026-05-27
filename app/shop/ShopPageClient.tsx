'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProductCard } from '@/features/shop/ProductCard'
import { ProductFilters } from '@/features/shop/ProductFilters'

export default function ShopPageContent() {
  const { t } = useLocale()
  const [filters, setFilters] = useState<{
    search: string
    category: string
    tags: string[]
    sort: string
  }>({
    search: '',
    category: '',
    tags: [],
    sort: 'newest',
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  // Sync URL ?category= on first load
  useEffect(() => {
    if (typeof window === 'undefined') return
    const sp = new URLSearchParams(window.location.search)
    const cat = sp.get('category')
    if (cat) setFilters((f) => ({ ...f, category: cat }))
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters.search, filters.category, filters.sort],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.category) params.set('category', filters.category)
      
      // Map sort values to match API route expectation
      let apiSort = 'newest'
      if (filters.sort === 'price-low') apiSort = 'price_asc'
      else if (filters.sort === 'price-high') apiSort = 'price_desc'
      params.set('sort', apiSort)

      const res = await fetch(`/api/products?${params.toString()}`)
      return res.json()
    },
  })

  const rawProducts = data?.products || []

  // Client-side filter for nutrition tags
  const products = rawProducts.filter((p: any) => {
    if (filters.tags.length === 0) return true
    if (!p.nutrition_tags || p.nutrition_tags.length === 0) return false
    return filters.tags.every((tg) => p.nutrition_tags.includes(tg))
  })

  return (
    <main className="pt-28 pb-20 bg-[#DAD6D6] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 lg:mb-14"
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#8B2C4C] font-medium mb-3 inline-block">
            HelthyFood Store
          </span>
          <h1 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] tracking-tight text-[#070B06] font-medium mb-3">
            {t('shop.title') || 'Cửa hàng'}
          </h1>
          <p className="text-[#070B06]/60 max-w-xl">
            {t('shop.subtitle') || 'Sản phẩm dinh dưỡng cao cấp được thiết kế riêng cho mục tiêu thể hình của bạn.'}
          </p>
        </motion.div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-6 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#070B06]/15 bg-white text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('shop.filters') || 'Bộ lọc'}
          </button>
          <select
            value={filters.sort}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sort: e.target.value }))
            }
            className="px-4 py-2 rounded-full border border-[#070B06]/15 bg-white text-sm"
          >
            <option value="newest">{t('shop.sortNewest') || 'Mới nhất'}</option>
            <option value="price-low">{t('shop.sortPriceLow') || 'Giá thấp → cao'}</option>
            <option value="price-high">{t('shop.sortPriceHigh') || 'Giá cao → thấp'}</option>
            <option value="popular">{t('shop.sortPopular') || 'Phổ biến nhất'}</option>
          </select>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          {/* Filters */}
          <div className={`${mobileOpen ? 'block' : 'hidden'} lg:block`}>
            <ProductFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Grid */}
          <div>
            <div className="hidden lg:flex items-center justify-between mb-8">
              <p className="text-sm text-[#070B06]/60">
                {isLoading
                  ? '...'
                  : `${products.length} ${t('shop.productsFound') || 'sản phẩm được tìm thấy'}`}
              </p>
              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, sort: e.target.value }))
                }
                className="px-4 py-2 rounded-full border border-[#070B06]/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#405C36]/20"
              >
                <option value="newest">{t('shop.sortNewest') || 'Mới nhất'}</option>
                <option value="price-low">{t('shop.sortPriceLow') || 'Giá thấp → cao'}</option>
                <option value="price-high">{t('shop.sortPriceHigh') || 'Giá cao → thấp'}</option>
                <option value="popular">{t('shop.sortPopular') || 'Phổ biến nhất'}</option>
              </select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white/40 rounded-2xl">
                <p className="text-[#070B06]/60 mb-2">
                  {t('shop.noResults') || 'Không tìm thấy sản phẩm nào'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {products.map((p: any, i: number) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
