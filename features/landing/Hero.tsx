'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { cn } from '@/lib/cn'

const ThreeScene = dynamic(() => import('./ThreeScene'), {
  ssr: false,
  loading: () => (
    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(135deg, #223D19 0%, #070B06 50%, #1a0a14 100%)' }}
    />
  ),
})

export function Hero() {
  const { locale } = useLocale()

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Three.js Background */}
      <div className="absolute inset-0 z-0">
        <ThreeScene />
        <div className="absolute inset-0 bg-gradient-to-r from-[#223D19]/80 via-transparent to-[#070B06]/60" />
      </div>

      {/* Content */}
      <div className="container-main relative z-10 py-20 md:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-fade-in',
              'bg-wine/20 border border-wine/30 backdrop-blur-sm'
            )}
          >
            <Sparkles className="w-4 h-4 text-wine" />
            <span className="text-wine text-sm font-medium">
              {t('hero.badge', locale)}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-6 animate-slide-up">
            {t('hero.title', locale).split('\n').map((line, i) => (
              <span
                key={i}
                className={cn(
                  'block',
                  i === 0 && 'text-white',
                  i === 1 && 'text-tan',
                  i === 2 && 'text-wine'
                )}
              >
                {line}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/70 max-w-xl mb-10 animate-slide-up" style={{ animationDelay: '150ms' }}>
            {t('hero.subtitle', locale)}
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap gap-4 animate-slide-up"
            style={{ animationDelay: '300ms' }}
          >
            <Link href="/shop">
              <Button size="lg" className="gap-2 bg-wine hover:bg-wine-dark">
                {t('hero.cta', locale)}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
              >
                {t('hero.ctaSecondary', locale)}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div
            className="flex gap-8 mt-16 pt-8 border-t border-white/10 animate-slide-up"
            style={{ animationDelay: '450ms' }}
          >
            {[
              { value: '24+', label: locale === 'vi' ? 'Sản phẩm' : 'Products' },
              { value: '10K+', label: locale === 'vi' ? 'Khách hàng' : 'Customers' },
              { value: '4.9★', label: locale === 'vi' ? 'Đánh giá' : 'Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#DAD6D6] to-transparent z-10" />
    </section>
  )
}
