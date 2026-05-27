'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useLocale } from '@/providers/LocaleProvider'

const LIFESTYLE_IMAGE = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&h=1080&fit=crop'

export function Lifestyle() {
  const { t } = useLocale()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  return (
    <section
      ref={ref}
      className="relative h-[80vh] min-h-[600px] overflow-hidden bg-[#070B06]"
    >
      <motion.div
        style={{ y }}
        className="absolute inset-0 -top-[10%] -bottom-[10%]"
      >
        <img
          src={LIFESTYLE_IMAGE}
          alt="Healthy lifestyle"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070B06]/85 via-[#070B06]/40 to-[#070B06]/85" />
      </motion.div>

      <div className="relative z-10 h-full max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-3xl"
        >
          <div className="text-7xl font-serif text-[#d4a574]/70 mb-4 leading-none">
            &ldquo;
          </div>
          <p className="font-serif text-[clamp(2rem,4vw,3.5rem)] leading-[1.15] text-white font-light italic mb-8">
            {t('lifestyle.quote')}
          </p>
          <p className="text-sm uppercase tracking-[0.25em] text-white/60">
            {t('lifestyle.author')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
