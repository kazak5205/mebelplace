const express = require('express');
const multer = require('multer');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Configure multer for admin video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'admin-video-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for admin uploads
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// Middleware to log admin actions
const logAdminAction = (action, resourceType, resourceId = null, oldValues = null, newValues = null) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      // Log the action after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        pool.query(
          'INSERT INTO admin_audit_log (admin_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [
            req.user.id,
            action,
            resourceType,
            resourceId,
            oldValues ? JSON.stringify(oldValues) : null,
            newValues ? JSON.stringify(newValues) : null,
            req.ip,
            req.get('User-Agent')
          ]
        ).catch(err => console.error('Failed to log admin action:', err));
      }
      originalSend.call(this, data);
    };
    next();
  };
};

// ==================== DASHBOARD & ANALYTICS ====================

// GET /api/admin/dashboard - Get admin dashboard data
router.get('/dashboard', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get basic stats
    const [
      totalUsers,
      totalVideos,
      totalViews,
      totalLikes,
      newUsers,
      newVideos,
      topVideos,
      userGrowth,
      videoGrowth,
      categoryStats
    ] = await Promise.all([
      // Total users
      pool.query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
      
      // Total videos
      pool.query('SELECT COUNT(*) as count FROM videos WHERE is_active = true'),
      
      // Total views
      pool.query('SELECT SUM(views) as total FROM videos WHERE is_active = true'),
      
      // Total likes
      pool.query('SELECT SUM(likes) as total FROM videos WHERE is_active = true'),
      
      // New users in period
      pool.query('SELECT COUNT(*) as count FROM users WHERE created_at >= $1 AND is_active = true', [startDate]),
      
      // New videos in period
      pool.query('SELECT COUNT(*) as count FROM videos WHERE created_at >= $1 AND is_active = true', [startDate]),
      
      // Top performing videos
      pool.query(`
        SELECT v.id, v.title, v.views, v.likes, v.created_at, u.username
        FROM videos v
        LEFT JOIN users u ON v.author_id = u.id
        WHERE v.is_active = true
        ORDER BY (v.views + v.likes) DESC
        LIMIT 10
      `),
      
      // User growth over time
      pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at >= $1 AND is_active = true
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [startDate]),
      
      // Video growth over time
      pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM videos
        WHERE created_at >= $1 AND is_active = true
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [startDate]),
      
      // Category statistics
      pool.query(`
        SELECT category, COUNT(*) as count, AVG(views) as avg_views, AVG(likes) as avg_likes
        FROM videos
        WHERE is_active = true AND created_at >= $1
        GROUP BY category
        ORDER BY count DESC
      `, [startDate])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: parseInt(totalUsers.rows[0].count),
          totalVideos: parseInt(totalVideos.rows[0].count),
          totalViews: parseInt(totalViews.rows[0].total) || 0,
          totalLikes: parseInt(totalLikes.rows[0].total) || 0,
          newUsers: parseInt(newUsers.rows[0].count),
          newVideos: parseInt(newVideos.rows[0].count)
        },
        topVideos: topVideos.rows,
        userGrowth: userGrowth.rows,
        videoGrowth: videoGrowth.rows,
        categoryStats: categoryStats.rows,
        period
      },
      message: 'Dashboard data retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/admin/analytics/videos - Get video analytics
