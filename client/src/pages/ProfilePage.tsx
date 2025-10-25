import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Camera, Save, X, Heart, Grid, Bookmark, Settings, LogOut, Play, Eye, MessageCircle, Share, MoreHorizontal, Plus, Check } from 'lucide-react'
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
        // Force reload the avatar by adding timestamp to prevent caching issues
        const avatarUrl = data.data.avatar + '?t=' + Date.now()
        await updateUser({ avatar: avatarUrl })
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
    <div className="min-h-screen bg-black">
      {/* TikTok-Style Full Screen Profile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        {/* Header with gradient background */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="sticky top-0 z-10 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md"
        >
          <div className="flex items-center justify-between p-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsEditing(!isEditing)} 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              {isEditing ? <X className="w-5 h-5 text-white" /> : <Settings className="w-5 h-5 text-white" />}
            </motion.button>
            
            <motion.h1 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-lg font-bold text-white"
            >
              @{user.username?.toLowerCase().replace(/\s/g, '_')}
            </motion.h1>
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => logout()} 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <LogOut className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </motion.div>

        {/* TikTok-Style Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="px-4 py-6"
        >
          {/* Profile Info */}
          <div className="flex items-start gap-4 mb-6">
            {/* Avatar with TikTok-style gradient ring */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-400 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Avatar image failed to load, showing fallback');
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextSibling) {
                          (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <span 
                    className="text-2xl font-bold text-white"
                    style={{ display: user?.avatar ? 'none' : 'flex' }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <motion.label 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                htmlFor="avatar-upload" 
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center cursor-pointer border-2 border-black"
              >
                <Camera className="w-3 h-3 text-white" />
              </motion.label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </motion.div>

            {/* Profile Stats */}
            <div className="flex-1">
              <motion.h2
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="text-xl font-bold text-white mb-2"
              >
                {displayName}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="text-white/70 text-sm mb-3"
              >
                @{user.username?.toLowerCase().replace(/\s/g, '_')}
              </motion.p>

              {/* Stats - только для мастеров */}
              {user.role === 'master' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex gap-6 mb-4"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{formatCount(fullUserData?.followingCount || 0)}</div>
                    <div className="text-xs text-white/60">Подписки</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{formatCount(fullUserData?.subscribersCount || 0)}</div>
                    <div className="text-xs text-white/60">Подписчики</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {formatCount(masterVideos.reduce((sum, v) => sum + Number(v.likeCount || v.likesCount || (v as any).likes || 0), 0))}
                    </div>
                    <div className="text-xs text-white/60">Лайки</div>
                  </div>
                </motion.div>
              )}

              {/* Bio */}
              {(user as any).bio && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-sm text-white/80 mb-4"
                >
                  {(user as any).bio}
                </motion.p>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="flex gap-2"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-white text-black font-semibold py-2.5 px-4 rounded-full text-sm"
                >
                  Редактировать профиль
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
                >
                  <MoreHorizontal className="w-5 h-5 text-white" />
                </motion.button>
              </motion.div>
            </div>
          </div>

          {/* Content Tabs - TikTok Style (только для мастеров) */}
          {user.role === 'master' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex border-b border-white/10 mb-4"
            >
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all duration-300 ${
                  activeTab === 'videos' 
                    ? 'border-b-2 border-white text-white font-semibold' 
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Grid className="w-5 h-5" />
                <span className="text-sm">Видео</span>
              </button>
              
              <button
                onClick={() => setActiveTab('drafts')}
                className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all duration-300 ${
                  activeTab === 'drafts' 
                    ? 'border-b-2 border-white text-white font-semibold' 
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span className="text-sm">Лайки</span>
              </button>
              
              <button
                onClick={() => setActiveTab('private')}
                className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all duration-300 ${
                  activeTab === 'private' 
                    ? 'border-b-2 border-white text-white font-semibold' 
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Bookmark className="w-5 h-5" />
                <span className="text-sm">Сохранено</span>
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* TikTok-Style Edit Modal */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-gray-900 rounded-2xl p-6 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Редактировать профиль</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCancel}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Имя пользователя
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        disabled={true}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-pink-500 disabled:opacity-50"
                      />
                    </div>
                    <p className="text-xs text-white/50 mt-1">Имя пользователя нельзя изменить</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Имя
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-pink-500"
                        placeholder="Имя"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Фамилия
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-pink-500"
                        placeholder="Фамилия"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancel}
                      className="flex-1 bg-white/10 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                    >
                      Отмена
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold py-3 px-4 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                        />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>{loading ? 'Сохранение...' : 'Сохранить'}</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TikTok-Style Video Grid */}
        <AnimatePresence mode="wait">
          {user.role === 'master' && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="px-4"
            >
              {/* Videos Grid */}
              {activeTab === 'videos' && (
                <div className="grid grid-cols-3 gap-0.5">
                  {loadingMasterVideos ? (
                    <div className="col-span-3 text-center py-20">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"
                      />
                      <p className="text-white/40">Загрузка...</p>
                    </div>
                  ) : masterVideos.length === 0 ? (
                    <div className="col-span-3 text-center py-20">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <Grid className="w-8 h-8 text-white/40" />
                      </motion.div>
                      <p className="text-white/40">Нет видео</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold"
                      >
                        Создать первое видео
                      </motion.button>
                    </div>
                  ) : (
                    masterVideos.map((video, index) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        className="relative aspect-[9/16] bg-gray-900 cursor-pointer group overflow-hidden rounded-sm"
                        onClick={() => window.location.href = `/video/${video.id}`}
                      >
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <Play className="w-8 h-8 text-white/40" />
                          </div>
                        )}
                        
                        {/* Overlay with stats */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center justify-between text-white text-xs">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{formatCount(video.viewsCount || 0)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                <span>{formatCount(video.likesCount || 0)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                <span>{formatCount(video.commentsCount || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Liked Videos */}
              {activeTab === 'drafts' && (
                <div className="grid grid-cols-3 gap-0.5">
                  {loadingBookmarks ? (
                    <div className="col-span-3 text-center py-20">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"
                      />
                      <p className="text-white/40">Загрузка...</p>
                    </div>
                  ) : bookmarkedVideos.length === 0 ? (
                    <div className="col-span-3 text-center py-20">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <Heart className="w-8 h-8 text-white/40" />
                      </motion.div>
                      <p className="text-white/40">У вас пока нет лайкнутых видео</p>
                    </div>
                  ) : (
                    bookmarkedVideos.map((video, index) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        className="relative aspect-[9/16] bg-gray-900 cursor-pointer group overflow-hidden rounded-sm"
                        onClick={() => window.location.href = `/video/${video.id}`}
                      >
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <Play className="w-8 h-8 text-white/40" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Saved Videos */}
              {activeTab === 'private' && (
                <div className="col-span-3 text-center py-20">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Bookmark className="w-8 h-8 text-white/40" />
                  </motion.div>
                  <p className="text-white/40">Нет сохраненных видео</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
