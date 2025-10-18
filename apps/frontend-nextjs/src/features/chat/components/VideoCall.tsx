'use client'

import { useState, useEffect } from 'react'
import { useWebRTC } from '../hooks/useWebRTC'
import { useWebSocket, WebSocketMessage } from '../hooks/useWebSocket'

interface VideoCallProps {
  chatId: string
  userId: string
  recipientId: string
  isInitiator: boolean
  onClose: () => void
}

export const VideoCall: React.FC<VideoCallProps> = ({
  chatId,
  userId,
  recipientId,
  isInitiator,
  onClose,
}) => {
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  const handleSignal = (signal: any) => {
    sendMessage({
      type: signal.type === 'offer' ? 'call_offer' : signal.type === 'answer' ? 'call_answer' : 'call_candidate',
      chat_id: chatId,
      sender_id: userId,
      recipients: [recipientId],
      data: signal,
    })
  }

  const {
    localVideoRef,
    remoteVideoRef,
    isCallActive,
    startCall,
    answerCall,
    handleSignal: processSignal,
    endCall,
    toggleVideo,
    toggleAudio,
    error,
  } = useWebRTC(chatId, userId, handleSignal, { video: true, audio: true })

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    if (message.chat_id !== chatId) return

    switch (message.type) {
      case 'call_offer':
      case 'call_answer':
      case 'call_candidate':
        if (message.data) {
          processSignal(message.data)
        }
        break
    }
  }

  const { sendMessage } = useWebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}/v2/ws`,
    handleWebSocketMessage
  )

  useEffect(() => {
    if (isInitiator) {
      startCall()
    }
  }, [isInitiator, startCall])

  useEffect(() => {
    if (isCallActive) {
      setCallStatus('connected')
    }
  }, [isCallActive])

  const handleEndCall = () => {
    endCall()
    onClose()
  }

  const handleToggleVideo = () => {
    const enabled = toggleVideo()
    setVideoEnabled(enabled)
  }

  const handleToggleAudio = () => {
    const enabled = toggleAudio()
    setAudioEnabled(enabled)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Remote video (full screen) */}
      <div className="relative flex-1">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Local video (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
        </div>

        {/* Status indicator */}
        <div className="absolute top-4 left-4">
          <div className={`px-4 py-2 rounded-full text-white font-medium ${
            callStatus === 'connecting' ? 'bg-yellow-500' :
            callStatus === 'connected' ? 'bg-green-500' :
            'bg-red-500'
          }`}>
            {callStatus === 'connecting' && '⏳ Подключение...'}
            {callStatus === 'connected' && '✓ Связь установлена'}
            {callStatus === 'disconnected' && '✗ Отключено'}
          </div>
        </div>

        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-gradient-to-t from-black to-transparent">
        <div className="flex justify-center gap-4">
          {/* Toggle video */}
          <button
            onClick={handleToggleVideo}
            className={`p-4 rounded-full transition-colors ${
              videoEnabled
                ? 'bg-white/20 hover:bg-white/30'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            <span className="text-white text-2xl">
              {videoEnabled ? '📹' : '📹'}
            </span>
          </button>

          {/* Toggle audio */}
          <button
            onClick={handleToggleAudio}
            className={`p-4 rounded-full transition-colors ${
              audioEnabled
                ? 'bg-white/20 hover:bg-white/30'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            <span className="text-white text-2xl">
              {audioEnabled ? '🎤' : '🔇'}
            </span>
          </button>

          {/* End call */}
          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          >
            <span className="text-white text-2xl">📞</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  )
}

