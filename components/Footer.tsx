'use client'

import Link from 'next/link'
import { Leaf, Instagram, Facebook, Youtube, ArrowRight } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'

export function Footer() {
  const { t } = useLocale()

  const cols = [
    {
      title: t('footer.explore'),
      links: [
        { label: t('nav.home'), href: '/' },
        { label: t('nav.shop'), href: '/shop' },
        { label: t('nav.about'), href: '/about' },
        { label: t('nav.contact'), href: '/contact' },
      ],
    },
    {
      title: t('footer.support'),
      links: [
        { label: t('nav.account'), href: '/account' },
        { label: t('nav.orders'), href: '/account/orders' },
        { label: t('nav.cart'), href: '/cart' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.privacy'), href: '#' },
        { label: t('footer.terms'), href: '#' },
      ],
    },
  ]

  return (
    <footer className="bg-[#070B06] text-white/80 pt-20 pb-10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-white/10">
          {/* Brand block */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#8B2C4C] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <span className="font-serif text-2xl text-white">HelthyFood</span>
            </Link>
            <p className="text-sm text-white/60 max-w-sm leading-relaxed mb-6">
              {t('footer.tagline')}
            </p>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50 mb-3">
                {t('footer.newsletter')}
              </p>
              <p className="text-sm text-white/70 mb-4 max-w-sm">
                {t('footer.newsletterDesc')}
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center max-w-sm rounded-full border border-white/15 bg-white/5 backdrop-blur-sm overflow-hidden"
              >
                <input
                  type="email"
                  placeholder={t('footer.emailPlaceholder')}
                  className="flex-1 bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/40 outline-none"
                  suppressHydrationWarning
                />
                <button
                  type="submit"
                  className="bg-[#8B2C4C] hover:bg-[#7a2542] text-white px-5 py-3 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] uppercase tracking-[0.18em] text-white mb-5 font-medium">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-xs text-white/40">
          <p>© 2026 HelthyFood. {t('footer.rights')}</p>
          <div className="flex items-center gap-5">
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-white transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-white transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="hover:text-white transition-colors"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
