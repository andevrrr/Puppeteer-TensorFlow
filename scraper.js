const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Function to capture full-page screenshots
async function captureScreenshot(page, url) {
  const screenshotPath = path.join(
    __dirname,
    "screenshots",
    `${new URL(url).hostname}.png`
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
}

// Function to extract and save HTML/CSS
async function saveHTML(page, url) {
  const html = await page.content();
  const htmlPath = path.join(
    __dirname,
    "html",
    `${new URL(url).hostname}.html`
  );
  fs.writeFileSync(htmlPath, html);
  console.log(`HTML saved: ${htmlPath}`);
}

// Function to extract performance metrics
async function savePerformanceMetrics(page, url) {
  const metrics = await page.evaluate(() => JSON.stringify(window.performance));
  const metricsPath = path.join(
    __dirname,
    "performance",
    `${new URL(url).hostname}.json`
  );
  fs.writeFileSync(metricsPath, metrics);
  console.log(`Performance metrics saved: ${metricsPath}`);
}

async function scrapeWebsite(url) {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  page.setDefaultNavigationTimeout(2 * 60 * 1000);

  await page.goto(url, { waitUntil: "networkidle2", timeout: 180000 });
  await autoScroll(page);

  fs.mkdirSync(path.join(__dirname, "screenshots"), { recursive: true });
  fs.mkdirSync(path.join(__dirname, "html"), { recursive: true });
  fs.mkdirSync(path.join(__dirname, "performance"), { recursive: true });

  await captureScreenshot(page, url);
  await saveHTML(page, url);
  await savePerformanceMetrics(page, url);

  await browser.close();
}

const websites = JSON.parse(fs.readFileSync("websiteData.json", "utf8"));

async function scrapeAllWebsites() {
  for (const website of websites) {
    console.log(`Scraping: ${website.title}`);
    await scrapeWebsite(website.link).catch(console.error);
  }
}

scrapeAllWebsites().catch(console.error);

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
