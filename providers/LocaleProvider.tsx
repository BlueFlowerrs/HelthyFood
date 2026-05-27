'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { t, type Locale, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/i18n/translations'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'vi',
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key) => key,
})

export function LocaleProvider({
  children,
  initialLocale = 'vi',
}: {
  children: React.ReactNode
  initialLocale?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('helthyfood:locale')
    if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
      setLocaleState(stored as Locale)
    }
  }, [])

  const setLocale = useCallback((next: Locale) => {
    if (!SUPPORTED_LOCALES.includes(next)) return
    setLocaleState(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('helthyfood:locale', next)
    }
  }, [])

  const toggleLocale = useCallback(() => {
    const next = locale === 'vi' ? 'en' : 'vi'
    setLocale(next)
  }, [locale, setLocale])

  const translate = useCallback(
    (key: string) => t(key, locale),
    [locale],
  )

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, toggleLocale, t: translate }}
    >
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
