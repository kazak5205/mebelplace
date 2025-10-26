import React from 'react'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  FileText, 
  Plus, 
  MessageCircle, 
  User,
  CheckSquare
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const BottomNavigation: React.FC = () => {
  const { user } = useAuth()

  // Показываем навигацию для всех пользователей
  if (!user) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex items-center justify-around py-2">
          <NavLink to="/" className="flex flex-col items-center space-y-1 p-2 text-white/70 hover:text-white transition-colors">
            <Home className="w-5 h-5" />
            <span className="text-xs">Главная</span>
          </NavLink>
          <NavLink to="/login" className="flex flex-col items-center space-y-1 p-2 text-white/70 hover:text-white transition-colors">
            <User className="w-5 h-5" />
            <span className="text-xs">Войти</span>
          </NavLink>
        </div>
      </nav>
    )
  }

  const isMaster = user?.role === 'master'
  // const isClient = user?.role === 'user'

  const navItems = [
    {
      id: 'home',
      label: 'Главная',
      icon: Home,
      path: '/',
      show: true
    },
    {
      id: 'orders',
      label: isMaster ? 'Все заявки' : 'Мои заявки',
      icon: isMaster ? CheckSquare : FileText,
      path: isMaster ? '/orders' : '/user/orders',
      show: true
    },
    {
      id: 'create',
      label: isMaster ? 'создать видеорекламу' : 'заявка всем',
      icon: Plus,
      path: isMaster ? '/create-video-ad' : '/orders/create',
      show: true,
      isCenter: true
    },
    {
      id: 'chat',
      label: 'Мессенджер',
      icon: MessageCircle,
      path: '/chat',
      show: true
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: User,
      path: '/profile',
      show: true
    }
  ]

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-800"
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                  item.isCenter 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 -mt-4' 
                    : isActive
                    ? 'text-orange-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.isCenter ? (
                    <>
                      <motion.div
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg"
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" 
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon size={24} />
                      </motion.div>
                      <span className="text-xs mt-1 font-medium text-white text-center max-w-[80px]">
                        {item.label}
                      </span>
                    </>
                  ) : (
                    <>
                      <Icon 
                        size={20} 
                        className={isActive ? 'text-orange-400' : 'text-gray-400'}
                      />
                      <span className={`
                        text-xs mt-1 font-medium
                        ${isActive ? 'text-orange-400' : 'text-gray-400'}
                      `}>
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </motion.nav>
  )
}

export default BottomNavigation