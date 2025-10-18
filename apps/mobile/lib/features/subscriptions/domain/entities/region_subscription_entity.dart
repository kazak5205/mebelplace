import 'package:equatable/equatable.dart';

class RegionSubscriptionEntity extends Equatable {
  final String id;
  final String userId;
  final String region;
  final bool enabled;
  final DateTime createdAt;

  const RegionSubscriptionEntity({
    required this.id,
    required this.userId,
    required this.region,
    required this.enabled,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, userId, region, enabled, createdAt];
}


