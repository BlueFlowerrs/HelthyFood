'use client'

import { useCartStore, type CartProduct, type CartItem } from '@/stores/cartStore'
import { useUser } from '@/hooks/useUser'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCart() {
  const { user, loading: userLoading } = useUser()
  const queryClient = useQueryClient()
  const guestCart = useCartStore()

  // 1. Fetch backend cart when user is logged in
  const { data: serverCart, isLoading: serverLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await fetch('/api/cart')
      if (!res.ok) throw new Error('Failed to load cart')
      return res.json()
    },
    enabled: !!user,
  })

  // Unify the list shape: { product: CartProduct, quantity: number }[]
  const items: CartItem[] = user
    ? (serverCart?.items || []).map((item: any) => ({
        product: {
          id: item.product.id,
          slug: item.product.slug,
          name_vi: item.product.name_vi,
          name_en: item.product.name_en,
          price: Number(item.product.price),
          sale_price: item.product.sale_price ? Number(item.product.sale_price) : null,
          image_url: item.product.image_url,
          stock: item.product.stock,
          calories: item.product.calories,
          protein: item.product.protein ? Number(item.product.protein) : undefined,
          carbs: item.product.carbs ? Number(item.product.carbs) : undefined,
          fat: item.product.fat ? Number(item.product.fat) : undefined,
        },
        quantity: item.quantity,
      }))
    : guestCart.items

  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.sale_price ?? item.product.price
    return sum + price * item.quantity
  }, 0)

  const savings = items.reduce((sum, item) => {
    if (item.product.sale_price) {
      return sum + (item.product.price - item.product.sale_price) * item.quantity
    }
    return sum
  }, 0)

  const loading = userLoading || (!!user && serverLoading)

  // 2. Mutation for adding to cart
  const addMutation = useMutation({
    mutationFn: async ({ product, quantity = 1 }: { product: CartProduct; quantity?: number }) => {
      if (!user) {
        guestCart.add(product, quantity)
        return
      }
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity }),
      })
      if (!res.ok) throw new Error('Failed to add to cart')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Đã thêm vào giỏ hàng!')
      window.dispatchEvent(new Event('open-cart'))
    },
    onError: () => {
      toast.error('Không thể thêm vào giỏ!')
    },
  })

  // 3. Mutation for removing from cart
  const removeMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (!user) {
        guestCart.remove(productId)
        return
      }
      const res = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to remove item')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Đã xóa khỏi giỏ hàng!')
    },
    onError: () => {
      toast.error('Không thể xóa khỏi giỏ!')
    },
  })

  // 4. Mutation for updating quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      if (quantity <= 0) {
        if (!user) {
          guestCart.remove(productId)
          return
        }
        const res = await fetch(`/api/cart/${productId}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to remove item')
        return res.json()
      }

      if (!user) {
        guestCart.updateQuantity(productId, quantity)
        return
      }

      const res = await fetch(`/api/cart/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      if (!res.ok) throw new Error('Failed to update quantity')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: () => {
      toast.error('Không thể cập nhật số lượng!')
    },
  })

  // 5. Mutation for clearing cart
  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        guestCart.clear()
        return
      }
      const res = await fetch('/api/cart', {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to clear cart')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Đã xóa toàn bộ giỏ hàng!')
    },
    onError: () => {
      toast.error('Không thể xóa giỏ hàng!')
    },
  })

  return {
    items,
    count,
    subtotal,
    savings,
    loading,
    add: async (product: CartProduct, quantity = 1) => {
      await addMutation.mutateAsync({ product, quantity })
    },
    remove: async (productId: number) => {
      await removeMutation.mutateAsync(productId)
    },
    updateQuantity: async (productId: number, quantity: number) => {
      await updateQuantityMutation.mutateAsync({ productId, quantity })
    },
    clear: async () => {
      await clearMutation.mutateAsync()
    },
  }
}
