import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/config/api_config.dart';

class VideoCallScreen extends ConsumerStatefulWidget {
  final String callId;
  final String recipientName;
  final String? recipientAvatar;

  const VideoCallScreen({
    super.key,
    required this.callId,
    required this.recipientName,
    this.recipientAvatar,
  });

  @override
  ConsumerState<VideoCallScreen> createState() => _VideoCallScreenState();
}

class _VideoCallScreenState extends ConsumerState<VideoCallScreen> {
  RtcEngine? _engine;
  final _storage = const FlutterSecureStorage();
  
  bool _isMuted = false;
  bool _isCameraOff = false;
  bool _isConnected = false;
  int? _remoteUid;

  @override
  void initState() {
    super.initState();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersive);
    _initAgoraEngine();
  }

  @override
  void dispose() {
    _engine?.leaveChannel();
    _engine?.release();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  Future<void> _initAgoraEngine() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/calls/video/init'),
        headers: {
          'Authorization': 'Bearer ${token ?? ''}',
          'Content-Type': 'application/json',
        },
        body: json.encode({'call_id': widget.callId}),
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
              setState(() => _isConnected = true);
            },
            onUserJoined: (connection, uid, elapsed) {
              setState(() => _remoteUid = uid);
            },
            onUserOffline: (connection, uid, reason) {
              setState(() => _remoteUid = null);
            },
          ),
        );

        await _engine!.enableVideo();
        await _engine!.startPreview();
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
      debugPrint('Error initializing Agora: $e');
      setState(() => _isConnected = true);
    }
  }

  Future<void> _endCall() async {
    try {
      await _engine?.leaveChannel();
      final token = await _storage.read(key: 'auth_token');
      
      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/calls/video/end'),
        headers: {
          'Authorization': 'Bearer ${token ?? ''}',
          'Content-Type': 'application/json',
        },
        body: json.encode({'call_id': widget.callId}),
      );
    } catch (e) {
      debugPrint('Error ending call: $e');
    }
    
    if (mounted) {
      Navigator.of(context).pop();
    }
  }

  Future<void> _toggleMute() async {
    setState(() => _isMuted = !_isMuted);
    await _engine?.muteLocalAudioStream(_isMuted);
  }

  Future<void> _toggleCamera() async {
    setState(() => _isCameraOff = !_isCameraOff);
    await _engine?.muteLocalVideoStream(_isCameraOff);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          if (_remoteUid != null)
            AgoraVideoView(
              controller: VideoViewController.remote(
                rtcEngine: _engine!,
                canvas: VideoCanvas(uid: _remoteUid),
                connection: RtcConnection(channelId: widget.callId),
              ),
            )
          else
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircleAvatar(
                    radius: 60,
                    backgroundImage: widget.recipientAvatar != null
                        ? NetworkImage(widget.recipientAvatar!)
                        : null,
                    child: widget.recipientAvatar == null
                        ? Text(
                            widget.recipientName[0].toUpperCase(),
                            style: const TextStyle(fontSize: 48, color: Colors.white),
                          )
                        : null,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    widget.recipientName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _isConnected ? 'Подключено' : 'Подключение...',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),

          if (_engine != null)
            Positioned(
              right: 16,
              top: 56,
              child: SizedBox(
                width: 120,
                height: 160,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: AgoraVideoView(
                    controller: VideoViewController(
                      rtcEngine: _engine!,
                      canvas: const VideoCanvas(uid: 0),
                    ),
                  ),
                ),
              ),
            ),

          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildControlButton(
                  icon: _isMuted ? Icons.mic_off : Icons.mic,
                  color: _isMuted ? Colors.red : Colors.white,
                  onTap: _toggleMute,
                ),
                _buildControlButton(
                  icon: Icons.call_end,
                  color: Colors.red,
                  onTap: _endCall,
                  size: 64,
                ),
                _buildControlButton(
                  icon: _isCameraOff ? Icons.videocam_off : Icons.videocam,
                  color: _isCameraOff ? Colors.red : Colors.white,
                  onTap: _toggleCamera,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
    double size = 48,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color.withValues(alpha: 0.9),
        ),
        child: Icon(
          icon,
          color: Colors.white,
          size: size * 0.5,
        ),
      ),
    );
  }
}
