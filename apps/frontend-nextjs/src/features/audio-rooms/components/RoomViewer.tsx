/**
 * RoomViewer - Audio Rooms (Clubhouse-style)
 * Per TZ: Host/speaker/listener roles, WebRTC UI
 * Premium glassmorphism design
 */

'use client'

import { useState } from 'react'
import { X, Mic, MicOff, Users, Hand, Volume2, VolumeX, Settings } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui'

interface Participant {
  id: string
  name: string
  avatar: string
  role: 'host' | 'speaker' | 'listener'
  isMuted: boolean
  isSpeaking: boolean
  handRaised: boolean
}

interface RoomViewerProps {
  roomId: string
  roomTitle: string
  roomDescription: string
  onClose: () => void
}

export function RoomViewer({
  roomId,
  roomTitle,
  roomDescription,
  onClose,
}: RoomViewerProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [handRaised, setHandRaised] = useState(false)
  const [myRole, setMyRole] = useState<'host' | 'speaker' | 'listener'>('listener')
  
  // Mock participants
  const [participants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Алихан (Мастер)',
      avatar: '',
      role: 'host',
      isMuted: false,
      isSpeaking: true,
      handRaised: false,
    },
    {
      id: '2',
      name: 'Айгуль',
      avatar: '',
      role: 'speaker',
      isMuted: false,
      isSpeaking: false,
      handRaised: false,
    },
    {
      id: '3',
      name: 'Вы',
      avatar: '',
      role: myRole,
      isMuted,
      isSpeaking: false,
      handRaised,
    },
  ])

  const toggleMute = () => {
    if (myRole === 'listener') {
      alert('Поднимите руку чтобы стать спикером')
      return
    }
    setIsMuted(!isMuted)
  }

  const toggleHandRaise = () => {
    setHandRaised(!handRaised)
    if (!handRaised) {
      // Host would see notification
    }
  }

  const leaveRoom = () => {
    // Leave WebRTC room
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col p-6 safe-area">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="glass-card flex-1">
            <div>
              <h1 className="text-white font-bold text-2xl mb-1">{roomTitle}</h1>
              <p className="text-white/70 text-sm">{roomDescription}</p>
              <div className="flex items-center gap-2 mt-2">
                <Users className="w-4 h-4 text-orange-400" />
                <span className="text-white/80 text-sm">{participants.length} участников</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="ml-3 p-3 bg-black/30 backdrop-blur-xl rounded-full hover:bg-black/50 transition-all"
            aria-label="Покинуть комнату"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Participants Grid */}
        <div className="flex-1 overflow-y-auto mb-6">
          {/* Host Section */}
          <div className="mb-6">
            <p className="text-white/60 text-xs uppercase tracking-wide mb-3 font-semibold">Ведущий</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {participants.filter(p => p.role === 'host').map(participant => (
                <ParticipantCard key={participant.id} participant={participant} />
              ))}
            </div>
          </div>

          {/* Speakers Section */}
          {participants.some(p => p.role === 'speaker') && (
            <div className="mb-6">
              <p className="text-white/60 text-xs uppercase tracking-wide mb-3 font-semibold">Спикеры</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {participants.filter(p => p.role === 'speaker').map(participant => (
                  <ParticipantCard key={participant.id} participant={participant} />
                ))}
              </div>
            </div>
          )}

          {/* Listeners Section */}
          {participants.some(p => p.role === 'listener') && (
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wide mb-3 font-semibold">Слушатели</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {participants.filter(p => p.role === 'listener').map(participant => (
                  <ParticipantCard key={participant.id} participant={participant} size="sm" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="glass-card">
          <div className="flex items-center justify-around gap-4">
            {/* Hand Raise */}
            <button
              onClick={toggleHandRaise}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all transform hover:scale-105 ${
                handRaised
                  ? 'bg-orange-500 shadow-lg shadow-orange-500/50'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              aria-label={handRaised ? 'Опустить руку' : 'Поднять руку'}
            >
              <Hand className={`w-8 h-8 ${handRaised ? 'text-white' : 'text-white/70'}`} />
              <span className="text-white text-xs font-medium">Рука</span>
            </button>

            {/* Mic Toggle */}
            <button
              onClick={toggleMute}
              className={`w-20 h-20 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-2xl ${
                isMuted
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/50'
                  : 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/50'
              }`}
              aria-label={isMuted ? 'Включить микрофон' : 'Выключить микрофон'}
              disabled={myRole === 'listener'}
            >
              {isMuted ? (
                <MicOff className="w-10 h-10 text-white mx-auto" />
              ) : (
                <Mic className="w-10 h-10 text-white mx-auto" />
              )}
            </button>

            {/* Leave */}
            <button
              onClick={leaveRoom}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-500/20 hover:bg-red-500/30 transition-all transform hover:scale-105 border border-red-500/30"
              aria-label="Покинуть комнату"
            >
              <X className="w-8 h-8 text-red-400" />
              <span className="text-red-400 text-xs font-medium">Выйти</span>
            </button>
          </div>

          {/* Role indicator */}
          <div className="mt-4 text-center">
            <p className="text-white/60 text-xs">
              Ваша роль: <span className="text-orange-400 font-semibold uppercase">{myRole}</span>
            </p>
            {myRole === 'listener' && (
              <p className="text-white/40 text-xs mt-1">
                Поднимите руку чтобы выступить
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Participant card component
function ParticipantCard({ 
  participant, 
  size = 'md' 
}: { 
  participant: Participant
  size?: 'sm' | 'md'
}) {
  return (
    <div className={`glass-card ${size === 'sm' ? 'p-2' : 'p-4'} relative`}>
      {/* Speaking indicator */}
      {participant.isSpeaking && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse ring-2 ring-green-400/50" />
      )}

      {/* Hand raised indicator */}
      {participant.handRaised && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
          <Hand className="w-3 h-3 text-white" />
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        {/* Avatar */}
        <div className={`${size === 'sm' ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg ring-2 ${
          participant.isSpeaking ? 'ring-green-400 animate-pulse' : 'ring-white/20'
        }`}>
          {participant.avatar ? (
            <img src={participant.avatar} alt={participant.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-white font-bold text-xl">
              {participant.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name */}
        <div className="text-center">
          <p className={`text-white font-medium truncate max-w-full ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            {participant.name}
          </p>
          {participant.role === 'host' && (
            <span className="text-orange-400 text-xs">👑 Ведущий</span>
          )}
        </div>

        {/* Mute indicator */}
        {participant.isMuted && (
          <MicOff className="w-4 h-4 text-red-400" />
        )}
      </div>
    </div>
  )
}

