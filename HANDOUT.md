# Saanwariya Seth Fashion — Project Handout

This handout is the carry-forward brief for continuing the Saanwariya Seth Fashion website in another ChatGPT conversation or with a developer. Use the included project as the source of truth and preserve the existing routes and working features when making changes.

## 1. Project identity and design reference

- Store/brand: **Saanwariya Seth Fashion**
- Domain target: `https://saanwariyasethfashion.com`
- Project: responsive multi-category fashion and lifestyle ecommerce storefront.
- Stack: Next.js App Router, React, TypeScript, Node.js, Prisma ORM and MySQL.
- Hosting target: Hostinger Business Node.js hosting, Node.js 22.
- Main design reference: `previews/reference-homepage.png` (the exact screenshot provided by the user).
- Local homepage hero: `public/images/hero-saree.webp` (generated fashion hero image with a burgundy embroidered saree and warm palace-inspired background).
- Brand logo: `public/brand/saanwariya-seth-fashion-logo.svg` and `.png` (transparent background). Lotus-only logo: `public/brand/saanwariya-lotus-mark.svg` and `.png`.
- Site colour direction: deep maroon/burgundy, warm ivory, peach/pink, rose gold and small muted-gold details.

## 2. Homepage design brief

The homepage should closely follow the uploaded reference screenshot, not revert to the older minimal homepage:

1. Thin deep-maroon top utility strip with free shipping above ₹999, secure payments, 24x7 support, My Account, Track Order and Contact Us.
2. Cream navigation bar with transparent lotus wordmark, Home, Our Story, Style Edits, Sarees, Suits, Kurtis, More, product search, wishlist and cart count.
3. Full-width warm palace-inspired hero; model in burgundy saree on the left, welcome copy and “Style that feels like you.” headline on the right, Shop Now CTA, and premium/trendy/occasion highlights.
4. Trust strip: Free Shipping, Secure & Trusted, 24x7 Customer Support, Easy Returns.
5. Seven image-led category cards: Sarees, Suits, Kurtis, Lehengas, Ethnic Wear, Jewellery, Accessories.
6. Three rich editorial promotional tiles: sarees (maroon), suits (olive/green), kurtis (peach).
7. Horizontal looping offer marquee.
8. New Arrivals and customer-favourite demo products.
9. Sale promotion, editorial banner, Flipkart/marketplace discovery panel and full premium footer.
10. Floating “Chat with us” WhatsApp link.

The implementation is responsive and includes image zoom/hover states, reveal-on-scroll effects, continuous marquee motion, animated sale modal and reduced-motion support.

## 3. Main routes

| Purpose | Route |
|---|---|
| Home | `/` |
| Shop/catalogue | `/shop` |
| Product details | `/product/[slug]` |
| Cart | `/cart` |
| Checkout | `/checkout` |
| Wishlist | `/wishlist` |
| Login | `/login` |
| Register | `/register` |
| Customer account | `/account` |
| Orders | `/orders` |
| Marketplace picks | `/shop/marketplace` |
| Admin portal | `/admin` |
| About | `/about` |
| Contact | `/contact` |
| FAQ | `/faq` |
| Shipping/returns | `/shipping-returns` |
| Privacy | `/privacy` |
| Terms | `/terms` |

**Admin URL locally:** `http://localhost:3000/admin`  
**Admin URL on the connected live domain:** `https://saanwariyasethfashion.com/admin`

The admin portal is protected. An admin must be seeded into the database and logged in first; unauthenticated users are redirected to `/login?next=/admin`.

## 4. Demo product catalogue

- `lib/catalog.ts` contains **30 demo product records** (IDs `p1` through `p30`).
- `prisma/seed.ts` upserts these products and the admin account into MySQL.
- Categories represented include sarees, suits, jewellery, watches, bags, footwear, men's wear, home & living and accessories.
- `DEMO-PRODUCTS.md` contains the testing catalogue list.
- Demo photos and some remote category/editorial photos are visual placeholders. They are not verified photos of the exact SKU. Replace them with accurate supplier/product photographs, descriptions, variants and stock before selling.

## 5. Tech and important files

- `app/` — Next.js App Router pages and API endpoints.
- `components/site-header.tsx` — utility strip, brand, responsive navigation, search, wishlist and cart count.
- `components/home-sections.tsx` — homepage hero, categories, promos, marquee, sale, product blocks and marketplace panel.
- `components/site-footer.tsx` — premium maroon footer.
- `components/chat-widget.tsx` — floating WhatsApp support link.
- `components/sale-popup.tsx` — once-per-session promotion popup.
- `components/scroll-reveal.tsx` — scroll reveal effect.
- `components/providers.tsx` — cart/wishlist store provider.
- `components/admin-dashboard.tsx` — admin product and order UI.
- `lib/catalog.ts` — 30 demo products and category data.
- `lib/auth.ts` — session/authentication helpers.
- `lib/prisma.ts` — Prisma client.
- `prisma/schema.prisma` — MySQL database schema.
- `prisma/seed.ts` — creates admin and demo products.
- `app/api/` — product, auth, order, contact, admin and Flipkart starter routes.
- `app/globals.css` — complete existing component styling plus reference-matched `ss-*` theme overrides.
- `public/brand/` — transparent logo assets.
- `public/images/hero-saree.webp` — local homepage hero photograph.
- `public/reference/uploaded-homepage-reference.png` — original reference screenshot.

