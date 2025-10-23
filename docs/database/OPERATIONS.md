# Operations (Production)

Operational guidance for running Postgres in production.

## Backups
- Enable daily automated backups in your provider (Neon, Supabase, RDS)
- Verify restore procedures quarterly

## Access & Roles
- Use least-privilege DB users for app connections
- Separate admin users for migrations/maintenance

## Connection Management
- Use a **pooled** connection string in serverless environments
- Keep `sslmode=require` when mandated
- Ensure Prisma Client is a singleton per lambda (lib/prisma.ts pattern)

## Monitoring
- Track error rates and connection saturation
- Watch latency for `/api/paystack/*` routes
- Consider Sentry (errors) and Vercel Analytics (performance)

## Incident Playbook
- If DB is unreachable: fail gracefully and fall back to JSON reads
- If connection limits hit: switch to pooled URL or add PgBouncer
- If migrations fail: stop deploy, fix locally, commit, re-run `migrate deploy`

## Data Lifecycle
- PaymentIntent rows: retain for audit
- PII: store only what’s required; purge on request to comply with NDPR/GDPR
