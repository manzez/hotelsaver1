# Proposed Folder Structure for HotelSaver.ng

## 🎯 Goals
- Separate concerns (business logic, UI, data, configuration)
- Make files easier to find
- Reduce root directory clutter
- Improve maintainability and scalability

---

## 📁 Recommended Structure

```
hotelsaver1/
├── app/                          # Next.js 14 App Router (KEEP AS IS)
│   ├── (auth)/                   # Auth route group
│   │   ├── auth/
│   │   └── hotel-portal/
│   ├── (main)/                   # Main public routes
│   │   ├── page.tsx              # Homepage
│   │   ├── search/
│   │   ├── hotel/[id]/
│   │   ├── negotiate/
│   │   ├── book/
│   │   ├── services/
│   │   ├── food/
│   │   └── ...
│   ├── admin/                    # Admin dashboard
│   ├── api/                      # API routes
│   └── ...
│
├── components/                   # React components (KEEP AS IS)
│   ├── ui/                       # NEW: Generic UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Input.tsx
│   ├── features/                 # NEW: Feature-specific components
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchFilters.tsx
│   │   │   └── ResultsSearchHeader.tsx
│   │   ├── hotel/
│   │   │   ├── HotelCard.tsx
│   │   │   ├── HotelCardSkeleton.tsx
│   │   │   └── SecurityBadge.tsx
│   │   ├── availability/
│   │   │   ├── AvailabilityStatus.tsx
│   │   │   └── BulkAvailabilityProvider.tsx
│   │   └── booking/
│   │       └── BookingForm.tsx
│   ├── layout/                   # NEW: Layout components
│   │   ├── CategoryTabs.tsx
│   │   ├── MobileToolbar.tsx
│   │   └── BackButton.tsx
│   └── shared/                   # NEW: Shared utilities
│       ├── SafeImage.tsx
│       ├── ClientDatepicker.tsx
│       └── InfoNotice.tsx
│
├── lib/                          # Business logic & utilities
│   ├── data/                     # NEW: Data files
│   │   ├── hotels.json           # ← Move lib.hotels.json here
│   │   ├── services.json         # ← Move lib.services.json here
│   │   ├── food.json             # ← Move lib.food.json here
│   │   ├── discounts.json        # ← Move lib.discounts.json here
│   │   └── backups/              # NEW: Backup files
│   │       ├── hotels/
│   │       ├── discounts/
│   │       └── apartments/
│   ├── services/                 # NEW: Business logic services
│   │   ├── hotels-source.ts      # ← Keep
│   │   ├── room-based-pricing.ts # ← Keep
│   │   ├── discounts.ts          # ← Keep
│   │   ├── reviews.ts            # ← Keep (if exists)
│   │   └── booking.ts            # NEW: Booking logic
│   ├── utils/                    # NEW: Utility functions
│   │   ├── price-formatting.ts
│   │   ├── date-helpers.ts
│   │   └── validation.ts
│   ├── types/                    # NEW: TypeScript types
│   │   ├── hotel.ts
│   │   ├── service.ts
│   │   ├── booking.ts
│   │   └── search.ts
│   └── cache/                    # NEW: Cache management
│       └── hotel-cache.ts
│
├── public/                       # Static assets (KEEP AS IS)
│   ├── images/
│   ├── icons/
│   └── ...
│
├── docs/                         # NEW: All documentation
│   ├── architecture/
│   │   ├── PRICING_SYSTEM.md
│   │   ├── ROOM_BASED_PRICING.md
│   │   └── DISCOUNT_SYSTEM.md
│   ├── guides/
│   │   ├── ADMIN_PORTAL_GUIDE.md
│   │   ├── DATABASE_SETUP.md
│   │   ├── AUTH_SETUP.md
│   │   ├── DEPLOYMENT.md
│   │   └── ENV_SETUP.md
│   ├── api/
│   │   ├── API_DOCUMENTATION.md
│   │   └── OPENAPI_SPEC.md
│   ├── training/
│   │   ├── AI_TRAINING_GUIDE.md
│   │   ├── GRACE_TRAINING.md
│   │   └── GPT4_CHATBOT_SETUP.md
│   ├── status/
│   │   ├── CURRENT_STATUS.md
│   │   ├── EXECUTIVE_SUMMARY.md
│   │   └── LAUNCH_ACTION_PLAN.md
│   └── changelogs/
│       ├── BASE_PRICE_REMOVAL.md
│       ├── ROOM_PRICING_FIX.md
│       └── DATEPICKER_IMPROVEMENTS.md
│
├── scripts/                      # NEW: Utility scripts
│   ├── debug/
│   │   ├── debug-availability.js
│   │   ├── debug-hotels.js
│   │   ├── debug-negotiate.js
│   │   └── debug-id-mismatch.js
│   ├── fixes/
│   │   ├── fix-discount-ids.js
│   │   ├── apply-permanent-fix.js
│   │   └── clear-availability.js
│   ├── import/
│   │   └── download-apartments.bat
│   └── maintenance/
│       └── clear-cache.js
│
├── tests/                        # NEW: Test files
│   ├── e2e/
│   │   └── features/
│   ├── integration/
│   └── unit/
│
├── config/                       # NEW: Configuration files
│   ├── sentry.config.js          # ← Move from root
│   ├── cucumber.config.js        # ← Move from root
│   ├── ecosystem.config.js       # ← Move from root (PM2)
│   └── instrumentation.ts        # ← Move from root
│
├── .github/                      # GitHub specific (KEEP AS IS)
│   ├── copilot-instructions.md
│   └── workflows/
│
├── styles/                       # Global styles (if needed)
│   └── globals.css               # ← Move from app/
│
├── .env.local                    # Environment variables (KEEP)
├── .env                          # Environment variables (KEEP)
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md

```

