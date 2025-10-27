import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Heart, MessageCircle, Grid, Bookmark, Upload, X, Eye, MoreHorizontal, UserPlus, UserMinus } from 'lucide-react'
import { Video, User } from '../types'
import { videoService } from '../services/videoService'
import { userService } from '../services/userService'
import { apiService } from '../services/api'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'

type TabType = 'videos' | 'likes' | 'saved'

const MasterChannelPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [master, setMaster] = useState<User | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('videos')
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscribersCount, setSubscribersCount] = useState(0)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: ''
  })
  const { on } = useSocket()

  useEffect(() => {
    console.log('MasterChannelPage: id from useParams:', id)
    console.log('MasterChannelPage: current URL:', window.location.href)
    if (id) {
      loadMasterData()
      loadSubscriptionStatus()
    } else {
      console.error('MasterChannelPage: No id parameter found!')
    }
  }, [id])

  useEffect(() => {
    // Listen for video likes
    on('video_liked', (data) => {
      setVideos(prev => prev.map(video => 
        video.id === data.videoId 
          ? { ...video, isLiked: data.isLiked, likesCount: data.likesCount }
          : video
      ))
    })

    // Listen for new comments
    on('new_comment', (data) => {
      setVideos(prev => prev.map(video => 
        video.id === data.videoId 
          ? { ...video, commentsCount: (video.commentsCount || 0) + 1 }
          : video
      ))
    })
  }, [on])

  const loadMasterData = async () => {
    if (!id) {
      console.error('loadMasterData: No id provided')
      return
    }
    try {
      console.log('loadMasterData: Loading master data for id:', id)
      setLoading(true)
      const data: any = await apiService.get(`/videos/master/${id}`)
      console.log('loadMasterData: API response:', data)
      
      if (data?.master) {
        console.log('loadMasterData: Setting master state with:', data.master)
        setMaster(data.master as User)
        setSubscribersCount(data.master.subscribersCount || data.master.subscribers_count || 0)
        console.log('loadMasterData: Master data set:', data.master)
      } else {
        console.log('loadMasterData: No master data found in response:', data)
      }
      
      if (data?.videos) {
        console.log('loadMasterData: Setting videos state with:', data.videos)
        setVideos(data.videos)
        console.log('loadMasterData: Videos set:', data.videos)
      } else {
        console.log('loadMasterData: No videos data found in response:', data)
      }
    } catch (error) {
      console.error('Failed to load master data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSubscriptionStatus = async () => {
    if (!id || !user) return
    try {
      const data: any = await userService.getSubscriptionStatus(id)
      setIsSubscribed(data?.isSubscribed || false)
    } catch (error) {
      console.error('Failed to load subscription status:', error)
    }
  }

  const handleSubscribe = async () => {
    if (!id) return
    if (!user) {
      navigate('/login')
      return
    }
    try {
      if (isSubscribed) {
        await userService.unsubscribe(id)
        setIsSubscribed(false)
        setSubscribersCount(prev => Math.max(0, prev - 1)) // Уменьшаем счетчик подписчиков
      } else {
        await userService.subscribe(id)
        setIsSubscribed(true)
        setSubscribersCount(prev => prev + 1) // Увеличиваем счетчик подписчиков
      }
    } catch (error) {
      console.error('Failed to toggle subscription:', error)
    }
  }

  const handleVideoClick = (video: Video) => {
    navigate(`/?videoId=${video.id}`)
  }

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setUploading(true)
      const fileInput = document.getElementById('video-file') as HTMLInputElement
      if (!fileInput?.files?.[0]) {
        alert('Выберите видео файл')
        return
      }

      const formData = new FormData()
      formData.append('video', fileInput.files[0])
      formData.append('title', uploadForm.title)
      formData.append('description', uploadForm.description)
      formData.append('category', uploadForm.category)
      formData.append('tags', uploadForm.tags)

      await videoService.uploadVideo(formData)

      setShowUploadModal(false)
      setUploadForm({
        title: '',
        description: '',
        category: 'general',
        tags: ''
      })
      
      await loadMasterData()
    } catch (error) {
      console.error('Failed to upload video:', error)
      alert('Ошибка загрузки видео. Убедитесь, что вы мастер.')
    } finally {
      setUploading(false)
    }
  }

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const isOwner = user?.id === id

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  if (!master) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-white/70 mb-2">
          Мастер не найден
        </h3>
        <button
          onClick={() => navigate('/')}
          className="glass-button"
        >
          Вернуться на главную
        </button>
      </div>
    )
  }

  const displayName = (master.firstName && master.lastName 
    ? `${master.firstName} ${master.lastName}` 
    : master.name || master.username || master.email) || 'Master'

  return (
    <div className="min-h-screen bg-black">
      {/* TikTok-Style Full Screen Channel */}
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
              onClick={() => navigate('/')} 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            
            <motion.h1 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-lg font-bold text-white"
            >
              @{master.username || displayName.toLowerCase().replace(/\s/g, '_')}
            </motion.h1>
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 text-white" />
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
                  {master.avatar ? (
                    <img 
                      src={master.avatar.startsWith('http') ? master.avatar : `https://mebelplace.com.kz${master.avatar}`} 
                      alt={displayName} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Avatar image failed to load:', e.currentTarget.src);
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextSibling) {
                          (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <span 
                    className="text-2xl font-bold text-white"
                    style={{ display: master.avatar ? 'none' : 'flex' }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
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
                @{master.username || displayName.toLowerCase().replace(/\s/g, '_')}
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex gap-6 mb-4"
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {formatCount((master as any).followingCount || (master as any).following_count || 0)}
                  </div>
                  <div className="text-xs text-white/60">Подписки</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {formatCount(subscribersCount)}
                  </div>
                  <div className="text-xs text-white/60">Подписчики</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {formatCount(videos.reduce((sum, v) => sum + Number(v.views || v.viewsCount || 0), 0))}
                  </div>
                  <div className="text-xs text-white/60">Просмотры</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {formatCount(videos.reduce((sum, v) => sum + Number(v.likeCount || v.likesCount || (v as any).likes || (v as any).like_count || 0), 0))}
                  </div>
                  <div className="text-xs text-white/60">Лайки</div>
                </div>
              </motion.div>

              {/* Bio */}
              {(master as any).bio && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-sm text-white/80 mb-4"
                >
                  {(master as any).bio}
                </motion.p>
              )}

              {/* Specialties as hashtags */}
              {master.specialties && master.specialties.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="flex flex-wrap gap-2 mb-4"
                >
                  {master.specialties.slice(0, 3).map((specialty, index) => (
                    <span key={index} className="text-sm text-pink-400 font-medium bg-pink-500/10 px-2 py-1 rounded-full">
                      #{specialty}
                    </span>
                  ))}
                </motion.div>
              )}

              {/* Location & Rating */}
              {(master.location || master.rating) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="flex items-center gap-4 text-sm text-white/60 mb-4"
                >
                  {master.location && (
                    <span>📍 {master.location.city}</span>
                  )}
                  {master.rating && (
                    <span>⭐ {master.rating.toFixed(1)}</span>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="flex gap-2"
              >
                {isOwner ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUploadModal(true)}
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Загрузить видео</span>
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubscribe}
                      className={`flex-1 ${isSubscribed ? 'bg-white/10 border border-white/20' : 'bg-pink-500 hover:bg-pink-600'} text-white font-semibold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition-colors`}
                    >
                      {isSubscribed ? (
                        <>
                          <UserMinus className="w-4 h-4" />
                          <span>Отписаться</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Подписаться</span>
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
                    >
                      <MessageCircle className="w-5 h-5 text-white" />
                    </motion.button>
                  </>
                )}
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

          {/* Content Tabs - TikTok Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
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
              onClick={() => setActiveTab('likes')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'likes' 
                  ? 'border-b-2 border-white text-white font-semibold' 
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm">Лайки</span>
            </button>
            
            {isOwner && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all duration-300 ${
                  activeTab === 'saved' 
                    ? 'border-b-2 border-white text-white font-semibold' 
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Bookmark className="w-5 h-5" />
                <span className="text-sm">Сохранено</span>
              </button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* TikTok-Style Video Grid */}
        <AnimatePresence mode="wait">
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
                {videos.length === 0 ? (
                  <div className="col-span-3 text-center py-20">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Play className="w-8 h-8 text-white/40" />
                    </motion.div>
                    <p className="text-white/40 mb-4">
                      {isOwner ? 'Загрузите первое видео' : 'Нет видео'}
                    </p>
                    {isOwner && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowUploadModal(true)}
                        className="bg-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold"
                      >
                        Создать первое видео
                      </motion.button>
                    )}
                  </div>
                ) : (
                  videos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleVideoClick(video)}
                      className="relative aspect-[9/16] bg-gray-900 cursor-pointer group overflow-hidden rounded-sm"
                    >
                      {video.thumbnailUrl ? (
                        <img 
                          src={video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : `https://mebelplace.com.kz${video.thumbnailUrl}`} 
                          alt={video.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            console.log('Thumbnail failed to load:', e.currentTarget.src);
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center" style={{ display: video.thumbnailUrl ? 'none' : 'flex' }}>
                        <Play className="w-8 h-8 text-white/40" />
                      </div>
                      
                      {/* Overlay with stats */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center justify-between text-white text-xs">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{formatCount(video.views || (video as any).views_count || video.viewsCount || 0)}</span>
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
            {activeTab === 'likes' && (
              <div className="col-span-3 text-center py-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Heart className="w-8 h-8 text-white/40" />
                </motion.div>
                <p className="text-white/40">Нет лайкнутых видео</p>
              </div>
            )}

            {/* Saved Videos */}
            {activeTab === 'saved' && (
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
        </AnimatePresence>

        {/* TikTok-Style Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
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
                  <h3 className="text-xl font-bold text-white">Загрузить видео</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowUploadModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                <form onSubmit={handleUploadVideo} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Видео файл *
                    </label>
                    <div className="relative">
                      <input
                        id="video-file"
                        type="file"
                        accept="video/*"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-pink-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Название *
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      required
                      placeholder="Название вашего видео"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Описание
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      rows={3}
                      placeholder="Расскажите о вашем видео..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-pink-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Категория
                    </label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="general">Общее</option>
                      <option value="furniture">Мебель</option>
                      <option value="design">Дизайн</option>
                      <option value="tutorial">Обучение</option>
                      <option value="repair">Ремонт</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Теги (через запятую)
                    </label>
                    <input
                      type="text"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                      placeholder="мебель, дизайн, интерьер"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1 bg-white/10 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                    >
                      Отмена
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={uploading}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold py-3 px-4 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                        />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>{uploading ? 'Загрузка...' : 'Загрузить'}</span>
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  )
}

export default MasterChannelPage
