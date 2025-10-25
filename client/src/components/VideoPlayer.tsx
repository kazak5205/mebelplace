import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  Heart,
  MessageCircle,
  Share2,
  X,
  Send,
  ThumbsUp,
  Reply,
  UserPlus,
  Bookmark,
  ChevronUp,
  ChevronDown,
  Search
} from 'lucide-react'
import { Video } from '../types'
import { useNavigate } from 'react-router-dom'
import { videoService } from '../services/videoService'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'
import OrderButton from './OrderButton'
import Header from './Header'
import BottomNavigation from './BottomNavigation'

interface VideoPlayerProps {
  videos: Video[]
  initialIndex: number
  onClose?: () => void
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
  const [videoStates, setVideoStates] = useState<Record<string, { isLiked: boolean, likeCount: number }>>(  {})
  const [bookmarkStates, setBookmarkStates] = useState<Record<string, boolean>>({})
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showVideoInfo, setShowVideoInfo] = useState(false)
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { emit, on } = useSocket()

  const currentVideo = videos[currentIndex]
  
  // Проверка: может ли пользователь комментировать это видео
  // Клиенты могут комментировать любые видео
  // Мастера могут комментировать только свои видео
  const canComment = !user || user.role !== 'master' || 
    currentVideo?.master?.id === user.id || 
    currentVideo?.authorId === user.id || 
    currentVideo?.author_id === user.id ||
    currentVideo?.masterId === user.id

  useEffect(() => {
    if (onVideoChange && currentVideo) {
      onVideoChange(currentVideo)
    }
  }, [currentIndex, currentVideo, onVideoChange])

  useEffect(() => {
    // Загружаем комментарии и статус лайка для текущего видео
    if (currentVideo) {
      loadComments()
      recordView()
      loadVideoLikeStatus()
    }
  }, [currentVideo])
  
  // Загружаем статус лайка для текущего видео
  const loadVideoLikeStatus = async () => {
    if (!currentVideo || !user) return
    
    try {
      const video: any = await videoService.getVideo(currentVideo.id)
      // Обновляем состояние с реальным is_liked из API (null считаем как false)
      setVideoStates(prev => ({
        ...prev,
        [currentVideo.id]: {
          isLiked: video.is_liked === true || video.isLiked === true,  // явная проверка на true
          likeCount: video.likes || video.like_count || 0
        }
      }))
    } catch (error) {
      console.error('Failed to load video like status:', error)
    }
  }

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

      // Обработчик прогресса воспроизведения
      const handleTimeUpdate = () => {
        setVideoProgress(currentVideoEl.currentTime)
      }

      // Обработчик загрузки метаданных (для получения длительности)
      const handleLoadedMetadata = () => {
        setVideoDuration(currentVideoEl.duration)
      }

      currentVideoEl.addEventListener('ended', handleEnded)
      currentVideoEl.addEventListener('timeupdate', handleTimeUpdate)
      currentVideoEl.addEventListener('loadedmetadata', handleLoadedMetadata)
      
      // Устанавливаем длительность если уже загружена
      if (currentVideoEl.duration) {
        setVideoDuration(currentVideoEl.duration)
      }
      
      return () => {
        currentVideoEl.removeEventListener('ended', handleEnded)
        currentVideoEl.removeEventListener('timeupdate', handleTimeUpdate)
        currentVideoEl.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }
  }, [currentIndex, videos.length])

  useEffect(() => {
    // Паузим все видео кроме текущего и сбрасываем прогресс
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
    // Сбрасываем прогресс при смене видео
    setVideoProgress(0)
  }, [currentIndex])

  useEffect(() => {
    // Слушаем WebSocket события
    const handleVideoLikeUpdate = (data: any) => {
      if (data.videoId === currentVideo?.id) {
        setVideoStates(prev => ({
          ...prev,
          [data.videoId]: {
            isLiked: data.liked,
            likeCount: data.likes
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
      handleNextVideo()
    } else if (velocity > 500 || info.offset.y > threshold) {
      // Свайп вниз - предыдущее видео
      handlePrevVideo()
    }
  }

  const handleNextVideo = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrevVideo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
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
    if (!user) {
      // Если пользователь не авторизован - перенаправляем на логин
      window.location.href = '/login'
      return
    }
    
    try {
      // Используем toggleLike и получаем реальное состояние от API
      const response: any = await videoService.toggleLike(currentVideo.id)
      
      // Используем данные из API вместо угадывания
      setVideoStates(prev => ({
        ...prev,
        [currentVideo.id]: {
          isLiked: response.is_liked,   // API возвращает is_liked
          likeCount: response.likes     // реальное количество из API
        }
      }))
      
      // НЕ эмитим video_like через socket - это создаёт двойной toggle!
      // REST API уже обработал лайк, socket handler сделает DELETE если эмитить
      // emit('video_like', { videoId: currentVideo.id })
    } catch (error) {
      console.error('Failed to like video:', error)
    }
  }

  const handleBookmark = async () => {
    if (!currentVideo) return
    try {
      const isCurrentlyBookmarked = bookmarkStates[currentVideo.id] || false
      
      if (isCurrentlyBookmarked) {
        await videoService.removeBookmark(currentVideo.id)
      } else {
        await videoService.addBookmark(currentVideo.id)
      }
      
      setBookmarkStates(prev => ({
        ...prev,
        [currentVideo.id]: !isCurrentlyBookmarked
      }))
    } catch (error) {
      console.error('Failed to bookmark:', error)
    }
  }

  const handleShare = async () => {
    if (!currentVideo) return
    
    const shareUrl = `${window.location.origin}/?videoId=${currentVideo.id}`
    const shareData = {
      title: currentVideo.title || 'Видео на MebelPlace',
      text: currentVideo.description || 'Посмотрите это видео на MebelPlace',
      url: shareUrl
    }
    
    console.log('Share clicked', { shareUrl, shareData })
    
    try {
      // Пробуем Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        console.log('Using Web Share API')
        await navigator.share(shareData)
        console.log('Share successful')
        return
      }
      
      // Fallback на clipboard
      console.log('Using clipboard fallback')
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        alert('Ссылка скопирована в буфер обмена! ✓')
        return
      }
      
      // Последний fallback - создаем временный input
      console.log('Using input fallback')
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        alert('Ссылка скопирована! ✓')
      } catch (err) {
        console.error('Copy command failed:', err)
        alert(`Скопируйте ссылку: ${shareUrl}`)
      } finally {
        document.body.removeChild(textArea)
      }
      
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.log('Share cancelled by user')
        return
      }
      console.error('Share failed:', error)
      alert(`Ссылка на видео: ${shareUrl}`)
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

  const handleLikeComment = async (commentId: string, _isLiked: boolean) => {
    try {
      // Используем toggleCommentLike и получаем реальное состояние
      const response: any = await videoService.toggleCommentLike(commentId)
      
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            is_liked: response.is_liked,   // API возвращает is_liked
            likes: response.likes          // используем реальное количество
          }
        }
        if (comment.replies) {
          comment.replies = comment.replies.map((reply: any) => {
            if (reply.id === commentId) {
              return {
                ...reply,
                is_liked: response.is_liked,
                likes: response.likes
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

  const formatTimeAgo = (dateString: string | undefined | null) => {
    if (!dateString) return 'недавно'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'недавно'
      
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      if (diffInSeconds < 60) return 'только что'
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}м назад`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}ч назад`
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}д назад`
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    } catch (error) {
      console.error('Error formatting date:', dateString, error)
      return 'недавно'
    }
  }

  const formatCount = (count: number | undefined | null) => {
    if (count === undefined || count === null) return '0'
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  if (!currentVideo) {
    return null
  }

  const videoState = videoStates[currentVideo.id] || {
    isLiked: currentVideo.isLiked || false,
    likeCount: parseInt(currentVideo.likeCount as any) || currentVideo.likes || 0
  }

  return (
    <>
      <Header />
      <div ref={containerRef} className="fixed inset-0 bg-black z-40 overflow-hidden pt-16 pb-16">
        {/* Close Button - только если задан onClose */}
        {onClose && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClose}
            className="absolute top-20 left-4 z-50 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white"
          >
            <X className="w-6 h-6" />
          </motion.button>
        )}

        {/* Search Bar - TikTok style centered */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-20 left-0 right-0 z-50 flex justify-center px-4"
        >
          <div className="relative w-full max-w-[400px]">
            <motion.input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск"
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 px-5 py-3 pl-12 pr-5 rounded-xl text-sm font-medium focus:outline-none focus:bg-white/15 focus:border-white/30 transition-all shadow-lg"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          </div>
        </motion.div>

      {/* Вертикальная лента видео (TikTok style) */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          className="h-full w-full"
          key={currentIndex}
          initial={{ 
            opacity: 0,
            scale: 0.95,
            y: 50
          }}
          animate={{ 
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94] // TikTok easing
            }
          }}
          exit={{ 
            opacity: 0,
            scale: 0.95,
            y: -50,
            transition: {
              duration: 0.3,
              ease: [0.55, 0.085, 0.68, 0.53]
            }
          }}
        >
        {/* Видео на весь экран */}
        <div className="relative h-full w-full flex items-center justify-center bg-black">
          <div className="relative w-full h-full max-w-[500px] mx-auto flex items-center justify-center">
            <video
              ref={(el) => (videoRefs.current[currentIndex] = el)}
              src={currentVideo.videoUrl}
              className="w-full h-full object-contain"
              style={{ maxHeight: '100vh' }}
              loop={false}
              playsInline
              autoPlay
              onClick={handleVideoClick}
              onDoubleClick={handleDoubleTap}
            />
          </div>

          {/* Navigation Arrows - TikTok style */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[110]">
            {/* Previous Video Arrow */}
            <motion.button
              whileHover={currentIndex !== 0 ? { scale: 1.15, y: -2 } : {}}
              whileTap={currentIndex !== 0 ? { scale: 0.9 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={handlePrevVideo}
              disabled={currentIndex === 0}
              className={`p-3 rounded-full backdrop-blur-xl shadow-lg transition-all duration-300 ${
                currentIndex === 0 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-white/20 text-white hover:bg-white/30 hover:shadow-xl'
              }`}
            >
              <ChevronUp className="w-6 h-6" />
            </motion.button>

            {/* Next Video Arrow */}
            <motion.button
              whileHover={currentIndex !== videos.length - 1 ? { scale: 1.15, y: 2 } : {}}
              whileTap={currentIndex !== videos.length - 1 ? { scale: 0.9 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={handleNextVideo}
              disabled={currentIndex === videos.length - 1}
              className={`p-3 rounded-full backdrop-blur-xl shadow-lg transition-all duration-300 ${
                currentIndex === videos.length - 1
                  ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-white/20 text-white hover:bg-white/30 hover:shadow-xl'
              }`}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Правая панель действий (TikTok style) */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6 z-[100]">
            {/* Аватар автора */}
            <div className="relative group">
              <motion.button
                onClick={() => (currentVideo.masterId || currentVideo.authorId) && navigate(`/master/${currentVideo.masterId || currentVideo.authorId}`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
                aria-label="Канал мастера"
              >
                {currentVideo.avatar || currentVideo.master?.avatar ? (
                  <img 
                    src={currentVideo.avatar || currentVideo.master?.avatar} 
                    alt={currentVideo.username || currentVideo.master?.name || 'Avatar'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback к буквенному аватару если изображение не загрузилось
                      e.currentTarget.style.display = 'none'
                      if (e.currentTarget.nextSibling) {
                        (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <span 
                  className="text-white font-bold text-sm"
                  style={{ display: currentVideo.avatar || currentVideo.master?.avatar ? 'none' : 'flex' }}
                >
                  {(currentVideo.username || currentVideo.master?.name)?.charAt(0).toUpperCase() || 'M'}
                </span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
              >
                <UserPlus className="w-4 h-4 text-white" />
              </motion.button>
            </div>

            {/* Лайк */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={handleLike}
              className="flex flex-col items-center space-y-1"
            >
              <motion.div 
                className={`p-2 rounded-full ${videoState.isLiked ? 'bg-red-500' : 'bg-black/30 backdrop-blur-sm'}`}
                animate={videoState.isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart 
                  className={`w-7 h-7 ${videoState.isLiked ? 'text-white fill-white' : 'text-white'}`}
                />
              </motion.div>
              <span className="text-white text-xs font-semibold text-shadow">
                {formatCount(videoState.likeCount)}
              </span>
            </motion.button>

            {/* Комментарии */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={() => setShowComments(true)}
              className="flex flex-col items-center space-y-1"
            >
              <div className="p-2 rounded-full bg-black/30 backdrop-blur-sm">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <span className="text-white text-xs font-semibold text-shadow">
                {formatCount(currentVideo.commentCount)}
              </span>
            </motion.button>

            {/* Закладка/Сохранить */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={handleBookmark}
              className="flex flex-col items-center space-y-1"
            >
              <motion.div 
                className={`p-2 rounded-full ${bookmarkStates[currentVideo.id] ? 'bg-yellow-500' : 'bg-black/30 backdrop-blur-sm'}`}
                animate={bookmarkStates[currentVideo.id] ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Bookmark className={`w-7 h-7 ${bookmarkStates[currentVideo.id] ? 'text-white fill-white' : 'text-white'}`} />
              </motion.div>
            </motion.button>

            {/* Поделиться */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={handleShare}
              className="flex flex-col items-center space-y-1"
            >
              <div className="p-2 rounded-full bg-black/30 backdrop-blur-sm">
                <Share2 className="w-7 h-7 text-white" />
              </div>
            </motion.button>

          </div>

          {/* Интерактивная информация о видео и кнопка заказа */}
          <motion.div 
            className="absolute left-4 right-4 bottom-20 z-[60] flex justify-center"
            initial={false}
          >
            <div className="w-full max-w-md flex flex-col items-center gap-3">
              {/* Кнопка заказа */}
              {user && isClient && (currentVideo.masterId || currentVideo.authorId) !== user.id && (
                <OrderButton video={currentVideo} className="w-full" />
              )}

              {/* Раскрывающийся блок с информацией */}
              <AnimatePresence>
                {showVideoInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }
                    }}
                    exit={{ 
                      opacity: 0,
                      y: 20,
                      scale: 0.95,
                      transition: {
                        duration: 0.2
                      }
                    }}
                    className="w-full mb-3"
                  >
                    <div className="bg-black/90 backdrop-blur-2xl rounded-2xl p-4 border border-white/10 shadow-2xl">
                      <h3 className="text-white font-semibold text-base mb-2">
                        {currentVideo.title}
                      </h3>

                      {currentVideo.description && (
                        <p className="text-white/80 text-xs mb-3 leading-relaxed">
                          {currentVideo.description}
                        </p>
                      )}

                      {/* Теги */}
                      {currentVideo.tags && currentVideo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {currentVideo.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white/10 rounded-full text-white/90 font-medium text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Video Progress Bar - TikTok style */}
                      <div className="pt-2 border-t border-white/10">
                        <div className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden mb-2">
                          <motion.div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                            style={{ 
                              width: `${videoDuration > 0 ? (videoProgress / videoDuration) * 100 : 0}%` 
                            }}
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${videoDuration > 0 ? (videoProgress / videoDuration) * 100 : 0}%` 
                            }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                        {/* Time indicator */}
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-xs font-medium">
                            {Math.floor(videoProgress / 60)}:{String(Math.floor(videoProgress % 60)).padStart(2, '0')}
                          </span>
                          <span className="text-white/70 text-xs font-medium">
                            {Math.floor(videoDuration / 60)}:{String(Math.floor(videoDuration % 60)).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Кнопка-триггер */}
              <motion.button
                onClick={() => setShowVideoInfo(!showVideoInfo)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="px-5 py-2.5 bg-white/15 backdrop-blur-xl rounded-full border border-white/20 flex items-center gap-2 hover:bg-white/25 transition-all shadow-lg"
              >
                <motion.div
                  animate={{ rotate: showVideoInfo ? 180 : 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  <ChevronDown className="w-4 h-4 text-white" />
                </motion.div>
                <span className="text-white text-sm font-medium">
                  {showVideoInfo ? 'Скрыть' : 'Описание'}
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>
        </motion.div>
      </AnimatePresence>

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
            className="absolute inset-x-0 bottom-0 h-[75vh] bg-black/95 backdrop-blur-xl rounded-t-3xl flex flex-col z-[100]"
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
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
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

            {/* Форма комментария - ЗАФИКСИРОВАНА ВНИЗУ */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 pb-20 bg-black/95 backdrop-blur-xl border-t border-white/10">
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
      <BottomNavigation />
    </>
  )
}

export default VideoPlayer
