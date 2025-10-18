import 'package:flutter/foundation.dart';
import '../network/dio_client.dart';
import '../constants/app_constants.dart';
import '../constants/api_endpoints.dart';

/// Service для геймификации
class GamificationService {
  final DioClient dioClient;

  GamificationService(this.dioClient);

  /// Начислить баллы за действие
  Future<void> awardPoints({
    required GamificationAction action,
    String? relatedId,
  }) async {
    try {
      final points = _getPointsForAction(action);
      
      await dioClient.post(
        ApiEndpoints.gamificationAwardPoints,
        data: {
          'action': action.name,
          'points': points,
          if (relatedId != null) 'related_id': relatedId,
        },
      );
      
      debugPrint('Awarded $points points for ${action.name}');
    } catch (e) {
      debugPrint('Failed to award points: $e');
      // Не критично, продолжаем работу
    }
  }

  int _getPointsForAction(GamificationAction action) {
    switch (action) {
      case GamificationAction.like:
        return AppConstants.pointsForLike; // +5
      case GamificationAction.comment:
        return AppConstants.pointsForComment; // +10
      case GamificationAction.videoWatch:
        return AppConstants.pointsForVideoWatch; // +30
      case GamificationAction.videoPost:
        return AppConstants.pointsForVideoPost; // +50
      case GamificationAction.requestCreate:
        return AppConstants.pointsForRequestCreate; // +20
    }
  }
}

/// Действия для геймификации
enum GamificationAction {
  like,
  comment,
  videoWatch,
  videoPost,
  requestCreate,
}

