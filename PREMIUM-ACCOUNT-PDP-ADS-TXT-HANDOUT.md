# Saanwariya Seth Fashion — Premium Account, Product Gallery & AdSense Update

This handout describes the November 15, 2026 project update.

## Included changes

### Premium My Account
- New member dashboard with welcome panel and profile card.
- Shortcuts to Orders, Wishlist, Compare and (for admin accounts) Admin Dashboard.
- Premium sign-in gate for signed-out visitors.
- Sign-out action preserved.

### Premium Login and Signup
- Matching boutique-style split-screen layout using bundled local fashion photography.
- Improved form fields and labels.
- Password show/hide control.
- Existing login/register API behavior and redirect handling preserved.

### Smaller Homepage Product Cards
- New Arrivals and Customer Favourites grids now use compact five-column desktop cards.
- Product image height reduced to 176px on desktop and 154px on mobile.
- Existing Wishlist, Compare, Quick View, Add to Cart and Buy Now controls remain available.

### Product Detail Page Gallery
- Smaller PDP main image (420px desktop cap; 340px mobile).
- Up to six thumbnail images displayed underneath the main image.
- Clicking a thumbnail changes the main image.
- The existing price, MRP, discount, stock, purchase controls, review panel, product description and similar-product section remain.
- If a product's existing `Product.images` field contains a JSON array of image URLs, it is used as the gallery source. Otherwise the page uses the main image, matching demo-category photos and fallback assets.
- Demo gallery pictures are illustrative. Replace them with exact photographs for each live SKU before accepting real orders.

### Missing Suits Category Images
- Suits category image now uses a bundled local WebP file.
- Kurtis, Lehengas and Ethnic Wear categories also use bundled local WebP files.
- Suits promo banner and suit product demo images now use local images cropped from the supplied homepage reference, so the tiles no longer rely on the unreliable remote suit URLs.
- `ProductCard` and PDP image fallback logic uses a local suits image if an older database record still has one of the known broken demo image URLs.

## AdSense publisher and ads.txt

Publisher ID supplied by the site owner:

`ca-pub-7776844434912624`

The AdSense loader uses this client ID by default, and the static `public/ads.txt` file contains its matching seller record.

Expected public `ads.txt` response:

```text
google.com, pub-7776844434912624, DIRECT, f08c47fec0942fa0
```

After deployment, open:

`https://saanwariyasethfashion.com/ads.txt`

Confirm that it returns the exact line above, with HTTP 200 and `text/plain` content.

### Hostinger environment variable

In Hostinger hPanel → Website → Manage → Environment Variables, set:

- Name: `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
- Value: `ca-pub-7776844434912624`

Important: If a previous environment value exists, replace it with the ID above. An environment variable overrides the code's fallback value.

The responsive ad placements are present, but each ad slot still needs the numeric slot ID copied from a corresponding AdSense ad unit:

- `NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP`
- `NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID`
- `NEXT_PUBLIC_ADSENSE_SLOT_SHOP_TOP`
- `NEXT_PUBLIC_ADSENSE_SLOT_SHOP_INLINE`
- `NEXT_PUBLIC_ADSENSE_SLOT_PRODUCT_BOTTOM`
- `NEXT_PUBLIC_ADSENSE_SLOT_CONTENT`

Until each slot ID is supplied, the matching area displays a neutral Advertisement placeholder. The publisher ID alone does not create ad units or guarantee that Google will serve ads.

## Database note

The Prisma `Product.images` JSON-text column already exists in this project schema. No new database column was added in this update, so a schema push is not required solely for these visual changes.

The demo seed now writes six gallery image URLs for demo products. Running `npm run db:seed` will update the seeded demo catalogue and upsert the administrator from `.env`; do not run it against a live catalogue if you have already entered real products or do not intend to refresh the seed account.

## Local test

From the project folder:

```cmd
npm install
copy .env.example .env
```

Set real database/auth/admin credentials in `.env`, then:

```cmd
npx prisma db push
npm run dev
```

Open `http://localhost:3000` and test:

- `/account`
- `/login`
- `/register`
- `/`
- `/shop`
- `/product/mauve-embroidered-suit`
- `/ads.txt`

For a production build:

```cmd
npm run build
```

## GitHub push

From the project folder, after the local build passes:

```cmd
git add -A
git commit -m "Polish account pages and product gallery; configure AdSense publisher"
git push origin main
```

Repository:

`https://github.com/kingssofcyber-wq/saanwariyasethfashion`

Hostinger should start a deployment for the new `main` commit when GitHub integration is enabled.

## Validation status in this preparation environment

- ZIP integrity check: completed after packaging.
- TypeScript/TSX syntax parse: 62 files parsed with no syntax diagnostics.
- Local category/gallery image presence: all 10 referenced bundled image files are present.
- AdSense ads.txt output: generated record matches the publisher ID supplied by the site owner.
- Full Next.js production build: not verified here because the package installation attempt timed out while retrieving dependencies. Run `npm install` and `npm run build` locally or in Hostinger before relying on the deployment.

This update improves site design and technical completeness but does not guarantee AdSense approval. Google's review still depends on the live site's content, policies, navigation, traffic quality, account status and policy compliance.
