# Deployment Checklist (Vercel + Paystack)

Use this to take the app live safely.

## 1) Create Vercel project
- [ ] Import GitHub repo
- [ ] Set framework = Next.js (detected automatically)
- [ ] Build command: `next build` (default)
- [ ] Output: `.next` (default)

## 2) Environment variables (Production)
- [ ] `NEXTAUTH_URL` → `https://app.yourdomain.com`
- [ ] `NEXTAUTH_SECRET` → strong random secret
- [ ] `PAYSTACK_PUBLIC_KEY` → live publishable key
- [ ] `PAYSTACK_SECRET_KEY` → live secret key
- [ ] `PAYSTACK_WEBHOOK_SECRET` → copy from Paystack
- [ ] `DATABASE_URL` → Neon/Supabase Postgres
- [ ] Optional: `SENTRY_DSN`, `REDIS_URL`, `ADMIN_API_KEY`, `NEXT_PUBLIC_ADMIN_API_KEY`

## 3) Domain
- [ ] Add `app.yourdomain.com` in Vercel → Project → Settings → Domains
- [ ] Create CNAME in DNS pointing to the Vercel target (see Vercel domain page)
- [ ] Verify HTTPS works on `https://app.yourdomain.com`

## 4) Database
- [ ] Create Neon (or Supabase) Postgres
- [ ] Configure pooled connection string if using serverless
- [ ] Run migrations: `prisma migrate deploy`
- [ ] (Optional) Seed minimal data if needed

## 5) Paystack Webhook
- [ ] Webhook URL: `https://app.yourdomain.com/api/paystack/webhook`
- [ ] Webhook secret: same as `PAYSTACK_WEBHOOK_SECRET`
- [ ] Make a small live NGN test payment and verify callback flow

## 6) Observability and reliability
- [ ] Sentry: verify a test error is captured
- [ ] UptimeRobot: add `https://app.yourdomain.com`
- [ ] Logs: Vercel Logs (or Better Stack / Logtail)

## 7) Security & privacy
- [ ] Security headers enabled (HSTS, X-Content-Type-Options, etc.)
- [ ] Cookies set to `Secure` in production
- [ ] PII minimization: no sensitive data in logs
- [ ] Backups: Neon scheduled backups or daily `pg_dump`
- [ ] Policies: Terms of Service, Privacy Policy (NDPR-aligned), cookie notice if analytics
- [ ] Key rotation reminder scheduled

## 8) Final preflight
- [ ] Mobile checkout works on real device
- [ ] Negotiation timers (4.5s and 6s) behave correctly
- [ ] Booking CTAs (blue) vs Negotiate (green) visuals verified
- [ ] Confirmation page includes customer name, directions, and share links

## Operations tips
- Production test without dev overlay: `npm run build && npm run start:lan`
- If testing on LAN, use `http://<LAN-IP>:3000` from your phone (same Wi‑Fi)
- macOS firewall can block Node; allow incoming connections if needed
