'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight, UserPlus } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { Button } from '@/components/ui/Button'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

interface OrderData {
  order_code: string
  total: number
  shipping_name: string
  shipping_phone: string
  shipping_address: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const { locale } = useLocale()
  const orderCode = searchParams.get('order_code') ?? searchParams.get('order') ?? ''

  const [order, setOrder] = useState<OrderData | null>(null)

  useEffect(() => {
    // Try to get from localStorage if not in URL
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('helthyfood:lastOrder')
      if (saved) {
        try {
          setOrder(JSON.parse(saved))
        } catch {}
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="container-main py-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold mb-2">{t('success.title', locale)}</h1>
            <p className="text-text-muted">{t('success.subtitle', locale)}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
            <div className="bg-green-50 rounded-xl p-5 text-center mb-6">
              <p className="text-xs uppercase tracking-wider text-green-600 mb-2">
                {t('success.orderCode', locale)}
              </p>
              <p className="text-2xl font-mono font-bold text-green-700">
                {order?.order_code ?? orderCode}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-center text-text-muted">
                {t('success.message', locale)}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                <Package className="w-4 h-4" />
                <span>{t('success.estimatedDelivery', locale)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href={`/track?code=${order?.order_code ?? orderCode}`} className="block">
              <Button className="w-full gap-2">
                {t('success.trackOrder', locale)}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/shop" className="block">
              <Button variant="outline" className="w-full">
                {t('success.continueShopping', locale)}
              </Button>
            </Link>
          </div>

          {/* Signin nudge */}
          <div className="mt-8 bg-brand-green/5 rounded-xl p-5 border border-brand-green/10 text-center">
            <UserPlus className="w-6 h-6 text-brand-green mx-auto mb-2" />
            <p className="text-sm text-text-muted mb-3">{t('success.signinPrompt', locale)}</p>
            <Link href="/account/signup">
              <Button variant="secondary" size="sm">{t('success.createAccount', locale)}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-bg-main flex items-center justify-center"><p>Loading...</p></div>}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  )
}
