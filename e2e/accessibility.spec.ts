import { expect, test } from "@playwright/test";
import axe from "axe-core";

test("dashboard and receive dialog have no automated axe violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.addScriptTag({ content: axe.source });
  await page.getByRole("button", { name: "Receive products" }).click();
  const violations = await page.evaluate(async () => {
    const result = await (window as typeof window & { axe: { run: (context: Document, options: object) => Promise<{ violations: Array<{ id: string; nodes: Array<{ target: string[]; failureSummary: string }> }> }> } }).axe.run(document, {});
    return result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map((node) => ({ targets: node.target, summary: node.failureSummary })) }));
  });
  expect(violations).toEqual([]);
});

test("keyboard keeps focus in dialogs and returns it to their triggers", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const newSale = page.getByRole("button", { name: "New sale" });
  await newSale.focus();
  await page.keyboard.press("Enter");
  const saleDialog = page.getByRole("dialog", { name: "New sale" });
  await expect(saleDialog).toBeVisible();
  await expect(saleDialog.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(saleDialog.locator(":focus")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(newSale).toBeFocused();

  if (testInfo.project.name !== "desktop") {
    const navTrigger = page.getByRole("button", { name: "Workspace" });
    await navTrigger.focus();
    await page.keyboard.press("Enter");
    const drawer = page.getByRole("dialog", { name: "Workspace" });
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(navTrigger).toBeFocused();
  }
});

test("light theme and reduced motion preserve accessible feedback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "New sale" }).click();
  const dialog = page.getByRole("dialog", { name: "New sale" });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => Number.parseFloat(getComputedStyle(element).animationDuration))).toBeLessThanOrEqual(0.01);
});
