import { create } from "zustand";
import { persist } from "zustand/middleware";

// Cart store — used for guest cart and UI state (drawer, etc.)
// When user is signed-in, server cart in DB is the source of truth via react-query.
export const useCartUIStore = create((set) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
}));

export const useGuestCartStore = create(
  persist(
    (set, get) => ({
      items: [], // [{ product_id, quantity, product: {...snapshot} }]
      add: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.product_id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.product_id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                product_id: product.id,
                quantity,
                product: {
                  id: product.id,
                  slug: product.slug,
                  name_vi: product.name_vi,
                  name_en: product.name_en,
                  price: product.price,
                  sale_price: product.sale_price,
                  image_url: product.image_url,
                  stock: product.stock,
                },
              },
            ],
          });
        }
      },
      update: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.product_id !== productId) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product_id === productId ? { ...i, quantity } : i,
          ),
        });
      },
      remove: (productId) => {
        set({ items: get().items.filter((i) => i.product_id !== productId) });
      },
      clear: () => set({ items: [] }),
    }),
    { name: "helthyfood:guest-cart" },
  ),
);
