import { test, expect } from '@playwright/test';

// sesión por defecto de Matías (Admin)
test.use({
  storageState: 'playwright/.auth/user.json'
});

test('CP007 - Técnico realiza el diagnóstico de la orden asignada', async ({ page }) => {
  // 1. Ir al dashboard (entra logueado como Matías)
  await page.goto('http://localhost:5173/dashboard');
  await page.getByRole('button', { name: 'Colapsar menú' }).click();

  // 2. PROCESO DE LOGOUT (Salir de Admin)
  
  // Primero hacemos clic en el botón de perfil del header usando el selector preciso
  const botonPerfilHeader = page.locator('//*[@id="root"]/div/div[2]/header/div/div[2]/button');
  await botonPerfilHeader.waitFor({ state: 'visible', timeout: 5000 });
  await botonPerfilHeader.click();

  // Ahora que el menú se desplegó y el botón es visible, hacemos el clic real en Cerrar Sesión
  const botonLogout = page.getByRole('button', { name: /cerrar sesión|logout/i }).or(page.getByText(/cerrar sesión/i));
  await botonLogout.waitFor({ state: 'visible', timeout: 3000 });
  await botonLogout.click();

  // Esperamos volver a la pantalla de login limpia
  await page.waitForURL('http://localhost:5173/login');

  // 3. PROCESO DE LOGIN (Entrar como Técnico Kevin)
  await page.locator('input[type="email"]').fill('kevin@motoresarg.com');
  await page.locator('input[type="password"]').fill('password123');
  await page.getByRole('button', { name: 'INGRESAR', exact: true }).click();

  // Esperamos entrar al dashboard de Kevin
  await page.waitForURL('http://localhost:5173/dashboard');

  // 4. IR A ÓRDENES ASIGNADAS
  await page.getByRole('link', { name: 'Órdenes' }).click();

  // 5. SELECCIONAR LA ORDEN DE LA MÁQUINA (TAB-04)
  const ordenAsignada = page.getByRole('heading', { name: /TAB-04/i }).or(page.getByText('TAB-04'));
  await expect(ordenAsignada.first()).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Detalle' }).first().click();
  
  // Apuntamos al botón para que sea un elemento clickeable válido
  const botonCerrar = page.locator('//*[@id="root"]/div/div[2]/main/div/div/div[3]/div/div[1]/button');
  await botonCerrar.waitFor({ state: 'visible', timeout: 5000 });
  await botonCerrar.click();
  
  // 6. CREAR EL DIAGNÓSTICO
  // Si al cerrar el detalle volviste a la lista de órdenes, asegúrate de que el botón de diagnóstico esté visible.
  // Usamos un selector flexible para encontrar el botón de diagnóstico en la fila o tarjeta correspondiente
  const botonDiagnostico = page.getByRole('button', { name: /diagnóstico|diagnosticar|añadir informe/i }).first();
  await botonDiagnostico.waitFor({ state: 'visible', timeout: 5000 });
  await botonDiagnostico.click();

  // Completamos la descripción técnica del diagnóstico
  const inputDiagnostico = page.getByRole('textbox', { name: /detalla|descripción|diagnóstico/i }).or(page.getByPlaceholder(/Detalla el problema encontrado|descripción/i)).first();
  await inputDiagnostico.click();
  await inputDiagnostico.pressSequentially('Se constató desgaste en la correa de distribución por fricción. Requieres reemplazo inmediato.', { delay: 30 });

  // Pausa humana para asegurar el estado en React
  await page.waitForTimeout(500);

  // 7. ENVIAR DIAGNÓSTICO / GUARDAR
  await page.getByRole('button', { name: /guardar|enviar|registrar/i }).first().click();

  // 8. VERIFICACIÓN: El estado de la orden debería cambiar o figurar el texto en pantalla
  await expect(page.getByText(/Se constató desgaste en la correa/i).first()).toBeVisible({ timeout: 10000 });
});