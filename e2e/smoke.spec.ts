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

  if (testInfo.project.name === "mobile") {
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

test("sales deep link opens store-scoped sales history and its detail", async ({ page }) => {
  await page.goto("/sales");
  await expect(page.getByRole("heading", { name: "Sales history" })).toBeVisible();
  await page.locator("#sales").getByRole("button", { name: /Silk Midi Dress/ }).first().click();
  const dialog = page.getByRole("dialog", { name: "Sale details" });
  await expect(dialog.getByText("Final ticket total")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
});

test("sales history direct link restores query filters", async ({ page }) => {
  await page.goto("/sales?saleStatus=confirmed&salePeriod=today");
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("confirmed");
  await expect(page.getByLabel("Period", { exact: true })).toHaveValue("today");
});

test("reports deep link opens the Owner reports workspace", async ({ page }) => {
  await page.goto("/reports");
  await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
  await expect(page.getByLabel("Report period")).toBeVisible();
});

test("confirmed sale can be cancelled with a required reason", async ({ page }) => {
  await page.goto("/sales");
  await page.getByRole("button", { name: /Silk Midi Dress/ }).first().click();
  await page.getByRole("button", { name: "Cancel sale" }).click();
  const dialog = page.getByRole("dialog", { name: "Cancel sale" });
  await dialog.getByRole("button", { name: "Cancel sale" }).click();
  await expect(dialog.getByRole("alert")).toHaveText("Enter a cancellation reason.");
  await dialog.getByLabel("Cancellation reason").fill("Customer returned the item");
  await dialog.getByRole("button", { name: "Cancel sale" }).click();
  await expect(page.getByRole("button", { name: /Silk Midi Dress/ }).first().getByText("Cancelled")).toBeVisible();
});

test("demo workspace restores saved inventory and resets to its baseline", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => window.localStorage.getItem("zebra-demo-workspace") !== null);
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
    await page.getByRole("button", { name: "TR", exact: true }).click();
  } else {
    await page.getByRole("button", { name: "Change language" }).click();
  }

  await expect(page.getByRole("heading", { name: "İşletme özeti" })).toBeVisible();
  await expect(page.getByText("Dikkat gerekli", { exact: true })).toBeVisible();
});
