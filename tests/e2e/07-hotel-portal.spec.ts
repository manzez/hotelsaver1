import { test, expect } from '@playwright/test'

test.describe('Hotel Admin Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hotel-portal')
    await page.waitForLoadState('networkidle')
  })

  test('Loads and shows auth form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Hotel Admin Portal' })).toBeVisible()
    await expect(page.getByTestId('hotel-id-input')).toBeVisible()
    await expect(page.getByTestId('hotel-key-input')).toBeVisible()
    await expect(page.getByTestId('load-facilities')).toBeVisible()
  })

  test('Load button disables until ID and Key provided', async ({ page }) => {
    const loadBtn = page.getByTestId('load-facilities')
    await expect(loadBtn).toBeDisabled()

    await page.getByTestId('hotel-id-input').fill('demo-hotel')
    await expect(loadBtn).toBeDisabled()

    await page.getByTestId('hotel-key-input').fill('demo-key')
    await expect(loadBtn).toBeEnabled()
  })
})
