/**
 * Wait Helpers for E2E tests
 * Utilities to handle async operations
 */

import { Page } from '@playwright/test';

export async function waitForPageReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
}

export async function waitForApiCall(page: Page, urlPattern: string | RegExp) {
  await page.waitForResponse(response => {
    const url = response.url();
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern);
    }
    return urlPattern.test(url);
  }, { timeout: 5000 }).catch(() => null);
}

export async function waitForElement(page: Page, selector: string, timeout: number = 5000) {
  try {
    await page.locator(selector).first().waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

export async function retryUntilVisible(page: Page, selector: string, retries: number = 3) {
  for (let i = 0; i < retries; i++) {
    const element = page.locator(selector).first();
    
    if (await element.isVisible()) {
      return true;
    }
    
    await page.waitForTimeout(1000);
  }
  
  return false;
}

