# GitHub + Hostinger deployment — Saanwariya Seth Fashion

Repository: https://github.com/kingssofcyber-wq/saanwariyasethfashion.git
Branch: `main`
Framework: Next.js App Router
Node.js: 22 (see `.nvmrc`)
Package manager: npm

## 1. Push the project to GitHub (Windows)

1. Extract this ZIP.
2. Open the `saanwariya-storefront-premium` folder.
3. Install Git for Windows if the `git` command is unavailable.
4. Double-click `PUSH-TO-GITHUB.bat`.
5. Complete GitHub's browser sign-in prompt if Git asks you to authenticate.
6. Check the repository URL above and confirm that the project files appear on the `main` branch.

The script sets `origin` to the repository above, stages the project, commits the files, and pushes `main`. `.env`, `.env.local`, and other secret environment files are excluded by `.gitignore`; `.env.example` is safe to publish because it contains placeholders only. Never add real database passwords, authentication secrets, payment keys, or affiliate tokens to GitHub.

Manual alternative, run from this project folder:

```cmd
git init
git branch -M main
git remote add origin https://github.com/kingssofcyber-wq/saanwariyasethfashion.git
git add .
git commit -m "Deploy Saanwariya Seth Fashion website"
git push -u origin main
```

If `origin` already exists, use `git remote set-url origin https://github.com/kingssofcyber-wq/saanwariyasethfashion.git` instead of adding it again.

## 2. Configure Hostinger Business Node.js Web App

In Hostinger hPanel, create a **Web App / Node.js app** and connect the GitHub repository above. Select branch `main` and the repository root (`/`) as the app root.

Suggested settings (confirm the values shown in your Hostinger deployment screen):

- Framework: Next.js
- Node.js: 22
- Package manager: npm
- Install: `npm install`
- Build: `npm run build`
- Start: `npm run start`

Hostinger may auto-detect these settings. If its dashboard provides different framework-specific recommended values, use those values.

## 3. Add production environment variables in Hostinger

Copy the variable NAMES from `.env.example` into Hostinger's Environment Variables panel, then enter the real values from your own Hostinger database and accounts:

- `DATABASE_URL` — MySQL connection string from hPanel
- `AUTH_SECRET` — a new random secret of at least 32 characters
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` — a strong unique password; do not use the sample password
- `NEXT_PUBLIC_SITE_URL` — `https://saanwariyasethfashion.com`
- `FLIPKART_AFFILIATE_ID` and `FLIPKART_AFFILIATE_TOKEN` only after approved official affiliate access is available

Do not send secrets in chat and do not commit a real `.env` file.

## 4. Database setup

Create the MySQL database and database user in Hostinger hPanel. Put the exact Hostinger-provided connection string into the `DATABASE_URL` environment variable. Once the app is deployed and the database is reachable, run the Prisma schema push and seed process using a supported Hostinger method:

```bash
npx prisma db push
npm run db:seed
```

If your Hostinger plan/dashboard does not provide a terminal or command runner for the app, use a local computer with Node.js 22 and the same `DATABASE_URL` to run those two commands once. Keep the credentials private and do not share the `.env` file.

The seed creates the admin account using the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values and inserts 30 demo products. Change the sample admin password before seeding a production database.

## 5. Verify the live website

After a successful deployment, check:

- `https://saanwariyasethfashion.com/`
- `/shop`
- `/cart`
- `/login` and `/register`
- `/admin` (must require admin sign-in)
- Product images, search, filters and sorting
- Registration/login and a COD test order
- Admin order status and product management

A successful GitHub push does not by itself mean the site is live. Check Hostinger's Deployments screen for a successful deployment and open the live domain.

## Important domain warning

If `saanwariyasethfashion.com` already hosts another website, back it up before changing its website type or connecting the domain to a new Node.js Web App. Keep existing email/MX records intact. Hostinger's current instructions say an existing PHP/WordPress website generally cannot simply be switched in place to a Node.js app; follow the current hPanel migration flow and do not remove the old site until a full backup is secured.

## Current project status

The project package includes the storefront, Prisma schema/seed, admin page, API routes, brand assets, homepage hero and the 30-product demo catalogue. The source archive's production build has not yet been verified in a live Hostinger environment. Resolve any build/runtime errors from Hostinger's deployment logs before accepting real orders. Payment gateway, courier fulfilment and official Flipkart affiliate API access still require separate configuration.
