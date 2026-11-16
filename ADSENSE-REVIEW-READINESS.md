# Saanwariya Seth Fashion — AdSense Review & Deployment Handout

This handout explains the site-side work included in this version and the account/business settings that still need to be supplied by the site owner. It is not an approval guarantee and is not legal advice.

## What was updated in the project

- Smaller product cards: five columns on wide desktop screens, four on medium screens, three on smaller tablets and two on phones.
- Product-card quick actions over the image: wishlist, compare and Quick View. Quick View opens the product detail page (`/product/[slug]`).
- Product-card purchase actions: Add to Cart and Buy Now for store products. Marketplace cards clearly link out to the marketplace rather than pretending the order is placed by this store.
- Product detail page: price, MRP/discount where applicable, stock status, description, delivery/returns notes, quantity selection, Add to Cart, Buy Now and wishlist.
- Similar products from the same category.
- Verified-purchase reviews: only a signed-in customer with a delivered order containing that product can submit one. New reviews remain unpublished until an administrator approves them in `/admin`.
- Compare list supports up to four products and is stored in the visitor's browser.
- AdSense script loader and responsive ad-unit components. Public editorial, category, product, marketplace, contact and policy pages have ad placements. Login, registration, account, cart, checkout, order history and admin pages intentionally do not show ad placements because they are account/transaction/control flows.
- Static root file at `public/ads.txt` that publishes the exact seller record supplied for this site.
- `robots.txt` and `sitemap.xml` metadata routes.
- Expanded Privacy Policy, Cookie Policy, Terms & Conditions, Shipping Policy, Returns & Exchanges, Disclaimer/Affiliate Disclosure, About Us, Contact Us and FAQ pages.
- Four original style-guide articles in `/style-journal` to add useful editorial content, not just product grids.

## 1. Required owner details — do not leave demo values live

Before sending the site for another review, set these values in Hostinger's Node.js environment-variable panel:

- `NEXT_PUBLIC_SITE_URL=https://saanwariyasethfashion.com`
- `NEXT_PUBLIC_LEGAL_BUSINESS_NAME` — the real legal/operator name you use for the store.
- `NEXT_PUBLIC_SUPPORT_EMAIL` — a real, monitored mailbox that customers can contact.
- `NEXT_PUBLIC_SUPPORT_PHONE` — an actual customer-service number if you publish one; otherwise leave it blank.
- `NEXT_PUBLIC_BUSINESS_ADDRESS` — the real business correspondence address if you choose to publish one and it is appropriate to do so.
- `AUTH_SECRET` — a random secret, never a sample value.
- `DATABASE_URL` — the correct Hostinger MySQL connection string.
- `ADMIN_EMAIL`, `ADMIN_NAME` and a strong unique `ADMIN_PASSWORD`.

Do not invent a registered company name, address, phone number, delivery promise, guarantee, stock claim or customer review. The site uses a default support email only as a placeholder; replace it with a mailbox that actually works and test it.

## 2. Google AdSense publisher and ad-unit configuration

The site owner supplied the publisher/client ID `ca-pub-7776844434912624`. Confirm it matches the AdSense account that owns this domain before publication.

Set:

- `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-7776844434912624` — if Hostinger already has a different value, replace it with this exact ID.
- `NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP` — numeric responsive display-ad slot ID for the homepage top placement.
- `NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID` — numeric slot ID for the homepage mid-page placement.
- `NEXT_PUBLIC_ADSENSE_SLOT_SHOP_TOP` — numeric slot ID for the shop and marketplace top placement.
- `NEXT_PUBLIC_ADSENSE_SLOT_SHOP_INLINE` — numeric slot ID used between product rows on larger shop result sets.
- `NEXT_PUBLIC_ADSENSE_SLOT_PRODUCT_BOTTOM` — numeric slot ID below a product detail page.
- `NEXT_PUBLIC_ADSENSE_SLOT_CONTENT` — numeric slot ID used on the public information/editorial pages.

Create responsive display ad units in AdSense and copy their slot IDs. The project does not invent publisher or slot IDs. Empty values leave a labelled placeholder; no real ad request can be served until the actual account values exist and the site is permitted to serve ads.

The AdSense script is loaded once at the root layout when the publisher ID is valid. Ad units are responsive and labelled as advertising. The design must never encourage visitors to click ads or place ads where they can be mistaken for Buy, Add to Cart, navigation or other controls.

## 3. ads.txt verification

This project serves `/ads.txt` from the static `public/ads.txt` file. After the new deployment is live, open:

`https://saanwariyasethfashion.com/ads.txt`

It should return exactly this plain-text seller line:

`google.com, pub-7776844434912624, DIRECT, f08c47fec0942fa0`

The publisher ID was supplied by the site owner; confirm it matches the AdSense account. Do not request review until the correct seller line is visible and the URL is publicly reachable.

## 4. Database update for reviews

This release adds the `ProductReview` table. Back up the production database first, then run this once against the Hostinger database using the new code and the correct `DATABASE_URL`:

```bash
npx prisma db push
```

