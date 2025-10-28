const jwt = require('jsonwebtoken');
const chatService = require('../services/chatService');
const { pool } = require('../config/database');
const redisClient = require('../config/redis');

class ChatSocket {
  constructor(io) {
    this.io = io;
    // Заменено Map на Redis для масштабируемости и синхронизации между серверами
    // this.typingUsers = new Map();  // Старый подход
    // this.onlineUsers = new Map();  // Старый подход
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  // Middleware для аутентификации
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        // Читаем токен из cookies (httpOnly)
        const cookies = socket.handshake.headers.cookie;
        if (!cookies) {
          console.log('[SOCKET AUTH] No cookies found');
          return next(new Error('Authentication error: No cookies'));
        }

        const accessTokenMatch = cookies.match(/accessToken=([^;]+)/);
        if (!accessTokenMatch) {
          console.log('[SOCKET AUTH] No accessToken in cookies');
          return next(new Error('Authentication error: No access token'));
        }

        const token = accessTokenMatch[1];
        console.log('[SOCKET AUTH] Token found, verifying...');
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId || decoded.id;
        socket.userName = decoded.username || decoded.name;
        
        console.log(`[SOCKET AUTH] ✅ User authenticated: ${socket.userName} (${socket.userId})`);
        next();
      } catch (err) {
        console.error('[SOCKET AUTH] ❌ Authentication error:', err.message);
        next(new Error('Authentication error: ' + err.message));
      }
    });
  }

  // Обработчики событий
  setupEventHandlers() {
    this.io.on('connection', async (socket) => {
      console.log(`User ${socket.userName} connected to chat`);
      
      // Устанавливаем пользователя как онлайн (Redis)
      await this.setUserOnline(socket.userId, true);
      await redisClient.hset('online_users', socket.userId, socket.id);
      
      // Транслируем всем, что пользователь онлайн
      this.io.emit('user_status_changed', {
        userId: socket.userId,
        isActive: true
      });

      // Подключение к чату
      socket.on('join_chat', async (data) => {
        try {
          const { chatId } = data;
          console.log(`[CHAT SOCKET] User ${socket.userName} (${socket.userId}) joining chat ${chatId}`);
          socket.join(chatId);
          socket.emit('joined_chat', { chatId });
          console.log(`[CHAT SOCKET] User ${socket.userName} successfully joined chat ${chatId}`);
          
          // Уведомляем других участников
          socket.to(chatId).emit('user_joined', {
            userId: socket.userId,
            userName: socket.userName
          });
        } catch (error) {
          console.error('[CHAT SOCKET] Error joining chat:', error);
          socket.emit('error', { message: error.message });
        }
      });

      // Отправка сообщения
      socket.on('send_message', async (data) => {
        try {
          const { chatId, content, type = 'text', replyTo } = data;
          console.log(`[CHAT SOCKET] User ${socket.userName} sending message to chat ${chatId}:`, content.substring(0, 50));
          
          const message = await chatService.sendMessage({
            chatId,
            senderId: socket.userId,
            content,
            type,
            replyTo
          });
          console.log(`[CHAT SOCKET] Message saved to DB, ID: ${message.id}`);

          // Отправляем сообщение всем участникам чата (синхронизировано с client/mobile)
          this.io.to(chatId).emit('new_message', {
            chatId,
            message: {
              ...message,
              sender: {
                id: socket.userId,
                name: socket.userName
              }
            }
          });
          console.log(`[CHAT SOCKET] Message broadcasted to chat ${chatId}`);

          // Обновляем статус сообщения
          setTimeout(async () => {
            await chatService.updateMessageStatus(message.id, 'delivered');
            this.io.to(chatId).emit('message_status', {
              messageId: message.id,
              status: 'delivered'
            });
          }, 1000);

        } catch (error) {
          console.error('[CHAT SOCKET] Error sending message:', error);
          socket.emit('error', { message: error.message });
        }
      });

      // Отправка голосового сообщения
      socket.on('send_voice', async (data) => {
        try {
          const { chatId, audioData, duration } = data;
          
          const message = await chatService.sendMessage({
            chatId,
            senderId: socket.userId,
            content: audioData,
            type: 'voice'
          });

          this.io.to(chatId).emit('new_message', {
            ...message,
            senderName: socket.userName,
            duration
          });

        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Отправка фото
      socket.on('send_photo', async (data) => {
        try {
          const { chatId, imageData, caption } = data;
          
          const message = await chatService.sendMessage({
            chatId,
            senderId: socket.userId,
            content: imageData,
            type: 'photo',
            caption
          });

          this.io.to(chatId).emit('new_message', {
            ...message,
            senderName: socket.userName
          });

        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Индикатор печати (Redis)
      socket.on('typing_start', async (data) => {
        const { chatId } = data;
        await redisClient.hset('typing_users', socket.userId, JSON.stringify({ chatId, userName: socket.userName }));
        await redisClient.expire('typing_users', 300); // TTL 5 минут
        
        socket.to(chatId).emit('typing_start', {
          userId: socket.userId,
          userName: socket.userName
        });
      });

      socket.on('typing_stop', async (data) => {
        const { chatId } = data;
        await redisClient.hdel('typing_users', socket.userId);
        
        socket.to(chatId).emit('typing_stop', {
          userId: socket.userId,
          userName: socket.userName
        });
      });

      // Запрос видеозвонка
      socket.on('video_call_request', (data) => {
        const { chatId, targetUserId } = data;
        
        this.io.to(targetUserId).emit('video_call_request', {
          fromUserId: socket.userId,
          fromUserName: socket.userName,
          chatId
        });
      });

      // Принятие видеозвонка
      socket.on('video_call_accept', (data) => {
        const { chatId, fromUserId } = data;
        
        this.io.to(fromUserId).emit('video_call_accept', {
          chatId,
          acceptedBy: socket.userId
        });
      });

      // Отклонение видеозвонка
      socket.on('video_call_reject', (data) => {
        const { chatId, fromUserId } = data;
        
        this.io.to(fromUserId).emit('video_call_reject', {
          chatId,
          rejectedBy: socket.userId
        });
      });

      // Отключение от чата
      socket.on('disconnect', async () => {
        console.log(`User ${socket.userName} disconnected from chat`);
        
        // Устанавливаем пользователя как оффлайн (Redis)
        await this.setUserOnline(socket.userId, false);
        await redisClient.hdel('online_users', socket.userId);
        
        // Транслируем всем, что пользователь оффлайн
        this.io.emit('user_status_changed', {
          userId: socket.userId,
          isActive: false
        });
        
        // Удаляем из списка печатающих (Redis)
        const typingData = await redisClient.hget('typing_users', socket.userId);
        if (typingData) {
          const { chatId, userName } = JSON.parse(typingData);
          await redisClient.hdel('typing_users', socket.userId);
          
          socket.to(chatId).emit('typing_stop', {
            userId: socket.userId,
            userName
          });
        }
      });
    });
  }
  
  // Обновление статуса пользователя в БД
  async setUserOnline(userId, isActive) {
    try {
      await pool.query(
        'UPDATE users SET is_active = $1, last_seen = NOW() WHERE id = $2',
        [isActive, userId]
      );
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  }
}

module.exports = ChatSocket;

