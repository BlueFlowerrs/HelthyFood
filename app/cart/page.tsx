'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useUser } from '@/hooks/useUser'
import { useLocale } from '@/providers/LocaleProvider'
import { t } from '@/lib/i18n/translations'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

export default function CartPage() {
  const { locale } = useLocale()
  const { user } = useUser()
  const { items, remove, updateQuantity, getTotal, getSavings } = useCartStore()

  const total = getTotal()
  const savings = getSavings()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-serif font-bold mb-3">{t('cart.empty', locale)}</h1>
          <p className="text-text-muted mb-8">{t('cart.emptyDesc', locale)}</p>
          <Link href="/shop">
            <Button size="lg">{t('cart.shopNow', locale)}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="container-main py-8">
        <h1 className="text-3xl font-serif font-bold mb-8">{t('cart.title', locale)}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => {
              const price = product.sale_price ?? product.price
              const originalPrice = product.price
              const isOnSale = product.sale_price !== null
              const subtotal = price * quantity

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl p-4 flex gap-4 border border-gray-100"
                >
                  <Link href={`/shop/${product.slug}`}>
                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
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
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link href={`/shop/${product.slug}`}>
                          <h3 className="font-medium hover:text-wine transition-colors">
                            {locale === 'vi' ? product.name_vi : product.name_en}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-wine font-bold">{formatPrice(price)}đ</span>
                          {isOnSale && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(originalPrice)}đ
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => remove(product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 font-medium min-w-[32px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          disabled={quantity >= product.stock}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="font-semibold text-wine">{formatPrice(subtotal)}đ</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-24">
              <h2 className="font-semibold mb-4">{t('checkout.orderSummary', locale)}</h2>

              <div className="space-y-3 text-sm">
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

              <div className="border-t border-gray-200 my-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t('cart.total', locale)}</span>
                  <span className="text-2xl font-bold text-wine">{formatPrice(total)}đ</span>
                </div>
              </div>

              <p className="text-xs text-center text-gray-400 mb-4">
                {t('cart.freeShipping', locale)}
              </p>

              <Link href="/checkout" className="block">
                <Button className="w-full gap-2">
                  {t('cart.checkout', locale)}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link
                href="/shop"
                className="flex items-center justify-center gap-2 mt-3 text-sm text-text-muted hover:text-wine transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('cart.continueShopping', locale)}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
