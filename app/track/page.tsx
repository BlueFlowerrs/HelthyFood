'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { Search, AlertCircle } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function TrackContent() {
  const { locale } = useLocale()
  const searchParams = useSearchParams()
  const initialCode = searchParams.get('code') ?? ''

  const [orderCode, setOrderCode] = useState(initialCode)
  const [searched, setSearched] = useState(false)

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['track', orderCode],
    queryFn: async () => {
      if (!orderCode.trim()) return null
      const res = await fetch(`/api/orders/by-code/${orderCode}`)
      if (!res.ok) return null
      const data = await res.json()
      return data.order
    },
    enabled: searched,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearched(true)
  }

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="bg-brand-green-dark text-white py-12">
        <div className="container-main">
          <h1 className="text-3xl font-serif font-bold">{t('track.title', locale)}</h1>
          <p className="text-white/60 mt-2">{t('track.subtitle', locale)}</p>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="max-w-2xl mx-auto">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <div className="flex-1">
              <Input
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder={t('track.placeholder', locale)}
                className="text-lg"
              />
            </div>
            <Button type="submit" className="gap-2 self-start h-[52px] px-8">
              <Search className="w-5 h-5" />
              {t('track.search', locale)}
            </Button>
          </form>

          {/* Result */}
          {!searched ? null : isLoading ? (
            <Skeleton className="h-48 rounded-xl" />
          ) : !order ? (
            <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('track.notFound', locale)}</h3>
              <p className="text-sm text-text-muted">{t('track.notFoundDesc', locale)}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">{t('track.orderDetails', locale)}</h2>
                  <Badge
                    variant={
                      order.status === 'paid' || order.status === 'delivered' ? 'green' :
                      order.status === 'cancelled' ? 'wine' : 'tan'
                    }
                  >
                    {t(`order.status.${order.status}`, locale)}
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-muted">{t('track.orderCode', locale)}</p>
                    <p className="font-mono font-bold">{order.order_code}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">{t('track.date', locale)}</p>
                    <p className="font-medium">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">{t('track.customer', locale)}</p>
                    <p className="font-medium">{order.shipping_name}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">{t('track.phone', locale)}</p>
                    <p className="font-medium">{order.shipping_phone}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-text-muted">{t('track.address', locale)}</p>
                    <p className="font-medium">{order.shipping_address}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">{t('track.paymentStatus', locale)}</p>
                    <Badge variant={order.payment_status === 'paid' ? 'green' : 'tan'}>
                      {t(`order.paymentStatus.${order.payment_status}`, locale)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-text-muted">{t('track.paymentMethod', locale)}</p>
                    <p className="font-medium uppercase">{order.payment_method}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold mb-4">{t('track.items', locale)}</h3>
                <div className="space-y-4">
                  {(order.order_items || []).map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {item.product_image_snapshot ? (
                          <Image src={item.product_image_snapshot} alt={item.product_name_snapshot} fill className="object-cover" />
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product_name_snapshot}</p>
                        <p className="text-xs text-text-muted">
                          {formatPrice(item.price_snapshot)}đ × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">{formatPrice(item.subtotal)}đ</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                  <span className="font-semibold">{t('track.total', locale)}</span>
                  <span className="text-xl font-bold text-wine">{formatPrice(order.total)}đ</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-main flex items-center justify-center"><Skeleton className="h-96 w-full max-w-2xl rounded-xl" /></div>}>
      <TrackContent />
    </Suspense>
  )
}
