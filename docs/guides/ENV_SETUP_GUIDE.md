# 🔐 Production Environment Variables Setup Guide

**Time Required:** 2 hours  
**Owner:** DevOps / Project Manager  
**Status:** CRITICAL BLOCKING

---

## Step 1: Collect All Required Credentials (30 mins)

Before you touch Vercel, gather these values:

### 1.1 NextAuth Secrets
```bash
# Generate a NEW secure secret (don't reuse dev value)
openssl rand -base64 32
# Example output: E0ZDTmdoyL5TeO3WQTWiOFM1bE2eEiTj0lDbLTQ368A=
# Copy this value → save as NEXTAUTH_SECRET
```

### 1.2 OAuth Credentials

**Google:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add Authorized Origins:
   - `https://hotelsaver-prod.vercel.app` (your Vercel domain)
   - `https://yourdomain.ng` (if using custom domain)
5. Add Authorized Redirect URIs:
   - `https://hotelsaver-prod.vercel.app/api/auth/callback/google`
6. Copy Client ID and Client Secret

**Facebook:**
1. Go to [Facebook App Dashboard](https://developers.facebook.com/)
2. Create/select app → Settings → Basic
3. Copy App ID (Facebook Client ID) and App Secret (Facebook Client Secret)
4. Go to Facebook Login → Settings:
   - Add Valid OAuth Redirect URIs: `https://hotelsaver-prod.vercel.app/api/auth/callback/facebook`

**Instagram (via Meta):**
- Use same Meta/Facebook app as above
- Instagram Client ID and Secret from same place

### 1.3 Paystack Credentials

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Log in with your account
3. Go to **Settings → API Keys & Webhooks**
4. Copy:
   - **Live Secret Key** (starts with `sk_live_`) → `PAYSTACK_SECRET_KEY`
   - **Live Public Key** (starts with `pk_live_`) → `PAYSTACK_PUBLIC_KEY`
5. Go to **Webhooks**:
   - Add webhook endpoint: `https://hotelsaver-prod.vercel.app/api/webhooks/paystack`
   - Copy webhook signing secret → `PAYSTACK_WEBHOOK_SECRET`

### 1.4 Email Service (Resend)

1. Go to [Resend Dashboard](https://resend.com/)
2. Go to **API Keys**
3. Copy your API key → `RESEND_API_KEY`

**Option A (Quick Launch):**
- Use `onboarding@resend.dev` as email sender
- `EMAIL_FROM="HotelSaver.ng <onboarding@resend.dev>"`

**Option B (Branded Domain — takes 30 mins):**
- Go to **Domains** in Resend
- Add your domain (e.g., `noreply@hotelsaver.ng`)
- Verify DNS records (follow on-screen instructions)
- Once verified: `EMAIL_FROM="HotelSaver.ng <noreply@hotelsaver.ng>"`

### 1.5 Admin API Key

```bash
# Generate a strong admin key
openssl rand -hex 32
# Example: a3f5d8c1e9b4a2f7d6c1e5b8a3f9d2c7
# Copy this value → save as ADMIN_API_KEY
```

### 1.6 Database Connection

Already configured locally; just copy to Vercel:
```
DATABASE_URL=postgresql://neondb_owner:npg_rwUDJBRkQn92@ep-aged-bird-a4o9f91s-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

(Or get from your `.env` file)

---

## Step 2: Add to Vercel Production Environment (1.5 hours)

### 2.1 Log in to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Log in with your GitHub account
3. Select project: **hotelsaver-ng-v9**

### 2.2 Navigate to Environment Variables

1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)
3. You'll see existing dev/test vars; we need to add **production** vars

### 2.3 Add Each Variable

**Click "Add New" for each variable below, set to "Production" environment:**

```
1. NEXTAUTH_URL
   Value: https://hotelsaver-prod.vercel.app
   Environment: Production
   [Add]

2. NEXTAUTH_SECRET
   Value: <your-generated-value-from-step-1.1>
   Environment: Production
   [Add]

3. GOOGLE_CLIENT_ID
   Value: <from-google-console>
   Environment: Production
   [Add]

4. GOOGLE_CLIENT_SECRET
   Value: <from-google-console>
   Environment: Production
   [Add]

5. FACEBOOK_CLIENT_ID
   Value: <from-facebook-app-dashboard>
   Environment: Production
   [Add]

6. FACEBOOK_CLIENT_SECRET
   Value: <from-facebook-app-dashboard>
   Environment: Production
   [Add]

7. INSTAGRAM_CLIENT_ID
   Value: <same-as-facebook>
   Environment: Production
   [Add]

8. INSTAGRAM_CLIENT_SECRET
   Value: <same-as-facebook>
   Environment: Production
   [Add]

9. PAYSTACK_SECRET_KEY
   Value: sk_live_xxxx...
   Environment: Production
   [Add]

10. PAYSTACK_PUBLIC_KEY
    Value: pk_live_xxxx...
    Environment: Production
    [Add]

11. PAYSTACK_WEBHOOK_SECRET
    Value: <from-paystack-webhooks>
    Environment: Production
    [Add]

12. ADMIN_API_KEY
    Value: <your-generated-value-from-step-1.5>
    Environment: Production
    [Add]

13. DATABASE_URL
    Value: postgresql://neondb_owner:npg_rwUDJBRkQn92@ep-aged-bird-a4o9f91s-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
    Environment: Production
    [Add]

14. RESEND_API_KEY
    Value: re_xxxxx... (already configured, but verify)
    Environment: Production
    [Update/Add if needed]

15. EMAIL_FROM
    Value: HotelSaver.ng <onboarding@resend.dev>
    Environment: Production
    [Add]
```

### 2.4 Verify All Added

- Count in the Vercel UI: should see **15 variables** for Production
- Check for any typos in names (must match exactly)

---

## Step 3: Redeploy Production (30 mins)

### 3.1 Manual Redeploy via Vercel CLI

```bash
# From your local machine
cd /Users/mac/Downloads/hotelsaver-ng-v9

# Pull the latest production env (to verify they're there)
vercel env pull --environment=production

# Redeploy
vercel --prod

# Output should show:
# ✓ Production Deployment
# ✓ Deployment URL: https://hotelsaver-prod.vercel.app
```

### 3.2 Verify via Vercel Dashboard

1. Go to Vercel → hotelsaver-ng-v9 → Deployments
2. You should see a NEW deployment (not the old one from Oct 25)
3. Click on it → wait for build to complete (1–2 mins)
4. Check build logs for any errors:
   - Look for: `Prisma Client generated` ✅
   - Look for: `Build completed` ✅
   - Look for: errors? ❌

---

## Step 4: Verify Production Connection (1 hour)

### 4.1 Check Deployment Logs

```bash
# Watch production logs in real-time
vercel logs https://hotelsaver-prod.vercel.app --follow

# You should see:
# GET / 200
# GET /api/auth/providers 200
# (no DB connection errors)
```

### 4.2 Test Magic Link Sign-In

1. Open production URL: `https://hotelsaver-prod.vercel.app`
2. Click **Sign In** → **Email**
3. Enter test email: `test@example.com`
4. Check your email for magic link (may take 10 seconds)
5. Click link → should sign you in ✅

**If magic link doesn't arrive:**
- Check Resend dashboard: does it show the email attempt?
- If not: RESEND_API_KEY is wrong
- If yes but no email: check spam folder or Resend delivery status

### 4.3 Test Negotiation API

```bash
# From terminal:
curl -X POST https://hotelsaver-prod.vercel.app/api/negotiate \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"h-001"}' 

# Expected response:
# { "status": "discount", "baseTotal": 150000, "discountedTotal": 127500, ... }

# If you get an error, check:
# 1. propertyId is valid (h-001 exists in lib.hotels.json)
# 2. NEGOTIATION_SECRET or NEXTAUTH_SECRET is set
# 3. Vercel logs show the request
```

### 4.4 Test Payment Page

1. Go to: `https://hotelsaver-prod.vercel.app/search`
2. Search for a hotel
3. Click on one → Details
4. Click "Book Now"
5. In URL, should include: `?propertyId=h-001&price=150000`
6. Fill payment form → should NOT error ✅

---

## Step 5: Troubleshooting

### ❌ **App Shows Blank Page**

**Causes:**
- NEXTAUTH_URL not set
- NEXTAUTH_SECRET not set
- Build failed

**Fix:**
```bash
# Check Vercel logs
vercel logs https://hotelsaver-prod.vercel.app

# Look for: "Error: FATAL: NEGOTIATION_SECRET or NEXTAUTH_SECRET required"
# If so: NEXTAUTH_SECRET is missing in production env

# Verify env vars are set
vercel env pull --environment=production
cat .env.production.local | grep NEXTAUTH
```

### ❌ **Magic Link Email Not Arriving**

**Causes:**
- RESEND_API_KEY wrong
- EMAIL_FROM not set
- Email ends up in spam

**Fix:**
```bash
# Check Resend API key
vercel env pull --environment=production
grep RESEND_API_KEY .env.production.local

# Verify in Resend dashboard:
# - Go to resend.com
# - Logs → check if email attempt appears
# - If not: API key is wrong
```

### ❌ **Negotiation API Returns 500 Error**

**Causes:**
- NEGOTIATION_SECRET or NEXTAUTH_SECRET not set
- Database can't connect
- Hotel data not loading

**Fix:**
```bash
# Check Vercel logs
vercel logs --follow

# Look for: "Error: FATAL: NEGOTIATION_SECRET..."
# Or: "Database connection failed"

# Verify DATABASE_URL
vercel env pull --environment=production
grep DATABASE_URL .env.production.local

# Test connection:
psql "your-connection-string-here"
```

### ❌ **Paystack Payment Fails**

**Causes:**
- PAYSTACK_SECRET_KEY wrong
- PAYSTACK_SECRET_KEY is test key, not live key

**Fix:**
```bash
# Verify keys are from LIVE, not TEST
vercel env pull --environment=production
grep PAYSTACK .env.production.local

# Should start with:
# PAYSTACK_SECRET_KEY=sk_live_xxxx (NOT sk_test_xxxx)
# PAYSTACK_PUBLIC_KEY=pk_live_xxxx (NOT pk_test_xxxx)
```

---

## Verification Checklist ✅

Before moving to next phase:

- [ ] All 15 env vars set in Vercel (Production environment)
- [ ] Redeploy successful (new deployment in Vercel dashboard)
- [ ] Production URL accessible: `https://hotelsaver-prod.vercel.app`
- [ ] Magic link email arrives within 10 seconds
- [ ] Negotiation API returns discount (curl test passes)
- [ ] Payment page loads without errors
- [ ] Vercel logs show no database connection errors
- [ ] Admin endpoints require ADMIN_API_KEY header

---

## Summary

| Variable | Source | Required | Status |
|----------|--------|----------|--------|
| NEXTAUTH_URL | Vercel domain | YES | ⏳ TODO |
| NEXTAUTH_SECRET | Generated | YES | ⏳ TODO |
| GOOGLE_CLIENT_ID | Google Console | YES | ⏳ TODO |
| GOOGLE_CLIENT_SECRET | Google Console | YES | ⏳ TODO |
| FACEBOOK_CLIENT_ID | Facebook App | NO (optional) | ⏳ TODO |
| FACEBOOK_CLIENT_SECRET | Facebook App | NO (optional) | ⏳ TODO |
| INSTAGRAM_CLIENT_ID | Meta/Facebook | NO (optional) | ⏳ TODO |
| INSTAGRAM_CLIENT_SECRET | Meta/Facebook | NO (optional) | ⏳ TODO |
| PAYSTACK_SECRET_KEY | Paystack Live | YES | ⏳ TODO |
| PAYSTACK_PUBLIC_KEY | Paystack Live | YES | ⏳ TODO |
| PAYSTACK_WEBHOOK_SECRET | Paystack Webhooks | YES | ⏳ TODO |
| ADMIN_API_KEY | Generated | YES | ⏳ TODO |
| DATABASE_URL | Neon | YES | ⏳ TODO |
| RESEND_API_KEY | Resend | YES | ✅ DONE |
| EMAIL_FROM | Resend | YES | ⏳ TODO |

**Total Required:** 15 variables  
**Already Configured:** 1 (RESEND_API_KEY)  
**To Add:** 14 variables

---

**Time Estimate:** 1–2 hours  
**Difficulty:** Medium (mostly copy-paste)  
**Risk:** Low (wrong values → clear error messages)

**Next:** After this is done, run the verification checklist and move to Testing phase.
