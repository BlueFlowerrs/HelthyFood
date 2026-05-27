'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'

const ALL_TESTIMONIALS = [
  {
    vi: 'Macro chuẩn xác, vị ngon, đóng gói cao cấp. HelthyFood thực sự thay đổi cách tôi nhìn về thực phẩm fitness.',
    en: 'Precise macros, great taste, premium packaging. HelthyFood truly changed how I think about fitness food.',
    name: 'Nguyễn Minh Hoàng',
    role: 'Athlete · Hà Nội',
    product: 'Whey Isolate Vani',
    grad: 'from-[#8B2C4C] to-[#5a1d31]',
  },
  {
    vi: 'Tôi đã dùng nhiều brand whey nhưng chất lượng của HelthyFood vượt xa kỳ vọng. Đáng giá từng đồng.',
    en: "I've tried many whey brands but HelthyFood's quality far exceeds expectations. Worth every penny.",
    name: 'Trần Thu Hà',
    role: 'Personal Trainer · TP.HCM',
    product: 'Plant Protein Berry',
    grad: 'from-[#405C36] to-[#223D19]',
  },
  {
    vi: 'Meal prep tuần của HelthyFood giúp tôi tiết kiệm 6 giờ mỗi tuần mà vẫn đảm bảo dinh dưỡng chuẩn.',
    en: "HelthyFood's weekly meal prep saves me 6 hours a week while keeping my nutrition perfectly on track.",
    name: 'Lê Đức Anh',
    role: 'Bodybuilder · Đà Nẵng',
    product: 'Weekly Bulk Pack',
    grad: 'from-[#d4a574] to-[#a07a3d]',
  },
  {
    vi: 'Keto meal giúp tôi giảm 8kg trong 2 tháng mà không cảm thấy đói. Kết quả ngoài sức tưởng tượng!',
    en: 'Keto meals helped me lose 8kg in 2 months without feeling hungry. Results beyond imagination!',
    name: 'Phạm Lan Phương',
    role: 'Fitness Enthusiast · Hải Phòng',
    product: 'Weekly Keto Pack',
    grad: 'from-[#8B2C4C] to-[#405C36]',
  },
  {
    vi: 'BCAA hòa tan nhanh, hương cam cực ngon, không đắng. Đặt mua lần thứ 5 rồi mà vẫn thấy xứng đáng.',
    en: 'BCAA dissolves fast, amazing citrus flavor, no bitterness. On my 5th order and still loving it.',
    name: 'Võ Thanh Tùng',
    role: 'CrossFit Athlete · TP.HCM',
    product: 'BCAA Citrus',
    grad: 'from-[#223D19] to-[#070B06]',
  },
  {
    vi: 'Granola hữu cơ giòn vừa, không quá ngọt, kết hợp sữa hạnh nhân ăn sáng thật hoàn hảo.',
    en: 'Organic granola is perfectly crunchy, not too sweet, pairs perfectly with almond milk for breakfast.',
    name: 'Ngô Thị Mai',
    role: 'Nutrition Coach · Cần Thơ',
    product: 'Granola Hữu Cơ',
    grad: 'from-[#d4a574] to-[#8B2C4C]',
  },
  {
    vi: 'Pre-workout Storm cho tôi năng lượng cả buổi tập mà không bị crash sau đó. Hiệu quả cực kỳ.',
    en: 'Pre-workout Storm gives me sustained energy throughout training without any post-session crash.',
    name: 'Bùi Quang Khải',
    role: 'Powerlifter · Hà Nội',
    product: 'Pre-Workout Storm',
    grad: 'from-[#405C36] to-[#d4a574]',
  },
  {
    vi: 'Nước ép xanh lạnh giúp tôi detox sau buổi training nặng. Tươi ngon, sạch, không chất bảo quản.',
    en: 'Cold-pressed green juice helps me detox after heavy training. Fresh, clean, no preservatives.',
    name: 'Đặng Thùy Linh',
    role: 'Yoga Instructor · TP.HCM',
    product: 'Nước Ép Xanh Lạnh',
    grad: 'from-[#8B2C4C] to-[#223D19]',
  },
]

