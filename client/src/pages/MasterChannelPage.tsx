import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Heart, MessageCircle, Eye, Share2, Star, MapPin, Calendar, Upload, X } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import type { Video, User } from '@shared/types'
import { videoService } from '../services/videoService'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '@shared/contexts/AuthContext'

const MasterChannelPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [master, setMaster] = useState<User | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: ''
  })
  const { emit, on } = useSocket()

  useEffect(() => {
    if (id) {
      loadMasterVideos()
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
          ? { ...video, commentsCount: video.commentsCount + 1 }
          : video
      ))
    })
  }, [on])

  const loadMasterVideos = async () => {
    try {
      setLoading(true)
      const response = await videoService.getVideos({ masterId: id, limit: 50 }) as any
      setVideos(response.videos)
      if (response.videos.length > 0) {
        setMaster(response.videos[0].master)
        setSelectedVideo(response.videos[0])
      }
    } catch (error) {
      console.error('Failed to load master videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (video: Video) => {
    try {
      if (video.isLiked) {
        await videoService.unlikeVideo(video.id)
      } else {
        await videoService.likeVideo(video.id)
      }
    } catch (error) {
      console.error('Failed to like video:', error)
    }
  }

  const handleShare = (video: Video) => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
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
      
      // Перезагрузить видео
      await loadMasterVideos()
    } catch (error) {
      console.error('Failed to upload video:', error)
      alert('Ошибка загрузки видео. Убедитесь, что вы мастер.')
    } finally {
      setUploading(false)
    }
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

  return (
    <div className="space-y-6">
      {/* Master Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="glass-button p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold gradient-text">Канал мастера</h1>
        </div>

        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {master.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{master.name}</h2>
            <p className="text-white/70 mb-4">{master.specialties?.join(', ')}</p>

            <div className="flex items-center space-x-6 text-sm text-white/70">
              {master.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{master.rating.toFixed(1)}</span>
                  <span>({master.reviewsCount} отзывов)</span>
                </div>
              )}
              
              {master.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{master.location.city}, {master.location.region}</span>
                </div>
              )}

              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>На платформе с {new Date(master.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {isOwner ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="glass-button bg-gradient-to-r from-blue-500 to-purple-500 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Загрузить видео</span>
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-button"
                >
                  Подписаться
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-button"
                >
                  Написать
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          {selectedVideo ? (
            <GlassCard className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="glass-button p-6 rounded-full"
                >
                  <Play className="w-12 h-12" />
                </motion.button>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {selectedVideo.title}
                </h3>
                <p className="text-white/70 mb-4">
                  {selectedVideo.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleLike(selectedVideo)}
                      className={`glass-button p-2 ${
                        selectedVideo.isLiked ? 'text-red-500' : 'text-white/70'
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="glass-button p-2 text-white/70"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleShare(selectedVideo)}
                      className="glass-button p-2 text-white/70"
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-white/60">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{selectedVideo.likesCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{selectedVideo.commentsCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{selectedVideo.viewsCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white/70 mb-2">
                  Нет видео
                </h3>
                <p className="text-white/50">
                  У этого мастера пока нет видео
                </p>
              </div>
            </GlassCard>
          )}
        </motion.div>

        {/* Video List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-bold text-white mb-4">
            Другие видео ({videos.length})
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard
                  variant="hover"
                  onClick={() => setSelectedVideo(video)}
                  className={`cursor-pointer ${
                    selectedVideo?.id === video.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex space-x-3 p-3">
                    <div className="w-20 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-white/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm line-clamp-2 mb-1">
                        {video.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-xs text-white/60">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{video.viewsCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{video.likesCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
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
                  className="glass-button bg-gradient-to-r from-blue-500 to-purple-500 disabled:opacity-50"
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
