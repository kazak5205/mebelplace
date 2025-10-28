const { pool } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { promisify } = require('util');
const redisClient = require('../config/redis');

// Promisify ffmpeg.ffprobe
const ffprobe = promisify(ffmpeg.ffprobe);

// Redis cache с TTL 5 минут
const CACHE_TTL = 5 * 60; // 300 секунд

// Cache helper functions (Redis)
const getCacheKey = (prefix, ...params) => `video:cache:${prefix}:${params.join(':')}`;

const getCached = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data; // redisClient.get уже парсит JSON
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

const setCache = async (key, data) => {
  try {
    // Используем setWithTTL для правильной работы с объектами
    await redisClient.setWithTTL(key, data, CACHE_TTL);
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

// Clear specific cache entries (Redis)
const clearCachePattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(`video:cache:*${pattern}*`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};

class VideoService {
  // Validate video data
  validateVideoData(videoData) {
    const errors = [];
    
    if (!videoData.title || videoData.title.trim().length === 0) {
      errors.push('Title is required');
    }
    if (!videoData.authorId || typeof videoData.authorId !== 'string' || videoData.authorId.trim().length === 0) {
      errors.push('Valid author ID is required');
    }
    if (!videoData.videoUrl || !videoData.videoUrl.trim()) {
      errors.push('Video URL is required');
    }
    if (videoData.title && videoData.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }
    if (videoData.description && videoData.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }
    
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    
    return true;
  }

  // Create video record in database
  async createVideo(videoData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Validate input data
      this.validateVideoData(videoData);
      
      const result = await client.query(`
        INSERT INTO videos (
          title, description, video_url, thumbnail_url, duration, file_size,
          author_id, category, tags, views, likes, is_public, is_active, furniture_price
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [
        videoData.title?.trim(),
        videoData.description?.trim() || null,
        videoData.videoUrl.trim(),
        videoData.thumbnailUrl || null,
        videoData.duration || null,
        videoData.fileSize || null,
        videoData.authorId,
        videoData.category || null,
        videoData.tags || [],
        0, // views
        0, // likes
        videoData.isPublic !== false, // default true
        true,  // is_active
        videoData.furniturePrice || null // furniture_price
      ]);

      await client.query('COMMIT');
      
      // Clear relevant cache entries
      clearCachePattern('categories');
      clearCachePattern('trending');
      
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating video:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Generate thumbnail from video
  async generateThumbnail(videoPath, videoId) {
    try {
      console.log(`[THUMBNAIL] Starting generation for video ${videoId}, path: ${videoPath}`);
      
      // Validate video file exists
      await fs.access(videoPath);
      console.log(`[THUMBNAIL] Video file exists at ${videoPath}`);
      
      const thumbnailPath = videoPath.replace(/\.[^/.]+$/, '_thumb.jpg');
      console.log(`[THUMBNAIL] Thumbnail will be saved to: ${thumbnailPath}`);
      
      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .addOption('-movflags', '+faststart') // Быстрый старт MP4
          .screenshots({
            timestamps: ['10%'], // Берем кадр раньше для быстрого генерирования
            filename: path.basename(thumbnailPath),
            folder: path.dirname(thumbnailPath),
            size: '320x240'
          })
          .on('end', async () => {
            try {
              console.log(`[THUMBNAIL] ffmpeg finished, checking file ${thumbnailPath}`);
              // Verify thumbnail was created
              await fs.access(thumbnailPath);
              
              // Update video record with thumbnail URL
              const thumbnailUrl = `/uploads/videos/${path.basename(thumbnailPath)}`;
              console.log(`[THUMBNAIL] Updating DB with URL: ${thumbnailUrl}`);
              await pool.query(
                'UPDATE videos SET thumbnail_url = $1 WHERE id = $2',
                [thumbnailUrl, videoId]
              );
              console.log(`✅ Thumbnail generated for video ${videoId}`);
              resolve(thumbnailUrl);
            } catch (error) {
              console.error('[THUMBNAIL] Error in post-generation:', error);
              reject(error);
            }
          })
          .on('error', (error) => {
            console.error('[THUMBNAIL] ffmpeg error:', error);
            reject(error);
          });
      });
    } catch (error) {
      console.error('[THUMBNAIL] Error in generateThumbnail:', error);
      throw error;
    }
  }

  // Calculate video duration and optimize for fast start
  async calculateDuration(videoPath, videoId) {
    try {
      // Validate video file exists
      await fs.access(videoPath);
      
      const metadata = await ffprobe(videoPath);
      
      if (!metadata.format || !metadata.format.duration) {
        throw new Error('Could not extract duration from video');
      }

      const duration = Math.round(metadata.format.duration);
      
      // Optimize video for fast start playback (async, don't wait)
      this.optimizeVideoForFastStart(videoPath).catch(err => {
        console.error('Error optimizing video:', err);
      });
      
      await pool.query(
        'UPDATE videos SET duration = $1 WHERE id = $2',
        [duration, videoId]
      );
      
      console.log(`✅ Duration calculated for video ${videoId}: ${duration}s`);
      return duration;
    } catch (error) {
      console.error('Error in calculateDuration:', error);
      throw error;
    }
  }

  // Optimize video for fast start playback (improved to prevent over-compression)
  async optimizeVideoForFastStart(videoPath) {
    try {
      // First, check if video is already optimized
      const metadata = await ffprobe(videoPath);
      if (metadata.format && metadata.format.tags && metadata.format.tags.faststart) {
        console.log(`✅ Video already optimized: ${videoPath}`);
        return;
      }

      // Check if video needs optimization by analyzing its structure
      const needsOptimization = await this.checkVideoOptimizationNeeded(videoPath);
      if (!needsOptimization) {
        console.log(`✅ Video already has good structure: ${videoPath}`);
        return;
      }

      const tempPath = videoPath + '.faststart';
      
      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .addOption('-movflags', '+faststart')
          .addOption('-c', 'copy') // Copy without re-encoding to prevent quality loss
          .addOption('-avoid_negative_ts', 'make_zero') // Fix timestamp issues
          .addOption('-fflags', '+genpts') // Generate presentation timestamps
          .addOption('-max_muxing_queue_size', '1024') // Prevent buffer issues
          .output(tempPath)
          .on('start', (commandLine) => {
            console.log(`[OPTIMIZE] Starting optimization: ${commandLine}`);
          })
          .on('progress', (progress) => {
            if (progress.percent) {
              console.log(`[OPTIMIZE] Progress: ${Math.round(progress.percent)}%`);
            }
          })
          .on('end', () => {
            // Verify the optimized file was created successfully
            fs.access(tempPath)
              .then(() => {
                // Replace original with optimized version
                return fs.rename(tempPath, videoPath);
              })
              .then(() => {
                console.log(`✅ Video optimized for fast start: ${videoPath}`);
                resolve();
              })
              .catch((err) => {
                console.error('Error replacing video:', err);
                // Clean up temp file if it exists
                fs.unlink(tempPath).catch(() => {});
                reject(err);
              });
          })
          .on('error', (err) => {
            console.error('Error optimizing video:', err);
            // Clean up temp file if it exists
            fs.unlink(tempPath).catch(() => {});
            reject(err);
          })
          .run();
      });
    } catch (error) {
      console.error('Error in optimizeVideoForFastStart:', error);
      throw error;
    }
  }

  // Check if video needs optimization
  async checkVideoOptimizationNeeded(videoPath) {
    try {
      const metadata = await ffprobe(videoPath);
      
      // Check if video has faststart flag
      if (metadata.format && metadata.format.tags && metadata.format.tags.faststart) {
        return false;
      }
      
      // Check if video has good structure for streaming
      if (metadata.format && metadata.format.duration) {
        const duration = parseFloat(metadata.format.duration);
        // For videos longer than 10 seconds, optimization is beneficial
        return duration > 10;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking video optimization:', error);
      return true; // Default to optimizing if we can't determine
    }
  }

  // Get video feed with filters (OPTIMIZED VERSION)
  async getVideoFeed(filters = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        authorId, 
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        userId = null // for personalized feed
      } = filters;
      
      // Validate inputs
      if (page < 1 || limit < 1 || limit > 100) {
        throw new Error('Invalid pagination parameters');
      }
      
      const offset = (page - 1) * limit;
      const allowedSortFields = ['created_at', 'views', 'likes', 'title'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
      const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // OPTIMIZED QUERY - Single query with window functions for better performance
      let query = `
        WITH video_stats AS (
          SELECT 
            v.id,
            v.title,
            v.description,
            v.video_url,
            v.thumbnail_url,
            v.duration,
            v.file_size,
            v.category,
            v.tags,
            v.views,
            v.likes,
            v.created_at,
            u.id as author_id,
            u.username,
            u.avatar,
            u.first_name,
            u.last_name,
            COUNT(vl.id) as like_count,
            COUNT(vc.id) as comment_count,
            ROW_NUMBER() OVER (ORDER BY v.${sortField} ${sortDirection}) as row_num
          FROM videos v
          INNER JOIN users u ON v.author_id = u.id
          LEFT JOIN video_likes vl ON v.id = vl.video_id
          LEFT JOIN video_comments vc ON v.id = vc.video_id AND vc.is_active = true
          WHERE v.is_active = true AND v.is_public = true
      `;
      
      const params = [];
      let paramCount = 0;

      if (category) {
        query += ` AND v.category = $${++paramCount}`;
        params.push(category);
      }

      if (authorId) {
        if (!Number.isInteger(authorId)) {
          throw new Error('Invalid author ID');
        }
        query += ` AND v.author_id = $${++paramCount}`;
        params.push(authorId);
      }

      if (search && search.trim()) {
        const searchTerm = search.trim();
        query += ` AND (
          v.title ILIKE $${++paramCount} 
          OR v.description ILIKE $${++paramCount} 
          OR $${++paramCount} = ANY(v.tags)
        )`;
        params.push(`%${searchTerm}%`, `%${searchTerm}%`, searchTerm);
      }

      query += `
          GROUP BY v.id, u.id, u.username, u.avatar, u.first_name, u.last_name
        )
        SELECT 
          id, title, description, video_url, thumbnail_url, duration, 
          file_size, category, tags, views, likes, created_at,
          author_id, username, avatar, first_name, last_name,
          like_count, comment_count
        FROM video_stats
        WHERE row_num > $${++paramCount} AND row_num <= $${++paramCount}
        ORDER BY row_num
      `;
      
      params.push(offset, offset + limit);

      const result = await pool.query(query, params);
      
      // Get total count (optimized - only if needed for pagination)
      let total = null;
      if (page === 1) { // Only count on first page to save resources
        let countQuery = `
          SELECT COUNT(*) as total
          FROM videos v
          WHERE v.is_active = true AND v.is_public = true
        `;
        
        const countParams = [];
        let countParamCount = 0;
        
        if (category) {
          countQuery += ` AND v.category = $${++countParamCount}`;
          countParams.push(category);
        }
        
        if (authorId) {
          countQuery += ` AND v.author_id = $${++countParamCount}`;
          countParams.push(authorId);
        }
        
        if (search && search.trim()) {
          const searchTerm = search.trim();
          countQuery += ` AND (
            v.title ILIKE $${++countParamCount} 
            OR v.description ILIKE $${++countParamCount} 
            OR $${++countParamCount} = ANY(v.tags)
          )`;
          countParams.push(`%${searchTerm}%`, `%${searchTerm}%`, searchTerm);
        }
        
        const countResult = await pool.query(countQuery, countParams);
        total = parseInt(countResult.rows[0].total);
      }
      
      return {
        videos: result.rows,
        pagination: total ? {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        } : {
          page,
          limit,
          hasNext: result.rows.length === limit,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error getting video feed:', error);
      throw error;
    }
  }

  // Get video by ID
  async getVideoById(videoId) {
    try {
      const result = await pool.query(`
        SELECT 
          v.*,
          u.username,
          u.avatar,
          u.first_name,
          u.last_name,
          COUNT(vl.id) as like_count,
          COUNT(vc.id) as comment_count
        FROM videos v
        LEFT JOIN users u ON v.author_id = u.id
        LEFT JOIN video_likes vl ON v.id = vl.video_id
        LEFT JOIN video_comments vc ON v.id = vc.video_id AND vc.is_active = true
        WHERE v.id = $1 AND v.is_active = true
        GROUP BY v.id, u.username, u.avatar, u.first_name, u.last_name
      `, [videoId]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting video by ID:', error);
      throw error;
    }
  }

  // Like/unlike video
  async toggleLike(videoId, userId) {
    // Validate inputs
    if (!videoId || !Number.isInteger(videoId)) {
      throw new Error('Valid video ID is required');
    }
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Valid user ID is required');
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if video exists
      const videoCheck = await client.query(
        'SELECT id FROM videos WHERE id = $1 AND is_active = true',
        [videoId]
      );
      
      if (videoCheck.rows.length === 0) {
        throw new Error('Video not found or inactive');
      }

      // Check if user already liked (with row lock to prevent race conditions)
      const likeResult = await client.query(
        'SELECT id FROM video_likes WHERE video_id = $1 AND user_id = $2 FOR UPDATE',
        [videoId, userId]
      );

      let isLiked;
      if (likeResult.rows.length > 0) {
        // Unlike
        await client.query(
          'DELETE FROM video_likes WHERE video_id = $1 AND user_id = $2',
          [videoId, userId]
        );
        await client.query(
          'UPDATE videos SET likes = GREATEST(likes - 1, 0) WHERE id = $1',
          [videoId]
        );
        isLiked = false;
      } else {
        // Like
        await client.query(
          'INSERT INTO video_likes (video_id, user_id) VALUES ($1, $2)',
          [videoId, userId]
        );
        await client.query(
          'UPDATE videos SET likes = likes + 1 WHERE id = $1',
          [videoId]
        );
        isLiked = true;
      }

      // Get updated like count
      const videoResult = await client.query(
        'SELECT likes FROM videos WHERE id = $1',
        [videoId]
      );

      await client.query('COMMIT');
      
      return {
        likes: videoResult.rows[0].likes,
        isLiked
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error toggling like:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Add comment
  async addComment(videoId, userId, content, parentId = null) {
    try {
      // Validate inputs
      if (!videoId || !Number.isInteger(videoId)) {
        throw new Error('Valid video ID is required');
      }
      if (!userId || !Number.isInteger(userId)) {
        throw new Error('Valid user ID is required');
      }
      if (!content || content.trim().length === 0) {
        throw new Error('Comment content is required');
      }
      if (content.trim().length > 1000) {
        throw new Error('Comment must be less than 1000 characters');
      }
      if (parentId && !Number.isInteger(parentId)) {
        throw new Error('Invalid parent comment ID');
      }

      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Check if video exists
        const videoCheck = await client.query(
          'SELECT id FROM videos WHERE id = $1 AND is_active = true',
          [videoId]
        );
        
        if (videoCheck.rows.length === 0) {
          throw new Error('Video not found or inactive');
        }

        // If replying to a comment, verify parent comment exists
        if (parentId) {
          const parentCheck = await client.query(
            'SELECT id FROM video_comments WHERE id = $1 AND video_id = $2 AND is_active = true',
            [parentId, videoId]
          );
          
          if (parentCheck.rows.length === 0) {
            throw new Error('Parent comment not found');
          }
        }

        const result = await client.query(
          'INSERT INTO video_comments (video_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
          [videoId, userId, content.trim(), parentId]
        );

        await client.query('COMMIT');
        return result.rows[0];
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Get video comments (OPTIMIZED VERSION - No N+1 queries)
  async getComments(videoId, page = 1, limit = 20) {
    try {
      // Validate inputs
      if (!videoId || !Number.isInteger(videoId)) {
        throw new Error('Valid video ID is required');
      }
      if (page < 1 || limit < 1 || limit > 50) {
        throw new Error('Invalid pagination parameters');
      }

      const offset = (page - 1) * limit;

      // Check if video exists
      const videoCheck = await pool.query(
        'SELECT id FROM videos WHERE id = $1 AND is_active = true',
        [videoId]
      );
      
      if (videoCheck.rows.length === 0) {
        throw new Error('Video not found or inactive');
      }

      // OPTIMIZED: Single query with recursive CTE to get comments and replies
      const result = await pool.query(`
        WITH RECURSIVE comment_tree AS (
          -- Base case: top-level comments
          SELECT 
            vc.id,
            vc.content,
            vc.created_at,
            vc.parent_id,
            vc.video_id,
            u.id as user_id,
            u.username,
            u.avatar,
            u.first_name,
            u.last_name,
            0 as depth,
            vc.id::text as path,
            ROW_NUMBER() OVER (ORDER BY vc.created_at DESC) as comment_order
          FROM video_comments vc
          LEFT JOIN users u ON vc.user_id = u.id
          WHERE vc.video_id = $1 AND vc.is_active = true AND vc.parent_id IS NULL
          
          UNION ALL
          
          -- Recursive case: replies
          SELECT 
            vc.id,
            vc.content,
            vc.created_at,
            vc.parent_id,
            vc.video_id,
            u.id as user_id,
            u.username,
            u.avatar,
            u.first_name,
            u.last_name,
            ct.depth + 1,
            ct.path || '.' || vc.id::text,
            ct.comment_order
          FROM video_comments vc
          LEFT JOIN users u ON vc.user_id = u.id
          INNER JOIN comment_tree ct ON vc.parent_id = ct.id
          WHERE vc.is_active = true AND ct.depth < 2 -- Limit to 2 levels deep
        )
        SELECT 
          id, content, created_at, parent_id, video_id,
          user_id, username, avatar, first_name, last_name,
          depth, path, comment_order
        FROM comment_tree
        WHERE comment_order BETWEEN $2 AND $3
        ORDER BY comment_order, depth, created_at ASC
      `, [videoId, offset + 1, offset + limit]);

      // Process results to group replies under their parent comments
      const commentsMap = new Map();
      const topLevelComments = [];

      for (const comment of result.rows) {
        if (comment.depth === 0) {
          comment.replies = [];
          commentsMap.set(comment.id, comment);
          topLevelComments.push(comment);
        } else {
          // Find parent comment
          const parentId = parseInt(comment.path.split('.')[0]);
          const parent = commentsMap.get(parentId);
          if (parent && parent.replies.length < 5) { // Limit replies per comment
            parent.replies.push(comment);
          }
        }
      }

      // Get total comment count for pagination (only for top-level comments)
      const countResult = await pool.query(
        'SELECT COUNT(*) as total FROM video_comments WHERE video_id = $1 AND is_active = true AND parent_id IS NULL',
        [videoId]
      );
      
      const total = parseInt(countResult.rows[0].total);

      return {
        comments: topLevelComments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }

  // Record video view with rate limiting
  async recordView(videoId, userId = null, ipAddress = null) {
    try {
      // Validate video ID
      if (!videoId || !Number.isInteger(videoId)) {
        throw new Error('Valid video ID is required');
      }

      // Check if video exists
      const videoCheck = await pool.query(
        'SELECT id FROM videos WHERE id = $1 AND is_active = true',
        [videoId]
      );
      
      if (videoCheck.rows.length === 0) {
        throw new Error('Video not found or inactive');
      }

      // Rate limiting: prevent duplicate views from same user/IP within 1 hour
      if (userId || ipAddress) {
        const rateLimitQuery = `
          SELECT id FROM video_views 
          WHERE video_id = $1 
          AND created_at > NOW() - INTERVAL '1 hour'
          ${userId ? 'AND user_id = $2' : ''}
          ${ipAddress ? `AND ${userId ? 'ip_address = $3' : 'ip_address = $2'}` : ''}
        `;
        
        const params = [videoId];
        if (userId) params.push(userId);
        if (ipAddress) params.push(ipAddress);
        
        const existingView = await pool.query(rateLimitQuery, params);
        
        if (existingView.rows.length > 0) {
          // View already recorded within rate limit window
          return { recorded: false, reason: 'Rate limited' };
        }
      }

      // Record the view
      await pool.query(
        'UPDATE videos SET views = views + 1 WHERE id = $1',
        [videoId]
      );

      // Log detailed view information if available
      if (userId || ipAddress) {
        await pool.query(
          'INSERT INTO video_views (video_id, user_id, ip_address) VALUES ($1, $2, $3)',
          [videoId, userId || null, ipAddress || null]
        );
      }

      return { recorded: true };
    } catch (error) {
      console.error('Error recording view:', error);
      throw error;
    }
  }

  // Get video categories (with caching)
  async getCategories() {
    try {
      const cacheKey = getCacheKey('categories');
      const cached = await getCached(cacheKey);
      
      if (cached) {
        return cached;
      }

      const result = await pool.query(`
        SELECT DISTINCT category, COUNT(*) as video_count
        FROM videos 
        WHERE is_active = true AND is_public = true
        GROUP BY category
        ORDER BY video_count DESC
      `);

      await setCache(cacheKey, result.rows);
      return result.rows;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  // Get trending videos (with caching)
  async getTrendingVideos(limit = 10) {
    try {
      if (limit < 1 || limit > 50) {
        throw new Error('Invalid limit parameter');
      }

      const cacheKey = getCacheKey('trending', limit);
      const cached = await getCached(cacheKey);
      
      if (cached) {
        return cached;
      }

      const result = await pool.query(`
        SELECT 
          v.id,
          v.title,
          v.description,
          v.video_url,
          v.thumbnail_url,
          v.duration,
          v.category,
          v.tags,
          v.views,
          v.likes,
          v.created_at,
          u.id as author_id,
          u.username,
          u.avatar,
          u.first_name,
          u.last_name,
          COALESCE(like_counts.like_count, 0) as like_count,
          COALESCE(comment_counts.comment_count, 0) as comment_count,
          (v.likes + v.views * 0.1) as trending_score
        FROM videos v
        INNER JOIN users u ON v.author_id = u.id
        LEFT JOIN (
          SELECT video_id, COUNT(*) as like_count 
          FROM video_likes 
          GROUP BY video_id
        ) like_counts ON v.id = like_counts.video_id
        LEFT JOIN (
          SELECT video_id, COUNT(*) as comment_count 
          FROM video_comments 
          WHERE is_active = true
          GROUP BY video_id
        ) comment_counts ON v.id = comment_counts.video_id
        WHERE v.is_active = true AND v.is_public = true
        AND v.created_at > NOW() - INTERVAL '7 days'
        ORDER BY trending_score DESC
        LIMIT $1
      `, [limit]);

      await setCache(cacheKey, result.rows);
      return result.rows;
    } catch (error) {
      console.error('Error getting trending videos:', error);
      throw error;
    }
  }

  // Delete video (soft delete)
  async deleteVideo(videoId, userId) {
    try {
      if (!videoId || !Number.isInteger(videoId)) {
        throw new Error('Valid video ID is required');
      }
      if (!userId || !Number.isInteger(userId)) {
        throw new Error('Valid user ID is required');
      }

      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Check if video exists and user owns it
        const videoCheck = await client.query(
          'SELECT id FROM videos WHERE id = $1 AND author_id = $2 AND is_active = true',
          [videoId, userId]
        );
        
        if (videoCheck.rows.length === 0) {
          throw new Error('Video not found or access denied');
        }

        // Soft delete the video
        await client.query(
          'UPDATE videos SET is_active = false WHERE id = $1',
          [videoId]
        );

        await client.query('COMMIT');
        return { success: true, message: 'Video deleted successfully' };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  // Update video metadata
  async updateVideo(videoId, userId, updateData) {
    try {
      if (!videoId || !Number.isInteger(videoId)) {
        throw new Error('Valid video ID is required');
      }
      if (!userId || !Number.isInteger(userId)) {
        throw new Error('Valid user ID is required');
      }

      const allowedFields = ['title', 'description', 'category', 'tags', 'is_public'];
      const updates = [];
      const params = [];
      let paramCount = 0;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          if (key === 'title' && value && value.length > 200) {
            throw new Error('Title must be less than 200 characters');
          }
          if (key === 'description' && value && value.length > 1000) {
            throw new Error('Description must be less than 1000 characters');
          }
          
          updates.push(`${key} = $${++paramCount}`);
          params.push(value);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      params.push(videoId, userId);

      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Check if video exists and user owns it
        const videoCheck = await client.query(
          'SELECT id FROM videos WHERE id = $1 AND author_id = $2 AND is_active = true',
          [videoId, userId]
        );
        
        if (videoCheck.rows.length === 0) {
          throw new Error('Video not found or access denied');
        }

        const result = await client.query(
          `UPDATE videos SET ${updates.join(', ')} WHERE id = $${++paramCount} AND author_id = $${++paramCount} RETURNING *`,
          params
        );

        await client.query('COMMIT');
        return result.rows[0];
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  }

  // Get video statistics
  async getVideoStats(videoId) {
    try {
      if (!videoId || !Number.isInteger(videoId)) {
        throw new Error('Valid video ID is required');
      }

      const result = await pool.query(`
        SELECT 
          v.id,
          v.title,
          v.views,
          v.likes,
          v.created_at,
          COUNT(DISTINCT vc.id) as comment_count,
          COUNT(DISTINCT vl.id) as like_count,
          AVG(CASE WHEN vc.created_at > NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as recent_engagement
        FROM videos v
        LEFT JOIN video_comments vc ON v.id = vc.video_id AND vc.is_active = true
        LEFT JOIN video_likes vl ON v.id = vl.video_id
        WHERE v.id = $1 AND v.is_active = true
        GROUP BY v.id, v.title, v.views, v.likes, v.created_at
      `, [videoId]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting video stats:', error);
      throw error;
    }
  }
}

module.exports = new VideoService();

