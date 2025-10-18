// Setup для интеграционных тестов с реальным API
import axios from 'axios'

export const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:8082/api/v2'

// Создаём axios instance для тестов
export const testApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Хелперы для тестов
export async function createTestUser(index = 1) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7) // Добавляем случайную строку
  const userData = {
    name: `Test User ${index} ${random}`,
    email_or_phone: `test_${timestamp}_${index}_${random}@example.com`,
    password: 'TestPassword123!',
    role: 'buyer', // ИСПРАВЛЕНО: backend ожидает 'buyer' или 'master', не 'user'
    region: 'almaty', // ДОБАВЛЕНО: обязательное поле
    agree_to_terms: true, // ДОБАВЛЕНО: обязательное поле
  }

  try {
    const response = await testApiClient.post('/auth/register', userData)
    return {
      user: response.data.user,
      token: response.data.token,
      credentials: userData,
    }
  } catch (error: any) {
    // Если пользователь существует, создаём нового с другим индексом
    if (error.response?.status === 400) {
      console.warn(`User creation failed, retrying with different email...`)
      const newTimestamp = Date.now() + Math.floor(Math.random() * 10000)
      const newRandom = Math.random().toString(36).substring(7)
      const newUserData = {
        name: `Test User ${index} ${newRandom}`,
        email_or_phone: `test_${newTimestamp}_${index}_${newRandom}@example.com`,
        password: 'TestPassword123!',
        role: 'buyer', // ИСПРАВЛЕНО
        region: 'almaty', // ДОБАВЛЕНО
        agree_to_terms: true, // ДОБАВЛЕНО
      }
      const retryResponse = await testApiClient.post('/auth/register', newUserData)
      return {
        user: retryResponse.data.user,
        token: retryResponse.data.token,
        credentials: newUserData,
      }
    }
    throw error
  }
}

export async function deleteTestUser(token: string) {
  try {
    await testApiClient.delete('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (error) {
    // Игнорируем ошибки при удалении (пользователь может быть уже удалён)
  }
}

export async function loginTestUser(email: string, password: string) {
  const response = await testApiClient.post('/auth/login', {
    email,
    password,
  })
  return {
    user: response.data.user,
    token: response.data.token,
  }
}

export async function clearTestData(token: string) {
  // Очищаем тестовые данные после тестов
  try {
    await testApiClient.delete('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (error) {
    console.warn('Failed to clear test data:', error)
  }
}

// Проверка доступности API
export async function waitForApi(maxAttempts = 30, interval = 1000): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await testApiClient.get('/health')
      return true
    } catch (error) {
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, interval))
      }
    }
  }
  return false
}