---

## 🔄 Migration Steps

### Phase 1: Move Documentation (Low Risk)
```bash
# Create docs structure
mkdir docs docs/architecture docs/guides docs/api docs/training docs/status docs/changelogs

# Move architecture docs
move ADMIN_PRICING_EXPLANATION.md docs/architecture/PRICING_SYSTEM.md
move BASE_PRICE_REMOVAL_COMPLETE.md docs/changelogs/
move ROOM_PRICING_FIX_SUMMARY.md docs/changelogs/

# Move guides
move ADMIN_PORTAL_COMPLETE_GUIDE.md docs/guides/
move AUTH_SETUP_GUIDE.md docs/guides/
move DATABASE_SETUP_GUIDE.md docs/guides/
move DEPLOY_ENV_AND_EMAIL.md docs/guides/DEPLOYMENT.md
move ENV_SETUP_GUIDE.md docs/guides/
move DOCKER_INSTALLATION_GUIDE.md docs/guides/
move HOTEL_PHOTOS_GUIDE.md docs/guides/

# Move API docs
move API_DOCUMENTATION.md docs/api/
move API_DOCUMENTATION_SUMMARY.md docs/api/

# Move training docs
move AI_TRAINING_GUIDE.md docs/training/
move AI_BOT_TRAINING_COMPLETE.md docs/training/
move GRACE_TRAINING_COMPLETE.md docs/training/
move GRACE_CUSTOMER_FOCUSED_COMPLETE.md docs/training/
move GPT4_CHATBOT_SETUP.md docs/training/

# Move status docs
move CURRENT_STATUS_NOV3_2025.md docs/status/
move EXECUTIVE_SUMMARY_OCT2025.md docs/status/
move LAUNCH_ACTION_PLAN.md docs/status/

# Move other docs
move DATEPICKER_IMPROVEMENTS_COMPLETED.md docs/changelogs/
move DATEPICKER_STABILITY_GUIDE.md docs/guides/
move AUTHENTICATION_COMPLETED.md docs/changelogs/
move CICD-IMPLEMENTATION-SUMMARY.md docs/guides/
move CI-CD-SETUP.md docs/guides/
move HYBRID_SYSTEM_EXAMPLE.md docs/architecture/
```

