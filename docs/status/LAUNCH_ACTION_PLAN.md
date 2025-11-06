# ⚡ URGENT: 7-Day Launch Action Plan — Quick Reference

**Status:** 🚨 BLOCKING ISSUES MUST BE RESOLVED IN 24 HOURS

---

## 🔴 CRITICAL (Must Do Today — Oct 25)

### Task 1: Production Environment Variables (Vercel)
**Owner:** DevOps / Project Manager  
**Time:** 2 hours  
**Blocking:** Yes

```bash
# What to collect:
1. NEXTAUTH_SECRET (generate fresh)
   → openssl rand -base64 32
   
2. NEXTAUTH_URL
   → Your Vercel production domain (e.g., https://hotelsaver-prod.vercel.app)

3. OAuth Credentials:
   - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
   - FACEBOOK_CLIENT_ID / FACEBOOK_CLIENT_SECRET
   - INSTAGRAM_CLIENT_ID / INSTAGRAM_CLIENT_SECRET

4. Paystack Keys (from dashboard):
   - PAYSTACK_SECRET_KEY (sk_live_xxxx)
   - PAYSTACK_PUBLIC_KEY (pk_live_xxxx)
   - PAYSTACK_WEBHOOK_SECRET

5. Admin Key:
   → Generate: openssl rand -hex 32

6. Database:
   → DATABASE_URL (already have Neon connection)

7. Email:
   → RESEND_API_KEY (already have)
   → EMAIL_FROM (use onboarding@resend.dev for now, or branded domain)
```

**Action:** Log into Vercel → Project Settings → Environment Variables → Add all above for **Production** environment

---

### Task 2: Add Security Middleware
**Owner:** Backend Developer  
**Time:** 1 hour  
**Files:** Create `app/middleware.ts`

```bash
# Run this after creating middleware.ts file
npm run build  # Verify no errors
```

---

### Task 3: Fix NEGOTIATION_SECRET Fallback
**Owner:** Backend Developer  
**Time:** 30 mins  
**File:** `lib/negotiation.ts`

Change:
```typescript
return s || 'dev-only-secret-change-in-prod'
```

To:
```typescript
if (!s && process.env.NODE_ENV === 'production') {
  throw new Error('NEGOTIATION_SECRET or NEXTAUTH_SECRET required in production')
}
return s || 'dev-only-secret'
```

---

### Task 4: Verify Database in Production
**Owner:** Backend Developer  
**Time:** 30 mins

```bash
# After Task 1 is done (env vars in Vercel):
vercel env pull  # Pull prod env locally (temporary)
# Manually test: 
# → Open Vercel dashboard → Deployments → inspect logs
# → Look for "Prisma Client connected" or DB errors
```

---

## 🟡 HIGH-PRIORITY (Oct 25–26)

### Task 5: Fix Admin API Key Comparison
**Owner:** Backend Developer  
**Time:** 1 hour  
**Files:** `app/api/admin/**`

Update string comparison to timing-safe:
```typescript
import crypto from 'crypto'

function timingSafeCompare(a: string, b: string): boolean {
  const aLen = Buffer.byteLength(a)
  const bLen = Buffer.byteLength(b)
  if (aLen !== bLen) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}
```

---

### Task 6: Fix & Run Test Suite
**Owner:** QA / Backend Developer  
**Time:** 3–4 hours  
**Files:** `tests/e2e/*.spec.ts`, `tests/playwright.config.ts`

```bash
# Step 1: Check current status
cd tests
npm run test 2>&1 | head -50  # See first errors

# Step 2: Add data-testid to key elements
# → payment page, negotiate button, search form

# Step 3: Update base URL if needed
# → tests/playwright.config.ts

# Step 4: Run smoke test
npm run test:search  # Should pass

# Step 5: Run full suite
npm run test:all
```

---

### Task 7: Sentry Error Tracking
**Owner:** Backend Developer  
**Time:** 2 hours  
**Files:** `app/layout.tsx`

```bash
npm install @sentry/nextjs
```

Then add init code and create Sentry account, get DSN → Vercel env

---

## 🟢 SHOULD-DO (Oct 26–28)

### Task 8: Payment Callback Signature Verification
**Owner:** Backend Developer  
**Time:** 1 hour  
**Create:** `app/api/paystack/verify/route.ts`

Implement server-side Paystack verification before marking payment complete.

---

### Task 9: Rate Limiting Tightening
**Owner:** Backend Developer  
**Time:** 30 mins  
**File:** `app/api/negotiate/route.ts`

Change `capacity: 12` → `capacity: 5` (or lower)

---

### Task 10: Email Domain Upgrade (Optional)
**Owner:** DevOps  
**Time:** 2–3 hours  
**Blocking:** No (use onboarding@resend.dev as fallback)

If you have `hotelsaver.ng` domain:
- Add to Resend console
- Verify DNS
- Update EMAIL_FROM env var

---

## 📋 Verification Checklist (Before Going Live)

Run this checklist on **Oct 30, 2025** (24 hours before launch):

```
ENVIRONMENT:
- [ ] All 10 required env vars set in Vercel (NEXTAUTH_URL, NEXTAUTH_SECRET, OAuth x3, Paystack x3, ADMIN_API_KEY, DATABASE_URL, RESEND_API_KEY, EMAIL_FROM)
- [ ] Vercel deployment shows no build errors
- [ ] Production URL accessible (e.g., https://hotelsaver-prod.vercel.app)

SECURITY:
- [ ] Middleware.ts deployed and returning security headers
- [ ] NEGOTIATION_SECRET check throws error if missing
- [ ] Admin endpoints use timing-safe comparison
- [ ] Rate limiting reduced to 5/min on negotiate

DATABASE:
- [ ] Neon connection test succeeds
- [ ] Prisma migrations applied (check Vercel logs for "migration applied")
- [ ] Database query test passes (visit a hotel page, should not error)

AUTHENTICATION:
- [ ] OAuth providers hidden when credentials are demo placeholders (already fixed)
- [ ] Magic link sign-in available (Email provider)
- [ ] NEXTAUTH_URL matches production domain

PAYMENTS:
- [ ] Paystack production keys in Vercel
- [ ] Negotiation token signs correctly
- [ ] Test payment flow (cart → negotiate → payment page → Paystack)

EMAIL:
- [ ] Test booking confirmation email sends (use test account)
- [ ] Email comes from EMAIL_FROM address (check spam folder)

TESTING:
- [ ] npm run test:all passes (or at least smoke tests)
- [ ] Manual end-to-end flow tested (search → negotiate → book → payment)
- [ ] Mobile tested on Safari/Chrome

MONITORING:
- [ ] Sentry dashboard connected
- [ ] Vercel analytics enabled
- [ ] Logs viewable in Vercel CLI
```

---

## 📞 Emergency Contacts & Rollback

If anything breaks on Nov 1:

1. **Check Vercel Logs:** `vercel logs --follow`
2. **Database Down?** Contact Neon support or check dashboard
3. **Paystack Issue?** Contact Paystack support or revert to test keys
4. **Email Not Sending?** Check Resend dashboard or revert to dev key
5. **Need to Rollback?** `vercel rollback` (revert to previous deployment)

---

**Questions?** Ping the dev team or check the full `PRODUCTION_REVIEW_OCT2025.md`
