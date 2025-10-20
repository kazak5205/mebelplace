const jwt = require('jsonwebtoken');
const { pool } = require('./database');
const OrderSocketHandler = require('../socket/orderSocket');
const ChatSocket = require('../socket/chatSocket');

let orderSocketHandler;
let chatSocketHandler;

const setupSocket = (io) => {
  // Initialize socket handlers
  orderSocketHandler = new OrderSocketHandler(io);
  chatSocketHandler = new ChatSocket(io);
  
  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Get user from database
      const result = await pool.query(
        'SELECT id, username, role FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return next(new Error('User not found'));
      }

      socket.userId = decoded.userId;
      socket.user = result.rows[0];
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`👤 User ${socket.user.username} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle joining chat rooms
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`💬 User ${socket.user.username} joined chat ${chatId}`);
    });

    // Handle joining order rooms
    socket.on('join_order_room', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`📋 User ${socket.user.username} joined order room ${orderId}`);
    });

    // Handle leaving chat rooms
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
      console.log(`💬 User ${socket.user.username} left chat ${chatId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, messageType = 'text' } = data;

        // Save message to database
        const result = await pool.query(
          'INSERT INTO messages (chat_id, sender_id, content, message_type) VALUES ($1, $2, $3, $4) RETURNING *',
          [chatId, socket.userId, content, messageType]
        );

        const message = result.rows[0];

        // Send message to all users in the chat
        io.to(`chat_${chatId}`).emit('new_message', {
          id: message.id,
          chatId: message.chat_id,
          senderId: message.sender_id,
          content: message.content,
          messageType: message.message_type,
          createdAt: message.created_at,
          sender: {
            id: socket.user.id,
            username: socket.user.username
          }
        });

        console.log(`💬 Message sent in chat ${chatId} by ${socket.user.username}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(`chat_${data.chatId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`chat_${data.chatId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username,
        isTyping: false
      });
    });

    // Handle video likes/comments
    socket.on('video_like', async (data) => {
      try {
        const { videoId } = data;

        // Toggle like in database
        const likeResult = await pool.query(
          'SELECT id FROM video_likes WHERE video_id = $1 AND user_id = $2',
          [videoId, socket.userId]
        );

        if (likeResult.rows.length > 0) {
          // Remove like
          await pool.query(
            'DELETE FROM video_likes WHERE video_id = $1 AND user_id = $2',
            [videoId, socket.userId]
          );
          await pool.query(
            'UPDATE videos SET likes = likes - 1 WHERE id = $1',
            [videoId]
          );
        } else {
          // Add like
          await pool.query(
            'INSERT INTO video_likes (video_id, user_id) VALUES ($1, $2)',
            [videoId, socket.userId]
          );
          await pool.query(
            'UPDATE videos SET likes = likes + 1 WHERE id = $1',
            [videoId]
          );
        }

        // Get updated like count
        const videoResult = await pool.query(
          'SELECT likes FROM videos WHERE id = $1',
          [videoId]
        );

        // Broadcast to all users watching this video
        io.emit('video_like_updated', {
          videoId,
          likes: videoResult.rows[0].likes,
          liked: likeResult.rows.length === 0
        });

      } catch (error) {
        console.error('Error handling video like:', error);
      }
    });

    // Handle new video uploads
    socket.on('video_uploaded', (data) => {
      // Notify subscribers
      io.emit('new_video', data);
    });

    // Handle new order responses
    socket.on('order_response', (data) => {
      // Notify client about new response
      io.to(`user_${data.clientId}`).emit('new_order_response', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`👤 User ${socket.user.username} disconnected`);
    });
  });
};

module.exports = { 
  setupSocket, 
  getOrderSocketHandler: () => orderSocketHandler,
  getChatSocketHandler: () => chatSocketHandler
};
