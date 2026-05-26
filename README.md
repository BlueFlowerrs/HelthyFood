# HelthyFood — Premium Nutrition E-Commerce

> Thực phẩm dinh dưỡng cao cấp cho cộng đồng fitness Việt Nam.
> Premium healthy food e-commerce for the Vietnamese fitness community.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage |
| ORM | `@supabase/ssr` client |
| State | Zustand (guest cart) + TanStack Query |
| Styling | Tailwind CSS |
| Payments | VNPAY Sandbox (simulated) |
| AI | Gemini 1.5 Flash |
| Charts | Recharts |
| Animation | Framer Motion, Three.js |
| Server Actions | Next.js Server Actions |
| Deployment | Docker + AWS Debian VPS |

---

## Key Features

- **Full E-Commerce**: Product catalog, shopping cart, checkout, order management
- **Auth System**: Supabase email/password with role-based access (user/admin)
- **Admin Dashboard**: Revenue charts, order management, product CRUD, AI descriptions
- **VNPAY Sandbox**: Simulated payment flow with signed tokens
- **Bilingual**: Full Vietnamese/English i18n
- **3D Landing**: Three.js-powered hero scene
- **Server Actions**: Real mutations via Next.js Server Actions
- **Docker-Ready**: Single-command deployment

---

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Note your **Project URL** and **anon/service role keys**

### 2. Run Database Schema

In Supabase SQL Editor, run the migrations in this order:

1. `supabase/migrations/0001_initial.sql` — core tables, RLS policies, RPC functions, seed data
2. `supabase/migrations/0002_fix_rls_policies.sql` — tightened RLS policies
3. `supabase/migrations/0003_contact_newsletter.sql` — contact messages and newsletter tables

Or paste them one by one.

### 3. Create Storage Bucket

In Supabase Dashboard → **Storage** → **Create bucket**:
- Name: `products`
- Public: **Yes**
- Allowed MIME types: `image/*`
- Max file size: `5MB`

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
VNPAY_SANDBOX_SECRET=generate-a-random-secret
```

Generate a random secret:
```bash
openssl rand -hex 32
```

### 5. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
helthyfood/
├── app/                        # Next.js 14 App Router
│   ├── page.tsx                # Landing page (3D hero)
│   ├── shop/                   # Product listing + detail
│   ├── cart/                   # Cart page
│   ├── checkout/               # Checkout → Payment → Success
│   ├── track/                  # Guest order tracking
│   ├── about/                  # About page
│   ├── contact/                # Contact form (real Supabase)
│   ├── account/                # Auth + profile + order history
│   ├── admin/                  # Admin dashboard
│   │   ├── products/           # Product CRUD
│   │   ├── categories/         # Category CRUD
│   │   ├── orders/             # Order management
│   │   └── promote-me/          # Bootstrap admin account
│   ├── api/                    # API routes
│   │   ├── products/, categories/
│   │   ├── cart/, orders/, profile/
│   │   ├── payments/vnpay/     # VNPAY sandbox
│   │   └── admin/              # Admin stats, upload, AI
│   ├── actions/                # Server Actions
│   │   ├── cart.ts             # addToCart, updateCart, removeCart
│   │   ├── profile.ts          # updateProfile
│   │   ├── contact.ts          # createContactMessage
│   │   └── newsletter.ts       # subscribeNewsletter
│   ├── loading.tsx             # Global loading state
│   └── error.tsx               # Global error boundary
│
├── components/ui/              # Shared UI components
├── features/landing/           # Landing page sections
│   ├── Hero.tsx, Categories.tsx, FeaturedProducts.tsx
│   ├── Benefits.tsx, MacroShowcase.tsx, Lifestyle.tsx
│   ├── Testimonials.tsx, CTABanner.tsx
│   └── ThreeScene.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server + Admin Supabase clients
│   ├── i18n/translations.ts    # VI/EN translations
│   └── cn.ts                   # Tailwind class merger
│
├── hooks/                      # useUser, useCart, useAddToCart
├── stores/cartStore.ts         # Zustand guest cart
├── providers/                  # Query, Locale, Toaster
├── middleware.ts               # Auth + session middleware
├── supabase/migrations/        # Database migrations
│   ├── 0001_initial.sql        # Core schema + RLS
│   ├── 0002_fix_rls_policies.sql
│   └── 0003_contact_newsletter.sql
├── deploy/nginx/               # Nginx config for VPS
├── docs/                       # Documentation
│   ├── quychethi.md            # Đồ án requirements
│   ├── deploy-aws-debian.md    # VPS deployment guide
│   ├── git-setup.md            # Git/GitHub setup
│   └── ai-prompts.md           # AI tools & prompts used
├── Dockerfile                  # Production Docker image
├── docker-compose.yml          # Docker Compose (app only)
├── .dockerignore               # Docker build exclusions
└── .env.example                # Environment template
```

