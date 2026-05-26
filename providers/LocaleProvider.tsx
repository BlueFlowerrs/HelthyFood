'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import type { Locale } from '@/lib/i18n/translations'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'vi',
  setLocale: () => {},
  toggleLocale: () => {},
})

export function LocaleProvider({
  children,
  initialLocale = 'vi',
}: {
  children: React.ReactNode
  initialLocale?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('helthyfood:locale', newLocale)
    }
  }, [])

  const toggleLocale = useCallback(() => {
    const newLocale = locale === 'vi' ? 'en' : 'vi'
    setLocale(newLocale)
  }, [locale, setLocale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
