# Monitoring setup (Sentry + optional Logtail)

This app ships with lightweight Sentry wiring for both client and server.

## Environment variables

Set these in Vercel → Project → Settings → Environment Variables:

- SENTRY_DSN: Your Sentry Project DSN (Server + Browser OK)
- (Optional) NEXT_PUBLIC_SENTRY_DSN: Only if you prefer a public DSN value

## What’s already wired

- sentry.client.config.ts: Initializes Sentry on the client when a DSN is present.
- sentry.server.config.ts: Initializes Sentry on the server when a DSN is present.
- app/global-error.tsx: Captures exceptions in the global error boundary with helpful context (digest, path).
- next.config.js: Wrapped with withSentryConfig for source maps and instrumentation (no-op when DSN missing).

## Verify it works

1. Deploy to a preview with SENTRY_DSN set.
2. Visit any page and trigger a client error (e.g., add `throw new Error('test')` in a client component temporarily).
3. Open Sentry → Project → Issues: you should see the error with the `boundary=global-error` tag when thrown via the global boundary.

## Optional: Logtail / Better Stack logs

We did not bundle an extra client SDK to keep payloads lean. If you want Logtail:

- Add a small API route to forward error JSON to `in.logtail.com` using your server-side `LOGTAIL_TOKEN`.
- From the client, POST error payloads to that API instead of sending the token to the browser.

For launch, Vercel Logs plus Sentry errors are sufficient. Add Logtail later if you want structured logs or long retention.
