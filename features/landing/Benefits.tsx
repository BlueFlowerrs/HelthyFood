'use client'

import { motion } from 'framer-motion'
import { Shield, Leaf, Truck, Award } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'

export function Benefits() {
  const { t } = useLocale()

  const items = [
    { icon: Shield, key: 'item1' },
    { icon: Leaf, key: 'item2' },
    { icon: Truck, key: 'item3' },
  ]

  return (
    <section className="bg-[#DAD6D6] py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mb-16"
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#8B2C4C] font-medium mb-3 inline-block">
            {t('benefits.label')}
          </span>
          <h2 className="font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-tight text-[#070B06] font-medium mb-5">
            {t('benefits.title')}
          </h2>
          <p className="text-[#070B06]/60 max-w-xl leading-relaxed">
            {t('benefits.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#070B06]/10 border border-[#070B06]/10 rounded-3xl overflow-hidden">
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                className="bg-[#DAD6D6] p-10 lg:p-12 hover:bg-white transition-colors duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#223D19] text-white flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" strokeWidth={1.6} />
                </div>
                <h3 className="font-serif text-2xl text-[#070B06] mb-3 leading-tight">
                  {t(`benefits.${item.key}Title`)}
                </h3>
                <p className="text-sm text-[#070B06]/65 leading-relaxed">
                  {t(`benefits.${item.key}Desc`)}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
