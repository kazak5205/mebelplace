const express = require('express');
const multer = require('multer');
const { pool } = require('../config/database');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const videoService = require('../services/videoService');
const redisClient = require('../config/redis');
const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('[VIDEO UPLOAD] Setting destination to /app/uploads/videos/');
    cb(null, '/app/uploads/videos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'video-' + uniqueSuffix + '.' + file.originalname.split('.').pop();
    console.log('[VIDEO UPLOAD] Generated filename:', filename);
    cb(null, filename);
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
  console.log('[VIDEO UPLOAD] Upload request received');
  console.log('[VIDEO UPLOAD] User:', req.user);
  console.log('[VIDEO UPLOAD] File:', req.file);
  console.log('[VIDEO UPLOAD] Body:', req.body);
  
  try {
    if (!req.file) {
      console.log('[VIDEO UPLOAD] No file provided');
      return res.status(400).json({
        success: false,
        message: 'No video file provided',
        timestamp: new Date().toISOString()
      });
    }

    const { title, description, category, tags } = req.body;
    const videoData = {
      title,
      description,
      videoUrl: `/uploads/videos/${req.file.filename}`,
      thumbnailUrl: null, // Will be generated
      duration: 0, // Will be calculated
      fileSize: req.file.size,
      authorId: req.user.id,
      category: category || 'general',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };

    console.log('[VIDEO UPLOAD] Creating video with data:', videoData);
    const video = await videoService.createVideo(videoData);
    console.log('[VIDEO UPLOAD] Video created:', video.id);
    
    // Generate thumbnail immediately for fast preview
    try {
      console.log('[VIDEO UPLOAD] Generating thumbnail...');
      await videoService.generateThumbnail(req.file.path, video.id);
      console.log('[VIDEO UPLOAD] Thumbnail generated');
    } catch (error) {
      console.error('[VIDEO UPLOAD] Error generating thumbnail:', error);
    }
    
    // Calculate duration asynchronously
    console.log('[VIDEO UPLOAD] Calculating duration...');
    videoService.calculateDuration(req.file.path, video.id);

    console.log('[VIDEO UPLOAD] Upload successful');
    res.json({
      success: true,
      data: video,
      message: 'Video uploaded successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[VIDEO UPLOAD] Upload error:', error);
    console.error('[VIDEO UPLOAD] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/videos/feed - Get video feed with admin priorities (every 5th video is admin-selected)
router.get('/feed', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, author_id } = req.query;
    const offset = (page - 1) * limit;

    // ✅ Redis cache для feed (TTL 3 минуты)
    const cacheKey = `feed:${page}:${limit}:${category || 'all'}:${author_id || 'all'}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`[FEED] Cache HIT: ${cacheKey}`);
      return res.json(JSON.parse(cached));
    }
    console.log(`[FEED] Cache MISS: ${cacheKey}`);

    // Get all videos with their priority information
    let query = `
      SELECT 
        v.*,
        v.views as views_count,
        u.username,
        u.avatar,
        u.first_name,
        u.last_name,
        u.company_name,
        u.role,
        avp.priority_order,
        avp.is_featured,
        COUNT(DISTINCT vl.id)::int as like_count,
        COUNT(DISTINCT vc.id)::int as comment_count
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
      GROUP BY v.id, v.title, v.description, v.video_url, v.thumbnail_url, v.duration, v.file_size, v.author_id, v.category, v.tags, v.views, v.likes, v.is_public, v.is_active, v.created_at, v.updated_at, u.username, u.avatar, u.first_name, u.last_name, u.company_name, u.role, avp.priority_order, avp.is_featured
      ORDER BY v.created_at DESC
    `;

    const result = await pool.query(query, params);
    const allVideos = result.rows;

    // Get admin-selected videos for insertion
    let adminVideosQuery = `
      SELECT 
        v.*,
        v.views as views_count,
        u.username,
        u.avatar,
        u.first_name,
        u.last_name,
        u.company_name,
        u.role,
        avp.priority_order,
        avp.is_featured,
        COUNT(DISTINCT vl.id)::int as like_count,
        COUNT(DISTINCT vc.id)::int as comment_count
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
      GROUP BY v.id, v.title, v.description, v.video_url, v.thumbnail_url, v.duration, v.file_size, v.author_id, v.category, v.tags, v.views, v.likes, v.is_public, v.is_active, v.created_at, v.updated_at, u.username, u.avatar, u.first_name, u.last_name, u.company_name, u.role, avp.priority_order, avp.is_featured
      ORDER BY avp.priority_order ASC, v.created_at DESC
    `;

    const adminResult = await pool.query(adminVideosQuery, adminParams);
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

    const responseData = {
      success: true,
      data: {
        videos: pageVideos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mixedVideos.length,
          adminVideos: adminVideos.length
        }
      },
      message: 'Video feed retrieved successfully',
      timestamp: new Date().toISOString()
    };

    // ✅ Сохраняем в кэш (TTL 3 минуты)
    await redisClient.set(cacheKey, JSON.stringify(responseData), 'EX', 180);

    res.json(responseData);

  } catch (error) {
    console.error('Video feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve video feed',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/videos/:id/like - Like/unlike video
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;
    
    console.log('[LIKE] Video ID:', videoId);
    console.log('[LIKE] User ID:', userId);

    // Check if video exists
    const videoResult = await pool.query(
      'SELECT id, likes FROM videos WHERE id = $1 AND is_active = true',
      [videoId]
    );

    if (videoResult.rows.length === 0) {
      console.log('[LIKE] Video not found:', videoId);
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
    
    console.log('[LIKE] Existing likes:', likeResult.rows.length);

    let isLiked;
    if (likeResult.rows.length > 0) {
      // Unlike
      console.log('[LIKE] Removing like...');
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
      console.log('[LIKE] Adding like...');
      const insertResult = await pool.query(
        'INSERT INTO video_likes (video_id, user_id) VALUES ($1, $2) RETURNING *',
        [videoId, userId]
      );
      console.log('[LIKE] Insert result:', insertResult.rows[0]);
      await pool.query(
        'UPDATE videos SET likes = likes + 1 WHERE id = $1',
        [videoId]
      );
      isLiked = true;
    }
    
    console.log('[LIKE] isLiked:', isLiked);

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

    // Insert comment
    const commentResult = await pool.query(
      'INSERT INTO video_comments (video_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [videoId, userId, content.trim(), parent_id || null]
    );

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

// GET /api/videos/trending - Получить трендовые видео
router.get('/trending', async (req, res) => {
  try {
    const { period = 'week', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let dateFilter = '';
    switch (period) {
      case 'day':
        dateFilter = "AND v.created_at >= NOW() - INTERVAL '1 day'";
        break;
      case 'week':
        dateFilter = "AND v.created_at >= NOW() - INTERVAL '1 week'";
        break;
      case 'month':
        dateFilter = "AND v.created_at >= NOW() - INTERVAL '1 month'";
        break;
      case 'all':
        dateFilter = '';
        break;
    }

    const result = await pool.query(`
      SELECT 
        v.*,
        u.id as master_id,
        u.username as master_name,
        u.first_name as master_first_name,
        u.last_name as master_last_name,
        u.avatar as master_avatar,
        COUNT(DISTINCT vl.id) as likes_count,
        COUNT(DISTINCT vc.id) as comments_count,
        COUNT(DISTINCT vv.id) as views_count,
        COUNT(DISTINCT vb.id) as bookmarks_count,
        (COUNT(DISTINCT vl.id) * 0.7 + COUNT(DISTINCT vv.id) * 0.3) as trending_score
      FROM videos v
      JOIN users u ON v.author_id = u.id
      LEFT JOIN video_likes vl ON v.id = vl.video_id
      LEFT JOIN video_comments vc ON v.id = vc.video_id
      LEFT JOIN video_views vv ON v.id = vv.video_id
      LEFT JOIN video_bookmarks vb ON v.id = vb.video_id
      WHERE v.is_active = true ${dateFilter}
      GROUP BY v.id, u.id, u.username, u.first_name, u.last_name, u.avatar
      HAVING COUNT(DISTINCT vl.id) > 0 OR COUNT(DISTINCT vv.id) > 0
      ORDER BY trending_score DESC, v.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      success: true,
      data: result.rows,
      message: 'Trending videos retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get trending videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending videos',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/videos/bookmarked - Получить избранные видео пользователя
router.get('/bookmarked', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        v.*,
        u.id as master_id,
        u.username as master_name,
        u.first_name as master_first_name,
        u.last_name as master_last_name,
        u.avatar as master_avatar,
        COUNT(DISTINCT vl.id) as likes_count,
        COUNT(DISTINCT vc.id) as comments_count,
        COUNT(DISTINCT vv.id) as views_count,
        vb.created_at as bookmarked_at
      FROM video_bookmarks vb
      JOIN videos v ON vb.video_id = v.id
      JOIN users u ON v.author_id = u.id
      LEFT JOIN video_likes vl ON v.id = vl.video_id
      LEFT JOIN video_comments vc ON v.id = vc.video_id
      LEFT JOIN video_views vv ON v.id = vv.video_id
      WHERE vb.user_id = $1 AND v.is_active = true
      GROUP BY v.id, u.id, u.username, u.first_name, u.last_name, u.avatar, vb.created_at
      ORDER BY vb.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    res.json({
      success: true,
      data: result.rows,
      message: 'Bookmarked videos retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get bookmarked videos error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookmarked videos',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/videos/liked - Get user's liked videos
router.get('/liked', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        v.*,
        u.username,
        u.avatar,
        u.first_name,
        u.last_name,
        vl.created_at as liked_at
      FROM video_likes vl
      INNER JOIN videos v ON vl.video_id = v.id
      LEFT JOIN users u ON v.author_id = u.id
      WHERE vl.user_id = $1 AND v.is_active = true
      ORDER BY vl.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM video_likes vl INNER JOIN videos v ON vl.video_id = v.id WHERE vl.user_id = $1 AND v.is_active = true',
      [userId]
    );

    res.json({
      success: true,
      data: {
        videos: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].count)
        }
      },
      message: 'Liked videos retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Liked videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve liked videos',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/videos/master/:id - Get master profile with videos
router.get('/master/:id', async (req, res) => {
  try {
    const masterId = req.params.id;

    // Get master info
    const masterResult = await pool.query(`
      SELECT 
        id,
        username,
        first_name,
        last_name,
        phone,
        avatar,
        role,
        bio,
        company_name,
        company_address,
        company_description,
        created_at
      FROM users
      WHERE id = $1 AND is_active = true AND role = 'master'
    `, [masterId]);

    if (masterResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Master not found',
        timestamp: new Date().toISOString()
      });
    }

    const master = masterResult.rows[0];

    // Get subscribers count
    const subscribersResult = await pool.query(
      'SELECT COUNT(*) FROM subscriptions WHERE master_id = $1',
      [masterId]
    );
    master.subscribersCount = parseInt(subscribersResult.rows[0].count);

    // Get master's videos
    const videosResult = await pool.query(`
      SELECT 
        v.*,
        u.username,
        u.avatar,
        u.first_name,
        u.last_name,
        u.company_name,
        u.role,
        COUNT(DISTINCT vl.id)::int as like_count,
        COUNT(DISTINCT vc.id)::int as comment_count
      FROM videos v
      LEFT JOIN users u ON v.author_id = u.id
      LEFT JOIN video_likes vl ON v.id = vl.video_id
      LEFT JOIN video_comments vc ON v.id = vc.video_id AND vc.is_active = true
      WHERE v.author_id = $1 AND v.is_active = true
      GROUP BY v.id, u.username, u.avatar, u.first_name, u.last_name, u.company_name, u.role
      ORDER BY v.created_at DESC
    `, [masterId]);

    res.json({
      success: true,
      data: {
        master,
        videos: videosResult.rows
      },
      message: 'Master profile retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get master profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get master profile',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/videos/:id - Get single video
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const videoId = req.params.id;

    const result = await pool.query(`
      SELECT 
        v.*,
        u.username,
        u.avatar,
        u.first_name,
        u.last_name,
        u.company_name,
        u.role,
        COUNT(DISTINCT vl.id)::int as like_count,
        COUNT(DISTINCT vc.id)::int as comment_count
      FROM videos v
      LEFT JOIN users u ON v.author_id = u.id
      LEFT JOIN video_likes vl ON v.id = vl.video_id
      LEFT JOIN video_comments vc ON v.id = vc.video_id AND vc.is_active = true
      WHERE v.id = $1 AND v.is_active = true
      GROUP BY v.id, u.username, u.avatar, u.first_name, u.last_name, u.company_name, u.role
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

// POST /api/videos/:id/bookmark - Добавить видео в избранное
router.post('/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Проверяем, существует ли видео
    const videoResult = await pool.query(
      'SELECT id FROM videos WHERE id = $1 AND is_active = true',
      [id]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем, не добавлено ли уже в избранное
    const existingBookmark = await pool.query(
      'SELECT id FROM video_bookmarks WHERE user_id = $1 AND video_id = $2',
      [userId, id]
    );

    if (existingBookmark.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Video already bookmarked',
        timestamp: new Date().toISOString()
      });
    }

    // Добавляем в избранное
    const result = await pool.query(
      'INSERT INTO video_bookmarks (user_id, video_id) VALUES ($1, $2) RETURNING *',
      [userId, id]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Video bookmarked successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bookmark video error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bookmark video',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/videos/:id/bookmark - Удалить видео из избранного
router.delete('/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM video_bookmarks WHERE user_id = $1 AND video_id = $2 RETURNING *',
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Video removed from bookmarks successfully',
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

module.exports = router;

