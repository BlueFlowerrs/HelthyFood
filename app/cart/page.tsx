'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useLocale } from '@/providers/LocaleProvider'
import { Button } from '@/components/ui/Button'
import { formatVND } from '@/lib/cn'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

interface CartRowProps {
  item: any
  updateQuantity: (id: number, qty: number) => void
  remove: (id: number) => void
  locale: string
}

function CartRow({ item, updateQuantity, remove, locale }: CartRowProps) {
  const name = locale === 'vi' ? item.product?.name_vi : item.product?.name_en
  const price = item.product?.sale_price ?? item.product?.price

  return (
    <div className="flex items-center gap-5 py-6 border-b border-[#070B06]/8">
      <a
        href={`/shop/${item.product?.slug}`}
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#DAD6D6] flex-shrink-0"
      >
        <img
          src={item.product?.image_url || ''}
          alt={name}
          className="w-full h-full object-cover"
        />
      </a>
      <div className="flex-1 min-w-0">
        <a
          href={`/shop/${item.product?.slug}`}
          className="font-serif text-lg text-[#070B06] hover:text-[#8B2C4C] transition-colors block mb-1"
        >
          {name}
        </a>
        <p className="text-sm text-[#8B2C4C] font-medium">{formatVND(price)}</p>
      </div>
      <div className="inline-flex items-center border border-[#070B06]/15 bg-white rounded-full">
        <button
          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
          className="w-9 h-9 flex items-center justify-center text-[#070B06]/60 hover:text-[#070B06]"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
          disabled={item.quantity >= item.product.stock}
          className="w-9 h-9 flex items-center justify-center text-[#070B06]/60 hover:text-[#070B06] disabled:opacity-30"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="hidden sm:block text-right min-w-[100px]">
        <p className="font-medium text-[#070B06]">
          {formatVND(price * item.quantity)}
        </p>
      </div>
      <button
        onClick={() => remove(item.product.id)}
        className="p-2 text-[#070B06]/40 hover:text-[#8B2C4C] transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function CartPage() {
  const { locale, t } = useLocale()
  const { items, remove, updateQuantity, subtotal, count } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-20 bg-[#DAD6D6] min-h-screen" />
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 bg-[#DAD6D6] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-[#070B06] font-medium mb-2"
        >
          {t('cart.title') || 'Giỏ hàng'}
        </motion.h1>
        <p className="text-[#070B06]/60 mb-12">
          {count} {t('cart.itemCount') || 'sản phẩm'}
        </p>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center max-w-xl mx-auto border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-[#DAD6D6] mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-[#070B06]/40" />
            </div>
            <h2 className="font-serif text-2xl text-[#070B06] mb-2">
              {t('cart.empty') || 'Giỏ hàng của bạn đang trống'}
            </h2>
            <p className="text-[#070B06]/60 mb-8">
              {t('cart.emptyDesc') || 'Hãy thêm các sản phẩm dinh dưỡng cao cấp của chúng tôi vào giỏ hàng.'}
            </p>
            <a href="/shop">
              <Button variant="primary" size="lg">
                {t('cart.shopNow') || 'Mua sắm ngay'}
              </Button>
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-10">
            <div className="bg-white/50 rounded-3xl p-6 lg:p-8">
              {items.map((item) => (
                <CartRow
                  key={item.product.id}
                  item={item}
                  updateQuantity={updateQuantity}
                  remove={remove}
                  locale={locale}
                />
              ))}
            </div>
            <aside className="bg-[#223D19] text-white rounded-3xl p-8 h-fit lg:sticky lg:top-28">
              <h2 className="font-serif text-2xl mb-6">
                {t('checkout.orderSummary') || 'Tóm tắt đơn hàng'}
              </h2>
              <div className="space-y-3 mb-6 pb-6 border-b border-white/15">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">
                    {t('common.subtotal') || 'Tạm tính'}
                  </span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">
                    {t('common.shipping') || 'Vận chuyển'}
                  </span>
                  <span className="text-[#d4a574]">
                    {t('common.free') || 'Miễn phí'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-sm uppercase tracking-wider text-white/70">
                  {t('common.total') || 'Tổng cộng'}
                </span>
                <span className="font-serif text-3xl">
                  {formatVND(subtotal)}
                </span>
              </div>
              <a href="/checkout" className="block">
                <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2">
                  {t('cart.proceedCheckout') || 'Tiến hành thanh toán'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <a
                href="/shop"
                className="block text-center text-sm text-white/60 hover:text-white mt-4 transition-colors"
              >
                {t('common.continueShop') || 'Tiếp tục mua sắm'}
              </a>
            </aside>
          </div>
        )}
      </div>
    </main>
    <Footer />
    </>
  )
}
