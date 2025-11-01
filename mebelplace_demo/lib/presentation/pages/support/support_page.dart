import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/repository_providers.dart';
import '../../../data/datasources/api_service.dart';

class SupportPage extends ConsumerStatefulWidget {
  const SupportPage({super.key});

  @override
  ConsumerState<SupportPage> createState() => _SupportPageState();
}

class _SupportPageState extends ConsumerState<SupportPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _messageController = TextEditingController();
  
  String _selectedCategory = 'general';
  bool _isSending = false;
  bool _isLoading = true;
  
  // Информация о поддержке с API (как на вебе)
  SupportInfo? _supportInfo;
  List<SupportTicket> _tickets = [];
  
  final Map<String, String> _categories = {
    'general': 'Общие вопросы',
    'technical': 'Техническая поддержка',
    'billing': 'Биллинг',
    'feature_request': 'Запрос функции',
    'bug_report': 'Сообщение об ошибке',
  };

  @override
  void initState() {
    super.initState();
    // Загружаем информацию о поддержке и тикеты (как на вебе)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadSupportInfo();
      _loadTickets();
    });
  }

  Future<void> _loadSupportInfo() async {
    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.getSupportInfo();
      if (response.success && response.data != null) {
        setState(() {
          _supportInfo = response.data;
          _isLoading = false;
        });
      } else {
        // Если endpoint не существует, используем fallback
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      // Если endpoint не существует (404), используем fallback
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _loadTickets() async {
    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.getSupportTickets();
      if (response.success && response.data != null) {
        setState(() {
          _tickets = response.data!;
        });
      }
    } catch (e) {
      // Ignore errors
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.dark,
      appBar: AppBar(
        backgroundColor: AppColors.dark,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Поддержка',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: _isSending 
        ? _buildSendingState()
        : _buildSupportForm(),
    );
  }

  Widget _buildSupportForm() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16.w),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Приветствие
            _buildWelcomeSection(),
            
            SizedBox(height: 32.h),
            
            // Контактная форма
            _buildContactForm(),
            
            SizedBox(height: 24.h),
            
            // Быстрые действия
            _buildQuickActions(),
            
            SizedBox(height: 24.h),
            
            // Контактная информация
            _buildContactInfo(),
            
            SizedBox(height: 24.h),
            
            // Список тикетов (как на вебе)
            if (_tickets.isNotEmpty) ...[
              _buildTicketsSection(),
              SizedBox(height: 24.h),
            ],
            
            SizedBox(height: 40.h),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeSection() {
    return Container(
      padding: EdgeInsets.all(24.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withValues(alpha: 0.1),
            AppColors.secondary.withValues(alpha: 0.1),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Icon(
            Icons.support_agent,
            size: 48.sp,
            color: AppColors.primary,
          ),
          SizedBox(height: 16.h),
          Text(
            'Мы здесь, чтобы помочь!',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20.sp,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Если у вас есть вопросы или проблемы, мы готовы помочь вам их решить.',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.8),
              fontSize: 14.sp,
              height: 1.4,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildContactForm() {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Связаться с поддержкой',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          
          SizedBox(height: 20.h),
          
          // Имя
          _buildTextField(
            controller: _nameController,
            label: 'Ваше имя',
            hint: 'Введите ваше имя',
            icon: Icons.person,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Введите ваше имя';
              }
              return null;
            },
          ),
          
          SizedBox(height: 16.h),
          
          // Email
          _buildTextField(
            controller: _emailController,
            label: 'Email',
            hint: 'Введите ваш email',
            icon: Icons.email,
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Введите email';
              }
              if (!value.contains('@')) {
                return 'Введите корректный email';
              }
              return null;
            },
          ),
          
          SizedBox(height: 16.h),
          
          // Категория
          _buildCategorySelector(),
          
          SizedBox(height: 16.h),
          
          // Сообщение
          _buildTextField(
            controller: _messageController,
            label: 'Сообщение',
            hint: 'Опишите вашу проблему или вопрос...',
            icon: Icons.message,
            maxLines: 4,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Введите сообщение';
              }
              if (value.length < 10) {
                return 'Сообщение должно содержать минимум 10 символов';
              }
              return null;
            },
          ),
          
          SizedBox(height: 24.h),
          
          // Кнопка отправки
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _sendMessage,
              icon: Icon(Icons.send, size: 18.sp),
              label: const Text('Отправить сообщение'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: 16.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms, delay: 200.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.white,
            fontSize: 14.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 8.h),
        TextFormField(
          controller: controller,
          style: TextStyle(color: Colors.white, fontSize: 14.sp),
          keyboardType: keyboardType,
          maxLines: maxLines,
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              color: Colors.white.withValues(alpha: 0.5),
              fontSize: 14.sp,
            ),
            prefixIcon: Icon(icon, color: AppColors.primary, size: 20.sp),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.r),
              borderSide: const BorderSide(color: Colors.white),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.r),
              borderSide: const BorderSide(color: Colors.white),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.r),
              borderSide: const BorderSide(color: AppColors.primary),
            ),
            contentPadding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 12.h),
          ),
        ),
      ],
    );
  }

  Widget _buildCategorySelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Категория',
          style: TextStyle(
            color: Colors.white,
            fontSize: 14.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 8.h),
        // ignore: deprecated_member_use
        DropdownButtonFormField<String>(
          value: _selectedCategory,
          style: TextStyle(color: Colors.white, fontSize: 14.sp),
          decoration: InputDecoration(
            prefixIcon: Icon(Icons.category, color: AppColors.primary, size: 20.sp),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.r),
              borderSide: const BorderSide(color: Colors.white),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.r),
              borderSide: const BorderSide(color: Colors.white),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.r),
              borderSide: const BorderSide(color: AppColors.primary),
            ),
            contentPadding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 12.h),
          ),
          dropdownColor: AppColors.dark,
          items: _categories.entries.map((entry) {
            return DropdownMenuItem<String>(
              value: entry.key,
              child: Text(entry.value),
            );
          }).toList(),
          onChanged: (value) {
            setState(() {
              _selectedCategory = value!;
            });
          },
        ),
      ],
    );
  }

  Widget _buildQuickActions() {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Быстрые действия',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          
          SizedBox(height: 16.h),
          
          // Используем данные из API вместо хардкода (как на вебе)
          if (_supportInfo != null) ...[
            _buildQuickActionItem(
              icon: Icons.phone,
              title: 'Позвонить',
              subtitle: _supportInfo!.supportPhone['formatted'] ?? _supportInfo!.supportPhone['phone'] ?? '+7 (775) 990-56-23',
              onTap: () => _makePhoneCall(_supportInfo!.supportPhone['phone'] ?? '+77759905623'),
            ),
            
            SizedBox(height: 12.h),
            
            _buildQuickActionItem(
              icon: Icons.email,
              title: 'Написать на email',
              subtitle: _supportInfo!.supportEmail['email'] ?? 'support@mebelplace.com.kz',
              onTap: () => _sendEmail(_supportInfo!.supportEmail['email'] ?? 'support@mebelplace.com.kz'),
            ),
            
            SizedBox(height: 12.h),
            
            _buildQuickActionItem(
              icon: Icons.chat,
              title: 'Онлайн чат',
              subtitle: _supportInfo!.supportHours['schedule'] ?? 'Доступен с 9:00 до 18:00',
              onTap: () => _openChat(),
            ),
          ] else ...[
            // Fallback если API не вернул данные
            _buildQuickActionItem(
              icon: Icons.phone,
              title: 'Позвонить',
              subtitle: '+7 (775) 990-56-23',
              onTap: () => _makePhoneCall('+77759905623'),
            ),
            
            SizedBox(height: 12.h),
            
            _buildQuickActionItem(
              icon: Icons.email,
              title: 'Написать на email',
              subtitle: 'support@mebelplace.com.kz',
              onTap: () => _sendEmail('support@mebelplace.com.kz'),
            ),
            
            SizedBox(height: 12.h),
            
            _buildQuickActionItem(
              icon: Icons.chat,
              title: 'Онлайн чат',
              subtitle: 'Доступен с 9:00 до 18:00',
              onTap: () => _openChat(),
            ),
          ],
        ],
      ),
    ).animate().fadeIn(duration: 500.ms, delay: 400.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildQuickActionItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(16.w),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.03),
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.1),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 40.w,
              height: 40.w,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(8.r),
              ),
              child: Icon(
                icon,
                color: AppColors.primary,
                size: 20.sp,
              ),
            ),
            
            SizedBox(width: 12.w),
            
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 2.h),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 12.sp,
                    ),
                  ),
                ],
              ),
            ),
            
            Icon(
              Icons.arrow_forward_ios,
              color: Colors.white.withValues(alpha: 0.5),
              size: 16.sp,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactInfo() {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Контактная информация',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          
          SizedBox(height: 16.h),
          
          _buildContactInfoItem(
            icon: Icons.access_time,
            title: 'Время работы',
            value: 'Пн-Пт: 9:00 - 18:00\nСб-Вс: 10:00 - 16:00',
          ),
          
          SizedBox(height: 12.h),
          
          _buildContactInfoItem(
            icon: Icons.location_on,
            title: 'Адрес',
            value: 'г. Алматы, ул. Абая 150',
          ),
          
          SizedBox(height: 12.h),
          
          _buildContactInfoItem(
            icon: Icons.language,
            title: 'Языки поддержки',
            value: 'Русский, Казахский, Английский',
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms, delay: 600.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildContactInfoItem({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          color: AppColors.primary,
          size: 20.sp,
        ),
        SizedBox(width: 12.w),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 2.h),
              Text(
                value,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.7),
                  fontSize: 12.sp,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSendingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
            strokeWidth: 3,
          ),
          SizedBox(height: 24.h),
          Text(
            'Отправляем сообщение...',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Мы ответим вам в ближайшее время',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.7),
              fontSize: 14.sp,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    
    try {
      if (await canLaunchUrl(launchUri)) {
        await launchUrl(launchUri);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Не удалось открыть телефон'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _sendEmail(String email) async {
    final Uri launchUri = Uri(
      scheme: 'mailto',
      path: email,
      query: 'subject=Вопрос в службу поддержки MebelPlace',
    );
    
    try {
      if (await canLaunchUrl(launchUri)) {
        await launchUrl(launchUri);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Не удалось открыть email клиент'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _openChat() {
    // Открываем страницу чата с поддержкой
    Navigator.pushNamed(context, '/messages');
  }

  Widget _buildTicketsSection() {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.support_agent, color: AppColors.primary, size: 24.sp),
              SizedBox(width: 8.w),
              Text(
                'Мои тикеты',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          
          SizedBox(height: 16.h),
          
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _tickets.length,
            itemBuilder: (context, index) {
              final ticket = _tickets[index];
              return Container(
                margin: EdgeInsets.only(bottom: 12.h),
                padding: EdgeInsets.all(16.w),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.03),
                  borderRadius: BorderRadius.circular(12.r),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            ticket.subject,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        _buildStatusChip(ticket.status),
                      ],
                    ),
                    SizedBox(height: 8.h),
                    Row(
                      children: [
                        _buildPriorityChip(ticket.priority),
                        SizedBox(width: 8.w),
                        Text(
                          _categories[ticket.category] ?? ticket.category,
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.6),
                            fontSize: 12.sp,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          _formatDate(ticket.createdAt),
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.5),
                            fontSize: 12.sp,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms, delay: 800.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildStatusChip(String status) {
    Color statusColor;
    String statusText;
    IconData statusIcon;
    
    switch (status.toLowerCase()) {
      case 'open':
        statusColor = Colors.yellow;
        statusText = 'Открыт';
        statusIcon = Icons.circle_outlined;
        break;
      case 'in_progress':
        statusColor = Colors.blue;
        statusText = 'В работе';
        statusIcon = Icons.access_time;
        break;
      case 'resolved':
        statusColor = Colors.green;
        statusText = 'Решен';
        statusIcon = Icons.check_circle;
        break;
      case 'closed':
        statusColor = Colors.grey;
        statusText = 'Закрыт';
        statusIcon = Icons.close;
        break;
      default:
        statusColor = Colors.white;
        statusText = status;
        statusIcon = Icons.circle;
    }
    
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
      decoration: BoxDecoration(
        color: statusColor.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(8.r),
        border: Border.all(color: statusColor.withValues(alpha: 0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(statusIcon, size: 12.sp, color: statusColor),
          SizedBox(width: 4.w),
          Text(
            statusText,
            style: TextStyle(
              color: statusColor,
              fontSize: 11.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriorityChip(String priority) {
    Color priorityColor;
    
    switch (priority.toLowerCase()) {
      case 'low':
        priorityColor = Colors.green;
        break;
      case 'medium':
        priorityColor = Colors.yellow;
        break;
      case 'high':
        priorityColor = Colors.orange;
        break;
      case 'urgent':
        priorityColor = Colors.red;
        break;
      default:
        priorityColor = Colors.grey;
    }
    
    return Container(
      width: 8.w,
      height: 8.w,
      decoration: BoxDecoration(
        color: priorityColor,
        shape: BoxShape.circle,
      ),
    );
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      final now = DateTime.now();
      final difference = now.difference(date);
      
      if (difference.inDays == 0) {
        if (difference.inHours == 0) {
          return '${difference.inMinutes}м назад';
        }
        return '${difference.inHours}ч назад';
      } else if (difference.inDays < 7) {
        return '${difference.inDays}д назад';
      } else {
        return '${date.day}.${date.month}.${date.year}';
      }
    } catch (e) {
      return dateString;
    }
  }

  Future<void> _sendMessage() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    
    setState(() {
      _isSending = true;
    });
    
    try {
      // Отправка через реальный API
      final apiService = ref.read(apiServiceProvider);
      
      // Отправляем как на вебе: subject, message, priority, category
      final subjectText = _messageController.text.length > 50 
          ? _messageController.text.substring(0, 50) + '...'
          : _messageController.text;
      final response = await apiService.sendSupportMessage(
        subject: subjectText,
        message: 'Имя: ${_nameController.text}\n'
            'Email: ${_emailController.text}\n\n'
            '${_messageController.text}',
        category: _selectedCategory,
        priority: 'medium', // По умолчанию средний приоритет (как на вебе)
      );
      
      if (mounted) {
        if (response.success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message ?? 'Сообщение отправлено! Мы ответим вам в ближайшее время.'),
              backgroundColor: Colors.green,
            ),
          );
          
          // Очищаем форму
          _nameController.clear();
          _emailController.clear();
          _messageController.clear();
          setState(() {
            _selectedCategory = 'general';
          });
          
          // Перезагружаем тикеты после отправки (как на вебе)
          _loadTickets();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message ?? 'Ошибка отправки сообщения'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
      
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка отправки: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() {
        _isSending = false;
      });
    }
  }
}
