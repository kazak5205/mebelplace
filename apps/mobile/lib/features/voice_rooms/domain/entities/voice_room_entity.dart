import 'package:equatable/equatable.dart';

enum VoiceRoomRole {
  host,
  speaker,
  listener,
}

class VoiceRoomEntity extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String hostId;
  final String hostName;
  final String? hostAvatar;
  final int participantsCount;
  final int speakersCount;
  final int listenersCount;
  final DateTime createdAt;
  final bool isActive;
  final List<String> tags;
  final String? agoraAppId;  // Backend provides Agora credentials
  final String? agoraToken;

  const VoiceRoomEntity({
    required this.id,
    required this.title,
    this.description,
    required this.hostId,
    required this.hostName,
    this.hostAvatar,
    required this.participantsCount,
    required this.speakersCount,
    required this.listenersCount,
    required this.createdAt,
    required this.isActive,
    this.tags = const [],
    this.agoraAppId,
    this.agoraToken,
  });

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        hostId,
        hostName,
        hostAvatar,
        participantsCount,
        speakersCount,
        listenersCount,
        createdAt,
        isActive,
        tags,
        agoraAppId,
        agoraToken,
      ];
}

class VoiceRoomParticipant extends Equatable {
  final String id;
  final String name;
  final String? avatar;
  final VoiceRoomRole role;
  final bool isMuted;
  final bool isSpeaking;

  const VoiceRoomParticipant({
    required this.id,
    required this.name,
    this.avatar,
    required this.role,
    required this.isMuted,
    required this.isSpeaking,
  });

  @override
  List<Object?> get props => [id, name, avatar, role, isMuted, isSpeaking];
}

