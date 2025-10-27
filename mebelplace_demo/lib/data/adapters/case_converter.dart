/// Адаптер для преобразования snake_case ↔ camelCase
/// Копирует подход веб-фронтенда для совместимости с бэкендом

/// Преобразует snake_case в camelCase для всех ключей объекта
/// ВАЖНО: Сохраняет оригинальные ключи тоже (как веб-фронтенд)
dynamic snakeToCamel(dynamic item) {
  if (item is Map) {
    final result = <String, dynamic>{};
    item.forEach((key, value) {
      if (key is String) {
        // Преобразуем в camelCase
        final camelKey = key.replaceAllMapped(
          RegExp(r'_([a-z])'),
          (match) => match.group(1)!.toUpperCase(),
        );
        
        // Рекурсивно обрабатываем значение
        final transformedValue = snakeToCamel(value);
        
        // Сохраняем camelCase версию
        result[camelKey] = transformedValue;
        
        // ВАЖНО: Сохраняем оригинал тоже (для совместимости)
        if (key != camelKey) {
          result[key] = transformedValue;
        }
      } else {
        // Если ключ не String, просто копируем
        result[key] = snakeToCamel(value);
      }
    });
    return result;
  } else if (item is List) {
    return item.map((e) => snakeToCamel(e)).toList();
  }
  return item;
}

/// Преобразует camelCase в snake_case для отправки на сервер
dynamic camelToSnake(dynamic item) {
  if (item is Map) {
    final result = <String, dynamic>{};
    item.forEach((key, value) {
      if (key is String) {
        // Преобразуем в snake_case
        final snakeKey = key.replaceAllMapped(
          RegExp(r'[A-Z]'),
          (match) => '_${match.group(0)!.toLowerCase()}',
        );
        
        // Рекурсивно обрабатываем значение
        result[snakeKey] = camelToSnake(value);
      } else {
        result[key] = camelToSnake(value);
      }
    });
    return result;
  } else if (item is List) {
    return item.map((e) => camelToSnake(e)).toList();
  }
  return item;
}

