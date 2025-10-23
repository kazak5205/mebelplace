/**
 * Order Status Flow Service
 * Управление переходами статусов заявок
 */

const { pool } = require('../config/database');
const notificationService = require('./notificationService');

class OrderStatusService {
  /**
   * Валидные переходы статусов
   * pending → in_progress (клиент принял мастера)
   * in_progress → completed (работа завершена)
   * in_progress → cancelled (отменена)
   * pending → cancelled (отменена до начала)
   */
  static VALID_TRANSITIONS = {
    pending: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [], // Финальный статус
    cancelled: [], // Финальный статус
  };

  /**
   * Проверка валидности перехода
   */
  static isValidTransition(currentStatus, newStatus) {
    const allowedStatuses = this.VALID_TRANSITIONS[currentStatus];
    return allowedStatuses && allowedStatuses.includes(newStatus);
  }

  /**
   * Изменение статуса заявки
   */
  static async changeStatus(orderId, newStatus, userId, reason = null) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Получить текущий статус заявки
      const orderResult = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND is_active = true',
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = orderResult.rows[0];
      const currentStatus = order.status;

      // Проверить валидность перехода
      if (!this.isValidTransition(currentStatus, newStatus)) {
        throw new Error(
          `Invalid status transition from ${currentStatus} to ${newStatus}`
        );
      }

      // Проверить права пользователя на изменение статуса
      await this.checkPermissions(order, userId, currentStatus, newStatus);

