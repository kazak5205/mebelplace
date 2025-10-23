const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// POST /api/subscriptions/:masterId - Подписаться на мастера
router.post('/:masterId', authenticateToken, async (req, res) => {
  try {
    const { masterId } = req.params;
    const subscriberId = req.user.id;

    // Проверяем, что пользователь не подписывается сам на себя
    if (subscriberId === masterId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot subscribe to yourself',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем, что мастер существует
    const masterResult = await pool.query(
      'SELECT id, username FROM users WHERE id = $1 AND role IN ($2, $3)',
      [masterId, 'master', 'admin']
    );

    if (masterResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Master not found',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем, не подписан ли уже
    const existingSubscription = await pool.query(
      'SELECT id FROM subscriptions WHERE subscriber_id = $1 AND channel_id = $2',
      [subscriberId, masterId]
    );

    if (existingSubscription.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already subscribed to this master',
        timestamp: new Date().toISOString()
      });
    }

    // Создаем подписку
    const result = await pool.query(
      'INSERT INTO subscriptions (subscriber_id, channel_id) VALUES ($1, $2) RETURNING *',
      [subscriberId, masterId]
    );

    // Отправляем уведомление мастеру
    const notificationService = require('../services/notificationService');
    await notificationService.notifyNewSubscriber(masterId, req.user.username || req.user.name);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Successfully subscribed to master',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Subscribe to master error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to master',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/subscriptions/:masterId - Отписаться от мастера
router.delete('/:masterId', authenticateToken, async (req, res) => {
  try {
    const { masterId } = req.params;
    const subscriberId = req.user.id;

    const result = await pool.query(
      'DELETE FROM subscriptions WHERE subscriber_id = $1 AND channel_id = $2 RETURNING *',
      [subscriberId, masterId]
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
      message: 'Successfully unsubscribed from master',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unsubscribe from master error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from master',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/subscriptions/:masterId - Проверить статус подписки
router.get('/:masterId', authenticateToken, async (req, res) => {
  try {
    const { masterId } = req.params;
    const subscriberId = req.user.id;

    const result = await pool.query(
      'SELECT id FROM subscriptions WHERE subscriber_id = $1 AND channel_id = $2',
      [subscriberId, masterId]
    );

    res.json({
      success: true,
      data: {
        isSubscribed: result.rows.length > 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Check subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check subscription status',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/subscriptions/count/:masterId - Получить количество подписчиков мастера
router.get('/count/:masterId', async (req, res) => {
  try {
    const { masterId } = req.params;

    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM subscriptions
      WHERE channel_id = $1
    `, [masterId]);

    res.json({
      success: true,
      data: { count: parseInt(result.rows[0].count) },
      message: 'Subscribers count retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get subscribers count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscribers count',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/subscriptions - Получить подписки пользователя
router.get('/', authenticateToken, async (req, res) => {
  try {
    const subscriberId = req.user.id;

    const result = await pool.query(`
      SELECT 
        s.id,
        s.created_at,
        u.id as master_id,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar
      FROM subscriptions s
      JOIN users u ON s.channel_id = u.id
      WHERE s.subscriber_id = $1
      ORDER BY s.created_at DESC
    `, [subscriberId]);

    res.json({
      success: true,
      data: result.rows,
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

module.exports = router;
