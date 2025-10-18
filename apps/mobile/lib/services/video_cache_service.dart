import 'package:flutter/foundation.dart';

import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/video.dart';

/// Профессиональный сервис кэширования видео
/// - Кэширование превью
/// - Кэширование видео для offline просмотра
/// - Управление размером кэша
/// - LRU (Least Recently Used) стратегия
class VideoCacheService {
  static final VideoCacheService _instance = VideoCacheService._internal();
  factory VideoCacheService() => _instance;
  VideoCacheService._internal();

  Database? _database;
  Directory? _cacheDir;
  
  // Настройки кэша
  static const int maxCacheSize = 500 * 1024 * 1024; // 500 MB
  static const int maxVideos = 50; // Максимум видео в кэше
  static const Duration cacheExpiry = Duration(days: 7); // Срок хранения

  /// Инициализация кэша
  Future<void> init() async {
    // Получаем директорию для кэша
    final appDir = await getApplicationDocumentsDirectory();
    _cacheDir = Directory('${appDir.path}/video_cache');
    
    if (!await _cacheDir!.exists()) {
      await _cacheDir!.create(recursive: true);
    }

    // Инициализируем базу данных для метаданных кэша
    final dbPath = await getDatabasesPath();
    _database = await openDatabase(
      '$dbPath/video_cache.db',
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE cached_videos (
            video_id INTEGER PRIMARY KEY,
            file_path TEXT NOT NULL,
            thumbnail_path TEXT,
            size INTEGER NOT NULL,
            cached_at INTEGER NOT NULL,
            last_accessed INTEGER NOT NULL,
            view_count INTEGER DEFAULT 0
          )
        ''');
        
        await db.execute('''
          CREATE INDEX idx_last_accessed ON cached_videos(last_accessed)
        ''');
      },
    );
  }

  /// Кэшировать видео
  Future<String?> cacheVideo(Video video, String videoUrl) async {
    if (_database == null || _cacheDir == null) {
      await init();
    }

    try {
      // Проверяем, есть ли уже в кэше
      final existing = await _getCachedVideoPath(int.tryParse(video.id) ?? 0);
      if (existing != null) {
        // Обновляем время доступа
        await _updateLastAccessed(int.tryParse(video.id) ?? 0);
        return existing;
      }

      // Проверяем размер кэша
      await _ensureCacheSize();

      // Скачиваем видео
      final response = await http.get(Uri.parse(videoUrl));
      if (response.statusCode != 200) {
        throw Exception('Failed to download video');
      }

      // Сохраняем файл
      final fileName = 'video_${video.id}_${DateTime.now().millisecondsSinceEpoch}.mp4';
      final file = File('${_cacheDir!.path}/$fileName');
      await file.writeAsBytes(response.bodyBytes);

      // Сохраняем метаданные в БД
      await _database!.insert(
        'cached_videos',
        {
          'video_id': video.id,
          'file_path': file.path,
          'size': response.bodyBytes.length,
          'cached_at': DateTime.now().millisecondsSinceEpoch,
          'last_accessed': DateTime.now().millisecondsSinceEpoch,
          'view_count': 0,
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );

      return file.path;
    } catch (e) {
      debugPrint('Video cache error: $e');
      return null;
    }
  }

  /// Кэшировать превью видео
  Future<String?> cacheThumbnail(int videoId, String thumbnailUrl) async {
    if (_database == null || _cacheDir == null) {
      await init();
    }

    try {
      // Скачиваем превью
      final response = await http.get(Uri.parse(thumbnailUrl));
      if (response.statusCode != 200) {
        return null;
      }

      // Сохраняем файл
      final fileName = 'thumb_${videoId}_${DateTime.now().millisecondsSinceEpoch}.jpg';
      final file = File('${_cacheDir!.path}/$fileName');
      await file.writeAsBytes(response.bodyBytes);

      // Обновляем метаданные
      await _database!.update(
        'cached_videos',
        {'thumbnail_path': file.path},
        where: 'video_id = ?',
        whereArgs: [videoId],
      );

      return file.path;
    } catch (e) {
      debugPrint('Thumbnail cache error: $e');
      return null;
    }
  }

  /// Получить путь к кэшированному видео
  Future<String?> _getCachedVideoPath(int videoId) async {
    if (_database == null) return null;

    final result = await _database!.query(
      'cached_videos',
      where: 'video_id = ?',
      whereArgs: [videoId],
    );

    if (result.isNotEmpty) {
      final filePath = result.first['file_path'] as String;
      final file = File(filePath);
      
      // Проверяем, существует ли файл
      if (await file.exists()) {
        return filePath;
      } else {
        // Файл удалён - очищаем запись
        await _database!.delete(
          'cached_videos',
          where: 'video_id = ?',
          whereArgs: [videoId],
        );
      }
    }

    return null;
  }

  /// Получить кэшированное видео или null
  Future<String?> getCachedVideo(int videoId) async {
    final path = await _getCachedVideoPath(videoId);
    if (path != null) {
      await _updateLastAccessed(videoId);
    }
    return path;
  }

  /// Обновить время последнего доступа
  Future<void> _updateLastAccessed(int videoId) async {
    await _database?.update(
      'cached_videos',
      {
        'last_accessed': DateTime.now().millisecondsSinceEpoch,
        'view_count': _database!.rawQuery(
          'SELECT view_count FROM cached_videos WHERE video_id = ?',
          [videoId],
        ).then((r) => (r.first['view_count'] as int) + 1),
      },
      where: 'video_id = ?',
      whereArgs: [videoId],
    );
  }

  /// Убедиться что размер кэша в пределах лимита (LRU стратегия)
  Future<void> _ensureCacheSize() async {
    if (_database == null) return;

    // Получаем текущий размер кэша
    final result = await _database!.rawQuery(
      'SELECT SUM(size) as total_size, COUNT(*) as count FROM cached_videos',
    );

    final totalSize = result.first['total_size'] as int? ?? 0;
    final count = result.first['count'] as int? ?? 0;

    // Если превышен лимит размера или количества - удаляем старые
    if (totalSize > maxCacheSize || count >= maxVideos) {
      // Получаем самые старые видео (LRU)
      final oldVideos = await _database!.query(
        'cached_videos',
        orderBy: 'last_accessed ASC',
        limit: count >= maxVideos ? count - maxVideos + 1 : 10,
      );

      // Удаляем файлы и записи
      for (final video in oldVideos) {
        final videoId = video['video_id'] as int;
        await _deleteCachedVideo(videoId);
      }
    }
  }

  /// Удалить кэшированное видео
  Future<void> _deleteCachedVideo(int videoId) async {
    final result = await _database!.query(
      'cached_videos',
      where: 'video_id = ?',
      whereArgs: [videoId],
    );

    if (result.isNotEmpty) {
      final videoPath = result.first['file_path'] as String?;
      final thumbPath = result.first['thumbnail_path'] as String?;

      // Удаляем файлы
      if (videoPath != null) {
        final videoFile = File(videoPath);
        if (await videoFile.exists()) {
          await videoFile.delete();
        }
      }

      if (thumbPath != null) {
        final thumbFile = File(thumbPath);
        if (await thumbFile.exists()) {
          await thumbFile.delete();
        }
      }

      // Удаляем запись из БД
      await _database!.delete(
        'cached_videos',
        where: 'video_id = ?',
        whereArgs: [videoId],
      );
    }
  }

  /// Очистить весь кэш
  Future<void> clearAll() async {
    if (_database == null || _cacheDir == null) return;

    // Удаляем все файлы
    final files = await _cacheDir!.list().toList();
    for (final file in files) {
      if (file is File) {
        await file.delete();
      }
    }

    // Очищаем БД
    await _database!.delete('cached_videos');
  }

  /// Получить статистику кэша
  Future<Map<String, dynamic>> getCacheStats() async {
    if (_database == null) {
      return {'size': 0, 'count': 0};
    }

    final result = await _database!.rawQuery(
      'SELECT SUM(size) as total_size, COUNT(*) as count FROM cached_videos',
    );

    return {
      'size': result.first['total_size'] ?? 0,
      'count': result.first['count'] ?? 0,
      'max_size': maxCacheSize,
      'max_count': maxVideos,
    };
  }

  /// Очистить устаревший кэш
  Future<void> clearExpiredCache() async {
    if (_database == null) return;

    final expiryTime = DateTime.now()
        .subtract(cacheExpiry)
        .millisecondsSinceEpoch;

    final expiredVideos = await _database!.query(
      'cached_videos',
      where: 'cached_at < ?',
      whereArgs: [expiryTime],
    );

    for (final video in expiredVideos) {
      await _deleteCachedVideo(video['video_id'] as int);
    }
  }

  /// Закрытие сервиса
  Future<void> dispose() async {
    await _database?.close();
    _database = null;
  }
}

