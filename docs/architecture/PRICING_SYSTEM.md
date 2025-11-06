# Admin Panel Pricing Structure Explained

## Where Prices Come From in the Admin Panel

The admin panel (`app/admin/hotels/[id]/page.tsx`) displays and allows editing of **BOTH** the hotel's base price AND individual room type prices.

---

## Two-Level Pricing System

### 1️⃣ **Hotel Base Price** (Line 568)
```tsx
<label className="block text-sm font-medium text-gray-700 mb-2">
  Base Price (₦) *
</label>
<input
  type="number"
  value={formData.basePriceNGN}  // ← Hotel's base price
  onChange={(e) => handleInputChange('basePriceNGN', Number(e.target.value))}
/>
```

**Location in Data:** `hotel.basePriceNGN`  
**Purpose:** Fallback price when no room types are defined  
**Used For:**
- Hotels without room type data
- Backwards compatibility
- Quick price reference
- Discount calculations in the form

---

### 2️⃣ **Room Type Prices** (Line 800-815)
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h2>Room Types & Pricing</h2>
  
  {formData?.roomTypes?.map((roomType, index) => (
    <div>
      <h3>{roomType.name}</h3>
      
      <input
        type="number"
        value={roomType.basePriceNGN}  // ← Individual room price
        onChange={(e) => {
          const updatedRoomTypes = [...(formData.roomTypes || [])]
          updatedRoomTypes[index].basePriceNGN = Number(e.target.value)
          handleInputChange('roomTypes', updatedRoomTypes)
        }}
      />
      
      <input
        type="number"
        value={roomType.discountPercent}  // ← Room-specific discount
        onChange={...}
      />
    </div>
  ))}
</div>
```

**Location in Data:** `hotel.roomTypes[].basePriceNGN`  
**Purpose:** Individual pricing per room category  
**Used For:**
- Standard Room: ₦92,000
- Deluxe Room: ₦119,600
- Executive Room: ₦147,200
- Presidential Suite: ₦230,000

---

## Data Structure in JSON

```json
{
  "id": "protea-hotel-owerri-owerri",
  "name": "Protea Hotel Owerri",
  "basePriceNGN": 92000,  // ← HOTEL BASE PRICE (fallback)
  
  "roomTypes": [
    {
      "id": "standard",
      "name": "Standard Room",
      "basePriceNGN": 92000,      // ← ROOM-SPECIFIC PRICE
      "discountPercent": 15,       // ← ROOM-SPECIFIC DISCOUNT
      "maxOccupancy": 2
    },
    {
      "id": "deluxe",
      "name": "Deluxe Room",
      "basePriceNGN": 119600,     // ← ROOM-SPECIFIC PRICE
      "discountPercent": 12,
      "maxOccupancy": 2
    },
    {
      "id": "executive",
      "name": "Executive Room",
      "basePriceNGN": 147200,     // ← ROOM-SPECIFIC PRICE
      "discountPercent": 10,
      "maxOccupancy": 2
    }
  ]
}
```

---

## How Search Uses These Prices

### **NEW BEHAVIOR (After Fix):**

1. **Search loads hotel** → Gets `hotel.basePriceNGN` (₦92,000)
2. **Room pricing system runs** → Checks `hotel.roomTypes[]`
3. **Finds suitable rooms:**
   - Standard: ₦92,000 ✅ (in budget ₦80k-₦130k)
   - Deluxe: ₦119,600 ✅ (in budget ₦80k-₦130k)
   - Executive: ₦147,200 ❌ (over budget)
4. **Sets `hasRoomInBudget = true`** because at least one room (Standard or Deluxe) is in range
5. **Hotel appears in search results**
6. **Displays cheapest suitable room:** Standard Room at ₦92,000

---

## Priority Order

When displaying prices, the system uses this order:

```
1. Room Type Price (roomTypes[].basePriceNGN)
   ↓ if not available
2. Hotel Base Price (hotel.basePriceNGN)
   ↓ if not available
