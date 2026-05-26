'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useLocale } from '@/providers/LocaleProvider'
import { Button } from '@/components/ui/Button'
import { t } from '@/lib/i18n/translations'
import { cn } from '@/lib/cn'

function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const { locale } = useLocale()
  const { items, remove, updateQuantity, getTotal, getCount } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handler = () => setIsOpen(true)
    window.addEventListener('open-cart', handler)
    return () => window.removeEventListener('open-cart', handler)
  }, [])

  const displayItems = mounted ? items : []
  const displayTotal = mounted ? getTotal() : 0
  const displayCount = mounted ? getCount() : 0

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md bg-white z-[80] shadow-2xl transition-transform duration-300 flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-wine" />
            <h2 className="text-lg font-semibold">
              {t('cart.title', locale)} ({displayCount})
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">{t('cart.empty', locale)}</h3>
              <p className="text-sm text-gray-400 mb-6">{t('cart.emptyDesc', locale)}</p>
              <Link href="/shop" onClick={() => setIsOpen(false)}>
                <Button>{t('cart.shopNow', locale)}</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {displayItems.map(({ product, quantity }) => {
                const price = product.sale_price ?? product.price
                const originalPrice = product.price
                const isOnSale = product.sale_price !== null

                return (
                  <li key={product.id} className="p-4 flex gap-4">
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={locale === 'vi' ? product.name_vi : product.name_en}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                      {isOnSale && (
                        <span className="absolute bottom-0 left-0 right-0 bg-wine text-white text-[9px] font-bold text-center py-0.5">
                          -{Math.round((1 - product.sale_price! / originalPrice) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/shop/${product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium hover:text-wine transition-colors line-clamp-1"
                      >
                        {locale === 'vi' ? product.name_vi : product.name_en}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-wine">
                          {formatPrice(price)}đ
                        </span>
                        {isOnSale && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(originalPrice)}đ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-sm font-medium min-w-[24px] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(product.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {displayItems.length > 0 && (
          <div className="border-t border-gray-100 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{t('cart.total', locale)}</span>
              <span className="text-xl font-bold text-wine">
                {formatPrice(displayTotal)}đ
              </span>
            </div>
            <p className="text-xs text-gray-400 text-center">{t('cart.freeShipping', locale)}</p>
            <Link href="/checkout" onClick={() => setIsOpen(false)} className="block">
              <Button className="w-full gap-2">
                {t('cart.checkout', locale)}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm text-text-muted hover:text-wine transition-colors"
            >
              {t('cart.continueShopping', locale)}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
