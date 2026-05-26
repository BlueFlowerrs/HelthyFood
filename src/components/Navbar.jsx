import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, User, Leaf } from "lucide-react";
import { useTranslation } from "../providers/LocaleProvider";
import { useCartUIStore, useGuestCartStore } from "../stores/cartStore";
import useUser from "../utils/useUser";
import { cn } from "../lib/cn";

function LangSwitch() {
  const { locale, setLocale } = useTranslation();
  return (
    <div className="inline-flex items-center rounded-full border border-[#070B06]/15 p-0.5 bg-white/50 backdrop-blur-sm">
      {["vi", "en"].map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={cn(
            "px-3 py-1 text-[11px] font-medium uppercase tracking-wider rounded-full transition-colors",
            locale === l
              ? "bg-[#223D19] text-white"
              : "text-[#070B06]/60 hover:text-[#070B06]",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export default function Navbar({ variant = "light" }) {
  const { t } = useTranslation();
  const { data: user } = useUser();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pathname, setPathname] = useState("/");
  const openCart = useCartUIStore((s) => s.openDrawer);
  const guestItems = useGuestCartStore((s) => s.items);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);

  const cartCount = guestItems.reduce((s, i) => s + i.quantity, 0);
  const dark = variant === "dark" && !scrolled;

  const NAV_ITEMS = [
    { href: "/", key: "nav.home" },
    { href: "/shop", key: "nav.shop" },
    { href: "/about", key: "nav.about" },
    { href: "/contact", key: "nav.contact" },
  ];

  // Check if a nav link is currently active
  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#DAD6D6]/90 backdrop-blur-xl border-b border-[#070B06]/8"
          : dark
            ? "bg-transparent"
            : "bg-[#DAD6D6]/60 backdrop-blur-md",
      )}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-6">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-[#8B2C4C] flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" strokeWidth={2.2} />
          </div>
          <span
            className={cn(
              "font-serif text-xl tracking-tight font-medium",
              dark ? "text-white" : "text-[#070B06]",
            )}
          >
            HelthyFood
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-9">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-[13px] tracking-wide uppercase font-medium transition-colors pb-1",
                  active
                    ? dark
                      ? "text-[#d4a574]"
                      : "text-[#8B2C4C]"
                    : dark
                      ? "text-white/80 hover:text-white"
                      : "text-[#070B06]/65 hover:text-[#070B06]",
                )}
              >
                {t(item.key)}
                {/* Underline indicator */}
                {active && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{ backgroundColor: dark ? "#d4a574" : "#8B2C4C" }}
                  />
                )}
              </a>
            );
          })}
          {user ? null : (
            <div className="hidden md:flex items-center gap-2">
              <a
                href="/track"
                className={cn(
                  "inline-flex items-center text-[12px] uppercase tracking-wider font-medium px-4 h-9 rounded-full border transition-colors",
                  dark
                    ? "border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                    : "border-[#070B06]/10 text-[#070B06]/60 hover:bg-[#070B06]/5 hover:text-[#070B06]",
                  isActive("/track") &&
                    (dark
                      ? "text-[#d4a574]"
                      : "text-[#8B2C4C] border-[#8B2C4C]/30"),
                )}
              >
                Theo dõi đơn
              </a>
              <a
                href="/account/signin"
                className={cn(
                  "inline-flex items-center text-[12px] uppercase tracking-wider font-medium px-4 h-9 rounded-full border transition-colors",
                  dark
                    ? "border-white/30 text-white hover:bg-white/10"
                    : "border-[#070B06]/15 text-[#070B06] hover:bg-[#070B06]/5",
                )}
              >
                {t("nav.signIn")}
              </a>
            </div>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <LangSwitch />
          <a
            href="/cart"
            onClick={(e) => {
              e.preventDefault();
              openCart();
            }}
            className={cn(
              "relative p-2 rounded-full transition-colors",
              dark
                ? "text-white hover:bg-white/10"
                : "text-[#070B06] hover:bg-[#070B06]/5",
            )}
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.6} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#8B2C4C] text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </a>
          {user ? (
            <a
              href="/account"
              className={cn(
                "relative p-2 rounded-full transition-colors",
                dark
                  ? "text-white hover:bg-white/10"
                  : "text-[#070B06] hover:bg-[#070B06]/5",
                isActive("/account") && "text-[#8B2C4C]",
              )}
              aria-label="Account"
            >
              <User className="w-5 h-5" strokeWidth={1.6} />
              {isActive("/account") && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#8B2C4C]" />
              )}
            </a>
          ) : null}
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              "lg:hidden p-2 rounded-full",
              dark ? "text-white" : "text-[#070B06]",
            )}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#DAD6D6] border-t border-[#070B06]/10">
          <div className="px-6 py-6 space-y-1">
            {[
              ...NAV_ITEMS,
              ...(user
                ? [{ href: "/account", key: "nav.account" }]
                : [
                    { href: "/track", key: "nav.track" },
                    { href: "/account/signin", key: "nav.signIn" },
                  ]),
            ].map((item) => {
              const active = isActive(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors",
                    active
                      ? "text-[#8B2C4C] bg-[#8B2C4C]/8"
                      : "text-[#070B06] hover:bg-[#070B06]/5",
                  )}
                >
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B2C4C] flex-shrink-0" />
                  )}
                  {t(item.key)}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
