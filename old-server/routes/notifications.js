const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const router = express.Router();

// GET /api/notifications - Получить уведомления пользователя
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const notifications = await notificationService.getUserNotifications(userId, page, limit);
    const unreadCount = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: notifications.length
        }
      },
      message: 'Notifications retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/notifications/unread-count - Получить количество непрочитанных уведомлений
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount },
      message: 'Unread count retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve unread count',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/notifications/:id/read - Отметить уведомление как прочитанное
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationService.markAsRead(id, userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/notifications/read-all - Отметить все уведомления как прочитанные
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      data: { count: result.count },
      message: 'All notifications marked as read',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/notifications/:id - Удалить уведомление
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { pool } = require('../config/database');
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/notifications/test-sms - Тестовая отправка SMS (только для админов)
router.post('/test-sms', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        timestamp: new Date().toISOString()
      });
    }

    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone and message are required',
        timestamp: new Date().toISOString()
      });
    }

    const smsService = require('../services/smsService');
    const result = await smsService.sendSMS(phone, message);

    res.json({
      success: result.success,
      data: result,
      message: result.success ? 'SMS sent successfully' : 'SMS sending failed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test SMS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test SMS',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/notifications/sms-balance - Получить баланс SMS (только для админов)
router.get('/sms-balance', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        timestamp: new Date().toISOString()
      });
    }

    const smsService = require('../services/smsService');
    const result = await smsService.getBalance();

    res.json({
      success: result.success,
      data: result,
      message: result.success ? 'Balance retrieved successfully' : 'Failed to retrieve balance',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get SMS balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve SMS balance',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
