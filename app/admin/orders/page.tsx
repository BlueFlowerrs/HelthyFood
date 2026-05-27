'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Link from 'next/link'
import AdminSidebar from '../_components/Sidebar'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { t } from '@/lib/i18n/translations'
import { useLocale } from '@/providers/LocaleProvider'
import { toast } from 'sonner'

import { formatPrice } from '@/lib/format'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-700',
}

export default function AdminOrdersPage() {
  const { locale } = useLocale()
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders?admin=true')
      const data = await res.json()
      return data.orders ?? []
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      toast.success('Đã cập nhật trạng thái')
    },
  })

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">{t('admin.orders.title', locale)}</h1>
          <p className="text-text-muted">{t('admin.orders.subtitle', locale)}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wider text-text-muted">
                    <th className="px-6 py-4 font-semibold">{t('admin.orders.orderCode', locale)}</th>
                    <th className="px-6 py-4 font-semibold">{t('admin.orders.customer', locale)}</th>
                    <th className="px-6 py-4 font-semibold">{t('admin.orders.total', locale)}</th>
                    <th className="px-6 py-4 font-semibold">{t('admin.orders.status', locale)}</th>
                    <th className="px-6 py-4 font-semibold">{t('admin.orders.payment', locale)}</th>
                    <th className="px-6 py-4 font-semibold">{t('admin.orders.date', locale)}</th>
                    <th className="px-6 py-4 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders?.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-semibold">{order.order_code}</td>
                      <td className="px-6 py-4 text-sm">
                        <p>{order.shipping_name}</p>
                        <p className="text-xs text-text-muted">{order.shipping_phone}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-sm">{formatPrice(order.total)}đ</td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                          className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${STATUS_COLORS[order.status] ?? 'bg-gray-100'}`}
                        >
                          <option value="pending">{t('admin.orders.statuses.pending', locale)}</option>
                          <option value="paid">{t('admin.orders.statuses.paid', locale)}</option>
                          <option value="failed">{t('admin.orders.statuses.failed', locale)}</option>
                          <option value="shipped">{t('admin.orders.statuses.shipped', locale)}</option>
                          <option value="delivered">{t('admin.orders.statuses.delivered', locale)}</option>
                          <option value="cancelled">{t('admin.orders.statuses.cancelled', locale)}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={order.payment_status === 'paid' ? 'green' : 'tan'} size="sm">
                          {t(`admin.orders.paymentStatuses.${order.payment_status}`, locale)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-muted">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-sm text-wine hover:text-wine-dark font-medium"
                        >
                          {t('admin.orders.view', locale)}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-text-muted">{t('admin.orders.noOrders', locale)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold">{selectedOrder.order_code}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-text-muted">{t('track.customer', locale)}</p>
                  <p className="font-medium">{selectedOrder.shipping_name}</p>
                </div>
                <div>
                  <p className="text-text-muted">{t('track.phone', locale)}</p>
                  <p className="font-medium">{selectedOrder.shipping_phone}</p>
                </div>
              </div>
              <div>
                <p className="text-text-muted">{t('track.address', locale)}</p>
                <p className="font-medium">{selectedOrder.shipping_address}</p>
              </div>
              {selectedOrder.notes && (
                <div>
                  <p className="text-text-muted">Ghi chú</p>
                  <p className="font-medium">{selectedOrder.notes}</p>
                </div>
              )}
              <div className="border-t border-gray-100 pt-4">
                <p className="font-semibold text-wine text-base">{t('track.total', locale)}: {formatPrice(selectedOrder.total)}đ</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
