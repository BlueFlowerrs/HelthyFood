'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import {
  Minus,
  Plus,
  ShoppingBag,
  Flame,
  Beef,
  Wheat,
  Droplet,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  Zap,
} from 'lucide-react'
import { ProductCard } from '@/features/shop/ProductCard'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useLocale } from '@/providers/LocaleProvider'
import { useAddToCart } from '@/hooks/useAddToCart'
import { formatVND } from '@/lib/cn'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import type { CartProduct } from '@/stores/cartStore'

// Category-based fallback images (from generated assets)
const FALLBACK_IMAGES: Record<string, string> = {
  'protein-powder':
    'https://raw.createusercontent.com/d28a68db-737e-4958-a8d1-bc88d9327129/',
  'healthy-meals':
    'https://raw.createusercontent.com/6adb94f7-e843-4ac3-aabc-4479c144e285/',
  'snacks-bars':
    'https://raw.createusercontent.com/d0212b61-ce5a-4321-9e7d-00cc3f26ae3c/',
  supplements:
    'https://raw.createusercontent.com/77bb2814-8a28-4935-b536-1e8a49f744cd/',
  'organic-drinks':
    'https://raw.createusercontent.com/a2668ffe-2472-485b-9488-8b2bce5278ff/',
  'meal-prep':
    'https://raw.createusercontent.com/c83aa15a-b14b-479a-8857-9cf5fa813262/',
}
const DEFAULT_FALLBACK =
  'https://raw.createusercontent.com/d28a68db-737e-4958-a8d1-bc88d9327129/'

interface ImageWithFallbackProps {
  src: string | null
  alt: string
  className?: string
  categorySlug?: string
  onLoad?: () => void
}

function ImageWithFallback({ src, alt, className, categorySlug, onLoad }: ImageWithFallbackProps) {
  const [errored, setErrored] = useState(false)
  const fallback = (categorySlug && FALLBACK_IMAGES[categorySlug]) || DEFAULT_FALLBACK
  if (!src || errored) {
    return (
      <img src={fallback} alt={alt} className={className} onLoad={onLoad} />
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      onLoad={onLoad}
    />
  )
}

interface LightboxProps {
  images: (string | null)[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  categorySlug?: string
}

// Lightbox modal
function Lightbox({ images, index, onClose, onPrev, onNext, categorySlug }: LightboxProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#070B06]/95 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <motion.div
        key={index}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <ImageWithFallback
          src={images[index]}
          alt=""
          categorySlug={categorySlug}
          className="w-full h-full object-contain"
        />
      </motion.div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white text-sm uppercase tracking-wider"
      >
        ✕ Đóng
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
        {index + 1} / {images.length}
      </div>
    </motion.div>
  )
}

interface MacroPillProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: string
}

