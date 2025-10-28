import 'package:flutter/services.dart';

/// Утилита для Haptic Feedback (вибрация)
class HapticHelper {
  /// Легкая вибрация (при нажатии на кнопки)
  static Future<void> lightImpact() async {
    await HapticFeedback.lightImpact();
  }

  /// Средняя вибрация (при свайпе, pull-to-refresh)
  static Future<void> mediumImpact() async {
    await HapticFeedback.mediumImpact();
  }

  /// Тяжелая вибрация (при важных действиях, ошибках)
  static Future<void> heavyImpact() async {
    await HapticFeedback.heavyImpact();
  }

  /// Вибрация при выборе (скроллинг picker'ов)
  static Future<void> selectionClick() async {
    await HapticFeedback.selectionClick();
  }

  /// Вибрация успеха (галочка, лайк)
  static Future<void> success() async {
    await HapticFeedback.mediumImpact();
    await Future.delayed(const Duration(milliseconds: 100));
    await HapticFeedback.lightImpact();
  }

  /// Вибрация ошибки (при неудачной операции)
  static Future<void> error() async {
    await HapticFeedback.heavyImpact();
    await Future.delayed(const Duration(milliseconds: 50));
    await HapticFeedback.heavyImpact();
  }

  /// Вибрация при лайке (double tap)
  static Future<void> like() async {
    await HapticFeedback.mediumImpact();
  }

  /// Вибрация при свайпе (delete, refresh)
  static Future<void> swipe() async {
    await HapticFeedback.lightImpact();
  }
}

