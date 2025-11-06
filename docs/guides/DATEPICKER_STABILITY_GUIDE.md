# DatePicker Stability Guide

## 🚨 Problem: DatePicker Keeps Breaking

**Common Issues:**
- DatePicker stops working after UI changes
- Hydration errors in console
- Styles getting overridden
- Props compatibility issues
- Mobile rendering problems

## ✅ Solution: Platform-Specific Approaches

### **Mobile DatePicker: ClientDatepicker**

**File:** `components/SearchBarMobile.tsx`

```tsx
import ClientDatepicker from './ClientDatepicker'

// ✅ STABLE: Use ClientDatepicker for mobile
<ClientDatepicker
  value={{
    startDate: startDate,
    endDate: endDate
  }}
  onChange={(value) => {
    const start = value?.startDate ? (typeof value.startDate === 'string' ? new Date(value.startDate) : value.startDate) : null
    const end = value?.endDate ? (typeof value.endDate === 'string' ? new Date(value.endDate) : value.endDate) : null
    setStartDate(start)
    setEndDate(end)
  }}
  displayFormat="MMM DD, YYYY"
  primaryColor="emerald"
  useRange={true}
/>
```

**Why This Works:**
- Pre-configured wrapper component
- Handles all SSR/hydration issues
- Consistent styling
- Mobile-optimized

### **Desktop DatePicker: HTML5 Native**

**File:** `components/SearchBarDesktop.tsx`

```tsx
// ✅ STABLE: Use HTML5 date inputs for desktop
<input
  type="date"
  title="Check in date"
  value={startDate ? startDate.toISOString().split('T')[0] : ''}
  onChange={(e) => {
    const date = e.target.value ? new Date(e.target.value) : null
    setStartDate(date)
    if (!endDate && date) {
      setEndDate(addDays(date, 1))
    }
  }}
  min={new Date().toISOString().split('T')[0]}
  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-md"
/>
```

**Why This Works:**
- Native browser support
- No external dependencies
- Consistent across all browsers
- No hydration issues
- Perfect for desktop use

## 🛡️ Stability Rules

### **Rule 1: Never Mix Approaches**
```tsx
// ❌ BAD - Mixing approaches causes conflicts
{isMobile ? <ClientDatepicker /> : <ReactDatePicker />}

// ✅ GOOD - Separate components
// Mobile component uses ClientDatepicker only
// Desktop component uses HTML5 inputs only
```

### **Rule 2: Don't Touch Working DatePicker Props**
```tsx
// ✅ STABLE - Don't change these props
<ClientDatepicker
  value={{ startDate, endDate }}    // ← Keep this structure
  onChange={handleChange}           // ← Keep this pattern
  primaryColor="emerald"            // ← Keep this color
  useRange={true}                   // ← Keep this setting
/>
```

### **Rule 3: Avoid Complex DatePicker Styling**
```tsx
// ❌ BAD - Complex styling breaks things
<DatePicker
  className="complex-styles"
  calendarClassName="more-complex-styles"
  popperClassName="even-more-styles"
/>

// ✅ GOOD - Minimal, stable styling
<input
  type="date"
  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-md"
/>
```

### **Rule 4: Handle Date Conversion Properly**
```tsx
// ✅ PROPER date handling
const handleDateChange = (value) => {
  const start = value?.startDate ? 
    (typeof value.startDate === 'string' ? 
      new Date(value.startDate) : 
      value.startDate
    ) : null
  setStartDate(start)
}
```

## 🔧 Troubleshooting Guide

### **Issue: DatePicker Not Rendering**
**Solution:** Check if component is client-side rendered
```tsx
// ✅ Ensure 'use client' directive
'use client'
import dynamic from 'next/dynamic'
```

### **Issue: Hydration Errors**
**Solution:** Use existing ClientDatepicker wrapper
```tsx
// ✅ Use stable wrapper
import ClientDatepicker from './ClientDatepicker'
// Don't create new dynamic imports
```

### **Issue: Styling Conflicts**
**Solution:** Use separate CSS classes for mobile/desktop
```tsx
// Mobile
className="mobile-datepicker"
// Desktop  
className="desktop-datepicker"
```

### **Issue: Props Not Working**
**Solution:** Check component documentation
```tsx
// ✅ Only use supported props
<ClientDatepicker
  value={...}         // ✅ Supported
  onChange={...}      // ✅ Supported
  primaryColor={...}  // ✅ Supported
  useRange={true}     // ✅ Supported
  customProp={...}    // ❌ Might break
/>
```

## 📱 Mobile DatePicker Best Practices

1. **Always use ClientDatepicker** - It's pre-configured and stable
2. **Keep modal structure** - Full-screen modal works best on mobile
3. **Use backdrop dismissal** - Standard mobile UX pattern
4. **Test on actual devices** - Emulator isn't always accurate

## 🖥️ Desktop DatePicker Best Practices

1. **Use HTML5 date inputs** - Most stable and native
2. **Keep inline positioning** - Desktop users expect inline dropdowns
3. **Provide min/max dates** - Prevent invalid date selection
4. **Handle date formatting** - Convert between Date objects and strings properly

## 🚫 What NOT To Do

### **❌ Don't Create New DatePicker Imports**
```tsx
// BAD - Creates new instability
const MyDatePicker = dynamic(() => import('react-datepicker'))
```

### **❌ Don't Mix Libraries**
```tsx
// BAD - Mixing creates conflicts
import ReactDatePicker from 'react-datepicker'
import AnotherDatePicker from 'another-library'
```

### **❌ Don't Override Core Styles**
```tsx
// BAD - Overriding core styles breaks things
.react-datepicker { 
  // Custom overrides that break functionality
}
```

### **❌ Don't Add Complex Props**
```tsx
// BAD - Complex configurations are fragile
<DatePicker
  popperProps={{...}}
  calendarStartDay={1}
  showPopperArrow={false}
  renderCustomHeader={...}
/>
```

## ✅ Final Recommendation

**For Maximum Stability:**

1. **Mobile**: Use `ClientDatepicker` component (already working)
2. **Desktop**: Use HTML5 `<input type="date">` (most stable)
3. **Never mix** the two approaches
4. **Test separately** on each platform
5. **Don't modify** working DatePicker configurations

This approach eliminates DatePicker-related breakage and ensures both platforms have stable, appropriate date selection interfaces.