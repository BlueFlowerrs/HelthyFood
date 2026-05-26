'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCartStore, type CartProduct } from '@/stores/cartStore'
import { useUser } from '@/hooks/useUser'

export function useAddToCart() {
  const supabase = createClient()
  const { user } = useUser()
  const queryClient = useQueryClient()
  const { add: guestAdd } = useCartStore()

  return useMutation({
    mutationFn: async ({ product, quantity = 1 }: { product: CartProduct; quantity?: number }) => {
      if (!user) {
        guestAdd(product, quantity)
        return null
      }
      const { error } = await supabase
        .from('cart_items')
        .upsert(
          { user_id: user.id, product_id: product.id, quantity },
          { onConflict: 'user_id,product_id' }
        )
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
