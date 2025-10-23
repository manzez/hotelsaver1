# Database Guide (PostgreSQL + Prisma)

This folder centralizes everything you need to run the database in development and production:
- How to provision Postgres (Neon recommended)
- Environment variables
- Migrations (dev vs prod)
- Seeding and resetting
- Smoke tests and verification
- Operations (backups, pooling, roles)

Quick links:
- Provider setup (Neon): ../NEON_SETUP.md
- Payment setup (gateway + persistence): ../PAYMENT_SETUP.md
- Production checklist appendix: ../../PRODUCTION_READINESS.md
- Prisma schema: ../../prisma/schema.prisma

---

## Quickstart (Local)

1) Create .env and set DATABASE_URL
```
cp .env.example .env
# Edit .env to add your Postgres DATABASE_URL
```

2) Apply schema and inspect
```
npx prisma migrate dev --name init   # creates/updates local schema
npx prisma studio                    # open DB UI
```

3) Optional seed (hotels + images from JSON)
```
npm run db:seed
```

4) Toggle app reads to DB (optional)
- In .env set: `DATA_SOURCE=db`
- Default is `DATA_SOURCE=json` (safe)

---

## Production (Managed Postgres)

1) Provision a managed Postgres (Neon recommended)
- Use a pooled connection URL for serverless (see ../NEON_SETUP.md)

2) Set env vars on Vercel
- DATABASE_URL (pooled)
- PAYSTACK_SECRET_KEY
- Redeploy the app

3) Apply migrations to prod (non-interactive)
```
export DATABASE_URL="postgres://USER:PASSWORD@POOL-HOST:5432/DB?sslmode=require"
npx prisma migrate deploy
```

4) Smoke test (creates a PaymentIntent)
```
export DATABASE_URL="postgres://USER:PASSWORD@POOL-HOST:5432/DB?sslmode=require"
npm run db:smoke
```

5) Keep reads on JSON initially
- Use the DB for payments immediately (PaymentIntent)
- Migrate hotels/services to DB later with admin tools

---

## Commands Cheat Sheet

Apply migrations (dev):
```
npx prisma migrate dev --name <change>
```

Apply migrations (prod):
```
npx prisma migrate deploy
```

Open Prisma Studio:
```
npm run db:studio
```

Seed hotels from JSON:
```
npm run db:seed
```

Reset local DB and re-seed:
```
npm run db:reset
```

Smoke test DB connectivity:
```
npm run db:smoke
```

---

## Files & Scripts
- `../../prisma/schema.prisma` – All models (Hotel, PaymentIntent, etc.)
- `../../scripts/db-seed.js` – Seeds hotels and images from `lib.hotels.json`
- `../../scripts/db-smoke.js` – Writes a PaymentIntent row and verifies fetch

---

## Notes & Pitfalls
- Use pooled connection strings for serverless (Neon pooled host)
- Keep `sslmode=require` if the provider mandates SSL
- Prisma Client is generated on install via `postinstall`
- Use least-privilege roles for production and enable automated backups
