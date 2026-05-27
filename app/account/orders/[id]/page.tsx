'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatVND } from '@/lib/cn'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const STATUS_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }> = {
  pending: {
    icon: Clock,
    color: '#d4a574',
    bg: '#d4a574/15',
    label: 'Chờ xác nhận',
  },
  paid: {
    icon: CheckCircle2,
    color: '#405C36',
    bg: '#405C36/15',
    label: 'Đã thanh toán',
  },
  shipped: {
    icon: Truck,
    color: '#3b82f6',
    bg: '#3b82f6/15',
    label: 'Đang giao',
  },
  delivered: {
    icon: CheckCircle2,
    color: '#223D19',
    bg: '#223D19/15',
    label: 'Đã nhận hàng',
  },
  failed: {
    icon: XCircle,
    color: '#8B2C4C',
    bg: '#8B2C4C/15',
    label: 'Thất bại',
  },
  cancelled: {
    icon: XCircle,
    color: '#9ca3af',
    bg: '#9ca3af/15',
    label: 'Đã hủy',
  },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
      style={{
        color: cfg.color,
        backgroundColor: cfg.color + '18',
        borderColor: cfg.color + '40',
      }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

export default function OrderDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { locale, t } = useLocale()

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
      <>
        <Navbar />
        <main className="pt-28 pb-20 bg-[#DAD6D6] min-h-screen">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-40 w-full rounded-3xl" />
              <Skeleton className="h-40 w-full rounded-3xl" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-20 bg-[#DAD6D6] min-h-screen flex items-center justify-center">
          <div className="text-center">{t('track.notFound') || 'Không tìm thấy đơn hàng'}</div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 bg-[#DAD6D6] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="mb-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#070B06]/60 hover:text-[#8B2C4C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === 'vi' ? 'Quay lại tài khoản' : 'Back to account'}
          </Link>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] tracking-tight text-[#070B06] font-medium mb-8"
        >
          {order.order_code}
        </motion.h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            {/* Status Section */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-[#070B06] mb-4">
                {t('track.status') || 'Trạng thái đơn hàng'}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <StatusBadge status={order.status} />
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                    order.payment_status === 'paid'
                      ? 'bg-[#405C36]/15 text-[#405C36] border-[#405C36]/30'
                      : 'bg-[#d4a574]/15 text-[#a07a3d] border-[#d4a574]/30'
                  }`}
                >
                  {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
              <p className="text-xs text-[#070B06]/55">
                {locale === 'vi' ? 'Ngày đặt hàng: ' : 'Order Date: '}
                {new Date(order.created_at).toLocaleString('vi-VN')}
              </p>
            </div>

            {/* Items list */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100">
              <h2 className="font-serif text-xl text-[#070B06] mb-6">
                {t('track.items') || 'Sản phẩm đã mua'}
              </h2>
              <div className="space-y-6">
                {(order.order_items || []).map((item: any) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 bg-[#DAD6D6] rounded-2xl overflow-hidden shrink-0">
                      {item.product_image_snapshot && (
                        <img
                          src={item.product_image_snapshot}
                          alt={item.product_name_snapshot}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#070B06] line-clamp-1">{item.product_name_snapshot}</p>
                      <p className="text-xs text-[#070B06]/55 mt-0.5">
                        {formatVND(item.price_snapshot)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-[#070B06] shrink-0">{formatVND(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details Sidebar */}
          <aside className="bg-[#223D19] text-white rounded-3xl p-8 h-fit lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl mb-6">
              {t('track.orderDetails') || 'Thông tin đơn hàng'}
            </h2>
            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-white/15">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/55 mb-0.5">
                  {t('track.customer') || 'Người nhận'}
                </p>
                <p className="font-medium">{order.shipping_name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/55 mb-0.5">
                  {t('track.phone') || 'Số điện thoại'}
                </p>
                <p className="font-medium">{order.shipping_phone}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/55 mb-0.5">
                  {t('track.address') || 'Địa chỉ'}
                </p>
                <p className="font-medium">{order.shipping_address}, {order.shipping_city}</p>
              </div>
              {order.notes && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/55 mb-0.5">
                    Ghi chú
                  </p>
                  <p className="font-medium text-white/90">{order.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-baseline mb-6">
              <span className="text-sm uppercase tracking-wider text-white/70">
                {t('track.total') || 'Tổng cộng'}
              </span>
              <span className="font-serif text-3xl">
                {formatVND(order.total)}
              </span>
            </div>

            <div className="space-y-2 text-xs text-white/55">
              <p>Phương thức: {order.payment_method?.toUpperCase()}</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
    <Footer />
    </>
  )
}
