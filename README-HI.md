# Saanwariya Seth Fashion – Build TypeScript Fix

This patch replaces exactly three source files from the current agent-ready project:

1. `app/api/orders/route.ts` – typed and validated checkout endpoint, database product prices, transaction-based stock updates.
2. `components/adsense.tsx` – fixes `onReady` callback return type by using a block body, keeps the configured publisher ID and slot placeholders.
3. `lib/structured-data.ts` – removes the duplicate `url` property that caused TS1117.

## Apply on Windows

Extract this ZIP. Copy the contents into `D:\\saanwariya` and allow the three files to replace the existing files. Do not replace `.env`, `.git`, `node_modules`, or your database.

Then run:

```cmd
cd /d D:\\saanwariya
rmdir /s /q .next
npm run build
```

If build succeeds:

```cmd
git add app/api/orders/route.ts components/adsense.tsx lib/structured-data.ts
git commit -m "Fix orders AdSense and structured data build errors"
git push origin main
```

The `DATABASE_URL`, `AUTH_SECRET`, admin credentials and all other secrets must remain in `.env` locally / Hostinger Environment Variables. Never commit `.env`.

Validation in the preparation environment: syntax/transpilation passed for all three files. A full Next.js production build was not run here; run `npm run build` locally before pushing.