The normal build runs `prisma generate`, but `prisma generate` does not create the new database table. The `db push` step is required for review submissions and moderation. Do not re-run the demo seed on a store with manually curated live products unless you intentionally want the demo product records to be upserted again.

## 5. Content and catalogue checks before review

The project contains demo catalogue entries and stock/lifestyle image URLs for testing. They are not proof of the exact product or supplier inventory. Before a real review and before accepting paid orders:

1. Replace demo products with the actual products you sell.
2. Use photographs you own or are licensed to use, and ensure each photo matches the item being sold.
3. Write original product descriptions with accurate material, size, dimensions, colour, package contents, care, stock and delivery information.
4. Remove unavailable items and fake/sample discounts; make sure each MRP and sale price is accurate.
5. Add real editorial content that is useful to visitors. Do not rely on duplicated manufacturer descriptions or copied text.
6. Test search, category filters, product pages, add-to-cart, checkout, account login, contact form, order status and mobile navigation.
7. Make sure every public policy link works and the same policy is followed operationally.

## 6. Policy and customer-support checks

- Privacy Policy explains account/order/contact data and Google/third-party advertising cookies, plus links to Google's Ads Settings and an opt-out information site.
- Cookie Policy describes browser storage and advertising cookies.
- Terms, Shipping, and Returns/Exchanges pages explain store and marketplace order differences.
- About, Contact and FAQ are public and linked in the footer/navigation.
- Style Journal provides original editorial material.

The current checkout code is Cash on Delivery. The current delivery calculation is ₹79 under ₹999 and free at/above ₹999. Confirm that these are the real commercial terms before launch. Returns are deliberately described as product-specific because the store owner has not supplied one universal return window or category eligibility rule. Set the actual return window, non-returnable categories, damaged-item process, exchange rules, refund method and support response expectations before accepting orders. A policy page must describe what the business really does, not a made-up promise.

## 7. Regional consent (CMP)

The Cookie Policy documents Google ad cookies and explains that a general cookie notice is not a substitute for a certified Consent Management Platform. If the site serves personalised ads to visitors in the EEA, the UK or Switzerland, configure a Google-certified CMP integrated with the IAB Transparency and Consent Framework (for example through the available AdSense Privacy & Messaging flow) before serving personalised ads in those regions.

## 8. AdSense account holder age

Google's published AdSense eligibility requirement says applicants must be at least 18. If the person managing this project is under 18, a parent or guardian must apply using their own Google Account and be the responsible AdSense account holder; Google says payments go to that adult. Do not enter a false date of birth or try to bypass account eligibility.

## 9. Review process and limitations

In AdSense, open Sites and follow the review status/instructions shown for this domain. Google's system verifies ownership and then reviews the actual live site. The site must reach a `Ready` status before it can serve ads. Having code, policies, original articles or an ads.txt file does not guarantee approval. If AdSense still says `Need attention`, use the exact issue shown in the account or Policy Center; this project update cannot see or clear account-specific flags.

Before trying again, make sure the new deployment is live, the publisher ID and slot IDs are correct, `/ads.txt` returns the expected line, the privacy/cookie policy matches the configured ads, all links work, and the live catalogue is genuine and useful. If the review message identifies a specific missing item, fix that item rather than repeatedly resubmitting without changes.

## 10. Build and deployment sequence

From the project folder:

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
```

After the local build succeeds, commit and push the changed project to the connected GitHub `main` branch. Hostinger should then build the latest commit using:

- Build: `npm run build`
- Start: `npm run start`
- Node.js: 22

Keep `.env` private and never commit secrets to GitHub.

## What this release does not include

- It cannot guarantee AdSense approval.
- It cannot create or look up the user's private AdSense publisher ID or ad-slot IDs.
- It does not create a certified CMP; that must be configured for applicable visitor regions through an approved provider/account flow.
- It does not verify the real legal business identity, customer-support mailbox, address, inventory, shipping partner, return window or refunds; the owner must supply and verify these.
- A production build was not run in this generation environment because external npm package installation did not complete. TypeScript/TSX syntax parsing completed without syntax diagnostics; run the full commands above locally before pushing.


## Latest design refinements

- My Account uses a premium member dashboard with order, wishlist, compare and admin shortcuts.
- Login and registration pages have a matching boutique-style split layout, password visibility control and responsive form fields.
- Homepage featured/new-arrival product cards have been reduced in size.
- Product pages show a smaller main image and up to six selectable thumbnails. Demo gallery imagery is illustrative and must be replaced with exact SKU photographs before taking real orders.
- Suits, Kurtis, Lehengas and Ethnic Wear category photos are bundled local WebP crops from the provided homepage reference so those tiles do not depend on third-party image hosts.


## Current ads.txt seller record

The static `public/ads.txt` endpoint serves:

```text
google.com, pub-7776844434912624, DIRECT, f08c47fec0942fa0
```

If Hostinger has a pre-existing `NEXT_PUBLIC_ADSENSE_CLIENT_ID` value, replace it with `ca-pub-7776844434912624` so it does not override the site default.
