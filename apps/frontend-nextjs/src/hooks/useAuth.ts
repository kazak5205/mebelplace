'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState, AppDispatch } from '@/store/store'
import { loginStart, loginSuccess, loginFailure, logout } from '@/store/slices/authSlice'
import { apiService } from '@/services/api'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

/**
 * @deprecated Используйте хуки из @/lib/api/hooks/useAuth вместо этого
 * - useLogin() для логина
 * - useRegister() для регистрации  
 * - useLogout() для выхода
 * - useCurrentUser() для получения текущего пользователя
 * 
 * Этот хук будет удалён в следующей версии.
 */
export function useAuth() {
  // DEPRECATED: Use hooks from @/lib/api/hooks/useAuth instead
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { user, token, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)
  
  const [isInitialized, setIsInitialized] = useState(false)

  // Инициализация при загрузке (только один раз)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = apiService.getToken()
        if (savedToken) {
          try {
            // Проверяем валидность токена
            const userData = await apiService.getProfile()
            dispatch(loginSuccess({
              user: userData.user || userData,
              token: savedToken,
              refreshToken: savedToken // Временно используем тот же токен
            }))
          } catch (error) {
            // Токен недействителен, очищаем
            console.warn('Token validation failed:', error)
            apiService.clearToken()
            dispatch(logout())
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    // Выполняем инициализацию только если еще не инициализирован
    if (!isInitialized) {
      initAuth()
    }
  }, []) // Убираем dispatch из зависимостей

  const login = async (email: string, password: string) => {
    try {
      dispatch(loginStart())
      const response = await apiService.login(email, password)
      
      dispatch(loginSuccess({
        user: response.user,
        token: response.token,
        refreshToken: response.token
      }))
      
      apiService.setToken(response.token)
      toast.success('Успешный вход в систему')
      router.push('/')
      
      return response
    } catch (error: any) {
      dispatch(loginFailure())
      const errorMessage = error.response?.data?.error || 'Пользователь не зарегистрирован'
      toast.error(errorMessage)
      throw error
    }
  }

  const register = async (data: {
    name: string
    email_or_phone: string
    password: string
    confirm_password?: string
    role?: string
    region?: string
    agree_to_terms?: boolean
  }) => {
    try {
      dispatch(loginStart())
      const response = await apiService.register(data)
      
      dispatch(loginSuccess({
        user: response.user,
        token: response.token,
        refreshToken: response.token
      }))
      
      apiService.setToken(response.token)
      toast.success('Регистрация прошла успешно')
      router.push('/')
      
      return response
    } catch (error: any) {
      dispatch(loginFailure())
      const errorMessage = error.response?.data?.error || 'Ошибка регистрации'
      toast.error(errorMessage)
      throw error
    }
  }

  const logoutUser = async () => {
    try {
      await apiService.logout()
      dispatch(logout())
      apiService.clearToken()
      toast.success('Вы вышли из системы')
      router.push('/')
    } catch (error) {
      // Даже если запрос не удался, очищаем локальное состояние
      dispatch(logout())
      apiService.clearToken()
      router.push('/')
    }
  }

  const refreshToken = async () => {
    try {
      const response = await apiService.refreshToken()
      dispatch(loginSuccess({
        user: response.user,
        token: response.token,
        refreshToken: response.token
      }))
      apiService.setToken(response.token)
      return response
    } catch (error) {
      dispatch(logout())
      apiService.clearToken()
      throw error
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    register,
    logout: logoutUser,
    refreshToken,
  }
}
