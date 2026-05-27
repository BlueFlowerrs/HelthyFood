'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Zap, Flame, Beef } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { useAddToCart } from '@/hooks/useAddToCart'
import { formatVND } from '@/lib/cn'
import type { CartProduct } from '@/stores/cartStore'

const FALLBACK_IMAGES: Record<string, string> = {
  'protein-powder':
    'https://raw.createusercontent.com/380d1162-a5f9-4bad-9abf-a7b519da9896/',
  'healthy-meals':
    'https://raw.createusercontent.com/57245024-e364-4eee-ac27-d3c6c8977ad7/',
  'snacks-bars':
    'https://raw.createusercontent.com/eaa2e981-de51-47be-ad4c-2cc9d3070b7a/',
  supplements:
    'https://raw.createusercontent.com/bcad1e32-a054-4466-94e9-8454cf86af52/',
  'organic-drinks':
    'https://raw.createusercontent.com/934bb093-3550-41db-a51e-1e089ff6358e/',
  'meal-prep':
    'https://raw.createusercontent.com/7c9c84b4-fc63-4049-8335-15cdd85a4716/',
}
const DEFAULT_FALLBACK =
  'https://raw.createusercontent.com/57245024-e364-4eee-ac27-d3c6c8977ad7/'

interface CardImageProps {
  src: string | null
  alt: string
  categorySlug?: string
}

function CardImage({ src, alt, categorySlug }: CardImageProps) {
  const [errored, setErrored] = useState(false)
  const fallback = (categorySlug && FALLBACK_IMAGES[categorySlug]) || DEFAULT_FALLBACK
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

interface ProductCardProps {
  product: any
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t, locale } = useLocale()
  const { mutateAsync: addToCart } = useAddToCart()
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)

  const name = locale === 'vi' ? product.name_vi : product.name_en
  const shortDesc = locale === 'vi' ? product.short_description_vi : product.short_description_en
  const hasSale = product.sale_price !== null && product.sale_price < product.price
  const outOfStock = product.stock <= 0
  const categorySlug = product.category_slug ?? product.category?.slug

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (adding || outOfStock) return
    setAdding(true)
    try {
      await addToCart({ product: product as CartProduct, quantity: 1 })
      window.dispatchEvent(new Event('open-cart'))
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (buying || outOfStock) return
    setBuying(true)
    try {
      await addToCart({ product: product as CartProduct, quantity: 1 })
      window.location.href = '/checkout'
    } catch (err) {
      console.error(err)
    } finally {
      setBuying(false)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.06 }}
      className="group relative flex flex-col"
    >
      <a href={`/shop/${product.slug}`} className="block flex-1">
        {/* Image */}
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#223D19]/5 mb-4">
          <CardImage
            src={product.image_url}
            alt={name}
            categorySlug={categorySlug}
          />
          {/* Top tags */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {hasSale && (
              <span className="bg-[#8B2C4C] text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full">
                {t('common.sale')}
              </span>
            )}
            {product.featured && !hasSale && (
              <span className="bg-white/95 text-[#070B06] text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full">
                {t('common.featured')}
              </span>
            )}
            {outOfStock && (
              <span className="bg-[#070B06]/70 text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full">
                {t('common.outOfStock')}
              </span>
            )}
          </div>
          {/* Macros pill */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 flex-wrap">
            {product.calories > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-medium text-[#070B06]">
                <Flame className="w-3 h-3 text-[#8B2C4C]" /> {product.calories} kcal
              </span>
            )}
            {product.protein > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-medium text-[#070B06]">
                <Beef className="w-3 h-3 text-[#405C36]" /> {product.protein}g
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {product.nutrition_tags && product.nutrition_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {product.nutrition_tags.slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-wider text-[#405C36] font-medium"
              >
                {t(`tags.${tag}`) || tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="font-serif text-lg text-[#070B06] mb-1.5 leading-tight line-clamp-2 group-hover:text-[#8B2C4C] transition-colors">
          {name}
        </h3>
        {shortDesc && (
          <p className="text-xs text-[#070B06]/55 mb-3 line-clamp-1">
            {shortDesc}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          {hasSale ? (
            <>
              <span className="font-semibold text-[#8B2C4C] text-base">
                {formatVND(product.sale_price)}
              </span>
              <span className="text-xs text-[#070B06]/40 line-through">
                {formatVND(product.price)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-[#070B06] text-base">
              {formatVND(product.price)}
            </span>
          )}
        </div>
      </a>

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock || adding}
          className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-full border-2 border-[#070B06] text-[#070B06] text-xs font-semibold uppercase tracking-wide hover:bg-[#070B06] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {adding ? (
            <span
              className="w-3.5 h-3.5 border-2 border-current/40 border-t-current rounded-full animate-spin"
            />
          ) : (
            <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span className="truncate">{t('common.addToCart') || 'Thêm vào giỏ'}</span>
        </button>

        <button
          onClick={handleBuyNow}
          disabled={outOfStock || buying}
          className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-full bg-[#8B2C4C] text-white text-xs font-semibold uppercase tracking-wide hover:bg-[#6e1f39] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {buying ? (
            <span
              className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
            />
          ) : (
            <Zap className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span className="truncate">{t('common.buyNow') || 'Mua ngay'}</span>
        </button>
      </div>
    </motion.article>
  )
}
