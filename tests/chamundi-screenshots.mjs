/* Capture the three mobile dark-mode theme views.
   Run from tests/:
     npm install
     npx playwright install chromium
     BASE_URL=http://localhost:8788 npm run shots
*/

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const baseUrl = process.env.BASE_URL || "http://localhost:8788";
const outputDir = fileURLToPath(new URL("./screenshots/", import.meta.url));
const themes = ["espresso", "cherry", "estate"];

mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch();

for (const theme of themes) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(({ theme }) => {
    localStorage.setItem("sdhhe-theme", theme);
    localStorage.setItem("sdhhe-mode", "dark");
  }, { theme });
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.click(".chamundi-launcher");
  await page.waitForTimeout(500);

  const metrics = await page.evaluate(() => {
    const panel = document.querySelector(".chamundi-panel");
    const rect = panel.getBoundingClientRect();
    return {
      theme: document.documentElement.dataset.theme,
      mode: document.documentElement.dataset.mode,
      panel: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
      pageWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      panelScrollWidth: panel.scrollWidth,
      panelClientWidth: panel.clientWidth
    };
  });

  console.log(JSON.stringify(metrics));
  if (errors.length) console.error(theme, errors);

  await page.screenshot({
    path: `${outputDir}chamundi-${theme}-dark-mobile.png`,
    fullPage: false
  });
  await context.close();
}

await browser.close();
