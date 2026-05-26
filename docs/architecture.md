# 🏛 HelthyFood — Architecture

This document explains the architectural decisions behind HelthyFood, intended for the oral defense.

---

## 1. High-level overview

HelthyFood follows the **Next.js App Router** pattern (mirrored on React + Vite) with feature-folder organization:

```
src/
├── app/         — Routes (file-based, mirrors Next.js App Router)
├── api routes   — Node.js serverless handlers
├── components/  — Shared UI building blocks
├── features/    — Domain-specific features (landing, shop, admin)
├── providers/   — React context providers (QueryClient, Locale)
├── hooks/       — Reusable hooks (useCart)
├── stores/      — Zustand stores (cart UI state)
├── lib/         — Pure utilities (cn, i18n, assets)
└── utils/       — Platform hooks (useAuth, useUser, useUpload)
```

---

## 2. Routing model

- **File-based routing**: `src/app/<path>/page.jsx` → route `/<path>`
- **Dynamic routes**: `[slug]`, `[id]`
- **API routes**: `src/app/api/<path>/route.js` → `/api/<path>` with `GET`, `POST`, `PATCH`, `DELETE` exports
- **Layout**: `src/app/layout.jsx` wraps every page with `QueryClientProvider`, `LocaleProvider`, `Toaster`, and the global `CartDrawer`

---

## 3. Data flow

### Read path (products, categories, cart, orders)
1. Component calls `useQuery(['key'], queryFn)`
2. `queryFn` does `fetch('/api/...')`
3. API handler imports `sql` template tag → queries Postgres
4. Result cached by TanStack Query for 1 minute
5. UI re-renders on success/error

### Write path (cart, orders, products)
1. Component calls `useMutation(mutationFn)`
2. Optimistic updates via `onMutate` where appropriate
3. On success: `queryClient.invalidateQueries` refetches affected lists
4. Toast confirmation via Sonner

---

## 4. Authentication + Roles

- Auth handled by NextAuth-compatible adapter (`@/auth`)
- User signs up / signs in → cookie session created
- API routes call `await auth()` to get the session
- Admin role stored in `profiles.role` ('user' | 'admin')
- `/admin/promote-me` bootstrap route promotes first admin (deletable post-setup)
- `AdminLayout.jsx` gates all `/admin/*` routes by fetching `/api/profile` and checking role

---

## 5. Cart strategy (guest + authenticated)

- **Guest cart**: persisted in `localStorage` via Zustand `persist` middleware (`stores/cartStore.js`)
- **Authenticated cart**: `cart_items` table, scoped to `user_id`
- `useCart` hook returns the right source based on `useUser()`
- Cart drawer (`components/CartDrawer.jsx`) is rendered globally and toggled via `useCartUIStore`

---

## 6. Fake VNPAY flow

1. Checkout submits → `/api/orders` creates order (status `pending`)
2. If `payment_method === "vnpay"`: `/api/payments/vnpay/initiate` records a `payments` row with `transaction_id`, returns redirect URL
3. User redirected to `/checkout/payment?txn=<id>&order=<code>` — realistic VNPAY-styled UI with countdown timer + test card visual
4. User clicks "Mô phỏng thanh toán thành công" → `/api/payments/vnpay/callback` finalizes payment (uses `sql.transaction`), updates `orders.status` to `paid` (or `failed`), clears cart on success
5. Redirect to `/checkout/success?order=<code>` showing order summary

---

## 7. i18n architecture

- All UI text passes through `t('nav.home')` from `useTranslation()`
- Translations are nested objects in `src/lib/i18n/translations.js`
- `useLocalized(row, 'name')` reads `name_vi` / `name_en` from database rows
- Locale persisted in `localStorage` and toggled via navbar pill

---

## 8. Design system

| Token | Value | Usage |
|---|---|---|
| Wine | `#8B2C4C` | Primary CTAs, brand accents, hero highlights, sale badges |
| Soft Neutral | `#DAD6D6` | Main background, soft surfaces |
| Organic Green | `#405C36` | Healthy tags, nutrition badges, secondary actions |
| Dark Green | `#223D19` | Cards (admin sidebar, checkout summary), footer fallback |
| Black-Green | `#070B06` | Body text, premium dark sections, footer |

Typography:
- **Headlines**: `font-serif` (editorial serif) with `tracking-tight` and font-weight 500
- **Body**: clean sans (Tailwind default)
- **Labels / metadata**: `text-[10px] uppercase tracking-wider`

Components avoid drop shadows — depth comes from border layering and palette contrast.

---

## 9. 3D Hero (Three.js)

- Mounted via `useEffect` in `features/landing/ThreeScene.jsx` for SSR safety
- 9 organic primitives + 200-particle field
- Two colored point lights (wine + green) for brand presence
- Camera lerped toward mouse position for smooth parallax
- **Full resource disposal on unmount** — geometries, materials, renderer — prevents memory leaks

---

## 10. Performance considerations

- TanStack Query default `staleTime: 1 minute` prevents unnecessary refetches
- Images use `loading="lazy"` for off-screen products
- Three.js scene uses `Math.min(window.devicePixelRatio, 2)` to cap rendering cost on retina screens
- Particle count tuned to 200 — visible but not GPU-bound
- Mobile cart drawer uses CSS transforms (GPU-accelerated)

---

## 11. Deployment topology (target VPS)

```
[Cloudflare] ──► [Nginx :443] ──► [Next.js app :3000] ──► [Postgres :5432]
       ↑                ↑                   ↑
    SSL/TLS          Reverse           Server actions
    Full strict     proxy + SSL         + RLS queries
```

- Cloudflare handles edge caching + DDoS protection
- Nginx terminates SSL (Let's Encrypt), proxies to Node app, serves static asset cache headers
- Postgres deployed as separate container with persisted volume
- Auto SSL renewal via certbot cron
