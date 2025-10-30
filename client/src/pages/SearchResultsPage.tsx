import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import VideoPlayer from '../components/VideoPlayer'
import { videoService } from '../services/videoService'
import { Video } from '../types'
import { User, Play } from 'lucide-react'

interface Master {
  id: string
  username: string
  avatar: string | null
  first_name: string | null
  last_name: string | null
  company_name: string | null
  role: string
  bio: string | null
  video_count: string
}

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [videos, setVideos] = useState<Video[]>([])
  const [masters, setMasters] = useState<Master[]>([])
  const [loading, setLoading] = useState(true)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [initialVideoIndex, setInitialVideoIndex] = useState(0)

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      performSearch(query)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const performSearch = async (q: string) => {
    try {
      setLoading(true)
      setShowVideoPlayer(false)
      const results = await videoService.searchVideos({ q })
      setVideos(results.videos || [])
      setMasters(results.masters || [])
    } catch (error) {
      console.error('Search error:', error)
      setVideos([])
      setMasters([])
    } finally {
      setLoading(false)
    }
  }

  const handleMasterClick = (masterId: string) => {
    navigate(`/master/${masterId}`)
  }

  const handleVideoClick = (videoIndex: number) => {
    setInitialVideoIndex(videoIndex)
    setShowVideoPlayer(true)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  if (showVideoPlayer && videos.length > 0) {
    return <VideoPlayer videos={videos} initialIndex={initialVideoIndex} />
  }

  const hasResults = videos.length > 0 || masters.length > 0

  if (!hasResults) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white text-center p-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Ничего не найдено</h2>
          <p className="text-white/60">По запросу "{searchParams.get('q')}"</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          Результаты поиска: &quot;{searchParams.get('q')}&quot;
        </h1>

        {/* Masters Section */}
        {masters.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Мастера ({masters.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {masters.map((master) => (
                <motion.div
                  key={master.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleMasterClick(master.id)}
                  className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 cursor-pointer hover:bg-gray-800/50 transition-all border border-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {master.avatar ? (
                        <img src={master.avatar} alt={master.company_name || master.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-8 h-8" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">
                        {master.company_name || `${master.first_name || ''} ${master.last_name || ''}`.trim() || master.username}
                      </h3>
                      <p className="text-sm text-white/60 truncate">{master.bio || 'Мастер мебели'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Play className="w-4 h-4 text-white/60" />
                        <span className="text-xs text-white/60">{master.video_count} видео</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Videos Section */}
        {videos.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Видео ({videos.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleVideoClick(index)}
                  className="relative aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden cursor-pointer group"
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : `https://mebelplace.com.kz${video.thumbnailUrl}`}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                    <div className="p-4 w-full">
                      <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">{video.title}</h3>
                      <p className="text-white/80 text-sm truncate">
                        {video.companyName || video.username || 'Автор'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchResultsPage

