import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import '../../domain/entities/stream_entity.dart';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/config/api_config.dart';

class LiveStreamPlayerScreen extends ConsumerStatefulWidget {
  final StreamEntity stream;

  const LiveStreamPlayerScreen({
    super.key,
    required this.stream,
  });

  @override
  ConsumerState<LiveStreamPlayerScreen> createState() => _LiveStreamPlayerScreenState();
}

class _LiveStreamPlayerScreenState extends ConsumerState<LiveStreamPlayerScreen> {
  VideoPlayerController? _controller;
  final _storage = const FlutterSecureStorage();
  final _chatController = TextEditingController();
  final List<StreamChatMessage> _chatMessages = [];
  bool _showChat = true;

  @override
  void initState() {
    super.initState();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersive);
    _initializePlayer();
    _loadChatMessages();
  }

  @override
  void dispose() {
    _controller?.dispose();
    _chatController.dispose();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  Future<void> _initializePlayer() async {
    try {
      _controller = VideoPlayerController.networkUrl(
        Uri.parse(widget.stream.streamUrl),
      );

      await _controller!.initialize();
      
      if (mounted) {
        setState(() {});
        _controller!.play();
      }
    } catch (e) {
      debugPrint('Error initializing stream player: $e');
    }
  }

  Future<void> _loadChatMessages() async {
    // Real-time updates via WebSocket
    try {
      final token = await _storage.read(key: 'auth_token');
      
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/streams/${widget.stream.id}/chat'),
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final messages = (data['messages'] as List<dynamic>? ?? [])
            .map((m) => StreamChatMessage(
                  id: m['id'].toString(),
                  userId: m['user_id'].toString(),
                  userName: m['user_name'] as String,
                  userAvatar: m['user_avatar'] as String?,
                  message: m['message'] as String,
                  timestamp: DateTime.parse(m['timestamp'] as String),
                ))
            .toList();

        setState(() {
          _chatMessages.addAll(messages);
        });
      }
    } catch (e) {
      debugPrint('Error loading chat: $e');
    }
  }

  Future<void> _sendChatMessage() async {
    if (_chatController.text.trim().isEmpty) return;

    final message = _chatController.text.trim();
    _chatController.clear();

    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/streams/${widget.stream.id}/chat'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'message': message}),
      );

      // Message will be received via WebSocket
    } catch (e) {
      debugPrint('Error sending chat message: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Video player
          if (_controller != null && _controller!.value.isInitialized)
            Center(
              child: AspectRatio(
                aspectRatio: _controller!.value.aspectRatio,
                child: VideoPlayer(_controller!),
              ),
            )
          else
            const Center(
              child: CircularProgressIndicator(
                color: LiquidGlassColors.primaryOrange,
              ),
            ),

          // LIVE badge
          if (widget.stream.isLive)
            Positioned(
              top: MediaQuery.of(context).padding.top + 16,
              left: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: LiquidGlassColors.errorRed,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.circle, size: 8, color: Colors.white),
                    SizedBox(width: 6),
                    Text(
                      'LIVE',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Viewers count
          Positioned(
            top: MediaQuery.of(context).padding.top + 16,
            right: 16,
            child: GlassPanel(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              color: Colors.black.withValues(alpha: 0.5),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.visibility, size: 14, color: Colors.white),
                  const SizedBox(width: 4),
                  Text(
                    '${widget.stream.viewersCount}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Chat toggle
          Positioned(
            right: 16,
            bottom: 100,
            child: IconButton(
              icon: Icon(
                _showChat ? Icons.chat : Icons.chat_bubble_outline,
                color: Colors.white,
              ),
              onPressed: () {
                setState(() => _showChat = !_showChat);
              },
            ),
          ),

          // Chat overlay
          if (_showChat)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: _buildChat(),
            ),

          // Close button
          Positioned(
            top: MediaQuery.of(context).padding.top + 16,
            left: 16,
            child: IconButton(
              icon: const Icon(Icons.close, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChat() {
    return Container(
      height: 300,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.bottomCenter,
          end: Alignment.topCenter,
          colors: [
            Colors.black.withValues(alpha: 0.9),
            Colors.transparent,
          ],
        ),
      ),
      child: Column(
        children: [
          // Messages
          Expanded(
            child: ListView.builder(
              reverse: true,
              padding: const EdgeInsets.all(16),
              itemCount: _chatMessages.length,
              itemBuilder: (context, index) {
                final message = _chatMessages[_chatMessages.length - 1 - index];
                return _buildChatMessage(message);
              },
            ),
          ),

          // Input
          GlassPanel(
            margin: const EdgeInsets.all(8),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _chatController,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      hintText: 'Написать в чат...',
                      hintStyle: TextStyle(color: Colors.white54),
                      border: InputBorder.none,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: LiquidGlassColors.primaryOrange),
                  onPressed: _sendChatMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChatMessage(StreamChatMessage message) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 12,
            backgroundColor: LiquidGlassColors.primaryOrange,
            child: Text(
              message.userName.substring(0, 1).toUpperCase(),
              style: const TextStyle(fontSize: 10, color: Colors.white),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  message.userName,
                  style: const TextStyle(
                    color: LiquidGlassColors.primaryOrange,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
                Text(
                  message.message,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}


