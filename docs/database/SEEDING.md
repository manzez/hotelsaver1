# Seeding Guide

Seed your database with hotels and images from the repository JSON.

## What the seed does
- Reads `lib.hotels.json`
- Maps `city` strings to Prisma enum `City`
- Computes `shelfPriceNGN` from `basePriceNGN` (or `price` fallback)
- Creates `Hotel` rows with `slug` derived from existing JSON `id` when possible
- Creates up to 6 `HotelImage` rows per hotel

## Run the seed
Make sure your DATABASE_URL points to the target DB and schema is applied.

```
# Apply schema
npx prisma migrate deploy

# Seed
npm run db:seed
```

You should see output like:
```
Seed complete. Created: 240, Skipped (existing): 18
```

## Reset and re-seed (dev only)
```
npm run db:reset
```

## Pitfalls
- Cities must map to one of: Lagos, Abuja, PortHarcourt, Owerri
- Ensure base price is a number; hotels without price will be skipped
- Keep JSON `id` stable so URLs like `/hotel/{id}` remain compatible
