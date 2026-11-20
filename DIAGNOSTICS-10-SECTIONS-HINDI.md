# Saanwariya Admin – 10 sections load error ka fix (Hindi)

## Kya update hua?

1. Admin dashboard ab generic “10 sections could not load” par nahi rukta. Har failed section ka label, API endpoint aur HTTP status/error dikhata hai.
2. Naya ADMIN-only endpoint `/api/admin/diagnostics` MySQL connectivity aur 10 admin models ke expected tables/columns inspect karta hai.
3. Isse pata chalega ki issue database/schema, admin login/session ya kisi specific API route mein hai.
4. Admin typography ko Manrope font family par switch kiya gaya hai. Sidebar forest-green, main workspace warm-white/ivory, orange CTA aur green success states mein refine kiya gaya hai.

## Windows PC se latest schema apply karein

Database ka backup lene ke baad, `D:\saanwariya` se:

```cmd
cd /d D:\saanwariya
npx prisma db push
npx prisma generate
npm run db:admin:init
```

**Connection string:** local Windows `.env` mein Hostinger external database hostname `srv1518.hstgr.io:3306` hona chahiye. `127.0.0.1` aapke PC ko refer karega, isliye local computer se Hostinger DB access karte waqt use na karein.

Hostinger Node.js app ke production Environment Variables mein same-host DB URL `127.0.0.1:3306` ho sakta hai. Dono alag environments hain.

`db push` mein data-loss warning aaye toh stop karein, database backup aur proposed changes review karein. `--accept-data-loss` use na karein.

## API error ka matlab

- `HTTP 401/403`: logout/login karein; ADMIN role aur production `AUTH_SECRET` consistency verify karein.
- `P1000`: MySQL username/password/grants.
- `P1001`: host/port/network reachability.
- Missing tables/columns: backup ke baad Prisma db push.
- Schema ready but one endpoint fails: us API ka Hostinger Runtime Log dekhein.

## Files changed

- `components/admin-dashboard.tsx` – per-section failures and diagnostic panel.
- `app/api/admin/diagnostics/route.ts` – DB/schema health check.
- `app/globals.css` – Manrope font and refined forest/ivory/orange admin theme.

Full deployment:

```cmd
git add -A
git commit -m "Improve admin diagnostics and premium dashboard"
git push origin main
```


## Security version

`package.json` now pins Next.js to stable `16.4.6`. Run `npm install`, then `npm ls next` and `npm run build` to verify the installed dependency and full production build.
