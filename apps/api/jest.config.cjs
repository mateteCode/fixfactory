module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/**/*.test.ts"],
  clearMocks: true,

  // Le decimos a Jest que ignore las extensiones ".js" en los imports
  // y busque directamente el archivo ".ts" original
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  // Forzamos la compilación a CommonJS solo para el entorno de pruebas
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
        },
      },
    ],
  },
};
