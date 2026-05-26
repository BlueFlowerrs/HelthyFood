'use client'

import { useCartStore } from '@/stores/cartStore'

// Guest cart hooks (uses Zustand persisted store)
export function useGuestCart() {
  const { items, add, remove, updateQuantity, clear, getTotal, getCount, getSavings } = useCartStore()
  return {
    items,
    total: getTotal(),
    count: getCount(),
    savings: getSavings(),
    add,
    remove,
    updateQuantity,
    clear,
  }
}
