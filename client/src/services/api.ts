/**
 * Client API configuration using shared ApiClient
 */
import { ApiClient } from '@shared/utils/api'

export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'https://mebelplace.com.kz/api',
  timeout: 10000,
  getToken: () => localStorage.getItem('authToken'),
  onUnauthorized: () => {
    localStorage.removeItem('authToken')
    window.location.href = '/login'
  },
})

// Legacy export for backward compatibility
export const apiService = apiClient
