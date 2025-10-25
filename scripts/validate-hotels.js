#!/usr/bin/env node
/**
 * Validate lib.hotels.json for required fields and data quality.
 * - Ensures unique ids
 * - Validates city enum (Lagos, Abuja, Port Harcourt, Owerri)
 * - Validates type enum (Hotel | Apartment)
 * - basePriceNGN is an integer > 0 (or legacy price > 0)
 * - stars is integer 1..5
 * - images is array with >= 3 valid http(s) URLs
 * - Warn on missing contact fields (email/phone/website) but don't fail
 */

const fs = require('fs');
const path = require('path');

const HOTELS_PATH = path.resolve(__dirname, '..', 'lib.hotels.json');

const ALLOWED_CITIES = new Set(['Lagos', 'Abuja', 'Port Harcourt', 'Owerri']);
const ALLOWED_TYPES = new Set(['Hotel', 'Apartment']);

function isHttpUrl(x) {
  return typeof x === 'string' && /^(https?:)\/\//i.test(x);
}

function isInt(n) {
  return Number.isInteger(n);
}

function fail(msg) {
  console.error('❌', msg);
}

function warn(msg) {
  console.warn('⚠️', msg);
}

function ok(msg) {
  console.log('✅', msg);
}

function main() {
  if (!fs.existsSync(HOTELS_PATH)) {
    fail(`Hotels file not found at ${HOTELS_PATH}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(HOTELS_PATH, 'utf8');
  let list;
  try {
    list = JSON.parse(raw);
  } catch (e) {
    fail('Invalid JSON in lib.hotels.json');
    console.error(e.message);
    process.exit(1);
  }
  if (!Array.isArray(list)) {
    fail('lib.hotels.json must be an array');
    process.exit(1);
  }

  let errors = 0;
  const ids = new Set();
  const cityCounts = new Map();
  const imgIssues = [];

  list.forEach((h, idx) => {
    const ctx = `#${idx + 1} (${h && h.id ? h.id : 'no-id'})`;

    if (!h || typeof h !== 'object') {
      fail(`${ctx}: Not an object`);
      errors++;
      return;
    }

    // id
    if (!h.id || typeof h.id !== 'string') {
      fail(`${ctx}: Missing or invalid id`);
      errors++;
    } else if (ids.has(h.id)) {
      fail(`${ctx}: Duplicate id '${h.id}'`);
      errors++;
    } else {
      ids.add(h.id);
    }

    // name
    if (!h.name || typeof h.name !== 'string') {
      fail(`${ctx}: Missing or invalid name`);
      errors++;
    }

    // city
    if (!h.city || typeof h.city !== 'string' || !ALLOWED_CITIES.has(h.city)) {
      fail(`${ctx}: Invalid city '${h.city}'. Allowed: ${Array.from(ALLOWED_CITIES).join(', ')}`);
      errors++;
    } else {
      cityCounts.set(h.city, (cityCounts.get(h.city) || 0) + 1);
    }

    // type
    if (!h.type || !ALLOWED_TYPES.has(h.type)) {
      fail(`${ctx}: Invalid type '${h.type}'. Allowed: ${Array.from(ALLOWED_TYPES).join(' | ')}`);
      errors++;
    }

    // price
    const base = typeof h.basePriceNGN === 'number' ? h.basePriceNGN : (typeof h.price === 'number' ? h.price : 0);
    if (!isInt(base) || base <= 0) {
      fail(`${ctx}: Missing/invalid basePriceNGN (or legacy price). Got '${base}'`);
      errors++;
    }

    // stars
    if (!isInt(h.stars) || h.stars < 1 || h.stars > 5) {
      fail(`${ctx}: Invalid stars '${h.stars}' (must be 1..5)`);
      errors++;
    }

    // images
    if (!Array.isArray(h.images) || h.images.length < 3) {
      fail(`${ctx}: images must be an array with at least 3 items`);
      errors++;
    } else {
      const bad = h.images.filter((u) => !isHttpUrl(u));
      if (bad.length) {
        fail(`${ctx}: images contain non-URL entries (${bad.length})`);
        errors++;
      }
      // Track potential issues for audit
      const dupSet = new Set(h.images);
      if (dupSet.size !== h.images.length) {
        imgIssues.push(`${ctx}: duplicate image URLs`);
      }
    }

    // soft warnings
    if (!h.email && !h.phone && !h.website) {
      warn(`${ctx}: No contact info (email/phone/website)`);
    }
  });

  console.log('\nSummary:');
  ok(`Total hotels: ${list.length}`);
  console.log('City counts:', Object.fromEntries(cityCounts));
  if (imgIssues.length) {
    console.log('\nImage warnings:');
    imgIssues.slice(0, 10).forEach((m) => warn(m));
    if (imgIssues.length > 10) console.log(`... and ${imgIssues.length - 10} more`);
  }

  if (errors > 0) {
    fail(`Validation failed with ${errors} error(s).`);
    process.exit(1);
  } else {
    ok('Validation passed.');
  }
}

main();
