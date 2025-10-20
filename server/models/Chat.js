const db = require('../config/database');

class Chat {
  constructor() {
    this.tableName = 'chats';
  }

  // Создание таблицы чатов
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS chats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(20) NOT NULL CHECK (type IN ('private', 'group', 'channel')),
        name VARCHAR(255),
        description TEXT,
        creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        avatar VARCHAR(500),
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await db.query(query);
  }

  // Создание таблицы участников чата
  async createParticipantsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS chat_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(chat_id, user_id)
      );
    `;

    await db.query(query);
  }

  // Создание таблицы сообщений
  async createMessagesTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'audio', 'file', 'sticker', 'voice')),
        reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
        file_path VARCHAR(500),
        file_name VARCHAR(255),
        file_size BIGINT,
        metadata JSONB DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await db.query(query);
  }

  // Создание таблицы видеозвонков
  async createVideoCallsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS video_calls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id VARCHAR(255) UNIQUE NOT NULL,
        chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'initiated' CHECK (status IN ('initiated', 'active', 'ended', 'cancelled')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ended_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await db.query(query);
  }

  // Создание таблицы участников видеозвонков
  async createVideoCallParticipantsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS video_call_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id VARCHAR(255) NOT NULL REFERENCES video_calls(room_id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'left')),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        left_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(room_id, user_id)
      );
    `;

    await db.query(query);
  }

  // Создание индексов
  async createIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id);',
      'CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);',
      'CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);',
      'CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_video_calls_chat_id ON video_calls(chat_id);',
      'CREATE INDEX IF NOT EXISTS idx_video_calls_initiator_id ON video_calls(initiator_id);',
      'CREATE INDEX IF NOT EXISTS idx_video_call_participants_room_id ON video_call_participants(room_id);',
      'CREATE INDEX IF NOT EXISTS idx_video_call_participants_user_id ON video_call_participants(user_id);'
    ];

    for (const index of indexes) {
      await db.query(index);
    }
  }

  // Инициализация всех таблиц
  async initialize() {
    await this.createTable();
    await this.createParticipantsTable();
    await this.createMessagesTable();
    await this.createVideoCallsTable();
    await this.createVideoCallParticipantsTable();
    await this.createIndexes();
  }
}

module.exports = new Chat();
