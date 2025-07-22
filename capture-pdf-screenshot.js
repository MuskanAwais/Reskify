const puppeteer = require('puppeteer');
const fs = require('fs');

async function capturePDFScreenshot() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  
  try {
    // Navigate to the PDF preview
    await page.goto('http://localhost:5000/api/swms/pdf-preview/142', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    // Wait a moment for PDF to render
    await page.waitForTimeout(2000);
    
    // Capture screenshot
    await page.screenshot({
      path: 'pdf-screenshot-page1.png',
      fullPage: false,
      type: 'png'
    });
    
    console.log('PDF screenshot captured successfully');
    
  } catch (error) {
    console.error('Error capturing PDF screenshot:', error);
  } finally {
    await browser.close();
  }
}

capturePDFScreenshot();