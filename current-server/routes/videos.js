const express = require('express');
const multer = require('multer');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const videoService = require('../services/videoService');
const router = express.Router();

// Configure multer for video uploads
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Volume монтируется как /app/uploads (без /server)
    const uploadPath = '/app/uploads/videos';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// POST /api/videos/upload - Upload video (только для мастеров и админов)
router.post('/upload', authenticateToken, requireRole(['master', 'admin']), upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided',
        timestamp: new Date().toISOString()
      });
    }

    const { title, description, category, tags } = req.body;
    console.log('[VIDEO UPLOAD] User:', JSON.stringify(req.user));
    const videoData = {
      title,
      description,
      videoUrl: `/uploads/videos/${req.file.filename}`,
      thumbnailUrl: null, // Will be generated
      duration: 0, // Will be calculated
      fileSize: req.file.size,
      authorId: req.user?.id || req.user?.userId,
      category: category || 'general',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };
    console.log('[VIDEO UPLOAD] VideoData:', JSON.stringify(videoData));

    const video = await videoService.createVideo(videoData);
    
    // Generate thumbnail immediately for fast preview
    try {
      await videoService.generateThumbnail(req.file.path, video.id);
    } catch (error) {
      console.error('Error generating thumbnail:', error);
    }
    
    // Calculate duration asynchronously
    videoService.calculateDuration(req.file.path, video.id);

    res.json({
      success: true,
      data: video,
      message: 'Video uploaded successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/videos/feed - Get video feed with admin priorities (every 5th video is admin-selected)
router.get('/feed', async (req, res) => {
  try {
    console.error('[VIDEOS] Feed request:', req.query);
    const { page = 1, limit = 10, category, author_id } = req.query;
    const offset = (page - 1) * limit;

    // Get all videos with their priority information
    let query = `
      SELECT 
        v.*,
        u.username,
        u.avatar,
        u.first_name,
        u.last_name,
        avp.priority_order,
        avp.is_featured,
        COUNT(vl.id) as like_count,
        COUNT(vc.id) as comment_count
      FROM videos v
      LEFT JOIN users u ON v.author_id = u.id
      LEFT JOIN admin_video_priorities avp ON v.id = avp.video_id
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

    if (author_id) {
      query += ` AND v.author_id = $${++paramCount}`;
      params.push(author_id);
    }

    query += `
      GROUP BY v.id, u.username, u.avatar, u.first_name, u.last_name, avp.priority_order, avp.is_featured
      ORDER BY v.created_at DESC
    `;

    console.error('[VIDEOS] Executing main query');
    const result = await pool.query(query, params);
    console.error('[VIDEOS] Got', result.rows.length, 'videos');
    const allVideos = result.rows;

    // Get admin-selected videos for insertion
    let adminVideosQuery = `
      SELECT 
        v.*,
        u.username,
        u.avatar,
        u.first_name,
        u.last_name,
        avp.priority_order,
        avp.is_featured,
        COUNT(vl.id) as like_count,
        COUNT(vc.id) as comment_count
      FROM videos v
      LEFT JOIN users u ON v.author_id = u.id
      LEFT JOIN admin_video_priorities avp ON v.id = avp.video_id
      LEFT JOIN video_likes vl ON v.id = vl.video_id
      LEFT JOIN video_comments vc ON v.id = vc.video_id AND vc.is_active = true
      WHERE v.is_active = true AND v.is_public = true AND avp.is_featured = true
    `;
    
    const adminParams = [];
    let adminParamCount = 0;

    if (category) {
      adminVideosQuery += ` AND v.category = $${++adminParamCount}`;
      adminParams.push(category);
    }

    if (author_id) {
      adminVideosQuery += ` AND v.author_id = $${++adminParamCount}`;
      adminParams.push(author_id);
    }

    adminVideosQuery += `
      GROUP BY v.id, u.username, u.avatar, u.first_name, u.last_name, avp.priority_order, avp.is_featured
      ORDER BY avp.priority_order ASC, v.created_at DESC
    `;

    console.error('[VIDEOS] Executing admin query');
    const adminResult = await pool.query(adminVideosQuery, adminParams);
    console.error('[VIDEOS] Got', adminResult.rows.length, 'admin videos');
    const adminVideos = adminResult.rows;

    // Create the mixed feed: every 5th video is admin-selected
    const mixedVideos = [];
    let adminVideoIndex = 0;
    let regularVideoIndex = 0;
    const regularVideos = allVideos.filter(video => !video.is_featured);

    // Calculate how many videos we need for this page
    const startIndex = offset;
    const endIndex = offset + parseInt(limit);
    let currentIndex = 0;

    // Generate the mixed feed
    while (currentIndex < endIndex) {
      // Every 5th position (0, 4, 9, 14, etc.) should be an admin video
      if (currentIndex % 5 === 4 && adminVideoIndex < adminVideos.length) {
        // Insert admin video
        mixedVideos.push(adminVideos[adminVideoIndex]);
        adminVideoIndex++;
      } else if (regularVideoIndex < regularVideos.length) {
        // Insert regular video
        mixedVideos.push(regularVideos[regularVideoIndex]);
        regularVideoIndex++;
      } else if (adminVideoIndex < adminVideos.length) {
        // If no more regular videos, use admin videos
        mixedVideos.push(adminVideos[adminVideoIndex]);
        adminVideoIndex++;
      } else {
        // No more videos
        break;
      }
      currentIndex++;
    }

    // Get only the videos for this page
    const pageVideos = mixedVideos.slice(startIndex, endIndex);

    // Get user's likes for each video (if authenticated)
    if (req.user) {
      for (let video of pageVideos) {
        const likeResult = await pool.query(
          'SELECT id FROM video_likes WHERE video_id = $1 AND user_id = $2',
          [video.id, req.user.id]
        );
        video.is_liked = likeResult.rows.length > 0;
      }
    }

    // Map snake_case to camelCase for frontend
    const baseUrl = process.env.BASE_URL || 'https://mebelplace.com.kz';
    const mappedVideos = pageVideos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.video_url?.startsWith('http') ? video.video_url : `${baseUrl}${video.video_url}`,
      thumbnailUrl: video.thumbnail_url?.startsWith('http') ? video.thumbnail_url : (video.thumbnail_url ? `${baseUrl}${video.thumbnail_url}` : null),
      duration: video.duration,
      fileSize: video.file_size,
      authorId: video.author_id,
      username: video.username,
      firstName: video.first_name,
      lastName: video.last_name,
      avatar: video.avatar?.startsWith('http') ? video.avatar : (video.avatar ? `${baseUrl}${video.avatar}` : null),
      category: video.category,
      tags: video.tags,
      views: video.views,
      likes: video.likes,
      likesCount: parseInt(video.like_count) || 0,
      commentsCount: parseInt(video.comment_count) || 0,
      isLiked: video.is_liked || false,
      isFeatured: video.is_featured || false,
      priorityOrder: video.priority_order,
      isPublic: video.is_public,
      isActive: video.is_active,
      createdAt: video.created_at,
      updatedAt: video.updated_at,
    }));

    res.json({
      success: true,
      data: {
        videos: mappedVideos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mixedVideos.length,
          adminVideos: adminVideos.length
        }
      },
      message: 'Video feed retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Video feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve video feed',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/videos/master/:masterId - Get master profile with their videos
router.get('/master/:masterId', async (req, res) => {
  try {
    const { masterId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get master profile
    const masterResult = await pool.query(`
      SELECT 
        id,
        username,
        email,
        first_name,
        last_name,
        phone,
        avatar,
        role,
        bio,
        created_at,
        is_verified
      FROM users 
      WHERE id = $1 AND role = 'master' AND is_active = true
    `, [masterId]);

    if (masterResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Master not found',
        timestamp: new Date().toISOString()
      });
    }

    const master = masterResult.rows[0];

    // Get master's videos
    const videosResult = await pool.query(`
      SELECT 
        v.*,
        COUNT(vl.id) as like_count,
        COUNT(vc.id) as comment_count,
        v.views as view_count
      FROM videos v
      LEFT JOIN video_likes vl ON v.id = vl.video_id
      LEFT JOIN video_comments vc ON v.id = vc.video_id AND vc.is_active = true
      WHERE v.author_id = $1 AND v.is_active = true AND v.is_public = true
      GROUP BY v.id
      ORDER BY v.created_at DESC
      LIMIT $2 OFFSET $3
    `, [masterId, limit, offset]);

    // Get total video count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM videos WHERE author_id = $1 AND is_active = true AND is_public = true',
      [masterId]
    );

    // Map videos to camelCase
    const mappedVideos = videosResult.rows.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.video_url,
      thumbnailUrl: video.thumbnail_url,
      duration: video.duration,
      fileSize: video.file_size,
      authorId: video.author_id,
      category: video.category,
      tags: video.tags,
      views: parseInt(video.view_count) || 0,
      likes: parseInt(video.like_count) || 0,
      comments: parseInt(video.comment_count) || 0,
      isPublic: video.is_public,
      createdAt: video.created_at,
      updatedAt: video.updated_at
    }));

    res.json({
      success: true,
      data: {
        master: {
          id: master.id,
          username: master.username,
          email: master.email,
          firstName: master.first_name,
          lastName: master.last_name,
          phone: master.phone,
          avatar: master.avatar,
          role: master.role,
          bio: master.bio,
          isVerified: master.is_verified,
          createdAt: master.created_at,
          videoCount: parseInt(countResult.rows[0].total)
        },
        videos: mappedVideos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total)
        }
      },
      message: 'Master profile retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get master error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve master profile',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/videos/:id/like - Like/unlike video
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;

    // Check if video exists
    const videoResult = await pool.query(
      'SELECT id, likes FROM videos WHERE id = $1 AND is_active = true',
      [videoId]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already liked
    const likeResult = await pool.query(
      'SELECT id FROM video_likes WHERE video_id = $1 AND user_id = $2',
      [videoId, userId]
    );

    let isLiked;
    if (likeResult.rows.length > 0) {
      // Unlike
      await pool.query(
        'DELETE FROM video_likes WHERE video_id = $1 AND user_id = $2',
        [videoId, userId]
      );
      await pool.query(
        'UPDATE videos SET likes = likes - 1 WHERE id = $1',
        [videoId]
      );
      isLiked = false;
    } else {
      // Like
      await pool.query(
        'INSERT INTO video_likes (video_id, user_id) VALUES ($1, $2)',
        [videoId, userId]
      );
      await pool.query(
        'UPDATE videos SET likes = likes + 1 WHERE id = $1',
        [videoId]
      );
      isLiked = true;
    }

    // Get updated like count
    const updatedVideo = await pool.query(
      'SELECT likes FROM videos WHERE id = $1',
      [videoId]
    );

    res.json({
      success: true,
      data: {
        video_id: videoId,
        likes: updatedVideo.rows[0].likes,
        is_liked: isLiked
      },
      message: isLiked ? 'Video liked' : 'Video unliked',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Video like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like video',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/videos/:id/like - Unlike video
router.delete('/:id/like', authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;

    // Check if video exists
    const videoResult = await pool.query(
      'SELECT id, likes FROM videos WHERE id = $1 AND is_active = true',
      [videoId]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already liked
    const likeResult = await pool.query(
      'SELECT id FROM video_likes WHERE video_id = $1 AND user_id = $2',
      [videoId, userId]
    );

    if (likeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Like not found',
        timestamp: new Date().toISOString()
      });
    }

    // Remove like
    await pool.query(
      'DELETE FROM video_likes WHERE video_id = $1 AND user_id = $2',
      [videoId, userId]
    );
    
    await pool.query(
      'UPDATE videos SET likes = GREATEST(likes - 1, 0) WHERE id = $1',
      [videoId]
    );

    // Get updated like count
    const updatedVideo = await pool.query(
      'SELECT likes FROM videos WHERE id = $1',
      [videoId]
    );

    res.json({
      success: true,
      data: {
        video_id: videoId,
        likes: updatedVideo.rows[0].likes,
        is_liked: false
      },
      message: 'Video unliked',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Video unlike error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlike video',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/videos/:id/comment - Add comment
router.post('/:id/comment', authenticateToken, async (req, res) => {
  try {
    const { content, parent_id } = req.body;
    const videoId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
        timestamp: new Date().toISOString()
      });
    }

    // Check if video exists
    const videoResult = await pool.query(
      'SELECT id, author_id FROM videos WHERE id = $1 AND is_active = true',
      [videoId]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
        timestamp: new Date().toISOString()
      });
    }

    const video = videoResult.rows[0];

    // Если пользователь - мастер, он может комментировать только свои видео
    // Клиенты могут комментировать любые видео
    if (userRole === 'master' && video.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Мастера могут комментировать только свои видео',
        timestamp: new Date().toISOString()
      });
    }

    // Start transaction for comment insertion and counter update
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert comment
      const commentResult = await client.query(
        'INSERT INTO video_comments (video_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [videoId, userId, content.trim(), parent_id || null]
      );

      // Update comment counter in videos table
      await client.query(
        'UPDATE videos SET comments = comments + 1 WHERE id = $1',
        [videoId]
      );

      await client.query('COMMIT');

      const comment = commentResult.rows[0];

      // Get user info for comment
      const userResult = await pool.query(
        'SELECT username, avatar, first_name, last_name FROM users WHERE id = $1',
        [userId]
      );

      comment.user = userResult.rows[0];

      res.json({
        success: true,
        data: comment,
        message: 'Comment added successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Video comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/videos/:id/comments - Get video comments
router.get('/:id/comments', async (req, res) => {
  try {
    const videoId = req.params.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        vc.*,
        u.username,
        u.avatar,
        u.first_name,
        u.last_name,
        CASE WHEN cl.id IS NOT NULL THEN true ELSE false END as is_liked
      FROM video_comments vc
      LEFT JOIN users u ON vc.user_id = u.id
      LEFT JOIN comment_likes cl ON vc.id = cl.comment_id AND cl.user_id = $4
      WHERE vc.video_id = $1 AND vc.is_active = true AND vc.parent_id IS NULL
      ORDER BY vc.created_at DESC
      LIMIT $2 OFFSET $3
    `, [videoId, limit, offset, req.user?.id || null]);

    // Get replies for each comment
    for (let comment of result.rows) {
      const repliesResult = await pool.query(`
        SELECT 
          vc.*,
          u.username,
          u.avatar,
          u.first_name,
          u.last_name,
          CASE WHEN cl.id IS NOT NULL THEN true ELSE false END as is_liked
        FROM video_comments vc
        LEFT JOIN users u ON vc.user_id = u.id
        LEFT JOIN comment_likes cl ON vc.id = cl.comment_id AND cl.user_id = $2
        WHERE vc.parent_id = $1 AND vc.is_active = true
        ORDER BY vc.created_at ASC
      `, [comment.id, req.user?.id || null]);
      
      comment.replies = repliesResult.rows;
    }

    res.json({
      success: true,
      data: result.rows,
      message: 'Comments retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Video comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve comments',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/videos/:id/view - Record video view with analytics
router.post('/:id/view', async (req, res) => {
  try {
    const videoId = req.params.id;
    const { durationWatched, completionRate } = req.body;

    // Update video views count
    await pool.query(
      'UPDATE videos SET views = views + 1 WHERE id = $1',
      [videoId]
    );

    // Record analytics
    await pool.query(`
      INSERT INTO video_analytics (video_id, user_id, event_type, duration_watched, completion_rate, device_type, user_agent, ip_address)
      VALUES ($1, $2, 'view', $3, $4, $5, $6, $7)
    `, [
      videoId,
      req.user?.id || null,
      durationWatched || 0,
      completionRate || 0,
      req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop',
      req.get('User-Agent'),
      req.ip
    ]);

    res.json({
      success: true,
      message: 'View recorded',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Video view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record view',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/videos/:id - Get single video
router.get('/:id', async (req, res) => {
  try {
    const videoId = req.params.id;

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

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
        timestamp: new Date().toISOString()
      });
    }

    const video = result.rows[0];

    // Check if user liked this video (if authenticated)
    if (req.user) {
      const likeResult = await pool.query(
        'SELECT id FROM video_likes WHERE video_id = $1 AND user_id = $2',
        [videoId, req.user.id]
      );
      video.is_liked = likeResult.rows.length > 0;
    }

    res.json({
      success: true,
      data: video,
      message: 'Video retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Video get error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve video',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/videos/comments/:id/like - Like/unlike comment
router.post('/comments/:id/like', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    // Check if comment exists
    const commentResult = await pool.query(
      'SELECT id, likes FROM video_comments WHERE id = $1 AND is_active = true',
      [commentId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already liked
    const likeResult = await pool.query(
      'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      [commentId, userId]
    );

    let isLiked;
    if (likeResult.rows.length > 0) {
      // Unlike
      await pool.query(
        'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
        [commentId, userId]
      );
      await pool.query(
        'UPDATE video_comments SET likes = likes - 1 WHERE id = $1',
        [commentId]
      );
      isLiked = false;
    } else {
      // Like
      await pool.query(
        'INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)',
        [commentId, userId]
      );
      await pool.query(
        'UPDATE video_comments SET likes = likes + 1 WHERE id = $1',
        [commentId]
      );
      isLiked = true;
    }

    // Get updated like count
    const updatedComment = await pool.query(
      'SELECT likes FROM video_comments WHERE id = $1',
      [commentId]
    );

    res.json({
      success: true,
      data: {
        comment_id: commentId,
        likes: updatedComment.rows[0].likes,
        is_liked: isLiked
      },
      message: isLiked ? 'Comment liked' : 'Comment unliked',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Comment like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like comment',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/videos/:id/bookmark - Add video to bookmarks
router.post('/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;

    // Check if video exists
    const videoResult = await pool.query(
      'SELECT id FROM videos WHERE id = $1 AND is_active = true',
      [videoId]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if already bookmarked
    const bookmarkResult = await pool.query(
      'SELECT id FROM video_likes WHERE video_id = $1 AND user_id = $2 AND is_bookmark = true',
      [videoId, userId]
    );

    if (bookmarkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Video already bookmarked',
        timestamp: new Date().toISOString()
      });
    }

    // Add to bookmarks
    await pool.query(
      'INSERT INTO video_likes (video_id, user_id, is_bookmark) VALUES ($1, $2, true)',
      [videoId, userId]
    );

    res.json({
      success: true,
      data: {
        video_id: videoId,
        is_bookmarked: true
      },
      message: 'Video bookmarked',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bookmark video',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/videos/:id/bookmark - Remove video from bookmarks
router.delete('/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;

    // Check if bookmark exists
    const bookmarkResult = await pool.query(
      'SELECT id FROM video_likes WHERE video_id = $1 AND user_id = $2 AND is_bookmark = true',
      [videoId, userId]
    );

    if (bookmarkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found',
        timestamp: new Date().toISOString()
      });
    }

    // Remove from bookmarks
    await pool.query(
      'DELETE FROM video_likes WHERE video_id = $1 AND user_id = $2 AND is_bookmark = true',
      [videoId, userId]
    );

    res.json({
      success: true,
      data: {
        video_id: videoId,
        is_bookmarked: false
      },
      message: 'Bookmark removed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove bookmark',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/videos/bookmarked - Get bookmarked videos for user
router.get('/bookmarked', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        v.*,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar,
        vl.created_at as bookmarked_at
      FROM videos v
      INNER JOIN video_likes vl ON v.id = vl.video_id
      INNER JOIN users u ON v.author_id = u.id
      WHERE vl.user_id = $1 AND vl.is_bookmark = true
      ORDER BY vl.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, limit, offset]);

    res.json({
      success: true,
      data: result.rows,
      message: 'Bookmarked videos retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get bookmarked videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookmarked videos',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/videos/:id - Delete video (только для автора или админа)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if video exists
    const videoResult = await pool.query(
      'SELECT id, author_id, video_url, thumbnail_url FROM videos WHERE id = $1',
      [videoId]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
        timestamp: new Date().toISOString()
      });
    }

    const video = videoResult.rows[0];

    // Check permissions (only author or admin can delete)
    if (video.author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own videos.',
        timestamp: new Date().toISOString()
      });
    }

    // Delete video file from filesystem
    if (video.video_url) {
      const fs = require('fs');
      const path = require('path');
      const videoPath = path.join('/app', video.video_url);
      try {
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
        }
      } catch (fileError) {
        console.warn('Failed to delete video file:', fileError.message);
      }
    }

    // Delete thumbnail file from filesystem
    if (video.thumbnail_url) {
      const fs = require('fs');
      const path = require('path');
      const thumbnailPath = path.join('/app', video.thumbnail_url);
      try {
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      } catch (fileError) {
        console.warn('Failed to delete thumbnail file:', fileError.message);
      }
    }

    // Delete from database (cascade will handle related records)
    await pool.query('DELETE FROM videos WHERE id = $1', [videoId]);

    res.json({
      success: true,
      message: 'Video deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

