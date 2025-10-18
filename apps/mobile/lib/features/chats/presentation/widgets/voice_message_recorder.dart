import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:async';
import 'dart:io';
import '../../../../../../../core/theme/liquid_glass_colors.dart';

class VoiceMessageRecorder extends StatefulWidget {
  final Function(String audioPath) onRecordComplete;

  const VoiceMessageRecorder({
    super.key,
    required this.onRecordComplete,
  });

  @override
  State<VoiceMessageRecorder> createState() => _VoiceMessageRecorderState();
}

class _VoiceMessageRecorderState extends State<VoiceMessageRecorder>
    with SingleTickerProviderStateMixin {
  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecording = false;
  Timer? _timer;
  int _recordDuration = 0;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _timer?.cancel();
    _audioRecorder.dispose();
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final directory = await getApplicationDocumentsDirectory();
        final path = '${directory.path}/voice_${DateTime.now().millisecondsSinceEpoch}.m4a';

        await _audioRecorder.start(
          const RecordConfig(
            encoder: AudioEncoder.aacLc,
            bitRate: 128000,
            sampleRate: 44100,
          ),
          path: path,
        );

        setState(() {
          _isRecording = true;
          _recordDuration = 0;
        });

        _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
          setState(() => _recordDuration++);
          if (_recordDuration >= 60) {
            _stopRecording();
          }
        });

        HapticFeedback.mediumImpact();
      }
    } catch (e) {
      debugPrint('Error starting recording: $e');
    }
  }

  Future<void> _stopRecording() async {
    try {
      final path = await _audioRecorder.stop();
      _timer?.cancel();
      setState(() => _isRecording = false);

      if (path != null) {
        widget.onRecordComplete(path);
      }
      
      HapticFeedback.mediumImpact();
    } catch (e) {
      debugPrint('Error stopping recording: $e');
    }
  }

  String get _formattedDuration {
    final minutes = _recordDuration ~/ 60;
    final seconds = _recordDuration % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPress: _startRecording,
      onLongPressEnd: (_) => _stopRecording(),
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: _isRecording
              ? const LinearGradient(
                  colors: [Colors.red, Colors.redAccent],
                )
              : LinearGradient(
                  colors: [
                    LiquidGlassColors.primaryOrange,
                    LiquidGlassColors.primaryOrangeLight,
                  ],
                ),
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            if (_isRecording)
              AnimatedBuilder(
                animation: _animationController,
                builder: (context, child) {
                  return Container(
                    width: 56 + (_animationController.value * 12),
                    height: 56 + (_animationController.value * 12),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.red.withValues(alpha: 0.5),
                        width: 2,
                      ),
                    ),
                  );
                },
              ),
            Icon(
              _isRecording ? Icons.stop : Icons.mic,
              color: Colors.white,
              size: 28,
            ),
            if (_isRecording)
              Positioned(
                bottom: -20,
                child: Text(
                  _formattedDuration,
                  style: const TextStyle(
                    color: Colors.red,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
