import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/config/api_config.dart';

class NotificationPreferences {
  final bool newVideos;
  final bool streams;
  final bool stories;
  final bool comments;
  final bool messages;
  final bool proposals;
  final bool achievements;
  final bool marketing;
  final Map<String, String> muteHours;
  final bool emailNotifications;
  final bool smsNotifications;

  NotificationPreferences({
    this.newVideos = true,
    this.streams = true,
    this.stories = true,
    this.comments = true,
    this.messages = true,
    this.proposals = true,
    this.achievements = true,
    this.marketing = false,
    this.muteHours = const {},
    this.emailNotifications = false,
    this.smsNotifications = false,
  });

  NotificationPreferences copyWith({
    bool? newVideos,
    bool? streams,
    bool? stories,
    bool? comments,
    bool? messages,
    bool? proposals,
    bool? achievements,
    bool? marketing,
    Map<String, String>? muteHours,
    bool? emailNotifications,
    bool? smsNotifications,
  }) {
    return NotificationPreferences(
      newVideos: newVideos ?? this.newVideos,
      streams: streams ?? this.streams,
      stories: stories ?? this.stories,
      comments: comments ?? this.comments,
      messages: messages ?? this.messages,
      proposals: proposals ?? this.proposals,
      achievements: achievements ?? this.achievements,
      marketing: marketing ?? this.marketing,
      muteHours: muteHours ?? this.muteHours,
      emailNotifications: emailNotifications ?? this.emailNotifications,
      smsNotifications: smsNotifications ?? this.smsNotifications,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'new_videos': newVideos,
      'streams': streams,
      'stories': stories,
      'comments': comments,
      'messages': messages,
      'proposals': proposals,
      'achievements': achievements,
      'marketing': marketing,
      'mute_hours': muteHours,
      'email_notifications': emailNotifications,
      'sms_notifications': smsNotifications,
    };
  }

  factory NotificationPreferences.fromJson(Map<String, dynamic> json) {
    return NotificationPreferences(
      newVideos: json['new_videos'] as bool? ?? true,
      streams: json['streams'] as bool? ?? true,
      stories: json['stories'] as bool? ?? true,
      comments: json['comments'] as bool? ?? true,
      messages: json['messages'] as bool? ?? true,
      proposals: json['proposals'] as bool? ?? true,
      achievements: json['achievements'] as bool? ?? true,
      marketing: json['marketing'] as bool? ?? false,
      muteHours: Map<String, String>.from(json['mute_hours'] ?? {}),
      emailNotifications: json['email_notifications'] as bool? ?? false,
      smsNotifications: json['sms_notifications'] as bool? ?? false,
    );
  }
}

class NotificationSettingsScreen extends ConsumerStatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  ConsumerState<NotificationSettingsScreen> createState() => _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState extends ConsumerState<NotificationSettingsScreen> {
  final _storage = const FlutterSecureStorage();
  NotificationPreferences _preferences = NotificationPreferences();
  bool _isLoading = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/notifications/settings'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _preferences = NotificationPreferences.fromJson(data);
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _savePreferences() async {
    setState(() => _isSaving = true);

    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      final response = await http.put(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/notifications/settings'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode(_preferences.toJson()),
      );

      if (response.statusCode == 200 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Настройки сохранены'),
            backgroundColor: LiquidGlassColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка: $e'),
            backgroundColor: LiquidGlassColors.errorRed,
          ),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  void _updatePreference(NotificationPreferences newPreferences) {
    setState(() => _preferences = newPreferences);
    _savePreferences();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(
            color: LiquidGlassColors.primaryOrange,
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text('Уведомления'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GlassPanel(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Push-уведомления',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 16),
                
                _buildSwitch(
                  'Новые видео от подписок',
                  _preferences.newVideos,
                  (value) => _updatePreference(_preferences.copyWith(newVideos: value)),
                  isDark,
                ),
                _buildSwitch(
                  'Начало стримов',
                  _preferences.streams,
                  (value) => _updatePreference(_preferences.copyWith(streams: value)),
                  isDark,
                ),
                _buildSwitch(
                  'Новые истории',
                  _preferences.stories,
                  (value) => _updatePreference(_preferences.copyWith(stories: value)),
                  isDark,
                ),
                _buildSwitch(
                  'Комментарии',
                  _preferences.comments,
                  (value) => _updatePreference(_preferences.copyWith(comments: value)),
                  isDark,
                ),
                _buildSwitch(
                  'Личные сообщения',
                  _preferences.messages,
                  (value) => _updatePreference(_preferences.copyWith(messages: value)),
                  isDark,
                ),
                _buildSwitch(
                  'Предложения на заявки',
                  _preferences.proposals,
                  (value) => _updatePreference(_preferences.copyWith(proposals: value)),
                  isDark,
                ),
                _buildSwitch(
                  'Достижения',
                  _preferences.achievements,
                  (value) => _updatePreference(_preferences.copyWith(achievements: value)),
                  isDark,
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          GlassPanel(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Дополнительные каналы',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 16),
                
                _buildSwitch(
                  'Email уведомления',
                  _preferences.emailNotifications,
                  (value) => _updatePreference(_preferences.copyWith(emailNotifications: value)),
                  isDark,
                ),
                _buildSwitch(
                  'SMS уведомления',
                  _preferences.smsNotifications,
                  (value) => _updatePreference(_preferences.copyWith(smsNotifications: value)),
                  isDark,
                ),
                _buildSwitch(
                  'Маркетинговые рассылки',
                  _preferences.marketing,
                  (value) => _updatePreference(_preferences.copyWith(marketing: value)),
                  isDark,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          if (_isSaving)
            const Center(
              child: CircularProgressIndicator(
                color: LiquidGlassColors.primaryOrange,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSwitch(
    String title,
    bool value,
    Function(bool) onChanged,
    bool isDark,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.white : Colors.black,
              ),
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: LiquidGlassColors.primaryOrange,
          ),
        ],
      ),
    );
  }
}


