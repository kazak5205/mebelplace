import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { Icon } from '@shared/components'
import { useAuth } from '@shared/contexts/AuthContext'
import { Link } from 'react-router-dom'
import MobileMenu from './MobileMenu'

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 mx-4 sm:mx-6 mt-4 sm:mt-6 mb-0"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden glass-button p-2 mr-2"
          >
            <Icon name="MENU" size={20} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">
            MebelPlace
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass-button p-2"
          >
            <Search className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass-button p-2 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
              3
            </span>
          </motion.button>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-white/60">
                {user?.role === 'admin' ? 'Админ' : user?.role === 'master' ? 'Мастер' : 'Клиент'}
              </p>
            </div>
            
            {user?.role === 'admin' && (
              <Link to="/admin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-button p-2 text-yellow-400 hover:text-yellow-300"
                  title="Админка"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              </Link>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-button p-2"
            >
              <User className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="glass-button p-2 text-red-400 hover:text-red-300"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </motion.header>
  )
}

export default Header
