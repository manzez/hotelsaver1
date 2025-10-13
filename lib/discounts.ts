import discounts from './discounts.json'

/** Returns discount rate (0–1). If an override exists, it wins; else default. */
export function getDiscountFor(propertyId: string): number {
  const def = typeof discounts.default === 'number' ? discounts.default : 0.15
  const ov = (discounts as any)?.overrides?.[propertyId]
  if (typeof ov === 'number') return ov
  return def
}
