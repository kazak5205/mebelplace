#!/usr/bin/env dart

import 'dart:io';

void main() async {
  print('🔧 Исправление основных ошибок API...');
  
  final mobileDir = Directory('/opt/mebelplace/apps/mobile/lib');
  
  // Исправляем основные ошибки VideoEntity
  await fixVideoEntityErrors(mobileDir);
  
  print('✅ Исправление основных ошибок завершено!');
}

Future<void> fixVideoEntityErrors(Directory dir) async {
  final dartFiles = await dir
      .list(recursive: true)
      .where((entity) => entity is File && entity.path.endsWith('.dart'))
      .cast<File>()
      .toList();

  for (final file in dartFiles) {
    final content = await file.readAsString();
    bool modified = false;
    String newContent = content;

    // Исправляем основные ошибки VideoEntity
    if (content.contains('video.productId') || 
        content.contains('video.productName') ||
        content.contains('video.authorId') ||
        content.contains('video.authorName')) {
      
      // Заменяем старые поля на новые
      newContent = newContent.replaceAll('video.productId', 'video.id');
      newContent = newContent.replaceAll('video.productName', 'video.title');
      newContent = newContent.replaceAll('video.authorId', 'video.author.id');
      newContent = newContent.replaceAll('video.authorName', 'video.author.username');
      
      modified = true;
    }

    // Исправляем типы параметров (String -> int)
    if (content.contains('String id)') && content.contains('video')) {
      newContent = newContent.replaceAll('String id)', 'int id)');
      modified = true;
    }

    if (modified) {
      await file.writeAsString(newContent);
      print('📝 Обновлен: ${file.path}');
    }
  }
}

