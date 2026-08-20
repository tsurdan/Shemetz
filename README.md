# שמץ (Shemetz)

Website for a monthly bulletin written by a small group of writers, covering topics like cinema, architecture, and philosophy. Built with Next.js, deployed to Cloudflare Workers (D1 database, R2 storage, Browser Rendering for PDF/image export).

## Stack

- **Next.js** (App Router) - deployed via the `@opennextjs/cloudflare` adapter
- **Cloudflare Workers** - hosting + server-side logic (bindings: D1, R2, Browser Rendering)
- **Cloudflare D1** - articles, issues, users, sections, subscribers (`migrations/0001_init.sql`)
- **Cloudflare R2** - cover images, per-article PDFs/share images, merged issue PDFs

## One-time setup (Phase 0 - manual, requires your own accounts)

1. Create a [Cloudflare account](https://dash.cloudflare.com/sign-up) (free).
2. Install and log in to Wrangler: `npx wrangler login` (requires Node.js **22+** locally - Wrangler will not run reliably on older Node versions).
3. Create the D1 database and paste its `database_id` into `wrangler.jsonc`:
   ```
   npx wrangler d1 create shemetz-db
   ```
4. Apply the schema (and optional starter sections):
   ```
   npx wrangler d1 execute shemetz-db --remote --file=./migrations/0001_init.sql
   npx wrangler d1 execute shemetz-db --remote --file=./migrations/seed.sql
   ```
5. Create the R2 bucket:
   ```
   npx wrangler r2 bucket create shemetz-media
   ```
6. Create a Google OAuth Client ID (Web application type) in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) for "Sign in with Google".
7. Create a [Resend](https://resend.com) account and API key for the newsletter.
8. Copy `.dev.vars.example` to `.dev.vars` and fill in the values from steps 6-7 for local development. In production, set the same values with `npx wrangler secret put <NAME>`.
9. Buy a custom domain (optional) and attach it to the Worker from the Cloudflare dashboard once deployed.

## Local development

```
npm install
npm run dev        # Next.js dev server at http://localhost:3000
npm run preview     # build + run once in the actual Workers runtime (more accurate than dev)
npm run deploy       # build + deploy to Cloudflare
```

