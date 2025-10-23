# Production Deploy Runbook (Vercel + Neon)

A concise, step-by-step guide to deploy to production with Neon Postgres and Paystack.

## 0) Prerequisites
- Neon Postgres created (pooled connection string)
- Paystack test/live keys (per environment)
- Domain or the Vercel-provided URL

## 1) Environment Variables
Set these in Vercel → Project → Settings → Environment Variables.

Required:
- DATABASE_URL = <Neon pooled connection string, e.g. `postgres://...-pooler.../neondb?sslmode=require`>
- PAYSTACK_PUBLIC_KEY = pk_test_... or pk_live_...
- PAYSTACK_SECRET_KEY = sk_test_... or sk_live_...
- PAYSTACK_WEBHOOK_SECRET = optional shared secret if used for verification (or rely on Paystack signature)
- NEXT_PUBLIC_SITE_URL = https://your-domain.com

Recommended:
- NODE_ENV = production

## 2) Run Prisma Migrations (once per environment)
Option A (local, recommended for prod):
1. Copy the Neon pooled URL into a local `.env` as DATABASE_URL
2. Run: `npm run db:deploy:prod`
   - This runs `prisma migrate deploy` against Neon

Option B (on a one-off server):
- SSH into a trusted runner with the DATABASE_URL set and run `npx prisma migrate deploy`

Note: Avoid running migrations in Vercel build steps.

## 3) Deploy to Vercel
- Commit all changes to main
- Trigger a production deployment in Vercel
- Ensure the prisma client is generated on install (already handled via postinstall script)

## 4) Post-Deploy Smoke Tests
- Call health endpoints/pages:
  - /payment (renders)
  - /api/paystack/initialize (returns 401 if missing keys or 200 with a valid payload)
- Run the DB smoke test locally against Neon: `npm run db:smoke`

## 5) Webhook Validation
- In Paystack Dashboard, set the webhook URL to: `https://your-domain.com/api/paystack/webhook`
- Trigger a test event
- Confirm the signature verification passes and PaymentIntent is updated

## 6) Rollback
- If a migration broke prod:
  - Temporarily revert to previous deploy in Vercel
  - Create a corrective migration locally
  - Deploy migrations again, then redeploy

## Notes
- Use pooled connections for serverless
- Keep `sslmode=require` for Neon
- Never commit secrets; use Vercel Env Manager
