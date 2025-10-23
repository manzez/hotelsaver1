# Connect Wix Domain to Vercel (Next.js App)

This guides you to keep your Wix site on the root domain while hosting the Next.js app on Vercel under a subdomain (recommended: `app.yourdomain.com` or `book.yourdomain.com`).

## Overview
- Root domain (www.yourdomain.com) stays on Wix
- App runs on Vercel at a subdomain, e.g., `app.yourdomain.com`
- DNS: Add a CNAME in Wix pointing the subdomain to Vercel
- SSL: Automatic via Vercel once DNS propagates

## 1) Deploy the app to Vercel
1. Create a Vercel account and click "New Project"
2. Import your GitHub repo (this project)
3. When prompted, set the environment variables (see section below)
4. Deploy; you’ll get a temporary Vercel URL (e.g., `your-app.vercel.app`)

## 2) Add your domain/subdomain in Vercel
1. In Vercel: Project → Settings → Domains → Add
2. Enter your desired subdomain, e.g., `app.yourdomain.com`
3. Vercel will show the exact CNAME target to use (often `cname.vercel-dns.com`, but copy the value Vercel shows)

## 3) Add the DNS record in Wix
1. Wix Dashboard → Domains → Manage DNS
2. Add a **CNAME** record:
   - Host/Name: `app` (or your chosen subdomain label)
   - Value/Points to: the CNAME target Vercel provided (e.g., `cname.vercel-dns.com`)
   - TTL: Default
3. Save. DNS can take 5–30 minutes (sometimes up to 24h) to propagate.

Once DNS is live, Vercel will provision SSL automatically. Visit `https://app.yourdomain.com` to verify.

## 4) Environment variables (Vercel → Project → Settings → Environment Variables)
Set for Production (and Preview as needed):
- `NEXTAUTH_URL` → `https://app.yourdomain.com`
- `NEXTAUTH_SECRET` → Use `openssl rand -base64 32` (or Vercel’s generate)
- `PAYSTACK_PUBLIC_KEY` → Live publishable key
- `PAYSTACK_SECRET_KEY` → Live secret key
- `PAYSTACK_WEBHOOK_SECRET` → From Paystack dashboard (set in Webhooks)
- `DATABASE_URL` → Neon/Supabase Postgres connection string
- Optional:
  - `SENTRY_DSN` → If using Sentry
  - `REDIS_URL` → If using Upstash Redis for rate limiting
  - any `X_ADMIN_KEY` / hotel keys you use in admin APIs

## 5) Paystack setup
- In Paystack Dashboard → Settings → Webhooks
  - Webhook URL: `https://app.yourdomain.com/api/paystack/webhook`
  - Webhook secret: paste the value you set in Vercel as `PAYSTACK_WEBHOOK_SECRET`
- Make a small live NGN test payment to verify the end-to-end flow.

## 6) Email (Resend/Postmark/Mailgun) – optional but recommended
- If you want a custom From domain (e.g., `booking@yourdomain.com`), your provider will give you SPF/DKIM DNS records.
- Add those TXT/CNAME records in Wix DNS for deliverability.

## 7) Observability & reliability (quick wins)
- Sentry: add `SENTRY_DSN` in Vercel and verify an intentional test error is captured
- UptimeRobot: add monitors for `https://app.yourdomain.com`
- Logs: Vercel Logs are fine initially; optionally add Better Stack (Logtail)

## Notes
- Root stays on Wix: You don’t need to move nameservers. Only add a **CNAME** for the subdomain.
- If in the future you want the app on the root domain, you’ll need to move DNS off Wix or use an A/ALIAS record. Keeping the app on a subdomain is the simplest and safest with Wix.
- CORS: The app is same-origin by default; linking from Wix pages to `app.yourdomain.com` doesn’t require CORS changes.

## Troubleshooting
- `DNS_PROBE_FINISHED_NXDOMAIN`: DNS not propagated or record mis-typed. Verify the CNAME value matches what Vercel shows.
- `Invalid config error` on webhook: URL typo or webhook secret mismatch.
- SSL not provisioning: Ensure the CNAME is active and not proxied by another provider; wait 15–30 minutes and re-check Vercel’s domain dashboard.
