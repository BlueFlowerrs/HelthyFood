'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function OrderDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { locale } = useLocale()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`)
      if (!res.ok) return null
      const data = await res.json()
      return data.order
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main">
        <div className="container-main py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <p>{t('track.notFound', locale)}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="container-main py-8">
        <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-wine mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t('common.back', locale)}
        </Link>

        <h1 className="text-3xl font-serif font-bold mb-8">{order.order_code}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-semibold mb-4">{t('track.status', locale)}</h2>
              <div className="flex items-center gap-4 mb-4">
                <Badge
                  variant={
                    order.status === 'paid' ? 'green' :
                    order.status === 'delivered' ? 'green' :
                    order.status === 'cancelled' ? 'wine' : 'tan'
                  }
                >
                  {t(`order.status.${order.status}`, locale)}
                </Badge>
                <Badge
                  variant={order.payment_status === 'paid' ? 'green' : 'tan'}
                >
                  {t(`order.paymentStatus.${order.payment_status}`, locale)}
                </Badge>
              </div>
              <p className="text-sm text-text-muted">{formatDate(order.created_at)}</p>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-semibold mb-4">{t('track.items', locale)}</h2>
              <div className="space-y-4">
                {(order.order_items || []).map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.product_image_snapshot && (
                        <Image
                          src={item.product_image_snapshot}
                          alt={item.product_name_snapshot}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name_snapshot}</p>
                      <p className="text-sm text-text-muted">
                        {formatPrice(item.price_snapshot)}đ × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.subtotal)}đ</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-24">
              <h2 className="font-semibold mb-4">{t('track.orderDetails', locale)}</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-text-muted">{t('track.customer', locale)}</p>
                  <p className="font-medium">{order.shipping_name}</p>
                </div>
                <div>
                  <p className="text-text-muted">{t('track.phone', locale)}</p>
                  <p className="font-medium">{order.shipping_phone}</p>
                </div>
                <div>
                  <p className="text-text-muted">{t('track.address', locale)}</p>
                  <p className="font-medium">{order.shipping_address}</p>
                </div>
                {order.notes && (
                  <div>
                    <p className="text-text-muted">Ghi chú</p>
                    <p className="font-medium">{order.notes}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 my-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t('track.total', locale)}</span>
                  <span className="text-xl font-bold text-wine">{formatPrice(order.total)}đ</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-text-muted">
                <p>{t('track.paymentMethod', locale)}: {order.payment_method?.toUpperCase()}</p>
                <p>{t('track.paymentStatus', locale)}: {t(`order.paymentStatus.${order.payment_status}`, locale)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
