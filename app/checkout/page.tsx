'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Lock, ChevronRight, CreditCard, Banknote, User } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { type CartProduct } from '@/stores/cartStore'
import { useLocale } from '@/providers/LocaleProvider'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { toast } from 'sonner'
import { formatVND } from '@/lib/cn'
import { useUser } from '@/hooks/useUser'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function CheckoutPage() {
  const router = useRouter()
  const { locale, t } = useLocale()
  const { items, subtotal: total, savings, clear } = useCart()
  const { user } = useUser()

  const [form, setForm] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    notes: '',
    payment_method: 'vnpay',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prefill profile only for logged-in users
  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          if (data.profile) {
            setForm((f) => ({
              ...f,
              shipping_name: data.profile.full_name || '',
              shipping_phone: data.profile.phone || '',
              shipping_address: data.profile.address || '',
              shipping_city: data.profile.city || '',
            }))
          }
        }
      } catch (e) {
        console.error(e)
      }
    })()
  }, [user])

  if (!mounted) {
    return <main className="pt-28 pb-20 bg-[#DAD6D6] min-h-screen" />
  }



  const updateForm = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.shipping_name.trim()) errs.shipping_name = locale === 'vi' ? 'Họ và tên là bắt buộc' : 'Full name is required'
    if (!form.shipping_phone.trim()) errs.shipping_phone = locale === 'vi' ? 'Số điện thoại là bắt buộc' : 'Phone is required'
    if (!form.shipping_address.trim()) errs.shipping_address = locale === 'vi' ? 'Địa chỉ là bắt buộc' : 'Address is required'
    if (!form.shipping_city.trim()) errs.shipping_city = locale === 'vi' ? 'Thành phố là bắt buộc' : 'City is required'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
          shipping_name: form.shipping_name,
          shipping_phone: form.shipping_phone,
          shipping_address: form.shipping_address,
          shipping_city: form.shipping_city,
          payment_method: form.payment_method,
          notes: form.notes || null,
        }),
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error)

      // Save to localStorage for guest order lookup
      if (typeof window !== 'undefined') {
        localStorage.setItem('helthyfood:lastOrder', JSON.stringify(orderData.order))
        
        // Save guest order to list of guest orders
        if (!user) {
          try {
            const existing = JSON.parse(localStorage.getItem('hf_guest_orders') || '[]')
            existing.unshift({
              order_code: orderData.order.order_code,
              total: orderData.order.total,
              created_at: orderData.order.created_at || new Date().toISOString(),
              shipping_name: form.shipping_name,
              status: 'pending',
            })
            localStorage.setItem('hf_guest_orders', JSON.stringify(existing.slice(0, 20)))
          } catch (e) {
            console.error('Could not save guest order', e)
          }
        }
      }

      // Clear cart
      clear()

      // Navigate to payment / success
      if (form.payment_method === 'vnpay') {
        router.push(`/checkout/payment?order_id=${orderData.order.id}&amount=${total}&order_code=${orderData.order.order_code}`)
      } else {
        router.push(`/checkout/success?order=${orderData.order.order_code}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (locale === 'vi' ? 'Đã xảy ra lỗi' : 'An error occurred'))
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-20 bg-[#DAD6D6] min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-serif font-bold mb-4">{t('cart.empty') || 'Giỏ hàng trống'}</h1>
            <a href="/shop">
              <Button variant="primary" size="lg">{t('cart.shopNow') || 'Mua sắm ngay'}</Button>
            </a>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 bg-[#DAD6D6] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#070B06]/60 hover:text-[#8B2C4C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('cart.continueShopping') || 'Quay lại giỏ hàng'}
          </Link>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] tracking-tight text-[#070B06] font-medium mb-10"
        >
          {t('checkout.title') || 'Thanh toán'}
        </motion.h1>

        {/* Guest sign-in nudge */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-white border border-[#070B06]/8 rounded-2xl px-5 py-4 mb-8"
          >
            <div className="w-9 h-9 rounded-full bg-[#8B2C4C]/10 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-[#8B2C4C]" />
            </div>
            <p className="text-sm text-[#070B06]/70 flex-1">
              Có tài khoản?{' '}
              <a
                href="/account/signin?callbackUrl=/checkout"
                className="text-[#8B2C4C] font-medium hover:underline"
              >
                Đăng nhập
              </a>{' '}
              để lưu thông tin và xem lịch sử đơn hàng.
            </p>
          </motion.div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid lg:grid-cols-[1fr_400px] gap-10"
        >
          <div className="space-y-8">
            {/* Shipping */}
            <section className="bg-white rounded-3xl p-8 border border-gray-100">
              <h2 className="font-serif text-2xl text-[#070B06] mb-6">
                {t('checkout.shippingInfo') || 'Thông tin giao hàng'}
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Input
                    label={t('checkout.fullName') || 'Họ và tên'}
                    value={form.shipping_name}
                    onChange={(e) => updateForm('shipping_name', e.target.value)}
                    error={errors.shipping_name}
                    required
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <Input
                    label={t('checkout.phone') || 'Số điện thoại'}
                    value={form.shipping_phone}
                    onChange={(e) => updateForm('shipping_phone', e.target.value)}
                    error={errors.shipping_phone}
                    required
                    placeholder="0901 234 567"
                    type="tel"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label={t('checkout.address') || 'Địa chỉ'}
                    value={form.shipping_address}
                    onChange={(e) => updateForm('shipping_address', e.target.value)}
                    error={errors.shipping_address}
                    required
                    placeholder="123 Nguyễn Trãi, Quận 1"
                  />
                </div>
                <div>
                  <Input
                    label={t('checkout.city') || 'Tỉnh / Thành phố'}
                    value={form.shipping_city}
                    onChange={(e) => updateForm('shipping_city', e.target.value)}
                    error={errors.shipping_city}
                    required
                    placeholder="TP. Hồ Chí Minh"
                  />
                </div>
              </div>
              <div className="mt-5">
                <Input
                  label={t('checkout.notes') || 'Ghi chú đơn hàng'}
                  value={form.notes}
                  onChange={(e) => updateForm('notes', e.target.value)}
                  placeholder="Ghi chú thêm..."
                />
              </div>
            </section>

            {/* Payment method */}
            <section className="bg-white rounded-3xl p-8 border border-gray-100">
              <h2 className="font-serif text-2xl text-[#070B06] mb-6">
                {t('checkout.paymentMethod') || 'Phương thức thanh toán'}
              </h2>
              <div className="space-y-3">
                {[
                  {
                    id: 'vnpay',
                    icon: CreditCard,
                    label: t('checkout.vnpay') || 'Cổng thanh toán VNPAY',
                    desc: t('checkout.vnpayDesc') || 'Thanh toán qua ATM, Thẻ tín dụng, QR Code',
                  },
                  {
                    id: 'cod',
                    icon: Banknote,
                    label: t('checkout.cod') || 'Thanh toán khi nhận hàng (COD)',
                    desc: t('checkout.codDesc') || 'Thanh toán bằng tiền mặt khi giao hàng',
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => updateForm('payment_method', m.id)}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-colors text-left ${
                      form.payment_method === m.id
                        ? 'border-[#8B2C4C] bg-[#8B2C4C]/5'
                        : 'border-[#070B06]/10 hover:border-[#070B06]/20'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center ${
                        form.payment_method === m.id
                          ? 'bg-[#8B2C4C] text-white'
                          : 'bg-[#DAD6D6] text-[#070B06]/60'
                      }`}
                    >
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[#070B06]">
                        {m.label}
                      </div>
                      <div className="text-xs text-[#070B06]/55">
                        {m.desc}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        form.payment_method === m.id
                          ? 'border-[#8B2C4C]'
                          : 'border-[#070B06]/20'
                      }`}
                    >
                      {form.payment_method === m.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#8B2C4C]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="bg-[#223D19] text-white rounded-3xl p-8 h-fit lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl mb-6">
              {t('checkout.orderSummary') || 'Tóm tắt đơn hàng'}
            </h2>
            <div className="space-y-4 mb-6 pb-6 border-b border-white/15 max-h-[300px] overflow-y-auto">
              {items.map((it) => {
                const name = locale === 'vi' ? it.product.name_vi : it.product.name_en
                const p = it.product.sale_price ?? it.product.price
                return (
                  <div key={it.product.id} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                      <img
                        src={it.product.image_url || ''}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-1 text-white/95">{name}</p>
                      <p className="text-xs text-white/55">x{it.quantity}</p>
                    </div>
                    <p className="text-white/85">
                      {formatVND(p * it.quantity)}
                    </p>
                  </div>
                )
              })}
            </div>
            <div className="space-y-2 mb-6 pb-6 border-b border-white/15">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">{t('common.subtotal') || 'Tạm tính'}</span>
                <span>{formatVND(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">{t('common.shipping') || 'Vận chuyển'}</span>
                <span className="text-[#d4a574]">{t('common.free') || 'Miễn phí'}</span>
              </div>
            </div>
            <div className="flex justify-between items-baseline mb-6">
              <span className="text-sm uppercase tracking-wider text-white/70">
                {t('common.total') || 'Tổng cộng'}
              </span>
              <span className="font-serif text-3xl">
                {formatVND(total)}
              </span>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? (locale === 'vi' ? 'Đang xử lý...' : 'Processing...') : (t('checkout.placeOrder') || 'Đặt hàng')}
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40 mt-4">
              <Lock className="w-3 h-3" />
              Secured checkout
            </div>
          </aside>
        </form>
      </div>
    </main>
    <Footer />
    </>
  )
}
