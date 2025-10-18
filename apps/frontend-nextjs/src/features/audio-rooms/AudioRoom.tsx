'use client'

/**
 * Audio Rooms - Voice chat rooms (like Twitter Spaces)
 * Requires WebRTC backend implementation
 */

import { useState } from 'react'
import { Mic, MicOff, Users, Hand, Volume2 } from 'lucide-react'
import { IconButton } from '@/components/ui'

interface Participant {
  id: string
  name: string
  avatar: string
  isSpeaking: boolean
  isMuted: boolean
  role: 'host' | 'speaker' | 'listener'
}

interface AudioRoomProps {
  roomId: string
  title: string
  participants?: Participant[]
  currentUserId?: string
}

export function AudioRoom({ 
  roomId, 
  title, 
  participants = [],
  currentUserId 
}: AudioRoomProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [handRaised, setHandRaised] = useState(false)

  const currentUser = participants.find(p => p.id === currentUserId)
  const canSpeak = currentUser?.role === 'host' || currentUser?.role === 'speaker'

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Room header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span className="text-sm">{participants.length} участников</span>
        </div>
      </div>

      {/* Participants grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {participants.map((participant) => (
          <div key={participant.id} className="flex flex-col items-center gap-2">
            <div className={`relative w-16 h-16 rounded-full overflow-hidden ${
              participant.isSpeaking ? 'ring-4 ring-green-500 ring-offset-2' : ''
            }`}>
              <img 
                src={participant.avatar} 
                alt={participant.name}
                className="w-full h-full object-cover"
              />
              {participant.isMuted && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[80px]">
                {participant.name}
              </p>
              {participant.role === 'host' && (
                <span className="text-xs text-orange-500">🎤 Host</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        {canSpeak ? (
          <IconButton
            size="lg"
            variant={isMuted ? 'secondary' : 'primary'}
            icon={isMuted ? <MicOff /> : <Mic />}
            aria-label={isMuted ? 'Включить микрофон' : 'Выключить микрофон'}
            onClick={() => setIsMuted(!isMuted)}
          />
        ) : (
          <IconButton
            size="lg"
            variant={handRaised ? 'primary' : 'secondary'}
            icon={<Hand />}
            aria-label={handRaised ? 'Опустить руку' : 'Поднять руку'}
            onClick={() => setHandRaised(!handRaised)}
          />
        )}
        
        <IconButton
          size="lg"
          variant="ghost"
          icon={<Volume2 />}
          aria-label="Настройки звука"
          onClick={() => {/* Open audio settings */}}
        />
      </div>

      {/* Status message */}
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {canSpeak 
            ? 'Вы можете говорить в этой комнате'
            : 'Поднимите руку, чтобы запросить слово'
          }
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Требует WebRTC backend
        </p>
      </div>
    </div>
  )
}


