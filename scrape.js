const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
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
