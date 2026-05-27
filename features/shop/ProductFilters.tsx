'use client'

import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { cn } from '@/lib/cn'

const TAGS = [
  'High Protein',
  'Lean Bulk',
  'Low Sugar',
  'Keto',
  'Organic',
  'Vegan',
  'Gym Meal',
  'Weight Loss',
  'Clean Eating',
]

interface ProductFiltersProps {
  filters: {
    search: string
    category: string
    tags: string[]
    sort: string
  }
  setFilters: React.Dispatch<
    React.SetStateAction<{
      search: string
      category: string
      tags: string[]
      sort: string
    }>
  >
}

export function ProductFilters({ filters, setFilters }: ProductFiltersProps) {
  const { t, locale } = useLocale()
  
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      return res.json()
    },
  })

  const updateFilter = (k: string, v: any) =>
    setFilters((f) => ({ ...f, [k]: v }))

  const toggleTag = (tag: string) => {
    setFilters((f) => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter((x) => x !== tag)
        : [...f.tags, tag],
    }))
  }

  const hasActive =
    filters.search || filters.category || filters.tags.length > 0

  const categories = catData?.categories || []

  return (
    <aside className="space-y-8">
      {/* Search */}
      <div>
        <label className="block text-[11px] uppercase tracking-[0.15em] text-[#070B06]/60 font-medium mb-3">
          {t('common.search')}
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#070B06]/40" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder={t('shop.searchPlaceholder') || 'Tìm sản phẩm...'}
            className="w-full h-12 pl-11 pr-4 rounded-full border border-[#070B06]/12 bg-white text-sm focus:border-[#405C36] focus:outline-none focus:ring-2 focus:ring-[#405C36]/15 transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-[11px] uppercase tracking-[0.15em] text-[#070B06]/60 font-medium mb-3">
          {t('shop.allCategories') || 'Danh mục'}
        </label>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter('category', '')}
            className={cn(
              'w-full text-left text-sm px-3 py-2 rounded-lg transition-colors',
              !filters.category
                ? 'bg-[#070B06] text-white'
                : 'text-[#070B06]/70 hover:bg-[#070B06]/5'
            )}
          >
            {t('shop.allCategories') || 'Tất cả danh mục'}
          </button>
          {categories.map((c: any) => {
            const name = locale === 'vi' ? c.name_vi : c.name_en
            const active = filters.category === c.slug
            return (
              <button
                key={c.id}
                onClick={() => updateFilter('category', c.slug)}
                className={cn(
                  'w-full flex items-center justify-between text-left text-sm px-3 py-2 rounded-lg transition-colors',
                  active
                    ? 'bg-[#070B06] text-white'
                    : 'text-[#070B06]/70 hover:bg-[#070B06]/5'
                )}
              >
                <span>{name}</span>
                {c.product_count !== undefined && (
                  <span
                    className={cn(
                      'text-xs',
                      active ? 'text-white/60' : 'text-[#070B06]/40'
                    )}
                  >
                    {c.product_count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Nutrition tags */}
      <div>
        <label className="block text-[11px] uppercase tracking-[0.15em] text-[#070B06]/60 font-medium mb-3">
          {t('shop.nutritionTags') || 'Bộ lọc dinh dưỡng'}
        </label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const active = filters.tags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  active
                    ? 'bg-[#405C36] text-white border-[#405C36]'
                    : 'bg-white border-[#070B06]/12 text-[#070B06]/70 hover:border-[#405C36]'
                )}
              >
                {t(`tags.${tag}`) || tag}
              </button>
            )
          })}
        </div>
      </div>

      {hasActive && (
        <button
          onClick={() =>
            setFilters({
              search: '',
              category: '',
              tags: [],
              sort: filters.sort,
            })
          }
          className="inline-flex items-center gap-1.5 text-xs text-[#8B2C4C] hover:text-[#070B06] transition-colors"
        >
          <X className="w-3 h-3" />
          {t('shop.clearFilters') || 'Xóa bộ lọc'}
        </button>
      )}
    </aside>
  )
}
