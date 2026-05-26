'use client'

import { Shield, Leaf, Truck, Award } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'

const benefitIcons = [Shield, Leaf, Truck, Award]
const benefitKeys = [
  { titleKey: 'benefits.quality.title', descKey: 'benefits.quality.desc' },
  { titleKey: 'benefits.protein.title', descKey: 'benefits.protein.desc' },
  { titleKey: 'benefits.delivery.title', descKey: 'benefits.delivery.desc' },
  { titleKey: 'benefits.certified.title', descKey: 'benefits.certified.desc' },
]

export function Benefits() {
  const { locale } = useLocale()

  return (
    <section className="py-20 bg-brand-green-dark text-white">
      <div className="container-main">
        <div className="text-center mb-12">
          <h2 className="section-title text-white">{t('benefits.title', locale)}</h2>
          <p className="section-subtitle text-white/60 mx-auto">
            {t('benefits.subtitle', locale)}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {benefitKeys.map(({ titleKey, descKey }, i) => {
            const Icon = benefitIcons[i]
            return (
              <div
                key={titleKey}
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-14 h-14 bg-wine/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-tan" />
                </div>
                <h3 className="font-semibold mb-2 text-white">{t(titleKey, locale)}</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {t(descKey, locale)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
