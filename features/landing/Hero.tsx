'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from '@/providers/LocaleProvider'
import { Button } from '@/components/ui/Button'
import ThreeScene from './ThreeScene'

const ACCENT_VI = ['Sức Mạnh', 'Thể Lực', 'Phong Độ', 'Bản Thân', 'Tương Lai']
const ACCENT_EN = ['Greatness', 'Power', 'Potential', 'Body', 'Future']

const TESTIMONIALS = [
  {
    vi: 'Sản phẩm tốt nhất tôi từng dùng. Macro chuẩn xác, vị ngon, đóng gói đẹp.',
    en: "Best product I've ever used. Precise macros, great taste, premium packaging.",
    name: 'Minh Hoàng',
    role: 'Professional Athlete',
    grad: 'from-[#8B2C4C] to-[#5a1d31]',
  },
  {
    vi: 'Meal prep tuần của HelthyFood tiết kiệm cho tôi 6 giờ mỗi tuần mà vẫn đủ dinh dưỡng.',
    en: 'HelthyFood weekly meal prep saves me 6 hours a week while hitting all my macros.',
    name: 'Thu Hà',
    role: 'Personal Trainer',
    grad: 'from-[#405C36] to-[#223D19]',
  },
  {
    vi: 'Protein isolate ngon nhất thị trường. Không bloat, hòa tan tốt, tôi đặt mãi rồi.',
    en: 'Best protein isolate on the market. No bloat, mixes perfectly — reordering forever.',
    name: 'Đức Anh',
    role: 'Bodybuilder · TP.HCM',
    grad: 'from-[#d4a574] to-[#a07a3d]',
  },
  {
    vi: 'Keto meal của HelthyFood giúp tôi giảm 8kg trong 2 tháng mà không thấy đói.',
    en: 'HelthyFood keto meals helped me lose 8kg in 2 months without ever feeling hungry.',
    name: 'Lan Phương',
    role: 'Fitness Enthusiast · Hà Nội',
    grad: 'from-[#8B2C4C] to-[#405C36]',
  },
]

export function Hero() {
  const { locale, t } = useLocale()
  const [accentIdx, setAccentIdx] = useState(0)
  const [testimonialIdx, setTestimonialIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setAccentIdx((i) => (i + 1) % ACCENT_VI.length)
    }, 2500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  const accentWords = locale === 'en' ? ACCENT_EN : ACCENT_VI
  const testimonial = TESTIMONIALS[testimonialIdx]
  const avatarGrads = [
    'from-[#8B2C4C] to-[#5a1d31]',
    'from-[#405C36] to-[#223D19]',
    'from-[#d4a574] to-[#a07a3d]',
    'from-[#8B2C4C] to-[#405C36]',
  ]

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#070B06] via-[#0d1409] to-[#223D19]">
      <div className="absolute inset-0">
        <ThreeScene />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 70% 30%, rgba(139,44,76,0.18), transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(64,92,54,0.25), transparent 50%)',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 pt-32 pb-20 min-h-screen flex items-center">
        <div className="w-full grid lg:grid-cols-12 gap-10 items-center">
          {/* Left: Headline + CTA + Stats */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/8 backdrop-blur-md border border-white/15 mb-8"
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#8B2C4C]"
                style={{ boxShadow: '0 0 6px #8B2C4C' }}
              />
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/85 font-medium">
                {t('hero.tagline')}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="font-serif text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] tracking-tight text-white font-medium mb-6"
            >
              <div>{locale === 'en' ? 'Fuel Your' : 'Nuôi Dưỡng'}</div>

              <div className="relative overflow-hidden" style={{ height: '1.1em' }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={accentIdx}
                    initial={{ y: '100%', opacity: 0, filter: 'blur(6px)' }}
                    animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: '-100%', opacity: 0, filter: 'blur(6px)' }}
                    transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute inset-0 italic text-[#d4a574] leading-none"
                    style={{ display: 'block', lineHeight: '1.1' }}
                  >
                    {accentWords[accentIdx]}
                  </motion.span>
                </AnimatePresence>
              </div>

              {locale !== 'en' && <div>Của Bạn</div>}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-base lg:text-lg text-white/70 max-w-lg leading-relaxed mb-10"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex flex-wrap items-center gap-4 mb-16"
            >
              <Link href="/shop">
                <Button variant="primary" size="xl" className="gap-2">
                  {t('hero.cta')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outlineLight" size="xl">
                  {t('hero.ctaSecondary')}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-3 gap-6 max-w-lg pt-8 border-t border-white/10"
            >
              {[
                { label: t('hero.stat1Label'), value: t('hero.stat1Value') },
                { label: t('hero.stat2Label'), value: t('hero.stat2Value') },
                { label: t('hero.stat3Label'), value: t('hero.stat3Value') },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-serif text-3xl text-white mb-1">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-wider text-white/50 leading-snug">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Rotating testimonial glass card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="lg:col-span-5 hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#8B2C4C]/30 to-[#405C36]/30 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl bg-white/8 backdrop-blur-xl border border-white/15 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex -space-x-2">
                    {avatarGrads.map((grad, i) => (
                      <div
                        key={i}
                        className={`w-9 h-9 rounded-full border-2 border-[#070B06] bg-gradient-to-br ${grad}`}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5 mb-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3 h-3 fill-[#d4a574] text-[#d4a574]" />
                      ))}
                    </div>
                    <p className="text-[11px] text-white/60">15,000+ gymers</p>
                  </div>
                </div>

                <div className="relative" style={{ minHeight: 148 }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={testimonialIdx}
                      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="absolute inset-0"
                    >
                      <p className="font-serif text-lg text-white/95 leading-relaxed italic mb-5">
                        &ldquo;{locale === 'en' ? testimonial.en : testimonial.vi}&rdquo;
                      </p>
                      <div className="flex items-center justify-between pt-5 border-t border-white/10">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${testimonial.grad} flex-shrink-0`}
                          />
                          <div>
                            <p className="text-sm font-medium text-white leading-none">
                              {testimonial.name}
                            </p>
                            <p className="text-[11px] text-white/50 mt-0.5">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/shop"
                          className="text-[11px] uppercase tracking-wider text-[#d4a574] hover:text-white transition-colors"
                        >
                          Shop →
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-1.5 justify-center mt-4 pt-3 border-t border-white/8">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialIdx(i)}
                      aria-label={`Review ${i + 1}`}
                      className="py-1"
                    >
                      <motion.div
                        className="rounded-full bg-white/30"
                        animate={{
                          width: i === testimonialIdx ? 20 : 6,
                          backgroundColor:
                            i === testimonialIdx ? '#d4a574' : 'rgba(255,255,255,0.3)',
                        }}
                        transition={{ duration: 0.3 }}
                        style={{ height: 6 }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
      </motion.div>
    </section>
  )
}
