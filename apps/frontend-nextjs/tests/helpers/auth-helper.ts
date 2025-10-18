/**
 * Authentication Test Helper
 * Common auth utilities for E2E tests
 */

import { Page } from '@playwright/test';

export async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForTimeout(1000);
  
  const emailInput = page.locator('input[type="email"], input[name*="email"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  
  if (await emailInput.isVisible() && await passwordInput.isVisible()) {
    await emailInput.fill(email);
    await passwordInput.fill(password);
    
    const submitButton = page.getByRole('button', { name: /login|войти/i }).first();
    await submitButton.click();
    
    await page.waitForTimeout(2000);
  }
}

export async function logout(page: Page) {
  const menuButton = page.locator('button[aria-label*="menu"], [data-testid*="menu"]').first();
  
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await page.waitForTimeout(500);
    
    const logoutButton = page.locator('button, a').filter({ hasText: /logout|выйти/i }).first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(1000);
    }
  }
}

export async function isLoggedIn(page: Page): Promise<boolean> {
  const profileLink = page.locator('a[href*="/profile"], button').filter({ hasText: /profile|профиль/i }).first();
  const avatarButton = page.locator('button[aria-label*="profile"], img[alt*="avatar"]').first();
  
  return (await profileLink.isVisible()) || (await avatarButton.isVisible());
}

export async function clearAuth(page: Page) {
  await page.context().clearCookies();
  await page.context().clearPermissions();
}