### Phase 2: Move Scripts (Low Risk)
```bash
# Create scripts structure
mkdir scripts scripts/debug scripts/fixes scripts/import scripts/maintenance

# Move debug scripts
move debug-*.js scripts/debug/

# Move fix scripts
move fix-discount-ids.js scripts/fixes/
move apply-permanent-fix.js scripts/fixes/
move clear-availability.js scripts/maintenance/

# Move import scripts
move download-apartments.bat scripts/import/
```

### Phase 3: Move Data Files (MEDIUM RISK - Test After)
```bash
# Create data structure
mkdir lib/data lib/data/backups lib/data/backups/hotels lib/data/backups/discounts lib/data/backups/apartments

# Move main data files
move lib.hotels.json lib/data/hotels.json
move lib.services.json lib/data/services.json
move lib.food.json lib/data/food.json
move lib.discounts.json lib/data/discounts.json

# Move backup files
move lib.hotels.backup.*.json lib/data/backups/hotels/
move lib.discounts.backup.*.json lib/data/backups/discounts/
move apartments-*.json lib/data/backups/apartments/
move hotel-import-report.txt lib/data/backups/hotels/
```

**⚠️ IMPORTANT: Update import paths in code:**
```typescript
// OLD
import HOTELS from '@/lib.hotels.json'
import SERVICES from '@/lib.services.json'
import FOOD from '@/lib.food.json'

// NEW
import HOTELS from '@/lib/data/hotels.json'
import SERVICES from '@/lib/data/services.json'
import FOOD from '@/lib/data/food.json'
```

### Phase 4: Move Config Files (MEDIUM RISK)
```bash
# Create config directory
mkdir config

# Move config files
move cucumber.config.js config/
move ecosystem.config.js config/
move instrumentation.ts config/

# Update references in package.json and other files
```

### Phase 5: Reorganize Components (OPTIONAL - High Effort)
This is more involved and optional. You can do this gradually:
```bash
# Create component subdirectories
mkdir components/ui components/features components/features/search components/features/hotel components/features/availability components/features/booking components/layout components/shared

# Move search-related components
move components/SearchBar.tsx components/features/search/
move components/SearchFilters.tsx components/features/search/
move components/ResultsSearchHeader.tsx components/features/search/
move components/SortControl.tsx components/features/search/

# Move hotel-related components
move components/HotelCard*.tsx components/features/hotel/
move components/SecurityBadge.tsx components/features/hotel/

# Move availability components
move components/AvailabilityStatus.tsx components/features/availability/
move components/BulkAvailabilityProvider.tsx components/features/availability/

# Move layout components
move components/CategoryTabs.tsx components/layout/
move components/MobileToolbar.tsx components/layout/
move components/BackButton.tsx components/layout/

# Move shared utilities
move components/SafeImage.tsx components/shared/
move components/ClientDatepicker.tsx components/shared/
move components/InfoNotice.tsx components/shared/
```

---

## 🎯 Immediate Priorities (Do First)

### 1. **Documentation Organization** ✅ LOW RISK
- Move all `.md` files to `docs/` subdirectories
- Clean up root directory immediately
- **Benefit:** Much cleaner root, easier to find docs
- **Risk:** None (no code changes)

### 2. **Scripts Organization** ✅ LOW RISK
- Move all `.js` debug/fix scripts to `scripts/`
- **Benefit:** Cleaner root, better organization
- **Risk:** None (scripts are standalone)

### 3. **Data Files Organization** ⚠️ MEDIUM RISK
- Move `lib.*.json` files to `lib/data/`
- Move backup files to `lib/data/backups/`
- Update import paths in code
- **Benefit:** Cleaner lib folder, organized backups
- **Risk:** Must update all imports, test thoroughly

### 4. **Config Files** ⚠️ MEDIUM RISK
- Move config files to `config/` directory
- Update references
- **Benefit:** Cleaner root
- **Risk:** May break build scripts, PM2, testing

---

## 📊 Benefits of This Structure

