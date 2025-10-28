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
      withCredentials: true, // ✅ Отправляем cookies с каждым запросом
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // ✅ Request interceptor не нужен (токены в httpOnly cookies)

    // Response interceptor to handle errors and refresh token
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Transform snake_case keys to camelCase
        if (response.data?.data) {
          response.data.data = this.transformKeys(response.data.data)
        }
        return response
      },
      async (error) => {
        // Не делаем автоматический refresh - просто возвращаем ошибку
        // Refresh будет вызываться только явно когда нужно
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
