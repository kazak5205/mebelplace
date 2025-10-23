import React from 'react'
import { motion } from 'framer-motion'
import Header from './Header'
import BottomNavigation from './BottomNavigation'
import Footer from './Footer'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 max-w-md w-full mx-4"
          >
            <h1 className="text-2xl font-bold text-center mb-6 gradient-text">
              Добро пожаловать в MebelPlace
            </h1>
            <p className="text-center text-white/70 mb-8">
              Пожалуйста, войдите в систему для продолжения
            </p>
            <div className="space-y-4">
              <button className="w-full glass-button">
                Войти
              </button>
              <button className="w-full glass-button">
                Зарегистрироваться
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Header />
      <main className="flex-1 pb-20 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
      <BottomNavigation />
    </div>
  )
}

export default Layout
