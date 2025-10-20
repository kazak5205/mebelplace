import { apiService } from './api'
import { User } from '../types'

interface LoginResponse {
  user: User
  token: string
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: 'client' | 'master'
  specialties?: string[]
  location?: {
    city: string
    region: string
  }
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/auth/login', { email, password })
  },

  async register(userData: RegisterData): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/auth/register', userData)
  },

  async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/auth/me')
  },

  async updateUser(userData: Partial<User>): Promise<User> {
    return apiService.put<User>('/auth/profile', userData)
  },

  async refreshToken(): Promise<{ token: string }> {
    return apiService.post<{ token: string }>('/auth/refresh')
  },

  async logout(): Promise<void> {
    return apiService.post<void>('/auth/logout')
  }
}
