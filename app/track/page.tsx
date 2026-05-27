'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Star,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatVND } from '@/lib/cn'
import { useUser } from '@/hooks/useUser'

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

interface OrderDetailProps {
  order: any
  items: any[]
  onBack: () => void
}

function OrderDetail({ order, items, onBack }: OrderDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[#070B06]/50 hover:text-[#070B06] mb-6 transition-colors"
      >
        ← Quay lại
      </button>

      <div className="bg-white rounded-3xl p-7 mb-5 border border-gray-100">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#070B06]/50 mb-1">
              Mã đơn hàng
            </div>
            <div className="font-mono font-semibold text-xl text-[#070B06] tracking-wider">
              {order.order_code}
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-sm pb-6 border-b border-[#070B06]/8 mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#070B06]/50 mb-1">
              Tổng tiền
            </div>
            <div className="font-serif text-xl text-[#8B2C4C]">
              {formatVND(order.total)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#070B06]/50 mb-1">
              Ngày đặt
            </div>
            <div>{new Date(order.created_at).toLocaleString('vi-VN')}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#070B06]/50 mb-1">
              Thanh toán
            </div>
            <div className="uppercase">{order.payment_method}</div>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <div className="text-[10px] uppercase tracking-wider text-[#070B06]/50 mb-1">
              Giao đến
            </div>
            <div className="text-[#070B06]/80 leading-snug">
              {order.shipping_name} — {order.shipping_phone}
              <br />
              {[order.shipping_address, order.shipping_city]
                .filter(Boolean)
                .join(', ')}
            </div>
          </div>
        </div>

        {/* Items */}
        <h3 className="text-[11px] uppercase tracking-wider text-[#070B06]/50 mb-3">
          Sản phẩm
        </h3>
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3">
              {it.product_image_snapshot && (
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#DAD6D6] flex-shrink-0">
                  <img
                    src={it.product_image_snapshot}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[#070B06]/80 line-clamp-1">
                  {it.product_name_snapshot}
                </div>
                <div className="text-xs text-[#070B06]/50">
                  x{it.quantity} · {formatVND(it.price_snapshot)} / sản phẩm
                </div>
              </div>
              <div className="font-medium text-sm text-[#070B06] flex-shrink-0">
                {formatVND(it.subtotal)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function TrackContent() {
  const { t } = useLocale()
  const { user, loading: userLoading } = useUser()
  const searchParams = useSearchParams()
  const initialCode = searchParams.get('order') ?? ''

  const [searchCode, setSearchCode] = useState(initialCode)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [resultItems, setResultItems] = useState<any[]>([])
  const [error, setError] = useState('')
  const [guestOrders, setGuestOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedItems, setSelectedItems] = useState<any[]>([])

  // Load from URL param or localStorage on mount
  useEffect(() => {
    if (initialCode) {
      handleSearch(initialCode)
    }

    try {
      const stored = JSON.parse(localStorage.getItem('hf_guest_orders') || '[]')
      setGuestOrders(stored)
    } catch (e) {
      console.error(e)
    }
  }, [initialCode])

  const handleSearch = async (codeOverride?: string) => {
    const searchVal = (codeOverride || searchCode).trim().toUpperCase()
    if (!searchVal) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`/api/orders/by-code/${searchVal}`)
      if (!res.ok) {
        setError('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn.')
        setLoading(false)
        return
      }
      const data = await res.json()
      setResult(data.order)
      setResultItems(data.items || [])

      // Update localStorage status
      try {
        const stored = JSON.parse(localStorage.getItem('hf_guest_orders') || '[]')
        const updated = stored.map((o: any) =>
          o.order_code === data.order.order_code
            ? { ...o, status: data.order.status }
            : o
        )
        localStorage.setItem('hf_guest_orders', JSON.stringify(updated))
        setGuestOrders(updated)
      } catch (e) {
        console.error(e)
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const viewSavedOrder = async (order: any) => {
    setSearchCode(order.order_code)
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/orders/by-code/${order.order_code}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedOrder(data.order)
        setSelectedItems(data.items || [])
      } else {
        setSelectedOrder(order)
        setSelectedItems([])
      }
    } catch (e) {
      setSelectedOrder(order)
      setSelectedItems([])
    } finally {
      setLoading(false)
    }
  }

  if (!userLoading && user) {
    return (
      <main className="pt-32 pb-20 bg-[#DAD6D6] min-h-screen">
        <div className="max-w-lg mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-10 border border-gray-100"
          >
            <CheckCircle2 className="w-12 h-12 text-[#405C36] mx-auto mb-4" />
            <h1 className="font-serif text-2xl text-[#070B06] mb-2">
              Bạn đã đăng nhập
            </h1>
            <p className="text-[#070B06]/60 mb-6 text-sm">
              Xem tất cả đơn hàng của bạn trong trang tài khoản.
            </p>
            <a href="/account">
              <Button variant="primary" size="lg" className="flex items-center gap-2 mx-auto">
                <Package className="w-4 h-4" />
                Xem đơn hàng của tôi
              </Button>
            </a>
          </motion.div>
        </div>
      </main>
    )
  }

  const showDetail = selectedOrder || result
  const showItems = selectedOrder ? selectedItems : resultItems
  const clearDetail = () => {
    setSelectedOrder(null)
    setSelectedItems([])
    setResult(null)
    setResultItems([])
  }

  return (
    <main className="pt-32 pb-20 bg-[#DAD6D6] min-h-screen">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-full bg-[#070B06]/8 flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-[#070B06]" />
            </div>
            <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] text-[#070B06] font-medium mb-2">
              Theo dõi đơn hàng
            </h1>
            <p className="text-[#070B06]/60 text-sm">
              Nhập mã đơn hàng để kiểm tra trạng thái
            </p>
          </div>

          <AnimatePresence mode="wait">
            {showDetail ? (
              <OrderDetail
                key="detail"
                order={showDetail}
                items={showItems}
                onBack={clearDetail}
              />
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Search box */}
                <div className="bg-white rounded-3xl p-7 mb-5 border border-gray-100">
                  <label className="block text-xs uppercase tracking-wider text-[#070B06]/50 mb-2 font-medium">
                    Mã đơn hàng
                  </label>
                  <div className="flex gap-3">
                    <Input
                      value={searchCode}
                      onChange={(e) =>
                        setSearchCode(e.target.value.toUpperCase())
                      }
                      placeholder="VD: HFABCD1234..."
                      className="flex-1 font-mono"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleSearch()}
                      disabled={loading || !searchCode.trim()}
                      className="flex-shrink-0"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      Tìm
                    </Button>
                  </div>
                  {error && (
                    <p className="text-xs text-[#8B2C4C] mt-2 flex items-center gap-1">
                      <XCircle className="w-3 h-3 animate-pulse" />
                      {error}
                    </p>
                  )}
                </div>

                {/* Saved guest orders from localStorage */}
                {guestOrders.length > 0 && (
                  <div className="bg-white rounded-3xl p-7 mb-5 border border-gray-100">
                    <h2 className="text-[11px] uppercase tracking-wider text-[#070B06]/50 mb-4 font-semibold">
                      Đơn hàng gần đây trên thiết bị này
                    </h2>
                    <div className="space-y-2">
                      {guestOrders.map((o) => (
                        <button
                          key={o.order_code}
                          onClick={() => viewSavedOrder(o)}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#DAD6D6] hover:bg-[#070B06] hover:text-white transition-colors group text-left"
                        >
                          <div>
                            <div className="font-mono font-medium text-sm mb-1 group-hover:text-white">
                              {o.order_code}
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={o.status || 'pending'} />
                              {o.created_at && (
                                <span className="text-[10px] text-[#070B06]/50 group-hover:text-white/50">
                                  {new Date(o.created_at).toLocaleDateString(
                                    'vi-VN'
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3 flex flex-col items-end">
                            <div className="font-serif text-base group-hover:text-white">
                              {formatVND(o.total)}
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#070B06]/40 group-hover:text-white/60 mt-1" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Login nudge */}
                <div className="bg-[#223D19] text-white rounded-3xl p-7">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-[#d4a574]" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg mb-1">
                        Đơn hàng của bạn ở đây mãi mãi
                      </h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Đơn khách chỉ lưu trên thiết bị này và có thể bị mất khi xóa bộ nhớ. Tạo tài khoản để an tâm theo dõi mọi đơn bất kỳ lúc nào.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="/account/signup"
                      className="flex-1 flex items-center justify-center gap-2 bg-white text-[#223D19] font-semibold rounded-full py-3 px-5 hover:bg-white/90 transition-colors text-sm text-center"
                    >
                      <UserPlus className="w-4 h-4" />
                      Tạo tài khoản miễn phí
                    </a>
                    <a
                      href="/account/signin"
                      className="flex-1 flex items-center justify-center gap-2 border border-white/25 text-white font-medium rounded-full py-3 px-5 hover:bg-white/10 transition-colors text-sm text-center"
                    >
                      <LogIn className="w-4 h-4" />
                      Đăng nhập
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  )
}

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function TrackPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-[#DAD6D6] flex items-center justify-center">Loading...</div>}>
        <TrackContent />
      </Suspense>
      <Footer />
    </>
  )
}
