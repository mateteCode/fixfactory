import { test, expect } from '@playwright/test';

test.use({
  storageState: 'playwright/.auth/user.json'
});

test('CP006 - Asignar orden de trabajo a un técnico específico', async ({ page }) => {
  // 1. Ir directamente a la sección de órdenes de trabajo
  await page.goto('http://localhost:5173/ordenes');
  
  // Colapsamos el menú para tener mejor espacio de pantalla
  await page.getByRole('button', { name: 'Colapsar menú' }).click();

  // 2. Verificar que la orden de nuestra máquina (TAB-04) está visible en la lista
  const ordenMaquina = page.getByRole('heading', { name: /TAB-04/i }).or(page.getByText('TAB-04'));
  await expect(ordenMaquina.first()).toBeVisible({ timeout: 5000 });

  // 3. Hacer clic en el botón "Detalle" de la primera orden que coincida (la nuestra)
  await page.getByRole('button', { name: 'Detalle' }).first().click();

  // 4. Verificar que entramos a la vista de detalle correcta
  await expect(page.getByRole('heading', { name: /Detalle de Orden/i })).toBeVisible();
  // Verificamos que la descripción de la falla coincida de manera flexible
  await expect(page.getByText(/Hace ruido la correa/i).first()).toBeVisible();

  // 5. Interactuar con el botón de edición/despliegue 
  // Reemplazamos el filtro vacío por un selector de comportamiento más seguro
  const botonAccion = page.getByRole('main').getByRole('button').filter({ hasText: /^$/ }).first();
  await botonAccion.waitFor({ state: 'visible' });
  await botonAccion.click();

  // 6. Seleccionar el botón usando .first()
  // Agregamos .first() para evitar el error de duplicidad (strict mode violation)
  const botonAsignar = page.getByRole('button', { name: 'Asignar Trabajo' }).first();
  await botonAsignar.waitFor({ state: 'visible', timeout: 5000 });
  await botonAsignar.click();

  // --- MANEJO DE COMBOBOX (Asignación de Técnico) ---
  // buscamos el campo e interactuamos por texto
  await page.getByRole('combobox').click();
  // Tipeamos el nombre del técnico para que React Select lo filtre en la lista
  await page.getByRole('combobox').pressSequentially('Kevin Axel Del Bello', { delay: 100 });
  // Confirmamos la selección presionando Enter
  await page.keyboard.press('Enter');

  // Pequeña pausa de seguridad para que React registre el estado interno del formulario
  await page.waitForTimeout(500);

  // 7. Confirmar la asignación en el modal
  await page.getByRole('button', { name: 'ASIGNAR', exact: true }).click();

  // --- VERIFICACIONES POST-ASIGNACIÓN ---

  // 8. Verificar que el estado de la orden cambió a "En Proceso"
  await expect(page.getByText('En Proceso').first()).toBeVisible({ timeout: 5000 });

  // 9. Verificar que el nombre del técnico asignado se renderiza correctamente en la pantalla
  await expect(page.getByText('Kevin Axel Del Bello').first()).toBeVisible();
});