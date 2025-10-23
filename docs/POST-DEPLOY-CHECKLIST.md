# Post-Deploy Checklist (Vercel)

Use this quick runbook immediately after a deployment to production.

## 1) Set Base URL (one-time)
- In Vercel → Project → Settings → Environment Variables
  - Key: `NEXT_PUBLIC_BASE_URL`
  - Value: `https://your-domain.com` (no trailing slash)
- Redeploy. This powers:
  - Canonical URLs (Next metadataBase)
  - robots.txt `Host` and `Sitemap`
  - Absolute URLs in `sitemap.xml`

## 2) Smoke test (public pages)
- Home: `GET /` returns 200
- Search: `GET /search`
- Hotel detail: `GET /hotel/<known-id>`
- Negotiate: `GET /negotiate` (UI loads, no errors)
- Book: `GET /book` (UI loads, no errors)

## 3) SEO & Legal
- robots: `GET /robots.txt` contains correct Host and Sitemap
- sitemap: `GET /sitemap.xml` lists core pages + hotel pages
- 404: visit `/this-definitely-does-not-exist` → branded 404 page
- Legal pages render: `/privacy`, `/terms`, `/cookies`, `/refund-policy`, `/legal`

## 4) Health endpoint
- `GET /api/status` returns `{ ok: true, name, version, timestamp }`
- Add to UptimeRobot (or similar):
  - Monitor Type: HTTP(s)
  - URL: `https://your-domain.com/api/status`
  - Keyword (optional): `"ok": true`

## 5) Environment variables (if enabling features)
- Payments (Paystack):
  - `PAYSTACK_PUBLIC_KEY`
  - `PAYSTACK_SECRET_KEY`
  - `PAYSTACK_WEBHOOK_SECRET`
- Authentication (NextAuth):
  - `NEXTAUTH_URL` = `https://your-domain.com`
  - `NEXTAUTH_SECRET` (strong random string)
- Database (Prisma):
  - `DATABASE_URL` (Neon/Supabase/etc.) → run `prisma migrate deploy` once

## 6) Security & Monitoring
- Domain: add `your-domain.com` in Vercel → Domains, confirm HTTPS
- Headers: security headers applied via `next.config.js` (production only)
- Optional: Sentry DSN → capture a test error
- Optional: Vercel Analytics → enable project analytics

## 7) Payment (if enabled now)
- Initialize a small NGN test payment
- Verify callback flow completes
- Confirm webhook signature validation → logs show verified event

## 8) Rollback (if needed)
- Vercel → Deployments → select previous
- Click "Promote to Production" (or use `vercel rollback <deployment-url>`) 

---

### Quick Commands (local optional)

```bash
# Build locally before pushing
npm run build

# Typecheck
npx tsc --noEmit

# Run the local health endpoint (dev)
npm run dev
curl -sS http://localhost:3000/api/status | jq
```
