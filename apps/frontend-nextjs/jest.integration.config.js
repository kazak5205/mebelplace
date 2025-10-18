const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  displayName: 'integration',
  testEnvironment: 'node', // Node environment для реальных HTTP запросов
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  testMatch: [
    '**/__tests__/**/*.integration.test.[jt]s?(x)',
    '**/?(*.)+(integration.spec|integration.test).[jt]s?(x)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000, // 30 секунд для интеграционных тестов
  maxWorkers: 1, // Один воркер чтобы избежать конфликтов
}

module.exports = createJestConfig(customJestConfig)