export function Testimonials() {
  const { locale, t } = useLocale()
  const [activeIdx, setActiveIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const total = ALL_TESTIMONIALS.length

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setActiveIdx((i) => (i + 1) % total), 3000)
    return () => clearInterval(id)
  }, [paused, total])

  useEffect(() => {
    if (!scrollRef.current) return
    const cards = scrollRef.current.querySelectorAll('[data-tc]')
    const card = cards[activeIdx] as HTMLElement
    if (!card) return
    const cw = scrollRef.current.offsetWidth
    scrollRef.current.scrollTo({
      left: card.offsetLeft - cw / 2 + card.offsetWidth / 2,
      behavior: 'smooth',
    })
  }, [activeIdx])

  const prev = () => setActiveIdx((i) => (i - 1 + total) % total)
  const next = () => setActiveIdx((i) => (i + 1) % total)

  return (
    <section className="bg-white py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8B2C4C] font-medium mb-3 inline-block">
              {t('testimonials.label')}
            </span>
            <h2 className="font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-tight text-[#070B06] font-medium">
              {t('testimonials.title')}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="w-12 h-12 rounded-full border border-[#070B06]/15 flex items-center justify-center text-[#070B06] hover:bg-[#070B06] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="w-12 h-12 rounded-full border border-[#070B06]/15 flex items-center justify-center text-[#070B06] hover:bg-[#070B06] hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {ALL_TESTIMONIALS.map((item, i) => {
            const isActive = i === activeIdx
            return (
              <div
                key={item.name + i}
                data-tc=""
                className="flex-shrink-0 w-[300px] sm:w-[340px] cursor-pointer"
                onClick={() => setActiveIdx(i)}
              >
                <motion.div
                  className="h-full rounded-3xl p-7 relative border-2"
                  style={{
                    borderColor: 'rgba(139, 44, 76, 0)',
                  }}
                  animate={{
                    backgroundColor: isActive ? '#070B06' : '#F5F3F3',
                    borderColor: isActive ? 'rgba(139, 44, 76, 1)' : 'rgba(139, 44, 76, 0)',
                    scale: isActive ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.45 }}
                >
                  <Quote
                    className="absolute top-6 right-6 w-7 h-7 transition-colors duration-500"
                    style={{
                      color: isActive ? 'rgba(139,44,76,0.3)' : 'rgba(7,11,6,0.08)',
                    }}
                  />
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-[#d4a574] text-[#d4a574]" />
                    ))}
                  </div>
                  <p
                    className="font-serif text-base leading-relaxed italic mb-5 line-clamp-4 transition-colors duration-500"
                    style={{
                      color: isActive ? 'rgba(255,255,255,0.95)' : '#070B06',
                    }}
                  >
                    &ldquo;{locale === 'en' ? item.en : item.vi}&rdquo;
                  </p>
                  <div
                    className="text-[10px] uppercase tracking-wider mb-4 transition-colors duration-500 font-medium"
                    style={{ color: isActive ? '#d4a574' : '#8B2C4C' }}
                  >
                    {item.product}
                  </div>
                  <div
                    className="flex items-center gap-3 pt-4 border-t transition-colors duration-500"
                    style={{
                      borderColor: isActive
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(7,11,6,0.08)',
                    }}
                  >
                    <div
                      className={`w-9 h-9 rounded-full bg-gradient-to-br ${item.grad} flex-shrink-0`}
                    />
                    <div>
                      <div
                        className="text-sm font-medium leading-none transition-colors duration-500"
                        style={{ color: isActive ? 'white' : '#070B06' }}
                      >
                        {item.name}
                      </div>
                      <div
                        className="text-[11px] mt-1 transition-colors duration-500"
                        style={{
                          color: isActive
                            ? 'rgba(255,255,255,0.5)'
                            : 'rgba(7,11,6,0.5)',
                        }}
                      >
                        {item.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          {ALL_TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setActiveIdx(i)} aria-label={`Review ${i + 1}`}>
              <motion.div
                className="rounded-full"
                animate={{
                  width: i === activeIdx ? 24 : 8,
                  backgroundColor: i === activeIdx ? '#8B2C4C' : 'rgba(7,11,6,0.15)',
                }}
                transition={{ duration: 0.3 }}
                style={{ height: 8 }}
              />
            </button>
          ))}
        </div>

        <div className="mt-5 max-w-xs mx-auto h-0.5 bg-[#070B06]/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#8B2C4C] rounded-full"
            key={`${activeIdx}-${paused}`}
            initial={{ width: '0%' }}
            animate={{ width: paused ? '0%' : '100%' }}
            transition={{ duration: paused ? 0 : 3, ease: 'linear' }}
          />
        </div>
      </div>
    </section>
  )
}
