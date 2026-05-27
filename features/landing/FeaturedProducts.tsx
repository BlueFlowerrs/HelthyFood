'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight, Flame, Beef } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from '@/providers/LocaleProvider'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

const FALLBACK_IMAGES: Record<string, string> = {
  protein: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=500&fit=crop',
  meals: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=500&fit=crop',
  snacks: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=500&fit=crop',
  drinks: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop',
}
const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=500&fit=crop'

function CardImage({
  src,
  alt,
  categorySlug,
}: {
  src?: string | null
  alt: string
  categorySlug?: string
}) {
  const [errored, setErrored] = useState(false)
  const fallback =
    (categorySlug && FALLBACK_IMAGES[categorySlug]) || DEFAULT_FALLBACK
  return (
    <img
      src={!src || errored ? fallback : src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  )
}

import { useState } from 'react'
import { ShoppingBag, Zap } from 'lucide-react'
import { useAddToCart } from '@/hooks/useAddToCart'
import type { CartProduct } from '@/stores/cartStore'

import { formatPrice } from '@/lib/format'

export function FeaturedProducts() {
  const { locale, t } = useLocale()
  const { mutate: addToCart, isPending: isAdding } = useAddToCart()
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
    addToCart({ product, quantity: 1 })
  }

  const handleBuyNow = (product: CartProduct) => {
    addToCart(
      { product, quantity: 1 },
      {
        onSuccess: () => {
          window.location.href = '/checkout'
        },
      }
    )
  }

  return (
    <section className="bg-[#DAD6D6] py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
        >
          <div className="max-w-xl">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8B2C4C] font-medium mb-3 inline-block">
              {t('featured.label')}
            </span>
            <h2 className="font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-tight text-[#070B06] font-medium">
              {t('featured.title')}
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-wider text-[#070B06] hover:text-[#8B2C4C] transition-colors group"
          >
            {t('common.viewAll')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <p className="text-[#070B06]/60 max-w-2xl mb-12 leading-relaxed">
          {t('featured.subtitle')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {(isLoading
            ? Array.from({ length: 4 })
            : (data ?? []).slice(0, 4)
          ).map((product, i) =>
            product ? (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className="group relative flex flex-col"
              >
                <Link href={`/shop/${product.slug}`} className="block flex-1">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#223D19]/5 mb-4">
                    <CardImage
                      src={product.image_url}
                      alt={locale === 'vi' ? product.name_vi : product.name_en}
                      categorySlug={product.category?.slug}
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {product.sale_price && product.sale_price < product.price && (
                        <span className="bg-[#8B2C4C] text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full">
                          {t('common.sale')}
                        </span>
                      )}
                      {product.featured && !product.sale_price && (
                        <span className="bg-white/95 text-[#070B06] text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full">
                          {t('common.featured')}
                        </span>
                      )}
                      {product.stock <= 0 && (
                        <span className="bg-[#070B06]/70 text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full">
                          {t('common.outOfStock')}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 flex-wrap">
                      {product.calories > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-medium text-[#070B06]">
                          <Flame className="w-3 h-3 text-[#8B2C4C]" />
                          {product.calories} kcal
                        </span>
                      )}
                      {product.protein > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-medium text-[#070B06]">
                          <Beef className="w-3 h-3 text-[#223D19]" />
                          {product.protein}g protein
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-serif text-lg text-[#070B06] mb-1.5 leading-tight line-clamp-2 group-hover:text-[#8B2C4C] transition-colors">
                    {locale === 'vi' ? product.name_vi : product.name_en}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-4">
                    {product.sale_price && product.sale_price < product.price ? (
                      <>
                        <span className="font-semibold text-[#8B2C4C] text-base">
                          {formatPrice(product.sale_price)}₫
                        </span>
                        <span className="text-xs text-[#070B06]/40 line-through">
                          {formatPrice(product.price)}₫
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold text-[#070B06] text-base">
                        {formatPrice(product.price)}₫
                      </span>
                    )}
                  </div>
                </Link>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleAddToCart(product as unknown as CartProduct)}
                    disabled={product.stock <= 0 || isAdding}
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-full border-2 border-[#070B06] text-[#070B06] text-xs font-semibold uppercase tracking-wide hover:bg-[#070B06] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{t('common.addToCart') || 'Thêm vào giỏ'}</span>
                  </button>
                  <button
                    onClick={() => handleBuyNow(product as unknown as CartProduct)}
                    disabled={product.stock <= 0 || isAdding}
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-full bg-[#8B2C4C] text-white text-xs font-semibold uppercase tracking-wide hover:bg-[#6e1f39] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{t('common.buyNow') || 'Mua ngay'}</span>
                  </button>
                </div>
              </motion.article>
            ) : (
              <div
                key={i}
                className="aspect-[4/5] bg-white/40 rounded-2xl animate-pulse"
              />
            ),
          )}
        </div>
      </div>
    </section>
  )
}
