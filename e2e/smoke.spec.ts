import { expect, test } from "@playwright/test";

function captureHydrationDiagnostics(page: import("@playwright/test").Page) {
  const diagnostics: string[] = [];
  const capture = (message: string) => {
    if (/recoverable hydration|hydration failed|text content does not match/i.test(message)) diagnostics.push(message);
  };
  page.on("console", (message) => capture(message.text()));
  page.on("pageerror", (error) => capture(error.message));
  return diagnostics;
}

test("demo production shell has no hydration diagnostics", async ({ page }) => {
  const diagnostics = captureHydrationDiagnostics(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Business pulse" })).toBeVisible();
  expect(diagnostics).toEqual([]);
});

test("demo dashboard opens in each supported viewport", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Zebra — Inventory & Sales/);
  await expect(page.getByRole("heading", { name: "Business pulse" })).toBeVisible();
  await expect(page.getByRole("button", { name: "New sale" })).toBeVisible();
  if (testInfo.project.name !== "desktop") {
    await page.getByRole("button", { name: "Workspace" }).click();
    const mobileDrawer = page.locator("aside").last();
    await expect(mobileDrawer.getByText("Retail system")).toBeVisible();
    await expect(mobileDrawer.getByRole("navigation").getByText("Zebra Boutique", { exact: true })).toBeVisible();
  } else {
    await expect(page.getByText("Zebra Boutique").first()).toBeVisible();
  }
});

