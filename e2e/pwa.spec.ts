import { expect, test } from "@playwright/test";

test("serves install metadata and PNG assets from the production app", async ({ page, request }) => {
  await page.goto("/");

  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/icons/apple-touch-icon.png");

  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  expect(manifestResponse.headers()["content-type"]).toContain("application/manifest+json");
  const manifest = await manifestResponse.json();
  expect(manifest).toMatchObject({ start_url: "/", scope: "/", display: "standalone" });

  for (const icon of ["zebra-192.png", "zebra-512.png", "zebra-maskable-512.png", "apple-touch-icon.png"]) {
    const response = await request.get(`/icons/${icon}`);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
  }

  const serviceWorkerResponse = await request.get("/sw.js");
  expect(serviceWorkerResponse.ok()).toBe(true);
  expect(await serviceWorkerResponse.text()).toContain("event.respondWith(fetch(event.request))");

  await expect.poll(async () => page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration("/");
    return registration?.active?.scriptURL.endsWith("/sw.js") ?? false;
  })).toBe(true);
});
