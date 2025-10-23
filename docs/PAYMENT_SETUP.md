# Payment Setup (Paystack)

This guide explains how payments are wired in HotelSaver.ng and how to configure Paystack locally and in production.

## Overview

We support two payment paths:
- Pay at Hotel – offline method (no gateway); used by the E2E happy path
- Paystack – online card/bank transfer through the Paystack checkout

Persistence:
- A minimal `PaymentIntent` Prisma model tracks status (INITIATED → PAID/FAILED) and stores the provider reference and raw webhook payloads.

## Environment Variables

Create `.env` and set:

```
DATABASE_URL="postgres://user:password@host:5432/db"
PAYSTACK_SECRET_KEY="sk_test_xxx"  # server-only secret
# Optional; used if you need absolute URLs in callbacks
# NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

See `.env.example` for the latest list.

## Prisma

- `npm install` will run `prisma generate` via postinstall
- Apply migrations locally:
  - `npx prisma migrate dev`
- Explore data:
  - `npx prisma studio`

Model (simplified):
```
model PaymentIntent {
  id          String   @id @default(cuid())
  provider    String   // 'paystack'
  reference   String   @unique
  amountNGN   Int
  currency    String   // 'NGN'
  email       String
  status      String   // INITIATED | PAID | FAILED
  propertyId  String?
  context     Json?
  paidAt      DateTime?
  raw         Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Endpoints & Pages

### Server Routes (Labeled)
- `POST /api/paystack/initialize`
  - Validates payload; calls Paystack initialize; upserts PaymentIntent with reference (INITIATED)
  - Responds with `{ authorization_url, reference }`
- `GET /api/paystack/verify?reference=...`
  - Calls Paystack verify; updates PaymentIntent to PAID/FAILED; returns normalized result
- `POST /api/paystack/webhook`
  - Verifies `x-paystack-signature` using `PAYSTACK_SECRET_KEY` (HMAC SHA512)
  - Updates PaymentIntent and stores raw payload

### Client Pages (Labeled)
- `/payment`
  - Collects context; POSTs to initialize; redirects to `authorization_url`
- `/payment/callback`
  - Reads `reference`/`trxref` from URL; calls verify; forwards to `/confirmation`
- `/confirmation`
  - Shows final booking/payment summary

### Endpoint Contracts

POST `/api/paystack/initialize`
- Input (JSON): `{ amountNGN: number, email: string, metadata?: object }`
- Output: `{ authorization_url: string, reference: string }`
- Errors: `400 invalid-payload`, `500 provider-error`

GET `/api/paystack/verify?reference=...`
- Output: `{ status: 'PAID'|'FAILED', reference: string, amountNGN: number }`
- Errors: `400 invalid-reference`, `404 not-found`, `500 provider-error`

POST `/api/paystack/webhook`
- Headers: `x-paystack-signature`
- Output: `{ ok: true }`
- Errors: `401 invalid-signature`, `400 bad-payload`

## Local Development

1) Start dev server: `npm run dev`
2) Use the Payment page and choose Paystack
3) After completing the Paystack sandbox flow, you’ll land on `/payment/callback`
4) The callback verifies the reference and routes to `/confirmation`

Webhook (optional locally):
- Expose your dev server (e.g., `ngrok http 3000`)
- Configure Paystack webhook URL: `https://<tunnel>/api/paystack/webhook`
- Confirm events are received and PaymentIntent is updated

## Production Configuration

- Set `PAYSTACK_SECRET_KEY` and `DATABASE_URL` in Vercel environment
- Ensure Prisma Client generation occurs during build (we use `postinstall`)
- Configure Paystack dashboard:
  - Callback URL resolves to `/payment/callback`
  - Webhook URL points to `/api/paystack/webhook`

## Troubleshooting

- Verify signature mismatches: ensure `PAYSTACK_SECRET_KEY` is correct and raw body is used when computing HMAC
- Reference not found: verify initialize stored a PaymentIntent; check DB and logs
- Callback query params: handle both `reference` and `trxref`
- Amount mismatches: always compute amounts on server; never trust client-submitted totals

## Security Notes

### Security Checklist
- [ ] Use server-only `PAYSTACK_SECRET_KEY`
- [ ] Verify webhook signature using raw body and HMAC SHA512
- [ ] Persist `reference` and `raw` gateway payloads
- [ ] Treat payment as settled only after verify/webhook confirms
- [ ] Never trust client-calculated amounts

- Never expose `PAYSTACK_SECRET_KEY` to the client
- Always verify webhook signatures
- Store `raw` webhook payloads for audit
- Treat `status=PAID` only after verification or webhook reconciliation
