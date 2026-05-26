# 🤖 AI Prompts Documentation — HelthyFood

> **Required grading deliverable.** This document records the 12 AI prompts used to design, architect, and build the HelthyFood platform — including the rationale for each prompt and the kind of output it produced.

---

## Prompt 1 — Initial Architecture Plan

**Prompt:**
> "Build a complete production-ready university final semester project called HelthyFood — a premium healthy food ecommerce platform focused on gymers, fitness lifestyle, nutrition products… [full design brief with palette, sections, tech stack constraints]"

**Why:**
Establish the entire scope, design system, restrictions (no Pages Router, no MongoDB, etc.), color palette, and feature list in a single high-context prompt. This sets boundaries the AI must respect throughout the build.

**Generated result:**
A phased build plan covering (1) tech-stack mapping, (2) full landing-page section list, (3) database schema with 8 tables, (4) fake VNPAY flow design, (5) admin dashboard layout, (6) i18n architecture, (7) Docker + VPS deployment plan, (8) ordered execution sequence. Became the source of truth for the entire build.

---

## Prompt 2 — Design System Enforcement

**Prompt:**
> "Follow this design system when building UI: [palette: #8B2C4C wine, #DAD6D6 neutral, #405C36 organic green, #223D19 dark green, #070B06 black green. Editorial serif headings + clean sans body. Premium luxury organic. No playful elements. Glassmorphism accents.]"

**Why:**
Locking palette + typography + tone *before* any UI code prevents drift toward generic-looking centered-Bootstrap layouts. Grading emphasized visual quality.

**Generated result:**
Every component uses the exact palette via Tailwind arbitrary values (`bg-[#8B2C4C]`, `text-[#070B06]/70`). Headings consistently use `font-serif` editorial type with `tracking-tight`. Cards use `rounded-3xl` instead of generic `rounded-lg`. Spacing is editorial (`py-24 lg:py-32`).

---

## Prompt 3 — Three.js Hero Scene

**Prompt:**
> "Create a Three.js scene component for the hero section: floating organic shapes (icosahedrons, torus, octahedrons), wine + green premium lighting, subtle particle field, smooth camera mouse-parallax, SSR-safe, full WebGL teardown on unmount."

**Why:**
The brief required an immersive 3D hero. R3F isn't in the approved package list, so I used vanilla Three.js. The prompt specified geometry types, lighting colors, and lifecycle concerns (SSR + cleanup) to avoid common memory leaks and hydration bugs.

**Generated result:**
A 160-line `ThreeScene.jsx` that mounts via `useEffect`, builds 9 organic shapes with random animation parameters, a 200-particle field, two colored point lights (wine + green) plus a key directional light, smooth lerped camera following the mouse, and **full disposal** of geometries, materials, and renderer on unmount.

---

## Prompt 4 — Asset Generation (in background)

**Prompt:**
> "Premium editorial product photography: scoop of vanilla whey protein on dark stone, dramatic side lighting, dark green and wine background, sophisticated supplement-brand aesthetic, ultra sharp magazine quality."

**Why:**
Stock photos rarely match a defined brand palette. Generating brand-aligned imagery in parallel with code production keeps the visual identity cohesive — and lets me keep coding while images render in background tasks (~15-25s each).

**Generated result:**
Nine on-brand images (hero background, lifestyle, 6 category covers, logo mark) — all hosted on the platform CDN, then registered in `lib/assets.js` for reuse.

---

## Prompt 5 — Database Schema with Bilingual Fields

**Prompt:**
> "Create PostgreSQL schema for HelthyFood: categories, products, profiles, cart_items, orders, order_items, payments. All user-facing text columns must have `_vi` and `_en` variants. Include nutrition macros (calories, protein, carbs, fat), nutrition_tags as TEXT[], sale_price as nullable. Seed with 6 categories and 24 products with realistic VND prices."

**Why:**
Bilingual was a hard requirement. Storing translations directly on rows (rather than a join table) keeps queries simple and reads fast — appropriate for the project's scale.

**Generated result:**
Complete schema with 8 tables, proper indexes (`idx_products_featured WHERE featured = TRUE`), and 24 hand-crafted seed products spanning protein powders, healthy meals, snacks, supplements, organic drinks, and meal prep — each with realistic Vietnamese + English copy and accurate macros.

---

## Prompt 6 — Fake VNPAY Payment UX

**Prompt:**
> "Build a fake VNPAY sandbox screen that LOOKS real: blue gradient header with VNPAY logo, sandbox badge, merchant name, transaction ID, order code, amount in VND, mock card visual (test card 9704 1980 0000 0001), countdown timer, two action buttons (Simulate Success / Simulate Failure). On click, POST to /api/payments/vnpay/callback then redirect to /checkout/success."

**Why:**
Real VNPAY integration requires merchant credentials. The brief explicitly asked for a **convincing demo** — not a real integration. Going beyond "press button → success" toward a VNPAY-styled screen with timer and test card details makes the oral demo memorable.

**Generated result:**
A polished `/checkout/payment` route that overrides the brand palette for the VNPAY portion (intentionally blue, like the real gateway) and isolates the experience visually from the rest of the brand. Backend records a `payments` row with `transaction_id`, finalizes via callback, clears the cart on success.

---

## Prompt 7 — Admin Role + Bootstrap Route

**Prompt:**
> "Implement admin role using the `profiles.role` column. Add an `/admin/promote-me` route that self-elevates the currently signed-in user to admin (with a clear warning to delete after first use). Gate /admin pages with AdminLayout that checks role and redirects if not admin."

