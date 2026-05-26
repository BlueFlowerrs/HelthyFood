'use client'

import { Flame, Zap, Wheat, Droplets } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'

const macros = [
  { key: 'calories', icon: Flame, color: 'bg-orange-500', value: '1,200-2,500', unit: 'kcal' },
  { key: 'protein', icon: Zap, color: 'bg-wine', value: '20-50', unit: 'g/prod' },
  { key: 'carbs', icon: Wheat, color: 'bg-amber-500', value: '30-100', unit: 'g/prod' },
  { key: 'fat', icon: Droplets, color: 'bg-brand-green', value: '5-25', unit: 'g/prod' },
]

export function MacroShowcase() {
  const { locale } = useLocale()

  return (
    <section className="py-20 bg-bg-main overflow-hidden">
      <div className="container-main">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <h2 className="section-title text-balance">
              {t('macro.title', locale).split('\n').map((line, i) => (
                <span key={i} className={i === 1 ? 'text-wine' : ''}>
                  {line}
                  {i < 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="section-subtitle mt-6">
              {t('macro.subtitle', locale)}
            </p>
          </div>

          {/* Macro Cards */}
          <div className="grid grid-cols-2 gap-4">
            {macros.map(({ key, icon: Icon, color, value, unit }) => (
              <div
                key={key}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
                  {t(`macro.${key}`, locale)}
                </p>
                <p className="text-2xl font-bold font-serif">
                  {value}
                  <span className="text-sm font-normal text-text-muted ml-1">{unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
