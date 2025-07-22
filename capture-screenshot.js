const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureScreenshot() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to the generate page
    await page.goto('http://localhost:5000/generate', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1920,
        height: 1080
      }
    });
    
    // Save to attached_assets folder
    const outputPath = path.join(__dirname, 'attached_assets', 'generate-swms-preview.png');
    fs.writeFileSync(outputPath, screenshot);
    
    console.log('Screenshot saved to:', outputPath);
    
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

captureScreenshot();