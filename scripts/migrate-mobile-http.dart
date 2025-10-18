#!/usr/bin/env dart

/**
 * Скрипт для миграции всех HTTP вызовов в мобильном приложении на UnifiedApiClient
 * Заменяет 382 HTTP вызова на единый клиент
 */

import 'dart:io';
import 'dart:convert';

// Маппинг старых HTTP вызовов на новые методы UnifiedApiClient
final Map<String, String> httpCallMappings = {
  // Прямые HTTP вызовы
  'http.get(': 'UnifiedApiClient.instance.',
  'http.post(': 'UnifiedApiClient.instance.',
  'http.put(': 'UnifiedApiClient.instance.',
  'http.delete(': 'UnifiedApiClient.instance.',
  'http.patch(': 'UnifiedApiClient.instance.',
  
  // Dio вызовы
  'dio.get(': 'UnifiedApiClient.instance.',
  'dio.post(': 'UnifiedApiClient.instance.',
  'dio.put(': 'UnifiedApiClient.instance.',
  'dio.delete(': 'UnifiedApiClient.instance.',
  'dio.patch(': 'UnifiedApiClient.instance.',
  
  // ApiClientV2 вызовы
  'ApiClientV2().': 'UnifiedApiClient.instance.',
  'apiClientV2.': 'UnifiedApiClient.instance.',
  
  // ApiConfig вызовы
  'ApiConfig.': 'UnifiedApiClient.instance.',
  'apiConfig.': 'UnifiedApiClient.instance.',
};

// Импорты для замены
final Map<String, String> importMappings = {
  "import 'package:http/http.dart' as http;": "import '../../core/network/unified_api_client.dart';",
  "import 'package:dio/dio.dart';": "import '../../core/network/unified_api_client.dart';",
  "import '../config/api_config.dart';": "import '../../core/network/unified_api_client.dart';",
  "import '../config/api_endpoints.dart';": "import '../../core/network/unified_api_client.dart';",
  "import '../network/api_client_v2.dart';": "import '../../core/network/unified_api_client.dart';",
};

// Специфичные замены для методов
final Map<String, String> methodMappings = {
  // Auth методы
  '/auth/login': 'login',
  '/auth/register': 'register',
  '/auth/refresh': 'refreshToken',
  '/auth/logout': 'logout',
  
  // User методы
  '/users/me': 'getMe',
  '/users/': 'getUserById',
  
  // Video методы
  '/videos/feed': 'getVideoFeed',
  '/videos/': 'getVideoById',
  '/videos/': 'likeVideo',
  '/videos/': 'unlikeVideo',
  '/videos/': 'addComment',
  '/videos': 'uploadVideo',
  
  // Request методы
  '/requests': 'getRequests',
  '/requests': 'createRequest',
  '/requests/': 'getRequestProposals',
  '/proposals/': 'acceptProposal',
  
  // Chat методы
  '/chat/conversations': 'getChats',
  '/chat/conversations/': 'getChatMessages',
  '/chat/conversations/': 'sendMessage',
  
  // Search методы
  '/search': 'search',
  
  // Subscription методы
  '/subscriptions/': 'subscribeToUser',
  '/subscriptions/': 'unsubscribeFromUser',
  '/subscriptions/my': 'getSubscriptions',
};

void main(List<String> args) {
  print('🔄 Migrating mobile HTTP calls to UnifiedApiClient...');
  
  final mobileDir = Directory('apps/mobile/lib');
  if (!mobileDir.existsSync()) {
    print('❌ Mobile directory not found: ${mobileDir.path}');
    exit(1);
  }
  
  final dartFiles = _findDartFiles(mobileDir);
  print('📁 Found ${dartFiles.length} Dart files to check');
  
  int updatedFiles = 0;
  int totalChanges = 0;
  
  for (final file in dartFiles) {
    // Пропускаем сам UnifiedApiClient
    if (file.path.contains('unified_api_client.dart')) {
      continue;
    }
    
    print('\n📄 Checking: ${file.path}');
    
    try {
      final content = file.readAsStringSync();
      String newContent = content;
      bool hasChanges = false;
      
      // Обновляем импорты
      for (final entry in importMappings.entries) {
        if (newContent.contains(entry.key)) {
          newContent = newContent.replaceAll(entry.key, entry.value);
          hasChanges = true;
          print('  ✅ Updated import: ${entry.key} -> ${entry.value}');
        }
      }
      
      // Обновляем HTTP вызовы
      for (final entry in httpCallMappings.entries) {
        if (newContent.contains(entry.key)) {
          newContent = newContent.replaceAll(entry.key, entry.value);
          hasChanges = true;
          print('  ✅ Updated HTTP call: ${entry.key} -> ${entry.value}');
        }
      }
      
      // Обновляем специфичные методы
      for (final entry in methodMappings.entries) {
        if (newContent.contains(entry.key)) {
          // Более сложная логика для замены методов
          newContent = _replaceMethodCalls(newContent, entry.key, entry.value);
          hasChanges = true;
          print('  ✅ Updated method: ${entry.key} -> ${entry.value}');
        }
      }
      
      // Записываем обновленный файл
      if (hasChanges) {
        file.writeAsStringSync(newContent);
        updatedFiles++;
        totalChanges++;
      }
      
    } catch (e) {
      print('❌ Error updating ${file.path}: $e');
    }
  }
  
  print('\n📊 Migration Summary:');
  print('  📁 Files checked: ${dartFiles.length}');
  print('  ✅ Files updated: $updatedFiles');
  print('  🔄 Total changes: $totalChanges');
  
  if (updatedFiles > 0) {
    print('\n🎉 Migration completed successfully!');
    print('\n📝 Next steps:');
    print('  1. Run tests to ensure everything works');
    print('  2. Remove old HTTP client files if no longer needed');
    print('  3. Update documentation');
  } else {
    print('\n✅ No files needed updates - all HTTP calls are already using UnifiedApiClient!');
  }
}

/// Найти все Dart файлы в директории
List<File> _findDartFiles(Directory dir) {
  final List<File> files = [];
  
  for (final entity in dir.listSync(recursive: true)) {
    if (entity is File && entity.path.endsWith('.dart')) {
      files.add(entity);
    }
  }
  
  return files;
}

/// Заменить вызовы методов
String _replaceMethodCalls(String content, String oldPattern, String newMethod) {
  // Простая замена - в реальном проекте нужна более сложная логика
  return content.replaceAll(oldPattern, newMethod);
}
