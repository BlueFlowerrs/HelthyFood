'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Package, ArrowLeft, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'

import { formatPrice } from '@/lib/format'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function OrdersContent() {
  const { locale } = useLocale()
  const searchParams = useSearchParams()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders')
      const data = await res.json()
      return data.orders ?? []
    },
  })

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="bg-brand-green-dark text-white py-12">
        <div className="container-main">
          <Link href="/account" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', locale)}
          </Link>
          <h1 className="text-3xl font-serif font-bold">{t('account.orderHistory', locale)}</h1>
        </div>
      </div>

      <div className="container-main py-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">{t('account.noOrders', locale)}</h3>
            <p className="text-text-muted mb-6">{t('account.noOrdersDesc', locale)}</p>
            <Link href="/shop">
              <Button>{t('cart.shopNow', locale)}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                  <div>
                    <p className="font-mono font-semibold">{order.order_code}</p>
                    <p className="text-xs text-text-muted">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={order.status === 'paid' ? 'green' : order.status === 'pending' ? 'tan' : 'wine'}>
                      {t(`order.status.${order.status}`, locale)}
                    </Badge>
                    <span className="font-bold text-wine">{formatPrice(order.total)}đ</span>
                    <Link href={`/account/orders/${order.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        {t('admin.orders.view', locale)}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="p-4 text-sm text-text-muted">
                  {order.shipping_name} · {order.shipping_phone}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-main flex items-center justify-center"><Skeleton className="h-96 w-full max-w-3xl rounded-xl" /></div>}>
      <OrdersContent />
    </Suspense>
  )
}
