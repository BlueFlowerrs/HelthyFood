'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { toast } from 'sonner'

function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

export default function CheckoutPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { items, getTotal, getSavings, clear } = useCartStore()

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

  const total = getTotal()
  const savings = getSavings()

  const updateForm = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.shipping_name.trim()) errs.shipping_name = t('validation.required', locale)
    if (!form.shipping_phone.trim()) errs.shipping_phone = t('validation.required', locale)
    if (!form.shipping_address.trim()) errs.shipping_address = t('validation.required', locale)
    if (!form.shipping_city.trim()) errs.shipping_city = t('validation.required', locale)
    return errs
  }

  const handleSubmit = async () => {
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
      }

      // Clear cart
      clear()

      // Navigate to payment
      router.push(`/checkout/payment?order_id=${orderData.order.id}&amount=${total}&order_code=${orderData.order.order_code}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error', locale))
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-serif font-bold mb-4">{t('cart.empty', locale)}</h1>
          <Link href="/shop">
            <Button>{t('cart.shopNow', locale)}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="container-main py-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-wine mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('cart.continueShopping', locale)}
        </Link>

        <h1 className="text-3xl font-serif font-bold mb-8">{t('checkout.title', locale)}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-semibold mb-6">{t('checkout.shippingInfo', locale)}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label={t('checkout.fullName', locale)}
                    value={form.shipping_name}
                    onChange={(e) => updateForm('shipping_name', e.target.value)}
                    error={errors.shipping_name}
                    required
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <Input
                    label={t('checkout.phone', locale)}
                    value={form.shipping_phone}
                    onChange={(e) => updateForm('shipping_phone', e.target.value)}
                    error={errors.shipping_phone}
                    required
                    placeholder="0901 234 567"
                    type="tel"
                  />
                </div>
                <div>
                  <Input
                    label={t('checkout.city', locale)}
                    value={form.shipping_city}
                    onChange={(e) => updateForm('shipping_city', e.target.value)}
                    error={errors.shipping_city}
                    required
                    placeholder="TP. Hồ Chí Minh"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label={t('checkout.address', locale)}
                    value={form.shipping_address}
                    onChange={(e) => updateForm('shipping_address', e.target.value)}
                    error={errors.shipping_address}
                    required
                    placeholder="123 Nguyễn Trãi, Quận 1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Textarea
                    label={t('checkout.notes', locale)}
                    value={form.notes}
                    onChange={(e) => updateForm('notes', e.target.value)}
                    placeholder="Ghi chú thêm..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-semibold mb-6">{t('checkout.paymentMethod', locale)}</h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    form.payment_method === 'vnpay'
                      ? 'border-wine bg-wine/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="vnpay"
                    checked={form.payment_method === 'vnpay'}
                    onChange={(e) => updateForm('payment_method', e.target.value)}
                    className="accent-wine"
                  />
                  <div>
                    <p className="font-medium">{t('checkout.vnpay', locale)}</p>
                    <p className="text-xs text-text-muted">{t('checkout.vnpayDesc', locale)}</p>
                  </div>
                  <div className="ml-auto">
                    <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">
                      VNPAY
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-24">
              <h2 className="font-semibold mb-4">{t('checkout.orderSummary', locale)}</h2>

              <ul className="space-y-3 mb-4">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex gap-3">
                    <div className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={locale === 'vi' ? product.name_vi : product.name_en}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-green/20 to-wine/20" />
                      )}
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-wine text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {locale === 'vi' ? product.name_vi : product.name_en}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatPrice(product.sale_price ?? product.price)}đ × {quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-200 my-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">{t('cart.subtotal', locale)}</span>
                  <span>{formatPrice(total + savings)}đ</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('cart.savings', locale)}</span>
                    <span>-{formatPrice(savings)}đ</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted">Vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t('cart.total', locale)}</span>
                  <span className="text-2xl font-bold text-wine">{formatPrice(total)}đ</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                loading={loading}
                onClick={handleSubmit}
              >
                {t('checkout.placeOrder', locale)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
