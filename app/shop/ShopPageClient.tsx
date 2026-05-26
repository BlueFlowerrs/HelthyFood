'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { useAddToCart } from '@/hooks/useAddToCart'
import { t } from '@/lib/i18n/translations'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { toast } from 'sonner'
import type { CartProduct } from '@/stores/cartStore'

function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

const sortOptions = [
  { value: 'newest', label_vi: 'Mới nhất', label_en: 'Newest' },
  { value: 'price_asc', label_vi: 'Giá: Thấp → Cao', label_en: 'Price: Low → High' },
  { value: 'price_desc', label_vi: 'Giá: Cao → Thấp', label_en: 'Price: High → Low' },
]

export default function ShopPageContent() {
  const { locale } = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart()

  const categorySlug = searchParams.get('category') ?? ''
  const searchQuery = searchParams.get('search') ?? ''
  const sortParam = searchParams.get('sort') ?? 'newest'

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').eq('active', true).order('sort_order')
      return data ?? []
    },
  })

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', categorySlug, searchQuery, sortParam],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, category:categories(id, slug, name_vi, name_en)')
        .eq('active', true)

      if (categorySlug) {
        const cat = categories?.find((c) => c.slug === categorySlug)
        if (cat) query = query.eq('category_id', cat.id)
      }

      if (searchQuery) {
        query = query.or(
          `name_vi.ilike.%${searchQuery}%,name_en.ilike.%${searchQuery}%`
        )
      }

      if (sortParam === 'price_asc') query = query.order('price', { ascending: true })
      else if (sortParam === 'price_desc') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data } = await query
      return data ?? []
    },
  })

  const handleAddToCart = (product: any) => {
    addToCart({ product: product as CartProduct, quantity: 1 }, {
      onSuccess: () => toast.success(locale === 'vi' ? 'Đã thêm vào giỏ!' : 'Added to cart!'),
    })
  }

  const updateSearch = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Header */}
      <div className="bg-brand-green-dark py-12 text-white">
        <div className="container-main">
          <h1 className="text-4xl font-serif font-bold mb-2">{t('shop.title', locale)}</h1>
          <p className="text-white/60">{t('shop.subtitle', locale)}</p>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-24">
              <h3 className="font-semibold mb-4">{t('shop.filterBy', locale)}</h3>

              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-wider text-text-muted mb-2">
                  {t('shop.filterBy', locale)}
                </h4>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => updateSearch('category', '')}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        !categorySlug ? 'bg-wine text-white' : 'hover:bg-gray-100'
                      )}
                    >
                      {t('shop.allProducts', locale)}
                    </button>
                  </li>
                  {categories?.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => updateSearch('category', cat.slug)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                          categorySlug === cat.slug ? 'bg-wine text-white' : 'hover:bg-gray-100'
                        )}
                      >
                        {locale === 'vi' ? cat.name_vi : cat.name_en}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider text-text-muted mb-2">
                  {t('shop.sortBy', locale)}
                </h4>
                <select
                  value={sortParam}
                  onChange={(e) => updateSearch('sort', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {locale === 'vi' ? opt.label_vi : opt.label_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => updateSearch('search', e.target.value)}
                placeholder={t('common.search', locale)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine"
              />
              {searchQuery && (
                <button onClick={() => updateSearch('search', '')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {(categorySlug || searchQuery) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {categorySlug && (
                  <Badge variant="wine">
                    {categories?.find((c) => c.slug === categorySlug)?.name_vi ?? categorySlug}
                    <button onClick={() => updateSearch('category', '')} className="ml-1 hover:text-wine-dark">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="wine">
                    "{searchQuery}"
                    <button onClick={() => updateSearch('search', '')} className="ml-1 hover:text-wine-dark">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            <p className="text-sm text-text-muted mb-6">
              {products?.length ?? 0} {locale === 'vi' ? 'sản phẩm' : 'products'}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {isLoading
                ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products?.map((product) => {
                    const isOnSale = product.sale_price !== null
                    const price = product.sale_price ?? product.price
                    const inStock = product.stock > 0

                    return (
                      <div key={product.id} className="group">
                        <div className="card-hover relative overflow-hidden">
                          <Link href={`/shop/${product.slug}`}>
                            <div className="relative h-56 bg-gray-100 overflow-hidden">
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt={locale === 'vi' ? product.name_vi : product.name_en}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-brand-green/20 to-wine/20 flex items-center justify-center">
                                  <span className="text-4xl">🥗</span>
                                </div>
                              )}
                              {isOnSale && (
                                <span className="badge-sale">
                                  -{Math.round((1 - product.sale_price / product.price) * 100)}%
                                </span>
                              )}
                              {product.featured && !isOnSale && (
                                <span className="badge-new">★</span>
                              )}
                            </div>
                          </Link>
                          <div className="p-4 space-y-3">
                            {product.category && (
                              <p className="text-[10px] uppercase tracking-wider text-text-muted">
                                {locale === 'vi' ? product.category.name_vi : product.category.name_en}
                              </p>
                            )}
                            <Link href={`/shop/${product.slug}`}>
                              <h3 className="font-medium text-sm line-clamp-2 hover:text-wine transition-colors min-h-[2.5rem]">
                                {locale === 'vi' ? product.name_vi : product.name_en}
                              </h3>
                            </Link>
                            {(product.calories || product.protein) && (
                              <div className="flex gap-1">
                                {product.calories && (
                                  <Badge variant="green" size="sm">
                                    {product.calories} cal
                                  </Badge>
                                )}
                                {product.protein && (
                                  <Badge variant="outline" size="sm">
                                    {product.protein}g P
                                  </Badge>
                                )}
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-1">
                              <div>
                                <p className="text-lg font-bold text-wine">
                                  {formatPrice(price)}đ
                                </p>
                                {isOnSale && (
                                  <p className="text-xs text-gray-400 line-through">
                                    {formatPrice(product.price)}đ
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAddToCart(product)}
                                disabled={!inStock || isAddingToCart}
                              >
                                {!inStock ? 'Hết hàng' : '+'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
            </div>

            {!isLoading && products?.length === 0 && (
              <div className="text-center py-20">
                <p className="text-6xl mb-4">🔍</p>
                <h3 className="text-xl font-serif font-semibold mb-2">
                  {t('common.noResults', locale)}
                </h3>
                <Button onClick={() => router.push('/shop')} className="mt-4">
                  {t('shop.allProducts', locale)}
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
