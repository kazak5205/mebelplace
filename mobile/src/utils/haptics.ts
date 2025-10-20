import * as Haptics from 'expo-haptics';

export const hapticFeedback = {
  // Легкий тактильный отклик
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  
  // Средний тактильный отклик
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  
  // Сильный тактильный отклик
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  
  // Успешное действие
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  
  // Предупреждение
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  
  // Ошибка
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  
  // Выбор элемента
  selection: () => Haptics.selectionAsync(),
};
