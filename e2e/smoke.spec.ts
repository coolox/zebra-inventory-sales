import { expect, test } from "@playwright/test";

test("demo dashboard opens in each supported viewport", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Zebra — Inventory & Sales/);
  await expect(page.getByRole("heading", { name: "Business pulse" })).toBeVisible();
  await expect(page.getByRole("button", { name: "New sale" })).toBeVisible();
  if (testInfo.project.name !== "desktop") {
    await page.getByRole("button", { name: "Workspace" }).click();
    const mobileDrawer = page.locator("aside").last();
    await expect(mobileDrawer.getByText("Retail system")).toBeVisible();
    await expect(mobileDrawer.getByText("Zebra Boutique")).toBeVisible();
  } else {
    await expect(page.getByText("Zebra Boutique").first()).toBeVisible();
  }
});

test("receive flow opens and remains usable in each supported viewport", async ({ page }, testInfo) => {
  await page.goto("/");

  if (testInfo.project.name !== "desktop") {
    await page.getByRole("button", { name: "Change language" }).click();
    await page.getByRole("button", { name: "Ürün kabul et" }).click();
    const dialog = page.getByRole("dialog", { name: "Ürün kabul et" });
    await expect(dialog.getByText("Hızlı beden bazlı kabul")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "0 ürünü kabul et" })).toBeDisabled();
  } else {
    await page.getByRole("button", { name: "Receive products" }).click();
    const dialog = page.getByRole("dialog", { name: "Receive products" });
    await expect(dialog.getByText("Fast size-based receipt")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Receive 0 items" })).toBeDisabled();
  }
});

test("theme control applies the light token set", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
});
