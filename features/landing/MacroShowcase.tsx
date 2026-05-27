'use client'

import { motion } from 'framer-motion'
import { useLocale } from '@/providers/LocaleProvider'

const macros = [
  { key: 'protein', value: 38, color: '#8B2C4C', percent: 38 },
  { key: 'carbs', value: 42, color: '#405C36', percent: 42 },
  { key: 'fat', value: 18, color: '#d4a574', percent: 18 },
]

export function MacroShowcase() {
  const { t } = useLocale()

  return (
    <section className="bg-[#070B06] text-white py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#d4a574] font-medium mb-3 inline-block">
              {t('macro.label')}
            </span>
            <h2 className="font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-tight text-white font-medium mb-6">
              {t('macro.title')}
            </h2>
            <p className="text-white/65 leading-relaxed mb-10 max-w-md">
              {t('macro.subtitle')}
            </p>
            <div className="space-y-7">
              {macros.map((m, i) => (
                <motion.div
                  key={m.key}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                >
                  <div className="flex items-end justify-between mb-2">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-3xl text-white font-medium">
                        {m.value}g
                      </span>
                      <span className="text-xs uppercase tracking-wider text-white/50">
                        {t(`macro.${m.key}`)}
                      </span>
                    </div>
                    <span className="text-xs text-white/40">{m.percent}%</span>
                  </div>
                  <div className="h-px bg-white/10 relative">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.percent * 1.8}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1.2,
                        delay: 0.3 + i * 0.15,
                        ease: 'easeOut',
                      }}
                      className="absolute inset-y-0 left-0 h-px"
                      style={{ backgroundColor: m.color, height: 2, top: -0.5 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 gap-6">
              <div>
                <div className="font-serif text-4xl text-white">485</div>
                <div className="text-xs uppercase tracking-wider text-white/50 mt-1">
                  {t('macro.calories')}
                </div>
              </div>
              <div>
                <div className="font-serif text-4xl text-white">
                  {t('macro.avgPerMeal')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Decorative right panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="relative aspect-square max-w-md mx-auto"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#8B2C4C]/30 via-transparent to-[#405C36]/30 blur-3xl" />
            <svg viewBox="0 0 200 200" className="relative w-full h-full">
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8B2C4C" />
                  <stop offset="100%" stopColor="#5a1d31" />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#405C36" />
                  <stop offset="100%" stopColor="#223D19" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="90" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
              <circle cx="100" cy="100" r="70" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
              <circle cx="100" cy="100" r="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />

              <motion.circle
                cx="100" cy="100" r="85"
                stroke="url(#g1)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="534"
                initial={{ strokeDashoffset: 534 }}
                whileInView={{ strokeDashoffset: 534 - (534 * 38) / 100 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
                transform="rotate(-90 100 100)"
              />
              <motion.circle
                cx="100" cy="100" r="65"
                stroke="url(#g2)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="408"
                initial={{ strokeDashoffset: 408 }}
                whileInView={{ strokeDashoffset: 408 - (408 * 42) / 100 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, delay: 0.2, ease: 'easeOut' }}
                transform="rotate(-90 100 100)"
              />
              <motion.circle
                cx="100" cy="100" r="45"
                stroke="#d4a574"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="282"
                initial={{ strokeDashoffset: 282 }}
                whileInView={{ strokeDashoffset: 282 - (282 * 18) / 100 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, delay: 0.4, ease: 'easeOut' }}
                transform="rotate(-90 100 100)"
              />
              <text x="100" y="98" textAnchor="middle" className="fill-white font-serif" fontSize="22">485</text>
              <text x="100" y="118" textAnchor="middle" className="fill-white/50" fontSize="8" letterSpacing="2">CALORIES</text>
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
