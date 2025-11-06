// lib/discounts-server.ts - Server-side discount functions with file system access
import { promises as fs } from 'fs';
import path from 'path';

// Define the type for your discounts data
interface DiscountsData {
  default: number;
  overrides: Record<string, number>;
}

// Fallback if anything goes wrong - 15% default discount
const DEFAULT_DISCOUNT = 0.15;

// Function to get fresh discount data from the file system (server-side only)
export async function getDiscountData(): Promise<DiscountsData> {
  try {
    const filePath = path.join(process.cwd(), 'lib', 'discounts.json')
    const fileContent = await fs.readFile(filePath, 'utf8')
    return JSON.parse(fileContent) as DiscountsData
  } catch (error) {
    console.error('Failed to read discount data:', error)
    // Return default structure if file read fails
    return {
      default: DEFAULT_DISCOUNT,
      overrides: {}
    }
  }
}

// Cache for performance (with short TTL to ensure admin changes are picked up quickly)
let discountCache: { data: DiscountsData; timestamp: number } | null = null
const CACHE_TTL = 30000 // 30 seconds

async function getCachedDiscountData(): Promise<DiscountsData> {
  const now = Date.now()
  
  if (discountCache && (now - discountCache.timestamp) < CACHE_TTL) {
    return discountCache.data
  }
  
  const data = await getDiscountData()
  discountCache = { data, timestamp: now }
  return data
}

export async function getDiscountForAsync(propertyId: string): Promise<number> {
  try {
    // Check if propertyId is valid
    if (!propertyId || typeof propertyId !== 'string') {
      return 0;
    }

    // Get fresh discount data
    const discounts = await getCachedDiscountData()

    // Check if this property has a specific override
    if (discounts.overrides && propertyId in discounts.overrides) {
      const override = discounts.overrides[propertyId];
      if (typeof override === 'number' && override >= 0 && override <= 1) {
        return override;
      }
    }
    
    // Use the default from config
    const defaultDiscount = typeof discounts.default === 'number' ? discounts.default : DEFAULT_DISCOUNT;
    return defaultDiscount;
  } catch (error) {
    // If anything goes wrong, return default discount
    console.error('Error in getDiscountForAsync:', error);
    return DEFAULT_DISCOUNT;
  }
}