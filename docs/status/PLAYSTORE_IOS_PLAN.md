# Play Store and iOS App Plan

This document outlines a pragmatic path to make HotelSaver.ng downloadable on Android (Play Store) and iOS (App Store), while preserving our fast web development cadence.

## Decision summary

- Android (now): Ship a Trusted Web Activity (TWA) backed by a solid PWA. Release to Internal/Closed testing first; move to Production after stabilizing.
- iOS (soon after): Wrap with Capacitor and submit via TestFlight → App Store. Keep it simple at first (WebView pointing to our domain); add native features later if needed.

Why this approach
- Minimal native code to maintain; updates ship from our website.
- We can start gathering real user feedback with testing tracks without risking public ratings.
- If we later need native APIs (push, background tasks), we can extend the Capacitor app.

---

## Phase 0 — Prerequisites (both platforms)

- Domain and HTTPS: final production domain (e.g., https://hotelsaver.ng) with valid SSL.
- Privacy Policy URL: required by Play Store and App Store.
- Brand assets:
  - App icon (1024×1024 source), with room for maskable variants
  - Feature graphic (Play Store): 1024×500
  - Screenshots: phone (1080×1920), optional tablets
- Contact email for stores (support@...)
- Basic monitoring: Google Analytics/GTM and optionally Sentry

Owner: PM/Design/Eng
ETA: 0.5 day

---

## Phase 1 — PWA enablement (required for TWA)

We’ll make the Next.js site installable and TWA-ready.

Deliverables
- public/manifest.json
- public/icons/* (192×192, 512×512, and maskable icons)
- Meta tags in `app/layout.tsx`
- Service worker (next-pwa or a small custom SW + register)

Baseline values
- name: HotelSaver.ng
- short_name: HotelSaver
- theme_color: #009739 (brand green)
- background_color: #ffffff
- display: standalone
- start_url: /

Example manifest.json (trimmed)
```json
{
  "name": "HotelSaver.ng",
  "short_name": "HotelSaver",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#009739",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Layout head tags (add to `app/layout.tsx`)
- `<link rel="manifest" href="/manifest.json" />`
- `<meta name="theme-color" content="#009739" />`
- Apple (PWA full-screen):
  - `<meta name="apple-mobile-web-app-capable" content="yes" />`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="default" />`
  - `<link rel="apple-touch-icon" href="/icons/icon-192.png" />`

Service worker
- Preferred: next-pwa with basic runtime caching for static assets and images.
- Alternative: simple `public/sw.js` and a one-time registration in a client component.

Quality gate
- Lighthouse PWA audit: Installable = PASS; Service worker = PASS.

Owner: Eng
ETA: 1–2 hours (plus icon generation)

---

## Phase 2 — Android via TWA (Play Store)

TWA renders our PWA in Chrome, full-screen. It requires PWA installability and a domain <-> app verification via Asset Links.

Tools: Bubblewrap (Google)

Steps
1) Generate TWA project
   - Use Bubblewrap to initialize from our live manifest:
     - `bubblewrap init --manifest=https://<YOUR_DOMAIN>/manifest.json`
   - Fill package id (e.g., com.hotelsaver.app), app name, icons, signing config.

2) Domain verification
   - Bubblewrap generates `assetlinks.json`.
   - Host it at `https://<YOUR_DOMAIN>/.well-known/assetlinks.json`.

3) Build AAB
   - `bubblewrap build`
   - Result: Android App Bundle (AAB) for upload.

4) Play Console setup
   - Create app record; set category, content rating, data safety, privacy policy URL.
   - Upload AAB to an Internal testing or Closed testing track.
   - Add tester emails / share opt-in link.

5) QA
   - Install via testing link; verify splash, full-screen, deep links, auth, payments, and back navigation.

6) Promote
   - After confidence, promote to Production with staged rollout (e.g., 10% → 50% → 100%).

Owner: Eng (Bubblewrap) + PM (listing) + Legal (policy)
ETA: 0.5–1 day

Notes
- Updates ship from the website—no app updates needed unless manifest/domain changes.
- For deep links, ensure Next.js routes handle the intended paths.

---

## Phase 3 — iOS via Capacitor (App Store)

We’ll publish a simple Capacitor shell that points the in-app WebView to our production domain. This is the most straightforward path for App Store approval.

Steps
1) Add Capacitor
   - `npm i @capacitor/core @capacitor/ios`
   - `npm i -D @capacitor/cli`
   - `npx cap init "HotelSaver" com.hotelsaver.app`

2) Configure `capacitor.config.ts`
```ts
import { CapacitorConfig } from '@capacitor/cli'
const config: CapacitorConfig = {
  appId: 'com.hotelsaver.app',
  appName: 'HotelSaver',
  webDir: 'dist', // not used when pointing to URL
  server: {
    url: 'https://<YOUR_DOMAIN>',
    cleartext: false
  }
}
export default config
```

3) Add iOS platform
   - `npx cap add ios`

4) Icons & splash
   - Provide iOS icon and splash sets (Xcode asset catalogs).

5) Universal Links (optional, recommended)
   - Host `apple-app-site-association` at `https://<YOUR_DOMAIN>/.well-known/` for deep links.

6) Build & sign
   - `npx cap open ios` → Xcode → set signing team, bundle id, version.
   - Distribute to TestFlight (Internal testing first), then App Store review.

Owner: Eng (Capacitor/Xcode) + PM (listing) + Legal (policy)
ETA: 1–2 days (mostly for Apple assets/signing)

Notes
- App Review considerations: ensure web content meets guidelines (payments, account deletion policy, etc.).
- If Apple flags it as a “wrapped website,” emphasize value: hotel booking flows, negotiation engine, city-specific services.

---

## Phase 4 — Monitoring and rollout

- Crash/issue triage (Sentry optional for JS errors; Play/App Store vitals)
- Analytics: funnel tracking (Search → Negotiate → Book)
- Support loop: in-app contact links (WhatsApp/email) and store reply policy
- Staged rollout to minimize risk

---

## Store listing checklist (Android and iOS)

- Title and short name consistent with brand
- Descriptions (short/full) localized if needed
- Screenshots (mobile-first), optional video
- Feature graphic (Play), app icon sets (both platforms)
- Category: Travel & Local / Lifestyle (confirm)
- Content rating questionnaire
- Data Safety (Play) and Privacy Nutrition Labels (iOS)
- Privacy Policy URL

---

## Risks and mitigations

- PWA readiness: Lighthouse PWA PASS is required → Fix manifest/SW early.
- Domain verification issues: double-check `.well-known/assetlinks.json` and caching.
- Auth/session boundaries: test login flows within TWA/Capacitor contexts.
- Payment flows: confirm Paystack/redirects work inside in-app browser contexts.
- Deep links and back navigation: test thoroughly.

---

## Rollback strategy

- Android: pause release / unpublish testing track; keep web live.
- iOS: remove TestFlight build from testing; reject submission; keep web live.

---

## Suggested timelines

- Phase 1 (PWA): 0.5–1 day
- Phase 2 (Android TWA → Internal testing): same day after PWA
- Phase 3 (iOS via Capacitor → TestFlight): 1–2 days
- Production go-live: after 1–2 weeks of testing feedback

---

## Owners

- Engineering: PWA setup, TWA packaging, Capacitor shell, QA
- Design: icons, screenshots, feature graphic
- PM/Founder: store listings, policies, rollout approvals
- Legal/Compliance: privacy policy and data disclosures

---

## Appendices

### A. Sample `assetlinks.json`
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.hotelsaver.app",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:...:ZZ"
      ]
    }
  }
]
```

### B. Sample `apple-app-site-association`
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.hotelsaver.app",
        "paths": ["*"]
      }
    ]
  }
}
```

### C. Quick commands (reference)

```bash
# PWA icons (suggestion):
npx pwa-asset-generator public/logo.png public/icons \
  -i public/manifest.json -m maskable

# Bubblewrap (TWA):
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://<YOUR_DOMAIN>/manifest.json
bubblewrap build

# Capacitor (iOS):
npm i @capacitor/core @capacitor/ios
npm i -D @capacitor/cli
npx cap init "HotelSaver" com.hotelsaver.app
npx cap add ios
npx cap open ios
```

---

If you share the production domain and logo, we can implement Phase 1 (PWA) immediately and start the Android Internal testing build the same day.
