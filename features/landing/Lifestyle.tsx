'use client'

import { Dumbbell, Clock, Apple, UtensilsCrossed } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'

const moments = [
  { icon: Dumbbell, bg: 'bg-wine/10', accent: 'text-wine', key: 'post' },
  { icon: Clock, bg: 'bg-brand-green/10', accent: 'text-brand-green', key: 'pre' },
  { icon: Apple, bg: 'bg-amber-100', accent: 'text-amber-600', key: 'snack' },
  { icon: UtensilsCrossed, bg: 'bg-tan/10', accent: 'text-tan', key: 'meal' },
]

export function Lifestyle() {
  const { locale } = useLocale()

  return (
    <section className="py-20 bg-white">
      <div className="container-main">
        <div className="text-center mb-12">
          <h2 className="section-title">{t('lifestyle.title', locale)}</h2>
          <p className="section-subtitle mx-auto">{t('lifestyle.subtitle', locale)}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {moments.map(({ icon: Icon, bg, accent, key }) => (
            <div
              key={key}
              className="text-center p-8 rounded-3xl bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              <div className={`w-20 h-20 ${bg} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-9 h-9 ${accent}`} />
              </div>
              <p className="font-serif text-lg font-semibold">{t(`lifestyle.${key}`, locale)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
