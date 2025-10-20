import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { Icon, ICON_NAMES } from '@shared/components'
import { useAuth } from '@shared/contexts/AuthContext'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()

  const navigationItems = [
    {
      label: 'Главная',
      href: '/',
      icon: 'HOME',
    },
    {
      label: 'Чаты',
      href: '/chat',
      icon: 'MESSAGE_CIRCLE',
      badge: 3,
    },
    {
      label: 'Заявки',
      href: '/orders',
      icon: 'FILE_TEXT',
    },
    ...(user?.role === 'client' ? [{
      label: 'Создать заявку',
      href: '/orders/create',
      icon: 'PLUS',
    }] : []),
    ...(user?.role === 'master' ? [{
      label: 'Мой канал',
      href: `/master/${user.id}`,
      icon: 'VIDEO',
    }] : []),
    {
      label: 'Профиль',
      href: '/profile',
      icon: 'USER',
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          
          {/* Menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-80 max-w-[85vw] glass-card z-50 lg:hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold gradient-text">Меню</h2>
                <button
                  onClick={onClose}
                  className="glass-button p-2"
                >
                  <Icon name="CLOSE" size={20} />
                </button>
              </div>

              {/* Navigation */}
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
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'glass-card-active text-white'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`
                      }
                    >
                      <Icon name={item.icon as keyof typeof ICON_NAMES} size={20} />
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

              {/* Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 pt-6 border-t border-white/20"
              >
                <button className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 w-full">
                  <Icon name="SETTINGS" size={20} />
                  <span className="font-medium">Настройки</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileMenu
