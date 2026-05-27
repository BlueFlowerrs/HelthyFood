'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from '@/providers/LocaleProvider'
import { createClient } from '@/lib/supabase/client'

const FALLBACK_CAT_IMAGES: Record<string, string> = {
  'protein-powder': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&h=750&fit=crop',
  'healthy-meals': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=750&fit=crop',
  'snacks-bars': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&h=750&fit=crop',
  supplements: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=750&fit=crop',
}
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=750&fit=crop'

function CatTile({ category, index }: { category: Record<string, unknown>; index: number }) {
  const { locale, t } = useLocale()
  const name = (category[`name_${locale}`] as string) || (category.name_vi as string)
  const desc = (category[`description_${locale}`] as string) || (category.description_vi as string)
  const img = (FALLBACK_CAT_IMAGES[category.slug as string] as string) || (category.image_url as string) || DEFAULT_IMG

  return (
    <motion.a
      href={`/shop?category=${category.slug}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: index * 0.08 }}
      className="group relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#223D19] block"
    >
      <img
        src={img}
        alt={name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070B06]/85 via-[#070B06]/30 to-transparent" />
      <div className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <ArrowUpRight className="w-4 h-4" />
      </div>
      <div className="absolute bottom-6 left-6 right-6">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/60 mb-2">
          {(category.product_count as number) ?? 0} sản phẩm
        </div>
        <h3 className="font-serif text-2xl lg:text-3xl text-white leading-tight mb-2">
          {name}
        </h3>
        {desc && (
          <p className="text-xs text-white/65 leading-relaxed line-clamp-2 max-w-xs">
            {desc}
          </p>
        )}
      </div>
    </motion.a>
  )
}

export function Categories() {
  const { t } = useLocale()
  const supabase = createClient()

  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })
      return data ?? []
    },
  })

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#8B2C4C] font-medium mb-3 inline-block">
            {t('categories.label')}
          </span>
          <h2 className="font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-tight text-[#070B06] font-medium mb-5">
            {t('categories.title')}
          </h2>
          <p className="text-[#070B06]/60 leading-relaxed">
            {t('categories.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {(data ?? []).map((c, i) => (
            <CatTile key={c.id} category={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
