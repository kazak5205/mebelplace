import 'package:flutter/material.dart';

/// Цветовая схема MebelPlace: белый, оранжевый, черный
class MebelPlaceColors {
  // Основные цвета
  static const Color primary = Color(0xFFFF6B35); // Оранжевый
  static const Color secondary = Color(0xFFFFFFFF); // Белый
  static const Color background = Color(0xFF000000); // Черный
  static const Color surface = Color(0xFF1A1A1A); // Темно-серый
  static const Color card = Color(0xFF2A2A2A); // Серый для карточек
  
  // Акцентные цвета
  static const Color accent = Color(0xFFFF8C42); // Светло-оранжевый
  static const Color warning = Color(0xFFFFB366); // Желто-оранжевый
  static const Color error = Color(0xFFFF4444); // Красный
  static const Color success = Color(0xFF4CAF50); // Зеленый
  
  // Текст
  static const Color textPrimary = Color(0xFFFFFFFF); // Белый текст
  static const Color textSecondary = Color(0xFFB0B0B0); // Серый текст
  static const Color textDisabled = Color(0xFF666666); // Темно-серый текст
  static const Color textOnPrimary = Color(0xFF000000); // Черный текст на оранжевом
  
  // Границы и разделители
  static const Color border = Color(0xFF333333);
  static const Color divider = Color(0xFF444444);
  
  // Градиенты
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, accent],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient backgroundGradient = LinearGradient(
    colors: [background, surface],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
  
  // Прозрачности
  static const Color overlay = Color(0x80000000); // Полупрозрачный черный
  static const Color glass = Color(0x1AFFFFFF); // Стеклянный эффект
}
