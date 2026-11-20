# Saanwariya Seth Fashion – Premium Admin Panel Handout (Hindi)

## 1. Admin panel ka design

Admin dashboard ko light orange, white aur green palette mein redesign kiya gaya hai. Desktop par left sidebar aur mobile par slide-in menu milega. `/admin` route par public store header/footer aur sale popup hide rehte hain, taaki dashboard focused rahe.

## 2. Admin panel mein kya-kya manage hoga?

1. **Overview:** total order value, orders, active products, customers, low-stock alerts, pending orders, pending reviews aur new contact messages.
2. **Products:** add, edit, publish, hide, search; category, brand, description, selling price, MRP, stock, main image, gallery images, featured flag aur own-store/Flipkart affiliate source.
3. **Inventory:** low-stock list aur stock quantity update.
4. **Orders:** customer details, delivery address, order items, payment method, order status. Order cancel karne par reserved own-store stock wapas inventory mein add hota hai.
5. **Customers:** registered customers, join date, order/review count aur recent 100 orders ke basis par estimated order value.
6. **Categories:** category create/edit, image URL, display order, publish/hide.
7. **Coupons:** percentage ya fixed discount, minimum order, max discount, usage limit, active/pause. Checkout par server coupon ko dobara validate karta hai.
8. **Reviews:** review approve, unpublish ya delete.
9. **Messages:** Contact page enquiries, read/resolved status aur email reply shortcut.
10. **Banners:** homepage ya shop page par banners add, sort aur pause.
11. **Store settings:** store name, support email/phone, address, announcement bar, shipping fee, free-shipping threshold aur social links.

## 3. Admin login

Admin URL:

`https://saanwariyasethfashion.com/admin`

Login page:

`https://saanwariyasethfashion.com/login?next=/admin`

Admin access ke liye database mein user ka `role` `ADMIN` hona chahiye. Existing admin email/password ko yahan hardcode nahi kiya gaya hai. Hostinger Environment Variables mein `ADMIN_EMAIL` aur `ADMIN_PASSWORD` ko set karein; password private rakhein.

Agar role/password ko reset karna zaroori ho, same production database ke saath `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` set karke run karein:

```bash
npm run db:admin:reset
```

Is command se admin password hash update hoga. Uske baad browser se logout karke dobara login karein. `AUTH_SECRET` bhi production app aur reset/relevant auth configuration mein consistent rehna chahiye.

## 4. Existing Hostinger database ko update karna

**Pehle Hostinger hPanel se MySQL database backup lein.** Phir project root mein, same production database connection use karke:

```bash
npx prisma db push
npm run db:admin:init
```

`db:admin:init` existing products, admin password, customers, orders aur reviews ko reset nahi karta. Ye missing default categories aur `StoreSettings` row initialize karta hai.

**Live database par sirf admin panel update ke liye `npm run db:seed` na chalayein.** `db:seed` demo products aur admin account ko environment variables se upsert/refresh karta hai; isse manually edited demo product information overwrite ho sakti hai.

First-time empty demo database ke liye, aur sirf jab 30 demo products chahiye hon, deliberate taur par `npm run db:seed` use kiya ja sakta hai.

## 5. Product add karne ka tarika

1. Admin mein Products tab kholein.
2. Add product click karein.
3. Name, category, selling price, MRP, stock aur main image URL/path enter karein.
4. Gallery image URLs ek-ek line mein paste karein (maximum 12).
5. “Publish product immediately” checked rakhein.
6. Publish product click karein.

Active product Shop aur Homepage dono par database se aata hai. Homepage newest products ko pehle fetch karta hai; naya product `New Arrivals` ke first cards mein aayega. Featured checkbox ko “Customer Favourites” section ke liye use karein.

Image field mein public image URL (HTTPS) ya local public asset path jaise `/images/product-name.webp` use kar sakte hain. Admin panel is version mein direct binary file upload/persistent cloud media storage provide nahi karta. Local image add karne ke liye file `public/images` mein add karke deploy karein ya image-hosting URL paste karein.

## 6. Orders, coupons aur stock

