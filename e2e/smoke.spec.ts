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

test("inventory deep link keeps the dashboard workspace available", async ({ page }) => {
  await page.goto("/inventory");

  await expect(page).toHaveTitle(/Zebra — Inventory & Sales/);
  await expect(page.locator("main").getByText("Inventory", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "New sale" })).toBeVisible();
});

test("demo workspace restores saved inventory and resets to its baseline", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const stored = window.localStorage.getItem("zebra-demo-workspace");
    if (!stored) throw new Error("Demo workspace was not persisted");
    const workspace = JSON.parse(stored) as { data: { products: { stock: number }[] } };
    workspace.data.products[0].stock = 37;
    window.localStorage.setItem("zebra-demo-workspace", JSON.stringify(workspace));
  });

  await page.reload();
  await expect(page.getByText("37 pcs", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await expect(page.getByText("37 pcs", { exact: true })).not.toBeVisible();
});

test("Turkish dashboard labels remain visible in each supported viewport", async ({ page }, testInfo) => {
  await page.goto("/");

  if (testInfo.project.name === "desktop") {
    await page.getByRole("button", { name: "TR" }).click();
  } else {
    await page.getByRole("button", { name: "Change language" }).click();
  }

  await expect(page.getByRole("heading", { name: "İşletme özeti" })).toBeVisible();
  await expect(page.getByText("Dikkat gerekli", { exact: true })).toBeVisible();
});
