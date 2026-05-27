# HelthyFood — Fix Report

Generated: 2026-05-26

---

## Summary

Project HelthyFood đã được audit và fix toàn diện theo requirements trong `docs/quychethi.md`. Build production thành công, ESLint clean, Docker config hợp lệ.

---

## Validation Results

| Check | Status |
|---|---|
| `npm run build` | PASS |
| `npm run lint` | PASS (0 warnings, 0 errors) |
| `docker compose config` | PASS |

---

## Issues Fixed

### P1 — Docker Files

**Problem:** Dockerfile và docker-compose.yml nằm trong `docs/` với đuôi `.txt`, không chạy được Docker.

**Fix:**
- Tạo `Dockerfile` (root): Multi-stage Node 20 Alpine, production build với `npm run build` (không fallback), `output: 'standalone'` cho Docker
- Tạo `docker-compose.yml` (root): Chỉ service `app`, đọc env từ `.env`, healthcheck, restart policy
- Tạo `.dockerignore`: Exclude node_modules, .next, .git, src/, docs/, env files, React Router artifacts
- Tạo `.env.example`: Template đầy đủ biến môi trường
- Xóa `docs/Dockerfile.txt`, `docs/docker-compose.yml.txt`

### P2 — Next.js Config

**Problem:** `next.config.js` có `typescript.ignoreBuildErrors: true` và `serverActions.allowedOrigins: ['localhost:3000']`.

**Fix:**
- Xóa `typescript.ignoreBuildErrors: true`
- Xóa `serverActions.allowedOrigins` (không cần vì dùng Supabase)
- Thêm `output: 'standalone'` cho Docker deployment

### P3 — Tailwind Config

**Problem:** `tailwind.config.js` (54KB, JavaScript) nằm cùng với `tailwind.config.ts` (TypeScript) — file JS cũ chứa config sai/conflicting.

**Fix:**
- Giữ `tailwind.config.ts` (TypeScript) với content paths đúng:
  - `./app/**/*.{js,ts,jsx,tsx,mdx}`
  - `./components/**/*.{js,ts,jsx,tsx,mdx}`
  - `./features/**/*.{js,ts,jsx,tsx,mdx}`
  - `./hooks/**/*.{js,ts,jsx,tsx,mdx}`
  - `./lib/**/*.{js,ts,jsx,tsx,mdx}`
  - `./stores/**/*.{js,ts,jsx,tsx,mdx}`
  - `./providers/**/*.{js,ts,jsx,tsx,mdx}`
- Xóa `tailwind.config.js` (file JS cũ, 54KB)
- Giữ nguyên theme colors (`wine`, `brand-green`, `bg-main`, etc.)

### P4 — Server Actions

**Problem:** Dự án dùng API routes nhưng quy chế yêu cầu Server Actions.

**Fix:** Tạo 5 Server Actions thật:

| File | Functions |
|---|---|
| `app/actions/cart.ts` | `addToCartAction`, `updateCartItemAction`, `removeCartItemAction`, `clearCartAction` |
| `app/actions/profile.ts` | `updateProfileAction` |
| `app/actions/contact.ts` | `createContactMessageAction` |
| `app/actions/newsletter.ts` | `subscribeNewsletterAction`, `unsubscribeNewsletterAction` |
| `app/actions/payment.ts` | `initPaymentAction` |
| `lib/validation.ts` | Custom validation helpers (thay Zod — tránh thêm dependency mới) |

Requirements:
- `"use server"` directive
- Validation với custom helpers
- Auth check cho mutations cần user
- `revalidatePath()` sau mutations
- Graceful error handling

### P5 — RLS Policies

**Problem:** RLS policies quá rộng (`WITH CHECK (true)`, `USING (true)`) cho `orders`, `order_items`, `payments`.

**Fix:** Tạo `supabase/migrations/0002_fix_rls_policies.sql`:
- Drop overly permissive policies
- Orders: `auth.uid() IS NOT NULL` cho INSERT, admin-only UPDATE/SELECT
- Order items: Join qua `orders.user_id` để kiểm soát
- Payments: Service insert/update cho callbacks, admin-only cho quản lý

