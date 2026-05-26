'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useLocale } from '@/providers/LocaleProvider'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/cn'
import { t } from '@/lib/i18n/translations'

const navLinks = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/shop', labelKey: 'nav.shop' },
  { href: '/about', labelKey: 'nav.about' },
  { href: '/contact', labelKey: 'nav.contact' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()
  const { locale, toggleLocale } = useLocale()
  const { items } = useCartStore()
  const { user } = useUser()
  const supabase = createClient()

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setIsAdmin(data?.role === 'admin'))
    } else {
      setIsAdmin(false)
    }
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm py-2'
            : 'bg-transparent py-4'
        )}
      >
        <div className="container-main">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-wine rounded-full flex items-center justify-center">
                <span className="text-white font-serif font-bold text-lg">H</span>
              </div>
              <span className="font-serif text-xl font-semibold text-brand-green-dark">
                HelthyFood
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-wine',
                    pathname === link.href ? 'text-wine' : 'text-text-dark'
                  )}
                >
                  {t(link.labelKey, locale)}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* Locale toggle */}
              <button
                onClick={toggleLocale}
                className="hidden sm:flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-brand-green/10 text-brand-green hover:bg-brand-green/20 transition-colors"
              >
                {locale === 'vi' ? 'EN' : 'VI'}
              </button>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5 text-text-dark" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-wine text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* User menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <User className="w-5 h-5 text-text-dark" />
                    <ChevronDown className="w-3 h-3 text-text-muted" />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium truncate">
                            {user.user_metadata?.full_name || user.email}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/account"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          {t('nav.account', locale)}
                        </Link>
                        <Link
                          href="/account/orders"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          {t('account.orderHistory', locale)}
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-brand-green"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            {t('nav.admin', locale)}
                          </Link>
                        )}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            {t('nav.logout', locale)}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/account/signin"
                  className="hidden sm:flex btn-primary text-sm px-4 py-2"
                >
                  {t('nav.signin', locale)}
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {isOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block py-2 text-base font-medium transition-colors',
                    pathname === link.href ? 'text-wine' : 'text-text-dark'
                  )}
                >
                  {t(link.labelKey, locale)}
                </Link>
              ))}
              {!user && (
                <Link
                  href="/account/signin"
                  className="block py-2 text-base font-medium text-wine"
                >
                  {t('nav.signin', locale)}
                </Link>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Cart Drawer trigger */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40"
          onClick={() => setCartOpen(false)}
        />
      )}
    </>
  )
}
