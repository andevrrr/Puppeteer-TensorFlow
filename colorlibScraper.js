const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://colorlib.com/wp/bad-websites/");

  const websites = await page.evaluate(() => {
    const results = [];
    const items = document.querySelectorAll('article h3.wp-block-heading');

    items.forEach(item => {
      const titleElement = item.querySelector('a');
      const title = titleElement ? titleElement.innerText : 'No title';
      const link = titleElement ? titleElement.getAttribute('href') : 'No link';

      let description = '';
      let nextElement = item.nextElementSibling;

      // Collect text from all subsequent <p> tags until the next <h3> tag
      while(nextElement && nextElement.tagName !== 'H3') {
        if (nextElement.tagName === 'P') {
          description += nextElement.innerText + ' ';
        }
        nextElement = nextElement.nextElementSibling;
      }
      
      description = description.trim();

      results.push({ title, link, description });
    });

    return results;
  });

  fs.writeFile("badDesigns.json", JSON.stringify(websites, null, 2), err => {
    if (err) throw err;
    console.log("The file has been saved!");
  });

  await browser.close();
})();
