#!/usr/bin/env node
/**
 * Bulk-update hotel prices in lib.hotels.json from a CSV file.
 *
 * Usage:
 *   node scripts/update-prices.js path/to/price-updates.csv
 *
 * CSV format (with header):
 *   id,basePriceNGN
 *   transcorp-hilton-abuja-abuja,180000
 *   hotel-presidential-port-harcourt-port-harcourt,145000
 *
 * Notes:
 * - Prices are expected as integers in Nigerian Naira (no commas, no ₦ symbol)
 * - The script updates basePriceNGN. If a legacy "price" field exists and is numeric, it will be synced too.
 * - A timestamped backup of lib.hotels.json is written in backups/ before modifications.
 */

const fs = require('fs');
const path = require('path');

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const header = lines[0].replace(/^\uFEFF/, '').trim(); // remove BOM if present
  const cols = header.split(',').map((s) => s.trim());
  const idIdx = cols.indexOf('id');
  const priceIdx = cols.indexOf('basePriceNGN');
  if (idIdx === -1 || priceIdx === -1) {
    throw new Error('CSV must have headers: id,basePriceNGN');
  }
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length < 2) continue;
    const id = (parts[idIdx] || '').trim();
    const priceStr = (parts[priceIdx] || '').trim();
    if (!id) continue;
    const price = Number(priceStr);
    if (!Number.isFinite(price) || price <= 0) {
      console.warn(`Skipping row ${i + 1}: invalid price "${priceStr}" for id "${id}"`);
      continue;
    }
    rows.push({ id, basePriceNGN: Math.round(price) });
  }
  return rows;
}

function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: node scripts/update-prices.js path/to/price-updates.csv');
    process.exit(1);
  }
  const projectRoot = path.resolve(__dirname, '..');
  const hotelsJsonPath = path.join(projectRoot, 'lib.hotels.json');
  if (!fs.existsSync(hotelsJsonPath)) {
    console.error(`Could not find lib.hotels.json at ${hotelsJsonPath}`);
    process.exit(1);
  }

  const updates = readCsv(path.resolve(csvPath));
  if (updates.length === 0) {
    console.error('No valid rows found in CSV. Nothing to update.');
    process.exit(1);
  }

  const hotels = JSON.parse(fs.readFileSync(hotelsJsonPath, 'utf8'));
  const byId = new Map(updates.map((u) => [u.id, u.basePriceNGN]));

  // Backup
  const backupsDir = path.join(projectRoot, 'backups');
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupsDir, `lib.hotels.json.backup.${ts}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(hotels, null, 2));

  let updated = 0;
  let missing = 0;
  for (const h of hotels) {
    const newPrice = byId.get(h.id);
    if (typeof newPrice === 'number') {
      h.basePriceNGN = newPrice;
      if (typeof h.price === 'number') h.price = newPrice; // keep legacy field in sync if present
      updated++;
    }
  }

  // Report any IDs in CSV not found in hotels
  for (const [id] of byId.entries()) {
    if (!hotels.some((h) => h.id === id)) {
      console.warn(`ID not found in lib.hotels.json: ${id}`);
      missing++;
    }
  }

  fs.writeFileSync(hotelsJsonPath, JSON.stringify(hotels, null, 2));
  console.log(`\nPrice update complete.`);
  console.log(`Updated: ${updated}`);
  console.log(`Missing IDs: ${missing}`);
  console.log(`Backup written: ${backupPath}`);
}

main();
