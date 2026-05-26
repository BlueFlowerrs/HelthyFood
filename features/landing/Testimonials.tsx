'use client'

import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { cn } from '@/lib/cn'

const testimonials = [
  {
    name: 'Nguyễn Minh Tuấn',
    role: 'Fitness Trainer',
    avatar: '🏋️',
    rating: 5,
    text_vi: 'Sản phẩm chất lượng vượt mong đợi. Protein bar và meal prep của HelthyFood giúp tôi tiết kiệm rất nhiều thời gian mà vẫn đảm bảo dinh dưỡng.',
    text_en: 'Products exceeded my expectations. HelthyFood protein bars and meal prep save me so much time while maintaining proper nutrition.',
  },
  {
    name: 'Trần Thị Lan',
    role: 'Gym Enthusiast',
    avatar: '💪',
    rating: 5,
    text_vi: 'Tôi đã thử nhiều brand healthy food nhưng HelthyFood là lựa chọn tốt nhất. Vị ngon, giao hàng nhanh, và packaging rất chuyên nghiệp.',
    text_en: 'I have tried many healthy food brands but HelthyFood is the best. Great taste, fast delivery, and professional packaging.',
  },
  {
    name: 'Lê Hoàng Nam',
    role: 'Bodybuilder',
    avatar: '🏃',
    rating: 5,
    text_vi: 'Macros tracking chính xác giúp tôi dễ dàng lên kế hoạch ăn uống. Đặc biệt thích protein powder và snack range của họ.',
    text_en: 'Accurate macros tracking helps me plan my meals easily. I especially love their protein powder and snack range.',
  },
]

export function Testimonials() {
  const { locale } = useLocale()
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1))

  const testimonial = testimonials[current]

  return (
    <section className="py-20 bg-bg-main">
      <div className="container-main">
        <div className="text-center mb-12">
          <h2 className="section-title">{t('testimonials.title', locale)}</h2>
          <p className="section-subtitle mx-auto">{t('testimonials.subtitle', locale)}</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 relative">
            <Quote className="absolute top-6 right-8 w-12 h-12 text-wine/10" />

            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <p className="text-lg md:text-xl leading-relaxed text-text-dark font-serif italic mb-8">
              "{locale === 'vi' ? testimonial.text_vi : testimonial.text_en}"
            </p>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-wine/10 rounded-full flex items-center justify-center text-2xl">
                {testimonial.avatar}
              </div>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-text-muted">{testimonial.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={prev}
              className="p-2 rounded-full border border-gray-200 hover:border-wine hover:text-wine transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    i === current ? 'bg-wine w-6' : 'bg-gray-300'
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="p-2 rounded-full border border-gray-200 hover:border-wine hover:text-wine transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
