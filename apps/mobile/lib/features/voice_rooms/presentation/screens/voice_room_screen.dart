import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import '../../domain/entities/voice_room_entity.dart';
import '../../../../core/config/api_config.dart';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/widgets/glass/glass_panel.dart';

class VoiceRoomScreen extends ConsumerStatefulWidget {
  final VoiceRoomEntity room;

  const VoiceRoomScreen({
    super.key,
    required this.room,
  });

  @override
  ConsumerState<VoiceRoomScreen> createState() => _VoiceRoomScreenState();
}

class _VoiceRoomScreenState extends ConsumerState<VoiceRoomScreen> {
  RtcEngine? _engine;
  final _storage = const FlutterSecureStorage();
  
  bool _isMuted = false;
  bool _isHandRaised = false;
  List<VoiceRoomParticipant> _participants = [];

  @override
  void initState() {
    super.initState();
    _joinRoom();
  }

  @override
  void dispose() {
    _leaveRoom();
    super.dispose();
  }

  Future<void> _joinRoom() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/voice-rooms/${widget.room.id}/join'),
        headers: {
          'Authorization': 'Bearer ${token ?? ''}',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final agoraAppId = data['agora_app_id'] as String;
        final agoraToken = data['agora_token'] as String;
        final channelName = data['channel_name'] as String;

        _engine = createAgoraRtcEngine();
        await _engine!.initialize(RtcEngineContext(appId: agoraAppId));
        
        _engine!.registerEventHandler(
          RtcEngineEventHandler(
            onJoinChannelSuccess: (connection, elapsed) {
              _loadParticipants();
            },
            onUserJoined: (connection, uid, elapsed) {
              _loadParticipants();
            },
            onUserOffline: (connection, uid, reason) {
              _loadParticipants();
            },
            onAudioVolumeIndication: (connection, speakers, speakerNumber, totalVolume) {
              // Handle speaking indicators
            },
          ),
        );

        await _engine!.enableAudio();
        await _engine!.joinChannel(
          token: agoraToken,
          channelId: channelName,
          uid: 0,
          options: const ChannelMediaOptions(
            channelProfile: ChannelProfileType.channelProfileCommunication,
            clientRoleType: ClientRoleType.clientRoleBroadcaster,
          ),
        );
      }
    } catch (e) {
      debugPrint('Error joining room: $e');
    }
  }

  Future<void> _loadParticipants() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/voice-rooms/${widget.room.id}/participants'),
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final participants = (data['participants'] as List<dynamic>? ?? [])
            .map((p) => VoiceRoomParticipant(
                  id: p['id'].toString(),
                  name: p['name'] as String,
                  avatar: p['avatar'] as String?,
                  role: _roleFromString(p['role'] as String),
                  isMuted: p['is_muted'] as bool? ?? false,
                  isSpeaking: p['is_speaking'] as bool? ?? false,
                ))
            .toList();

        setState(() => _participants = participants);
      }
    } catch (e) {
      debugPrint('Error loading participants: $e');
    }
  }

  VoiceRoomRole _roleFromString(String role) {
    switch (role) {
      case 'host':
        return VoiceRoomRole.host;
      case 'speaker':
        return VoiceRoomRole.speaker;
      default:
        return VoiceRoomRole.listener;
    }
  }

  Future<void> _leaveRoom() async {
    try {
      await _engine?.leaveChannel();
      await _engine?.release();
      
      final token = await _storage.read(key: 'auth_token');
      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/voice-rooms/${widget.room.id}/leave'),
        headers: {
          'Authorization': 'Bearer ${token ?? ''}',
        },
      );
    } catch (e) {
      debugPrint('Error leaving room: $e');
    }
  }

  Future<void> _toggleMute() async {
    setState(() => _isMuted = !_isMuted);
    await _engine?.muteLocalAudioStream(_isMuted);
    
    try {
      final token = await _storage.read(key: 'auth_token');
      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/voice-rooms/${widget.room.id}/mute'),
        headers: {
          'Authorization': 'Bearer ${token ?? ''}',
          'Content-Type': 'application/json',
        },
        body: json.encode({'is_muted': _isMuted}),
      );
    } catch (e) {
      debugPrint('Error toggling mute: $e');
    }
  }

  Future<void> _raiseHand() async {
    setState(() => _isHandRaised = !_isHandRaised);
    
    try {
      final token = await _storage.read(key: 'auth_token');
      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/voice-rooms/${widget.room.id}/raise-hand'),
        headers: {
          'Authorization': 'Bearer ${token ?? ''}',
          'Content-Type': 'application/json',
        },
        body: json.encode({'is_raised': _isHandRaised}),
      );
    } catch (e) {
      debugPrint('Error raising hand: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          widget.room.title,
          style: TextStyle(color: isDark ? Colors.white : Colors.black),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.more_vert, color: isDark ? Colors.white : Colors.black),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
              ),
              itemCount: _participants.length,
              itemBuilder: (context, index) {
                final participant = _participants[index];
                return _buildParticipantCard(
                  name: participant.name,
                  avatar: participant.avatar,
                  role: participant.role,
                  isMuted: participant.isMuted,
                  isActive: participant.isSpeaking,
                );
              },
            ),
          ),

          GlassPanel(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildControlButton(
                  icon: _isMuted ? Icons.mic_off : Icons.mic,
                  color: _isMuted ? Colors.red : LiquidGlassColors.primaryOrange,
                  onTap: _toggleMute,
                ),
                _buildControlButton(
                  icon: Icons.pan_tool,
                  color: _isHandRaised ? LiquidGlassColors.primaryOrange : Colors.grey,
                  onTap: _raiseHand,
                ),
                _buildControlButton(
                  icon: Icons.exit_to_app,
                  color: Colors.red,
                  onTap: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildParticipantCard({
    required String name,
    String? avatar,
    required VoiceRoomRole role,
    required bool isMuted,
    required bool isActive,
  }) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isActive
              ? [
                  LiquidGlassColors.primaryOrange.withValues(alpha: 0.3),
                  LiquidGlassColors.primaryOrangeLight.withValues(alpha: 0.1),
                ]
              : [
                  Colors.grey.withValues(alpha: 0.2),
                  Colors.grey.withValues(alpha: 0.1),
                ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isActive ? LiquidGlassColors.primaryOrange : Colors.transparent,
          width: 2,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Stack(
            children: [
              CircleAvatar(
                radius: 30,
                backgroundImage: avatar != null ? NetworkImage(avatar) : null,
                child: avatar == null ? Text(name[0].toUpperCase()) : null,
              ),
              if (role == VoiceRoomRole.host)
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: const BoxDecoration(
                      color: LiquidGlassColors.primaryOrange,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.star, size: 12, color: Colors.white),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 12),
          ),
          if (isMuted)
            const Icon(Icons.mic_off, size: 16, color: Colors.red),
        ],
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color.withValues(alpha: 0.2),
          border: Border.all(color: color, width: 2),
        ),
        child: Icon(icon, color: color),
      ),
    );
  }
}
