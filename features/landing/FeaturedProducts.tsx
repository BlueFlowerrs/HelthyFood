'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { useLocale } from '@/providers/LocaleProvider'
import { useAddToCart } from '@/hooks/useAddToCart'
import { useCartStore } from '@/stores/cartStore'
import { t } from '@/lib/i18n/translations'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { CartProduct } from '@/stores/cartStore'

function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

export function FeaturedProducts() {
  const { locale } = useLocale()
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart()
  const supabase = createClient()

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(id, slug, name_vi, name_en)')
        .eq('featured', true)
        .eq('active', true)
        .limit(8)
      return data ?? []
    },
  })

  const handleAddToCart = (product: CartProduct) => {
    addToCart({ product, quantity: 1 }, {
      onSuccess: () => {
        toast.success(locale === 'vi' ? 'Đã thêm vào giỏ hàng!' : 'Added to cart!')
      },
    })
  }

  return (
    <section className="py-20 bg-bg-main">
      <div className="container-main">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="section-title">{t('featured.title', locale)}</h2>
            <p className="section-subtitle">{t('featured.subtitle', locale)}</p>
          </div>
          <Link href="/shop" className="hidden sm:flex items-center gap-1 text-sm font-medium text-wine hover:text-wine-dark transition-colors">
            {t('featured.viewDetail', locale)}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : data?.map((product) => {
                const isOnSale = product.sale_price !== null
                const price = product.sale_price ?? product.price
                const inStock = product.stock > 0

                return (
                  <div key={product.id} className="group">
                    <div className="card-hover relative overflow-hidden">
                      {/* Image */}
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

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          {product.category && (
                            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
                              {locale === 'vi'
                                ? product.category.name_vi
                                : product.category.name_en}
                            </p>
                          )}
                          <Link href={`/shop/${product.slug}`}>
                            <h3 className="font-medium text-sm line-clamp-2 hover:text-wine transition-colors min-h-[2.5rem]">
                              {locale === 'vi' ? product.name_vi : product.name_en}
                            </h3>
                          </Link>
                        </div>

                        {/* Macros pills */}
                        {(product.calories || product.protein) && (
                          <div className="flex gap-1">
                            {product.calories && (
                              <Badge variant="green" size="sm">
                                {product.calories} cal
                              </Badge>
                            )}
                            {product.protein && (
                              <Badge variant="outline" size="sm">
                                {product.protein}g protein
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Price + CTA */}
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
                            onClick={() => handleAddToCart(product as unknown as CartProduct)}
                            disabled={!inStock || isAddingToCart}
                            className="text-xs"
                          >
                            {!inStock
                              ? t('featured.outOfStock', locale)
                              : t('featured.addToCart', locale)}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
        </div>

        <div className="text-center mt-10 sm:hidden">
          <Link href="/shop">
            <Button variant="outline">{t('common.viewAll', locale)}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