## 6. Local Windows setup

Prerequisites: Node.js 22, npm and a MySQL database (local MySQL or a Hostinger database).

1. Extract the ZIP.
2. Open CMD in the `saanwariya-storefront-premium` directory.
3. Copy `.env.example` to `.env`.
4. Fill in the MySQL connection string and secrets.
5. Run:

```cmd
npm install
npx prisma db push
npm run db:seed
npm run dev
```

6. Open `http://localhost:3000`.

To check a production build after dependencies and DB environment are configured:

```cmd
npm run build
npm run start
```

## 7. Environment configuration

Set these in `.env` locally and in the Hostinger Node.js app environment settings:

- `DATABASE_URL` — MySQL connection URL.
- `AUTH_SECRET` — unique random secret of at least 32 characters.
- `ADMIN_NAME` — admin display name.
- `ADMIN_EMAIL` — initial administrator email.
- `ADMIN_PASSWORD` — strong unique admin password.
- `NEXT_PUBLIC_SITE_URL` — production website URL.
- `FLIPKART_AFFILIATE_ID` and `FLIPKART_AFFILIATE_TOKEN` — only if the store has valid official affiliate access.

The `.env.example` contains demo admin defaults for local setup only. Change the password and secret before seeding/deployment. Never upload `.env` or publish real secrets.

## 8. Admin setup

The seed script uses the values in `.env` to create/update the initial administrator. Then:

1. Run `npm run db:seed`.
2. Visit `/login`.
3. Sign in using the configured `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
4. Visit `/admin`.

Do not use example/demo credentials on a public site. Change the admin password, use a unique secret, and verify access control on deployment.

## 9. Hostinger deployment outline

1. Create/select a Node.js app in Hostinger hPanel for `saanwariyasethfashion.com`.
2. Upload the extracted project or connect the Git repository.
3. Use Node.js 22.
4. Add the environment variables in hPanel (not in source code).
5. Install dependencies and run the production build as configured by Hostinger.
6. Ensure MySQL is reachable, then run `npx prisma db push` and `npm run db:seed` once.
7. Connect the domain and SSL.
8. Test desktop/mobile layouts, product listing/detail, cart, COD order submission, login, account, order tracking, admin product updates and admin order status before public launch.

## 10. Features and integrations status

Included in this starter project:

- 30 seeded product demo catalogue.
- Shop search/category/sort (sorting uses a Server Component-safe GET form with Apply button).
- Product details, add-to-cart, cart, wishlist, checkout with COD flow.
- Customer login/register/session/account/order pages.
- Admin catalogue and order management UI.
- Contact form API.
- Flipkart Marketplace starter page/API adapter.
- Animated homepage hero treatment, marquee, scroll reveals, hover effects and promotional popup.

Still needs store-owner credentials/configuration or external service integration before production:

- Real MySQL credentials and production admin secret/password.
- Verified SKU photography, sizes, colours, pricing and inventory.
- Payment gateway (the included checkout is COD-oriented; no online payment gateway is configured).
- Courier/shipping API and production fulfilment settings.
- Email/SMS notifications and operational monitoring/backups.
- Valid Flipkart affiliate account and current official API/feed access. The connector is only a starter adapter; no Flipkart catalogue data is guaranteed to display until credentials and supported API/feed contract are configured. Do not scrape Flipkart pages.
- Confirm legal store policies, returns window, delivery charges and all customer-facing contact details before launch. The screenshot reference includes the phone number `+91 8760670005`; verify it is the store's correct support number before publishing.

## 11. Current validation notes

- The archive contains the complete 99-file project basis plus the new design and brand assets.
- The existing Server Component sorting fix is preserved.
- A full Next.js production build has **not** been run in this packaging environment. Install dependencies and run `npm run build` locally/Hostinger to verify against the exact target runtime.
- Remote Unsplash images require internet connectivity. The primary hero image and logo are bundled locally.

## 12. Instructions for future development

Continue from the included source, not an unrelated fresh template. Preserve the uploaded homepage reference, logo paths, maroon/ivory design direction, 30 demo products, `/admin` route and all existing app routes. Make changes in small batches, run TypeScript/build checks after edits, and return a fresh complete ZIP plus an updated handout whenever a new version is created.
