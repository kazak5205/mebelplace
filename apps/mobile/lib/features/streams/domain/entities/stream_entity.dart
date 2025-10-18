import 'package:equatable/equatable.dart';

class StreamEntity extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String authorId;
  final String authorName;
  final String? authorAvatar;
  final String streamUrl; // HLS/RTMP URL
  final String? thumbnailUrl;
  final bool isLive;
  final int viewersCount;
  final DateTime startedAt;
  final DateTime? endedAt;
  final List<String> tags;

  const StreamEntity({
    required this.id,
    required this.title,
    this.description,
    required this.authorId,
    required this.authorName,
    this.authorAvatar,
    required this.streamUrl,
    this.thumbnailUrl,
    required this.isLive,
    required this.viewersCount,
    required this.startedAt,
    this.endedAt,
    this.tags = const [],
  });

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        authorId,
        authorName,
        authorAvatar,
        streamUrl,
        thumbnailUrl,
        isLive,
        viewersCount,
        startedAt,
        endedAt,
        tags,
      ];

  Duration get duration {
    final end = endedAt ?? DateTime.now();
    return end.difference(startedAt);
  }

  StreamEntity copyWith({
    String? id,
    String? title,
    String? description,
    String? authorId,
    String? authorName,
    String? authorAvatar,
    String? streamUrl,
    String? thumbnailUrl,
    bool? isLive,
    int? viewersCount,
    DateTime? startedAt,
    DateTime? endedAt,
    List<String>? tags,
  }) {
    return StreamEntity(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      authorId: authorId ?? this.authorId,
      authorName: authorName ?? this.authorName,
      authorAvatar: authorAvatar ?? this.authorAvatar,
      streamUrl: streamUrl ?? this.streamUrl,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      isLive: isLive ?? this.isLive,
      viewersCount: viewersCount ?? this.viewersCount,
      startedAt: startedAt ?? this.startedAt,
      endedAt: endedAt ?? this.endedAt,
      tags: tags ?? this.tags,
    );
  }
}

class StreamChatMessage {
  final String id;
  final String userId;
  final String userName;
  final String? userAvatar;
  final String message;
  final DateTime timestamp;

  const StreamChatMessage({
    required this.id,
    required this.userId,
    required this.userName,
    this.userAvatar,
    required this.message,
    required this.timestamp,
  });
}


