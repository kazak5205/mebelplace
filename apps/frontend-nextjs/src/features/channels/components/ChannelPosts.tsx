/**
 * ChannelPosts - Channel feed with posts
 * Per TZ: Read-only broadcast channel, rich media posts
 * Premium glassmorphism design
 */

'use client'

import { useState } from 'react'
import { ArrowLeft, Share2, Bookmark, Eye, ThumbsUp, MessageCircle } from 'lucide-react'
// import { div className="glass-card" } from '@/components/ui/div className="glass-card"'
import { Button } from '@/components/ui'

interface Post {
  id: string
  channelId: string
  content: string
  media?: {
    type: 'image' | 'video'
    url: string
  }[]
  views: number
  likes: number
  commentsCount: number
  createdAt: string
  isLiked: boolean
  isSaved: boolean
}

interface ChannelPostsProps {
  channelId: string
  channelName: string
  channelAvatar: string
  isSubscribed: boolean
  onBack: () => void
  onSubscribe?: () => void
}

export function ChannelPosts({
  channelId,
  channelName,
  channelAvatar,
  isSubscribed,
  onBack,
  onSubscribe,
}: ChannelPostsProps) {
  const [posts] = useState<Post[]>([
    {
      id: '1',
      channelId,
      content: '🔥 Новая коллекция кухонь 2025! Минималистичный дизайн, премиальные материалы. Специальная цена только для подписчиков канала.',
      media: [
        { type: 'image', url: '/api/placeholder/kitchen-1.jpg' },
        { type: 'image', url: '/api/placeholder/kitchen-2.jpg' },
      ],
      views: 3420,
      likes: 189,
      commentsCount: 23,
      createdAt: '2 часа назад',
      isLiked: false,
      isSaved: false,
    },
    {
      id: '2',
      channelId,
      content: 'Мастер-класс по выбору материалов для мебели 📚\n\nСегодня в 18:00 прямой эфир! Расскажу все секреты выбора качественного дерева.',
      views: 1240,
      likes: 67,
      commentsCount: 8,
      createdAt: '5 часов назад',
      isLiked: true,
      isSaved: true,
    },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Назад"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              {channelAvatar ? (
                <img src={channelAvatar} alt={channelName} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span className="text-white font-bold text-xl">
                  {channelName.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {channelName}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Broadcast канал
              </p>
            </div>

            <Button
              onClick={onSubscribe}
              size="sm"
              variant={isSubscribed ? 'secondary' : 'primary'}
            >
              {isSubscribed ? 'Подписан' : 'Подписаться'}
            </Button>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}

        {/* End of posts */}
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Вы просмотрели все посты
          </p>
        </div>
      </div>
    </div>
  )
}

// Post Card Component
function PostCard({ post }: { post: Post }) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [isSaved, setIsSaved] = useState(post.isSaved)
  const [likes, setLikes] = useState(post.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  return (
    <div className="glass-card">
      <div className="space-y-4">
        {/* Content */}
        <p className="text-gray-900 dark:text-white text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Media Grid */}
        {post.media && post.media.length > 0 && (
          <div className={`grid gap-2 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.media.map((item, idx) => (
              <div
                key={idx}
                className="relative aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden group cursor-pointer"
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={`Media ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{post.views.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'text-orange-500' : ''}`} />
            <span>{likes}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentsCount}</span>
          </div>

          <span className="ml-auto">{post.createdAt}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all transform hover:scale-[1.02] active:scale-95 ${
              isLiked
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
            <span>{isLiked ? 'Нравится' : 'Мне нравится'}</span>
          </button>

          <button
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            aria-label="Поделиться"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={handleSave}
            className={`p-3 rounded-xl transition-all ${
              isSaved
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-label={isSaved ? 'Убрать из сохранённых' : 'Сохранить'}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  )
}

