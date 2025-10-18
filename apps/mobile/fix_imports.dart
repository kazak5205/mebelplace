#!/usr/bin/env dart

import 'dart:io';

void main() async {
  print('🔧 Исправление импортов после очистки...');
  
  final libDir = Directory('lib');
  await _fixImportsInDirectory(libDir);
  
  print('✅ Исправление импортов завершено!');
}

Future<void> _fixImportsInDirectory(Directory dir) async {
  await for (final entity in dir.list(recursive: true)) {
    if (entity is File && entity.path.endsWith('.dart')) {
      await _fixFileImports(entity);
    }
  }
}

Future<void> _fixFileImports(File file) async {
  String content = await file.readAsString();
  bool modified = false;
  
  // Исправляем импорты theme/app_theme.dart
  if (content.contains("import '../theme/app_theme.dart';")) {
    content = content.replaceAll(
      "import '../theme/app_theme.dart';",
      "import '../../core/theme/app_theme.dart';"
    );
    modified = true;
  }
  
  if (content.contains("import '../../theme/app_theme.dart';")) {
    content = content.replaceAll(
      "import '../../theme/app_theme.dart';",
      "import '../../../core/theme/app_theme.dart';"
    );
    modified = true;
  }
  
  if (content.contains("import '../../../theme/app_theme.dart';")) {
    content = content.replaceAll(
      "import '../../../theme/app_theme.dart';",
      "import '../../../../core/theme/app_theme.dart';"
    );
    modified = true;
  }
  
  // Исправляем импорты providers
  if (content.contains("import '../providers/")) {
    content = content.replaceAll(
      RegExp(r"import '\.\./providers/([^']+)';"),
      "// TODO: Update import for providers"
    );
    modified = true;
  }
  
  // Исправляем импорты models/user.dart
  if (content.contains("import '../models/user.dart';")) {
    content = content.replaceAll(
      "import '../models/user.dart';",
      "import '../../features/auth/domain/entities/user_entity.dart';"
    );
    modified = true;
  }
  
  // Исправляем импорты services/offline_sync_service.dart
  if (content.contains("import '../services/offline_sync_service.dart';")) {
    content = content.replaceAll(
      "import '../services/offline_sync_service.dart';",
      "import '../services/offline_sync_service_real.dart';"
    );
    modified = true;
  }
  
  if (modified) {
    await file.writeAsString(content);
    print('✅ Исправлен: ${file.path}');
  }
}
