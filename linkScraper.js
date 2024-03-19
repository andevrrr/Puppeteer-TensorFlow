const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(
    "https://www.awwwards.com/websites/website_category_portfolio/"
  );

  const websites = await page.evaluate(() => {
    let items = document.querySelectorAll(".js-collectable");
    let results = [];

    items.forEach((item) => {
      let title = item.querySelector("h3")?.innerText;
      let voteLink = item.querySelector("a")?.href + "#vote";
      let link = item.querySelector(".figure-rollover__bt")?.href;
      let rating = item.querySelector(
        ".figcaption-details span.score"
      )?.innerText;
      results.push({ title, voteLink, link, rating });
    });

    return results;
  });

  let websiteData = [];
  let count = 0;

  for (const website of websites) {
    try {
      await page.goto(website.voteLink, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });
      const ratings = await page.evaluate(() => {
        const elements = document.querySelectorAll(
          "#user_votes .list-jury-notes__item .grid-score__item--total"
        );
        const ratings = Array.from(elements).map((el) =>
          parseFloat(el.innerText.trim())
        );
        return ratings;
      });
      // Calculate the average rating
      const averageRating =
        ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length;

      website.averageRating = averageRating.toFixed(2); // Keeping two decimal places
      console.log(`Data for ${website.title}:`, website);
      websiteData.push(website);

      //count++;
      //if (count >= 2) break;
    } catch (error) {
      if (error.name === "TimeoutError") {
        console.log(
          `TimeoutError: Skipping ${website.title} due to a long loading time.`
        );
      } else {
        throw error;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  fs.writeFile(
    "websiteData.json",
    JSON.stringify(websiteData, null, 2),
    (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    }
  );

  await browser.close();
})();
