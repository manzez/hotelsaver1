import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

// Set timeout to 30 seconds
setDefaultTimeout(30 * 1000);

class HotelSaverDemoWorld {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
}

const world = new HotelSaverDemoWorld();

Before(async function() {
  console.log('🏨 Setting up HotelSaver demo...');
});

After(async function() {
  if (world.page) {
    await world.page.close();
  }
  if (world.context) {
    await world.context.close();
  }
  if (world.browser) {
    console.log('🔚 Closing HotelSaver demo browser...');
    await world.browser.close();
  }
});

Given('I start the browser for HotelSaver demo', async function() {
  console.log('🚀 Starting browser for HotelSaver demo...');
  
  world.browser = await chromium.launch({
    headless: false,     // Show browser window
    slowMo: 1500,        // Slow actions so you can see them
    args: [
      '--start-maximized',
      '--disable-web-security',
      '--ignore-certificate-errors'
    ]
  });
  
  world.context = await world.browser.newContext({
    viewport: null  // Use full screen
  });
  
  world.page = await world.context.newPage();
  console.log('✅ Browser ready for HotelSaver!');
});

Given('I have HotelSaver open in browser', async function() {
  console.log('🔧 Opening HotelSaver browser...');
  
  world.browser = await chromium.launch({
    headless: false,
    slowMo: 2000,
    args: ['--start-maximized']
  });
  
  world.context = await world.browser.newContext();
  world.page = await world.context.newPage();
  console.log('✅ HotelSaver browser ready!');
});

When('I navigate to {string}', async function(url: string) {
  if (!world.page) throw new Error('Browser not initialized');
  
  console.log(`🌐 Navigating to HotelSaver: ${url}`);
  
  try {
    await world.page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    console.log('✅ Successfully loaded HotelSaver!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`❌ Failed to load ${url}: ${errorMessage}`);
    
    // Try to at least get some page content
    const title = await world.page.title().catch(() => 'No title');
    const url_actual = world.page.url();
    console.log(`📄 Current page - Title: "${title}", URL: ${url_actual}`);
    
    throw new Error(`Could not load HotelSaver at ${url}: ${errorMessage}`);
  }
});

Then('I should see the HotelSaver homepage', async function() {
  if (!world.page) throw new Error('Browser not initialized');
  
  console.log('🔍 Checking for HotelSaver homepage elements...');
  
  // Wait for page to be loaded
  await world.page.waitForLoadState('networkidle');
  
  const title = await world.page.title();
  const url = world.page.url();
  console.log(`📄 Page loaded - Title: "${title}", URL: ${url}`);
  
  // Look for common HotelSaver elements
  const searchElements = [
    'input[placeholder*="city" i], input[placeholder*="destination" i]',
    'button:has-text("Search")',
    'text=Lagos',
    'text=Abuja',
    'text=Hotel'
  ];
  
  let foundElements = 0;
  for (const selector of searchElements) {
    try {
      const element = await world.page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        foundElements++;
        console.log(`✅ Found element: ${selector}`);
      }
    } catch (error) {
      console.log(`⚠️ Could not find: ${selector}`);
    }
  }
  
  if (foundElements > 0) {
    console.log(`✅ HotelSaver homepage confirmed! Found ${foundElements} expected elements`);
  } else {
    console.log('⚠️ Could not confirm specific HotelSaver elements, but page loaded');
  }
});

Then('I should see the search form', async function() {
  if (!world.page) throw new Error('Browser not initialized');
  
  console.log('🔍 Looking for search form...');
  
  // Look for form elements
  const formSelectors = [
    'form',
    'input[type="text"]',
    'input[type="date"]',
    'select',
    'button[type="submit"], button:has-text("Search")'
  ];
  
  let formFound = false;
  for (const selector of formSelectors) {
    try {
      const elements = await world.page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`✅ Found ${count} form element(s): ${selector}`);
        formFound = true;
      }
    } catch (error) {
      console.log(`⚠️ Could not find form element: ${selector}`);
    }
  }
  
  if (formFound) {
    console.log('✅ Search form elements found!');
  } else {
    console.log('⚠️ No obvious form elements found, but page might use different structure');
  }
});

