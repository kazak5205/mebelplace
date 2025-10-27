const express = require('express');
const { pool } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

// GET /api/search - Search videos, channels, and hashtags
router.get('/', optionalAuth, async (req, res) => {
  console.log('Search endpoint hit with query:', req.query);
  
  // Fix UTF-8 encoding issue from nginx
  let query = req.query.q;
  if (query && typeof query === 'string') {
    try {
      // Check if it's double-encoded Latin-1 as UTF-8
      const buffer = Buffer.from(query, 'latin1');
      const decoded = buffer.toString('utf8');
      if (/[а-яА-ЯёЁ]/.test(decoded)) {
        query = decoded;
        console.log('Fixed encoding:', { original: req.query.q, fixed: query });
      }
    } catch (e) {
      console.error('Encoding fix failed:', e);
    }
  }
  
  try {
    const { 
      type = 'all', 
      page = 1, 
      limit = 20, 
      category 
    } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long',
        timestamp: new Date().toISOString()
      });
    }

    const offset = (page - 1) * limit;
    const searchTerm = query.trim();
    const params = [];
    let paramCount = 0;

    let searchQuery = `
      SELECT 
        v.*,
        u.username,
        u.avatar,
        u.first_name,
        u.last_name,
        COUNT(vl.id) as like_count,
        COUNT(vc.id) as comment_count,
        'video' as result_type
      FROM videos v
      LEFT JOIN users u ON v.author_id = u.id
      LEFT JOIN video_likes vl ON v.id = vl.video_id
      LEFT JOIN video_comments vc ON v.id = vc.video_id AND vc.is_active = true
      WHERE v.is_active = true AND v.is_public = true
    `;

    // Add search conditions based on type - FIXED: proper AND/OR logic with brackets
    searchQuery += ` AND (`;
    
    const searchConditions = [];
    
    if (type === 'video' || type === 'all') {
      searchConditions.push(`(
        v.title ILIKE $${++paramCount} 
        OR v.description ILIKE $${++paramCount}
        OR $${++paramCount} = ANY(v.tags)
      )`);
      params.push(`%${searchTerm}%`, `%${searchTerm}%`, searchTerm);
    }

    if (type === 'channel' || type === 'all') {
      searchConditions.push(`(
        u.username ILIKE $${++paramCount}
        OR u.first_name ILIKE $${++paramCount}
        OR u.last_name ILIKE $${++paramCount}
      )`);
      params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }
    
    searchQuery += searchConditions.join(' OR ');
    searchQuery += `)`;

    if (category) {
      searchQuery += ` AND v.category = $${++paramCount}`;
      params.push(category);
    }

    searchQuery += `
      GROUP BY v.id, u.username, u.avatar, u.first_name, u.last_name
      ORDER BY v.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    params.push(limit, offset);

    const result = await pool.query(searchQuery, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT v.id) as total
      FROM videos v
      LEFT JOIN users u ON v.author_id = u.id
      WHERE v.is_active = true AND v.is_public = true
    `;
    
    const countParams = [];
    let countParamCount = 0;

    // FIXED: Same logic as main query with proper brackets
    countQuery += ` AND (`;
    
    const countSearchConditions = [];
    
    if (type === 'video' || type === 'all') {
      countSearchConditions.push(`(
        v.title ILIKE $${++countParamCount} 
        OR v.description ILIKE $${++countParamCount}
        OR $${++countParamCount} = ANY(v.tags)
      )`);
      countParams.push(`%${searchTerm}%`, `%${searchTerm}%`, searchTerm);
    }

    if (type === 'channel' || type === 'all') {
      countSearchConditions.push(`(
        u.username ILIKE $${++countParamCount}
        OR u.first_name ILIKE $${++countParamCount}
        OR u.last_name ILIKE $${++countParamCount}
      )`);
      countParams.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }
    
    countQuery += countSearchConditions.join(' OR ');
    countQuery += `)`;

    if (category) {
      countQuery += ` AND v.category = $${++countParamCount}`;
      countParams.push(category);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Add user's likes for each video (if authenticated)
    if (req.user) {
      for (let video of result.rows) {
        const likeResult = await pool.query(
          'SELECT id FROM video_likes WHERE video_id = $1 AND user_id = $2',
          [video.id, req.user.id]
        );
        video.is_liked = likeResult.rows.length > 0;
      }
    }

    res.json({
      success: true,
      data: {
        videos: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        search: {
          query: searchTerm,
          type,
          category: category || null
        }
      },
      message: 'Search results retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search videos',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
