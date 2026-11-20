# Saanwariya Seth Fashion — AdSense & Premium Commerce Edition

A Next.js 16 / React 19 / TypeScript fashion storefront using Prisma and MySQL.

## What's included in this refresh

- Compact homepage product cards (5 columns on wide desktop, responsive at tablet/mobile widths).
- Premium My Account dashboard, premium login/register screens, and a more polished password show/hide control.
- Compact PDP main image with six clickable gallery thumbnails; the Product.images JSON field is used when present.
- Bundled local category images for Suits, Kurtis, Lehengas and Ethnic Wear to avoid unreliable third-party category image URLs.
- Product-card actions: Wishlist, Compare, Quick View (opens the full PDP), Add to Cart and Buy Now.
- Product detail page with price/discount, stock status, description, delivery/returns information, verified-purchase reviews, review moderation, and similar products.
- Compare list (up to four items), stored in the visitor's browser.
- AdSense loader, responsive ad units and a static root `/ads.txt` publisher file.
- Ad placements on public content and shopping pages. Ads are intentionally not placed on login, account, cart, checkout, order history or admin pages to keep personal/transaction flows clear and reduce accidental interactions.
- Expanded Privacy Policy, Cookie Policy, Terms & Conditions, Shipping Policy, Returns & Exchanges, Disclaimer/Affiliate Disclosure, About, Contact and FAQ pages.
- Original Style Journal articles for useful, relevant site content.
- Request-time sitemap plus a public `robots.txt` with Content-Signal and Sitemap declarations.
- `llms.txt`, HTML-to-Markdown content negotiation, JSON-LD across key pages, an AI Catalog and MCP Server Card discovery documents.
- Read-only MCP HTTP tools and optional browser WebMCP tools for product search and public store information.
- Admin-only reset/verify scripts that do not reseed or overwrite the demo catalogue.

## Local setup

```bash
npm install
copy .env.example .env
```

Edit `.env` with real MySQL and authentication values before running the store. For a brand-new database only, create/update the schema and seed the initial admin plus demo products:

```bash
npm run db:setup
npm run db:verify
npm run dev
```

`npm run db:setup` runs `prisma db push` followed by the seed script. Re-running it updates matching demo catalogue rows, so do not use it just to reset an admin password. Use `npm run db:admin:reset` and `npm run db:admin:verify` for admin recovery; those scripts touch only the admin user.

Before production deploy, use a unique strong `AUTH_SECRET`, a unique admin password, a real support email, and the actual business details. Never commit `.env`.

## New database table

This version adds `ProductReview` for verified-purchase ratings and review moderation. After updating this code, apply the additive schema change to the Hostinger MySQL database:

```bash
npx prisma db push
```

Then redeploy/build so the generated Prisma Client uses the updated schema. The review API accepts ratings only from a signed-in customer with a delivered order containing that product. New reviews are held for approval in `/admin` before public display.

## Google AdSense setup

Configure these Hostinger environment variables with IDs copied from your own AdSense account:

- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`: `ca-pub-7776844434912624` (publisher ID supplied for this site).
- `NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP`
- `NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID`
- `NEXT_PUBLIC_ADSENSE_SLOT_SHOP_TOP`
- `NEXT_PUBLIC_ADSENSE_SLOT_SHOP_INLINE`
- `NEXT_PUBLIC_ADSENSE_SLOT_PRODUCT_BOTTOM`
- `NEXT_PUBLIC_ADSENSE_SLOT_CONTENT`

Create responsive display ad units in AdSense and copy each numeric slot ID into the matching variable. The project displays a neutral placeholder when a slot is not configured; it does not fabricate publisher or slot IDs. The global AdSense script is loaded once when a valid client ID is configured.

The static `public/ads.txt` file publishes the seller line for the supplied account ID. Verify that `https://saanwariyasethfashion.com/ads.txt` returns exactly:

```text
google.com, pub-7776844434912624, DIRECT, f08c47fec0942fa0
```

The publisher ID above was supplied by the site owner. Google may take several days to recrawl and update the ads.txt status. Ad slot IDs are still blank until created in AdSense.

## AdSense review readiness checklist

- The site contains navigation to About, Contact, Privacy, Cookie, Terms, Shipping, Returns, Disclaimer and original editorial content.
- Replace the demo catalogue with real items, accurate descriptions, accurate photos, actual stock and prices before asking for a review.
- Make sure the support email is real and monitored; set your correct legal business name/address and phone if available.
- Test every public route, contact form, search, product detail, wishlist, compare, cart and checkout.
- Do not publish copied descriptions, fake reviews, fake discounts, invented business details or misleading product claims.
- Make advertising clearly distinguishable from store controls and never encourage users to click ads.
- Add the real publisher ID and slot IDs, confirm `/ads.txt` can be crawled with HTTP 200, and test that ad units render.
- If serving personalised ads to visitors in the EEA, UK or Switzerland, configure a Google-certified TCF CMP (for example through AdSense Privacy & Messaging) as required by Google's current consent rules.

Adding these features improves completeness and usability but does not guarantee AdSense approval. Google's review also considers the actual live content, quality, navigation, traffic and policy compliance.

## Important business settings to verify before launch

- The current demo checkout uses Cash on Delivery. Connect and test a payment provider before advertising online payment methods.
- Current demo shipping calculation is ₹79 below ₹999 and free from ₹999. Verify that this matches your fulfilment costs and business policy.
- Return and exchange eligibility is stated as product-specific; set your actual product/category return terms and make them visible before customers buy.
- Marketplace/Flipkart purchases are fulfilled under the external marketplace's terms. Use approved affiliate feeds/API and disclose affiliate relationships; do not scrape marketplace pages.
- Demo stock photos and sample product entries are for testing and must be replaced or verified before accepting real orders.

