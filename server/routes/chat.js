const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { generalFileUpload } = require('../middleware/upload');
const notificationService = require('../services/notificationService');
const router = express.Router();

// Глобальная переменная для хранения io instance
let ioInstance = null;

// Функция для установки io instance (вызывается из index.js)
router.setIO = (io) => {
  ioInstance = io;
};

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

    // Для приватных чатов - проверяем существующий чат между этими участниками
    // ИСПРАВЛЕНО: проверяем дубликаты даже с orderId
    if (type === 'private' && participants.length === 1) {
      const allParticipants = [...participants, creatorId].sort();
      console.log('[CREATE CHAT] Checking for existing chat between:', allParticipants);
      
      // ИСПРАВЛЕНО: проверяем дубликаты БЕЗ учета orderId - ОДИН чат для пары участников
      const existingChatResult = await pool.query(`
        SELECT c.* 
        FROM chats c
        WHERE c.type = 'private' 
          AND c.is_active = true
          AND (
            SELECT COUNT(DISTINCT cp.user_id)
            FROM chat_participants cp
            WHERE cp.chat_id = c.id
          ) = 2
          AND EXISTS (
            SELECT 1 FROM chat_participants cp1
            WHERE cp1.chat_id = c.id AND cp1.user_id = $1
          )
          AND EXISTS (
            SELECT 1 FROM chat_participants cp2
            WHERE cp2.chat_id = c.id AND cp2.user_id = $2
          )
        LIMIT 1
      `, allParticipants);

      console.log('[CREATE CHAT] Found existing chats:', existingChatResult.rows.length);
      if (existingChatResult.rows.length > 0) {
        console.log('[CREATE CHAT] Returning existing chat:', existingChatResult.rows[0].id);
        return res.status(200).json({
          success: true,
          data: existingChatResult.rows[0],
          message: 'Existing chat found',
          timestamp: new Date().toISOString()
        });
      }
      console.log('[CREATE CHAT] No existing chat found, creating new one');
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

    // Добавляем participants к каждому чату
    for (const chat of result.rows) {
      const participantsResult = await pool.query(`
        SELECT 
          cp.*,
          u.username,
          u.first_name,
          u.last_name,
          u.avatar,
          u.is_active,
          COALESCE(NULLIF(TRIM(u.first_name || ' ' || u.last_name), ''), u.username) as name
        FROM chat_participants cp
        INNER JOIN users u ON cp.user_id = u.id
        WHERE cp.chat_id = $1
        ORDER BY cp.joined_at ASC
      `, [chat.id]);
      
      chat.participants = participantsResult.rows;
    }

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
        u.username,
        u.first_name,
        u.last_name,
        u.avatar,
        u.is_active,
        COALESCE(NULLIF(TRIM(u.first_name || ' ' || u.last_name), ''), u.username) as name
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
router.post('/:id/message', authenticateToken, generalFileUpload.single('file'), async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    const { content, type = 'text', replyTo, metadata } = req.body;

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

    // Подготовка metadata
    let metadataJson = null;
    if (metadata) {
      metadataJson = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
    }

    // Создание сообщения
    const messageResult = await pool.query(`
      INSERT INTO messages (chat_id, sender_id, content, type, reply_to, file_path, file_name, file_size, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [chatId, userId, messageContent, type, replyTo, filePath, fileName, fileSize, metadataJson ? JSON.stringify(metadataJson) : null]);

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

    // Отправляем WebSocket событие всем участникам чата
    if (ioInstance) {
      const eventData = {
        chatId: chatId,
        chat_id: chatId,
        message: {
          id: message.id,
          chatId: chatId,
          senderId: message.sender_id,
          content: message.content,
          type: message.type,
          metadata: message.metadata || null,
          file_path: message.file_path,
          file_name: message.file_name,
          createdAt: message.created_at,
          created_at: message.created_at,
          sender: message.sender
        }
      };
      
      // Отправляем каждому участнику в их личную комнату
      for (const participant of participantsResult.rows) {
        ioInstance.to(`user_${participant.user_id}`).emit('new_message', eventData);
        console.log(`📨 WebSocket event sent to user ${participant.user_id}`);
      }
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
});

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

// DELETE /api/chat/:id - Удалить чат полностью (только для создателя или админа)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;

    // Проверяем права: только создатель чата или админ может удалить
    const chatResult = await pool.query(
      'SELECT creator_id FROM chats WHERE id = $1',
      [chatId]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
        timestamp: new Date().toISOString()
      });
    }

    const chat = chatResult.rows[0];

    // Проверяем, является ли пользователь создателем чата
    const isCreator = chat.creator_id === userId;
    
    // Проверяем, является ли пользователь админом
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    const isAdmin = userResult.rows[0]?.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only chat creator or admin can delete the chat',
        timestamp: new Date().toISOString()
      });
    }

    // Удаляем чат (каскадное удаление удалит участников и сообщения)
    await pool.query('DELETE FROM chats WHERE id = $1', [chatId]);

    res.json({
      success: true,
      message: 'Chat deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat',
      timestamp: new Date().toISOString()
    });
  }
});


module.exports = router;