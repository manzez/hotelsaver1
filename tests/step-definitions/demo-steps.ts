import { Given, When, Then, Before, After, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { expect } from '@playwright/test';

// Simple world class for demo
class DemoWorld {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;

  async init() {
    console.log('🚀 Starting browser...');
    this.browser = await chromium.launch({ 
      headless: false, // Show browser window
      slowMo: 2000,    // Slow down actions so you can see them
      args: ['--start-maximized'] // Start maximized
    });
    
    this.context = await this.browser.newContext({
      viewport: null // Use full screen
    });
    
    this.page = await this.context.newPage();
    console.log('✅ Browser started');
  }

  async cleanup() {
    console.log('🧹 Closing browser...');
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    console.log('✅ Browser closed');
  }
}

setWorldConstructor(DemoWorld);

// Hooks
Before(async function (this: DemoWorld) {
  await this.init();
});

After(async function (this: DemoWorld) {
  await this.cleanup();
});

// Steps
Given('I open a browser', async function (this: DemoWorld) {
  // Browser is already opened in Before hook
  console.log('Browser is ready for testing');
});

When('I navigate to the HotelSaver homepage', async function (this: DemoWorld) {
  console.log('🌐 Navigating to HotelSaver...');
  
  try {
    await this.page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✅ Page loaded successfully');
  } catch (error) {
    console.log('❌ Failed to load page:', error);
    
    // Try alternative approach - navigate to a working site first
    console.log('🔄 Trying to navigate to Google as fallback...');
    await this.page.goto('https://www.google.com', { waitUntil: 'networkidle' });
    console.log('✅ Fallback navigation successful');
    
    // Wait a moment so you can see it
    await this.page.waitForTimeout(3000);
    
    throw new Error(`Could not connect to localhost:3001 - ${error}`);
  }
});

Then('I should see the page content', async function (this: DemoWorld) {
  console.log('🔍 Checking page content...');
  
  // Wait a moment so you can see the page
  await this.page.waitForTimeout(5000);
  
  const title = await this.page.title();
  console.log('📄 Page title:', title);
  
  // Take a screenshot for demonstration
  await this.page.screenshot({ 
    path: 'tests/demo-screenshot.png', 
    fullPage: true 
  });
  console.log('📸 Screenshot saved');
  
  // Basic validation
  expect(title).toBeTruthy();
  console.log('✅ Page validation successful');
});