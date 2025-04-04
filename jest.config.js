/**
 * Configuração do Jest para testes TypeScript
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  collectCoverage: false, // Desativado por enquanto
  testTimeout: 60000, // Timeout de 60 segundos para os testes (considerando carga de página)
  setupFilesAfterEnv: [],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
}; 