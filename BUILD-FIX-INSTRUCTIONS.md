# Build fix for Saanwariya Seth Fashion

This update addresses the TypeScript errors reported after removing the unrelated `/app/pdf` routes. It adds explicit types to the checkout line-item calculation in `app/api/orders/route.ts`.

## Apply to an existing local folder

1. Copy the replacement `app/api/orders/route.ts` from this package into your project, replacing the existing file.
2. Open CMD in the project folder and run:

```cmd
rmdir /s /q .next
npm run build
```

If Windows says `.next` does not exist, continue with the build command. The `.next` folder is generated build output and is safe to delete.

Confirm `app\pdf` no longer exists in this fashion-store project. Do not manually delete files inside `.next` one by one; remove the entire folder so Next.js regenerates route type validators without the old PDF routes.

After a successful local build, push the fix:

```cmd
git add app/api/orders/route.ts tsconfig.json
git commit -m "Fix stale Next.js route types and order typing"
git push origin main
```

`tsconfig.json` is included in the add command only in case Next.js modified it locally. Never commit `.env` or database credentials.