### Root Directory (Before vs After)
**Before:** 100+ files in root (mix of code, docs, configs, scripts, backups)  
**After:** ~15 essential files (package.json, config files, README)

### Developer Experience
1. **Find docs easily:** `docs/guides/`, `docs/api/`, etc.
2. **Find business logic:** `lib/services/`
3. **Find data:** `lib/data/`
4. **Find scripts:** `scripts/debug/`, `scripts/fixes/`
5. **Find components by feature:** `components/features/search/`

### Maintainability
- Related files grouped together
- Clear separation of concerns
- Easier onboarding for new developers
- Better for IDE navigation and search

### Scalability
- Room to grow each section independently
- Easy to add new features without clutter
- Clear conventions for where things go

---

## 🚀 Quick Start: 30-Minute Cleanup

If you only have 30 minutes, do this:

```bash
# 1. Create directories (1 min)
mkdir docs docs/guides docs/api docs/training docs/status docs/changelogs docs/architecture
mkdir scripts scripts/debug scripts/fixes scripts/maintenance

# 2. Move docs (5 min)
move *_GUIDE.md docs/guides/
move *_DOCUMENTATION.md docs/api/
move *_TRAINING*.md docs/training/
move *_STATUS*.md docs/status/
move *_SUMMARY*.md docs/status/
move *_COMPLETE*.md docs/changelogs/

# 3. Move scripts (2 min)
move debug-*.js scripts/debug/
move fix-*.js scripts/fixes/
move clear-availability.js scripts/maintenance/
move apply-permanent-fix.js scripts/fixes/

# 4. Move old backups (2 min)
mkdir lib/data/backups/hotels lib/data/backups/discounts
move lib.hotels.backup.*.json lib/data/backups/hotels/
move lib.discounts.backup.*.json lib/data/backups/discounts/
move apartments-backup-*.json lib/data/backups/

# 5. Update README (5 min)
# Document the new structure in README.md
```

**Result:** Root directory goes from 100+ files to ~20-30 files, much cleaner!

---

## ⚠️ Important Notes

### Don't Break Production
1. **Test locally** after each phase
2. **Run build** to ensure nothing broke: `npm run build`
3. **Test key flows:** Search → Negotiate → Book
4. **Update CI/CD** paths if needed

### Git Best Practices
```bash
# Use git mv to preserve history
git mv lib.hotels.json lib/data/hotels.json

# Commit each phase separately
git add docs/
git commit -m "docs: reorganize documentation into docs/ directory"

git add scripts/
git commit -m "chore: move utility scripts to scripts/ directory"
```

### Update Documentation
After moving files, update:
- README.md with new structure
- .github/copilot-instructions.md with new paths
- Any deployment scripts or CI/CD configs

---

## 🎓 Long-Term Improvements

### Extract Common Utilities
```typescript
// lib/utils/price-formatting.ts
export function formatNGN(amount: number): string {
  return `₦${amount.toLocaleString()}`
}

// lib/utils/date-helpers.ts
export function nightsBetween(checkIn: string, checkOut: string): number {
  // Move logic from page.tsx
}
```

### Create Type Definitions
```typescript
// lib/types/hotel.ts
export interface Hotel {
  id: string
  name: string
  city: string
  basePriceNGN: number
  roomTypes?: RoomType[]
  // ...
}

// lib/types/search.ts
export interface SearchCriteria {
  adults: number
  children: number
  rooms: number
  budgetMin: number
  budgetMax: number
}
```

### Feature-Based Components
```
components/features/search/
  ├── SearchBar.tsx
  ├── SearchFilters.tsx
  ├── ResultsHeader.tsx
  └── index.ts  // Export all

// Usage
import { SearchBar, SearchFilters } from '@/components/features/search'
```

---

## 📞 Need Help?

If you run into issues during migration:
1. Check build output: `npm run build`
2. Review TypeScript errors: `npx tsc --noEmit`
3. Test critical paths manually
4. Rollback if needed: `git checkout -- .`

---

**Recommendation:** Start with Phase 1 (Documentation) today - it's the safest and gives the biggest immediate benefit with zero risk.