function MacroPill({ icon: Icon, label, value, color }: MacroPillProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white border border-[#070B06]/8">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ backgroundColor: color + '15', color }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[#070B06]/50">
          {label}
        </div>
        <div className="font-serif text-lg text-[#070B06]">{value}</div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { t, locale } = useLocale()
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const { mutateAsync: addToCart } = useAddToCart()
  const supabase = createClient()

  const { data: p, isLoading } = useQuery({
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
    queryKey: ['products', 'related', p?.category_id],
    queryFn: async () => {
      if (!p?.category_id) return []
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(id, slug, name_vi, name_en)')
        .eq('active', true)
        .eq('category_id', p.category_id)
        .neq('id', p.id)
        .limit(4)
      return data ?? []
    },
    enabled: !!p?.category_id,
  })

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-20 bg-[#DAD6D6] min-h-screen">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-10">
            <Skeleton className="aspect-[4/5] max-h-[520px]" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!p) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-20 text-center min-h-screen bg-[#DAD6D6]">
          <p className="text-[#070B06]/60">Không tìm thấy sản phẩm</p>
        </main>
        <Footer />
      </>
    )
  }

  const name = locale === 'vi' ? p.name_vi : p.name_en
  const description = locale === 'vi' ? p.description_vi : p.description_en
  const categoryName = locale === 'vi' ? p.category?.name_vi : p.category?.name_en
  const categorySlug = p.category?.slug
  const hasSale = p.sale_price !== null && p.sale_price < p.price
  const finalPrice = hasSale ? p.sale_price! : p.price

  // Build gallery — deduplicate and filter blanks
  const rawGallery = [p.image_url, ...(p.gallery_images || [])].filter(Boolean)
  const gallery = rawGallery.length > 0 ? rawGallery : [null] // at least 1 slot

  const prevImg = () =>
    setActiveImage((i) => (i - 1 + gallery.length) % gallery.length)
  const nextImg = () => setActiveImage((i) => (i + 1) % gallery.length)

  const handleAdd = async () => {
    await addToCart({ product: p as unknown as CartProduct, quantity: qty })
    window.dispatchEvent(new Event('open-cart'))
  }

  const handleBuyNow = async () => {
    await addToCart({ product: p as unknown as CartProduct, quantity: qty })
    window.location.href = '/checkout'
  }

  return (
    <>
      <Navbar />
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={gallery}
            index={activeImage}
            onClose={() => setLightboxOpen(false)}
            onPrev={prevImg}
            onNext={nextImg}
            categorySlug={categorySlug}
          />
        )}
      </AnimatePresence>

      <main className="pt-28 pb-24 bg-[#DAD6D6] min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          {/* Breadcrumb */}
          <nav className="text-xs uppercase tracking-wider text-[#070B06]/50 mb-8 flex items-center gap-2 flex-wrap">
            <a href="/" className="hover:text-[#070B06]">
              {t('nav.home') || 'Trang chủ'}
            </a>
            <ChevronRight className="w-3 h-3" />
            <a href="/shop" className="hover:text-[#070B06]">
              {t('nav.shop') || 'Cửa hàng'}
            </a>
            {categoryName && (
              <>
                <ChevronRight className="w-3 h-3" />
                <a
                  href={`/shop?category=${categorySlug}`}
                  className="hover:text-[#070B06]"
                >
                  {categoryName}
                </a>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#070B06]">{name}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_minmax(auto,520px)] gap-10 lg:gap-16 items-start">
            {/* GALLERY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex gap-3 sticky top-28"
            >
              {/* Vertical thumbnail strip — only if >1 image */}
              {gallery.length > 1 && (
                <div className="flex flex-col gap-2.5 flex-shrink-0 w-[72px]">
                  {gallery.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                        i === activeImage
                          ? 'border-[#8B2C4C] shadow-[0_0_0_3px_rgba(139,44,76,0.15)]'
                          : 'border-transparent hover:border-[#070B06]/20 bg-white'
                      }`}
                    >
                      <ImageWithFallback
                        src={g}
                        alt=""
                        categorySlug={categorySlug}
                        className="w-full h-full object-cover"
                      />
                      {i === activeImage && (
                        <div className="absolute inset-0 ring-2 ring-[#8B2C4C] ring-inset rounded-xl pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1 min-w-0">
                <div
                  className="relative rounded-3xl overflow-hidden bg-white group cursor-zoom-in"
                  style={{ aspectRatio: '4/5', maxHeight: 560 }}
                  onClick={() => setLightboxOpen(true)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <ImageWithFallback
                        src={gallery[activeImage]}
                        alt={name}
                        categorySlug={categorySlug}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Zoom hint */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1.5 flex items-center gap-1.5 text-[10px] font-medium text-[#070B06]/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-3 h-3" />
                    Phóng to
                  </div>

                  {/* Image counter badge */}
                  {gallery.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-[#070B06]/70 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
                      {activeImage + 1} / {gallery.length}
                    </div>
                  )}

                  {/* Prev / Next arrows */}
                  {gallery.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          prevImg()
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#070B06] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          nextImg()
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#070B06] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Dot indicators (mobile) */}
                {gallery.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-3">
                    {gallery.map((_, i) => (
                      <button key={i} onClick={() => setActiveImage(i)}>
                        <div
                          className="rounded-full transition-all duration-300"
                          style={{
                            width: i === activeImage ? 20 : 6,
                            height: 6,
                            backgroundColor:
                              i === activeImage
                                ? '#8B2C4C'
                                : 'rgba(7,11,6,0.2)',
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* PRODUCT INFO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Nutrition tags */}
              {p.nutrition_tags && p.nutrition_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {p.nutrition_tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium bg-[#405C36]/10 text-[#223D19] border border-[#405C36]/20"
                    >
                      {t(`tags.${tag}`) || tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="font-serif text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] tracking-tight text-[#070B06] font-medium mb-4">
                {name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-7">
                <span className="font-serif text-3xl text-[#8B2C4C] font-medium">
                  {formatVND(finalPrice)}
                </span>
                {hasSale && (
                  <span className="text-base text-[#070B06]/40 line-through">
                    {formatVND(p.price)}
                  </span>
                )}
                {hasSale && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-[#8B2C4C] text-white px-2 py-0.5 rounded-full">
                    -{Math.round((1 - p.sale_price! / p.price) * 100)}%
                  </span>
                )}
              </div>

              {/* Description */}
              {description && (
                <p className="text-[#070B06]/70 leading-relaxed mb-7 text-sm lg:text-base">
                  {description}
                </p>
              )}

              {/* Macros */}
              {(p.calories || p.protein || p.carbs || p.fat) && (
                <div className="mb-7">
                  <h3 className="text-[11px] uppercase tracking-[0.18em] text-[#070B06]/60 font-medium mb-3">
                    {t('shop.nutritionInfo') || 'Thành phần dinh dưỡng'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {p.calories !== undefined && (
                      <MacroPill
                        icon={Flame}
                        label={t('macro.calories') || 'Calories'}
                        value={`${p.calories} kcal`}
                        color="#8B2C4C"
                      />
                    )}
                    {p.protein !== undefined && (
                      <MacroPill
                        icon={Beef}
                        label={t('macro.protein') || 'Protein'}
                        value={`${p.protein}g`}
                        color="#405C36"
                      />
                    )}
                    {p.carbs !== undefined && (
                      <MacroPill
                        icon={Wheat}
                        label={t('macro.carbs') || 'Carbs'}
                        value={`${p.carbs}g`}
                        color="#223D19"
                      />
                    )}
                    {p.fat !== undefined && (
                      <MacroPill
                        icon={Droplet}
                        label={t('macro.fat') || 'Fat'}
                        value={`${p.fat}g`}
                        color="#d4a574"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Qty + Add */}
              <div className="flex items-center gap-4 mb-5">
                <div className="inline-flex items-center border border-[#070B06]/15 bg-white rounded-full">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-12 h-12 flex items-center justify-center text-[#070B06]/60 hover:text-[#070B06]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-medium text-[#070B06]">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-12 h-12 flex items-center justify-center text-[#070B06]/60 hover:text-[#070B06]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  onClick={handleAdd}
                  variant="primary"
                  size="lg"
                  disabled={p.stock <= 0}
                  className="flex-1"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {p.stock > 0 ? (t('common.addToCart') || 'Thêm vào giỏ') : (t('common.outOfStock') || 'Hết hàng')}
                </Button>
              </div>

              {/* Buy now button */}
              <Button
                onClick={handleBuyNow}
                variant="wine"
                size="lg"
                disabled={p.stock <= 0}
                className="w-full mb-8"
              >
                <Zap className="w-4 h-4" />
                {t('common.buyNow') || 'Mua ngay'}
              </Button>

              {/* Meta */}
              <div className="pt-5 border-t border-[#070B06]/10 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#070B06]/50 mb-1">
                    {t('product.category') || 'Danh mục'}
                  </div>
                  <div className="text-[#070B06]">{categoryName}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#070B06]/50 mb-1">
                    {t('common.inStock') || 'Tình trạng'}
                  </div>
                  <div className="text-[#070B06]">
                    {p.stock} {t('common.quantity')?.toLowerCase() || 'sản phẩm'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related */}
          {related && related.length > 0 && (
            <section className="mt-20 lg:mt-28">
              <h2 className="font-serif text-3xl text-[#070B06] mb-8">
                {t('product.related') || 'Sản phẩm tương tự'}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((rp: any, i: number) => (
                  <ProductCard key={rp.id} product={rp} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
