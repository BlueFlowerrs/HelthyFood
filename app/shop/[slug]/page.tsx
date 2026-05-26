'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'
import { Minus, Plus, ArrowLeft, Check, Flame, Zap, Wheat, Droplets } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { useAddToCart } from '@/hooks/useAddToCart'
import { t } from '@/lib/i18n/translations'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { toast } from 'sonner'
import Link from 'next/link'
import type { CartProduct } from '@/stores/cartStore'

function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

const macroIcons = [
  { key: 'calories', Icon: Flame, color: 'text-orange-500' },
  { key: 'protein', Icon: Zap, color: 'text-wine' },
  { key: 'carbs', Icon: Wheat, color: 'text-amber-500' },
  { key: 'fat', Icon: Droplets, color: 'text-brand-green' },
]

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { locale } = useLocale()
  const supabase = createClient()
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart()

  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(id, slug, name_vi, name_en)')
        .eq('slug', slug)
        .eq('active', true)
        .single()
      return data
    },
  })

  const { data: related } = useQuery({
    queryKey: ['products', 'related', product?.category_id],
    queryFn: async () => {
      if (!product?.category_id) return []
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(id, slug, name_vi, name_en)')
        .eq('active', true)
        .eq('category_id', product.category_id)
        .neq('id', product.id)
        .limit(4)
      return data ?? []
    },
    enabled: !!product?.category_id,
  })

  const handleAddToCart = () => {
    if (!product) return
    addToCart({ product: product as unknown as CartProduct, quantity }, {
      onSuccess: () => {
        toast.success(
          locale === 'vi'
            ? `Đã thêm ${quantity}x vào giỏ hàng!`
            : `Added ${quantity}x to cart!`
        )
        // Dispatch event to open cart drawer
        window.dispatchEvent(new Event('open-cart'))
      },
    })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/checkout')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main">
        <div className="container-main py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="h-96 rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h2 className="text-2xl font-serif font-bold mb-4">Sản phẩm không tồn tại</h2>
          <Link href="/shop">
            <Button>Quay lại cửa hàng</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isOnSale = product.sale_price !== null
  const price = product.sale_price ?? product.price
  const inStock = product.stock > 0
  const galleryImages = product.gallery_images ?? []
  const allImages = [product.image_url, ...galleryImages].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="container-main py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link href="/" className="hover:text-wine">{t('nav.home', locale)}</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-wine">{t('nav.shop', locale)}</Link>
          <span>/</span>
          <span className="text-text-dark truncate max-w-[200px]">
            {locale === 'vi' ? product.name_vi : product.name_en}
          </span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative h-[400px] lg:h-[500px] bg-white rounded-2xl overflow-hidden mb-4">
              {allImages[activeImage] ? (
                <Image
                  src={allImages[activeImage]}
                  alt={locale === 'vi' ? product.name_vi : product.name_en}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-green/20 to-wine/20 flex items-center justify-center">
                  <span className="text-8xl">🥗</span>
                </div>
              )}
              {isOnSale && (
                <span className="absolute top-4 left-4 badge-sale text-sm">
                  -{Math.round((1 - product.sale_price! / product.price) * 100)}% OFF
                </span>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      'relative w-20 h-20 bg-white rounded-lg overflow-hidden border-2 transition-all',
                      i === activeImage ? 'border-wine' : 'border-transparent hover:border-gray-300'
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.category && (
              <p className="text-xs uppercase tracking-wider text-brand-green font-semibold mb-2">
                {locale === 'vi' ? product.category.name_vi : product.category.name_en}
              </p>
            )}

            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
              {locale === 'vi' ? product.name_vi : product.name_en}
            </h1>

            {locale === 'vi' ? (
              product.short_description_vi && (
                <p className="text-text-muted mb-4">{product.short_description_vi}</p>
              )
            ) : (
              product.short_description_en && (
                <p className="text-text-muted mb-4">{product.short_description_en}</p>
              )
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-wine">{formatPrice(price)}đ</span>
              {isOnSale && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.price)}đ
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-6">
              {inStock ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-green-600 font-medium">
                    {product.stock <= 5
                      ? `${t('shop.lowStock', locale)} (${product.stock})`
                      : t('shop.inStock', locale)}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-red-500 font-medium">{t('shop.outOfStock', locale)}</span>
                </>
              )}
            </div>

            {/* Macros */}
            {(product.calories || product.protein || product.carbs || product.fat) && (
              <div className="bg-white rounded-xl p-5 mb-6 border border-gray-100">
                <h3 className="text-xs uppercase tracking-wider text-text-muted mb-4 font-semibold">
                  {t('shop.nutritionInfo', locale)}
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {macroIcons.map(({ key, Icon, color }) => {
                    const val = product[key as 'calories' | 'protein' | 'carbs' | 'fat']
                    if (!val) return null
                    return (
                      <div key={key} className="text-center">
                        <Icon className={cn('w-5 h-5 mx-auto mb-1', color)} />
                        <p className="text-xl font-bold">{val}</p>
                        <p className="text-[10px] uppercase tracking-wider text-text-muted">
                          {t(`macro.${key}`, locale)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Nutrition tags */}
            {product.nutrition_tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.nutrition_tags.map((tag: string) => (
                  <Badge key={tag} variant="green">
                    {t(`nutritionTags.${tag}`, locale) ?? tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-semibold min-w-[48px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm text-text-muted">
                {t('shop.stock', locale)}: <strong>{product.stock}</strong>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!inStock || isAddingToCart}
                className="flex-1"
              >
                {!inStock ? t('shop.outOfStock', locale) : t('shop.addToCart', locale)}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                disabled={!inStock}
              >
                {t('featured.buyNow', locale)}
              </Button>
            </div>

            {/* Description */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-semibold mb-4">{t('shop.description', locale)}</h3>
              <div className="prose prose-sm max-w-none text-text-muted">
                <p>{locale === 'vi' ? product.description_vi : product.description_en}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related && related.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-200">
            <h2 className="section-title mb-8">{t('shop.relatedProducts', locale)}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((rel) => {
                const relPrice = rel.sale_price ?? rel.price
                const relOnSale = rel.sale_price !== null
                return (
                  <Link key={rel.id} href={`/shop/${rel.slug}`} className="card-hover block">
                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                      {rel.image_url ? (
                        <Image src={rel.image_url} alt={locale === 'vi' ? rel.name_vi : rel.name_en} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-green/20 to-wine/20" />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">
                        {locale === 'vi' ? rel.name_vi : rel.name_en}
                      </h3>
                      <p className="text-wine font-bold">{formatPrice(relPrice)}đ</p>
                      {relOnSale && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatPrice(rel.price)}đ
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
