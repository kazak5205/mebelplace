import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import VideoPlayer from '../components/VideoPlayer'
import { videoService } from '../services/videoService'
import { Video } from '../types'

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

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
      const results = await videoService.searchVideos({ q })
      setVideos(results.videos || [])
    } catch (error) {
      console.error('Search error:', error)
      setVideos([])
    } finally {
      setLoading(false)
    }
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

  if (videos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white text-center p-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Ничего не найдено</h2>
          <p className="text-white/60">По запросу "{searchParams.get('q')}"</p>
        </div>
      </div>
    )
  }

  return <VideoPlayer videos={videos} initialIndex={0} />
}

export default SearchResultsPage