router.get('/analytics/videos', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { videoId, period = '7d', groupBy = 'day' } = req.query;
    
    let startDate;
    switch (period) {
      case '1d':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    let groupByClause;
    switch (groupBy) {
      case 'hour':
        groupByClause = "DATE_TRUNC('hour', created_at)";
        break;
      case 'day':
        groupByClause = "DATE(created_at)";
        break;
      case 'week':
        groupByClause = "DATE_TRUNC('week', created_at)";
        break;
      default:
        groupByClause = "DATE(created_at)";
    }

    let query = `
      SELECT 
        ${groupByClause} as period,
        event_type,
        COUNT(*) as count,
        AVG(duration_watched) as avg_duration,
        AVG(completion_rate) as avg_completion
      FROM video_analytics
      WHERE created_at >= $1
    `;
    
    const params = [startDate];
    
    if (videoId) {
      query += ` AND video_id = $${params.length + 1}`;
      params.push(videoId);
    }
    
    query += `
      GROUP BY ${groupByClause}, event_type
      ORDER BY period DESC, event_type
    `;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      message: 'Video analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Video analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve video analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== VIDEO MANAGEMENT ====================

// GET /api/admin/videos - Get all videos with admin controls
router.get('/videos', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        v.*,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar,
        u.company_name,
        u.role,
        avp.priority_order,
        avp.is_featured,
        COUNT(vl.id) as like_count,
        COUNT(vc.id) as comment_count
      FROM videos v
      LEFT JOIN users u ON v.author_id = u.id
      LEFT JOIN admin_video_priorities avp ON v.id = avp.video_id
      LEFT JOIN video_likes vl ON v.id = vl.video_id
      LEFT JOIN video_comments vc ON v.id = vc.video_id AND vc.is_active = true
    `;
    
    const whereConditions = [];
    const params = [];
    let paramCount = 0;

    if (status) {
      if (status === 'active') {
        whereConditions.push(`v.is_active = true`);
      } else if (status === 'inactive') {
        whereConditions.push(`v.is_active = false`);
      } else if (status === 'featured') {
        whereConditions.push(`avp.is_featured = true`);
      }
    }

    if (category) {
      whereConditions.push(`v.category = $${++paramCount}`);
      params.push(category);
    }

    if (search) {
      whereConditions.push(`(v.title ILIKE $${++paramCount} OR v.description ILIKE $${++paramCount})`);
      params.push(`%${search}%`, `%${search}%`);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += `
      GROUP BY v.id, u.username, u.first_name, u.last_name, u.avatar, u.company_name, u.role, avp.priority_order, avp.is_featured
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT v.id) as total
      FROM videos v
      LEFT JOIN admin_video_priorities avp ON v.id = avp.video_id
    `;
    
    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    const countResult = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      data: {
        videos: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          pages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
        }
      },
      message: 'Videos retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve videos',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/admin/videos/upload - Upload video as admin
router.post('/videos/upload', authenticateToken, requireRole(['admin']), upload.single('video'), logAdminAction('video_upload', 'video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided',
        timestamp: new Date().toISOString()
      });
    }

    const { title, description, category, tags, priorityOrder, isFeatured } = req.body;
    
    // Create video record
    const videoResult = await pool.query(`
      INSERT INTO videos (title, description, video_url, author_id, category, tags, is_public, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true, true)
      RETURNING *
    `, [
      title,
      description,
      `/uploads/videos/${req.file.filename}`,
      req.user.id, // Admin as author
      category || 'general',
      tags ? tags.split(',').map(tag => tag.trim()) : []
    ]);

    const video = videoResult.rows[0];

    // Set priority if provided
    if (priorityOrder || isFeatured) {
      await pool.query(`
        INSERT INTO admin_video_priorities (video_id, priority_order, is_featured, admin_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (video_id) DO UPDATE SET
          priority_order = EXCLUDED.priority_order,
          is_featured = EXCLUDED.is_featured,
          updated_at = CURRENT_TIMESTAMP
      `, [
        video.id,
        priorityOrder ? parseInt(priorityOrder) : 0,
        isFeatured === 'true',
        req.user.id
      ]);
    }

    res.json({
      success: true,
      data: video,
      message: 'Video uploaded successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/admin/videos/:id/priority - Update video priority
router.put('/videos/:id/priority', authenticateToken, requireRole(['admin']), logAdminAction('update_priority', 'video'), async (req, res) => {
  try {
    const { id } = req.params;
    const { priorityOrder, isFeatured } = req.body;

    // Check if video exists
    const videoResult = await pool.query('SELECT id FROM videos WHERE id = $1', [id]);
    if (videoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
        timestamp: new Date().toISOString()
      });
    }

    // Update or insert priority
    await pool.query(`
      INSERT INTO admin_video_priorities (video_id, priority_order, is_featured, admin_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (video_id) DO UPDATE SET
        priority_order = EXCLUDED.priority_order,
        is_featured = EXCLUDED.is_featured,
        updated_at = CURRENT_TIMESTAMP
    `, [id, priorityOrder, isFeatured, req.user.id]);

    res.json({
      success: true,
      message: 'Video priority updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update video priority error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video priority',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/admin/videos/:id/status - Update video status
router.put('/videos/:id/status', authenticateToken, requireRole(['admin']), logAdminAction('update_status', 'video'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, isPublic } = req.body;

    const updateFields = [];
    const params = [];
    let paramCount = 0;

    if (isActive !== undefined) {
      updateFields.push(`is_active = $${++paramCount}`);
      params.push(isActive);
    }

    if (isPublic !== undefined) {
      updateFields.push(`is_public = $${++paramCount}`);
      params.push(isPublic);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
        timestamp: new Date().toISOString()
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    await pool.query(`
      UPDATE videos 
      SET ${updateFields.join(', ')}
      WHERE id = $${++paramCount}
    `, params);

    res.json({
      success: true,
      message: 'Video status updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update video status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video status',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/admin/videos/:id - Delete video
router.delete('/videos/:id', authenticateToken, requireRole(['admin']), logAdminAction('delete_video', 'video'), async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete - set is_active to false
    await pool.query('UPDATE videos SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

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

// ==================== USER MANAGEMENT ====================

// GET /api/admin/users - Get all users
router.get('/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.*,
        COUNT(v.id) as video_count,
        COUNT(o.id) as order_count
      FROM users u
      LEFT JOIN videos v ON u.id = v.author_id AND v.is_active = true
      LEFT JOIN orders o ON u.id = o.client_id AND o.is_active = true
    `;
    
    const whereConditions = [];
    const params = [];
    let paramCount = 0;

    if (role) {
      whereConditions.push(`u.role = $${++paramCount}`);
      params.push(role);
    }

    if (search) {
      whereConditions.push(`(u.username ILIKE $${++paramCount} OR u.first_name ILIKE $${++paramCount} OR u.last_name ILIKE $${++paramCount} OR u.email ILIKE $${++paramCount})`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += `
      GROUP BY u.id
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM users u`;
    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    const countResult = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      data: {
        users: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          pages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
        }
      },
      message: 'Users retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/admin/users/:id/status - Update user status
router.put('/users/:id/status', authenticateToken, requireRole(['admin']), logAdminAction('update_user_status', 'user'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const updateFields = [];
    const params = [];
    let paramCount = 0;

    if (isActive !== undefined) {
      updateFields.push(`is_active = $${++paramCount}`);
      params.push(isActive);
    }

    if (role) {
      updateFields.push(`role = $${++paramCount}`);
      params.push(role);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
        timestamp: new Date().toISOString()
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    await pool.query(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${++paramCount}
    `, params);

    res.json({
      success: true,
      message: 'User status updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== CONTENT CATEGORIES ====================

// GET /api/admin/categories - Get all categories
router.get('/categories', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        cc.*,
        COUNT(v.id) as video_count
      FROM content_categories cc
      LEFT JOIN videos v ON cc.slug = v.category AND v.is_active = true
      GROUP BY cc.id
      ORDER BY cc.sort_order, cc.name
    `);

    res.json({
      success: true,
      data: result.rows,
      message: 'Categories retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/admin/categories - Create category
router.post('/categories', authenticateToken, requireRole(['admin']), logAdminAction('create_category', 'category'), async (req, res) => {
  try {
    const { name, slug, description, color, sortOrder } = req.body;

    const result = await pool.query(`
      INSERT INTO content_categories (name, slug, description, color, sort_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, slug, description, color || '#3B82F6', sortOrder || 0]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Category created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/admin/categories/:id - Update category
router.put('/categories/:id', authenticateToken, requireRole(['admin']), logAdminAction('update_category', 'category'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, color, sortOrder, isActive } = req.body;

    const updateFields = [];
    const params = [];
    let paramCount = 0;

    if (name) {
      updateFields.push(`name = $${++paramCount}`);
      params.push(name);
    }

    if (slug) {
      updateFields.push(`slug = $${++paramCount}`);
      params.push(slug);
    }

    if (description !== undefined) {
      updateFields.push(`description = $${++paramCount}`);
      params.push(description);
    }

    if (color) {
      updateFields.push(`color = $${++paramCount}`);
      params.push(color);
    }

    if (sortOrder !== undefined) {
      updateFields.push(`sort_order = $${++paramCount}`);
      params.push(sortOrder);
    }

    if (isActive !== undefined) {
      updateFields.push(`is_active = $${++paramCount}`);
      params.push(isActive);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
        timestamp: new Date().toISOString()
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    await pool.query(`
      UPDATE content_categories 
      SET ${updateFields.join(', ')}
      WHERE id = $${++paramCount}
    `, params);

    res.json({
      success: true,
      message: 'Category updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/admin/categories/:id - Delete category
router.delete('/categories/:id', authenticateToken, requireRole(['admin']), logAdminAction('delete_category', 'category'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is used by videos
    const videoCount = await pool.query('SELECT COUNT(*) as count FROM videos WHERE category = (SELECT slug FROM content_categories WHERE id = $1)', [id]);
    
    if (parseInt(videoCount.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that is used by videos',
        timestamp: new Date().toISOString()
      });
    }

    await pool.query('DELETE FROM content_categories WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Category deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== SUPPORT TICKETS ====================

// GET /api/admin/support/tickets - Get all support tickets
router.get('/support/tickets', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        st.*,
        u.username,
        u.first_name,
        u.last_name,
        u.phone,
        admin_u.username as assigned_admin_username,
        (SELECT COUNT(*) FROM support_responses WHERE ticket_id = st.id) as response_count
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      LEFT JOIN users admin_u ON st.assigned_to = admin_u.id
    `;
    
    const whereConditions = [];
    const params = [];
    let paramCount = 0;

    if (status) {
      whereConditions.push(`st.status = $${++paramCount}`);
      params.push(status);
    }

    if (priority) {
      whereConditions.push(`st.priority = $${++paramCount}`);
      params.push(priority);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += `
      ORDER BY st.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM support_tickets st`;
    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    const countResult = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      data: {
        tickets: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          pages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
        }
      },
      message: 'Support tickets retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin support tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve support tickets',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/admin/support/tickets/:id/response - Admin response to ticket
router.post('/support/tickets/:id/response', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const ticketId = req.params.id;
    const adminId = req.user.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
        timestamp: new Date().toISOString()
      });
    }

    // Вставляем ответ с is_admin_response = true
    const result = await pool.query(
      'INSERT INTO support_responses (ticket_id, user_id, message, is_admin_response) VALUES ($1, $2, $3, true) RETURNING *',
      [ticketId, adminId, message]
    );

    // Обновляем статус тикета на "in_progress" если был "open"
    await pool.query(
      `UPDATE support_tickets 
       SET status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END,
           assigned_to = $1,
           updated_at = NOW() 
       WHERE id = $2`,
      [adminId, ticketId]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Admin response added successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add admin response',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/admin/support/tickets/:id/status - Update ticket status
router.put('/support/tickets/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { status } = req.body;

    if (!['open', 'in_progress', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        timestamp: new Date().toISOString()
      });
    }

    await pool.query(
      'UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, ticketId]
    );

    res.json({
      success: true,
      message: 'Ticket status updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== AUDIT LOG ====================

// GET /api/admin/audit-log - Get admin audit log
router.get('/audit-log', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 50, action, resourceType, adminId } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        al.*,
        u.username as admin_username,
        u.first_name as admin_first_name,
        u.last_name as admin_last_name
      FROM admin_audit_log al
      LEFT JOIN users u ON al.admin_id = u.id
    `;
    
    const whereConditions = [];
    const params = [];
    let paramCount = 0;

    if (action) {
      whereConditions.push(`al.action = $${++paramCount}`);
      params.push(action);
    }

    if (resourceType) {
      whereConditions.push(`al.resource_type = $${++paramCount}`);
      params.push(resourceType);
    }

    if (adminId) {
      whereConditions.push(`al.admin_id = $${++paramCount}`);
      params.push(adminId);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += `
      ORDER BY al.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM admin_audit_log al`;
    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    const countResult = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      data: {
        logs: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          pages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
        }
      },
      message: 'Audit log retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit log',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
