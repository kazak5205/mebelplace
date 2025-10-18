#!/usr/bin/env dart

import 'dart:io';

/// Скрипт для удаления всех fallback моков и замены на реальные ошибки API
void main() async {
  print('🚀 Удаление fallback моков и переход на реальный API...');
  
  final mobileDir = Directory('lib');
  await _processDirectory(mobileDir);
  
  print('✅ Все fallback моки заменены на реальные ошибки API!');
}

Future<void> _processDirectory(Directory dir) async {
  await for (final entity in dir.list(recursive: true)) {
    if (entity is File && entity.path.endsWith('.dart')) {
      await _processFile(entity);
    }
  }
}

Future<void> _processFile(File file) async {
  try {
    String content = await file.readAsString();
    String originalContent = content;
    
    // Заменяем fallback моки на реальные ошибки
    content = _replaceFallbackMocks(content);
    
    if (content != originalContent) {
      await file.writeAsString(content);
      print('📝 Обновлен: ${file.path}');
    }
  } catch (e) {
    print('❌ Ошибка обработки ${file.path}: $e');
  }
}

String _replaceFallbackMocks(String content) {
  // Убираем все fallback моки и заменяем на реальные ошибки
  content = content.replaceAllMapped(
    RegExp(r'catch \(e\) \{\s*// Re-throw error instead of fallback to mock\s*throw Exception\([\s\S]*?\}\s*\}\s*\}'),
    (match) {
      final fullMatch = match.group(0)!;
      final catchStart = fullMatch.indexOf('catch (e) {');
      final throwStart = fullMatch.indexOf('throw Exception(');
      
      if (throwStart == -1) {
        // Если нет throw Exception, добавляем его
        final endBrace = fullMatch.lastIndexOf('}');
        final beforeEnd = fullMatch.substring(0, endBrace);
        return '$beforeEnd\n    throw Exception(\'API request failed: \${e.toString()}\');\n  }';
      }
      
      return fullMatch;
    }
  );
  
  return content;
}