---

## Database Schema

### Tables

| Table | Description |
|---|---|
| `profiles` | User profile with role (user/admin) |
| `categories` | Product categories |
| `products` | Products with nutrition info |
| `cart_items` | User shopping cart |
| `orders` | Orders with shipping info |
| `order_items` | Order line items |
| `payments` | Payment records |
| `contact_messages` | Contact form submissions |
| `newsletter_subscribers` | Newsletter subscriptions |

### RPC Functions

| Function | Description |
|---|---|
| `get_total_revenue()` | Sum of paid orders |
| `get_daily_revenue(days)` | Revenue grouped by day |
| `get_top_products(limit_n)` | Top selling products |

---

## Admin Bootstrap

1. Visit `/account/signup` — create an account
2. Visit `/admin/promote-me` — click the button to grant admin rights
3. Visit `/admin` — full dashboard unlocked

**Important:** Delete the `/admin/promote-me` page before production deployment.

---

## Payment Flow (VNPAY Sandbox)

1. Add products → go to `/checkout`
2. Fill shipping info → choose VNPAY → place order
3. Redirected to `/checkout/payment` — fake VNPAY UI
4. Click "Mô phỏng thành công" (simulate success) or "Mô phỏng thất bại" (simulate failure)
5. Redirected to `/checkout/success`

**Security:** Payment callbacks use HMAC-SHA256 signed tokens to prevent unauthorized status changes.

**Note:** This is a sandbox simulation, NOT a real payment integration. For production, implement the actual VNPAY API with IP whitelisting, checksums, and server-side validation.

---

## Server Actions

Real Server Actions (no API route overhead):

| Action | File | Description |
|---|---|---|
| `addToCartAction` | `app/actions/cart.ts` | Add product to cart |
| `updateCartItemAction` | `app/actions/cart.ts` | Update cart item quantity |
| `removeCartItemAction` | `app/actions/cart.ts` | Remove cart item |
| `updateProfileAction` | `app/actions/profile.ts` | Update user profile |
| `createContactMessageAction` | `app/actions/contact.ts` | Submit contact form |
| `subscribeNewsletterAction` | `app/actions/newsletter.ts` | Newsletter subscription |

---

## Docker Deployment

### Local Docker

```bash
docker compose up --build
```

App runs at `http://localhost:3000`

### Production (AWS VPS)

See `docs/deploy-aws-debian.md` for full deployment guide.

---

## Running Migrations

### In Supabase Dashboard

1. Open your Supabase project
2. Go to **SQL Editor**
3. Copy-paste contents of each migration file in order
4. Click **Run**

### After pulling updates

```bash
# Re-run migrations in Supabase SQL Editor
# Migrations are not auto-applied on pull
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (never expose client-side) |
| `GEMINI_API_KEY` | No | Gemini API key for AI descriptions |
| `NEXT_PUBLIC_APP_URL` | Yes | Production app URL |
| `NEXT_PUBLIC_SITE_URL` | Yes | Site URL |
| `VNPAY_SANDBOX_SECRET` | Yes | Secret for signed payment tokens |

---

## Git Setup

See `docs/git-setup.md` for GitHub setup instructions.

---

## AI Tools Used

This project uses AI assistance. See `docs/ai-prompts.md` for details on prompts and tools used.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Admin access denied | Visit `/admin/promote-me` after signing in |
| Three.js not rendering | Uses `dynamic()` import with `ssr: false` |
| Cart not syncing | Ensure Supabase env vars are set |
| TypeScript errors | Build errors should NOT be ignored |
| Docker build fails | Check Node.js version (requires Node 20) |
| Supabase connection failed | Verify URL and ANON_KEY in `.env.local` |
| VNPAY callback fails | Check `VNPAY_SANDBOX_SECRET` matches |
| Contact/Newsletter not working | Run migration `0003_contact_newsletter.sql` |

---

## Checklist for Demo

- [ ] Landing page with 3D scene loads
- [ ] Products display from Supabase
- [ ] Language toggle VI/EN works
- [ ] Add to cart works (guest + authenticated)
- [ ] Cart syncs when signing in
- [ ] Checkout flow completes
- [ ] VNPAY sandbox simulation works
- [ ] Order appears in account history
- [ ] Guest order tracking by code works
- [ ] Admin dashboard accessible after promote
- [ ] Admin can CRUD products and categories
- [ ] Contact form submits to Supabase
- [ ] Newsletter subscription works
- [ ] `npm run build` succeeds
- [ ] `docker compose config` passes
- [ ] Git repository initialized and pushed
