const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class ChatService {
  // Создание чата
  async createChat({ participants, type, name, creatorId }) {
    const chatId = uuidv4();
    
    // Создаем чат
    const chat = await db.query(
      `INSERT INTO chats (id, type, name, creator_id, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING *`,
      [chatId, type, name, creatorId]
    );

    // Добавляем участников
    for (const participantId of participants) {
      await db.query(
        `INSERT INTO chat_participants (chat_id, user_id, joined_at) 
         VALUES ($1, $2, NOW())`,
        [chatId, participantId]
      );
    }

    return chat.rows[0];
  }

  // Получение чатов пользователя
  async getUserChats(userId) {
    const result = await db.query(`
      SELECT c.*, 
             COUNT(m.id) as unread_count,
             MAX(m.created_at) as last_message_at
      FROM chats c
      LEFT JOIN chat_participants cp ON c.id = cp.chat_id
      LEFT JOIN messages m ON c.id = m.chat_id AND m.sender_id != $1
      WHERE cp.user_id = $1
      GROUP BY c.id, c.type, c.name, c.creator_id, c.created_at
      ORDER BY last_message_at DESC
    `, [userId]);

    return result.rows;
  }

  // Получение сообщений чата
  async getChatMessages(chatId, userId, { page, limit }) {
    const offset = (page - 1) * limit;

    const result = await db.query(`
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [chatId, limit, offset]);

    return result.rows.reverse();
  }

  // Отправка сообщения
  async sendMessage({ chatId, senderId, content, type, replyTo }) {
    const messageId = uuidv4();
    
    const result = await db.query(`
      INSERT INTO messages (id, chat_id, sender_id, content, type, reply_to, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `, [messageId, chatId, senderId, content, type, replyTo]);

    return result.rows[0];
  }

  // Отправка файла
  async sendFile({ chatId, senderId, file, type }) {
    const messageId = uuidv4();
    
    const result = await db.query(`
      INSERT INTO messages (id, chat_id, sender_id, content, type, file_path, file_name, file_size, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `, [
      messageId, 
      chatId, 
      senderId, 
      file.filename, 
      type, 
      file.path, 
      file.originalname, 
      file.size
    ]);

    return result.rows[0];
  }

  // Обновление статуса сообщения
  async updateMessageStatus(messageId, status) {
    const result = await db.query(`
      UPDATE messages 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, messageId]);

    return result.rows[0];
  }

  // Получение участников чата
  async getChatParticipants(chatId) {
    const result = await db.query(`
      SELECT u.id, u.name, u.avatar, cp.joined_at
      FROM chat_participants cp
      LEFT JOIN users u ON cp.user_id = u.id
      WHERE cp.chat_id = $1
    `, [chatId]);

    return result.rows;
  }
}

module.exports = new ChatService();
