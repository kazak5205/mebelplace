import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Camera, Save, X, Heart, Grid, Bookmark, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { userService } from '../services/userService'
import { videoService } from '../services/videoService'
import { apiService } from '../services/api'
import { Video } from '../types'

type TabType = 'videos' | 'drafts' | 'private'

const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('videos')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Video[]>([])
  const [masterVideos, setMasterVideos] = useState<Video[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loadingBookmarks, setLoadingBookmarks] = useState(true)
  const [loadingMasterVideos, setLoadingMasterVideos] = useState(true)
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true)
  const [fullUserData, setFullUserData] = useState<any>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    username: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        username: user.username || ''
      })
      
      loadFullUserData()
      loadBookmarkedVideos()
      loadSubscriptions()
      
      if (user.role === 'master') {
        loadMasterVideos()
      }
    }
  }, [user])

  const loadBookmarkedVideos = async () => {
    try {
      setLoadingBookmarks(true)
      const data: any = await userService.getBookmarkedVideos()
      const videos = (data.data || data || []).map((video: any) => ({
        ...video,
        videoUrl: video.video_url || video.videoUrl,
        thumbnailUrl: video.thumbnail_url || video.thumbnailUrl,
        authorId: video.author_id || video.authorId,
        masterId: video.master_id || video.masterId,
        likesCount: video.likes_count || video.likesCount || video.likes,
        commentsCount: video.comments_count || video.commentsCount || video.comments,
        viewsCount: video.views_count || video.viewsCount || video.views,
        createdAt: video.created_at || video.createdAt,
        updatedAt: video.updated_at || video.updatedAt
      }))
      setBookmarkedVideos(videos)
    } catch (error) {
      console.error('Failed to load bookmarks:', error)
      setBookmarkedVideos([])
    } finally {
      setLoadingBookmarks(false)
    }
  }

  const loadFullUserData = async () => {
    if (!user) return
    try {
      const userData: any = await apiService.get(`/users/${user.id}`)
      // apiService уже преобразует snake_case в camelCase автоматически
      // Просто сохраняем данные
      if (userData) {
        setFullUserData(userData)
      }
    } catch (error) {
      console.error('Failed to load full user data:', error)
    }
  }

  const loadMasterVideos = async () => {
    if (!user) return
    try {
      setLoadingMasterVideos(true)
      const response = await videoService.getVideos({ author_id: user.id, limit: 50 })
      const videos = (response.videos || []).map((video: any) => ({
        ...video,
        videoUrl: video.video_url || video.videoUrl,
        thumbnailUrl: video.thumbnail_url || video.thumbnailUrl,
        authorId: video.author_id || video.authorId,
        masterId: video.master_id || video.masterId,
        likesCount: video.likes_count || video.likesCount || video.likes,
        commentsCount: video.comments_count || video.commentsCount || video.comments,
        viewsCount: video.views_count || video.viewsCount || video.views,
        createdAt: video.created_at || video.createdAt,
        updatedAt: video.updated_at || video.updatedAt
      }))
      setMasterVideos(videos)
    } catch (error) {
      console.error('Failed to load master videos:', error)
      setMasterVideos([])
    } finally {
      setLoadingMasterVideos(false)
    }
  }

  const loadSubscriptions = async () => {
    if (!user) return
    try {
      setLoadingSubscriptions(true)
      const data: any = await userService.getSubscriptions(user.id)
      const subs = data.subscriptions || []
      
      // Для каждого мастера загружаем актуальные данные с subscribers_count
      const subsWithCounts = await Promise.all(
        subs.map(async (sub: any) => {
          try {
            const masterData: any = await apiService.get(`/users/${sub.id}`)
            return {
              ...sub,
              subscribers_count: masterData.subscribers_count || masterData.subscribersCount || 0,
              subscribersCount: masterData.subscribers_count || masterData.subscribersCount || 0
            }
          } catch (error) {
            console.error(`Failed to load master ${sub.id} data:`, error)
            return sub
          }
        })
      )
      
      setSubscriptions(subsWithCounts)
    } catch (error) {
      console.error('Failed to load subscriptions:', error)
      setSubscriptions([])
    } finally {
      setLoadingSubscriptions(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
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
        username: user.username || ''
      })
    }
    setIsEditing(false)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер: 10MB')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('avatar', file)
      
      const token = localStorage.getItem('accessToken')

      const response = await fetch('https://mebelplace.com.kz/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to upload avatar')
      }

      const data = await response.json()
      
      if (data.success && updateUser) {
        await updateUser({ avatar: data.data.avatar })
        alert('Аватар успешно загружен!')
      }
    } catch (error: any) {
      console.error('Failed to upload avatar:', error)
      alert(`Ошибка при загрузке аватара: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
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

  const displayName = (user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.username) || 'Пользователь'

  return (
    <div className="max-w-5xl mx-auto">
      {/* TikTok-Style Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setIsEditing(!isEditing)} className="glass-button p-2">
            {isEditing ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
          </button>
          <h1 className="text-lg font-semibold text-white">Мой профиль</h1>
          <button onClick={() => logout()} className="glass-button p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* TikTok-Style Profile */}
        <div className="flex flex-col items-center py-6">
          {/* Avatar with gradient border */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative mb-4"
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-500 via-yellow-400 to-cyan-400 p-1">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <label 
              htmlFor="avatar-upload" 
              className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border-3 border-gray-900"
            >
              <Camera className="w-4 h-4 text-white" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </motion.div>

          {/* Username */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base font-semibold text-white mb-5"
          >
            @{user.username?.toLowerCase().replace(/\s/g, '_')}
          </motion.h2>

          {/* Stats Row - только для мастеров */}
          {user.role === 'master' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-8 mb-5"
            >
              <button className="flex flex-col items-center">
                <span className="text-lg font-bold text-white">{formatCount(fullUserData?.followingCount || 0)}</span>
                <span className="text-xs text-white/60">Подписки</span>
              </button>
              
              <button className="flex flex-col items-center">
                <span className="text-lg font-bold text-white">{formatCount(fullUserData?.subscribersCount || 0)}</span>
                <span className="text-xs text-white/60">Подписчики</span>
              </button>
              
              <button className="flex flex-col items-center">
                <span className="text-lg font-bold text-white">
                  {formatCount(masterVideos.reduce((sum, v) => sum + Number(v.likeCount || v.likesCount || (v as any).likes || 0), 0))}
                </span>
                <span className="text-xs text-white/60">Лайки</span>
              </button>
            </motion.div>
          )}

          {/* Bio */}
          {(user as any).bio && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-white text-center mb-4 max-w-md"
            >
              {(user as any).bio}
            </motion.p>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-2 w-full max-w-md mb-4"
          >
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2.5 px-4 rounded transition-colors"
            >
              Редактировать
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-4 rounded transition-colors">
              <Grid className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Quick Settings */}
          <div className="flex gap-8">
            <button className="flex flex-col items-center">
              <User className="w-6 h-6 text-white/80 mb-1" />
              <span className="text-xs text-white/60">Профиль</span>
            </button>
            
            <button className="flex flex-col items-center">
              <Heart className="w-6 h-6 text-white/80 mb-1" />
              <span className="text-xs text-white/60">Подписчики</span>
            </button>
          </div>
        </div>

        {/* Content Tabs - TikTok Style (только для мастеров показываем видео) */}
        {user.role === 'master' && (
          <div className="flex border-t border-white/10">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'videos' 
                  ? 'border-b-2 border-white text-white' 
                  : 'text-white/40'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setActiveTab('drafts')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'drafts' 
                  ? 'border-b-2 border-white text-white' 
                  : 'text-white/40'
              }`}
            >
              <Heart className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setActiveTab('private')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'private' 
                  ? 'border-b-2 border-white text-white' 
                  : 'text-white/40'
              }`}
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Edit Form Modal */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">Основная информация</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Имя пользователя (логин)
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  disabled={true}
                  className="glass-input w-full pl-12 opacity-50 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-white/50 mt-1">Имя пользователя нельзя изменить</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Имя
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="glass-input w-full pl-12"
                    placeholder="Ваше имя"
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
                    className="glass-input w-full pl-12"
                    placeholder="Ваша фамилия"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
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
                className="glass-button bg-gradient-to-r from-pink-500 to-pink-600 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Сохранение...' : 'Сохранить'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Videos/Bookmarks Grid - только для мастеров */}
      {user.role === 'master' && (
        <div className="grid grid-cols-3 gap-0.5 mb-6">
          {activeTab === 'videos' && loadingMasterVideos && (
            <div className="col-span-3 text-center py-20">
              <p className="text-white/40">Загрузка...</p>
            </div>
          )}
          
          {activeTab === 'videos' && !loadingMasterVideos && masterVideos.length === 0 && (
            <div className="col-span-3 text-center py-20">
              <Grid className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">Нет видео</p>
            </div>
          )}
          
          {activeTab === 'videos' && !loadingMasterVideos && masterVideos.length > 0 &&
            masterVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative aspect-[9/16] bg-gray-800 cursor-pointer group overflow-hidden"
                onClick={() => window.location.href = `/video/${video.id}`}
              >
                {video.thumbnailUrl && (
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2">
                  <div className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span>{video.likesCount || 0}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          }
          
          {activeTab === 'drafts' && loadingBookmarks && (
            <div className="col-span-3 text-center py-20">
              <p className="text-white/40">Загрузка...</p>
            </div>
          )}
          
          {activeTab === 'drafts' && !loadingBookmarks && bookmarkedVideos.length === 0 && (
            <div className="col-span-3 text-center py-20">
              <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">У вас пока нет избранных видео</p>
            </div>
          )}
          
          {activeTab === 'drafts' && !loadingBookmarks && bookmarkedVideos.length > 0 && 
            bookmarkedVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative aspect-[9/16] bg-gray-800 cursor-pointer group overflow-hidden"
                onClick={() => window.location.href = `/video/${video.id}`}
              >
                {video.thumbnailUrl && (
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              </motion.div>
            ))
          }
          
          {activeTab === 'private' && (
            <div className="col-span-3 text-center py-20">
              <Bookmark className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">Нет сохраненных видео</p>
            </div>
          )}
        </div>
      )}

      {/* Для клиентов показываем избранное и подписки на мастеров */}
      {user.role !== 'master' && (
        <div className="space-y-6">
          {/* Мои подписки на мастеров */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Мои мастера</span>
              </h3>
              <span className="text-white/60 text-sm">{subscriptions.length} мастеров</span>
            </div>
            {loadingSubscriptions ? (
              <p className="text-white/50 text-center py-8">Загрузка...</p>
            ) : subscriptions.length > 0 ? (
              <div className="space-y-3">
                {subscriptions.map((subscription: any, index) => (
                  <motion.div
                    key={subscription.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/master/${subscription.id}`}
                  >
                    <img 
                      src={subscription.avatar || '/default-avatar.png'} 
                      alt={subscription.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-white font-semibold">{subscription.username}</p>
                      <p className="text-white/60 text-sm">
                        {subscription.subscribersCount || 0} подписчиков
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                      Перейти
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-white/50 text-center py-8">
                Вы пока не подписаны ни на одного мастера
              </p>
            )}
          </motion.div>

          {/* Избранное */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Избранное</span>
              </h3>
              <span className="text-white/60 text-sm">{bookmarkedVideos.length} видео</span>
            </div>
            {loadingBookmarks ? (
              <p className="text-white/50 text-center py-8">Загрузка...</p>
            ) : bookmarkedVideos.length > 0 ? (
              <div className="grid grid-cols-3 gap-0.5">
                {bookmarkedVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative aspect-[9/16] bg-gray-800 cursor-pointer group overflow-hidden"
                  >
                    {video.thumbnailUrl && (
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-white/50 text-center py-8">
                У вас пока нет избранных видео
              </p>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
