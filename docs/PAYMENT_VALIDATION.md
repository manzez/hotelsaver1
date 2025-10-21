# Payment Flow Validation Guide

This guide helps you validate the end-to-end booking → payment → confirmation flow, including Paystack.

## 1) Environment setup

Create `.env.local` based on `.env.example` and add your Paystack secret key:

```
PAYSTACK_SECRET_KEY="sk_test_xxx"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-strong-secret"
ADMIN_API_KEY="dev-admin-key"
NEXT_PUBLIC_ADMIN_API_KEY="dev-admin-key"
DATA_SOURCE="json"
```

Notes:
- PAYSTACK_SECRET_KEY is required for initializing and verifying transactions.
- DATA_SOURCE=json uses the static JSON dataset shipped in the repo.

## 2) Start the app

```
npm install
npm run dev
```

Open http://localhost:3000

## 3) Smoke test (manual)

- Navigate to a property and start the Negotiate → Book flow
- On `/book`, submit contact details to go to `/payment`
- On `/payment`:
  - Fill in contact information (name, email, phone). Email is required for Paystack.
  - Choose "Paystack"
  - Click the pay button
  - You should be redirected to Paystack checkout
- Complete/abort the Paystack payment, then you’ll be redirected to `/payment/callback`
- The callback verifies the transaction via `/api/paystack/verify` and forwards to `/confirmation` with a bookingId

Expected:
- `/payment/callback` always forwards to `/confirmation`, even on failure; successful verifications set `paymentMethod=paystack` and populate `bookingId` from Paystack `reference`.

## 4) VAT and totals sanity

- VAT is applied only for multi-night stays (nights > 1) at 7.5%
- Totals are consistent across Book → Payment → Confirmation
- Prices are displayed in Nigerian Naira with commas (₦150,000)

## 5) Optional: minimal e2e check (headless)

Run a subset of tests if you have Playwright installed:

```
npm run build
npm start & sleep 10
npm run test:booking
kill %1
```

Adjust for macOS zsh; ensure tests are configured for your environment.

## 6) Recommended hardening (next)

- Webhook: Configure a Paystack webhook to POST to `https://<your-domain>/api/paystack/webhook`. We verify `x-paystack-signature` (HMAC SHA512) using `PAYSTACK_SECRET_KEY` and mark intents as PAID/FAILED.
- Persistence: Store bookings and payment intents via Prisma (status, reference, totals, customer). Update after webhook verification.
- Server-side validation: Recompute allowed totals from `propertyId` and discounts on the server to prevent client tampering.
- Observability: Log transaction references and outcomes to aid support.

## 7) Troubleshooting

- Missing PAYSTACK_SECRET_KEY → `/api/paystack/*` will return 500 with an explicit error message.
- Callback without reference (or failed verify) still routes to `/confirmation` with available context; check the UI for status messaging.
- If amounts look wrong, re-check `price`, `originalPrice`, `nights`, and VAT rule (multi-night only).
