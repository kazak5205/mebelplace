const jwt = require('jsonwebtoken');
const chatService = require('../services/chatService');

class ChatSocket {
  constructor(io) {
    this.io = io;
    this.typingUsers = new Map();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  // Middleware для аутентификации
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userName = decoded.name;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });
  }

  // Обработчики событий
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userName} connected to chat`);

      // Подключение к чату
      socket.on('join_chat', async (data) => {
        try {
          const { chatId } = data;
          socket.join(chatId);
          socket.emit('joined_chat', { chatId });
          
          // Уведомляем других участников
          socket.to(chatId).emit('user_joined', {
            userId: socket.userId,
            userName: socket.userName
          });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Отправка сообщения
      socket.on('send_message', async (data) => {
        try {
          const { chatId, content, type = 'text', replyTo } = data;
          
          const message = await chatService.sendMessage({
            chatId,
            senderId: socket.userId,
            content,
            type,
            replyTo
          });

          // Отправляем сообщение всем участникам чата
          this.io.to(chatId).emit('new_message', {
            ...message,
            senderName: socket.userName
          });

          // Обновляем статус сообщения
          setTimeout(async () => {
            await chatService.updateMessageStatus(message.id, 'delivered');
            this.io.to(chatId).emit('message_status', {
              messageId: message.id,
              status: 'delivered'
            });
          }, 1000);

        } catch (error) {
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

      // Индикатор печати
      socket.on('typing_start', (data) => {
        const { chatId } = data;
        this.typingUsers.set(socket.userId, { chatId, userName: socket.userName });
        
        socket.to(chatId).emit('typing_start', {
          userId: socket.userId,
          userName: socket.userName
        });
      });

      socket.on('typing_stop', (data) => {
        const { chatId } = data;
        this.typingUsers.delete(socket.userId);
        
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
      socket.on('disconnect', () => {
        console.log(`User ${socket.userName} disconnected from chat`);
        
        // Удаляем из списка печатающих
        if (this.typingUsers.has(socket.userId)) {
          const { chatId, userName } = this.typingUsers.get(socket.userId);
          this.typingUsers.delete(socket.userId);
          
          socket.to(chatId).emit('typing_stop', {
            userId: socket.userId,
            userName
          });
        }
      });
    });
  }
}

module.exports = ChatSocket;
