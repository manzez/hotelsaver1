#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATE="$(date +%Y%m%d-%H%M%S)"
OUT_BASE="$ROOT_DIR/design-pack/output"
OUT_DIR="$OUT_BASE/mobile-design-pack-$DATE"

mkdir -p "$OUT_DIR"

# Use rsync include/exclude to copy only design-relevant files preserving structure
rsync -av --prune-empty-dirs \
  --include='/**/' \
  --exclude='app/api/**' \
  --include='app/**/page.tsx' \
  --include='app/**/layout.tsx' \
  --include='app/**/loading.tsx' \
  --include='app/**/error.tsx' \
  --include='app/globals.css' \
  --include='components/**' \
  --include='components/datepicker.css' \
  --include='public/**' \
  --include='tailwind.config.js' \
  --include='postcss.config.js' \
  --include='next.config.js' \
  --include='.github/copilot-instructions.md' \
  --include='docs/ARCHITECTURE.md' \
  --include='docs/README.md' \
  --include='PRODUCTION_READINESS.md' \
  --include='app/react-tailwindcss-datepicker.d.ts' \
  --include='lib/data.ts' \
  --include='lib/discounts.ts' \
  --include='lib/location-pricing.ts' \
  --include='lib.hotels.json' \
  --include='lib.services.json' \
  --include='package.json' \
  --include='tsconfig.json' \
  --include='.env.example' \
  --exclude='*' \
  "$ROOT_DIR/" "$OUT_DIR/"

# Copy the brief and pack README into the output root for convenience
mkdir -p "$OUT_DIR/design-pack"
cp "$ROOT_DIR/design-pack/BRIEF.md" "$OUT_DIR/BRIEF.md"
cp "$ROOT_DIR/design-pack/README.md" "$OUT_DIR/PACK_README.md"

# Create a zip archive alongside the folder
( cd "$OUT_BASE" && zip -qr "mobile-design-pack-$DATE.zip" "mobile-design-pack-$DATE" )

echo "Design pack created:"
echo " - Folder: $OUT_DIR"
echo " - Zip:    $OUT_BASE/mobile-design-pack-$DATE.zip"
