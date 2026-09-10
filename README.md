# שמץ (Shemetz)

Website for a monthly bulletin written by a small group of writers, covering topics like cinema, architecture, and philosophy. Built with Next.js, deployed to Cloudflare Workers (D1 database, Browser Rendering for PDF/image export).

## Stack

- **Next.js** (App Router) - deployed via the `@opennextjs/cloudflare` adapter
- **Cloudflare Workers** - hosting + server-side logic (bindings: D1, Browser Rendering)
- **Cloudflare D1** - articles, issues, users, sections, subscribers, and uploaded media (avatars/inline images, stored as BLOBs - see "Why no R2?" below)

## One-time setup (Phase 0 - manual, requires your own accounts)

1. Create a [Cloudflare account](https://dash.cloudflare.com/sign-up) (free).
2. Install and log in to Wrangler: `npx wrangler login` (requires Node.js **22+** locally - Wrangler will not run reliably on older Node versions).
3. Create the D1 database and paste its `database_id` into `wrangler.jsonc`:
   ```
   npx wrangler d1 create shemetz-db
   ```
4. Apply the schema:
   ```
   npx wrangler d1 execute shemetz-db --remote --file=./migrations/0001_init.sql
   npx wrangler d1 execute shemetz-db --remote --file=./migrations/0002_media_files.sql
   npx wrangler d1 execute shemetz-db --remote --file=./migrations/seed.sql
   ```
5. Create a Google OAuth Client ID (type: **Web application**) in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Authorized redirect URIs: add both `http://localhost:3000/api/auth/google/callback` (local dev) and `https://<your-production-domain>/api/auth/google/callback`.
   - Copy the Client ID and Client Secret into `.dev.vars` (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`), and set the same as Worker secrets in production (`npx wrangler secret put GOOGLE_CLIENT_ID`, etc.).
   - Writers must already exist as a row in the `users` table before they can log in (allowlist model) - add them from `/admin` ("הוספת כותב/ת") using just their name + email; their `google_sub` is filled in automatically on their first real Google login.
6. Create a [Resend](https://resend.com) account and API key for the newsletter.
7. Copy `.dev.vars.example` to `.dev.vars` and fill in the values from steps 5-6 for local development. In production, set the same values with `npx wrangler secret put <NAME>`.
8. Buy a custom domain (optional) and attach it to the Worker from the Cloudflare dashboard once deployed.

## Why no R2?

R2 (Cloudflare's object storage) requires adding a payment method to your account via a "checkout flow" before you can create a bucket, even though usage stays free within its generous monthly limits. To avoid requiring a card at all, avatars and inline article images are instead stored as BLOBs directly in D1 (which has no such requirement). D1's limit is 2,000,000 bytes per row, so upload size caps are kept at 1.5MB. If this project outgrows that, R2 (or Cloudflare Images) is the natural upgrade path later.

## Local development

```
npm install
npm run dev        # Next.js dev server at http://localhost:3000
npm run preview     # build + run once in the actual Workers runtime (more accurate than dev)
npm run deploy       # build + deploy to Cloudflare
```

There's also a `/dev-login` page that lets you sign in as any seeded user without going through Google - handy before you've configured `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, or for quick local testing afterwards.

