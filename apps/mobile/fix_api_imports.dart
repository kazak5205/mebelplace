#!/usr/bin/env dart

import 'dart:io';

void main() async {
  print('🔧 Исправление импортов для соответствия новому API...');
  
  final mobileDir = Directory('/opt/mebelplace/apps/mobile/lib');
  
  // Исправляем импорты VideoEntity
  await fixVideoEntityImports(mobileDir);
  
  // Исправляем импорты UserEntity
  await fixUserEntityImports(mobileDir);
  
  // Исправляем импорты CommentEntity
  await fixCommentEntityImports(mobileDir);
  
  print('✅ Исправление импортов завершено!');
}

Future<void> fixVideoEntityImports(Directory dir) async {
  final dartFiles = await dir
      .list(recursive: true)
      .where((entity) => entity is File && entity.path.endsWith('.dart'))
      .cast<File>()
      .toList();

  for (final file in dartFiles) {
    final content = await file.readAsString();
    bool modified = false;
    String newContent = content;

    // Исправляем импорты VideoEntity
    if (content.contains("import '../../domain/entities/video_entity.dart';") ||
        content.contains("import '../../../domain/entities/video_entity.dart';") ||
        content.contains("import '../../../../domain/entities/video_entity.dart';") ||
        content.contains("import '../../../../../domain/entities/video_entity.dart';")) {
      
      newContent = newContent.replaceAll(
        RegExp(r"import '\.\./.*/domain/entities/video_entity\.dart';"),
        "import '../../features/feed/domain/entities/video_entity.dart';"
      );
      modified = true;
    }

    if (modified) {
      await file.writeAsString(newContent);
      print('📝 Обновлен: ${file.path}');
    }
  }
}

Future<void> fixUserEntityImports(Directory dir) async {
  final dartFiles = await dir
      .list(recursive: true)
      .where((entity) => entity is File && entity.path.endsWith('.dart'))
      .cast<File>()
      .toList();

  for (final file in dartFiles) {
    final content = await file.readAsString();
    bool modified = false;
    String newContent = content;

    // Исправляем импорты UserEntity
    if (content.contains("import '../../domain/entities/user_entity.dart';") ||
        content.contains("import '../../../domain/entities/user_entity.dart';") ||
        content.contains("import '../../../../domain/entities/user_entity.dart';") ||
        content.contains("import '../../../../../domain/entities/user_entity.dart';")) {
      
      newContent = newContent.replaceAll(
        RegExp(r"import '\.\./.*/domain/entities/user_entity\.dart';"),
        "import '../../features/auth/domain/entities/user_entity.dart';"
      );
      modified = true;
    }

    if (modified) {
      await file.writeAsString(newContent);
      print('📝 Обновлен: ${file.path}');
    }
  }
}

Future<void> fixCommentEntityImports(Directory dir) async {
  final dartFiles = await dir
      .list(recursive: true)
      .where((entity) => entity is File && entity.path.endsWith('.dart'))
      .cast<File>()
      .toList();

  for (final file in dartFiles) {
    final content = await file.readAsString();
    bool modified = false;
    String newContent = content;

    // Исправляем импорты CommentEntity
    if (content.contains("import '../../domain/entities/comment_entity.dart';") ||
        content.contains("import '../../../domain/entities/comment_entity.dart';") ||
        content.contains("import '../../../../domain/entities/comment_entity.dart';") ||
        content.contains("import '../../../../../domain/entities/comment_entity.dart';")) {
      
      newContent = newContent.replaceAll(
        RegExp(r"import '\.\./.*/domain/entities/comment_entity\.dart';"),
        "import '../../features/feed/domain/entities/comment_entity.dart';"
      );
      modified = true;
    }

    if (modified) {
      await file.writeAsString(newContent);
      print('📝 Обновлен: ${file.path}');
    }
  }
}

