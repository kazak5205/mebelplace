import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class GamificationPopup {
  // Показать попап с баллами за создание заявки
  static void showRequestPoints(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: Container(
            padding: const EdgeInsets.all(32.0),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(AppTheme.radiusXL),
              border: Border.all(color: Colors.blue, width: 2),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Иконка достижения
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.blue,
                    borderRadius: BorderRadius.circular(40),
                  ),
                  child: const Icon(
                    Icons.star,
                    color: Colors.white,
                    size: 40,
                  ),
                ),
                const SizedBox(height: 24.0),
                
                // Заголовок
                Text(
                  '+50 баллов!',
                  style: AppTheme.headlineLarge.copyWith(
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16.0),
                
                // Описание
                Text(
                  'За создание заявки',
                  style: AppTheme.bodyLarge.copyWith(
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8.0),
                
                Text(
                  'Продолжайте активно использовать приложение\nи получайте больше баллов!',
                  style: AppTheme.bodyMedium.copyWith(
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32.0),
                
                // Кнопка закрытия
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16.0),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                    ),
                    child: const Text(
                      'Отлично!',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // Показать попап с баллами за лайк
  static void showLikePoints(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: Container(
            padding: const EdgeInsets.all(24.0),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12.0),
              border: Border.all(color: Colors.blue, width: 1),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Иконка лайка
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: const Icon(
                    Icons.favorite,
                    color: Colors.blue,
                    size: 30,
                  ),
                ),
                const SizedBox(height: 16.0),
                
                // Баллы
                Text(
                  '+5 баллов',
                  style: AppTheme.headlineMedium.copyWith(
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8.0),
                
                Text(
                  'За лайк',
                  style: AppTheme.bodyMedium.copyWith(
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
    
    // Автоматически закрыть через 2 секунды
    Future.delayed(const Duration(seconds: 2), () {
      if (Navigator.canPop(context)) {
        Navigator.of(context).pop();
      }
    });
  }

  // Показать попап с баллами за комментарий
  static void showCommentPoints(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: Container(
            padding: const EdgeInsets.all(24.0),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12.0),
              border: Border.all(color: Colors.blue, width: 1),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Иконка комментария
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: const Icon(
                    Icons.comment,
                    color: Colors.blue,
                    size: 30,
                  ),
                ),
                const SizedBox(height: 16.0),
                
                // Баллы
                Text(
                  '+10 баллов',
                  style: AppTheme.headlineMedium.copyWith(
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8.0),
                
                Text(
                  'За комментарий',
                  style: AppTheme.bodyMedium.copyWith(
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
    
    // Автоматически закрыть через 2 секунды
    Future.delayed(const Duration(seconds: 2), () {
      if (Navigator.canPop(context)) {
        Navigator.of(context).pop();
      }
    });
  }

  // Показать попап с баллами за подписку
  static void showSubscribePoints(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: Container(
            padding: const EdgeInsets.all(24.0),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12.0),
              border: Border.all(color: Colors.blue, width: 1),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Иконка подписки
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: const Icon(
                    Icons.person_add,
                    color: Colors.blue,
                    size: 30,
                  ),
                ),
                const SizedBox(height: 16.0),
                
                // Баллы
                Text(
                  '+5 баллов',
                  style: AppTheme.headlineMedium.copyWith(
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8.0),
                
                Text(
                  'За подписку',
                  style: AppTheme.bodyMedium.copyWith(
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
    
    // Автоматически закрыть через 2 секунды
    Future.delayed(const Duration(seconds: 2), () {
      if (Navigator.canPop(context)) {
        Navigator.of(context).pop();
      }
    });
  }
  
  // Показать попап с баллами за просмотр >30 секунд
  static void showViewReward(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: Container(
            padding: const EdgeInsets.all(24.0),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12.0),
              border: Border.all(color: AppTheme.success, width: 2),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Иконка просмотра
                Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(
                    color: AppTheme.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(35),
                  ),
                  child: const Icon(
                    Icons.remove_red_eye,
                    color: AppTheme.success,
                    size: 35,
                  ),
                ),
                const SizedBox(height: 16.0),
                
                // Баллы
                Text(
                  '+30 баллов!',
                  style: AppTheme.headlineLarge.copyWith(
                    color: AppTheme.success,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8.0),
                
                Text(
                  'За просмотр >30 секунд',
                  style: AppTheme.bodyMedium.copyWith(
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
    
    // Автоматически закрыть через 2 секунды
    Future.delayed(const Duration(seconds: 2), () {
      if (Navigator.canPop(context)) {
        Navigator.of(context).pop();
      }
    });
  }
}