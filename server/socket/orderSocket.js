const OrderService = require('../services/orderService');

class OrderSocketHandler {
  constructor(io) {
    this.io = io;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Обработка подключения пользователя
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // Присоединение к комнате пользователя для персональных уведомлений
      socket.on('join_user_room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`👤 User ${userId} joined personal room`);
      });

      // Присоединение к комнате заявки для уведомлений о конкретной заявке
      socket.on('join_order_room', (orderId) => {
        socket.join(`order_${orderId}`);
        console.log(`📋 User joined order room: ${orderId}`);
      });

      // Обработка отключения
      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
      });
    });
  }

  // Уведомление о новой заявке
  async notifyNewOrder(order) {
    try {
      // Уведомляем всех мастеров о новой заявке
      this.io.emit('new_order', {
        type: 'new_order',
        data: order,
        message: 'New order available',
        timestamp: new Date().toISOString()
      });

      console.log(`📢 New order notification sent: ${order.id}`);
    } catch (error) {
      console.error('Error sending new order notification:', error);
    }
  }

  // Уведомление о новом отклике на заявку
  async notifyNewOrderResponse(orderId, response) {
    try {
      // Уведомляем клиента о новом отклике
      this.io.to(`order_${orderId}`).emit('new_order_response', {
        type: 'new_order_response',
        data: {
          orderId,
          response
        },
        message: 'New response to your order',
        timestamp: new Date().toISOString()
      });

      // Уведомляем в персональную комнату клиента
      const order = await OrderService.getOrderById(orderId);
      if (order.success && order.data) {
        this.io.to(`user_${order.data.client_id}`).emit('new_order_response', {
          type: 'new_order_response',
          data: {
            orderId,
            response
          },
          message: 'New response to your order',
          timestamp: new Date().toISOString()
        });
      }

      console.log(`📢 New order response notification sent for order: ${orderId}`);
    } catch (error) {
      console.error('Error sending new order response notification:', error);
    }
  }

  // Уведомление о принятии заявки
  async notifyOrderAccepted(orderId, masterId) {
    try {
      // Уведомляем в комнату заявки
      this.io.to(`order_${orderId}`).emit('order_accepted', {
        type: 'order_accepted',
        data: {
          orderId,
          masterId
        },
        message: 'Order has been accepted',
        timestamp: new Date().toISOString()
      });

      // Уведомляем мастера
      this.io.to(`user_${masterId}`).emit('order_accepted', {
        type: 'order_accepted',
        data: {
          orderId,
          masterId
        },
        message: 'Your response has been accepted',
        timestamp: new Date().toISOString()
      });

      // Уведомляем клиента
      const order = await OrderService.getOrderById(orderId);
      if (order.success && order.data) {
        this.io.to(`user_${order.data.client_id}`).emit('order_accepted', {
          type: 'order_accepted',
          data: {
            orderId,
            masterId
          },
          message: 'Your order has been accepted',
          timestamp: new Date().toISOString()
        });
      }

      console.log(`📢 Order accepted notification sent for order: ${orderId}`);
    } catch (error) {
      console.error('Error sending order accepted notification:', error);
    }
  }

  // Уведомление об обновлении статуса заявки
  async notifyOrderStatusUpdate(orderId, status, userId) {
    try {
      // Уведомляем в комнату заявки
      this.io.to(`order_${orderId}`).emit('order_status_update', {
        type: 'order_status_update',
        data: {
          orderId,
          status,
          updatedBy: userId
        },
        message: `Order status updated to ${status}`,
        timestamp: new Date().toISOString()
      });

      // Уведомляем участников заявки
      const order = await OrderService.getOrderById(orderId);
      if (order.success && order.data) {
        // Уведомляем клиента
        this.io.to(`user_${order.data.client_id}`).emit('order_status_update', {
          type: 'order_status_update',
          data: {
            orderId,
            status,
            updatedBy: userId
          },
          message: `Order status updated to ${status}`,
          timestamp: new Date().toISOString()
        });

        // Уведомляем мастера если есть
        if (order.data.master_id) {
          this.io.to(`user_${order.data.master_id}`).emit('order_status_update', {
            type: 'order_status_update',
            data: {
              orderId,
              status,
              updatedBy: userId
            },
            message: `Order status updated to ${status}`,
            timestamp: new Date().toISOString()
          });
        }
      }

      console.log(`📢 Order status update notification sent for order: ${orderId}`);
    } catch (error) {
      console.error('Error sending order status update notification:', error);
    }
  }

  // Уведомление о создании чата
  async notifyChatCreated(orderId, chatId, clientId, masterId) {
    try {
      // Уведомляем клиента
      this.io.to(`user_${clientId}`).emit('chat_created', {
        type: 'chat_created',
        data: {
          orderId,
          chatId,
          clientId,
          masterId
        },
        message: 'Chat created for your order',
        timestamp: new Date().toISOString()
      });

      // Уведомляем мастера
      this.io.to(`user_${masterId}`).emit('chat_created', {
        type: 'chat_created',
        data: {
          orderId,
          chatId,
          clientId,
          masterId
        },
        message: 'Chat created for accepted order',
        timestamp: new Date().toISOString()
      });

      console.log(`📢 Chat created notification sent for order: ${orderId}`);
    } catch (error) {
      console.error('Error sending chat created notification:', error);
    }
  }

  // Уведомление о новом сообщении в чате заявки
  async notifyNewMessage(chatId, message, senderId) {
    try {
      // Уведомляем всех участников чата
      this.io.to(`chat_${chatId}`).emit('new_message', {
        type: 'new_message',
        data: {
          chatId,
          message,
          senderId
        },
        message: 'New message in order chat',
        timestamp: new Date().toISOString()
      });

      console.log(`📢 New message notification sent for chat: ${chatId}`);
    } catch (error) {
      console.error('Error sending new message notification:', error);
    }
  }

  // Уведомление о том, что пользователь онлайн
  async notifyUserOnline(userId) {
    try {
      this.io.emit('user_online', {
        type: 'user_online',
        data: {
          userId
        },
        message: 'User is online',
        timestamp: new Date().toISOString()
      });

      console.log(`📢 User online notification sent for user: ${userId}`);
    } catch (error) {
      console.error('Error sending user online notification:', error);
    }
  }

  // Уведомление о том, что пользователь офлайн
  async notifyUserOffline(userId) {
    try {
      this.io.emit('user_offline', {
        type: 'user_offline',
        data: {
          userId
        },
        message: 'User is offline',
        timestamp: new Date().toISOString()
      });

      console.log(`📢 User offline notification sent for user: ${userId}`);
    } catch (error) {
      console.error('Error sending user offline notification:', error);
    }
  }

  // Получить количество подключенных пользователей
  getConnectedUsersCount() {
    return this.io.engine.clientsCount;
  }

  // Получить список комнат
  getRooms() {
    return Array.from(this.io.sockets.adapter.rooms.keys());
  }
}

module.exports = OrderSocketHandler;
