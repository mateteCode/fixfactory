// tests/playwright/auth.setup.js
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('Autenticar usuario y guardar sesión', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.locator('input[type="email"]').fill('matias@motoresarg.com');
  await page.locator('input[type="password"]').fill('password123');
  await page.getByRole('button', { name: 'INGRESAR', exact: true }).click();

  await page.waitForURL('http://localhost:5173/dashboard');

  // Guardamos las cookies para que queden listas para 'chromium'
  await page.context().storageState({ path: authFile });
});