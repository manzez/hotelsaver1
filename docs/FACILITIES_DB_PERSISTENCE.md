# Facilities DB Persistence (Optional)

This document outlines a non-breaking path to persist per-hotel facilities in Postgres via Prisma, while keeping the current JSON-based overrides as the default. You can enable the DB path behind an environment flag when ready.

## Prisma models

Add the following models to `prisma/schema.prisma`:

```prisma
model HotelFacility {
  id        String   @id @default(cuid())
  hotelId   String
  key       String   // FacilityKey
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([hotelId, key])
}

// Optional grouping snapshot (not required for MVP)
model HotelFacilityGroupSnapshot {
  id        String   @id @default(cuid())
  hotelId   String
  payload   Json     // arbitrary metadata
  createdAt DateTime @default(now())
}
```

Then run:

```bash
npx prisma migrate dev -n facilities
```

## Toggleable data source

Introduce an env guard:

```bash
DATA_SOURCE=files   # default
# DATA_SOURCE=prisma # enable DB when ready
```

In `app/api/admin/hotels/facilities/route.ts`, add a branch:

```ts
const USE_DB = process.env.DATA_SOURCE === 'prisma'

if (USE_DB) {
  // Read path: query HotelFacility rows by hotelId, map to FacilityKey[]
  // Write path: upsert/delete to exactly match provided array
} else {
  // Current JSON read/write remains unchanged
}
```

### Read (DB)

```ts
const rows = await prisma.hotelFacility.findMany({ where: { hotelId } })
const facilities = rows.map(r => r.key as FacilityKey)
```

### Write (DB)

```ts
// Compute diff
const current = new Set(rows.map(r => r.key))
const next = new Set(cleaned)

const toDelete = [...current].filter(k => !next.has(k))
const toInsert = [...next].filter(k => !current.has(k))

await prisma.$transaction([
  prisma.hotelFacility.deleteMany({ where: { hotelId, key: { in: toDelete } } }),
  ...toInsert.map(k => prisma.hotelFacility.create({ data: { hotelId, key: k } }))
])
```

## Backfill

If you want to migrate current JSON overrides into DB:

```ts
// scripts/backfill-facilities.ts
// - Reads lib/facilities-overrides.json
// - For each hotelId, upserts each key into HotelFacility
```

## Rollback plan

- Keep JSON path intact until DB is proven in staging.
- Add feature flag per environment.
- If DB errors occur, fall back to JSON reads (read-only) for continuity.

## Notes

- Facilities are per-hotel and low cardinality; a simple table works well.
- Keep validation with FACILITY_CATALOG at the API layer for safety.
- Consider auditing changes by writing a HotelFacilityGroupSnapshot row on each save if compliance is required.
