# Vercel Environment Variables

Use this map to configure your Vercel project (Production and Preview). For local dev, copy .env.example → .env.

## Required

- NEXTAUTH_URL
  - Production: https://app.yourdomain.com
  - Preview: Vercel preview URL (auto) or leave unset
- NEXTAUTH_SECRET
  - A strong random secret (32+ bytes)
- DATABASE_URL
  - Neon/Supabase Postgres connection string
- PAYSTACK_PUBLIC_KEY
  - Live publishable key
- PAYSTACK_SECRET_KEY
  - Live secret key
- PAYSTACK_WEBHOOK_SECRET
  - From Paystack Dashboard → Webhooks

## Optional

- SENTRY_DSN
  - Enable error tracking in production
- REDIS_URL
  - Upstash Redis for shared rate limiting
- ADMIN_API_KEY / NEXT_PUBLIC_ADMIN_API_KEY
  - Only if you want admin UI/API in production (rotate frequently)
- OPENAI_API_KEY
  - If using the chatbot features in production

## Scopes

- Production: Set all required values above
- Preview: Set safe test keys or omit payment envs to avoid accidental charges
- Development: Use .env locally

## Notes

- Keep all secrets in Vercel → Project → Settings → Environment Variables
- After adding/editing env vars, re-deploy to apply changes
- Webhook URL for Paystack: `https://app.yourdomain.com/api/paystack/webhook`
