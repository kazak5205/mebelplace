const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { generalFileUpload } = require('../middleware/upload');
const notificationService = require('../services/notificationService');
const { getIo } = require('../config/socket');
const router = express.Router();

// POST /api/chats/create-with-user - Создание чата с конкретным пользователем
router.post('/create-with-user', authenticateToken, async (req, res) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.user.id;

    console.log('📱 Creating chat with user:', { currentUserId, participantId });

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем, что пользователь существует
    const participantResult = await pool.query(
      'SELECT id, username, first_name, last_name, avatar FROM users WHERE id = $1 AND is_active = true',
      [participantId]
    );

    if (participantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем, есть ли уже чат между этими пользователями
    const existingChatResult = await pool.query(`
      SELECT DISTINCT c.id, c.type, c.name, c.created_at, c.updated_at
      FROM chats c
      INNER JOIN chat_participants cp1 ON c.id = cp1.chat_id AND cp1.user_id = $1
      INNER JOIN chat_participants cp2 ON c.id = cp2.chat_id AND cp2.user_id = $2
      WHERE c.type = 'private' AND c.is_active = true
      LIMIT 1
    `, [currentUserId, participantId]);

    if (existingChatResult.rows.length > 0) {
      console.log('✅ Found existing chat:', existingChatResult.rows[0].id);
      return res.json({
        success: true,
        data: existingChatResult.rows[0],
        message: 'Chat already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Создаем новый чат
    const participant = participantResult.rows[0];
    const chatName = `${req.user.username} - ${participant.username}`;

    const chatResult = await pool.query(`
      INSERT INTO chats (type, name, is_active, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `, ['private', chatName, true, currentUserId]);

    const chat = chatResult.rows[0];

    console.log('✅ Created new chat:', chat.id);

    // Добавляем обоих участников
    await pool.query(`
      INSERT INTO chat_participants (chat_id, user_id, role, joined_at)
      VALUES ($1, $2, $3, NOW()), ($1, $4, $5, NOW())
    `, [chat.id, currentUserId, 'admin', participantId, 'member']);

    console.log('✅ Added participants to chat');

    res.status(201).json({
      success: true,
      data: chat,
      message: 'Chat created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Create chat with user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/chat/create - Создание чата
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { participants, type = 'private', name, orderId } = req.body;
    const creatorId = req.user.id;

    if (!participants || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Participants are required',
        timestamp: new Date().toISOString()
      });
    }

    // Проверка, что все участники существуют
    const participantsResult = await pool.query(
      'SELECT id FROM users WHERE id = ANY($1) AND is_active = true',
      [participants]
    );

    if (participantsResult.rows.length !== participants.length) {
      return res.status(400).json({
        success: false,
        message: 'Some participants not found',
        timestamp: new Date().toISOString()
      });
    }

    // Создание чата
    const chatResult = await pool.query(`
      INSERT INTO chats (type, name, order_id, is_active, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [type, name, orderId, true, creatorId]);

    const chat = chatResult.rows[0];

    // Добавление участников
    const allParticipants = [...participants, creatorId];
    for (const participantId of allParticipants) {
      await pool.query(`
        INSERT INTO chat_participants (chat_id, user_id, role)
        VALUES ($1, $2, $3)
      `, [chat.id, participantId, participantId === creatorId ? 'admin' : 'member']);
    }

    res.status(201).json({
      success: true,
      data: chat,
      message: 'Chat created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/chat/list - Список чатов пользователя
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT DISTINCT
        c.*,
        cp.role as user_role,
        cp.last_read_at,
        (
          SELECT m.content
          FROM messages m
          WHERE m.chat_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as last_message,
        (
          SELECT m.created_at
          FROM messages m
          WHERE m.chat_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*)
          FROM messages m
          WHERE m.chat_id = c.id
          AND m.created_at > cp.last_read_at
          AND m.sender_id != $1
        ) as unread_count
      FROM chats c
      INNER JOIN chat_participants cp ON c.id = cp.chat_id
      WHERE cp.user_id = $1 AND c.is_active = true
      ORDER BY last_message_time DESC NULLS LAST, c.updated_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Получаем participants для каждого чата
    const chatsWithParticipants = await Promise.all(result.rows.map(async (chat) => {
      const participantsResult = await pool.query(`
        SELECT u.id, u.username as name, u.first_name, u.last_name, u.role, u.avatar
        FROM chat_participants cp
        INNER JOIN users u ON cp.user_id = u.id
        WHERE cp.chat_id = $1
      `, [chat.id]);

      return {
        ...chat,
        participants: participantsResult.rows
      };
    }));

    res.json({
      success: true,
      data: {
        chats: chatsWithParticipants,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: chatsWithParticipants.length
        }
      },
      message: 'Chats retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get chat list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chats',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/chat/:id - Получить чат
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;

    // Проверка доступа к чату
    const accessResult = await pool.query(
      'SELECT role FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (accessResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    // Получение информации о чате
    const chatResult = await pool.query(`
      SELECT 
        c.*,
        cp.role as user_role,
        cp.last_read_at
      FROM chats c
      INNER JOIN chat_participants cp ON c.id = cp.chat_id
      WHERE c.id = $1 AND cp.user_id = $2
    `, [chatId, userId]);

    if (chatResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
        timestamp: new Date().toISOString()
      });
    }

    const chat = chatResult.rows[0];

    // Получение участников чата
    const participantsResult = await pool.query(`
      SELECT 
        cp.*,
        u.id as user_id,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar,
        u.is_active,
        u.role as user_role
      FROM chat_participants cp
      INNER JOIN users u ON cp.user_id = u.id
      WHERE cp.chat_id = $1
      ORDER BY cp.joined_at ASC
    `, [chatId]);

    chat.participants = participantsResult.rows;

    res.json({
      success: true,
      data: chat,
      message: 'Chat retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/chat/:id/messages - Получить сообщения чата
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Проверка доступа к чату
    const accessResult = await pool.query(
      'SELECT id FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (accessResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    // Получение сообщений
    const messagesResult = await pool.query(`
      SELECT 
        m.*,
        u.username as sender_username,
        u.first_name as sender_first_name,
        u.last_name as sender_last_name,
        u.avatar as sender_avatar
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [chatId, limit, offset]);

    // Обновление времени последнего прочтения
    await pool.query(
      'UPDATE chat_participants SET last_read_at = NOW() WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    res.json({
      success: true,
      data: {
        messages: messagesResult.rows.reverse(), // Возвращаем в хронологическом порядке
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: messagesResult.rows.length
        }
      },
      message: 'Messages retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/chat/:id/message - Отправить сообщение
// Also handle /:id/messages for frontend compatibility
const sendMessageHandler = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    const { content, type = 'text', replyTo, metadata } = req.body;
    
    // Debug logging
    console.error('🔍 [DEBUG] sendMessageHandler called');
    console.error('🔍 [DEBUG] req.body:', JSON.stringify(req.body));
    console.error('🔍 [DEBUG] metadata:', JSON.stringify(metadata));

    if (!content && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Content or file is required',
        timestamp: new Date().toISOString()
      });
    }

    // Проверка доступа к чату
    const accessResult = await pool.query(
      'SELECT id FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (accessResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    let messageContent = content;
    let filePath = null;
    let fileName = null;
    let fileSize = null;

    // Обработка файла
    if (req.file) {
      filePath = `/uploads/chat-files/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      
      if (type === 'image' || type === 'video') {
        messageContent = `[${type === 'image' ? 'Фото' : 'Видео'}]`;
      } else if (type === 'file') {
        messageContent = `[Файл: ${fileName}]`;
      }
    }

    // Создание сообщения
    const messageResult = await pool.query(`
      INSERT INTO messages (chat_id, sender_id, content, type, reply_to, file_path, file_name, file_size, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [chatId, userId, messageContent, type, replyTo, filePath, fileName, fileSize, metadata ? JSON.stringify(metadata) : null]);

    const message = messageResult.rows[0];

    // Получение информации об отправителе
    const senderResult = await pool.query(
      'SELECT username, first_name, last_name, avatar FROM users WHERE id = $1',
      [userId]
    );

    message.sender = senderResult.rows[0];

    // Обновление времени последнего сообщения в чате
    await pool.query(
      'UPDATE chats SET updated_at = NOW() WHERE id = $1',
      [chatId]
    );

    // Уведомление участников чата
    const participantsResult = await pool.query(
      'SELECT user_id FROM chat_participants WHERE chat_id = $1 AND user_id != $2',
      [chatId, userId]
    );

    for (const participant of participantsResult.rows) {
      await notificationService.notifyNewMessage(
        participant.user_id,
        req.user.username,
        chatId
      );
    }
    
    // Send Socket.IO event for real-time updates
    const io = getIo();
    if (io) {
      io.to(`chat_${chatId}`).emit('new_message', {
        id: message.id,
        chatId: message.chat_id,
        senderId: message.sender_id,
        content: message.content,
        type: message.type,
        file_path: message.file_path,
        file_name: message.file_name,
        file_size: message.file_size,
        metadata: message.metadata,
        created_at: message.created_at,
        sender: message.sender
      });
    }

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      timestamp: new Date().toISOString()
    });
  }
};

// Register both routes (with and without 's')
router.post('/:id/message', authenticateToken, generalFileUpload.single('file'), sendMessageHandler);
router.post('/:id/messages', authenticateToken, generalFileUpload.single('file'), sendMessageHandler);

// PUT /api/chat/:id/read - Отметить сообщения как прочитанные
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;

    // Обновление времени последнего прочтения
    await pool.query(
      'UPDATE chat_participants SET last_read_at = NOW() WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/chat/:id/leave - Покинуть чат
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;

    // Удаление участника из чата
    const result = await pool.query(
      'DELETE FROM chat_participants WHERE chat_id = $1 AND user_id = $2 RETURNING *',
      [chatId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'You are not a participant of this chat',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Left chat successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Leave chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave chat',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/chat/:id/add-participant - Добавить участника
router.post('/:id/add-participant', authenticateToken, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    const { participantId } = req.body;

    // Проверка прав администратора
    const adminResult = await pool.query(
      'SELECT role FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (adminResult.rows.length === 0 || !['admin', 'moderator'].includes(adminResult.rows[0].role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        timestamp: new Date().toISOString()
      });
    }

    // Проверка существования пользователя
    const userResult = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND is_active = true',
      [participantId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Добавление участника
    await pool.query(
      'INSERT INTO chat_participants (chat_id, user_id, role) VALUES ($1, $2, $3)',
      [chatId, participantId, 'member']
    );

    res.json({
      success: true,
      message: 'Participant added successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add participant',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== SUPPORT CHAT ENDPOINTS ====================

// GET /api/chats/support - Get or create support chat
router.get('/support', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📞 Getting support chat for user:', userId);
    console.log('📞 User object:', req.user);

    // Check if support chat already exists for this user
    const existingChatResult = await pool.query(`
      SELECT c.*, cp.role as user_role
      FROM chats c
      INNER JOIN chat_participants cp ON c.id = cp.chat_id
      WHERE c.type = 'support' AND cp.user_id = $1 AND c.is_active = true
      LIMIT 1
    `, [userId]);

    if (existingChatResult.rows.length > 0) {
      console.log('✅ Found existing support chat:', existingChatResult.rows[0].id);
      return res.json({
        success: true,
        data: existingChatResult.rows[0],
        message: 'Support chat retrieved successfully',
        timestamp: new Date().toISOString()
      });
    }

    // Create new support chat
    const chatResult = await pool.query(`
      INSERT INTO chats (type, name, is_active, creator_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `, ['support', `Поддержка - ${req.user.username}`, true, userId]);

    const chat = chatResult.rows[0];
    console.log('✅ Created new support chat:', chat.id);

    // Add user as participant
    await pool.query(`
      INSERT INTO chat_participants (chat_id, user_id, role, joined_at)
      VALUES ($1, $2, $3, NOW())
    `, [chat.id, userId, 'member']);

    // Add admin as participant (find first admin user)
    const adminResult = await pool.query(
      'SELECT id FROM users WHERE role = $1 AND is_active = true LIMIT 1',
      ['admin']
    );

    if (adminResult.rows.length > 0) {
      await pool.query(`
        INSERT INTO chat_participants (chat_id, user_id, role, joined_at)
        VALUES ($1, $2, $3, NOW())
      `, [chat.id, adminResult.rows[0].id, 'admin']);
    }

    res.status(201).json({
      success: true,
      data: chat,
      message: 'Support chat created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get support chat error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get support chat',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/chats/support/messages - Send message to support
router.post('/support/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, type = 'text' } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('📤 Sending support message from user:', userId);

    // Get or create support chat
    const chatResult = await pool.query(`
      SELECT c.*, cp.role as user_role
      FROM chats c
      INNER JOIN chat_participants cp ON c.id = cp.chat_id
      WHERE c.type = 'support' AND cp.user_id = $1 AND c.is_active = true
      LIMIT 1
    `, [userId]);

    let chatId;
    if (chatResult.rows.length > 0) {
      chatId = chatResult.rows[0].id;
    } else {
      // Create support chat if doesn't exist
      const newChatResult = await pool.query(`
        INSERT INTO chats (type, name, is_active, creator_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `, ['support', `Поддержка - ${req.user.username}`, true, userId]);

      chatId = newChatResult.rows[0].id;

      // Add user as participant
      await pool.query(`
        INSERT INTO chat_participants (chat_id, user_id, role, joined_at)
        VALUES ($1, $2, $3, NOW())
      `, [chatId, userId, 'member']);

      // Add admin as participant
      const adminResult = await pool.query(
        'SELECT id FROM users WHERE role = $1 AND is_active = true LIMIT 1',
        ['admin']
      );

      if (adminResult.rows.length > 0) {
        await pool.query(`
          INSERT INTO chat_participants (chat_id, user_id, role, joined_at)
          VALUES ($1, $2, $3, NOW())
        `, [chatId, adminResult.rows[0].id, 'admin']);
      }
    }

    // Create message
    const messageResult = await pool.query(`
      INSERT INTO messages (chat_id, sender_id, content, type, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `, [chatId, userId, content.trim(), type]);

    const message = messageResult.rows[0];

    // Get sender info
    const senderResult = await pool.query(
      'SELECT username, first_name, last_name, avatar FROM users WHERE id = $1',
      [userId]
    );

    message.sender = senderResult.rows[0];

    // Update chat timestamp
    await pool.query(
      'UPDATE chats SET updated_at = NOW() WHERE id = $1',
      [chatId]
    );

    // Notify admin about new support message
    const adminParticipants = await pool.query(
      'SELECT user_id FROM chat_participants WHERE chat_id = $1 AND role = $2',
      [chatId, 'admin']
    );

    for (const admin of adminParticipants.rows) {
      await notificationService.notifyNewMessage(
        admin.user_id,
        req.user.username,
        chatId
      );
    }

    console.log('✅ Support message sent successfully');

    res.status(201).json({
      success: true,
      data: message,
      message: 'Support message sent successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Send support message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send support message',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/admin/support-chats - Get all support chats for admin
router.get('/admin/support-chats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is admin
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        timestamp: new Date().toISOString()
      });
    }

    const { page = 1, limit = 20, status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "c.type = 'support' AND c.is_active = true";
    if (status === 'unread') {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM messages m 
        WHERE m.chat_id = c.id 
        AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01')
        AND m.sender_id != $1
      )`;
    }

    const result = await pool.query(`
      SELECT DISTINCT
        c.*,
        cp.role as user_role,
        cp.last_read_at,
        (
          SELECT m.content
          FROM messages m
          WHERE m.chat_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as last_message,
        (
          SELECT m.created_at
          FROM messages m
          WHERE m.chat_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*)
          FROM messages m
          WHERE m.chat_id = c.id
          AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01')
          AND m.sender_id != $1
        ) as unread_count,
        (
          SELECT u.username
          FROM chat_participants cp2
          INNER JOIN users u ON cp2.user_id = u.id
          WHERE cp2.chat_id = c.id AND cp2.role = 'member'
          LIMIT 1
        ) as client_username
      FROM chats c
      INNER JOIN chat_participants cp ON c.id = cp.chat_id
      WHERE cp.user_id = $1 AND ${whereClause}
      ORDER BY last_message_time DESC NULLS LAST, c.updated_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    res.json({
      success: true,
      data: {
        chats: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.rows.length
        }
      },
      message: 'Support chats retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get support chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve support chats',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;