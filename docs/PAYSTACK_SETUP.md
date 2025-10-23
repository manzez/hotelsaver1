# Paystack Production Setup

Follow these steps to safely enable real payments.

## 1) Switch to Live Mode
- In Paystack Dashboard → Settings → API Keys & Webhooks
- Copy your Live `PAYSTACK_PUBLIC_KEY` and `PAYSTACK_SECRET_KEY`
- Paste into Vercel → Project → Settings → Environment Variables

## 2) Configure Webhook
- Webhook URL: `https://app.yourdomain.com/api/paystack/webhook`
- Generate or copy `PAYSTACK_WEBHOOK_SECRET` in Paystack
- Paste the same value into Vercel as `PAYSTACK_WEBHOOK_SECRET`

## 3) Whitelist your production domain
- Ensure your production domain (e.g., `app.yourdomain.com`) is whitelisted in Paystack if required

## 4) Test a live NGN transaction
- Run a small live payment (e.g., ₦50–₦100)
- Verify in your app that payment status updates correctly
- Confirm your server logs show a valid webhook signature

## 5) Monitoring
- Add a Paystack webhook failure alert email (optional)
- Verify error tracking captures failures (Sentry if configured)

## Troubleshooting
- Invalid webhook signature → check `PAYSTACK_WEBHOOK_SECRET` matches exactly
- Timeouts → ensure `/api/paystack/webhook` responds in < 5s and returns 200 on success
- CORS → Payments use server-side calls; CORS typically not required for Paystack server API calls
