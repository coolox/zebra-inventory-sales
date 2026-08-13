import { expect, test } from "@playwright/test";

async function addTr07Line(dialog: import("@playwright/test").Locator, price: string, currency: "EUR" | "USD") {
  await dialog.locator("#sale-product-code").fill("TR-07");
  await dialog.getByRole("button", { name: "Black", exact: true }).click();
  await dialog.getByRole("button", { name: /^M\s*2$/ }).click();
  await dialog.locator('input[type="number"]').first().fill(price);
  await dialog.locator("select").first().selectOption(currency);
}

test("demo sale preserves two same-variant EUR and USD lines", async ({ page }) => {
  await page.goto("/");

  const productRow = page.locator("#inventory").getByRole("button").filter({ hasText: "TR-07" }).first();
  await expect(productRow).toContainText("2 pcs");

  await page.getByRole("button", { name: "New sale" }).click();
  const dialog = page.getByRole("dialog", { name: "New sale" });

  await dialog.getByRole("button", { name: "Per-item price" }).click();
  await addTr07Line(dialog, "100", "EUR");
  await dialog.getByRole("button", { name: "Add another item" }).click();

  await addTr07Line(dialog, "120", "USD");

  await expect(dialog.getByText("TR-07 · Black · M · 100 EUR")).toHaveCount(1);
  await expect(dialog.getByText("TR-07 · Black · M · 120 USD")).toHaveCount(1);
  await expect(dialog.getByText("2 items", { exact: true })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Sell 2 items" })).toBeEnabled();

  await dialog.getByRole("button", { name: "Sell 2 items" }).click();

  await expect(page.getByText("Sale with 2 items recorded for Elif Demir")).toBeVisible();
  await expect(dialog).toBeHidden();
  await expect(productRow).toContainText("0 pcs");
  await expect(page.getByText("Sale · 3 items", { exact: true })).toHaveCount(0);
});
