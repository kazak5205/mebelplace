import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../domain/entities/stream_entity.dart';
import '../../../../core/config/api_config.dart';

sealed class StreamsState {}

class StreamsInitial extends StreamsState {}

class StreamsLoading extends StreamsState {}

class StreamsLoaded extends StreamsState {
  final List<StreamEntity> liveStreams;
  final List<StreamEntity> pastStreams;

  StreamsLoaded({
    required this.liveStreams,
    required this.pastStreams,
  });

  StreamsLoaded copyWith({
    List<StreamEntity>? liveStreams,
    List<StreamEntity>? pastStreams,
  }) {
    return StreamsLoaded(
      liveStreams: liveStreams ?? this.liveStreams,
      pastStreams: pastStreams ?? this.pastStreams,
    );
  }
}

class StreamsError extends StreamsState {
  final String message;
  StreamsError(this.message);
}

/// Stream creation state
sealed class StreamCreationState {}

class StreamCreationIdle extends StreamCreationState {}

class StreamCreationLoading extends StreamCreationState {}

class StreamCreationReady extends StreamCreationState {
  final String streamKey;
  final String rtmpUrl;
  final String streamId;
  final String? agoraAppId;  // Backend provides Agora credentials
  final String? agoraToken;

  StreamCreationReady({
    required this.streamKey,
    required this.rtmpUrl,
    required this.streamId,
    this.agoraAppId,
    this.agoraToken,
  });
}

class StreamCreationError extends StreamCreationState {
  final String message;
  StreamCreationError(this.message);
}

class StreamsNotifier extends StateNotifier<StreamsState> {
  final _storage = const FlutterSecureStorage();

  StreamsNotifier() : super(StreamsInitial());

  Future<void> createStream({
    required String title,
    required String description,
  }) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/streams'),
        headers: {
          'Authorization': 'Bearer ${token ?? ''}',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'title': title,
          'description': description,
        }),
      );
      await loadStreams();
    } catch (e) {
      state = StreamsError('Failed to create stream: $e');
    }
  }

  Future<void> loadStreams() async{
    state = StreamsLoading();

    try {
      final token = await _storage.read(key: 'auth_token');

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/streams'),
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        final liveStreams = (data['live'] as List<dynamic>? ?? [])
            .map((s) => _streamFromJson(s))
            .toList();

        final pastStreams = (data['past'] as List<dynamic>? ?? [])
            .map((s) => _streamFromJson(s))
            .toList();

        state = StreamsLoaded(
          liveStreams: liveStreams,
          pastStreams: pastStreams,
        );
      } else {
        state = StreamsError('Failed to load streams: ${response.statusCode}');
      }
    } catch (e) {
      state = StreamsError('Error loading streams: $e');
    }
  }

  StreamEntity _streamFromJson(Map<String, dynamic> json) {
    return StreamEntity(
      id: json['id'].toString(),
      title: json['title'] as String,
      description: json['description'] as String?,
      authorId: json['author_id'].toString(),
      authorName: json['author_name'] as String,
      authorAvatar: json['author_avatar'] as String?,
      streamUrl: json['stream_url'] as String,
      thumbnailUrl: json['thumbnail_url'] as String?,
      isLive: json['is_live'] as bool? ?? false,
      viewersCount: json['viewers_count'] as int? ?? 0,
      startedAt: DateTime.parse(json['started_at'] as String),
      endedAt: json['ended_at'] != null ? DateTime.parse(json['ended_at'] as String) : null,
      tags: (json['tags'] as List<dynamic>? ?? []).map((t) => t.toString()).toList(),
    );
  }
}

class StreamCreationNotifier extends StateNotifier<StreamCreationState> {
  final _storage = const FlutterSecureStorage();

  StreamCreationNotifier() : super(StreamCreationIdle());

  Future<void> createStream(String title, {String? description}) async {
    state = StreamCreationLoading();

    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) {
        state = StreamCreationError('Not authenticated');
        return;
      }

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/streams/create'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'title': title,
          'description': description,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        
        state = StreamCreationReady(
          streamKey: data['stream_key'] as String,
          rtmpUrl: data['rtmp_url'] as String,
          streamId: data['stream_id'].toString(),
          agoraAppId: data['agora_app_id'] as String?,  // Backend provides these
          agoraToken: data['agora_token'] as String?,
        );
      } else {
        final errorData = json.decode(response.body);
        state = StreamCreationError(errorData['message'] ?? 'Failed to create stream');
      }
    } catch (e) {
      state = StreamCreationError('Error creating stream: $e');
    }
  }

  Future<void> endStream(String streamId) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/streams/$streamId/end'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      state = StreamCreationIdle();
    } catch (e) {
      state = StreamCreationError('Error ending stream: $e');
    }
  }

  void reset() {
    state = StreamCreationIdle();
  }
}

final streamsProvider = StateNotifierProvider<StreamsNotifier, StreamsState>((ref) {
  return StreamsNotifier();
});

final streamCreationProvider = StateNotifierProvider<StreamCreationNotifier, StreamCreationState>((ref) {
  return StreamCreationNotifier();
});

