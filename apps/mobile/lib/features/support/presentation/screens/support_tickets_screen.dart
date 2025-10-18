import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/widgets/glass/glass_button.dart';
import '../../../../core/widgets/glass/glass_text_field.dart';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/theme/liquid_glass_text_styles.dart';
import '../../../../core/config/api_config.dart';

class SupportTicketsScreen extends ConsumerStatefulWidget {
  const SupportTicketsScreen({super.key});

  @override
  ConsumerState<SupportTicketsScreen> createState() => _SupportTicketsScreenState();
}

class _SupportTicketsScreenState extends ConsumerState<SupportTicketsScreen> {
  final _storage = const FlutterSecureStorage();
  List<SupportTicket> _tickets = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTickets();
  }

  Future<void> _loadTickets() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/support/tickets'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _tickets = (data['tickets'] as List<dynamic>)
              .map((t) => SupportTicket.fromJson(t))
              .toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _createTicket() async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (context) => const CreateTicketScreen(),
      ),
    );

    if (result == true) {
      _loadTickets();
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
        title: Text('Мои обращения', style: LiquidGlassTextStyles.h3Light(isDark)),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _createTicket,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _tickets.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.support_agent,
                        size: 80,
                        color: isDark ? Colors.white24 : Colors.black12,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'У вас нет обращений',
                        style: LiquidGlassTextStyles.body.copyWith(
                          color: isDark ? Colors.white54 : Colors.black54,
                        ),
                      ),
                      const SizedBox(height: 24),
                      GlassButton.primary(
                        'Создать обращение',
                        onTap: _createTicket,
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _tickets.length,
                  itemBuilder: (context, index) {
                    final ticket = _tickets[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: GlassPanel(
                        padding: const EdgeInsets.all(16),
                        child: ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(
                            ticket.subject,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              Text(ticket.category),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  _buildStatusBadge(ticket.status),
                                  const Spacer(),
                                  Text(
                                    _formatDate(ticket.createdAt),
                                    style: LiquidGlassTextStyles.caption,
                                  ),
                                ],
                              ),
                            ],
                          ),
                          onTap: () {
                            // Navigate to ticket chat
                            Navigator.pushNamed(
                              context,
                              '/support/ticket/${ticket.id}',
                            );
                          },
                        ),
                      ),
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _createTicket,
        icon: const Icon(Icons.add),
        label: const Text('Создать'),
        backgroundColor: LiquidGlassColors.primaryOrange,
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String label;

    switch (status) {
      case 'open':
        color = LiquidGlassColors.primaryOrange;
        label = 'Открыт';
        break;
      case 'in_progress':
        color = Colors.blue;
        label = 'В работе';
        break;
      case 'resolved':
        color = LiquidGlassColors.success;
        label = 'Решён';
        break;
      case 'closed':
        color = Colors.grey;
        label = 'Закрыт';
        break;
      default:
        color = Colors.grey;
        label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays > 0) {
      return '${diff.inDays} дн. назад';
    } else if (diff.inHours > 0) {
      return '${diff.inHours} ч. назад';
    } else {
      return '${diff.inMinutes} мин. назад';
    }
  }
}

class SupportTicket {
  final String id;
  final String subject;
  final String category;
  final String status;
  final DateTime createdAt;

  SupportTicket({
    required this.id,
    required this.subject,
    required this.category,
    required this.status,
    required this.createdAt,
  });

  factory SupportTicket.fromJson(Map<String, dynamic> json) {
    return SupportTicket(
      id: json['id'].toString(),
      subject: json['subject'] as String,
      category: json['category'] as String,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}

class CreateTicketScreen extends ConsumerStatefulWidget {
  const CreateTicketScreen({super.key});

  @override
  ConsumerState<CreateTicketScreen> createState() => _CreateTicketScreenState();
}

class _CreateTicketScreenState extends ConsumerState<CreateTicketScreen> {
  final _formKey = GlobalKey<FormState>();
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();
  final _storage = const FlutterSecureStorage();
  String _selectedCategory = 'general';
  bool _isLoading = false;

  final List<String> _categories = [
    'general',
    'technical',
    'billing',
    'account',
    'other',
  ];

  @override
  void dispose() {
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submitTicket() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) throw Exception('Not authenticated');

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/support/tickets'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'subject': _subjectController.text,
          'message': _messageController.text,
          'category': _selectedCategory,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (mounted) {
          Navigator.pop(context, true);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Обращение создано!'),
              backgroundColor: LiquidGlassColors.success,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
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
        title: Text('Создать обращение', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            GlassPanel(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Категория', style: LiquidGlassTextStyles.body),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: _selectedCategory,
                    items: _categories.map((cat) {
                      return DropdownMenuItem(value: cat, child: Text(cat));
                    }).toList(),
                    onChanged: (value) => setState(() => _selectedCategory = value!),
                    decoration: const InputDecoration(border: OutlineInputBorder()),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            GlassTextField(
              hint: 'Тема обращения',
              controller: _subjectController,
            ),
            const SizedBox(height: 16),
            GlassTextField(
              hint: 'Опишите проблему',
              controller: _messageController,
              maxLines: 8,
            ),
            const SizedBox(height: 24),
            GlassButton.primary(
              'Отправить',
              isLoading: _isLoading,
              onTap: _submitTicket,
            ),
          ],
        ),
      ),
    );
  }
}


