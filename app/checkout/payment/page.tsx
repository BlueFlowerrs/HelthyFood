'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, CreditCard, ShieldCheck } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { initPaymentAction } from '@/app/actions/payment'

function VNPayPaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useLocale()

  const orderIdParam = searchParams.get('order_id')
  const orderId = orderIdParam ? parseInt(orderIdParam) : null
  const amount = parseFloat(searchParams.get('amount') ?? '0')

  const errorParam = searchParams.get('error')
  const [tokens, setTokens] = useState<{ vnpUrl: string } | null>(null)
  const [loadingTokens, setLoadingTokens] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(
    errorParam
      ? (errorParam === 'payment_failed'
          ? (locale === 'vi' ? 'Thanh toán không thành công hoặc đã bị hủy.' : 'Payment failed or cancelled.')
          : errorParam === 'invalid_signature'
          ? (locale === 'vi' ? 'Chữ ký thanh toán không hợp lệ.' : 'Invalid payment signature.')
          : errorParam === 'order_not_found'
          ? (locale === 'vi' ? 'Không tìm thấy đơn hàng tương ứng.' : 'Order not found.')
          : errorParam)
      : null
  )

  // Fetch VNPAY payment URL from server
  useEffect(() => {
    if (errorParam) {
      setLoadingTokens(false)
      return
    }
    if (!orderId) {
      setLoadingTokens(false)
      return
    }

    async function fetchTokens() {
      const result = await initPaymentAction(orderId as number)
      if (result.success) {
        setTokens({ vnpUrl: result.vnpUrl })
        setRedirecting(true)
        window.location.href = result.vnpUrl
      } else {
        setError(result.error)
        setLoadingTokens(false)
      }
    }

    fetchTokens()
  }, [orderId, errorParam])

  const handleRetryPayment = async () => {
    if (!orderId) return
    setError(null)
    setLoadingTokens(true)
    setRedirecting(true)
    try {
      const result = await initPaymentAction(orderId)
      if (result.success) {
        window.location.href = result.vnpUrl
      } else {
        setError(result.error)
        setLoadingTokens(false)
        setRedirecting(false)
      }
    } catch (e) {
      setError(locale === 'vi' ? 'Đã xảy ra lỗi khi thử lại.' : 'An error occurred during retry.')
      setLoadingTokens(false)
      setRedirecting(false)
    }
  }

  if (loadingTokens || redirecting) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#8B2C4C]/30 border-t-[#8B2C4C] rounded-full animate-spin mx-auto" />
          <p className="text-text-muted text-sm">{t('payment.redirecting', locale)}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-serif font-bold">{locale === 'vi' ? 'Lỗi thanh toán' : 'Payment Error'}</h2>
          <p className="text-text-muted">{error || (locale === 'vi' ? 'Không thể khởi tạo thanh toán.' : 'Unable to initialize payment.')}</p>
          <div className="flex gap-4 justify-center">
            {orderId && (
              <button
                onClick={handleRetryPayment}
                className="px-6 py-3 bg-[#8B2C4C] text-white rounded-xl font-medium hover:bg-[#8B2C4C]/90 transition-colors cursor-pointer"
              >
                {locale === 'vi' ? 'Thử thanh toán lại' : 'Retry Payment'}
              </button>
            )}
            <button
              onClick={() => router.push('/shop')}
              className="px-6 py-3 bg-[#DAD6D6] text-[#070B06] rounded-xl font-medium hover:bg-[#DAD6D6]/80 transition-colors cursor-pointer"
            >
              {locale === 'vi' ? 'Quay lại cửa hàng' : 'Go Back to Shop'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="container-main py-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold">{t('payment.title', locale)}</h1>
            <p className="text-sm text-text-muted mt-2">
              VNPAY Sandbox — {locale === 'vi' ? 'đang chuyển hướng...' : 'redirecting...'}
            </p>
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
