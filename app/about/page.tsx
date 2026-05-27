'use client'

import { motion } from 'framer-motion'
import { Leaf, Award, Users, Sparkles } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { ASSETS } from '@/lib/assets'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function AboutPage() {
  const { t } = useLocale()
  return (
    <>
      <Navbar />
      <main className="bg-[#DAD6D6]">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 -top-32 opacity-30">
          <img
            src={ASSETS.heroBackground}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#DAD6D6]" />
        </div>
        <div className="relative max-w-[1100px] mx-auto px-6 lg:px-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] uppercase tracking-[0.2em] text-[#8B2C4C] font-medium mb-3 inline-block"
          >
            {t('nav.about') || 'Câu chuyện HelthyFood'}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.02] tracking-tight text-[#070B06] font-medium mb-6"
          >
            {t('about.storyTitle') || 'Dinh dưỡng'}{' '}
            <em className="italic text-[#8B2C4C]">{t('about.storyTitleAccent') || 'là nghệ thuật'}</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#070B06]/70 max-w-2xl mx-auto leading-relaxed"
          >
            {t('about.storyDesc') || 'HelthyFood ra đời từ niềm tin rằng dinh dưỡng cao cấp không phải đặc quyền — mà là quyền của mỗi người theo đuổi cuộc sống mạnh mẽ.'}
          </motion.p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="font-serif text-4xl lg:text-5xl text-[#070B06] mb-6 leading-tight">
                {t('about.missionTitle') || 'Sứ mệnh của chúng tôi'}
              </h2>
              <p className="text-[#070B06]/70 leading-relaxed mb-5">
                {t('about.missionDesc1') || 'Chúng tôi mang đến những sản phẩm dinh dưỡng cao cấp được tuyển chọn từ nguồn nguyên liệu hữu cơ, kết hợp công nghệ sản xuất hiện đại và sự am hiểu sâu sắc về khoa học thể thao.'}
              </p>
              <p className="text-[#070B06]/70 leading-relaxed">
                {t('about.missionDesc2') || 'Mỗi sản phẩm là một cam kết về chất lượng, sự minh bạch và niềm đam mê với lối sống fitness lành mạnh.'}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="aspect-square rounded-3xl overflow-hidden bg-[#223D19]"
            >
              <img
                src={ASSETS.lifestyle}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values grid */}
      <section className="py-20 lg:py-28 bg-[#DAD6D6]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#070B06]/10 border border-[#070B06]/10 rounded-3xl overflow-hidden">
            {[
              {
                icon: Leaf,
                title: t('about.val1Title') || '100% Hữu Cơ',
                desc: t('about.val1Desc') || 'Nguyên liệu đạt chuẩn quốc tế',
              },
              {
                icon: Award,
                title: t('about.val2Title') || 'Chất Lượng Cao',
                desc: t('about.val2Desc') || 'Kiểm định nghiêm ngặt',
              },
              {
                icon: Users,
                title: t('about.val3Title') || '15K+ Khách Hàng',
                desc: t('about.val3Desc') || 'Cộng đồng tin dùng',
              },
              {
                icon: Sparkles,
                title: t('about.val4Title') || 'Cao Cấp',
                desc: t('about.val4Desc') || 'Trải nghiệm sang trọng',
              },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#DAD6D6] p-8 hover:bg-white transition-colors"
              >
                <v.icon className="w-7 h-7 text-[#8B2C4C] mb-4" />
                <h3 className="font-serif text-xl text-[#070B06] mb-1">
                  {v.title}
                </h3>
                <p className="text-xs text-[#070B06]/55">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}
