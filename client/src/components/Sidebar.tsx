import React from 'react'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  MessageCircle, 
  FileText, 
  Plus, 
  User, 
  Video,
  Settings
} from 'lucide-react'
import { useAuth } from '@shared/contexts/AuthContext'

const Sidebar: React.FC = () => {
  const { user } = useAuth()

  const navigationItems = [
    {
      label: 'Главная',
      href: '/',
      icon: Home,
    },
    {
      label: 'Чаты',
      href: '/chat',
      icon: MessageCircle,
    },
    {
      label: 'Заявки',
      href: '/orders',
      icon: FileText,
    },
    ...(user?.role === 'client' ? [{
      label: 'Создать заявку',
      href: '/orders/create',
      icon: Plus,
    }] : []),
    ...(user?.role === 'master' ? [{
      label: 'Мой канал',
      href: `/master/${user.id}`,
      icon: Video,
    }] : []),
    {
      label: 'Профиль',
      href: '/profile',
      icon: User,
    },
  ]

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-64 glass-card m-6 p-6 h-fit"
    >
      <nav className="space-y-2">
        {navigationItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'glass-card-active text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-6 border-t border-white/20"
      >
        <button className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 w-full">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Настройки</span>
        </button>
      </motion.div>
    </motion.aside>
  )
}

export default Sidebar