test("Sales Trend reveals a precise revenue value on tap without mobile overflow", async ({ page }) => {
  await page.goto("/");

  const trend = page.locator("#sales-trend");
  const zeroBar = trend.getByRole("button", { name: /: €0\. Show day revenue/ }).first();
  await zeroBar.click();
  await expect(trend.getByText("Selected day:")).toBeVisible();
  await expect(trend.getByText("€0").last()).toBeVisible();
  await expect(zeroBar).toHaveAttribute("aria-pressed", "true");
  await trend.getByRole("button", { name: "Close selection" }).click();
  await expect(trend.getByText("Tap a day to see its amount")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
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

test("inventory rows show product thumbnails and purchase cost", async ({ page }) => {
  await page.goto("/inventory");

  const productRow = page.locator("#inventory").getByRole("button").filter({ hasText: "KM-9902" }).first();
  await expect(productRow.locator('img[src*="km-9902/front.png"]')).toBeVisible();
  await expect(productRow).toContainText("Purchase: 75 USD");
});

test("Owner selects a size before adjusting stock", async ({ page }) => {
  await page.goto("/inventory");
  await page.locator("#inventory").getByRole("button").filter({ hasText: "Silk Midi Dress" }).first().click();
  const productDialog = page.getByRole("dialog", { name: "Silk Midi Dress" });
  await productDialog.getByRole("button", { name: "Adjust stock" }).click();
  const adjustmentDialog = page.getByRole("dialog", { name: "Stock adjustment" });
  await expect(adjustmentDialog.getByText("Select size")).toBeVisible();
  await expect(adjustmentDialog.getByRole("button", { name: "Save adjustment" })).toBeDisabled();
  await adjustmentDialog.getByRole("button", { name: /^1/ }).click();
  await adjustmentDialog.getByLabel("Quantity change").fill("-1");
  await expect(adjustmentDialog.getByText(/Ivory \/ 1.*Before: 2.*Delta: -1.*After: 1/)).toBeVisible();
});

test("Movement history is centered on mobile and remains contained in every viewport", async ({ page }) => {
  await page.goto("/inventory");
  await page.locator("#inventory").getByRole("button").filter({ hasText: "Silk Midi Dress" }).first().click();
  const productDialog = page.getByRole("dialog", { name: "Silk Midi Dress" });
  await productDialog.getByRole("button", { name: "Movement history" }).click();

  const historyDialog = page.getByRole("dialog", { name: "Stock movements" });
  await expect(historyDialog).toBeVisible();
  await expect(historyDialog).toHaveAttribute("data-mobile-placement", "centered");
  await expect(historyDialog.getByText("No movements have been recorded for this variant yet.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

  await page.keyboard.press("Escape");
  await expect(historyDialog).toHaveCount(0);
  await expect(productDialog.getByRole("button", { name: "Movement history" })).toBeVisible();
});

test("Owner can always find archived products and restore one", async ({ page }) => {
  await page.goto("/inventory");

  const archivedButton = page.getByRole("button", { name: /Archived products/ });
  await expect(archivedButton).toContainText("0");
  await archivedButton.click();
  let archiveDialog = page.getByRole("dialog", { name: "Archived products" });
  await expect(archiveDialog.getByText("No archived products")).toBeVisible();
  await archiveDialog.getByRole("button", { name: "Close" }).click();

  await page.locator("#inventory").getByRole("button").filter({ hasText: "Silk Midi Dress" }).first().click();
  const productDialog = page.getByRole("dialog", { name: "Silk Midi Dress" });
  await productDialog.getByRole("button", { name: "Archive product" }).click();
  await productDialog.getByRole("button", { name: "Archive", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Product archived");
  await productDialog.getByRole("button", { name: "Close" }).click();

  await expect(archivedButton).toContainText("1");
  await archivedButton.click();
  archiveDialog = page.getByRole("dialog", { name: "Archived products" });
  await expect(archiveDialog.getByText("Silk Midi Dress")).toBeVisible();
  await archiveDialog.getByRole("button", { name: "Restore to catalog" }).click();
  await expect(archiveDialog.getByText("No archived products")).toBeVisible();
  await expect(page.getByText("Product restored", { exact: true })).toBeVisible();
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

test("Owner opens the full low-stock list only on demand", async ({ page }) => {
  await page.goto("/reports");

  const lowStock = page.getByRole("region", { name: "Low stock" });
  await expect(lowStock.getByRole("button", { name: "View list" })).toBeVisible();
  await lowStock.getByRole("button", { name: "View list" }).click();
  await expect(lowStock.getByRole("button", { name: "Hide list" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await lowStock.getByRole("button", { name: "Hide list" }).click();
  await expect(lowStock.getByRole("button", { name: "View list" })).toBeVisible();
});

test("Owner opens reconciliation only on demand and can hide it again", async ({ page }) => {
  await page.goto("/reports");

  const reconciliation = page.getByRole("region", { name: "Reconciliation" });
  await expect(reconciliation.getByRole("button", { name: "View checks" })).toBeVisible();
  await expect(reconciliation.getByText("No discrepancies found.")).toHaveCount(0);
  await reconciliation.getByRole("button", { name: "View checks" }).click();
  await expect(reconciliation.getByText("No discrepancies found.")).toBeVisible();
  await reconciliation.getByRole("button", { name: "Refresh" }).click();
  await expect(reconciliation.getByText("No discrepancies found.")).toBeVisible();
  await reconciliation.getByRole("button", { name: "Hide checks" }).click();
  await expect(reconciliation.getByText("No discrepancies found.")).toHaveCount(0);
});

test("Owner can open the audit log while Seller only sees activity", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "All activity" }).click();
  const ownerDialog = page.getByRole("dialog", { name: "Audit log" });
  await expect(ownerDialog.getByLabel("Actor")).toBeVisible();
  await expect(ownerDialog.getByText("No audit events match this filter.")).toBeVisible();
  await expect(ownerDialog.getByRole("button", { name: "Previous" })).toBeDisabled();
  await expect(ownerDialog.getByRole("button", { name: "Next" })).toBeDisabled();
  await ownerDialog.getByRole("button", { name: "Close" }).click();

  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Switch to Seller preview" }).click();
  } else {
    await page.getByRole("banner").getByRole("button", { name: "Seller", exact: true }).click();
  }
  await page.getByRole("button", { name: "All activity" }).click();
  await expect(page.getByRole("dialog", { name: "Activity" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Audit log" })).toHaveCount(0);
});

test("Seller sales-summary boundary remains compact in each supported viewport", async ({ page }, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Switch to Seller preview" }).click();
  } else {
    await page.getByRole("banner").getByRole("button", { name: "Seller", exact: true }).click();
  }
  const summary = page.getByRole("region", { name: "Sales summary" });
  await expect(summary).toBeVisible();
  await expect(summary.getByText("Your live sales summary will appear after secure sign-in.")).toBeVisible();
  await expect(summary.getByText("Store sales")).toHaveCount(0);
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

  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Change language" }).click();
  } else {
    await page.getByRole("button", { name: "TR", exact: true }).click();
  }

  await expect(page.getByRole("heading", { name: "İşletme özeti" })).toBeVisible();
  await expect(page.getByText("Dikkat gerekli", { exact: true })).toBeVisible();
});
