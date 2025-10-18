import 'package:flutter/foundation.dart';

import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/video.dart';
import '../models/request.dart' as req_model;
import '../models/message.dart';

/// Сервис для offline чтения контента
/// - Кэширование видео, заявок, сообщений для offline просмотра
/// - Умное управление кэшем
/// - Автоматическая очистка старых данных
class OfflineContentService {
  static final OfflineContentService _instance = OfflineContentService._internal();
  factory OfflineContentService() => _instance;
  OfflineContentService._internal();

  Database? _db;

  /// Инициализация
  Future<void> init() async {
    final dbPath = await getDatabasesPath();
    _db = await openDatabase(
      join(dbPath, 'offline_content.db'),
      version: 1,
      onCreate: (db, version) async {
        // Таблица для видео
        await db.execute('''
          CREATE TABLE offline_videos (
            id INTEGER PRIMARY KEY,
            data TEXT NOT NULL,
            cached_at INTEGER NOT NULL,
            last_viewed INTEGER
          )
        ''');
        
        // Таблица для заявок
        await db.execute('''
          CREATE TABLE offline_requests (
            id INTEGER PRIMARY KEY,
            data TEXT NOT NULL,
            cached_at INTEGER NOT NULL
          )
        ''');
        
        // Таблица для сообщений
        await db.execute('''
          CREATE TABLE offline_messages (
            id INTEGER PRIMARY KEY,
            chat_id INTEGER NOT NULL,
            data TEXT NOT NULL,
            cached_at INTEGER NOT NULL
          )
        ''');
        
        await db.execute('''
          CREATE INDEX idx_chat_id ON offline_messages(chat_id)
        ''');
      },
    );
  }

  /// Сохранить видео для offline просмотра
  Future<void> saveVideo(Video video) async {
    if (_db == null) await init();

    await _db!.insert(
      'offline_videos',
      {
        'id': video.id,
        'data': json.encode(video.toJson()),
        'cached_at': DateTime.now().millisecondsSinceEpoch,
        'last_viewed': DateTime.now().millisecondsSinceEpoch,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Получить видео из offline кэша
  Future<Video?> getVideo(int videoId) async {
    if (_db == null) return null;

    final result = await _db!.query(
      'offline_videos',
      where: 'id = ?',
      whereArgs: [videoId],
    );

    if (result.isEmpty) return null;

    final data = json.decode(result.first['data'] as String);
    
    // Обновляем время просмотра
    await _db!.update(
      'offline_videos',
      {'last_viewed': DateTime.now().millisecondsSinceEpoch},
      where: 'id = ?',
      whereArgs: [videoId],
    );

    return Video.fromJson(data);
  }

  /// Получить все сохранённые видео
  Future<List<Video>> getAllVideos() async {
    if (_db == null) return [];

    final result = await _db!.query(
      'offline_videos',
      orderBy: 'last_viewed DESC',
    );

    return result.map((row) {
      final data = json.decode(row['data'] as String);
      return Video.fromJson(data);
    }).toList();
  }

  /// Сохранить заявку
  Future<void> saveRequest(req_model.Request request) async {
    if (_db == null) await init();

    await _db!.insert(
      'offline_requests',
      {
        'id': request.id,
        'data': json.encode(request.toJson()),
        'cached_at': DateTime.now().millisecondsSinceEpoch,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Получить заявки из кэша
  Future<List<req_model.Request>> getAllRequests() async {
    if (_db == null) return [];

    final result = await _db!.query(
      'offline_requests',
      orderBy: 'cached_at DESC',
    );

    return result.map((row) {
      final data = json.decode(row['data'] as String);
      return req_model.Request.fromJson(data);
    }).toList();
  }

  /// Сохранить сообщения чата
  Future<void> saveMessages(int chatId, List<Message> messages) async {
    if (_db == null) await init();

    // Удаляем старые сообщения этого чата
    await _db!.delete(
      'offline_messages',
      where: 'chat_id = ?',
      whereArgs: [chatId],
    );

    // Сохраняем новые
    for (final message in messages) {
      await _db!.insert('offline_messages', {
        'id': message.id,
        'chat_id': chatId,
        'data': json.encode(message.toJson()),
        'cached_at': DateTime.now().millisecondsSinceEpoch,
      });
    }
  }

  /// Получить сообщения чата
  Future<List<Message>> getMessages(int chatId) async {
    if (_db == null) return [];

    final result = await _db!.query(
      'offline_messages',
      where: 'chat_id = ?',
      whereArgs: [chatId],
      orderBy: 'id ASC',
    );

    return result.map((row) {
      final data = json.decode(row['data'] as String);
      return Message.fromJson(data);
    }).toList();
  }

  /// Очистить весь offline контент
  Future<void> clearAll() async {
    if (_db == null) return;

    await _db!.delete('offline_videos');
    await _db!.delete('offline_requests');
    await _db!.delete('offline_messages');
  }

  /// Очистить старый контент (>7 дней)
  Future<void> clearOld() async {
    if (_db == null) return;

    final weekAgo = DateTime.now()
        .subtract(const Duration(days: 7))
        .millisecondsSinceEpoch;

    await _db!.delete(
      'offline_videos',
      where: 'cached_at < ?',
      whereArgs: [weekAgo],
    );

    await _db!.delete(
      'offline_requests',
      where: 'cached_at < ?',
      whereArgs: [weekAgo],
    );

    await _db!.delete(
      'offline_messages',
      where: 'cached_at < ?',
      whereArgs: [weekAgo],
    );
  }

  /// Получить статистику offline контента
  Future<Map<String, dynamic>> getContentStats() async {
    if (_db == null) return {};

    final videos = Sqflite.firstIntValue(
      await _db!.rawQuery('SELECT COUNT(*) FROM offline_videos'),
    ) ?? 0;
    
    final requests = Sqflite.firstIntValue(
      await _db!.rawQuery('SELECT COUNT(*) FROM offline_requests'),
    ) ?? 0;
    
    final messages = Sqflite.firstIntValue(
      await _db!.rawQuery('SELECT COUNT(*) FROM offline_messages'),
    ) ?? 0;

    return {
      'videos': videos,
      'requests': requests,
      'messages': messages,
      'total': videos + requests + messages,
    };
  }

  /// Закрытие
  Future<void> dispose() async {
    await _db?.close();
    _db = null;
  }
}

