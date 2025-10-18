import 'package:hive/hive.dart';
import '../../../../core/constants/app_constants.dart';

/// Local data source для поиска (история)
abstract class SearchLocalDataSource {
  /// Получить историю поиска
  Future<List<String>> getSearchHistory();
  
  /// Добавить запрос в историю
  Future<void> addToHistory(String query);
  
  /// Очистить историю
  Future<void> clearHistory();
  
  /// Удалить один запрос из истории
  Future<void> removeFromHistory(String query);
}

class SearchLocalDataSourceImpl implements SearchLocalDataSource {
  static const String _historyKey = 'search_history';
  static const int _maxHistorySize = 10;

  Future<Box> get _box async {
    return await Hive.openBox(AppConstants.searchCacheBox);
  }

  @override
  Future<List<String>> getSearchHistory() async {
    try {
      final box = await _box;
      final history = box.get(_historyKey);
      
      if (history == null) {
        return [];
      }

      return List<String>.from(history as List);
    } catch (e) {
      return [];
    }
  }

  @override
  Future<void> addToHistory(String query) async {
    try {
      if (query.trim().isEmpty) return;
      
      final box = await _box;
      var history = await getSearchHistory();
      
      // Удаляем дубликаты
      history.remove(query);
      
      // Добавляем в начало
      history.insert(0, query);
      
      // Ограничиваем размер
      if (history.length > _maxHistorySize) {
        history = history.sublist(0, _maxHistorySize);
      }
      
      await box.put(_historyKey, history);
    } catch (e) {
      // Игнорируем ошибки сохранения истории
    }
  }

  @override
  Future<void> clearHistory() async {
    try {
      final box = await _box;
      await box.delete(_historyKey);
    } catch (e) {
      // Игнорируем ошибки очистки
    }
  }

  @override
  Future<void> removeFromHistory(String query) async {
    try {
      final box = await _box;
      final history = await getSearchHistory();
      
      history.remove(query);
      
      await box.put(_historyKey, history);
    } catch (e) {
      // Игнорируем ошибки удаления
    }
  }
}

