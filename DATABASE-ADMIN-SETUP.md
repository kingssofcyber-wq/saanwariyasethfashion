# Database and Admin Setup — Saanwariya Seth Fashion

## Admin login

- Admin URL: `/admin`
- Sign-in URL: `/login?next=/admin`
- Default admin email: `admin@saanwariyasethfashion.com`
- Admin display name: `Mivaan Jangra`
- Admin login field: email address (the login form does not use a separate username).
- Password: set `ADMIN_PASSWORD` privately in `.env` or Hostinger Environment Variables before seeding. Do not commit it to GitHub.

The seed script requires a password of at least 16 characters. Running `npm run db:seed` again updates the admin account password/name/role to the values currently in the environment.

## Create all database tables and initial records

1. The database shown in the provided Hostinger screenshot is `u257741217_saanwariya`, with database user `u257741217_Mivaan` and port `3306`.
2. For a Node.js app running on Hostinger with a Hostinger MySQL database, use `127.0.0.1` as the host (Hostinger's current Node.js connection guide specifies this). The `.env.example` already contains the database name/user and a password placeholder. Replace `URL_ENCODED_PASSWORD` with your URL-encoded database password; in the password, `@` must become `%40`.
3. Set `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_NAME`, and `ADMIN_PASSWORD` in the application environment.
3. From the project root, run:

```bash
npm install
npm run db:setup
npm run db:verify
```

`db:setup` runs `prisma db push` and then the seed script. It creates/updates the Prisma tables and seeds the administrator plus the 30 demo products. It is designed to be run once for initial setup, or again deliberately when you want to reset the seeded administrator and refresh the demo product records. Re-running the seed updates matching demo product records, so export/back up product data before re-running if you have edited those demo products in the admin panel.

## Tables created from `prisma/schema.prisma`

- `User` — customer and administrator accounts
- `Product` — store catalogue and inventory
- `Order` — customer orders and delivery/payment details
- `OrderItem` — line items within each order
- `ContactMessage` — contact form submissions
- `ProductReview` — product ratings, reviews and approval status

Prisma manages the underlying MySQL table names and relations. Wishlist and Compare are currently browser-side customer features; they are not separate MySQL tables in this schema.

## Local Windows setup

Copy `.env.example` to `.env`, enter the actual credentials, then run `SETUP-WINDOWS.bat`, or use:

```cmd
npm install
npm run db:setup
npm run dev
```

## Hostinger setup

Add the same variables in Hostinger's Node.js Environment Variables. For a Node.js app hosted on Hostinger with a Hostinger MySQL database, Hostinger's current guide specifies `127.0.0.1` as the DB host and port `3306`; use the exact database name and username shown in hPanel. URL-encode special characters in the password (for example `@` becomes `%40`). Then open the app's SSH/terminal session in the project directory and run:

```bash
npm run db:setup
npm run db:verify
```

Restart/rebuild the application after changing environment variables. Never paste database or admin passwords into chat, source files, or GitHub.

## Footer credit

The global footer now displays: `Made with ♥ by Mivaan Jangra`.
