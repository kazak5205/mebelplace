import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'
import { authService } from '../services/authService'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isClient: boolean
  isMaster: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: { email: string; username: string; password: string; firstName?: string; lastName?: string; role?: 'user' | 'master' | 'admin' }) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (accessToken && refreshToken) {
          // Получаем данные текущего пользователя
          // Если accessToken истек, api.ts автоматически обновит через refreshToken
          try {
            const userData = await authService.getCurrentUser()
            setUser(userData)
          } catch (error) {
            console.error('Failed to get current user:', error)
            // Если не получилось - очищаем токены
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      // Токены уже сохранены в authService.login
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: { email: string; username: string; password: string; firstName?: string; lastName?: string; role?: 'user' | 'master' | 'admin' }) => {
    try {
      const response = await authService.register(userData)
      // Токены уже сохранены в authService.register
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      // Токены уже удалены в authService.logout
    } catch (error) {
      console.error('Logout error:', error)
      // Всё равно очищаем токены локально
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setUser(null)
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        avatar: userData.avatar
      })
      setUser(updatedUser)
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isClient: user?.role === 'user', // Роль 'user' (не 'client')
    isMaster: user?.role === 'master',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
