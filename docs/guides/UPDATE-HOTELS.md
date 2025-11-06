# Updating Hotel Records & Prices

There are two supported ways to update hotels:

1) Quick manual edit (small changes)
- Edit `lib.hotels.json` directly.
- Keep fields intact: `id`, `name`, `city`, `basePriceNGN`, `stars`, `type`, `images`.
- If both `basePriceNGN` and a legacy `price` exist, keep them in sync.

2) Bulk price updates (recommended)
- Prepare a CSV with headers: `id,basePriceNGN`.
- Use the provided script:

```bash
npm run update:prices scripts/price-updates.sample.csv
```

Notes
- Prices must be integers in NGN (no commas or ₦ symbol).
- The script makes a timestamped backup in `backups/` before writing.
- IDs must match `lib.hotels.json` exactly. Missing IDs are reported.

After updates
- Re-run the app/build:

```bash
npm run build
```

- Verify negotiate discounts still behave correctly for updated properties.
