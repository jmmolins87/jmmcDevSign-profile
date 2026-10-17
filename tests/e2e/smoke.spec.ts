import { expect, test } from "@playwright/test"

/**
 * Spec 00 smoke: the app boots and serves the placeholder page with the
 * design-token wiring in place.
 */
test.describe("app boots", () => {
  test("placeholder renders at /", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(/.+/)
  })

  test("dark theme is the default (Oscuro, guidelines §8)", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
  })

  test("design tokens are present (accent #FF5A1F)", async ({ page }) => {
    await page.goto("/")
    const style = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-accent"),
    )
    expect(style.trim().toLowerCase()).toBe("#ff5a1f")
  })
})