3. Fallback to ₦100,000
```

---

## Admin Panel Workflow

### When Admin Updates Prices:

**Scenario 1: Update Hotel Base Price**
```
Admin changes: basePriceNGN from ₦92,000 → ₦95,000
Effect: 
- Fallback price changes
- Room types UNAFFECTED (they have their own prices)
- Search still uses room type prices if available
```

**Scenario 2: Update Room Type Price**
```
Admin changes: Standard Room from ₦92,000 → ₦88,000
Effect:
- Room type price changes
- Search immediately uses new ₦88,000 price
- Hotel base price UNAFFECTED
- Budget filtering uses new ₦88,000 price
```

**Scenario 3: Update Room Discount**
```
Admin changes: Standard Room discount from 15% → 20%
Effect:
- Negotiation price changes: ₦92,000 → ₦73,600
- Regular search price stays ₦92,000
- "Potential savings" text updates
```

---

## What Gets Saved?

When admin clicks **Save**, the entire hotel object is sent to `/api/admin/hotels/[id]`:

```typescript
const updatedHotel = {
  ...formData,           // Includes basePriceNGN
  roomTypes: [           // Includes all room types with their prices
    {
      id: "standard",
      basePriceNGN: 92000,
      discountPercent: 15,
      ...
    },
    {
      id: "deluxe", 
      basePriceNGN: 119600,
      discountPercent: 12,
      ...
    }
  ],
  updatedAt: new Date().toISOString()
}
```

All fields are saved to `lib.hotels.json`, including:
- ✅ Hotel base price
- ✅ All room type prices
- ✅ All room discounts
- ✅ Room occupancy limits
- ✅ Room amenities

---

## Common Admin Questions

### Q: "I updated the hotel base price but search still shows old room prices"
**A:** That's correct! Room types have their own independent prices. You need to update the individual room type prices below in the "Room Types & Pricing" section.

### Q: "Which price should I update for search results?"
**A:** Update the **room type prices** (`roomTypes[].basePriceNGN`). The hotel base price is just a fallback.

### Q: "Can I set different discounts per room type?"
**A:** Yes! Each room type has its own `discountPercent` field (0-100%).

### Q: "Do changes reflect immediately in search?"
**A:** Yes, after saving. The admin API calls `clearHotelCache()` to refresh data.

### Q: "What if I delete all room types?"
**A:** Search falls back to using `hotel.basePriceNGN`.

---

## Discount System

### Hotel-Level Discount (Line 586-607)
```tsx
<label>Discount Percentage (%)</label>
<input
  value={discountPercentage}
  onChange={(e) => setDiscountPercentage(Number(e.target.value))}
/>
<button onClick={updateDiscountPercentage}>Update</button>
```

**Stored In:** `lib.discounts.json` (separate file)  
**API:** `/api/admin/discounts/[id]`  
**Purpose:** Global hotel discount (applies to base price for backwards compatibility)

### Room-Level Discount (Line 826-841)
```tsx
<label>Discount (%)</label>
<input
  value={roomType.discountPercent}
  onChange={(e) => {
    updatedRoomTypes[index].discountPercent = Number(e.target.value)
  }}
/>
```

**Stored In:** `hotel.roomTypes[].discountPercent` (in `lib.hotels.json`)  
**Purpose:** Room-specific discount percentage  
**Used For:** "Negotiate" feature per room type

---

## Visual Representation

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN PANEL FORM                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Basic Information                                           │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Base Price (₦) *                                    │    │
│ │ [ 92000 ]  ← HOTEL BASE PRICE (fallback)           │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ Room Types & Pricing                                        │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Standard Room                            20 sqm     │    │
│ │ ├─ Base Price (₦): [ 92000 ]  ← ROOM PRICE        │    │
│ │ ├─ Discount (%):   [ 15 ]     ← ROOM DISCOUNT      │    │
│ │ └─ Max Occupancy:  [ 2 ]                           │    │
│ └─────────────────────────────────────────────────────┘    │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Deluxe Room                              30 sqm     │    │
│ │ ├─ Base Price (₦): [ 119600 ] ← ROOM PRICE        │    │
│ │ ├─ Discount (%):   [ 12 ]     ← ROOM DISCOUNT      │    │
│ │ └─ Max Occupancy:  [ 2 ]                           │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ [ Save Changes ]                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

✅ **Admin panel edits BOTH:**
1. Hotel base price (`basePriceNGN`)
2. Individual room type prices (`roomTypes[].basePriceNGN`)

✅ **Search uses room type prices when available**

✅ **All prices save to `lib.hotels.json`**

✅ **Cache clears automatically after save**

✅ **Discounts can be set per hotel or per room type**
