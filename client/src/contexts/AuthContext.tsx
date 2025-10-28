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
  login: (phone: string, password: string) => Promise<void>
  sendSmsCode: (phone: string) => Promise<{ code?: string }>
  verifySmsCode: (phone: string, code: string) => Promise<void>
  register: (userData: { phone: string; username: string; password: string; firstName?: string; lastName?: string; role?: 'user' | 'master' | 'admin' }) => Promise<void>
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
        // ✅ Токены в httpOnly cookies, просто проверяем текущего юзера
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          // Не залогинен или токен истёк
          console.log('Not authenticated')
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (phone: string, password: string) => {
    try {
      const response = await authService.login(phone, password)
      // Токены уже сохранены в loginService
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const sendSmsCode = async (phone: string) => {
    try {
      return await authService.sendSmsCode(phone)
    } catch (error) {
      throw error
    }
  }

  const verifySmsCode = async (phone: string, code: string) => {
    try {
      await authService.verifySmsCode(phone, code)
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: { phone: string; username: string; password: string; firstName?: string; lastName?: string; role?: 'user' | 'master' | 'admin' }) => {
    try {
      const response = await authService.register(userData)
      // Токены уже сохранены в registerService
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      // ✅ Cookies очищаются на backend
    } catch (error) {
      console.error('Logout error:', error)
      // ✅ Cookies очищаются на backend
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
    sendSmsCode,
    verifySmsCode,
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