- Own-inventory product checkout par current price aur available stock database se read hote hain; browser se bheje gaye price par bharosa nahi hota.
- Checkout COD flow support karta hai.
- Product stock transaction ke andar deduct hota hai.
- Order cancel karne par own product stock wapas add hota hai.
- Coupon checkout par dobara server-side validate hota hai.
- Shipping fee/free shipping threshold Store settings se manage hote hain.

Online payment gateway, courier tracking API, automated refunds aur supplier integrations is admin release mein configured nahi hain. Inke liye provider accounts, credentials aur separate implementation required hai.

## 7. GitHub push aur Hostinger deployment

Project folder mein commands:

```cmd
npm install
npx prisma db push
npm run db:admin:init
npm run build
```

Build successful hone ke baad:

```cmd
git add -A
git commit -m "Add premium store admin dashboard"
git push origin main
```

Hostinger par GitHub deployment ka latest commit `main` branch se match hona chahiye.

Hostinger Environment Variables mein production `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` aur AdSense/social settings rakhein. Hostinger app ke andar MySQL host aam taur par `127.0.0.1:3306` hota hai. Local Windows PC ke `.env` mein external MySQL hostname alag ho sakta hai.

`.env`, passwords, `AUTH_SECRET` aur database credentials GitHub par commit nahi karein.

## 8. Build verification

Current handoff mein 86 TypeScript/TSX files par syntax parsing successful hui. Full production build is environment mein verify nahi ho saka kyunki package installation network timeout hua. Apne Windows computer par dependencies install karke `npm run build` ka actual result verify karein; failure aane par complete log share karein.

## 9. Admin ke 10 sections load na hon to exact diagnosis

Dashboard ke latest build mein `System Health` panel add hai. Ye 10 admin APIs ke fail hone par har section ka naam, endpoint aur actual HTTP error show karta hai. Saath mein `/api/admin/diagnostics` MySQL connection aur expected schema tables/columns ko check karta hai.

### Windows computer se production schema update

Agar aap `D:\saanwariya` se command chala rahe hain, local `.env` ka `DATABASE_URL` Hostinger ka **external hostname** use kare, jaise `srv1518.hstgr.io:3306`. Is PC par `127.0.0.1` use na karein; woh aapke apne computer ko refer karta hai.

Hostinger hPanel se database backup lekar CMD mein:

```cmd
cd /d D:\saanwariya
npx prisma db push
npx prisma generate
```

Prisma agar destructive change/data loss warning dikhaye toh `--accept-data-loss` na lagayein aur bina backup ke confirm na karein. Successful schema sync ke baad:

```cmd
npm run db:admin:init
```

Ye default categories aur settings row initialize karta hai; products, customers, orders, reviews aur admin password ko reseed nahi karta.

### Hostinger production runtime

Hostinger Node.js Environment Variables mein production `DATABASE_URL` same hosting server ke MySQL ke liye `127.0.0.1:3306` host use kare. Local Windows aur Hostinger production ke connection strings ek jaise nahi honge. Changes ke baad application redeploy/restart karein.

### Dashboard diagnostics ke result ka matlab

- **HTTP 401/403:** session expired ya account ka `ADMIN` role/auth secret mismatch. Sign out/sign in karein aur admin role verify karein.
- **MySQL connection failed / P1000:** production `DATABASE_URL`, database username/password aur grants check karein.
- **MySQL connection failed / P1001:** hostname, port, firewall ya server connectivity check karein.
- **Missing tables/columns:** backup lekar `npx prisma db push` run karein.
- **Schema ready, lekin endpoint fail:** diagnostic list mein diya section/HTTP status dekhein; us route ka Hostinger Runtime Log inspect karein.

DB schema status dekhne ke liye browser mein login karke `/api/admin/diagnostics` bhi open kar sakte hain. Is endpoint ko sirf logged-in ADMIN access kar sakta hai.


## 10. Next.js security version

Is update ke package.json mein Next.js stable release `16.4.6` set hai. Official release history mein `v16.4.6` stable release listed hai. Install/update ke baad `npm ls next` se installed version verify karein; phir full build test karein.
