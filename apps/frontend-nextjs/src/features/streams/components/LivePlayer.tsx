'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import type { Stream } from '../types/stream'
import { useStream, useJoinStream, useLeaveStream } from '../hooks/useStreams'
import { formatCount } from '@/lib/utils/format'

interface LivePlayerProps {
  streamId: string
  onClose?: () => void
}

export function LivePlayer({ streamId, onClose }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  
  const { data: stream } = useStream(streamId)
  const joinMutation = useJoinStream(streamId)
  const leaveMutation = useLeaveStream(streamId)
  
  // Initialize HLS player
  useEffect(() => {
    if (!stream || !videoRef.current) return
    
    const videoElement = videoRef.current
    
    // Join stream
    joinMutation.mutate()
    
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      })
      
      hls.loadSource(stream.hls_url)
      hls.attachMedia(videoElement)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play()
      })
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError()
              break
            default:
              hls.destroy()
              break
          }
        }
      })
      
      hlsRef.current = hls
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoElement.src = stream.hls_url
      videoElement.play()
    }
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
      leaveMutation.mutate()
    }
  }, [stream?.hls_url])
  
  if (!stream) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    )
  }
  
  return (
    <div className="relative w-full h-screen bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        muted={isMuted}
        playsInline
      />
      
      {/* Live badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-bold">LIVE</span>
        </div>
        
        <div className="flex items-center gap-1 px-3 py-1 bg-black/50 backdrop-blur-sm text-white rounded-full">
          <span>👁</span>
          <span className="text-sm">{formatCount(stream.viewer_count)}</span>
        </div>
      </div>
      
      {/* Stream info */}
      <div className="absolute bottom-20 left-4 right-4 text-white">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={stream.author?.avatar_url || '/default-avatar.png'}
            alt={stream.author?.name}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div>
            <p className="font-semibold">{stream.author?.name}</p>
          </div>
        </div>
        
        <p className="font-medium mb-1">{stream.title}</p>
        {stream.description && (
          <p className="text-sm text-gray-200">{stream.description}</p>
        )}
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col items-center gap-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white"
        >
          <span className="text-2xl">{isMuted ? '🔇' : '🔊'}</span>
        </button>
        
        {onClose && (
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white"
          >
            <span className="text-2xl">✕</span>
          </button>
        )}
      </div>
    </div>
  )
}

