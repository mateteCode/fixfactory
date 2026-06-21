// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  /* Ejecutar tests en paralelo */
  fullyParallel: true,
  /* Reportero en formato HTML */
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },

  /* Configuración de Proyectos */
  projects: [
    // 1. Proyecto inicial para guardar la sesión
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
    },

    // 2. Proyecto principal de pruebas (Chromium)
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Usamos un string directo con la ruta relativa estándar
        storageState: './playwright/.auth/user.json',
      },
      // Depende del setup obligatoriamente
      dependencies: ['setup'],
    },
  ],
});