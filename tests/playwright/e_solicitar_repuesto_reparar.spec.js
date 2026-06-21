import { test, expect } from '@playwright/test';

test.use({
  storageState: 'playwright/.auth/user.json'
});

test('CP008 - Flujo completo de reparación: Pedir repuesto, diagnosticar y finalizar tarea', async ({ page }) => {
  // 1. Ir al dashboard (entra logueado como Matías)
  await page.goto('http://localhost:5173/dashboard');
  await page.getByRole('button', { name: 'Colapsar menú' }).click();

  // 2. PROCESO DE LOGOUT (Salir de Admin)
  const botonPerfilHeader = page.locator('//*[@id="root"]/div/div[2]/header/div/div[2]/button');
  await botonPerfilHeader.waitFor({ state: 'visible', timeout: 5000 });
  await botonPerfilHeader.click();

  const botonLogout = page.getByRole('button', { name: /cerrar sesión|logout/i }).or(page.getByText(/cerrar sesión/i));
  await botonLogout.waitFor({ state: 'visible', timeout: 3000 });
  await botonLogout.click();

  await page.waitForURL('http://localhost:5173/login');

  // 3. PROCESO DE LOGIN (Entrar como Técnico Kevin)
  await page.locator('input[type="email"]').fill('kevin@motoresarg.com');
  await page.locator('input[type="password"]').fill('password123');
  await page.getByRole('button', { name: 'INGRESAR', exact: true }).click();

  await page.waitForURL('http://localhost:5173/dashboard');

  // 4. IR A ÓRDENES ASIGNADAS
  await page.getByRole('link', { name: 'Órdenes' }).click();

  // 5. SELECCIONAR LA ORDEN DE LA MÁQUINA (TAB-03) Y VER DETALLE
  const ordenAsignada = page.getByRole('heading', { name: /TAB-03/i }).or(page.getByText('TAB-03'));
  await expect(ordenAsignada.first()).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Detail' }).or(page.getByRole('button', { name: 'Detalle' })).first().click();

  // VERIFICACIÓN: Nos aseguramos de que el modal de detalle se abrió
  await expect(page.getByRole('heading', { name: /Detalle de Orden/i })).toBeVisible({ timeout: 5000 });

  // ACCIÓN CLAVE: Cerramos el modal de Detalle para limpiar los backdrops oscuros de la pantalla
  const botonCerrarDetalle = page.getByRole('button', { name: /close|cerrar/i }).or(page.locator('button:has(svg)').last());
  await botonCerrarDetalle.click();

  // =================================================================
  // 6. PEDIR REPUESTO (Con la pantalla completamente limpia y despejada)
  // =================================================================
  const botonRepuesto = page.getByRole('button', { name: /Pedir Repuesto|Solicitar Repuesto/i }).first();
  await botonRepuesto.waitFor({ state: 'visible', timeout: 5000 });
  await botonRepuesto.click();
  
  // --- MANEJO DEL SELECT DE REPUESTOS ---
  const selectorRepuesto = page.locator('select').first();
  await selectorRepuesto.waitFor({ state: 'visible', timeout: 5000 });
  await selectorRepuesto.selectOption({ index: 3 });

  await page.waitForTimeout(300);

  // Cantidad (Spinbutton): Clic de foco para asegurar validaciones de React
  await page.getByRole('spinbutton').click();
  
  // Enviamos la solicitud de la pieza
  await page.getByRole('button', { name: 'PEDIR PIEZA' }).click();
});