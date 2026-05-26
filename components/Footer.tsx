'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { subscribeNewsletterAction } from '@/app/actions/newsletter'
import { useState } from 'react'
import { toast } from 'sonner'

const quickLinks = [
  { href: '/shop', labelKey: 'nav.shop' },
  { href: '/about', labelKey: 'nav.about' },
  { href: '/contact', labelKey: 'nav.contact' },
  { href: '/track', labelKey: 'nav.trackOrder' },
]

const customerService = [
  { href: '/about#faq', labelKey: 'footer.faq' },
  { href: '/about#shipping', labelKey: 'footer.shipping' },
  { href: '/about#returns', labelKey: 'footer.returns' },
  { href: '/about#privacy', labelKey: 'footer.privacy' },
]

export function Footer() {
  const pathname = usePathname()
  const { locale } = useLocale()
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribing(true)
    const result = await subscribeNewsletterAction(email)
    setSubscribing(false)
    if (result.success) {
      toast.success(
        locale === 'vi'
          ? 'Đăng ký nhận tin thành công!'
          : 'Newsletter subscription successful!'
      )
      setEmail('')
    } else {
      toast.error(result.error || (locale === 'vi' ? 'Đã xảy ra lỗi.' : 'An error occurred.'))
    }
  }

  return (
    <footer className="bg-brand-green-dark text-white/80">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-wine rounded-full flex items-center justify-center">
                <span className="text-white font-serif font-bold text-lg">H</span>
              </div>
              <span className="font-serif text-xl font-semibold text-white">HelthyFood</span>
            </div>
            <p className="text-sm leading-relaxed">
              {t('footer.description', locale)}
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-wine transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-wine transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-wine transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('footer.quickLinks', locale)}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {t(link.labelKey, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('footer.customerService', locale)}
            </h3>
            <ul className="space-y-2">
              {customerService.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {t(link.labelKey, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('footer.contact', locale)}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>123 Nguyễn Trãi, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+84901234567" className="hover:text-white">
                  0901 234 567
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:contact@helthyfood.vn" className="hover:text-white">
                  contact@helthyfood.vn
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm mb-2">{t('footer.newsletter', locale)}</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.newsletterPlaceholder', locale)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm placeholder:text-white/40 focus:outline-none focus:border-wine text-white"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-4 py-2 bg-wine text-white text-sm font-medium rounded-lg hover:bg-wine-dark transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {subscribing
                    ? (locale === 'vi' ? '...' : '...')
                    : t('footer.subscribe', locale)}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">{t('footer.rights', locale)}</p>
          <div className="flex gap-6 text-sm">
            <Link href="/about#terms" className="hover:text-white transition-colors">
              {t('footer.terms', locale)}
            </Link>
            <Link href="/about#privacy" className="hover:text-white transition-colors">
              {t('footer.privacy', locale)}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
