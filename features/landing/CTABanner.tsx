'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from '@/providers/LocaleProvider'
import { Button } from '@/components/ui/Button'

export function CTABanner() {
  const { t } = useLocale()

  return (
    <section className="bg-[#DAD6D6] py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl bg-[#223D19] py-20 lg:py-28 px-8 lg:px-16"
        >
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                'radial-gradient(circle at 80% 50%, rgba(139,44,76,0.4), transparent 60%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          <div className="relative max-w-3xl">
            <h2 className="font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] tracking-tight text-white font-medium mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-xl">
              {t('cta.subtitle')}
            </p>
            <Link href="/shop">
              <Button variant="primary" size="xl" className="gap-2">
                {t('cta.button')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="absolute bottom-8 right-8 hidden md:block">
            <div className="grid grid-cols-6 gap-2 opacity-30">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-white" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
