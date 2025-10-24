import { apiService } from './api'
import { User } from '../types'

interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

interface RegisterData {
  phone: string
  username: string
  password: string
  firstName?: string
  lastName?: string
  role?: 'user' | 'master' | 'admin'
}

export const authService = {
  async login(phone: string, password: string): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login', { phone, password })
    // Сохраняем токены
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken)
    }
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken)
    }
    return response
  },

  async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/register', userData)
    // Сохраняем токены
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken)
    }
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken)
    }
    return response
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; user: User }> {
    return apiService.post('/auth/refresh', { refreshToken })
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken')
    await apiService.post<void>('/auth/logout', { refreshToken })
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },

  async sendSmsCode(phone: string): Promise<{ code?: string }> {
    return apiService.post('/auth/send-sms-code', { phone })
  },

  async verifySmsCode(phone: string, code: string): Promise<void> {
    return apiService.post('/auth/verify-sms', { phone, code })
  },

  async verifyPhone(phone: string, code: string): Promise<void> {
    return apiService.post('/auth/verify-phone', { phone, code })
  },

  async forgotPassword(phone: string): Promise<void> {
    return apiService.post('/auth/forgot-password', { phone })
  },

  async resetPassword(phone: string, code: string, newPassword: string): Promise<void> {
    return apiService.post('/auth/reset-password', { phone, code, newPassword })
  },

  async getCurrentUser(): Promise<User> {
    return apiService.get('/auth/me')
  },

  async updateProfile(userData: { firstName?: string; lastName?: string; phone?: string; avatar?: string }): Promise<User> {
    return apiService.put('/auth/profile', userData)
  }
}
