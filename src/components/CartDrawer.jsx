import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useCartUIStore } from "../stores/cartStore";
import {
  useCart,
  useUpdateCartItem,
  useRemoveFromCart,
} from "../hooks/useCart";
import { useTranslation, useLocalized } from "../providers/LocaleProvider";
import { formatVND } from "../lib/cn";
import { Button } from "./ui/Button";

function CartLine({ item }) {
  const { locale } = useTranslation();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const name = item.product?.[`name_${locale}`] || item.product?.name_vi;
  const price = item.product?.sale_price ?? item.product?.price;

  return (
    <div className="flex gap-4 py-5 border-b border-[#070B06]/8">
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#DAD6D6] flex-shrink-0">
        <img
          src={item.product?.image_url}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-[#070B06] mb-1 line-clamp-2">
          {name}
        </h4>
        <p className="text-sm font-semibold text-[#8B2C4C] mb-3">
          {formatVND(price)}
        </p>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center border border-[#070B06]/15 rounded-full">
            <button
              onClick={() =>
                updateItem.mutate({
                  product_id: item.product_id,
                  quantity: item.quantity - 1,
                })
              }
              className="w-8 h-8 flex items-center justify-center text-[#070B06]/60 hover:text-[#070B06]"
              aria-label="Decrease"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-medium w-7 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                updateItem.mutate({
                  product_id: item.product_id,
                  quantity: item.quantity + 1,
                })
              }
              className="w-8 h-8 flex items-center justify-center text-[#070B06]/60 hover:text-[#070B06]"
              aria-label="Increase"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => removeItem.mutate({ product_id: item.product_id })}
            className="text-[#070B06]/50 hover:text-[#8B2C4C] p-1"
            aria-label="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { drawerOpen, closeDrawer } = useCartUIStore();
  const { items, count, subtotal } = useCart();
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[60] bg-[#070B06]/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "tween",
              duration: 0.3,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full sm:w-[440px] bg-[#DAD6D6] shadow-2xl flex flex-col"
          >
            <header className="px-6 py-5 border-b border-[#070B06]/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#070B06]" />
                <h2 className="font-serif text-2xl text-[#070B06]">
                  {t("cart.title")}
                </h2>
                <span className="text-xs text-[#070B06]/50">
                  ({count} {t("cart.itemCount")})
                </span>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-full hover:bg-[#070B06]/5"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-[#070B06]/5 mx-auto mb-5 flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-[#070B06]/40" />
                  </div>
                  <p className="text-[#070B06]/60 mb-1 font-medium">
                    {t("cart.empty")}
                  </p>
                  <p className="text-sm text-[#070B06]/40 mb-6">
                    {t("cart.emptyDesc")}
                  </p>
                  <Button
                    onClick={closeDrawer}
                    variant="primary"
                    size="md"
                    asChild
                  >
                    <a href="/shop">{t("cart.shopNow")}</a>
                  </Button>
                </div>
              ) : (
                <div>
                  {items.map((item) => (
                    <CartLine key={item.product_id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-[#070B06]/10 bg-white/30 backdrop-blur-sm px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#070B06]/70">
                    {t("common.subtotal")}
                  </span>
                  <span className="font-serif text-2xl font-medium text-[#070B06]">
                    {formatVND(subtotal)}
                  </span>
                </div>
                <a href="/checkout" onClick={closeDrawer}>
                  <Button variant="primary" size="lg" className="w-full">
                    {t("cart.proceedCheckout")}
                  </Button>
                </a>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
