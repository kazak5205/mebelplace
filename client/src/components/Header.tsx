import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { videoService } from '../services/videoService'

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  
  console.log('Header user:', user)

  const handleSearch = async (query: string) => {
    if (query.trim().length >= 2) {
      try {
        const results = await videoService.searchVideos({ q: query })
        console.log('Search results:', results)
        // TODO: Navigate to search results page
        navigate(`/search?q=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Search error:', error)
      }
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      handleSearch(searchQuery)
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 mx-6 mt-6 mb-0"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold gradient-text">
            MebelPlace
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Поиск видео, каналов, хештегов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 px-4 py-2 pl-10 bg-gray-900/90 border border-gray-700 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-md"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
          </form>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-white/60">
                    {user.role === 'admin' ? 'Админ' : user.role === 'master' ? 'Мастер' : 'Клиент'}
                  </p>
                </div>
                
                {user.role === 'admin' && (
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
              </>
            ) : (
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass-button px-4 py-2"
                  >
                    Войти
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass-button px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  >
                    Регистрация
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