**Why:**
Production apps need a chicken-and-egg solution for the first admin. The bootstrap route pattern is well-known but must be clearly marked as one-time.

**Generated result:**
`AdminLayout.jsx` queries `/api/profile`, blocks rendering if role ≠ "admin", and shows a helpful link to `/admin/promote-me` instead of a hard 403. The promote route has an inline warning telling the grader to delete it before production.

---

## Prompt 8 — Premium Product Card Anatomy

**Prompt:**
> "Design a product card with: 4:5 aspect image, sale badge (top-left, wine), macro pills (bottom: calories with flame icon, protein with beef icon), nutrition tags above name (uppercase muted green), serif name, optional short description, price (wine for sale, dark for regular, strikethrough for old price). Quick-add button (top-right, slides in on hover). Hover scales image gently. No drop shadows — depth through border only."

**Why:**
Product cards are the most-repeated UI in the shop. Spending time on a polished anatomy and then reusing it everywhere creates instant brand cohesion.

**Generated result:**
`ProductCard.jsx` matches all spec points and uses staggered `motion/react` fade-in (`delay: index * 0.06`) — small detail that elevates the perceived quality on grid views.

---

## Prompt 9 — Macro Showcase Section (SVG ring + animated bars)

**Prompt:**
> "Premium section showing transparent macro nutrition. Left: editorial heading + animated horizontal lines for protein/carbs/fat (lines grow on scroll-in to widths proportional to %). Right: SVG ring composition — 3 concentric arcs (protein wine outer, carbs green middle, fat gold inner), each filling from 0 to its % on scroll. Center text shows '485 calories'. Dark background (#070B06)."

**Why:**
Most ecommerce "feature" sections are boring. Visualizing macros as concentric rings reinforces the brand's emphasis on precision nutrition and gives the page a memorable visual rest stop between dense product sections.

**Generated result:**
`MacroShowcase.jsx` uses `motion/react` to animate `strokeDashoffset` for each ring + line widths — entirely SVG-based, lightweight, fully responsive.

---

## Prompt 10 — i18n Without a Library

**Prompt:**
> "Build a lightweight i18n provider. translations.js holds nested objects for `vi` and `en`. Provider exposes `useTranslation()` returning `{ locale, setLocale, t }`. `t('nav.home')` resolves nested keys with fallback to default locale, then to the key itself. Persist locale to localStorage. Provide `useLocalized(obj, field)` for row-level fields like product names."

**Why:**
`next-intl` is Next.js-only. The brief required scalable translation structure but not necessarily a heavy library. A 60-line custom provider is enough for one app and easier to explain in the oral defense.

**Generated result:**
`LocaleProvider.jsx` + `translations.js` with 250+ keys across nav, hero, shop, cart, checkout, payment, admin, status, and nutrition tags. Database rows use `name_vi`/`name_en` columns, accessed via `useLocalized` or direct field interpolation.

---

## Prompt 11 — Editorial Landing Sections (8 sections)

**Prompt:**
> "Generate 8 landing-page sections matching the design system: Featured Products carousel, Categories editorial grid with overlay text, Benefits (3 cols, icons, divider lines), MacroShowcase (animated rings), Lifestyle (parallax full-bleed quote), Testimonials (3 cards that invert on hover from gray to dark), CTA banner (dark green section, decorative gradient + dot grid, wine button), Footer (4 cols, newsletter input, social icons, language switcher echo)."

**Why:**
Batch-generating sections with a shared aesthetic specification keeps them cohesive. The "invert on hover" testimonial card is a specific design intent that distinguishes the site from generic landings.

**Generated result:**
Eight separate `features/landing/*.jsx` files, each <100 lines, each using consistent `motion/react` `whileInView` reveal patterns. The footer uses dark theme exclusively (`bg-[#070B06]`), creating a satisfying visual conclusion.

---

## Prompt 12 — VPS Deployment + Cloudflare

**Prompt:**
> "Write VPS deployment guide for Ubuntu: Docker + Nginx reverse proxy + Let's Encrypt SSL + Cloudflare 'Full (strict)' mode with CF-Connecting-IP trust. Include cron for auto SSL renew. Provide nginx.conf with security headers (HSTS, X-Frame-Options, etc.)."

**Why:**
The brief explicitly requested VPS-ready deployment with Cloudflare compatibility. Real-world deployment details (real-IP-from CF ranges, certbot cron, security headers) demonstrate practical operations knowledge during the oral defense.

**Generated result:**
`deploy/nginx.conf` with full HTTPS termination, Cloudflare IP trust, security headers, asset caching, WebSocket proxy. README includes step-by-step VPS bootstrap commands and crontab for auto SSL renewal.

---

## 🧠 Reflections on AI-Assisted Development

- **Plan first, code second.** Heavy upfront prompting saved hours of refactoring.
- **Generate assets in parallel.** Background image generation overlapped with code-writing saved ~3 minutes of wall time.
- **Pin the palette explicitly.** Without locking the palette upfront, components drift toward generic blues and grays.
- **Batch related sections.** Generating 8 landing sections with one shared aesthetic spec yielded more coherence than generating one section at a time.
- **Demand cleanup behavior.** Asking the AI to "fully dispose Three.js resources on unmount" prevented memory leaks that often appear in AI-generated 3D code.
- **Constrain with file count + line count.** Asking for `<300 lines per file` and feature-folder organization forced cleaner separation of concerns.
