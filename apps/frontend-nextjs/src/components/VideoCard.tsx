import React from 'react'

interface Video {
  id: number | string
  title?: string | null
  path?: string | null
  thumbnail_path?: string | null
  description?: string | null
  author?: {
    id: number | string
    name?: string | null
    avatar?: string | null
    verified?: boolean | null
  } | null | undefined
  likes_count?: number | null
  comments_count?: number | null
  views_count?: number | null
  duration?: number | null
  tags?: string[] | null
  created_at?: string | null
}

interface VideoCardProps {
  video: Video
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  // Guard функции для безопасного рендеринга
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string') return value
    return String(value)
  }

  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0
    if (typeof value === 'number') return value
    const parsed = Number(value)
    return isNaN(parsed) ? 0 : parsed
  }

  const safeArray = (value: any): any[] => {
    if (value === null || value === undefined) return []
    if (Array.isArray(value)) return value
    return []
  }

  const safeBoolean = (value: any): boolean => {
    if (value === null || value === undefined) return false
    if (typeof value === 'boolean') return value
    return Boolean(value)
  }

  const title = safeString(video.title)
  const description = safeString(video.description)
  const author = video.author
  const authorName = author ? safeString(author.name) : 'Неизвестный автор'
  const authorAvatar = author ? safeString(author.avatar) : '/default-avatar.png'
  const authorVerified = author ? safeBoolean(author.verified) : false
  
  const likesCount = safeNumber(video.likes_count)
  const commentsCount = safeNumber(video.comments_count)
  const viewsCount = safeNumber(video.views_count)
  const duration = safeNumber(video.duration)
  const tags = safeArray(video.tags)

  return (
    <div className="video-card" data-testid="video-card">
      <div className="video-thumbnail">
        {video.thumbnail_path && (
          <img 
            src={video.thumbnail_path} 
            alt={title || 'Video thumbnail'} 
            onError={(e) => {
              e.currentTarget.src = '/default-avatar.png'
            }}
          />
        )}
      </div>
      
      <div className="video-content">
        <h3 className="video-title">{title || 'Без названия'}</h3>
        
        {description && (
          <p className="video-description">{description}</p>
        )}
        
        <div className="video-author">
          <img 
            src={authorAvatar} 
            alt={authorName}
            className="author-avatar"
            onError={(e) => {
              e.currentTarget.src = '/default-avatar.png'
            }}
          />
          <span className="author-name">{authorName}</span>
          {authorVerified && <span className="verified-badge">✓</span>}
        </div>
        
        <div className="video-stats">
          <span className="likes">❤️ {likesCount}</span>
          <span className="comments">💬 {commentsCount}</span>
          <span className="views">👁️ {viewsCount}</span>
          {duration > 0 && <span className="duration">⏱️ {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>}
        </div>
        
        {tags.length > 0 && (
          <div className="video-tags">
            {tags.map((tag, index) => (
              <span key={index} className="tag">
                #{safeString(tag)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoCard
export { VideoCard }
