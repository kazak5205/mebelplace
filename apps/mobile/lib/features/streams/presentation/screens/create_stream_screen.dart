import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import '../providers/streams_provider.dart';
import '../../../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/widgets/glass/glass_button.dart';

class CreateStreamScreen extends ConsumerStatefulWidget {
  const CreateStreamScreen({super.key});

  @override
  ConsumerState<CreateStreamScreen> createState() => _CreateStreamScreenState();
}

class _CreateStreamScreenState extends ConsumerState<CreateStreamScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  RtcEngine? _engine;
  
  bool _isStreaming = false;
  bool _isMuted = false;
  int _viewersCount = 0;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _engine?.leaveChannel();
    _engine?.release();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  Future<void> _startStream() async {
    if (_titleController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Введите название стрима')),
      );
      return;
    }

    await ref.read(streamCreationProvider.notifier).createStream(
      _titleController.text,
      description: _descriptionController.text,
    );

    final creationState = ref.read(streamCreationProvider);
    
    if (creationState is StreamCreationReady) {
      try {
        _engine = createAgoraRtcEngine();
        await _engine!.initialize(RtcEngineContext(
          appId: creationState.agoraAppId ?? '',
        ));
        
        _engine!.registerEventHandler(
          RtcEngineEventHandler(
            onJoinChannelSuccess: (connection, elapsed) {
              setState(() => _isStreaming = true);
            },
            onUserJoined: (connection, uid, elapsed) {
              setState(() => _viewersCount++);
            },
            onUserOffline: (connection, uid, reason) {
              setState(() => _viewersCount--);
            },
          ),
        );

        await _engine!.enableVideo();
        await _engine!.startPreview();
        await _engine!.joinChannel(
          token: creationState.agoraToken ?? '',
          channelId: creationState.streamId,
          uid: 0,
          options: const ChannelMediaOptions(
            channelProfile: ChannelProfileType.channelProfileLiveBroadcasting,
            clientRoleType: ClientRoleType.clientRoleBroadcaster,
          ),
        );

        setState(() => _isStreaming = true);
      } catch (e) {
        debugPrint('Error starting stream: $e');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Ошибка: $e')),
          );
        }
      }
    }
  }

  Future<void> _stopStream() async {
    try {
      await _engine?.leaveChannel();
      
      final creationState = ref.read(streamCreationProvider);
      if (creationState is StreamCreationReady) {
        await ref.read(streamCreationProvider.notifier).endStream(creationState.streamId);
      }
      
      setState(() => _isStreaming = false);
      
      if (mounted) {
        Navigator.of(context).pop();
      }
    } catch (e) {
      debugPrint('Error stopping stream: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          if (!_isStreaming)
            _buildSetupView(isDark)
          else
            _buildStreamingView(),
        ],
      ),
    );
  }

  Widget _buildSetupView(bool isDark) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.live_tv, size: 80, color: LiquidGlassColors.primaryOrange),
            const SizedBox(height: 32),
            const Text(
              'Создать прямой эфир',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 32),
            TextField(
              controller: _titleController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Название стрима',
                hintText: 'О чём ваш стрим?',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                labelStyle: const TextStyle(color: Colors.white70),
                hintStyle: const TextStyle(color: Colors.white38),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _descriptionController,
              style: const TextStyle(color: Colors.white),
              maxLines: 3,
              decoration: InputDecoration(
                labelText: 'Описание',
                hintText: 'Расскажите подробнее...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                labelStyle: const TextStyle(color: Colors.white70),
                hintStyle: const TextStyle(color: Colors.white38),
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _startStream,
                style: ElevatedButton.styleFrom(
                  backgroundColor: LiquidGlassColors.primaryOrange,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Начать трансляцию'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStreamingView() {
    return Stack(
      children: [
        if (_engine != null)
          AgoraVideoView(
            controller: VideoViewController(
              rtcEngine: _engine!,
              canvas: const VideoCanvas(uid: 0),
            ),
          ),

        Positioned(
          top: 56,
          left: 16,
          right: 16,
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.fiber_manual_record, size: 12, color: Colors.white),
                    SizedBox(width: 4),
                    Text('LIVE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.remove_red_eye, size: 16, color: Colors.white),
                    const SizedBox(width: 4),
                    Text(
                      _viewersCount.toString(),
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
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
                onTap: () async {
                  setState(() => _isMuted = !_isMuted);
                  await _engine?.muteLocalAudioStream(_isMuted);
                },
              ),
              _buildControlButton(
                icon: Icons.stop,
                color: Colors.red,
                onTap: _stopStream,
                size: 64,
              ),
              _buildControlButton(
                icon: Icons.flip_camera_ios,
                color: Colors.white,
                onTap: () async {
                  await _engine?.switchCamera();
                },
              ),
            ],
          ),
        ),
      ],
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
