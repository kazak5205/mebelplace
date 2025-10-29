import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Loader2, User } from 'lucide-react'
import GlassCard from './GlassCard'

interface Master {
  id: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  phone?: string
}

interface SelectMasterModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (masterId: string) => void
}

const SelectMasterModal: React.FC<SelectMasterModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [masters, setMasters] = useState<Master[]>([])
  const [filteredMasters, setFilteredMasters] = useState<Master[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadMasters()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMasters(masters)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredMasters(
        masters.filter(master =>
          (master.username || '').toLowerCase().includes(query) ||
          (master.firstName || '').toLowerCase().includes(query) ||
          (master.lastName || '').toLowerCase().includes(query) ||
          (master.phone || '').includes(query)
        )
      )
    }
  }, [searchQuery, masters])

  const loadMasters = async () => {
    try {
      setLoading(true)
      setError(null)
      // Временно: пустой список мастеров (API endpoint не реализован)
      setMasters([])
      setFilteredMasters([])
    } catch (err: any) {
      console.error('Failed to load masters:', err)
      setError('Не удалось загрузить список мастеров')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (masterId: string) => {
    onSelect(masterId)
    onClose()
  }

  const getMasterName = (master: Master) => {
    if (master.firstName || master.lastName) {
      return `${master.firstName || ''} ${master.lastName || ''}`.trim()
    }
    return master.username || 'Мастер'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={onClose}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col"
            >
              <GlassCard className="p-4 sm:p-6 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold gradient-text">Выберите мастера</h2>
                  <button
                    onClick={onClose}
                    className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-3 sm:mb-4">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Поиск мастера..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="glass-input w-full pl-10 sm:pl-12 text-sm sm:text-base"
                    autoFocus
                  />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3">
                  {loading ? (
                    <div className="flex items-center justify-center py-8 sm:py-12">
                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white/60 animate-spin" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 sm:py-12">
                      <p className="text-red-400 text-sm sm:text-base">{error}</p>
                      <button
                        onClick={loadMasters}
                        className="mt-3 sm:mt-4 glass-button text-sm sm:text-base"
                      >
                        Попробовать снова
                      </button>
                    </div>
                  ) : filteredMasters.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <User className="w-12 h-12 sm:w-16 sm:h-16 text-white/30 mx-auto mb-3 sm:mb-4" />
                      <p className="text-white/60 text-sm sm:text-base">
                        {searchQuery ? 'Мастера не найдены' : 'Нет доступных мастеров'}
                      </p>
                    </div>
                  ) : (
                    filteredMasters.map((master) => (
                      <motion.div
                        key={master.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <GlassCard
                          variant="hover"
                          onClick={() => handleSelect(master.id)}
                          className="cursor-pointer p-3 sm:p-4"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            {/* Avatar */}
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base">
                              {master.avatar ? (
                                <img
                                  src={master.avatar}
                                  alt={getMasterName(master)}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span>{(getMasterName(master)).charAt(0).toUpperCase()}</span>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm sm:text-base text-white truncate">
                                {getMasterName(master)}
                              </h3>
                              <p className="text-xs sm:text-sm text-white/60 truncate">
                                @{master.username}
                              </p>
                            </div>

                            {/* Phone */}
                            {master.phone && (
                              <div className="text-xs sm:text-sm text-white/60 hidden sm:block">
                                {master.phone}
                              </div>
                            )}
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SelectMasterModal

