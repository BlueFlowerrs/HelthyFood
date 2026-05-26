'use client'

import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'

export function CTABanner() {
  const { locale } = useLocale()

  return (
    <section className="py-20 bg-wine relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-wine-dark/30 rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-wine-light/20 rounded-full" />

      <div className="container-main relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
            {t('cta.title', locale)}
          </h2>
          <p className="text-lg text-white/70 mb-8">
            {t('cta.subtitle', locale)}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-white text-wine hover:bg-gray-100 gap-2"
              >
                {t('cta.button', locale)}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-white/60 text-sm">
            <Check className="w-4 h-4 text-tan" />
            <span>{t('cta.guarantee', locale)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
