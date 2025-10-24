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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] flex flex-col"
            >
              <GlassCard className="p-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold gradient-text">Выберите мастера</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-white/60" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Поиск мастера..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="glass-input w-full pl-12"
                    autoFocus
                  />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto space-y-3">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <p className="text-red-400">{error}</p>
                      <button
                        onClick={loadMasters}
                        className="mt-4 glass-button"
                      >
                        Попробовать снова
                      </button>
                    </div>
                  ) : filteredMasters.length === 0 ? (
                    <div className="text-center py-12">
                      <User className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60">
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
                          className="cursor-pointer p-4"
                        >
                          <div className="flex items-center space-x-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
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
                              <h3 className="font-medium text-white truncate">
                                {getMasterName(master)}
                              </h3>
                              <p className="text-sm text-white/60 truncate">
                                @{master.username}
                              </p>
                            </div>

                            {/* Phone */}
                            {master.phone && (
                              <div className="text-sm text-white/60">
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

