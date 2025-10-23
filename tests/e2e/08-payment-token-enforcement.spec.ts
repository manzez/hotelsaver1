import { test, expect } from '@playwright/test'

// Validates that negotiation token is required on the payment page
// and that a full negotiate → payment → confirm (Pay at Hotel) flow works end-to-end.

test.describe('Negotiation token enforcement and Pay-at-Hotel flow', () => {
  test('Payment page blocks actions without negotiation token', async ({ page }) => {
    // Navigate straight to payment without going through negotiation
    const propertyId = 'protea-hotel-owerri-owerri'
    const price = 92000
    await page.goto(`/payment?propertyId=${propertyId}&price=${price}`)

  // Choose Pay at Hotel and verify primary action remains disabled due to missing token
  await page.getByText('Pay at Hotel', { exact: true }).click()

  // Button shows "Token required" when negotiationToken is missing
  const primary = page.getByRole('button', { name: 'Token required' })
  await expect(primary).toBeDisabled()

    // Warning banner should be visible
    await expect(page.getByText('Your negotiation token is missing or expired')).toBeVisible()
  })

  test('End-to-end negotiate → payment (pay-at-hotel) with token', async ({ page }) => {
    const propertyId = 'protea-hotel-owerri-owerri'

    // Start a negotiation for the property (include simple date context)
    await page.goto(`/negotiate?propertyId=${propertyId}&checkIn=2025-12-01&checkOut=2025-12-03`)

    // Wait for the "Proceed to Payment" button to appear and click it
    const proceed = page.getByRole('button', { name: /Proceed to Payment/ })
    await proceed.waitFor({ state: 'visible', timeout: 20000 })

    // Click to navigate to payment page (negotiation page enforces 6–7s UX hold)
    await Promise.all([
      page.waitForURL(/\/payment\?/),
      proceed.click()
    ])

    // URL should contain a negotiationToken
    const url = new URL(page.url())
    expect(url.searchParams.get('negotiationToken')).toBeTruthy()

    // Fill contact information
    await page.getByLabel('Full Name *').fill('Test User')
    await page.getByLabel('Email Address *').fill('test@example.com')
    await page.getByLabel('Phone Number *').fill('+2348012345678')

    // Choose Pay at Hotel and submit
    await page.getByText('Pay at Hotel', { exact: true }).click()
    const action = page.getByRole('button', { name: /Confirm Booking|Pay ₦/ })

    await Promise.all([
      page.waitForURL(/\/confirmation\?/),
      action.click()
    ])

    // Confirmation URL contains a bookingId
    expect(page.url()).toMatch(/bookingId=BK\d+/)

    // Basic success content visible (pay-at-hotel path)
    await expect(page.getByText('Booking Confirmed!')).toBeVisible({ timeout: 10000 })
  })
})