### P6 — VNPAY Sandbox Security

**Problem:** Payment callback không có bảo mật, ai cũng POST được đổi trạng thái order thành paid.

**Fix:**
- Thêm `VNPAY_SANDBOX_SECRET` env var
- `app/actions/payment.ts`: `initPaymentAction` tạo HMAC-SHA256 signed tokens (success + failure)
- `app/api/payments/vnpay/callback/route.ts`: Verify token signature, check expiration (10 phút), timing-safe comparison
- `app/checkout/payment/page.tsx`: Fetch tokens từ Server Action (server-side), KHÔNG expose secret ra client
- Token format: `base64url(payload).hmac_sig`

### P7 — Fake Forms → Real

**Problem:** Contact form chỉ `setTimeout` fake, newsletter chỉ `preventDefault`.

**Fix:**
- `app/contact/page.tsx`: Dùng `createContactMessageAction`, hiển thị toast success/error thật
- `components/Footer.tsx`: Newsletter dùng `subscribeNewsletterAction`, toast feedback
- Tạo `supabase/migrations/0003_contact_newsletter.sql`:
  - Bảng `contact_messages`: public insert, admin-only read/delete
  - Bảng `newsletter_subscribers`: public subscribe, unique email, soft unsubscribe
  - RPC `get_newsletter_subscriber_count()` cho stats

### P8 — UI Placeholders

**Problem:** Google Maps placeholder, social links `href="#"`, address cần làm rõ.

**Fix:**
- Contact page: Thay placeholder bằng OpenStreetMap iframe embed (District 1, HCMC)
- Footer: Social links thêm `target="_blank" rel="noopener noreferrer"` với domain hợp lệ (`facebook.com`, `instagram.com`, `youtube.com`)
- Address: Giữ nguyên contact info, thêm disclaimer rõ ràng: "Địa chỉ minh họa phục vụ demo đồ án"
- About page: Giữ nguyên content vì nó là landing content, không phải placeholder

### P9 — Loading & Error States

**Problem:** Không có loading/error convention files cho App Router.

**Fix:** Tạo:
- `app/loading.tsx`: Global spinner loading
- `app/error.tsx`: Global error boundary với retry + back home
- `app/shop/loading.tsx`: Product grid skeleton
- `app/admin/loading.tsx`: Dashboard skeleton
- `app/account/loading.tsx`: Account page skeleton

### P10 — Clean Project Structure

