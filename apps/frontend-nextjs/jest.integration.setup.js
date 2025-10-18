// Setup для интеграционных тестов

// Установка переменных окружения
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8082/api/v2'
process.env.TEST_API_URL = 'http://localhost:8082/api/v2'

// Mock для localStorage в Node окружении
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// Mock для fetch в Node
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

// Увеличенный timeout для интеграционных тестов
jest.setTimeout(30000)

