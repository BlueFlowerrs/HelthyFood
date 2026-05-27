'use client'

import { useCart } from '@/hooks/useCart'
import { useMutation } from '@tanstack/react-query'
import type { CartProduct } from '@/stores/cartStore'

export function useAddToCart() {
  const { add } = useCart()

  return useMutation({
    mutationFn: async ({ product, quantity = 1 }: { product: CartProduct; quantity?: number }) => {
      await add(product, quantity)
    },
  })
}
