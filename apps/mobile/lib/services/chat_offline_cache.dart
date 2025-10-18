import 'package:flutter/foundation.dart';

import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/message.dart';

/// Offline кэш для чатов (SQLite)
/// Сохраняет сообщения локально для offline доступа
class ChatOfflineCache {
  static final ChatOfflineCache _instance = ChatOfflineCache._internal();
  factory ChatOfflineCache() => _instance;
  ChatOfflineCache._internal();

  Database? _database;

  /// Инициализация базы данных
  Future<void> init() async {
    final dbPath = await getDatabasesPath();
    _database = await openDatabase(
      join(dbPath, 'chat_offline_cache.db'),
      version: 1,
      onCreate: (db, version) async {
        // Таблица сообщений
        await db.execute('''
          CREATE TABLE messages (
            id INTEGER PRIMARY KEY,
            chat_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            sender_name TEXT,
            sender_avatar TEXT,
            text TEXT,
            message_type TEXT NOT NULL,
            file_url TEXT,
            created_at TEXT NOT NULL,
            synced INTEGER DEFAULT 0,
            is_read INTEGER DEFAULT 0
          )
        ''');
        
        // Таблица чатов
        await db.execute('''
          CREATE TABLE chats (
            id INTEGER PRIMARY KEY,
            name TEXT,
            type TEXT NOT NULL,
            avatar_url TEXT,
            last_message TEXT,
            last_message_time TEXT,
            unread_count INTEGER DEFAULT 0,
            cached_at TEXT NOT NULL
          )
        ''');
        
        // Индексы для быстрого поиска
        await db.execute('''
          CREATE INDEX idx_messages_chat_id ON messages(chat_id)
        ''');
        
        await db.execute('''
          CREATE INDEX idx_messages_synced ON messages(synced)
        ''');
      },
    );
  }

  /// Сохранить сообщение в кэш
  Future<void> cacheMessage(Message message, int chatId) async {
    if (_database == null) await init();
    
    try {
      await _database!.insert(
        'messages',
        {
          'id': message.id,
          'chat_id': chatId,
          'sender_id': message.senderId,
          'sender_name': message.senderName,
          'sender_avatar': message.senderAvatar,
          'text': message.text,
          'message_type': message.messageType ?? 'text',
          'file_url': message.fileUrl,
          'created_at': message.createdAt.toIso8601String(),
          'synced': (message.synced ?? false) ? 1 : 0,
          'is_read': message.isRead ? 1 : 0,
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    } catch (e) {
      debugPrint('Ошибка кэширования сообщения: $e');
    }
  }

  /// Получить кэшированные сообщения для чата
  Future<List<Message>> getCachedMessages(int chatId) async {
    if (_database == null) await init();
    
    try {
      final List<Map<String, dynamic>> maps = await _database!.query(
        'messages',
        where: 'chat_id = ?',
        whereArgs: [chatId],
        orderBy: 'created_at DESC',
        limit: 50,
      );
      
      return maps.map((map) => Message(
        id: map['id'] as int,
        content: (map['text'] as String?) ?? '',
        senderId: map['sender_id'] as int,
        receiverId: map['receiver_id'] as int? ?? 0,
        senderName: map['sender_name'] as String?,
        senderAvatar: map['sender_avatar'] as String?,
        messageType: map['message_type'] as String?,
        fileUrl: map['file_url'] as String?,
        createdAt: DateTime.parse(map['created_at'] as String),
        synced: (map['synced'] as int) == 1,
        isRead: (map['is_read'] as int) == 1,
      )).toList();
    } catch (e) {
      debugPrint('Ошибка получения кэшированных сообщений: $e');
      return [];
    }
  }

  /// Сохранить чат в кэш
  Future<void> cacheChat(int chatId, String name, String type, {
    String? avatarUrl,
    String? lastMessage,
    DateTime? lastMessageTime,
    int unreadCount = 0,
  }) async {
    if (_database == null) await init();
    
    try {
      await _database!.insert(
        'chats',
        {
          'id': chatId,
          'name': name,
          'type': type,
          'avatar_url': avatarUrl,
          'last_message': lastMessage,
          'last_message_time': lastMessageTime?.toIso8601String(),
          'unread_count': unreadCount,
          'cached_at': DateTime.now().toIso8601String(),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    } catch (e) {
      debugPrint('Ошибка кэширования чата: $e');
    }
  }

  /// Получить кэшированные чаты
  Future<List<Map<String, dynamic>>> getCachedChats() async {
    if (_database == null) await init();
    
    try {
      return await _database!.query(
        'chats',
        orderBy: 'last_message_time DESC',
      );
    } catch (e) {
      debugPrint('Ошибка получения кэшированных чатов: $e');
      return [];
    }
  }

  /// Очистка старого кэша (>30 дней)
  Future<void> clearOldCache() async {
    if (_database == null) await init();
    
    try {
      final cutoffDate = DateTime.now()
          .subtract(const Duration(days: 30))
          .toIso8601String();
      
      await _database!.delete(
        'messages',
        where: 'created_at < ? AND synced = 1',
        whereArgs: [cutoffDate],
      );
      
      await _database!.delete(
        'chats',
        where: 'cached_at < ?',
        whereArgs: [cutoffDate],
      );
    } catch (e) {
      debugPrint('Ошибка очистки кэша: $e');
    }
  }
  
  /// Получить несинхронизированные сообщения
  Future<List<Message>> getUnsyncedMessages() async {
    if (_database == null) await init();
    
    try {
      final List<Map<String, dynamic>> maps = await _database!.query(
        'messages',
        where: 'synced = 0',
        orderBy: 'created_at ASC',
      );
      
      return maps.map((map) => Message(
        id: map['id'] as int,
        content: (map['text'] as String?) ?? '',
        senderId: map['sender_id'] as int,
        receiverId: map['receiver_id'] as int? ?? 0,
        senderName: map['sender_name'] as String?,
        senderAvatar: map['sender_avatar'] as String?,
        messageType: map['message_type'] as String?,
        fileUrl: map['file_url'] as String?,
        createdAt: DateTime.parse(map['created_at'] as String),
        synced: false,
        isRead: (map['is_read'] as int) == 1,
      )).toList();
    } catch (e) {
      debugPrint('Ошибка получения несинхронизированных сообщений: $e');
      return [];
    }
  }
  
  /// Пометить сообщение как синхронизированное
  Future<void> markAsSynced(int messageId) async {
    if (_database == null) await init();
    
    try {
      await _database!.update(
        'messages',
        {'synced': 1},
        where: 'id = ?',
        whereArgs: [messageId],
      );
    } catch (e) {
      debugPrint('Ошибка обновления статуса синхронизации: $e');
    }
  }
}



