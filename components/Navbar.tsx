'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X, User, LayoutDashboard } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useLocale } from '@/providers/LocaleProvider'
import { useUser } from '@/hooks/useUser'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { href: '/', key: 'nav.home' },
  { href: '/shop', key: 'nav.shop' },
  { href: '/about', key: 'nav.about' },
  { href: '/contact', key: 'nav.contact' },
]

function LangSwitch({ dark = false }: { dark?: boolean }) {
  const { locale, setLocale } = useLocale()
  return (
    <div className="inline-flex items-center rounded-full border border-[#070B06]/15 p-0.5 bg-white/50 backdrop-blur-sm">
      {(['vi', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={cn(
            'px-3 py-1 text-[11px] font-medium uppercase tracking-wider rounded-full transition-colors',
            locale === l
              ? 'bg-[#8B2C4C] text-white'
              : dark
                ? 'text-white/60 hover:text-white'
                : 'text-[#070B06]/60 hover:text-[#070B06]',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

export function Navbar({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { t } = useLocale()
  const { user } = useUser()
  const { count: cartCount } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const dark = variant === 'dark' && !scrolled

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[#DAD6D6]/90 backdrop-blur-xl border-b border-[#070B06]/8'
          : dark
            ? 'bg-transparent'
            : 'bg-[#DAD6D6]/60 backdrop-blur-md',
      )}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-[#8B2C4C] flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <span
            className={cn(
              'font-serif text-xl tracking-tight font-medium',
              dark ? 'text-white' : 'text-[#070B06]',
            )}
          >
            HelthyFood
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-9">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative text-[13px] tracking-wide uppercase font-medium transition-colors pb-1',
                  active
                    ? dark
                      ? 'text-[#d4a574]'
                      : 'text-[#8B2C4C]'
                    : dark
                      ? 'text-white/80 hover:text-white'
                      : 'text-[#070B06]/65 hover:text-[#070B06]',
                )}
              >
                {t(item.key)}
                {active && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{
                      backgroundColor: dark ? '#d4a574' : '#8B2C4C',
                    }}
                  />
                )}
              </Link>
            )
          })}
          {user ? null : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/track"
                className={cn(
                  'inline-flex items-center text-[12px] uppercase tracking-wider font-medium px-4 h-9 rounded-full border transition-colors',
                  dark
                    ? 'border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
                    : 'border-[#070B06]/10 text-[#070B06]/60 hover:bg-[#070B06]/5 hover:text-[#070B06]',
                  isActive('/track') &&
                    (dark
                      ? 'text-[#d4a574]'
                      : 'text-[#8B2C4C] border-[#8B2C4C]/30'),
                )}
              >
                Theo dõi đơn
              </Link>
              <Link
                href="/account/signin"
                className={cn(
                  'inline-flex items-center text-[12px] uppercase tracking-wider font-medium px-4 h-9 rounded-full border transition-colors',
                  dark
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-[#070B06]/15 text-[#070B06] hover:bg-[#070B06]/5',
                )}
              >
                {t('nav.signin')}
              </Link>
            </div>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <LangSwitch dark={dark} />
          <Link
            href="/cart"
            className={cn(
              'relative p-2 rounded-full transition-colors',
              dark
                ? 'text-white hover:bg-white/10'
                : 'text-[#070B06] hover:bg-[#070B06]/5',
            )}
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.6} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#8B2C4C] text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <Link
              href="/account"
              className={cn(
                'relative p-2 rounded-full transition-colors',
                dark ? 'text-white hover:bg-white/10' : 'text-[#070B06] hover:bg-[#070B06]/5',
                isActive('/account') && 'text-[#8B2C4C]',
              )}
              aria-label="Account"
            >
              {user.email?.includes('admin') ? (
                <LayoutDashboard className="w-5 h-5" strokeWidth={1.6} />
              ) : (
                <User className="w-5 h-5" strokeWidth={1.6} />
              )}
              {isActive('/account') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#8B2C4C]" />
              )}
            </Link>
          ) : null}
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              'lg:hidden p-2 rounded-full',
              dark ? 'text-white' : 'text-[#070B06]',
            )}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#DAD6D6] border-t border-[#070B06]/10">
          <div className="px-6 py-6 space-y-1">
            {[
              ...NAV_ITEMS,
              ...(user
                ? [{ href: '/account', key: 'nav.account' }]
                : [
                    { href: '/track', key: 'nav.track' },
                    { href: '/account/signin', key: 'nav.signin' },
                  ]),
            ].map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors',
                    active
                      ? 'text-[#8B2C4C] bg-[#8B2C4C]/8'
                      : 'text-[#070B06] hover:bg-[#070B06]/5',
                  )}
                >
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B2C4C] flex-shrink-0" />
                  )}
                  {t(item.key)}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