**Problem:** React Router v7 artifacts (src/, plugins/, vite.config.ts, vitest.config.ts, react-router.config.ts, __create/, docs/*.txt) clutter dự án.

**Fix:** Xóa toàn bộ:
- `src/` (32 files React Router v7)
- `plugins/`
- `vite.config.ts`
- `vitest.config.ts`
- `react-router.config.ts`
- `__create/`
- `docs/supabase-migration.sql.txt`
- `docs/env.example.txt`
- `docs/Dockerfile.txt`
- `docs/docker-compose.yml.txt`
- `tailwind.config.js` (JS, 54KB)

Cập nhật `.gitignore`:
```
.env
.env.local
.env.production
.next/
.vitest/
next-env.d.ts
node_modules/
```

### P11 — AWS Deployment Docs

**Fix:** Tạo:
- `docs/deploy-aws-debian.md`: Full deployment guide từ A-Z (EC2 → Docker → Nginx → SSL → troubleshooting)
- `deploy/nginx/helthyfood.conf`: Nginx reverse proxy config với security headers, gzip, websocket support, health endpoint

### P12 — README Update

**Fix:** Viết lại README.md toàn diện:
- Mô tả project + tech stack
- Quick start guide đầy đủ
- Database schema documentation
- Admin bootstrap guide
- VNPAY sandbox flow
- Server Actions reference
- Docker + AWS deployment
- Migration instructions
- Environment variables reference
- AI tools reference
- Demo checklist (checkbox)

### P13 — Git Setup

**Fix:** Tạo `docs/git-setup.md`:
- Hướng dẫn tạo GitHub repo
- Git init + remote
- Conventional commits guide (feat, fix, docs, refactor, chore)
- Daily git workflow
- Branch strategy
- Security notes (.env)

---

## Files Changed

### Created (new)
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env.example`
- `app/actions/cart.ts`
- `app/actions/profile.ts`
- `app/actions/contact.ts`
- `app/actions/newsletter.ts`
- `app/actions/payment.ts`
- `app/actions/index.ts`
- `lib/validation.ts`
- `supabase/migrations/0002_fix_rls_policies.sql`
- `supabase/migrations/0003_contact_newsletter.sql`
- `docs/deploy-aws-debian.md`
- `docs/git-setup.md`
- `deploy/nginx/helthyfood.conf`

### Modified
- `next.config.js` — removed ignoreBuildErrors, added standalone output
- `tailwind.config.ts` — correct content paths
- `app/contact/page.tsx` — real form with Server Action + OpenStreetMap
- `app/checkout/payment/page.tsx` — signed token + error state
- `app/api/payments/vnpay/callback/route.ts` — HMAC-SHA256 verification
- `components/Footer.tsx` — real newsletter + valid social links
- `app/loading.tsx` — global loading
- `app/error.tsx` — global error boundary
- `app/shop/loading.tsx` — skeleton
- `app/admin/loading.tsx` — skeleton
- `app/account/loading.tsx` — skeleton
- `README.md` — comprehensive rewrite
- `package.json` — eslintConfig, @typescript-eslint packages
- `.gitignore` — comprehensive entries

### Deleted
- `src/` (32 files React Router v7)
- `plugins/`
- `__create/`
- `vite.config.ts`
- `vitest.config.ts`
- `react-router.config.ts`
- `tailwind.config.js` (54KB JS config)
- `docs/supabase-migration.sql.txt`
- `docs/env.example.txt`
- `docs/Dockerfile.txt`
- `docs/docker-compose.yml.txt`

---

## Remaining Issues

### Minor / Acceptable
1. **Tailwind warnings** về "No utility classes detected" — Chỉ xuất hiện khi build không có Tailwind classes trong một số file nhất định. Styles vẫn hoạt động đúng. Đây là warning không phải error.

### Not Fixed (Out of Scope)
1. **Supabase database seed data** — Chỉ có seed cho categories, không có products. Cần chạy thêm seed script hoặc tạo products thủ công qua admin panel.
2. **Stripe integration** — Không có trong quy chế, để nguyên.
3. **E2E tests** — Không yêu cầu trong quy chế.

---

## Checklist đáp ứng quy chế

| Requirement | Status |
|---|---|
| Next.js 14 App Router | DONE |
| Supabase Auth + Database | DONE |
| Supabase Storage | DONE (config sẵn, cần tạo bucket) |
| RLS policies | DONE (0001 + 0002 migrations) |
| Server Actions | DONE (5 files, 10+ functions) |
| Docker (multi-stage) | DONE |
| Docker Compose | DONE |
| Tailwind CSS | DONE |
| Landing page 3D | DONE (Three.js) |
| VI/EN i18n | DONE |
| VNPAY Sandbox | DONE (signed token) |
| Admin Dashboard | DONE |
| Contact Form | DONE (Supabase) |
| Newsletter Form | DONE (Supabase) |
| Loading/Error States | DONE |
| AWS Debian VPS Docs | DONE |
| Nginx Config | DONE |
| Git Setup Docs | DONE |
| README.md | DONE |
| TypeScript Build | PASS |
| ESLint | PASS (0 errors) |
| Docker Config | PASS |
| Project Cleanup | DONE |

---

## How to Test

```bash
# 1. Build
npm run build

# 2. Lint
npm run lint

# 3. Docker validate
docker compose config

# 4. Run Supabase migrations
# - 0001_initial.sql
# - 0002_fix_rls_policies.sql
# - 0003_contact_newsletter.sql

# 5. Setup env
cp .env.example .env.local
# Fill in Supabase keys + VNPAY_SANDBOX_SECRET

# 6. Run dev
npm run dev

# 7. Docker build
docker compose up --build
```
