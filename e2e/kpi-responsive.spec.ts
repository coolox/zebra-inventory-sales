import { expect, test } from "@playwright/test";

test("mobile KPI cards show long values without clipping or icon overlap", async ({ page }) => {
  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const values = page.getByTestId("metric-value");
    await expect(values).toHaveCount(3);
    await values.evaluateAll((nodes) => {
      ["€10,400,000", "101,234 adet", "€6,298,000"].forEach((value, index) => {
        nodes[index].textContent = value;
      });
    });
    if (width === 320) await page.evaluate(() => { document.body.style.zoom = "1.5"; });

    const layout = await values.evaluateAll((nodes) => nodes.map((value) => {
      const icon = value.parentElement?.querySelector("div > span");
      const valueBox = value.getBoundingClientRect();
      const iconBox = icon?.getBoundingClientRect();
      return {
        hasHorizontalOverflow: value.scrollWidth > value.clientWidth,
        overlapsIcon: Boolean(iconBox && valueBox.top < iconBox.bottom && valueBox.right > iconBox.left),
      };
    }));

    expect(layout).toHaveLength(3);
    layout.forEach((metric) => expect(metric).toEqual({ hasHorizontalOverflow: false, overlapsIcon: false }));
  }
});
