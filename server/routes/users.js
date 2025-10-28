const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const redisClient = require('../config/redis');
const router = express.Router();

// GET /api/users - Получить список пользователей (с фильтрацией по роли)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id,
        username,
        first_name,
        last_name,
        phone,
        avatar,
        role,
        bio,
        created_at
      FROM users
      WHERE is_active = true
    `;
    
    const params = [];
    
    if (role) {
      query += ` AND role = $${params.length + 1}`;
      params.push(role);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Получаем общее количество
    let countQuery = 'SELECT COUNT(*) FROM users WHERE is_active = true';
    const countParams = [];
    
    if (role) {
      countQuery += ' AND role = $1';
      countParams.push(role);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/users/:id/subscribe - Подписаться на мастера
router.post('/:id/subscribe', authenticateToken, async (req, res) => {
  try {
    const channelId = req.params.id; // ID мастера
    const subscriberId = req.user.id; // ID подписчика

    // Проверяем, что мастер существует
    const userResult = await pool.query(
      'SELECT id, role FROM users WHERE id = $1 AND is_active = true',
      [channelId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Нельзя подписаться на самого себя
    if (subscriberId === channelId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot subscribe to yourself',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем, не подписан ли уже
    const existingSubscription = await pool.query(
      'SELECT id FROM subscriptions WHERE user_id = $1 AND master_id = $2 AND is_active = true',
      [subscriberId, channelId]
    );

    if (existingSubscription.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already subscribed',
        timestamp: new Date().toISOString()
      });
    }

    // Создаём подписку
    const result = await pool.query(
      'INSERT INTO subscriptions (user_id, master_id) VALUES ($1, $2) RETURNING *',
      [subscriberId, channelId]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Subscribed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/users/:id/unsubscribe - Отписаться от мастера
router.delete('/:id/unsubscribe', authenticateToken, async (req, res) => {
  try {
    const channelId = req.params.id;
    const subscriberId = req.user.id;

    const result = await pool.query(
      'DELETE FROM subscriptions WHERE user_id = $1 AND master_id = $2 RETURNING *',
      [subscriberId, channelId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Unsubscribed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/users/:id/subscribers - Получить подписчиков мастера
router.get('/:id/subscribers', async (req, res) => {
  try {
    const channelId = req.params.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar,
        s.created_at as subscribed_at
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.master_id = $1 AND u.is_active = true AND s.is_active = true
      ORDER BY s.created_at DESC
      LIMIT $2 OFFSET $3
    `, [channelId, limit, offset]);

    // Получаем общее количество
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM subscriptions WHERE master_id = $1 AND is_active = true',
      [channelId]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        subscribers: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Subscribers retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscribers',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/users/:id/subscriptions - Получить подписки пользователя
router.get('/:id/subscriptions', async (req, res) => {
  try {
    const subscriberId = req.params.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar,
        u.role,
        u.bio,
        s.created_at as subscribed_at
      FROM subscriptions s
      JOIN users u ON s.master_id = u.id
      WHERE s.user_id = $1 AND u.is_active = true AND s.is_active = true
      ORDER BY s.created_at DESC
      LIMIT $2 OFFSET $3
    `, [subscriberId, limit, offset]);

    // Получаем общее количество
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM subscriptions WHERE user_id = $1 AND is_active = true',
      [subscriberId]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        subscriptions: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Subscriptions retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscriptions',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/users/:id/subscription-status - Проверить статус подписки
router.get('/:id/subscription-status', authenticateToken, async (req, res) => {
  try {
    const channelId = req.params.id;
    const subscriberId = req.user.id;

    const result = await pool.query(
      'SELECT id, created_at FROM subscriptions WHERE user_id = $1 AND master_id = $2 AND is_active = true',
      [subscriberId, channelId]
    );

    res.json({
      success: true,
      data: {
        isSubscribed: result.rows.length > 0,
        subscription: result.rows[0] || null
      },
      message: 'Subscription status retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/users/:id/block - Заблокировать пользователя
router.post('/:id/block', authenticateToken, async (req, res) => {
  try {
    const blockedId = req.params.id;
    const blockerId = req.user.id;
    const { reason } = req.body;

    // Нельзя заблокировать самого себя
    if (blockerId === blockedId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block yourself',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем, не заблокирован ли уже
    const existing = await pool.query(
      'SELECT id FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2',
      [blockerId, blockedId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already blocked',
        timestamp: new Date().toISOString()
      });
    }

    // Блокируем
    const result = await pool.query(
      'INSERT INTO blocked_users (blocker_id, blocked_id, reason) VALUES ($1, $2, $3) RETURNING *',
      [blockerId, blockedId, reason || null]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'User blocked successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block user',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/users/:id/unblock - Разблокировать пользователя
router.delete('/:id/unblock', authenticateToken, async (req, res) => {
  try {
    const blockedId = req.params.id;
    const blockerId = req.user.id;

    const result = await pool.query(
      'DELETE FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2 RETURNING *',
      [blockerId, blockedId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Block not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'User unblocked successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/users/blocked - Получить список заблокированных пользователей
router.get('/blocked', authenticateToken, async (req, res) => {
  try {
    const blockerId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar,
        b.reason,
        b.created_at as blocked_at
      FROM blocked_users b
      JOIN users u ON b.blocked_id = u.id
      WHERE b.blocker_id = $1
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `, [blockerId, limit, offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM blocked_users WHERE blocker_id = $1',
      [blockerId]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        blocked: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Blocked users retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blocked users',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/users/:id - Получить профиль пользователя по ID
// ВАЖНО: Этот роут должен быть ПОСЛЕ всех специфичных роутов (/blocked и т.д.)
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // ✅ Redis cache для профилей (TTL 5 минут)
    const cacheKey = `user:profile:${userId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`[USER PROFILE] Cache HIT: ${userId}`);
      return res.json(JSON.parse(cached));
    }
    console.log(`[USER PROFILE] Cache MISS: ${userId}`);

    const result = await pool.query(`
      SELECT 
        id,
        username,
        first_name,
        last_name,
        phone,
        email,
        avatar,
        role,
        bio,
        company_name,
        company_address,
        company_description,
        created_at,
        is_active
      FROM users
      WHERE id = $1 AND is_active = true
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const user = result.rows[0];

    // Если это мастер, получаем дополнительную статистику
    if (user.role === 'master') {
      // Количество подписчиков
      const subscribersResult = await pool.query(
        'SELECT COUNT(*) FROM subscriptions WHERE master_id = $1',
        [userId]
      );
      user.subscribers_count = parseInt(subscribersResult.rows[0].count);

      // Рейтинг и отзывы (если есть таблица reviews)
      try {
        const reviewsResult = await pool.query(
          'SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM reviews WHERE master_id = $1',
          [userId]
        );
        if (reviewsResult.rows[0]) {
          user.reviews_count = parseInt(reviewsResult.rows[0].count) || 0;
          user.rating = parseFloat(reviewsResult.rows[0].avg_rating) || 0;
        }
      } catch (error) {
        console.log('Reviews table might not exist:', error.message);
        user.reviews_count = 0;
        user.rating = 0;
      }
    }

    const responseData = {
      success: true,
      data: user,
      message: 'User profile retrieved successfully',
      timestamp: new Date().toISOString()
    };

    // ✅ Сохраняем в кэш (TTL 5 минут)
    await redisClient.set(cacheKey, JSON.stringify(responseData), 'EX', 300);

    res.json(responseData);

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

