# Migrations Guide

This guide explains how to manage Prisma migrations in development and production.

## Concepts
- `migrate dev` – Interactive; creates a new migration from your schema changes and applies it to the current DB. For local/dev only.
- `migrate deploy` – Non-interactive; applies already-committed migrations. For staging/production.

## Development Workflow
1) Edit `prisma/schema.prisma`
2) Create migration and apply locally
```
npx prisma migrate dev --name <meaningful-name>
```
3) Commit the new migration files
4) Optionally seed data
```
npm run db:seed
```

## Production Workflow
1) Ensure migrations are committed
2) Set DATABASE_URL to the production Postgres
3) Apply migrations (non-interactive)
```
export DATABASE_URL="postgres://USER:PASSWORD@POOL-HOST:5432/DB?sslmode=require"
npx prisma migrate deploy
```

## Rollbacks
- Prefer forwards-only migrations; if a migration is bad, create a new migration to correct it
- For emergencies in dev: `npm run db:reset` (drops and recreates dev DB, then seeds)

## Verification
- After `migrate deploy`, run `npm run db:smoke` to verify writes
- Use `npm run db:studio` to visually inspect tables and data

## CI/CD Notes
- Avoid running `migrate dev` in CI or serverless builds
- Run `migrate deploy` with `DATABASE_URL` injected via environment secrets
