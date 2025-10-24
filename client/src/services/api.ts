import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ApiResponse } from '../types'

class ApiService {
  private api: AxiosInstance

  // Transform snake_case to camelCase
  private transformKeys(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.transformKeys(item))
    }
    if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
      return Object.keys(obj).reduce((result, key) => {
        // Преобразуем ключ в camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
        // Используем camelCase ключ, рекурсивно трансформируем значение
        result[camelKey] = this.transformKeys(obj[key])
        
        // ВАЖНО: сохраняем ОРИГИНАЛЬНЫЙ ключ тоже для обратной совместимости
        // (некоторые компоненты ожидают snake_case)
        if (key !== camelKey) {
          result[key] = this.transformKeys(obj[key])
        }
        
        return result
      }, {} as any)
    }
    return obj
  }

  constructor() {
    this.api = axios.create({
      baseURL: 'https://mebelplace.com.kz/api',
      timeout: 30000, // Увеличен для загрузки видео
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle errors and refresh token
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Debug logging
        if (response.config.url?.includes('/orders/')) {
          console.log('🔍 API Response URL:', response.config.url)
          console.log('🔍 API Response RAW data:', response.data?.data)
        }
        
        // Transform snake_case keys to camelCase
        if (response.data?.data) {
          response.data.data = this.transformKeys(response.data.data)
          
          // Debug after transform
          if (response.config.url?.includes('/orders/')) {
            console.log('🔍 API Response AFTER transform:', response.data.data)
          }
        }
        return response
      },
      async (error) => {
        const originalRequest = error.config

        // Если 401 и это не повторный запрос
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            // Пытаемся обновить токен
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
              const response = await axios.post('https://mebelplace.com.kz/api/auth/refresh', {
                refreshToken
              })
              
              const newAccessToken = response.data.data.accessToken
              localStorage.setItem('accessToken', newAccessToken)
              
              // Повторяем оригинальный запрос с новым токеном
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
              return this.api(originalRequest)
            }
          } catch (refreshError) {
            // Если refresh не удался - разлогиниваем
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get<ApiResponse<T>>(url, { params })
    return response.data.data
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<ApiResponse<T>>(url, data)
    return response.data.data
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put<ApiResponse<T>>(url, data)
    return response.data.data
  }

  async delete<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.delete<ApiResponse<T>>(url, { data })
    return response.data.data
  }

  async upload<T>(url: string, formData: FormData): Promise<T> {
    const response = await this.api.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  }
}

export const apiService = new ApiService()
