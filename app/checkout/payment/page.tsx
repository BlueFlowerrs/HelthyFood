'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, CreditCard, Clock, ShieldCheck } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { initPaymentAction } from '@/app/actions/payment'

function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

function VNPayPaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useLocale()

  const orderIdParam = searchParams.get('order_id')
  const orderId = orderIdParam ? parseInt(orderIdParam) : null
  const amount = parseFloat(searchParams.get('amount') ?? '0')
  const [orderCode, setOrderCode] = useState(searchParams.get('order_code') ?? '')

  const [tokens, setTokens] = useState<{ success: string; failed: string } | null>(null)
  const [loadingTokens, setLoadingTokens] = useState(true)
  const [countdown, setCountdown] = useState(5)
  const [simulating, setSimulating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate signed tokens server-side
  useEffect(() => {
    if (!orderId) {
      setLoadingTokens(false)
      return
    }

    async function fetchTokens() {
      const result = await initPaymentAction(orderId as number)
      if (result.success) {
        setTokens({ success: result.successToken, failed: result.failedToken })
        setOrderCode(result.orderCode)
      } else {
        setError(result.error)
      }
      setLoadingTokens(false)
    }

    fetchTokens()
  }, [orderId])

  useEffect(() => {
    if (countdown <= 0 || loadingTokens) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, loadingTokens])

  const handleCallback = async (token: string) => {
    if (simulating || !token) return
    setSimulating(true)
    try {
      const res = await fetch('/api/payments/vnpay/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (res.ok) {
        router.push(`/checkout/success?order_code=${orderCode}`)
      } else {
        setSimulating(false)
      }
    } catch {
      setSimulating(false)
    }
  }

  if (loadingTokens) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-text-muted text-sm">{t('payment.processing', locale)}</p>
        </div>
      </div>
    )
  }

  if (error || !tokens) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-serif font-bold">{locale === 'vi' ? 'Lỗi' : 'Error'}</h2>
          <p className="text-text-muted">{error || (locale === 'vi' ? 'Không thể khởi tạo thanh toán.' : 'Unable to initialize payment.')}</p>
          <button
            onClick={() => router.push('/checkout')}
            className="px-6 py-3 bg-wine text-white rounded-xl font-medium hover:bg-wine-dark transition-colors"
          >
            {locale === 'vi' ? 'Quay lại' : 'Go Back'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="container-main py-8">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold">{t('payment.title', locale)}</h1>
            <p className="text-sm text-text-muted mt-2">
              VNPAY Sandbox — {locale === 'vi' ? 'không phải thanh toán thật' : 'not a real payment'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Top stripe */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-16 flex items-center px-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold tracking-wider">VNPAY</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-sm text-text-muted mb-1">{t('payment.amount', locale)}</p>
                <p className="text-3xl font-bold text-blue-600">{formatPrice(amount)}đ</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">{locale === 'vi' ? 'Mã đơn hàng' : 'Order Code'}</span>
                  <span className="font-mono font-medium">{orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{locale === 'vi' ? 'Nhà cung cấp' : 'Provider'}</span>
                  <span>VNPAY (Sandbox)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{locale === 'vi' ? 'Phương thức' : 'Method'}</span>
                  <span>ATM / Visa / Mastercard</span>
                </div>
              </div>

              {/* Processing animation */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>{t('payment.processing', locale)}</span>
                </div>
                <p className="text-xs text-text-muted">
                  {t('payment.countdown', locale)} <strong>{countdown}</strong> {t('payment.seconds', locale)}
                </p>
              </div>

              {/* Demo buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => handleCallback(tokens.success)}
                  disabled={simulating}
                  className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5" />
                  {t('payment.simulateSuccess', locale)}
                </button>
                <button
                  onClick={() => handleCallback(tokens.failed)}
                  disabled={simulating}
                  className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                  {t('payment.simulateFailed', locale)}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                <ShieldCheck className="w-4 h-4" />
                <span>{locale === 'vi' ? 'Thanh toán được bảo mật bởi VNPAY' : 'Payment secured by VNPAY'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VNPayPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-main flex items-center justify-center"><p>Loading...</p></div>}>
      <VNPayPaymentContent />
    </Suspense>
  )
}
