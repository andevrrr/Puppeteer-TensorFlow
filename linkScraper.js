const puppeteer = require('puppeteer-core');
require("dotenv").config();

const PROXY_HOST = process.env.PROXY_HOST;
const PROXY_PORT = process.env.PROXY_PORT;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const AUTH = `${USERNAME}:${PASSWORD}`;

(async () => {
    const browser = await puppeteer.connect({
        browserWSEndpoint: `wss://${AUTH}@${PROXY_HOST}:${PROXY_PORT}`,
      });
  const page = await browser.newPage();

  await page.goto('https://www.awwwards.com/websites/?text=portfolio');

  const websites = await page.evaluate(() => {
    let items = document.querySelectorAll('.js-collectable');
    let results = [];

    items.forEach((item) => {
      let title = item.querySelector('h3')?.innerText;
      let link = item.querySelector('.figure-rollover__bt')?.href;
      results.push({ title, link });
    });

    return results;
  });

  for (const website of websites) {
    await page.goto(website.link, { waitUntil: 'networkidle2' });

    const info = await page.evaluate(() => {
      const data = {
        scripts: [],
        hasReact: false,
      };

      document.querySelectorAll('script').forEach(script => {
        if (script.src) data.scripts.push(script.src);
        if (script.textContent.includes('React')) data.hasReact = true; // Basic check for React in inline scripts
      });

      return data;
    });

    console.log(`Data for ${website.title}:`, info);

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await browser.close();
})();
