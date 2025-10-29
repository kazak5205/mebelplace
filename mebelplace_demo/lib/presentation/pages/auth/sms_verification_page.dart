import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/repository_providers.dart';

class SmsVerificationPage extends ConsumerStatefulWidget {
  final String phoneNumber;
  
  const SmsVerificationPage({
    super.key,
    required this.phoneNumber,
  });

  @override
  ConsumerState<SmsVerificationPage> createState() => _SmsVerificationPageState();
}

class _SmsVerificationPageState extends ConsumerState<SmsVerificationPage> {
  final List<TextEditingController> _controllers = List.generate(6, (index) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (index) => FocusNode());
  
  bool _isVerifying = false;
  int _resendCountdown = 60;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var focusNode in _focusNodes) {
      focusNode.dispose();
    }
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
          'Подтверждение номера',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: _isVerifying 
        ? _buildVerifyingState()
        : _buildVerificationForm(),
    );
  }

  Widget _buildVerificationForm() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(24.w),
      child: Column(
        children: [
          SizedBox(height: 40.h),
          
          // Иконка
          _buildIcon(),
          
          SizedBox(height: 32.h),
          
          // Заголовок
          _buildTitle(),
          
          SizedBox(height: 16.h),
          
          // Описание
          _buildDescription(),
          
          SizedBox(height: 48.h),
          
          // Поля ввода кода
          _buildCodeInput(),
          
          SizedBox(height: 32.h),
          
          // Кнопка подтверждения
          _buildVerifyButton(),
          
          SizedBox(height: 24.h),
          
          // Повторная отправка
          _buildResendSection(),
          
          SizedBox(height: 40.h),
        ],
      ),
    );
  }

  Widget _buildIcon() {
    return Container(
      width: 100.w,
      height: 100.w,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withValues(alpha: 0.2),
            AppColors.secondary.withValues(alpha: 0.2),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        shape: BoxShape.circle,
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.3),
          width: 2,
        ),
      ),
      child: Icon(
        Icons.sms,
        size: 48.sp,
        color: AppColors.primary,
      ),
    ).animate().scale(duration: 500.ms, curve: Curves.elasticOut);
  }

  Widget _buildTitle() {
    return Text(
      'Введите код подтверждения',
      style: TextStyle(
        color: Colors.white,
        fontSize: 24.sp,
        fontWeight: FontWeight.bold,
      ),
      textAlign: TextAlign.center,
    ).animate().fadeIn(duration: 500.ms, delay: 200.ms).slideY(
      begin: 0.2,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildDescription() {
    return Column(
      children: [
        Text(
          'Мы отправили SMS с кодом подтверждения на номер',
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.8),
            fontSize: 14.sp,
          ),
          textAlign: TextAlign.center,
        ),
        SizedBox(height: 4.h),
        Text(
          widget.phoneNumber,
          style: TextStyle(
            color: AppColors.primary,
            fontSize: 16.sp,
            fontWeight: FontWeight.w600,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    ).animate().fadeIn(duration: 500.ms, delay: 400.ms).slideY(
      begin: 0.2,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildCodeInput() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: List.generate(6, (index) {
        return Container(
          width: 50.w,
          height: 50.w,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(12.r),
            border: Border.all(
              color: _focusNodes[index].hasFocus 
                ? AppColors.primary 
                : Colors.white.withValues(alpha: 0.2),
              width: 2,
            ),
          ),
          child: TextField(
            controller: _controllers[index],
            focusNode: _focusNodes[index],
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white,
              fontSize: 24.sp,
              fontWeight: FontWeight.bold,
            ),
            keyboardType: TextInputType.number,
            maxLength: 1,
            decoration: const InputDecoration(
              counterText: '',
              border: InputBorder.none,
            ),
            onChanged: (value) {
              if (value.isNotEmpty) {
                if (index < 5) {
                  _focusNodes[index + 1].requestFocus();
                } else {
                  _focusNodes[index].unfocus();
                  _verifyCode();
                }
              } else if (value.isEmpty && index > 0) {
                _focusNodes[index - 1].requestFocus();
              }
            },
          ),
        ).animate().fadeIn(duration: 300.ms, delay: (600 + index * 100).ms).slideY(
          begin: 0.3,
          end: 0,
          curve: Curves.easeOut,
        );
      }),
    );
  }

  Widget _buildVerifyButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _verifyCode,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: EdgeInsets.symmetric(vertical: 16.h),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.r),
          ),
        ),
        child: Text(
          'Подтвердить',
          style: TextStyle(
            fontSize: 16.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    ).animate().fadeIn(duration: 500.ms, delay: 1000.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildResendSection() {
    return Column(
      children: [
        Text(
          'Не получили код?',
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.7),
            fontSize: 14.sp,
          ),
        ),
        SizedBox(height: 8.h),
        TextButton(
          onPressed: _resendCountdown > 0 ? null : _resendCode,
          child: Text(
            _resendCountdown > 0 
              ? 'Отправить повторно через $_resendCountdown с'
              : 'Отправить повторно',
            style: TextStyle(
              color: _resendCountdown > 0 
                ? Colors.white.withValues(alpha: 0.5)
                : AppColors.primary,
              fontSize: 14.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    ).animate().fadeIn(duration: 500.ms, delay: 1200.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildVerifyingState() {
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
            'Проверяем код...',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Пожалуйста, подождите',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.7),
              fontSize: 14.sp,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _verifyCode() async {
    final code = _controllers.map((controller) => controller.text).join();
    
    if (code.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Введите полный код'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    
    setState(() {
      _isVerifying = true;
    });
    
    try {
      // ✅ РЕАЛЬНАЯ ПРОВЕРКА ЧЕРЕЗ API
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.verifySmsCode(widget.phoneNumber, code);
      
      if (mounted) {
        if (response.success && response.data != null) {
          // Токен уже сохранен в apiService
          // ref.read(authProvider.notifier).setUser(response.data!.user);
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message ?? 'Номер успешно подтвержден!'),
              backgroundColor: Colors.green,
            ),
          );
          
          // Переходим к следующему экрану
          Navigator.pushReplacementNamed(context, '/home');
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message ?? 'Неверный код'),
              backgroundColor: Colors.red,
            ),
          );
        }
        
        setState(() {
          _isVerifying = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка верификации: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
        setState(() {
          _isVerifying = false;
        });
      }
    }
  }

  Future<void> _resendCode() async {
    try {
      // ✅ РЕАЛЬНАЯ ОТПРАВКА КОДА ЧЕРЕЗ API
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.sendSmsCode(widget.phoneNumber);
      
      if (mounted) {
        if (response.success) {
          setState(() {
            _resendCountdown = 60;
          });
          
          // Очищаем поля
          for (var controller in _controllers) {
            controller.clear();
          }
          _focusNodes[0].requestFocus();
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message ?? 'Новый код отправлен!'),
              backgroundColor: Colors.green,
            ),
          );
          
          _startCountdown();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message ?? 'Ошибка отправки кода'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _startCountdown() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        setState(() {
          _resendCountdown--;
        });
        return _resendCountdown > 0;
      }
      return false;
    });
  }
}
