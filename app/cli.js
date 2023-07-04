const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { performance } = require('perf_hooks');

const url = process.argv[2]; // Get the URL argument from the command line
const selectors = [
  '*[alt]',
  '*[aria-describedby], *[aria-labelledby]',
  '*[aria-label], *[aria-labelledby]',
  '*[lang]',
  'a[href], *[role="link"]',
  'abbr, acronym',
  'area',
  'button, input, meter, output, progress, select, textarea',
  'button, *[role="button"]',
  'fieldset',
  'frame, iframe',
  'img, *[role=img]',
  'legend',
  'nav, *[role=navigation]',
  'optgroup',
  'table',
  'title'
];

// Create a unique identifier based on the current microtime
const getUniqueIdentifier = () => {
  const time = performance.timeOrigin || Date.now();
  const microTime = process.hrtime()[1] / 1000;
  return `${time}-${microTime}`;
};

(async () => {
  let browser;
  let screenshotCounter = 1;
  try {
    // Launch Puppeteer and create a new browser instance with headless mode enabled
    browser = await puppeteer.launch({ headless: false });

    // Create a new page
    const page = await browser.newPage();

    // Set the page resolution to 1920x1080
    await page.setViewport({ width: 1920, height: 1080 });

    // Set the timeout to 60 seconds (1 minute)
    page.setDefaultTimeout(60000);

    // Ignore HTTP errors when loading assets
    page.on('response', (response) => {
      if (!response.ok()) {
        console.error(`Asset failed to load: ${response.url()}`);
      }
    });

    // Navigate to the specified URL
    await page.goto(url);

    await page.waitForNetworkIdle();

    // Get the absolute paths for the local scripts
    const getAccessibleNameScriptPath = path.join(process.cwd(), 'getAccessibleName.js');
    const lablrScriptPath = path.join(process.cwd(), 'lablr.js');

    // Inject the local scripts into the page
    await page.addScriptTag({ path: getAccessibleNameScriptPath });
    await page.addScriptTag({ path: lablrScriptPath });

    // Create the "screenshots" directory if it doesn't exist
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }

    // Iterate through the selectors and capture screenshots
    for (const selector of selectors) {
      const elements = await page.$$(selector);
      for (const element of elements) {
        const boundingBox = await element.boundingBox();
        if (boundingBox) {
          const screenshotOptions = {
            clip: {
              x: boundingBox.x - 20,
              y: boundingBox.y - 20,
              width: boundingBox.width + 40,
              height: boundingBox.height + 40
            }
          };
          const screenshotBuffer = await page.screenshot(screenshotOptions);
          const fileName = `${getUniqueIdentifier()}_${screenshotCounter++}.png`;
          const filePath = path.join(screenshotsDir, fileName);
          fs.writeFileSync(filePath, screenshotBuffer);
        }
      }
    }

    // Your code to interact with the page goes here

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // Close the browser
    if (browser) {
      await browser.close();
    }
    // Exit the Node.js process
    process.exit();
  }
})();
