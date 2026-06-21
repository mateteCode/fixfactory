import { test, expect } from '@playwright/test';

test.use({
  storageState: 'playwright/.auth/user.json'
});

test('CP009 - Continuación de reparación: Retomar orden y finalizar tarea sin pedir repuesto', async ({ page }) => {
  // 1. Ir al dashboard (entra logueado automáticamente como Matías Admin)
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

  // =================================================================
  // 5. LOCALIZAR LA FILA ESPECÍFICA DE NUESTRA MÁQUINA (TAB-03)
  // =================================================================
  // Buscamos el contenedor exacto (fila/tarjeta) que tiene el texto TAB-03
  const filaOrden = page.locator('div,tr').filter({ hasText: /TAB-03/i }).first();
  await expect(filaOrden).toBeVisible({ timeout: 5000 });

  // =================================================================
  // 6. MANEJO INTELIGENTE DESDE LA LISTA (SIN ENTRAR A DETALLE)
  // =================================================================
  // Acotamos la búsqueda de los botones para que actúen SÓLO dentro de la fila de TAB-03
  const botonRetomar = filaOrden.getByRole('button', { name: /Retomar Reparación|Iniciar Reparación/i }).first();
  
  // Usamos el XPath exacto que me pasaste para el botón de Finalizar
  const botonFinalizar = page.locator('//*[@id="root"]/div/div[2]/main/div/div/div[2]/div[1]/div[2]/button[3]');

  // Micro-pausa para que asiente el render de la lista
  await page.waitForTimeout(500);

  // Si el botón Retomar está visible en esa fila, lo clickeamos
  if (await botonRetomar.isVisible()) {
    await botonRetomar.click({ force: true });
    // Damos tiempo a que cambie el estado y se re-renderice la fila con el botón "Finalizar"
    await page.waitForTimeout(1000);
  }

  // =================================================================
  // 7. FINALIZAR Y ESCRIBIR CONCLUSIÓN
  // =================================================================
  // Esperamos que el botón Finalizar esté listo y visible en la interfaz principal
  await botonFinalizar.waitFor({ state: 'visible', timeout: 5000 });
  await botonFinalizar.click({ force: true }); 
  
  // SOLUCIÓN EXACTA: Usamos el XPath directo al textarea que me pasaste
  const inputConclusion = page.locator('//*[@id="root"]/div/div[2]/main/div/div/div[3]/div/form/textarea');
  
  // Esperamos 5 segundos a que el modal/formulario termine de abrirse y el textarea sea visible
  await inputConclusion.waitFor({ state: 'visible', timeout: 5000 });
  await inputConclusion.click();
  
  // Limpiamos el campo por seguridad y tipeamos "correa cambiada"
  await inputConclusion.fill('');
  await inputConclusion.pressSequentially('correa cambiada', { delay: 30 });

  // Pausa corta antes de enviar el formulario final
  await page.waitForTimeout(500); 

  // =================================================================
  // 8. CIERRE FINAL DE LA TAREA (Con tu XPath exacto)
  // =================================================================
  const botonCerrarTarea = page.locator('//*[@id="root"]/div/div[2]/main/div/div/div[3]/div/form/button');
  await botonCerrarTarea.waitFor({ state: 'visible', timeout: 3000 });
  await botonCerrarTarea.click({ force: true }); // Forzado por si el modal tiene delay de cierre

  // Verificación final: Comprobar que la orden guardó la conclusión o pasó a la lista como cerrada
  await expect(page.getByText(/Finalizado|Cerrado|correa cambiada/i).first()).toBeVisible({ timeout: 10000 });
});