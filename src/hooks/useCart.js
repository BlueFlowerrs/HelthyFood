import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useUser from "../utils/useUser";
import { useGuestCartStore } from "../stores/cartStore";

export function useCart() {
  const { data: user } = useUser();
  const guestItems = useGuestCartStore((s) => s.items);

  const { data: serverCart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to load cart");
      return res.json();
    },
    enabled: !!user,
  });

  const items = user ? serverCart?.items || [] : guestItems;
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => {
    const price = i.product?.sale_price ?? i.product?.price ?? 0;
    return s + parseFloat(price) * i.quantity;
  }, 0);

  return { items, count, subtotal, loading: isLoading, isAuthed: !!user };
}

export function useAddToCart() {
  const { data: user } = useUser();
  const qc = useQueryClient();
  const guestAdd = useGuestCartStore((s) => s.add);

  return useMutation({
    mutationFn: async ({ product, quantity = 1 }) => {
      if (!user) {
        guestAdd(product, quantity);
        return { ok: true };
      }
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, quantity }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdateCartItem() {
  const { data: user } = useUser();
  const qc = useQueryClient();
  const guestUpdate = useGuestCartStore((s) => s.update);

  return useMutation({
    mutationFn: async ({ product_id, quantity }) => {
      if (!user) {
        guestUpdate(product_id, quantity);
        return { ok: true };
      }
      const res = await fetch(`/api/cart/${product_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useRemoveFromCart() {
  const { data: user } = useUser();
  const qc = useQueryClient();
  const guestRemove = useGuestCartStore((s) => s.remove);

  return useMutation({
    mutationFn: async ({ product_id }) => {
      if (!user) {
        guestRemove(product_id);
        return { ok: true };
      }
      const res = await fetch(`/api/cart/${product_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}
