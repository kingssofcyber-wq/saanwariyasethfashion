# Saanwariya Seth Fashion — Reference-Matched Next.js Store

Premium multi-category ecommerce starter for **saanwariyasethfashion.com**, using Next.js App Router, React, TypeScript, Node.js, Prisma and MySQL. Prepared for Node.js 22 deployment on Hostinger Business.

## Design

The storefront now follows the uploaded homepage reference: deep-maroon utility strip, ivory navigation bar, transparent lotus logo, burgundy saree hero, trust strip, seven photo category cards, three editorial category banners, scrolling offer marquee, product sections, sale feature, marketplace panel, WhatsApp chat link and matching footer.

### Brand files

- `public/brand/saanwariya-seth-fashion-logo.svg` — transparent logo wordmark (SVG)
- `public/brand/saanwariya-seth-fashion-logo.png` — transparent logo wordmark (PNG)
- `public/brand/saanwariya-lotus-mark.svg` — transparent lotus emblem (SVG)
- `public/brand/saanwariya-lotus-mark.png` — transparent lotus emblem (PNG)
- `public/images/hero-saree.webp` — bundled homepage hero
- `public/reference/uploaded-homepage-reference.png` — user's source screenshot

## Included

- 30 demo products across fashion, accessories and lifestyle categories.
- Home, shop, product detail, cart, COD checkout, wishlist, login, register, account, orders, marketplace, about, contact, FAQ, privacy, terms and shipping/returns pages.
- Admin portal at `/admin`, protected by an ADMIN login.
- Search, category filtering, sorting, cart, wishlist, demo catalogue seed, product management and order status UI.
- Scroll reveal, hover animations, marquee, one-per-session sale popup and reduced-motion handling.
- Official Flipkart affiliate connector placeholder. It requires valid affiliate access and current supported API/feed configuration; it does not scrape Flipkart.

## Run locally (Windows)

Prerequisites: Node.js 22 and MySQL.

```cmd
copy .env.example .env
```

Edit `.env`, then:

```cmd
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

Admin: `http://localhost:3000/admin`. Seed the administrator using the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values set in `.env`, then log in.

## Deployment

Use Node.js 22 in Hostinger hPanel, set the environment variables from `.env.example` securely, install dependencies, run `npm run build`, connect MySQL, run Prisma schema push and seed once, then verify the full order/admin flow. Never publish `.env` or use the example admin password on production.

## Handout

See [`HANDOUT.md`](./HANDOUT.md) for the complete project handoff, routes, setup, database, admin, deployment notes, limitations and next-development instructions. See [`DEMO-PRODUCTS.md`](./DEMO-PRODUCTS.md) for the test catalogue.

## Important production gaps

This is a functional starter, not yet a fully operated production store. COD is the included checkout mode; a payment gateway and courier integration still need to be configured. Demo product photos/prices/stock must be verified against real SKUs. The Flipkart adapter requires valid affiliate credentials and an API/feed format that is currently supported. Confirm all contact details and return/shipping policies before accepting orders.

A production build was not run while creating this ZIP; run `npm run build` after installing dependencies in your local/Hostinger environment.
"# saanwariyasethfashion" 
