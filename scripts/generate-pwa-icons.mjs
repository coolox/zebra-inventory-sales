import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const iconDirectory = path.join(root, "public", "icons");

async function render(page, source, output, size) {
  const svg = await readFile(path.join(iconDirectory, source), "utf8");
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden}img{display:block;width:100%;height:100%}</style><img src="${dataUrl}" alt="">`);
  await page.locator("img").screenshot({ path: path.join(iconDirectory, output), animations: "disabled" });
}

await mkdir(iconDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await render(page, "zebra-icon.svg", "zebra-192.png", 192);
  await render(page, "zebra-icon.svg", "zebra-512.png", 512);
  await render(page, "zebra-maskable.svg", "zebra-maskable-512.png", 512);
  await render(page, "zebra-icon.svg", "apple-touch-icon.png", 180);
} finally {
  await browser.close();
}
