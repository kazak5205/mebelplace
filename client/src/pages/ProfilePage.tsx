import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, MapPin, Star, Edit3, Camera, Save, X } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { useAuth } from '../contexts/AuthContext'

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    specialties: user?.specialties?.join(', ') || '',
    location: {
      city: user?.location?.city || '',
      region: user?.location?.region || ''
    }
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || '',
        specialties: user.specialties?.join(', ') || '',
        location: {
          city: user.location?.city || '',
          region: user.location?.region || ''
        }
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      if (parent === 'location') {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            [child]: value
          }
        }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      // Обновляем только поля, которые поддерживает бэкенд
      await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
        // email, specialties, location - пока не поддерживаются бэкендом /auth/profile
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Ошибка при обновлении профиля')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || '',
        specialties: user.specialties?.join(', ') || '',
        location: {
          city: user.location?.city || '',
          region: user.location?.region || ''
        }
      })
    }
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-white/70 mb-2">
          Пользователь не найден
        </h3>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold gradient-text">Профиль</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <GlassCard className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                {((user.firstName || user.username || user.email).charAt(0).toUpperCase())}
              </div>
              <button className="absolute bottom-0 right-0 glass-button p-2 rounded-full">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.username || user.email}
            </h2>
            <p className="text-white/70 mb-4">{user.role === 'master' ? 'Мастер' : 'Клиент'}</p>

            {user.rating && (
              <div className="flex items-center justify-center space-x-1 mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-white font-medium">{user.rating.toFixed(1)}</span>
                <span className="text-white/60">({user.reviewsCount} отзывов)</span>
              </div>
            )}

            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center justify-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              {user.location && (
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location.city}, {user.location.region}</span>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="glass-button w-full mt-6 flex items-center justify-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Отменить' : 'Редактировать'}</span>
            </motion.button>
          </GlassCard>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">Информация о профиле</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Имя *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="glass-input w-full pl-12 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Фамилия
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="glass-input w-full pl-12 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="+7 (___) ___-__-__"
                    className="glass-input w-full disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Email (только для чтения)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled={true}
                      className="glass-input w-full pl-12 opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {user.role === 'master' && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Специализации
                  </label>
                  <input
                    type="text"
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Мебель, Ремонт, Дизайн (через запятую)"
                    className="glass-input w-full disabled:opacity-50"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Город
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="glass-input w-full pl-12 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Область
                  </label>
                  <input
                    type="text"
                    name="location.region"
                    value={formData.location.region}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="glass-input w-full disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end space-x-4 mt-6 pt-6 border-t border-white/20"
              >
                <button
                  onClick={handleCancel}
                  className="glass-button flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Отмена</span>
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="glass-button bg-gradient-to-r from-blue-500 to-purple-500 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Сохранение...' : 'Сохранить'}</span>
                </motion.button>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfilePage
