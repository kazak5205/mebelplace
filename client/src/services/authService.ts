import { apiService } from './api'
import { User } from '../types'

interface LoginResponse {
  user: User
  // ✅ Токены теперь в httpOnly cookies, не возвращаются в JSON
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
    const response = await apiService.post<any>('/auth/login', { phone, password })
    // ✅ Токены в httpOnly cookies, не нужен localStorage
    return response
  },

  async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await apiService.post<any>('/auth/register', userData)
    // ✅ Токены в httpOnly cookies, не нужен localStorage
    return response
  },

  async refreshToken(): Promise<{ user: User }> {
    // ✅ RefreshToken в httpOnly cookie, не передаём в body
    return apiService.post('/auth/refresh', {})
  },

  async logout(): Promise<void> {
    // ✅ Cookies очищаются на backend
    await apiService.post<void>('/auth/logout', {})
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
