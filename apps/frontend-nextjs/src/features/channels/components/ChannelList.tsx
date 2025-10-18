/**
 * ChannelList - Broadcast Channels (Telegram-style)
 * Per TZ: News channels from masters, read-only for users
 * Premium glassmorphism design
 */

'use client'

import { useState } from 'react'
import { Bell, BellOff, Check, TrendingUp, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui'

interface Channel {
  id: string
  name: string
  description: string
  avatar: string
  subscribersCount: number
  isSubscribed: boolean
  isVerified: boolean
  lastPostTime: string
  unreadCount: number
  category: 'furniture' | 'design' | 'news' | 'promo'
}

interface ChannelListProps {
  onChannelClick?: (channelId: string) => void
}

export function ChannelList({ onChannelClick }: ChannelListProps) {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: '1',
      name: 'MebelPlace Новости',
      description: 'Официальный канал платформы',
      avatar: '',
      subscribersCount: 15420,
      isSubscribed: true,
      isVerified: true,
      lastPostTime: '2 ч назад',
      unreadCount: 3,
      category: 'news',
    },
    {
      id: '2',
      name: 'Мастер Алихан | Кухни',
      description: 'Эксклюзивные кухни на заказ',
      avatar: '',
      subscribersCount: 8234,
      isSubscribed: true,
      isVerified: true,
      lastPostTime: '5 ч назад',
      unreadCount: 1,
      category: 'furniture',
    },
    {
      id: '3',
      name: 'Дизайн интерьера КЗ',
      description: 'Тренды и идеи дизайна',
      avatar: '',
      subscribersCount: 23456,
      isSubscribed: false,
      isVerified: true,
      lastPostTime: '1 д назад',
      unreadCount: 0,
      category: 'design',
    },
  ])

  const handleSubscribe = (channelId: string) => {
    setChannels(prev =>
      prev.map(ch =>
        ch.id === channelId ? { ...ch, isSubscribed: !ch.isSubscribed } : ch
      )
    )
  }

  const subscribedChannels = channels.filter(ch => ch.isSubscribed)
  const otherChannels = channels.filter(ch => !ch.isSubscribed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Каналы
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Подписывайтесь на мастеров и получайте эксклюзивный контент
              </p>
            </div>
            <Sparkles className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* My Channels */}
      {subscribedChannels.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">
            Мои каналы
          </h2>
          <div className="space-y-3">
            {subscribedChannels.map(channel => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onSubscribe={() => handleSubscribe(channel.id)}
                onClick={() => onChannelClick?.(channel.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommended Channels */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          Рекомендуем подписаться
        </h2>
        <div className="space-y-3">
          {otherChannels.map(channel => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onSubscribe={() => handleSubscribe(channel.id)}
              onClick={() => onChannelClick?.(channel.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Channel Card Component
function ChannelCard({
  channel,
  onSubscribe,
  onClick,
}: {
  channel: Channel
  onSubscribe: () => void
  onClick: () => void
}) {
  return (
    <div className="glass-card hover:opacity-100 transition-all cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            {channel.avatar ? (
              <img src={channel.avatar} alt={channel.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span className="text-white font-bold text-xl">
                {channel.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Unread badge */}
          {channel.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-bold">{channel.unreadCount}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-gray-900 dark:text-white font-bold truncate">
              {channel.name}
            </h3>
            {channel.isVerified && (
              <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm truncate mb-1">
            {channel.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
            <span>{channel.subscribersCount.toLocaleString()} подписчиков</span>
            <span>•</span>
            <span>{channel.lastPostTime}</span>
          </div>
        </div>

        {/* Subscribe button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSubscribe()
          }}
          className={`flex-shrink-0 px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${
            channel.isSubscribed
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
          }`}
        >
          {channel.isSubscribed ? (
            <span className="flex items-center gap-2">
              <BellOff className="w-4 h-4" />
              Отписаться
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Подписаться
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

