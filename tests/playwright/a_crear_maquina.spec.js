import { test, expect } from '@playwright/test';

test.use({
  storageState: 'playwright/.auth/user.json'
});

test('CP004 - Registro exitoso de nueva máquina con manejo de estados de React', async ({ page }) => {
  // 1. Ir al dashboard y navegar a Máquinas
  await page.goto('http://localhost:5173/dashboard');
  await page.getByRole('link', { name: 'Máquinas' }).click();
  
  // Colapsamos el menú para tener mejor visibilidad
  await page.getByRole('button', { name: 'Colapsar menú' }).click();
  
  // 2. Abrir el formulario
  await page.getByRole('button', { name: 'NUEVA MÁQUINA' }).click();

  // --- MANEJO DE COMBOBOXES (React Select / Autocomplete) ---
  
  // Seleccionar la Marca
  await page.getByRole('combobox', { name: 'Ej: Siemens' }).click();
  // Usamos pressSequentially para simular el tipeo humano y que se abra el desplegable de opciones
  await page.getByRole('combobox', { name: 'Ej: Siemens' }).pressSequentially('ABB', { delay: 100 });
  // Presionamos Enter para confirmar la selección en la lista flotante de React
  await page.keyboard.press('Enter');

  // Seleccionar el Modelo
  await page.getByRole('combobox', { name: 'Ej: S7-' }).click();
  await page.getByRole('combobox', { name: 'Ej: S7-' }).pressSequentially('IRB-1200', { delay: 100 });
  await page.keyboard.press('Enter');

  // --- COMPLETAR EL RESTO DEL FORMULARIO ---
  
  // Esperamos que el input del nombre esté visible
  await expect(page.getByRole('textbox', { name: 'Ej: PLC Principal' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Ej: PLC Principal' }).fill('Robot Industrial ABB');

  // Código/Tag de la máquina
  await page.getByRole('textbox', { name: 'Ej: TAB-' }).click();
  await page.getByRole('textbox', { name: 'Ej: TAB-' }).fill('TAB-04');

  // Ubicación
  await page.getByRole('textbox', { name: 'Ej: Línea' }).click();
  await page.getByRole('textbox', { name: 'Ej: Línea' }).fill('Línea 3');

  await page.getByRole('textbox', { name: 'Ej: Sector A' }).click();
  await page.getByRole('textbox', { name: 'Ej: Sector A' }).fill('Sector B');

  // Costo y Fecha
  await page.getByPlaceholder('0.00').click();
  await page.getByPlaceholder('0.00').fill('15000.00'); // Le ponemos un valor numérico real por las dudas
  await page.locator('input[type="date"]').fill('2026-06-20');

  // Especificaciones y Notas de Mantenimiento
  await page.getByRole('textbox', { name: 'Ej: 220V CA, Trifásico...' }).click();
  await page.getByRole('textbox', { name: 'Ej: 220V CA, Trifásico...' }).fill('6 Ejes, Alcance 900mm, Carga 7kg');

  await page.getByRole('textbox', { name: 'Ej: Revisar nivel de aceite' }).click();
  await page.getByRole('textbox', { name: 'Ej: Revisar nivel de aceite' }).fill('Lubricar juntas cada 500hs de uso.');

  // Pequeña pausa de seguridad antes de enviar para asegurar que React guardó todo en su estado interno
  await page.waitForTimeout(500);

  // 3. Registrar la Máquina
  await page.getByRole('button', { name: 'Registrar Máquina' }).click();

  // 4. VERIFICACIÓN: Esperar que el registro impacte en la UI
  // Buscamos que aparezca el tag único de la máquina (TAB-04) con margen de 10 segundos
  await expect(page.getByRole('cell', { name: 'TAB-04' }).or(page.getByText('TAB-04'))).toBeVisible({ timeout: 10000 });
});