## Admin account and all database tables

The initial admin email is `admin@saanwariyasethfashion.com` and the display name defaults to `Mivaan Jangra`. The admin password must be set privately as `ADMIN_PASSWORD` in `.env` or Hostinger Environment Variables before initial seeding or admin reset. The initial seeder refuses an unset/placeholder password. Admin sign-in is at `/login?next=/admin`; the protected portal is `/admin`. If login fails, make sure the reset command uses the exact MySQL database used by the live app, then run `npm run db:admin:reset` followed by `npm run db:admin:verify`. Keep `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `AUTH_SECRET` aligned between the DB reset environment and Hostinger runtime.

The Prisma schema creates six database models/tables: `User`, `Product`, `Order`, `OrderItem`, `ContactMessage`, and `ProductReview`. Wishlist and Compare are browser-side features in this version, not separate database tables. Run `npm run db:setup` once for initial setup to create/update those tables and insert the administrator plus 30 demo products. For later admin login recovery, use `npm run db:admin:reset` instead; it does not re-seed products.

See [`DATABASE-ADMIN-SETUP.md`](./DATABASE-ADMIN-SETUP.md) for complete instructions.

## Deployment

Hostinger build command:

```bash
npm run build
```

Start command:

```bash
npm run start
```

Node.js: 22. After updating Prisma schema, run `npx prisma db push` against the production database using the correct Hostinger connection string before running the new review functions.

## Agent discovery and admin recovery handout

See [`AGENT-READINESS-AND-ADMIN-FIX.md`](./AGENT-READINESS-AND-ADMIN-FIX.md) for the 11 agent-readiness points, live endpoint test commands, WebMCP browser limitations, required owner profile URLs, and admin-login troubleshooting. A Windows PowerShell endpoint check is included at `scripts/check-agent-readiness.ps1`.

## Detailed AdSense review handout

See [`ADSENSE-REVIEW-READINESS.md`](./ADSENSE-REVIEW-READINESS.md) for the complete publisher-ID, ad-slot, ads.txt, content, policy, CMP, database-update and deployment checklist. Google requires AdSense account holders to be at least 18; if the site manager is under 18, a parent or guardian must be the actual account holder using their own Google Account.


## Latest requested refinements

- Premium member dashboard and redesigned login/register pages.
- Compact homepage merchandise cards and a reduced-size PDP image with six interactive thumbnails.
- Local reference-derived image assets have been bundled for Suits, Kurtis, Lehengas and Ethnic Wear.
- The AdSense client ID and `/ads.txt` seller record use the publisher ID supplied for this site: `ca-pub-7776844434912624`. Verify the live endpoint and ensure Hostinger does not override the client ID with an older value.


## Footer credit

The site footer displays “Made with ♥ by Mivaan Jangra.”

## Premium Store Admin (light orange / white / green)

Open `/admin` after signing in with an account whose database role is `ADMIN`.

Admin sections include:
- Overview: sales value, orders, registered customers, active products and action alerts.
- Products: create, edit, publish, hide, search, price/MRP, category, description, stock, featured status, image and gallery URLs, own-store or affiliate source.
- Inventory: low-stock view and inline stock updates.
- Orders: view customer/address/items/payment/status and update fulfilment status. Cancelling an order restores its reserved product stock.
- Customers: registered customer directory and order/review counts.
- Categories: add, edit, sort, publish and hide categories. Active categories are shown on the shop and homepage.
- Coupons: percentage/fixed discount, minimum order, maximum discount and usage limit. Coupon values are checked again on the server at checkout.
- Reviews: approve, unpublish or delete customer reviews.
- Messages: read, mark and resolve contact enquiries.
- Banners: add/pause homepage or shop banners.
- Store settings: customer support, announcement bar, shipping fee, free-shipping threshold and social profiles.

### Apply the new admin database schema to an existing store

Back up the Hostinger MySQL database first. Preserve the current `.env`, `.git`, product images and uploaded assets. Then run:

```bash
npx prisma db push
npm run db:admin:init
```

`db:admin:init` creates/updates the default store categories and store settings only. It does not reset admin credentials, existing products, customers, orders or reviews.

Do **not** run `npm run db:seed` on a live store just to update the admin panel: that seed refreshes the demo catalogue and resets the configured admin password from environment variables. Use it only for a fresh/demo database when you explicitly want the demo catalogue.

### Product publishing behaviour

In Admin → Products → Add product, enter the required product name, category, selling price, MRP, stock and main image URL/path. Add up to 12 gallery image URLs, one per line. Keep “Publish product immediately” checked to make it visible in the shop. The homepage queries active products newest-first, so newly published products appear in the New Arrivals section automatically. Use the Featured checkbox for the separate Customer Favourites section.

Images can be entered as a public HTTPS URL or an asset path such as `/images/my-product.webp`. This admin panel does not upload binary image files to persistent cloud storage; add local assets to `public/images` through the deployment workflow or use a managed image URL.

### Local build and GitHub deployment

```bash
npm install
npm run build
git add -A
git commit -m "Add premium store admin dashboard"
git push origin main
```

For Hostinger's Node.js application, configure its production `DATABASE_URL` for the Hostinger-local MySQL connection (typically `127.0.0.1:3306`), and keep `AUTH_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Hostinger Environment Variables. Do not commit `.env` or secrets to GitHub. Use the same database for `db push` and the live application.

### Current checkout limitations

This release supports Cash on Delivery (COD) checkout. Online payment gateway, courier API, refunds and direct media upload require separate provider integrations and credentials; the admin dashboard does not claim those integrations are active.
