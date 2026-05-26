'use client'

import { cn } from '@/lib/cn'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { createClient } from '@/lib/supabase/client'

export function Categories() {
  const { locale } = useLocale()
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
    <section className="py-20 bg-white">
      <div className="container-main">
        <div className="text-center mb-12">
          <h2 className="section-title">{t('categories.title', locale)}</h2>
          <p className="section-subtitle mx-auto">{t('categories.subtitle', locale)}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {data?.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group text-center"
            >
              <div
                className={cn(
                  'relative h-28 md:h-36 rounded-2xl overflow-hidden mb-3',
                  'bg-gradient-to-br from-brand-green/10 to-brand-green-dark/10',
                  'group-hover:from-brand-green/20 group-hover:to-brand-green-dark/20',
                  'transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg'
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={locale === 'vi' ? cat.name_vi : cat.name_en}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🌿
                  </div>
                )}
              </div>
              <h3 className="font-medium text-sm group-hover:text-wine transition-colors">
                {locale === 'vi' ? cat.name_vi : cat.name_en}
              </h3>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/shop">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-wine hover:text-wine-dark transition-colors">
              {t('categories.viewAll', locale)}
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