      // Обновить статус заявки
      await client.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
        [newStatus, orderId]
      );

      // Записать в историю
      await client.query(
        `INSERT INTO order_status_history 
         (order_id, changed_by, old_status, new_status, reason, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [orderId, userId, currentStatus, newStatus, reason]
      );

      // Обработать специфичную логику для каждого перехода
      await this.handleTransitionLogic(client, order, currentStatus, newStatus, userId);

      await client.query('COMMIT');

      // Отправить уведомления
      await this.sendNotifications(order, currentStatus, newStatus, userId);

      return {
        success: true,
        oldStatus: currentStatus,
        newStatus: newStatus,
        message: this.getTransitionMessage(currentStatus, newStatus),
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Проверка прав на изменение статуса
   */
  static async checkPermissions(order, userId, currentStatus, newStatus) {
    // Получить информацию о пользователе
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const userRole = userResult.rows[0].role;

    // Админ может менять любой статус
    if (userRole === 'admin') {
      return true;
    }

    // pending → in_progress: только клиент (когда принимает мастера)
    if (currentStatus === 'pending' && newStatus === 'in_progress') {
      if (userId !== order.client_id) {
        throw new Error('Only client can start the order');
      }
      if (!order.master_id) {
        throw new Error('Master must be assigned before starting order');
      }
      return true;
    }

    // in_progress → completed: клиент или мастер (оба должны подтвердить)
    if (currentStatus === 'in_progress' && newStatus === 'completed') {
      if (userId !== order.client_id && userId !== order.master_id) {
        throw new Error('Only client or master can complete the order');
      }
      return true;
    }

    // cancelled: клиент или мастер могут отменить
    if (newStatus === 'cancelled') {
      if (userId !== order.client_id && userId !== order.master_id) {
        throw new Error('Only client or master can cancel the order');
      }
      return true;
    }

    throw new Error('Permission denied');
  }

  /**
   * Специфичная логика для переходов
   */
  static async handleTransitionLogic(client, order, oldStatus, newStatus, userId) {
    // pending → in_progress: создать чат если нет
    if (oldStatus === 'pending' && newStatus === 'in_progress') {
      // Проверить существование чата
      const chatResult = await client.query(
        'SELECT id FROM chats WHERE order_id = $1',
        [order.id]
      );

      if (chatResult.rows.length === 0) {
        // Создать чат между клиентом и мастером
        const chatInsert = await client.query(
          `INSERT INTO chats (type, order_id, created_by, created_at)
           VALUES ('order', $1, $2, NOW())
           RETURNING id`,
          [order.id, userId]
        );

        const chatId = chatInsert.rows[0].id;

        // Добавить участников
        await client.query(
          `INSERT INTO chat_participants (chat_id, user_id, role, joined_at)
           VALUES 
           ($1, $2, 'member', NOW()),
           ($1, $3, 'member', NOW())`,
          [chatId, order.client_id, order.master_id]
        );
      }
    }

    // in_progress → completed: обновить статистику пользователей
    if (oldStatus === 'in_progress' && newStatus === 'completed') {
      // Увеличить счетчик выполненных заказов
      await client.query(
        `UPDATE users 
         SET orders_count = orders_count + 1 
         WHERE id IN ($1, $2)`,
        [order.client_id, order.master_id]
      );

      // Если оба пользователя подтвердили - можно оставить отзыв
      // Review system будет добавлен в следующей версии
    }
  }

  /**
   * Отправка уведомлений
   */
  static async sendNotifications(order, oldStatus, newStatus, changedBy) {
    const recipientId = changedBy === order.client_id ? order.master_id : order.client_id;

    if (!recipientId) return;

    const messages = {
      'pending-in_progress': {
        title: 'Заказ принят в работу',
        message: `Заказ "${order.title}" принят в работу`,
        type: 'order_started',
      },
      'in_progress-completed': {
        title: 'Заказ завершен',
        message: `Заказ "${order.title}" был отмечен как завершенный`,
        type: 'order_completed',
      },
      'pending-cancelled': {
        title: 'Заказ отменен',
        message: `Заказ "${order.title}" был отменен`,
        type: 'order_cancelled',
      },
      'in_progress-cancelled': {
        title: 'Заказ отменен',
        message: `Заказ "${order.title}" был отменен`,
        type: 'order_cancelled',
      },
    };

    const key = `${oldStatus}-${newStatus}`;
    const notificationData = messages[key];

    if (notificationData) {
      await notificationService.createNotification(recipientId, {
        ...notificationData,
        data: {
          orderId: order.id,
          oldStatus,
          newStatus,
        },
        link: `/orders/${order.id}`,
      });
    }
  }

  /**
   * Получить сообщение о переходе
   */
  static getTransitionMessage(oldStatus, newStatus) {
    const messages = {
      'pending-in_progress': 'Заказ принят в работу',
      'in_progress-completed': 'Заказ завершен',
      'pending-cancelled': 'Заказ отменен',
      'in_progress-cancelled': 'Заказ отменен',
    };

    return messages[`${oldStatus}-${newStatus}`] || 'Статус заказа обновлен';
  }

  /**
   * Получить историю статусов заказа
   */
  static async getStatusHistory(orderId) {
    const result = await pool.query(
      `SELECT 
        osh.*,
        u.username as changed_by_username,
        u.first_name as changed_by_first_name,
        u.last_name as changed_by_last_name
       FROM order_status_history osh
       JOIN users u ON osh.changed_by = u.id
       WHERE osh.order_id = $1
       ORDER BY osh.created_at ASC`,
      [orderId]
    );

    return result.rows;
  }

  /**
   * Получить доступные действия для заказа
   */
  static getAvailableActions(order, userId, userRole) {
    const currentStatus = order.status;
    const isClient = userId === order.client_id;
    const isMaster = userId === order.master_id;
    const isAdmin = userRole === 'admin';

    const actions = [];

    if (isAdmin) {
      // Админ может выполнить любые доступные переходы
      const allowed = this.VALID_TRANSITIONS[currentStatus] || [];
      return allowed.map(status => ({
        action: status,
        label: this.getActionLabel(status),
        requiresConfirmation: true,
      }));
    }

    if (currentStatus === 'pending') {
      if (isClient) {
        // Клиент может начать работу (если выбран мастер) или отменить
        if (order.master_id) {
          actions.push({
            action: 'in_progress',
            label: 'Начать работу',
            requiresConfirmation: true,
          });
        }
        actions.push({
          action: 'cancelled',
          label: 'Отменить заказ',
          requiresConfirmation: true,
          destructive: true,
        });
      }
    }

    if (currentStatus === 'in_progress') {
      if (isClient || isMaster) {
        actions.push({
          action: 'completed',
          label: 'Завершить заказ',
          requiresConfirmation: true,
        });
        actions.push({
          action: 'cancelled',
          label: 'Отменить заказ',
          requiresConfirmation: true,
          destructive: true,
        });
      }
    }

    return actions;
  }

  /**
   * Получить метку действия
   */
  static getActionLabel(status) {
    const labels = {
      in_progress: 'Начать работу',
      completed: 'Завершить',
      cancelled: 'Отменить',
    };

    return labels[status] || status;
  }
}

module.exports = OrderStatusService;

