# Production env vars and email deliverability

This project now includes consent-gated GA4 analytics event tracking and transactional emails. Before launch, configure these environment variables and DNS records.

## Required environment variables

- NEXT_PUBLIC_BASE_URL: e.g. https://www.hotelsaver.ng
- NEXT_PUBLIC_GA_ID: GA4 Measurement ID (G-XXXXXXX)
- NEGOTIATION_SECRET: strong secret for signing negotiation offers
- RESEND_API_KEY: API key for Resend
- BOOKINGS_FROM: Verified sender address, e.g. bookings@hotelsaver.ng
- BOOKINGS_INBOX: Internal inbox address for admin notifications

Optional (existing):
- NEXTAUTH_SECRET or other app secrets as configured elsewhere

Configure these in Vercel → Project → Settings → Environment Variables. Re-deploy after setting.

## Resend domain verification (SPF/DKIM)

1) In Resend, add a Domain for hotelsaver.ng
2) Add the provided DNS records at your DNS host:
   - DKIM CNAMEs (2–3 records)
   - SPF TXT (include:amazonses.com or Resend-provided include)
   - DMARC TXT (recommended): v=DMARC1; p=none; rua=mailto:postmaster@hotelsaver.ng
3) Wait for verification, then set BOOKINGS_FROM to a sender at that domain (e.g., bookings@hotelsaver.ng)
4) Send test emails to Gmail/Outlook and confirm Inbox delivery

## GA4 consent and events

- The consent banner stores hs_ga_consent in localStorage
- Analytics events only fire when consent === 'granted' and GA is configured
- Implemented events:
  - search_submit: on Search form submit (desktop/mobile), parameters include city, dates, guests, budget, stayType
  - search_results: on Search results render, includes resultCount and filters
  - negotiate_request / negotiate_offer / negotiate_no_offer / negotiate_expired / negotiate_accept
  - booking_submit / booking_confirmed / booking_failed / booking_error

Verify events in GA Realtime after granting consent in the banner.

## Troubleshooting

- No events: ensure NEXT_PUBLIC_GA_ID is set and consent is granted
- Emails in spam: re-check SPF/DKIM, ensure From matches verified domain, add plain text content
- Missing env values: app may degrade gracefully but features (emails/analytics) will be limited
