import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { 
  Heart,
  MessageCircle,
  Share2,
  X,
  Send,
  ThumbsUp,
  Reply,
  UserPlus,
  Bookmark
} from 'lucide-react'
import { Video } from '../types'
import { useNavigate } from 'react-router-dom'
import { videoService } from '../services/videoService'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'
import OrderButton from './OrderButton'

interface VideoPlayerProps {
  videos: Video[]
  initialIndex: number
  onClose: () => void
  onVideoChange?: (video: Video) => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videos, 
  initialIndex, 
  onClose,
  onVideoChange 
}) => {
  const navigate = useNavigate()
  const { user, isClient } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  // const [isMuted, setIsMuted] = useState(false) // Звук включён по умолчанию - не используется в текущей версии
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [videoStates, setVideoStates] = useState<Record<string, { isLiked: boolean, likesCount: number }>>(  {})
  const [bookmarkStates, setBookmarkStates] = useState<Record<string, boolean>>({})
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  
  const y = useMotionValue(0)
  const backgroundOpacity = useTransform(y, [-200, 0, 200], [0.3, 1, 0.3])
  
  const { emit, on } = useSocket()

  const currentVideo = videos[currentIndex]
  
  // Проверка: может ли пользователь комментировать это видео
  const canComment = !user || user.role !== 'master' || currentVideo?.master?.id === user.id

  useEffect(() => {
    if (onVideoChange && currentVideo) {
      onVideoChange(currentVideo)
    }
  }, [currentIndex, currentVideo, onVideoChange])

  useEffect(() => {
    // Загружаем комментарии для текущего видео
    if (currentVideo) {
      loadComments()
      recordView()
    }
  }, [currentVideo])

  useEffect(() => {
    // Автовоспроизведение текущего видео
    const currentVideoEl = videoRefs.current[currentIndex]
    if (currentVideoEl) {
      currentVideoEl.play().catch(err => {
        console.log('Autoplay prevented:', err)
      })

      // Обработчик окончания видео - автоплей следующего
      const handleEnded = () => {
        if (currentIndex < videos.length - 1) {
          setCurrentIndex(prev => prev + 1)
        }
      }

      currentVideoEl.addEventListener('ended', handleEnded)
      return () => currentVideoEl.removeEventListener('ended', handleEnded)
    }
  }, [currentIndex, videos.length])

  useEffect(() => {
    // Паузим все видео кроме текущего
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.play().catch(() => {})
        } else {
          video.pause()
          video.currentTime = 0
        }
      }
    })
  }, [currentIndex])

  useEffect(() => {
    // Слушаем WebSocket события
    const handleVideoLikeUpdate = (data: any) => {
      if (data.videoId === currentVideo?.id) {
        setVideoStates(prev => ({
          ...prev,
          [data.videoId]: {
            isLiked: data.liked,
            likesCount: data.likes
          }
        }))
      }
    }

    const handleNewComment = (data: any) => {
      if (data.videoId === currentVideo?.id && showComments) {
        loadComments()
      }
    }

    on('video_liked', handleVideoLikeUpdate)
    on('new_comment', handleNewComment)

    return () => {
      // Cleanup listeners if needed
    }
  }, [on, currentVideo, showComments])

  const loadComments = async () => {
    if (!currentVideo) return
    try {
      const response = await videoService.getComments(currentVideo.id)
      // response уже является массивом комментариев согласно videoService
      setComments(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const recordView = async () => {
    if (!currentVideo) return
    try {
      await videoService.recordView(currentVideo.id, {
        durationWatched: 0,
        completionRate: 0
      })
    } catch (error) {
      console.error('Failed to record view:', error)
    }
  }

  const handleVideoClick = () => {
    const video = videoRefs.current[currentIndex]
    if (video) {
      if (video.paused) {
        video.play()
      } else {
        video.pause()
      }
    }
  }

  const handleDoubleTap = () => {
    handleLike()
  }

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50
    const velocity = info.velocity.y

    // Быстрый свайп или достаточное смещение
    if (velocity < -500 || info.offset.y < -threshold) {
      // Свайп вверх - следующее видео
      if (currentIndex < videos.length - 1) {
        setCurrentIndex(prev => prev + 1)
      }
    } else if (velocity > 500 || info.offset.y > threshold) {
      // Свайп вниз - предыдущее видео
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
      }
    }
  }

  // Toggle mute используется в UI
  // const toggleMute = () => {
  //   videoRefs.current.forEach(video => {
  //     if (video) video.muted = !isMuted
  //   })
  //   setIsMuted(!isMuted)
  // }

  const handleLike = async () => {
    if (!currentVideo) return
    try {
      const currentState = videoStates[currentVideo.id] || { 
        isLiked: currentVideo.isLiked, 
        likesCount: currentVideo.likesCount 
      }

      // Используем toggleLike
      await videoService.toggleLike(currentVideo.id)
      setVideoStates(prev => ({
        ...prev,
        [currentVideo.id]: {
          isLiked: !currentState.isLiked,
          likesCount: currentState.isLiked ? currentState.likesCount - 1 : currentState.likesCount + 1
        }
      }))
      
      emit('video_like', { videoId: currentVideo.id })
    } catch (error) {
      console.error('Failed to like video:', error)
    }
  }

  const handleBookmark = async () => {
    if (!currentVideo) return
    try {
      const isCurrentlyBookmarked = bookmarkStates[currentVideo.id] || false
      await videoService.toggleLike(currentVideo.id) // Временно, нужно добавить toggleBookmark в API
      setBookmarkStates(prev => ({
        ...prev,
        [currentVideo.id]: !isCurrentlyBookmarked
      }))
    } catch (error) {
      console.error('Failed to bookmark:', error)
    }
  }

  const handleShare = () => {
    if (!currentVideo) return
    if (navigator.share) {
      navigator.share({
        title: currentVideo.title,
        text: currentVideo.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentVideo || !newComment.trim()) return

    try {
      setIsSubmittingComment(true)
      const comment = await videoService.addComment(currentVideo.id, newComment.trim())
      setComments(prev => [comment, ...prev])
      setNewComment('')
      
      emit('video_comment', {
        videoId: currentVideo.id,
        content: comment.content,
        parentId: null
      })
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault()
    if (!currentVideo || !replyText.trim()) return

    try {
      setIsSubmittingComment(true)
      const comment = await videoService.addComment(currentVideo.id, replyText.trim(), parentId)
      
      setComments(prev => prev.map(commentItem => {
        if (commentItem.id === parentId) {
          return {
            ...commentItem,
            replies: [...(commentItem.replies || []), comment]
          }
        }
        return commentItem
      }))
      
      setReplyText('')
      setReplyingTo(null)
      
      emit('video_comment', {
        videoId: currentVideo.id,
        content: comment.content,
        parentId: parentId
      })
    } catch (error) {
      console.error('Failed to add reply:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    try {
      // Используем toggleCommentLike
      await videoService.toggleCommentLike(commentId)
      
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            is_liked: !isLiked,
            likes: isLiked ? comment.likes - 1 : comment.likes + 1
          }
        }
        if (comment.replies) {
          comment.replies = comment.replies.map((reply: any) => {
            if (reply.id === commentId) {
              return {
                ...reply,
                is_liked: !isLiked,
                likes: isLiked ? reply.likes - 1 : reply.likes + 1
              }
            }
            return reply
          })
        }
        return comment
      }))
    } catch (error) {
      console.error('Failed to like comment:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'только что'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}м назад`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}ч назад`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}д назад`
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  if (!currentVideo) {
    return null
  }

  const videoState = videoStates[currentVideo.id] || {
    isLiked: currentVideo.isLiked,
    likesCount: currentVideo.likesCount
  }

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={onClose}
        className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white"
      >
        <X className="w-6 h-6" />
      </motion.button>

      {/* Вертикальная лента видео (TikTok style) */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ y, opacity: backgroundOpacity }}
        className="h-full w-full"
      >
        {/* Видео на весь экран */}
        <div className="relative h-full w-full flex items-center justify-center bg-black">
          <div className="tiktok-video-container">
            <video
              ref={(el) => (videoRefs.current[currentIndex] = el)}
              src={currentVideo.videoUrl}
              className="w-full h-full object-cover object-center"
              loop={false}
              playsInline
              autoPlay
              onClick={handleVideoClick}
              onDoubleClick={handleDoubleTap}
            />
          </div>

          {/* Правая панель действий (TikTok style) */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6">
            {/* Аватар автора */}
            <div className="relative">
              <button
                onClick={() => currentVideo.master?.id && navigate(`/master/${currentVideo.master.id}`)}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-white"
                aria-label="Канал мастера"
              >
                {currentVideo.master?.name?.charAt(0).toUpperCase() || 'M'}
              </button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
              >
                <UserPlus className="w-4 h-4 text-white" />
              </motion.button>
            </div>

            {/* Лайк */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className="flex flex-col items-center space-y-1"
            >
              <div className={`p-2 rounded-full ${videoState.isLiked ? 'bg-red-500' : 'bg-black/30 backdrop-blur-sm'}`}>
                <Heart 
                  className={`w-7 h-7 ${videoState.isLiked ? 'text-white fill-white' : 'text-white'}`}
                />
              </div>
              <span className="text-white text-xs font-semibold">
                {formatCount(videoState.likesCount)}
              </span>
            </motion.button>

            {/* Комментарии */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => setShowComments(true)}
              className="flex flex-col items-center space-y-1"
            >
              <div className="p-2 rounded-full bg-black/30 backdrop-blur-sm">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <span className="text-white text-xs font-semibold">
                {formatCount(currentVideo.commentsCount)}
              </span>
            </motion.button>

            {/* Закладка/Сохранить */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleBookmark}
              className="flex flex-col items-center space-y-1"
            >
              <div className={`p-2 rounded-full ${bookmarkStates[currentVideo.id] ? 'bg-yellow-500' : 'bg-black/30 backdrop-blur-sm'}`}>
                <Bookmark className={`w-7 h-7 ${bookmarkStates[currentVideo.id] ? 'text-white fill-white' : 'text-white'}`} />
              </div>
            </motion.button>

            {/* Поделиться */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleShare}
              className="flex flex-col items-center space-y-1"
            >
              <div className="p-2 rounded-full bg-black/30 backdrop-blur-sm">
                <Share2 className="w-7 h-7 text-white" />
              </div>
            </motion.button>

          </div>

          {/* Кнопка заказа */}
          {user && isClient && currentVideo.masterId !== user.id && (
            <div className="absolute left-4 right-4 bottom-24 sm:bottom-28 flex justify-center z-[60]">
              <OrderButton video={currentVideo} className="w-full max-w-md" />
            </div>
          )}

          {/* Нижняя информация о видео */}
          <div className="absolute left-0 right-0 bottom-0 p-4 pb-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="max-w-md">
              <div className="flex items-center space-x-2 mb-3">
                <button
                  onClick={() => currentVideo.master?.id && navigate(`/master/${currentVideo.master.id}`)}
                  className="text-white font-bold hover:underline"
                >
                  @{currentVideo.master?.name || 'Master'}
                </button>
                <span className="text-white/70 text-sm">•</span>
                <span className="text-white/70 text-sm">{formatTimeAgo(currentVideo.createdAt)}</span>
              </div>

              <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                {currentVideo.title}
              </h3>

              {currentVideo.description && (
                <p className="text-white/90 text-sm mb-3 line-clamp-2">
                  {currentVideo.description}
                </p>
              )}

              {/* Теги */}
              {currentVideo.tags && currentVideo.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentVideo.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-white font-semibold text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Прогресс индикатор */}
              <div className="flex items-center space-x-1 mt-3">
                {videos.map((_, index) => (
                  <div
                    key={index}
                    className={`h-0.5 flex-1 rounded-full ${
                      index === currentIndex 
                        ? 'bg-white' 
                        : index < currentIndex 
                        ? 'bg-white/50' 
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Панель комментариев */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150 || info.velocity.y > 500) {
                setShowComments(false)
              }
            }}
            className="absolute inset-x-0 bottom-0 max-h-[75vh] bg-black/95 backdrop-blur-xl rounded-t-3xl flex flex-col"
          >
            {/* Ручка для свайпа */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-white/30 rounded-full" />
            </div>

            {/* Заголовок */}
            <div className="px-4 pb-3 border-b border-white/10">
              <h3 className="text-white font-bold text-center">
                {comments.length} {comments.length === 1 ? 'комментарий' : 'комментариев'}
              </h3>
            </div>

            {/* Список комментариев */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Пока нет комментариев</p>
                  <p className="text-sm mt-1">Будьте первым!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex space-x-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {comment.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-white text-sm">
                            {comment.username || 'Пользователь'}
                          </span>
                          <span className="text-xs text-white/50">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-white/90 text-sm mb-2 break-words">{comment.content}</p>
                        
                        <div className="flex items-center space-x-4">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLikeComment(comment.id, comment.is_liked)}
                            className={`flex items-center space-x-1 text-xs font-medium ${
                              comment.is_liked ? 'text-red-400' : 'text-white/60'
                            }`}
                          >
                            <ThumbsUp className={`w-4 h-4 ${comment.is_liked ? 'fill-current' : ''}`} />
                            <span>{comment.likes || 0}</span>
                          </motion.button>
                          
                          {canComment && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              className="flex items-center space-x-1 text-xs font-medium text-white/60"
                            >
                              <Reply className="w-4 h-4" />
                              <span>Ответить</span>
                            </motion.button>
                          )}
                        </div>

                        {/* Форма ответа */}
                        <AnimatePresence>
                          {replyingTo === comment.id && (
                            <motion.form
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              onSubmit={(e) => handleReply(e, comment.id)}
                              className="mt-3 flex space-x-2"
                            >
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Добавить ответ..."
                                className="flex-1 bg-white/10 text-white placeholder-white/50 px-3 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                                disabled={isSubmittingComment}
                                autoFocus
                              />
                              <motion.button
                                type="submit"
                                disabled={!replyText.trim() || isSubmittingComment}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-full bg-white text-black disabled:opacity-50"
                              >
                                <Send className="w-4 h-4" />
                              </motion.button>
                            </motion.form>
                          )}
                        </AnimatePresence>

                        {/* Ответы */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 space-y-3 pl-4 border-l-2 border-white/10">
                            {comment.replies.map((reply: any) => (
                              <div key={reply.id} className="flex space-x-2">
                                <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                  {reply.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-semibold text-white text-xs">
                                      {reply.username || 'Пользователь'}
                                    </span>
                                    <span className="text-xs text-white/50">
                                      {formatTimeAgo(reply.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-white/80 text-xs mb-1 break-words">{reply.content}</p>
                                  <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleLikeComment(reply.id, reply.is_liked)}
                                    className={`flex items-center space-x-1 text-xs ${
                                      reply.is_liked ? 'text-red-400' : 'text-white/50'
                                    }`}
                                  >
                                    <ThumbsUp className={`w-3 h-3 ${reply.is_liked ? 'fill-current' : ''}`} />
                                    <span>{reply.likes || 0}</span>
                                  </motion.button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Форма комментария */}
            <div className="px-4 py-3 border-t border-white/10">
              {canComment ? (
                <form onSubmit={handleSubmitComment} className="flex space-x-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Добавить комментарий..."
                    className="flex-1 bg-white/10 text-white placeholder-white/50 px-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                    disabled={isSubmittingComment}
                  />
                  <motion.button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    whileTap={{ scale: 0.9 }}
                    className="px-5 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingComment ? '...' : 'Отправить'}
                  </motion.button>
                </form>
              ) : (
                <div className="text-center py-3 text-white/50 text-sm">
                  Только автор видео может оставлять комментарии
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VideoPlayer