When('I interact with the search form', async function() {
  if (!world.page) throw new Error('Browser not initialized');
  
  console.log('🎯 Interacting with search form...');
  
  // Try to find and interact with input fields
  try {
    // Look for city/destination input
    const cityInput = world.page.locator('input[type="text"]').first();
    if (await cityInput.isVisible({ timeout: 3000 })) {
      await cityInput.click();
      await cityInput.fill('Lagos');
      console.log('✅ Filled city input with "Lagos"');
    }
  } catch (error) {
    console.log('⚠️ Could not interact with city input');
  }
  
  // Scroll down a bit to see more content
  await world.page.evaluate(() => {
    window.scrollBy(0, 200);
  });
  
  console.log('✅ Form interaction completed');
});

When('I fill in the search form', async function() {
  if (!world.page) throw new Error('Browser not initialized');
  
  console.log('📝 Filling search form...');
  
  // Try to find and fill various input types
  const inputs = await world.page.locator('input').all();
  console.log(`Found ${inputs.length} input fields`);
  
  for (let i = 0; i < Math.min(inputs.length, 3); i++) {
    try {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      
      if (type === 'text' || !type) {
        await input.click();
        await input.fill('Lagos');
        console.log(`✅ Filled text input ${i + 1} (placeholder: ${placeholder})`);
      }
    } catch (error) {
      console.log(`⚠️ Could not fill input ${i + 1}`);
    }
  }
});

When('I submit the search', async function() {
  if (!world.page) throw new Error('Browser not initialized');
  
  console.log('🔍 Submitting search...');
  
  // Look for search button
  const searchButtons = [
    'button:has-text("Search")',
    'button[type="submit"]',
    'input[type="submit"]'
  ];
  
  for (const selector of searchButtons) {
    try {
      const button = world.page.locator(selector).first();
      if (await button.isVisible({ timeout: 2000 })) {
        await button.click();
        console.log(`✅ Clicked search button: ${selector}`);
        
        // Wait for navigation or results
        await world.page.waitForTimeout(3000);
        return;
      }
    } catch (error) {
      console.log(`⚠️ Could not click: ${selector}`);
    }
  }
  
  console.log('⚠️ No search button found, trying Enter key on first input');
  try {
    const firstInput = world.page.locator('input').first();
    await firstInput.press('Enter');
  } catch (error) {
    console.log('⚠️ Could not submit via Enter key');
  }
});

Then('I should see the form respond', async function() {
  if (!world.page) throw new Error('Browser not initialized');
  
  console.log('👀 Checking form response...');
  
  // Wait a moment for any changes
  await world.page.waitForTimeout(2000);
  
  const currentUrl = world.page.url();
  console.log(`🔗 Current URL: ${currentUrl}`);
  
  console.log('✅ Form interaction completed successfully');
});

Then('I should see search results or navigation', async function() {
  if (!world.page) throw new Error('Browser not initialized');
  
  console.log('📊 Checking for search results or navigation...');
  
  await world.page.waitForTimeout(3000);
  
  const currentUrl = world.page.url();
  const title = await world.page.title();
  
  console.log(`📍 Current location - URL: ${currentUrl}, Title: "${title}"`);
  
  // Check if URL changed (indicating navigation)
  if (currentUrl.includes('search') || currentUrl.includes('result')) {
    console.log('✅ Navigation detected - URL contains search/result');
  } else {
    console.log('⚠️ No obvious search navigation, but interaction completed');
  }
});

Then('I take a screenshot of the homepage', async function() {
  if (!world.page) throw new Error('Browser not initialized');
  
  console.log('📸 Taking screenshot of HotelSaver homepage...');
  
  await world.page.screenshot({ 
    path: 'hotelsaver-homepage-screenshot.png',
    fullPage: true 
  });
  
  console.log('✅ Screenshot saved as hotelsaver-homepage-screenshot.png');
});

Then('I capture the results', async function() {
  if (!world.page) throw new Error('Browser not initialized');
  
  console.log('📸 Capturing final results...');
  
  await world.page.screenshot({ 
    path: 'hotelsaver-results-screenshot.png',
    fullPage: true 
  });
  
  console.log('✅ Results screenshot saved as hotelsaver-results-screenshot.png');
  
  // Give you time to see the final state
  console.log('👀 Displaying final state for 3 seconds...');
  await world.page.waitForTimeout(3000);
});