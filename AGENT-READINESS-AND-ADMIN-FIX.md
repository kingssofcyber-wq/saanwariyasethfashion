# Saanwariya Seth Fashion — Agent Readiness & Admin Login Fix (Hindi handout)

Domain: https://saanwariyasethfashion.com  
GitHub: https://github.com/kingssofcyber-wq/saanwariyasethfashion (branch `main`)

## 11 issues — Hindi explanation aur project mein status

1. **Content-Signal in robots.txt — implemented.** `public/robots.txt` mein `Content-Signal: search=yes, ai-train=no` hai. Iska matlab publisher search discovery allow karna aur AI training ke liye mana preference state kar raha hai. Dhyan rahe: ye custom/emerging crawler signal hai; har crawler ise follow karega ya ye apne aap legal enforcement karega, iski guarantee nahi.
2. **Sitemap directive — implemented.** `robots.txt` mein `Sitemap: https://saanwariyasethfashion.com/sitemap.xml` hai. `app/sitemap.ts` active product slugs database se read karta hai; database unavailable ho to demo catalogue fallback hoti hai. Sitemap request-time dynamic rakhi gayi hai.
3. **Homepage JSON-LD — implemented.** Homepage server-side JSON-LD embed karti hai, taaki business/site/catalogue data sirf JavaScript chalne ke baad hi available na ho.
4. **Organization / OnlineStore entity — partly configured.** Structured data mein ek `Organization` + `OnlineStore` entity, name, website, logo, INR, and India service area hai. Verified legal name, real phone/email aur public business address tabhi schema mein aayenge jab owner unhe environment variables mein set kare. Fake address ya legal name invent nahi kiya gaya.
5. **sameAs external profiles — code ready, owner URLs pending.** `sameAs` mein sirf real official social/business profile URLs jaayenge. Hostinger variables: `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_YOUTUBE_URL`, `NEXT_PUBLIC_PINTEREST_URL`, `NEXT_PUBLIC_GOOGLE_BUSINESS_URL`. Khaali rehne par `sameAs` omit hota hai. Apne asli profiles add karne ke baad redeploy karein.
6. **Several schema types — implemented.** Store/site pages mein `Organization`, `OnlineStore`, `WebSite`, `SearchAction`, `CollectionPage`, `ItemList`; product pages mein `Product`, `Offer`, `Brand`, conditional `AggregateRating`, `BreadcrumbList`; FAQ mein `FAQPage`, `Question`, `Answer`; style journal mein `Blog`, `BlogPosting`; about/contact mein `AboutPage` aur `ContactPage` markup hai. Ratings sirf admin-approved reviews se banenge.
7. **Prices without JS/login — implemented in page source and schema.** Homepage product cards server-rendered hain aur homepage JSON-LD mein `Offer.price` + `priceCurrency: INR` hai. Individual product pages mein bhi visible price + Offer schema + availability hai. Launch se pehle demo catalogue ke photos, prices, stock aur descriptions ko exact real SKU information se replace karein.
8. **llms.txt — implemented.** `public/llms.txt` main pages, store policies, sitemap, Markdown route, AI Catalog, MCP Server Card aur read-only agent boundaries list karta hai.
9. **Markdown for Accept header — implemented in source.** `/` par `Accept: text/markdown` request `/home.md` route se serve hoti hai; response `text/markdown; charset=utf-8` aur `Vary: Accept` deta hai. Normal browser ko HTML milta hai.
10. **WebMCP tools — implemented, browser support conditional.** Global React component `use-webmcp-tool` ke through `search_saanwariya_products` aur `get_saanwariya_store_information` register karta hai. Ye read-only tools hain. WebMCP abhi browser Early Preview hai; compatible Chromium build (current Chrome/Edge preview) aur `#enable-webmcp-testing` flag ki zaroorat ho sakti hai. Har browser/agent mein registration guaranteed nahi.
11. **MCP Server Card — compatibility plus current endpoint implemented.** Aapke scanner ke requested `/.well-known/mcp/server-card.json` path par legacy-compatible card file hai. Current Server Card `/api/mcp/server-card` par hai, aur AI Catalog isi current card ko discover karwata hai. MCP endpoint `/api/mcp` public, read-only product search/store info tools expose karta hai. Ismein private order/account data, sign-in, stock changes, checkout ya payment tools nahi hain. Server Card mein tools list ka duplicate nahi diya jata; MCP runtime `tools/list` se current tools batata hai.

