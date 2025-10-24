import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Heart, MessageCircle, Grid, Bookmark, Upload, X } from 'lucide-react'
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
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: ''
  })
  const { on } = useSocket()

  useEffect(() => {
    if (id) {
      loadMasterInfo()
      loadMasterVideos()
      loadSubscriptionStatus()
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

  const loadMasterInfo = async () => {
    if (!id) return
    try {
      const data: any = await apiService.get(`/users/${id}`)
      if (data) {
        setMaster(data as User)
      }
    } catch (error) {
      console.error('Failed to load master info:', error)
    }
  }

  const loadMasterVideos = async () => {
    try {
      setLoading(true)
      const response = await videoService.getVideos({ author_id: id, limit: 50 })
      setVideos(response.videos)
      // НЕ перезаписываем master - loadMasterInfo() уже загрузил правильные данные с subscribers_count!
    } catch (error) {
      console.error('Failed to load master videos:', error)
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
      } else {
        await userService.subscribe(id)
        setIsSubscribed(true)
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
      
      await loadMasterVideos()
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
    <div className="max-w-5xl mx-auto">
      {/* TikTok-Style Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="glass-button p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">{displayName}</h1>
          <button className="glass-button p-2">
            <MessageCircle className="w-5 h-5" />
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
                {master.avatar ? (
                  <img src={master.avatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Username */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base font-semibold text-white mb-5"
          >
            @{master.username || displayName.toLowerCase().replace(/\s/g, '_')}
          </motion.h2>

          {/* Stats Row - TikTok Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-8 mb-5"
          >
            <button className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">
                {formatCount((master as any).followingCount || (master as any).following_count || 0)}
              </span>
              <span className="text-xs text-white/60">Подписки</span>
            </button>
            
            <button className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">
                {formatCount((master as any).subscribersCount || (master as any).subscribers_count || (master as any).followersCount || (master as any).followers_count || 0)}
              </span>
              <span className="text-xs text-white/60">Подписчики</span>
            </button>
            
            <button className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">
                {formatCount(videos.reduce((sum, v) => sum + Number(v.likeCount || v.likesCount || (v as any).likes || (v as any).like_count || 0), 0))}
              </span>
              <span className="text-xs text-white/60">Лайки</span>
            </button>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2 w-full max-w-md mb-4"
          >
            {isOwner ? (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 px-4 rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Загрузить видео</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleSubscribe}
                  className={`flex-1 ${isSubscribed ? 'bg-white/10 border border-white/20' : 'bg-pink-500 hover:bg-pink-600'} text-white font-semibold py-2.5 px-4 rounded transition-colors`}
                >
                  {isSubscribed ? 'Подписан' : 'Подписаться'}
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-4 rounded transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </>
            )}
          </motion.div>

          {/* Bio */}
          {(master as any).bio && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-white text-center mb-3 max-w-md"
            >
              {(master as any).bio}
            </motion.p>
          )}

          {/* Specialties as hashtags */}
          {master.specialties && master.specialties.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-2 justify-center mb-3"
            >
              {master.specialties.slice(0, 3).map((specialty, index) => (
                <span key={index} className="text-sm text-blue-400 font-medium">
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
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4 text-sm text-white/60"
            >
              {master.location && (
                <span>{master.location.city}</span>
              )}
              {master.rating && (
                <span>⭐ {master.rating.toFixed(1)}</span>
              )}
            </motion.div>
          )}
        </div>

        {/* Content Tabs - TikTok Style */}
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
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'likes' 
                ? 'border-b-2 border-white text-white' 
                : 'text-white/40'
            }`}
          >
            <Heart className="w-5 h-5" />
          </button>
          
          {isOwner && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'saved' 
                  ? 'border-b-2 border-white text-white' 
                  : 'text-white/40'
              }`}
            >
              <Bookmark className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Videos Grid - 3 columns like TikTok */}
      <div className="grid grid-cols-3 gap-0.5 mb-6">
        {videos.length === 0 ? (
          <div className="col-span-3 text-center py-20">
            <Play className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">
              {activeTab === 'videos' 
                ? (isOwner ? 'Загрузите первое видео' : 'Нет видео') 
                : activeTab === 'likes' 
                ? 'Нет лайкнутых видео' 
                : 'Нет сохраненных видео'}
            </p>
          </div>
        ) : (
          videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleVideoClick(video)}
              className="relative aspect-[9/16] bg-gray-800 cursor-pointer group overflow-hidden"
            >
              {video.thumbnailUrl ? (
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-orange-600/20">
                  <Play className="w-12 h-12 text-white/50" />
                </div>
              )}
              
              {/* Overlay with view count */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-semibold drop-shadow-lg">
                <Play className="w-4 h-4 fill-current" />
                <span>{formatCount(video.views || (video as any).views_count || video.viewsCount || 0)}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Загрузить видео</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="glass-button p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Видео файл *
                </label>
                <input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  required
                  className="glass-input w-full"
                />
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
                  className="glass-input w-full"
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
                  className="glass-input w-full resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Категория
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  className="glass-input w-full"
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
                  className="glass-input w-full"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="glass-button"
                >
                  Отмена
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={uploading}
                  className="glass-button bg-gradient-to-r from-pink-500 to-pink-600 disabled:opacity-50"
                >
                  {uploading ? 'Загрузка...' : 'Загрузить'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default MasterChannelPage
