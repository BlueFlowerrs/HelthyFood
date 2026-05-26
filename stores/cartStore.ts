import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartProduct {
  id: number
  slug: string
  name_vi: string
  name_en: string
  price: number
  sale_price: number | null
  image_url: string | null
  stock: number
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
}

export interface CartItem {
  product: CartProduct
  quantity: number
}

interface CartState {
  items: CartItem[]
  add: (product: CartProduct, quantity?: number) => void
  remove: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clear: () => void
  getTotal: () => number
  getCount: () => number
  getSavings: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, { product, quantity }] }
        })
      },

      remove: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().remove(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clear: () => set({ items: [] }),

      getTotal: () => {
        const { items } = get()
        return items.reduce((sum, item) => {
          const price = item.product.sale_price ?? item.product.price
          return sum + price * item.quantity
        }, 0)
      },

      getCount: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getSavings: () => {
        const { items } = get()
        return items.reduce((sum, item) => {
          if (item.product.sale_price) {
            const originalPrice = item.product.price
            const salePrice = item.product.sale_price
            return sum + (originalPrice - salePrice) * item.quantity
          }
          return sum
        }, 0)
      },
    }),
    {
      name: 'helthyfood:guest-cart',
    }
  )
)