## Owner se abhi kya chahiye

- Official Instagram/Facebook/YouTube/Pinterest/Google Business profile URLs — sameAs ko complete karne ke liye.
- Registered legal business name (agar brand name se alag hai), public business address, monitored support email/phone — sirf agar sach mein public karna hai.
- Actual product SKU details, photos, prices aur inventory. Demo product prices/photos ko confirmed stock/real product representation na samjhein.
- Hostinger AdSense slot IDs: publisher/client ID `ca-pub-7776844434912624` pehle se configured; numeric ad-unit slot IDs separately set karne honge.

## Admin login — alag issue, 11 crawler checks se unrelated

Admin email default/configured value: `admin@saanwariyasethfashion.com`. Password woh private value hai jo `ADMIN_PASSWORD` mein configured hai; koi fixed public password nahi.

Agar login screen par **Email or password is incorrect** aata hai:

1. `.env` ya Hostinger environment mein `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` set karein.
2. `ADMIN_PASSWORD` kam-se-kam 16 characters ka private unique password ho.
3. `DATABASE_URL` usi MySQL database ko point kare jo live website use karti hai.
4. Us exact DB ke against ye commands run karein:

```bash
npm run db:admin:reset
npm run db:admin:verify
```

`db:admin:reset` sirf configured admin user ko upsert karta hai, password bcrypt se hash karta hai aur `ADMIN` role set karta hai. Ye demo products ko reseed/overwrite nahi karta. Admin password reset ke liye `npm run db:seed` use na karein.

Windows PC se remote Hostinger DB use karte waqt `.env` mein Hostinger external hostname aur allowed public IP zaroori hai. Hostinger application runtime par us environment ke database host value (aapke setup mein `127.0.0.1:3306`) rahegi. Reset aur verify same actual database par hone chahiye.

Hostinger Environment Variables mein bhi wahi `ADMIN_EMAIL` aur `ADMIN_PASSWORD` rakhein. `AUTH_SECRET` kam-se-kam 32 characters ka stable random secret ho aur live Node.js app mein configured ho. `AUTH_SECRET` badalne se existing session cookies invalidate hote hain; users ko dobara login karna padega.

Agar login error **Login service is temporarily unavailable** hai, toh ye password mismatch se zyada `DATABASE_URL`, missing/short `AUTH_SECRET`, ya DB connectivity ka issue ho sakta hai. Agar login ke baad `/admin` ke bajay `/account` aaye, `db:admin:verify` se role `ADMIN` confirm karein.

Login page: `https://saanwariyasethfashion.com/login?next=/admin`  
Admin page: `https://saanwariyasethfashion.com/admin`

Never add `.env`, DB password, `ADMIN_PASSWORD` ya `AUTH_SECRET` to GitHub or send them in chat/screenshots.

## Deploy steps

1. Latest source ko project `D:\\saanwariya` mein update karein. `.git`, `.env` aur database ko delete/replace na karein.
2. Run:

```cmd
cd /d D:\\saanwariya
npm install
npm run build
```

3. Build successful ho tab:

```cmd
git add -A
git commit -m "Add agent discovery, structured data and admin login fix"
git push origin main
```

4. Hostinger par confirm karein ki latest `main` commit hi deploy hua aur build status success hai.

## Live checks after deployment

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check-agent-readiness.ps1
```

Manual Markdown check:

```powershell
(Invoke-WebRequest -Uri 'https://saanwariyasethfashion.com/' -Headers @{ Accept = 'text/markdown' }).Headers['Content-Type']
```

Expected content type: `text/markdown; charset=utf-8`.

Google Rich Results Test: https://search.google.com/test/rich-results . Search engines may not display every schema enhancement; valid markup does not guarantee rich-result display or AdSense acceptance.

## Validation performed on this source package

- 70 TypeScript/TSX files parsed with TypeScript transpilation; no syntax diagnostics.
- `package.json`, AI Catalog JSON and legacy MCP Server Card JSON parsed successfully.
- Full production build was not run in this environment because project dependencies were not installed here. Run `npm install` + `npm run build` on your PC before push.
- Current live endpoints were not confirmed from this environment; run the PowerShell check after Hostinger deploy.
