import 'package:equatable/equatable.dart';

/// Domain Entity для заявки
class RequestEntity extends Equatable {
  final String id;
  final String title;
  final String description;
  final List<String> photos;
  final String region;
  final double? budget;
  final DateTime? deadline;
  final RequestStatus status;
  final String authorId;
  final String authorName;
  final String? authorAvatar;
  final List<RequestResponse> responses;
  final DateTime createdAt;
  final DateTime updatedAt;

  const RequestEntity({
    required this.id,
    required this.title,
    required this.description,
    required this.photos,
    required this.region,
    this.budget,
    this.deadline,
    required this.status,
    required this.authorId,
    required this.authorName,
    this.authorAvatar,
    required this.responses,
    required this.createdAt,
    required this.updatedAt,
  });

  // Helper getter for proposals count
  int get proposalsCount => responses.length;

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        photos,
        region,
        budget,
        deadline,
        status,
        authorId,
        authorName,
        authorAvatar,
        responses,
        createdAt,
        updatedAt,
      ];

  RequestEntity copyWith({
    String? id,
    String? title,
    String? description,
    List<String>? photos,
    String? region,
    double? budget,
    DateTime? deadline,
    RequestStatus? status,
    String? authorId,
    String? authorName,
    String? authorAvatar,
    List<RequestResponse>? responses,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return RequestEntity(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      photos: photos ?? this.photos,
      region: region ?? this.region,
      budget: budget ?? this.budget,
      deadline: deadline ?? this.deadline,
      status: status ?? this.status,
      authorId: authorId ?? this.authorId,
      authorName: authorName ?? this.authorName,
      authorAvatar: authorAvatar ?? this.authorAvatar,
      responses: responses ?? this.responses,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

/// Статус заявки
enum RequestStatus {
  pending,    // Новая
  inProgress, // В работе
  completed,  // Выполнена
  cancelled,  // Отменена
}

/// Ответ мастера на заявку
class RequestResponse extends Equatable {
  final String id;
  final String requestId;
  final String masterId;
  final String masterName;
  final String? masterAvatar;
  final double? price;
  final int? estimatedDays;
  final String message;
  final DateTime createdAt;

  const RequestResponse({
    required this.id,
    required this.requestId,
    required this.masterId,
    required this.masterName,
    this.masterAvatar,
    this.price,
    this.estimatedDays,
    required this.message,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        requestId,
        masterId,
        masterName,
        masterAvatar,
        price,
        estimatedDays,
        message,
        createdAt,
      ];
}

