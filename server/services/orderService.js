const Order = require('../models/Order');
const { pool } = require('../config/database');
const { getOrderSocketHandler } = require('../config/socket');

class OrderService {
  // Создать новую заявку
  static async createOrder(orderData, clientId) {
    try {
      // Валидация данных
      if (!orderData.title || !orderData.description || !orderData.category) {
        throw new Error('Title, description and category are required');
      }

      // Проверка категории
      const validCategories = Order.getCategories();
      if (!validCategories.includes(orderData.category.toLowerCase())) {
        throw new Error(`Invalid category. Available categories: ${validCategories.join(', ')}`);
      }

      // Создание заявки
      const order = await Order.create({
        ...orderData,
        client_id: clientId,
        category: orderData.category.toLowerCase()
      });

      // Отправка уведомления через Socket.IO
      const orderSocketHandler = getOrderSocketHandler();
      if (orderSocketHandler) {
        await orderSocketHandler.notifyNewOrder(order);
      }

      return {
        success: true,
        data: order,
        message: 'Order created successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Получить заявки с фильтрацией
  static async getOrders(filters = {}, userId = null, userRole = null) {
    try {
      // Если пользователь - клиент, показываем только его заявки
      if (userRole === 'client' && userId) {
        filters.client_id = userId;
      }
      
      // Если пользователь - мастер, показываем заявки где он мастер или все pending
      if (userRole === 'master' && userId) {
        // Для мастеров показываем все pending заявки + свои принятые
        const masterOrders = await Order.findAll({
          ...filters,
          master_id: userId
        });
        
        const pendingOrders = await Order.findAll({
          ...filters,
          status: 'pending'
        });
        
        // Объединяем и убираем дубликаты
        const allOrders = [...masterOrders];
        pendingOrders.forEach(order => {
          if (!allOrders.find(o => o.id === order.id)) {
            allOrders.push(order);
          }
        });
        
        return {
          success: true,
          data: allOrders,
          message: 'Orders retrieved successfully',
          timestamp: new Date().toISOString()
        };
      }

      const orders = await Order.findAll(filters);
      
      return {
        success: true,
        data: orders,
        message: 'Orders retrieved successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Получить заявку по ID
  static async getOrderById(orderId, userId = null, userRole = null) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        return {
          success: false,
          data: null,
          message: 'Order not found',
          timestamp: new Date().toISOString()
        };
      }

      // Проверка прав доступа
      if (userRole === 'client' && order.client_id !== userId) {
        return {
          success: false,
          data: null,
          message: 'Access denied',
          timestamp: new Date().toISOString()
        };
      }

      if (userRole === 'master' && order.master_id !== userId && order.status === 'pending') {
        // Мастер может видеть pending заявки
      } else if (userRole === 'master' && order.master_id !== userId) {
        return {
          success: false,
          data: null,
          message: 'Access denied',
          timestamp: new Date().toISOString()
        };
      }

      // Получить отклики если есть
      const responses = await order.getResponses();
      order.responses = responses;

      return {
        success: true,
        data: order,
        message: 'Order retrieved successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Обновить заявку
  static async updateOrder(orderId, updateData, userId, userRole) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        return {
          success: false,
          data: null,
          message: 'Order not found',
          timestamp: new Date().toISOString()
        };
      }

      // Проверка прав доступа
      if (userRole === 'client' && order.client_id !== userId) {
        return {
          success: false,
          data: null,
          message: 'Access denied',
          timestamp: new Date().toISOString()
        };
      }

      if (userRole === 'master' && order.master_id !== userId) {
        return {
          success: false,
          data: null,
          message: 'Access denied',
          timestamp: new Date().toISOString()
        };
      }

      // Ограничения на обновление
      if (userRole === 'client' && order.status !== 'pending') {
        return {
          success: false,
          data: null,
          message: 'Cannot update order that is not pending',
          timestamp: new Date().toISOString()
        };
      }

      await order.update(updateData);

      return {
        success: true,
        data: order,
        message: 'Order updated successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Удалить заявку
  static async deleteOrder(orderId, userId, userRole) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        return {
          success: false,
          data: null,
          message: 'Order not found',
          timestamp: new Date().toISOString()
        };
      }

      // Проверка прав доступа
      if (userRole === 'client' && order.client_id !== userId) {
        return {
          success: false,
          data: null,
          message: 'Access denied',
          timestamp: new Date().toISOString()
        };
      }

      if (userRole === 'master') {
        return {
          success: false,
          data: null,
          message: 'Masters cannot delete orders',
          timestamp: new Date().toISOString()
        };
      }

      // Ограничения на удаление
      if (order.status !== 'pending') {
        return {
          success: false,
          data: null,
          message: 'Cannot delete order that is not pending',
          timestamp: new Date().toISOString()
        };
      }

      await order.delete();

      return {
        success: true,
        data: null,
        message: 'Order deleted successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Создать отклик на заявку
  static async createResponse(orderId, responseData, masterId) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        return {
          success: false,
          data: null,
          message: 'Order not found',
          timestamp: new Date().toISOString()
        };
      }

      if (order.status !== 'pending') {
        return {
          success: false,
          data: null,
          message: 'Order is not available for responses',
          timestamp: new Date().toISOString()
        };
      }

      // Проверка, не откликался ли уже мастер
      const existingResponse = await pool.query(
        'SELECT id FROM order_responses WHERE order_id = $1 AND master_id = $2 AND is_active = true',
        [orderId, masterId]
      );

      if (existingResponse.rows.length > 0) {
        return {
          success: false,
          data: null,
          message: 'You have already responded to this order',
          timestamp: new Date().toISOString()
        };
      }

      // Создание отклика
      const query = `
        INSERT INTO order_responses (order_id, master_id, message, price, deadline)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const values = [
        orderId,
        masterId,
        responseData.message,
        responseData.price,
        responseData.deadline
      ];

      const result = await pool.query(query, values);
      const response = result.rows[0];

      // Получить информацию о мастере
      const masterInfo = await pool.query(
        'SELECT id, username, first_name, last_name, avatar, phone FROM users WHERE id = $1',
        [masterId]
      );

      response.master = masterInfo.rows[0];

      // Отправка уведомления через Socket.IO
      const orderSocketHandler = getOrderSocketHandler();
      if (orderSocketHandler) {
        await orderSocketHandler.notifyNewOrderResponse(orderId, response);
      }

      return {
        success: true,
        data: response,
        message: 'Response created successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Принять предложение мастера
  static async acceptResponse(orderId, responseId, clientId) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        return {
          success: false,
          data: null,
          message: 'Order not found',
          timestamp: new Date().toISOString()
        };
      }

      if (order.client_id !== clientId) {
        return {
          success: false,
          data: null,
          message: 'Access denied',
          timestamp: new Date().toISOString()
        };
      }

      if (order.status !== 'pending') {
        return {
          success: false,
          data: null,
          message: 'Order is not available for acceptance',
          timestamp: new Date().toISOString()
        };
      }

      const result = await order.acceptResponse(responseId);

      // Отправка уведомлений через Socket.IO
      const orderSocketHandler = getOrderSocketHandler();
      if (orderSocketHandler) {
        await orderSocketHandler.notifyOrderAccepted(orderId, result.order.master_id);
        await orderSocketHandler.notifyChatCreated(orderId, result.chat.id, result.order.client_id, result.order.master_id);
      }

      return {
        success: true,
        data: result,
        message: 'Response accepted successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Получить статистику
  static async getStats(userId, userRole) {
    try {
      const stats = await Order.getStats(userId, userRole);
      
      return {
        success: true,
        data: stats,
        message: 'Stats retrieved successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Получить категории
  static getCategories() {
    return {
      success: true,
      data: Order.getCategories(),
      message: 'Categories retrieved successfully',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = OrderService;
