const webpush = require('web-push');
const { pool } = require('../config/database');

class PushService {
  constructor() {
    // VAPID ключи для Web Push (генерируются один раз)
    this.vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY || 'BB2c671HCIVlU9SM0fElC5UxglxeN4op3302Q0WjqTJYmIWtrFwtzKkCKPSF5bEKAu_c18UszTcIUPdSAjHcl2I',
      privateKey: process.env.VAPID_PRIVATE_KEY || 'dbt52gwj_FcR0eESgopjt0fF2nE4hmny5-keKm4OE_4'
    };

    // Настройка web-push
    webpush.setVapidDetails(
      'mailto:support@mebelplace.com.kz',
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey
    );
  }

  // Сохранение подписки пользователя
  async saveSubscription(userId, subscription) {
    try {
      const result = await pool.query(`
        INSERT INTO push_subscriptions (user_id, endpoint, keys)
        VALUES ($1, $2, $3)
        ON CONFLICT (endpoint) 
        DO UPDATE SET keys = $3, updated_at = NOW()
        RETURNING *
      `, [
        userId,
        subscription.endpoint,
        JSON.stringify(subscription.keys)
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error saving push subscription:', error);
      throw error;
    }
  }

  // Удаление подписки пользователя
  async removeSubscription(userId, endpoint) {
    try {
      await pool.query(
        'DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2',
        [userId, endpoint]
      );
    } catch (error) {
      console.error('Error removing push subscription:', error);
      throw error;
    }
  }

  // Отправка push уведомления одному пользователю
  async sendToUser(userId, payload) {
    try {
      const subscriptions = await pool.query(
        'SELECT endpoint, keys FROM push_subscriptions WHERE user_id = $1',
        [userId]
      );

      if (subscriptions.rows.length === 0) {
        console.log(`No push subscriptions found for user ${userId}`);
        return { success: false, error: 'No subscriptions' };
      }

      const results = [];
      for (const sub of subscriptions.rows) {
        try {
          const subscription = {
            endpoint: sub.endpoint,
            keys: typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys
          };

          await webpush.sendNotification(subscription, JSON.stringify(payload));
          results.push({ success: true, endpoint: sub.endpoint });
        } catch (error) {
          console.error(`Push notification failed for endpoint ${sub.endpoint}:`, error);
          
          // Если подписка недействительна, удаляем её
          if (error.statusCode === 410) {
            await this.removeSubscription(userId, sub.endpoint);
          }
          
          results.push({ success: false, endpoint: sub.endpoint, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      return {
        success: successCount > 0,
        results,
        successCount,
        totalCount: subscriptions.rows.length
      };
    } catch (error) {
      console.error('Error sending push to user:', error);
      return { success: false, error: error.message };
    }
  }

  // Отправка push уведомления нескольким пользователям
  async sendToUsers(userIds, payload) {
    try {
      const results = [];
      for (const userId of userIds) {
        const result = await this.sendToUser(userId, payload);
        results.push({ userId, ...result });
      }
      return results;
    } catch (error) {
      console.error('Error sending push to users:', error);
      return { success: false, error: error.message };
    }
  }

  // Отправка push уведомления всем подписчикам
  async sendToAll(payload) {
    try {
      const subscriptions = await pool.query(
        'SELECT user_id, endpoint, keys FROM push_subscriptions'
      );

      if (subscriptions.rows.length === 0) {
        return { success: false, error: 'No subscriptions found' };
      }

      const results = [];
      for (const sub of subscriptions.rows) {
        try {
          const subscription = {
            endpoint: sub.endpoint,
            keys: typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys
          };

          await webpush.sendNotification(subscription, JSON.stringify(payload));
          results.push({ success: true, userId: sub.user_id, endpoint: sub.endpoint });
        } catch (error) {
          console.error(`Push notification failed for user ${sub.user_id}:`, error);
          
          if (error.statusCode === 410) {
            await this.removeSubscription(sub.user_id, sub.endpoint);
          }
          
          results.push({ 
            success: false, 
            userId: sub.user_id, 
            endpoint: sub.endpoint, 
            error: error.message 
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      return {
        success: successCount > 0,
        results,
        successCount,
        totalCount: subscriptions.rows.length
      };
    } catch (error) {
      console.error('Error sending push to all:', error);
      return { success: false, error: error.message };
    }
  }

  // Создание payload для уведомления
  createPayload(title, body, data = {}, actions = []) {
    return {
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        url: data.url || '/',
        ...data
      },
      actions: actions.map(action => ({
        action: action.action,
        title: action.title,
        icon: action.icon || '/icons/action-icon.png'
      })),
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    };
  }

  // Уведомление о новом отклике на заявку
  async notifyNewOrderResponse(userId, orderTitle, masterName) {
    const payload = this.createPayload(
      'Новый отклик на заявку',
      `Мастер ${masterName} откликнулся на вашу заявку "${orderTitle}"`,
      {
        url: '/orders',
        type: 'order_response',
        orderTitle,
        masterName
      },
      [
        { action: 'view', title: 'Посмотреть' },
        { action: 'dismiss', title: 'Закрыть' }
      ]
    );

    return await this.sendToUser(userId, payload);
  }

  // Уведомление о новом сообщении
  async notifyNewMessage(userId, senderName, chatId) {
    const payload = this.createPayload(
      'Новое сообщение',
      `Новое сообщение от ${senderName}`,
      {
        url: `/chat/${chatId}`,
        type: 'new_message',
        senderName,
        chatId
      },
      [
        { action: 'reply', title: 'Ответить' },
        { action: 'dismiss', title: 'Закрыть' }
      ]
    );

    return await this.sendToUser(userId, payload);
  }

  // Уведомление о принятии отклика
  async notifyResponseAccepted(userId, orderTitle, clientName) {
    const payload = this.createPayload(
      'Отклик принят',
      `Ваш отклик на заявку "${orderTitle}" принят клиентом ${clientName}`,
      {
        url: '/orders',
        type: 'response_accepted',
        orderTitle,
        clientName
      },
      [
        { action: 'view', title: 'Посмотреть' },
        { action: 'dismiss', title: 'Закрыть' }
      ]
    );

    return await this.sendToUser(userId, payload);
  }

  // Уведомление о новом видео
  async notifyNewVideo(userId, masterName, videoTitle) {
    const payload = this.createPayload(
      'Новое видео',
      `${masterName} загрузил новое видео "${videoTitle}"`,
      {
        url: '/videos',
        type: 'new_video',
        masterName,
        videoTitle
      },
      [
        { action: 'watch', title: 'Смотреть' },
        { action: 'dismiss', title: 'Закрыть' }
      ]
    );

    return await this.sendToUser(userId, payload);
  }

  // Уведомление о новом подписчике
  async notifyNewSubscriber(userId, subscriberName) {
    const payload = this.createPayload(
      'Новый подписчик',
      `У вас новый подписчик: ${subscriberName}`,
      {
        url: '/profile',
        type: 'new_subscriber',
        subscriberName
      },
      [
        { action: 'view', title: 'Посмотреть' },
        { action: 'dismiss', title: 'Закрыть' }
      ]
    );

    return await this.sendToUser(userId, payload);
  }

  // Уведомление о новом комментарии
  async notifyNewComment(userId, commenterName, videoTitle) {
    const payload = this.createPayload(
      'Новый комментарий',
      `${commenterName} прокомментировал ваше видео "${videoTitle}"`,
      {
        url: '/videos',
        type: 'new_comment',
        commenterName,
        videoTitle
      },
      [
        { action: 'view', title: 'Посмотреть' },
        { action: 'dismiss', title: 'Закрыть' }
      ]
    );

    return await this.sendToUser(userId, payload);
  }

  // Системное уведомление
  async notifySystem(userId, title, message, data = {}) {
    const payload = this.createPayload(
      title,
      message,
      {
        url: data.url || '/',
        type: 'system',
        ...data
      },
      [
        { action: 'view', title: 'Посмотреть' },
        { action: 'dismiss', title: 'Закрыть' }
      ]
    );

    return await this.sendToUser(userId, payload);
  }

  // Получение VAPID публичного ключа
  getVapidPublicKey() {
    return this.vapidKeys.publicKey;
  }

  // Получение статистики подписок
  async getSubscriptionStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_subscriptions,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(CASE WHEN updated_at > NOW() - INTERVAL '7 days' THEN 1 END) as active_last_7_days
        FROM push_subscriptions
      `);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      throw error;
    }
  }

  // Очистка неактивных подписок
  async cleanupInactiveSubscriptions() {
    try {
      const result = await pool.query(`
        DELETE FROM push_subscriptions 
        WHERE updated_at < NOW() - INTERVAL '30 days'
        RETURNING COUNT(*) as deleted_count
      `);

      console.log(`Cleaned up ${result.rows[0].deleted_count} inactive subscriptions`);
      return result.rows[0];
    } catch (error) {
      console.error('Error cleaning up subscriptions:', error);
      throw error;
    }
  }
}

module.exports = new PushService();
