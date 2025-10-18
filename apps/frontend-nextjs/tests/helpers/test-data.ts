/**
 * Test Data Generator
 * Mock data for E2E tests
 */

export const testUsers = {
  guest: {
    role: 'guest',
  },
  user: {
    email: 'test.user@mebelplace.kz',
    password: 'TestUser123!',
    role: 'buyer',
  },
  master: {
    email: 'test.master@mebelplace.kz',
    password: 'TestMaster123!',
    role: 'master',
  },
  admin: {
    email: 'test.admin@mebelplace.kz',
    password: 'TestAdmin123!',
    role: 'admin',
  },
};

export const testRequests = {
  simple: {
    title: 'Тестовая заявка на сборку мебели',
    description: 'Нужно собрать шкаф ИКЕА в квартире',
    category: 'Сборка мебели',
  },
  withBudget: {
    title: 'Ремонт кухонного гарнитура',
    description: 'Требуется починить дверцу',
    category: 'Ремонт',
    budget: 15000,
  },
};

export const testMessages = {
  simple: 'Привет! Это тестовое сообщение',
  withEmoji: 'Отлично! 👍',
  long: 'Это очень длинное сообщение '.repeat(20),
};

export function generateRandomEmail(): string {
  return `test.${Date.now()}@mebelplace.kz`;
}

export function generateRandomPhone(): string {
  return `+77${Math.floor(Math.random() * 900000000 + 100000000)}`;
}

