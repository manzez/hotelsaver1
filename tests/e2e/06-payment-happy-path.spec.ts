import { test, expect } from '@playwright/test'

// Happy path that avoids external gateways by using "Pay at Hotel"
test('Payment happy path via Pay at Hotel → confirmation', async ({ page }) => {
  const propertyId = 'protea-hotel-owerri-owerri'
  const price = 92000
  const checkIn = '2025-12-01'
  const checkOut = '2025-12-03'

  await page.goto(`/book?propertyId=${propertyId}&price=${price}&checkIn=${checkIn}&checkOut=${checkOut}`)
  await page.waitForLoadState('networkidle')

  // Fill basic booking contact details
  await page.getByLabel('Full Name *').fill('Test User')
  await page.getByLabel('Phone Number (WhatsApp) *').fill('+2348012345678')
  await page.getByLabel('Email Address *').fill('test@example.com')

  // Submit booking → should navigate to /payment
  await Promise.all([
    page.waitForURL(/\/payment(\?|$)/),
    page.getByRole('button', { name: /Confirm Booking/ }).click()
  ])

  // On payment page, fill contact info (required for Paystack; reused for Pay-at-hotel)
  await page.getByLabel('Full Name *').fill('Test User')
  await page.getByLabel('Email Address *').fill('test@example.com')
  await page.getByLabel('Phone Number *').fill('+2348012345678')

  // Select "Pay at Hotel"
  await page.getByText('Pay at Hotel', { exact: true }).click()

  // Click primary action
  const payButton = page.getByRole('button', { name: /Confirm Booking|Pay ₦/ })
  await Promise.all([
    page.waitForURL(/\/confirmation(\?|$)/),
    payButton.click()
  ])

  // Assert confirmation page shows a booking reference in the URL or content
  expect(page.url()).toMatch(/bookingId=BK\d+/)
  await expect(page.locator('text=Booking')).toBeVisible()
})
