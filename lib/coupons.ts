/**
 * Coupon code generator and management for HotelSaver.ng
 * Generates unique codes for free giftbag promotion
 */

export interface CouponCode {
  code: string;
  generatedAt: Date;
  bookingId?: string;
  claimed?: boolean;
  claimedAt?: Date;
}

/**
 * Generate a unique coupon code based on timestamp and random element
 * Format: SAVER + last 2 digits of current time + random 2 digits
 * Examples: SAVER33, SAVER47, SAVER92
 */
export function generateCouponCode(): string {
  const now = new Date();
  const timeComponent = now.getTime().toString().slice(-2);
  const randomComponent = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  // Combine time and random for uniqueness
  const numericPart = (parseInt(timeComponent) + parseInt(randomComponent)) % 100;
  const formattedNumber = numericPart.toString().padStart(2, '0');
  
  return `SAVER${formattedNumber}`;
}

/**
 * Generate a coupon code for a specific booking
 */
export function generateBookingCoupon(bookingId: string): CouponCode {
  return {
    code: generateCouponCode(),
    generatedAt: new Date(),
    bookingId,
    claimed: false
  };
}

/**
 * Create WhatsApp URL with prefilled message for coupon redemption
 */
export function createWhatsAppRedemptionUrl(bookingRef: string, couponCode: string): string {
  const message = `Hi HotelSaver! I'd like to claim my free giftbag. My booking reference is: ${bookingRef} and my coupon code is: ${couponCode}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/2347077775545?text=${encodedMessage}`;
}

/**
 * Get coupon instructions text
 */
export function getCouponInstructions(couponCode: string): string {
  return `To claim your FREE giftbag, text your booking reference and this coupon code (${couponCode}) to our WhatsApp: +234 707 777 5545`;
}

/**
 * Validate coupon code format
 */
export function isValidCouponCode(code: string): boolean {
  return /^SAVER\d{2}$/.test(code);
}

/**
 * Get a default coupon code for general use
 */
export function getDefaultCouponCode(): string {
  return 'SAVER33';
}