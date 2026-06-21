import { test, expect } from '@playwright/test';

test.use({
  storageState: 'playwright/.auth/user.json'
});

test('CP005 - Crear reporte de falla para una máquina existente', async ({ page }) => {
  // 1. Ir directamente a la sección de máquinas
  await page.goto('http://localhost:5173/maquinas');
  
  // Colapsamos el menú para interactuar mejor con la pantalla
  await page.getByRole('button', { name: 'Colapsar menú' }).click();

  // 2. Seleccionar la máquina creada anteriormente (TAB-04)
  // Forzamos a que busque la celda específica por su nombre/código exacto
  const celdaMaquina = page.getByRole('cell', { name: 'TAB-04' }).or(page.getByText('TAB-04'));
  await celdaMaquina.waitFor({ state: 'visible', timeout: 5000 });
  await celdaMaquina.click();

  // 3. Verificar que se abrió el panel o vista de la máquina correcta
  await expect(page.getByRole('heading', { name: /TAB-04/i })).toBeVisible({ timeout: 5000 });

  // 4. Abrir el formulario de reporte de falla
  await page.getByRole('button', { name: 'Reportar Falla' }).click();
  await expect(page.getByRole('heading', { name: /Reportar Falla/i })).toBeVisible();

  // --- MANEJO DEL COMBOBOX (Tipo de Falla) ---
  // Hacemos clic en el combobox, tipeamos "Otro" y presionamos Enter para asegurar el estado en React
  await page.getByRole('combobox').click();
  await page.getByRole('combobox').pressSequentially('Otro', { delay: 100 });
  await page.keyboard.press('Enter');

  // 5. Seleccionar la prioridad (Baja)
  await page.getByRole('button', { name: 'Baja' }).click();

  // 6. Completar la descripción de la falla
  const inputDescripcion = page.getByRole('textbox', { name: /Describa brevemente/i });
  await inputDescripcion.click();
  await inputDescripcion.pressSequentially('Hace ruido la correa del motor principal.', { delay: 50 });

  // Pausa de seguridad antes de enviar para que React procese los datos del formulario
  await page.waitForTimeout(500);

  // 7. Enviar el reporte
  await page.getByRole('button', { name: 'ENVIAR REPORTE' }).click();

  // --- VERIFICACIÓN EN ÓRDENES DE TRABAJO ---
  
  // 8. Navegar a la sección de Órdenes para comprobar que se generó la alerta/orden
  await page.getByRole('link', { name: 'Órdenes' }).click();
  
  // Verificamos que la orden asociada a la máquina TAB-04 sea visible en el listado general
  await expect(page.getByRole('heading', { name: /TAB-04/i }).or(page.getByText('TAB-04'))).toBeVisible({ timeout: 10000 });
});