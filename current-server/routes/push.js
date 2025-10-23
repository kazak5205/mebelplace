const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const pushService = require('../services/pushService');
const router = express.Router();

// GET /api/push/vapid-key - Получить VAPID публичный ключ
router.get('/vapid-key', (req, res) => {
  try {
    const publicKey = pushService.getVapidPublicKey();
    
    res.json({
      success: true,
      data: { publicKey },
      message: 'VAPID public key retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get VAPID key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve VAPID key',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/push/subscribe - Подписаться на push уведомления
router.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription data',
        timestamp: new Date().toISOString()
      });
    }

    const result = await pushService.saveSubscription(userId, subscription);

    res.json({
      success: true,
      data: result,
      message: 'Push subscription saved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Subscribe to push error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to push notifications',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/push/unsubscribe - Отписаться от push уведомлений
router.delete('/unsubscribe', authenticateToken, async (req, res) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user.id;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint is required',
        timestamp: new Date().toISOString()
      });
    }

    await pushService.removeSubscription(userId, endpoint);

    res.json({
      success: true,
      message: 'Push subscription removed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unsubscribe from push error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from push notifications',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/push/test - Тестовая отправка push уведомления
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const { title, message, data } = req.body;
    const userId = req.user.id;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required',
        timestamp: new Date().toISOString()
      });
    }

    const result = await pushService.sendToUser(userId, {
      title,
      body: message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: data || {},
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    });

    res.json({
      success: result.success,
      data: result,
      message: result.success ? 'Test push notification sent' : 'Test push notification failed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test push error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test push notification',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/push/stats - Статистика подписок (только для админов)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        timestamp: new Date().toISOString()
      });
    }

    const stats = await pushService.getSubscriptionStats();

    res.json({
      success: true,
      data: stats,
      message: 'Push subscription stats retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get push stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve push stats',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/push/cleanup - Очистка неактивных подписок (только для админов)
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        timestamp: new Date().toISOString()
      });
    }

    const result = await pushService.cleanupInactiveSubscriptions();

    res.json({
      success: true,
      data: result,
      message: 'Inactive subscriptions cleaned up successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cleanup subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup subscriptions',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/push/send-to-all - Отправка уведомления всем пользователям (только для админов)
router.post('/send-to-all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        timestamp: new Date().toISOString()
      });
    }

    const { title, message, data } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required',
        timestamp: new Date().toISOString()
      });
    }

    const result = await pushService.sendToAll({
      title,
      body: message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: data || {},
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    });

    res.json({
      success: result.success,
      data: result,
      message: result.success ? 'Push notification sent to all users' : 'Failed to send push notification',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send to all error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send push notification to all users',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

