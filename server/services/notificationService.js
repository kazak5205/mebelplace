const { pool } = require('../config/database');
const smsService = require('./smsService');
const pushService = require('./pushService');

class NotificationService {
  // Создание уведомления в базе данных
  async createNotification(userId, type, title, message, data = {}) {
    try {
      const result = await pool.query(`
        INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [userId, type, title, message, JSON.stringify(data), false, new Date()]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Отправка push уведомления через Web Push API
  async sendPushNotification(userId, title, message, data = {}) {
    try {
      // Отправляем push уведомление
      const pushResult = await pushService.sendToUser(userId, {
        title,
        body: message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: {
          url: data.url || '/',
          ...data
        },
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
        timestamp: Date.now()
      });
      
      // Сохраняем уведомление в базу
      await this.createNotification(userId, 'push', title, message, data);
      
      return { 
        success: pushResult.success, 
        pushResult,
        message: pushResult.success ? 'Push notification sent' : 'Push notification failed'
      };
    } catch (error) {
      console.error('Push notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Отправка SMS уведомления
  async sendSMSNotification(userId, message, smsType = 'general') {
    try {
      // Получаем номер телефона пользователя
      const userResult = await pool.query(
        'SELECT phone FROM users WHERE id = $1 AND phone IS NOT NULL',
        [userId]
      );

      if (userResult.rows.length === 0) {
        console.log(`No phone number for user ${userId}`);
        return { success: false, error: 'No phone number' };
      }

      const phone = userResult.rows[0].phone;
      let smsResult;

      switch (smsType) {
        case 'verification':
          smsResult = await smsService.sendVerificationCode(phone, message);
          break;
        case 'new_response':
          const [orderTitle, masterName] = message.split('|');
          smsResult = await smsService.sendNewResponseNotification(phone, orderTitle, masterName);
          break;
        case 'new_message':
          smsResult = await smsService.sendNewMessageNotification(phone, message);
          break;
        case 'response_accepted':
          const [orderTitle2, clientName] = message.split('|');
          smsResult = await smsService.sendResponseAcceptedNotification(phone, orderTitle2, clientName);
          break;
        case 'new_video':
          const [masterName2, videoTitle] = message.split('|');
          smsResult = await smsService.sendNewVideoNotification(phone, masterName2, videoTitle);
          break;
        case 'new_subscriber':
          smsResult = await smsService.sendNewSubscriberNotification(phone, message);
          break;
        default:
          smsResult = await smsService.sendSystemNotification(phone, message);
      }

      return smsResult;
    } catch (error) {
      console.error('SMS notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Отправка in-app уведомления
  async sendInAppNotification(userId, type, title, message, data = {}) {
    try {
      const notification = await this.createNotification(userId, type, title, message, data);
      
      // Здесь можно добавить отправку через WebSocket
      console.log(`🔔 In-app notification to user ${userId}: ${title} - ${message}`);
      
      return { success: true, notification };
    } catch (error) {
      console.error('In-app notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Комбинированная отправка уведомлений
  async sendNotification(userId, type, title, message, options = {}) {
    const { push = true, sms = false, inApp = true, smsType = 'general' } = options;
    
    const results = {};

    // In-app уведомление (всегда отправляем)
    if (inApp) {
      results.inApp = await this.sendInAppNotification(userId, type, title, message, options.data);
    }

    // Push уведомление
    if (push) {
      results.push = await this.sendPushNotification(userId, title, message, options.data);
    }

    // SMS уведомление
    if (sms) {
      results.sms = await this.sendSMSNotification(userId, message, smsType);
    }

    return results;
  }

  // Уведомление о новом отклике на заявку
  async notifyNewOrderResponse(clientId, orderTitle, masterName) {
    const title = 'Новый отклик на заявку';
    const message = `Мастер ${masterName} откликнулся на вашу заявку "${orderTitle}"`;
    
    // Отправляем push уведомление
    const pushResult = await pushService.notifyNewOrderResponse(clientId, orderTitle, masterName);
    
    // Отправляем SMS уведомление
    const smsResult = await this.sendSMSNotification(clientId, `${orderTitle}|${masterName}`, 'new_response');
    
    // Сохраняем в базу
    await this.createNotification(clientId, 'order_response', title, message, { orderTitle, masterName });
    
    return {
      push: pushResult,
      sms: smsResult,
      inApp: { success: true }
    };
  }

  // Уведомление о новом сообщении в чате
  async notifyNewMessage(recipientId, senderName, chatId) {
    const title = 'Новое сообщение';
    const message = `Новое сообщение от ${senderName}`;
    
    // Отправляем push уведомление
    const pushResult = await pushService.notifyNewMessage(recipientId, senderName, chatId);
    
    // Отправляем SMS уведомление
    const smsResult = await this.sendSMSNotification(recipientId, senderName, 'new_message');
    
    // Сохраняем в базу
    await this.createNotification(recipientId, 'new_message', title, message, { senderName, chatId });
    
    return {
      push: pushResult,
      sms: smsResult,
      inApp: { success: true }
    };
  }

  // Уведомление о принятии отклика
  async notifyResponseAccepted(masterId, orderTitle, clientName) {
    const title = 'Отклик принят';
    const message = `Ваш отклик на заявку "${orderTitle}" принят клиентом ${clientName}`;
    
    return await this.sendNotification(masterId, 'response_accepted', title, message, {
      push: true,
      sms: true,
      smsType: 'response_accepted',
      data: { orderTitle, clientName }
    });
  }

  // Уведомление о новом видео от подписки
  async notifyNewVideo(subscriberId, masterName, videoTitle) {
    const title = 'Новое видео';
    const message = `${masterName} загрузил новое видео "${videoTitle}"`;
    
    return await this.sendNotification(subscriberId, 'new_video', title, message, {
      push: true,
      sms: false, // Не спамим SMS для каждого видео
      data: { masterName, videoTitle }
    });
  }

  // Уведомление о новом подписчике
  async notifyNewSubscriber(masterId, subscriberName) {
    const title = 'Новый подписчик';
    const message = `У вас новый подписчик: ${subscriberName}`;
    
    return await this.sendNotification(masterId, 'new_subscriber', title, message, {
      push: true,
      sms: true,
      smsType: 'new_subscriber',
      data: { subscriberName }
    });
  }

  // Уведомление о новом комментарии под видео
  async notifyNewComment(authorId, commenterName, videoTitle) {
    const title = 'Новый комментарий';
    const message = `${commenterName} прокомментировал ваше видео "${videoTitle}"`;
    
    return await this.sendNotification(authorId, 'new_comment', title, message, {
      push: true,
      sms: false, // Не спамим SMS для комментариев
      data: { commenterName, videoTitle }
    });
  }

  // Получение уведомлений пользователя
  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const result = await pool.query(`
        SELECT * FROM notifications 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      return result.rows;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Отметить уведомление как прочитанное
  async markAsRead(notificationId, userId) {
    try {
      const result = await pool.query(`
        UPDATE notifications 
        SET is_read = true, read_at = NOW() 
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `, [notificationId, userId]);

      return result.rows[0];
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Отметить все уведомления как прочитанные
  async markAllAsRead(userId) {
    try {
      const result = await pool.query(`
        UPDATE notifications 
        SET is_read = true, read_at = NOW() 
        WHERE user_id = $1 AND is_read = false
        RETURNING COUNT(*) as count
      `, [userId]);

      return result.rows[0];
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Получение количества непрочитанных уведомлений
  async getUnreadCount(userId) {
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = $1 AND is_read = false
      `, [userId]);

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
