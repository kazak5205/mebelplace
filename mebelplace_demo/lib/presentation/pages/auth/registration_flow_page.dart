import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/datasources/api_service.dart';
import '../../providers/app_providers.dart';
import '../../providers/repository_providers.dart';

class RegistrationFlowPage extends ConsumerStatefulWidget {
  final String role; // 'client' or 'master'

  const RegistrationFlowPage({super.key, required this.role});

  @override
  ConsumerState<RegistrationFlowPage> createState() =>
      _RegistrationFlowPageState();
}

class _RegistrationFlowPageState extends ConsumerState<RegistrationFlowPage>
    with SingleTickerProviderStateMixin {
  final PageController _pageController = PageController();
  int _currentStep = 0;

  // Controllers
  final _phoneController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _smsCodeController = TextEditingController();
  final _companyNameController = TextEditingController();

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  bool _isLoading = false;
  bool _showPassword = false;
  bool _showConfirmPassword = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _phoneController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _smsCodeController.dispose();
    _companyNameController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.dark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () {
            if (_currentStep > 0) {
              _goToPreviousStep();
            } else {
              Navigator.pop(context);
            }
          },
        ),
        title: Text(
          widget.role == 'client' ? 'Регистрация клиента' : 'Регистрация мастера',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: Column(
        children: [
          // Progress indicator
          _buildProgressIndicator(),
          
          SizedBox(height: 24.h),
          
          // Content
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              onPageChanged: (index) {
                setState(() {
                  _currentStep = index;
                });
              },
              children: [
                _buildRegistrationFormStep(),
                _buildSmsCodeStep(),
                if (widget.role == 'master') _buildCompanyNameStep(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressIndicator() {
    // Для мастера 3 шага, для клиента 2
    final totalSteps = widget.role == 'master' ? 3 : 2;
    
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 24.w),
      child: Row(
        children: List.generate(totalSteps, (index) {
          final isActive = index <= _currentStep;
          final isCompleted = index < _currentStep;
          
          return Expanded(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              height: 4.h,
              margin: EdgeInsets.symmetric(horizontal: 4.w),
              decoration: BoxDecoration(
                gradient: isActive
                    ? const LinearGradient(
                        colors: [AppColors.primary, AppColors.secondary],
                      )
                    : null,
                color: isActive ? null : Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(2.r),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildRegistrationFormStep() {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 24.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Регистрация',
              style: TextStyle(
                fontSize: 28.sp,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 12.h),
            Text(
              'Заполните данные для создания аккаунта',
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.white.withOpacity(0.6),
              ),
            ),
            SizedBox(height: 32.h),
            
            // Phone input
            Text(
              'Номер телефона *',
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.white,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 8.h),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              style: TextStyle(
                color: Colors.white,
                fontSize: 16.sp,
              ),
              decoration: InputDecoration(
                hintText: '+7 (___) ___-__-__',
                hintStyle: TextStyle(
                  color: Colors.white.withOpacity(0.3),
                ),
                prefixIcon: Icon(
                  Icons.phone_outlined,
                  color: AppColors.primary,
                  size: 24.sp,
                ),
                filled: true,
                fillColor: Colors.white.withOpacity(0.1),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16.r),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16.r),
                  borderSide: BorderSide(
                    color: Colors.white.withOpacity(0.1),
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16.r),
                  borderSide: const BorderSide(
                    color: AppColors.primary,
                    width: 2,
                  ),
                ),
              ),
            ),
            
            SizedBox(height: 20.h),
            
            // Username input
            Text(
              'Имя пользователя *',
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.white,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 8.h),
            TextField(
              controller: _usernameController,
              style: TextStyle(
                color: Colors.white,
                fontSize: 16.sp,
              ),
              decoration: InputDecoration(
                hintText: 'username',
                hintStyle: TextStyle(
                  color: Colors.white.withOpacity(0.3),
                ),
                prefixIcon: Icon(
                  Icons.person_outline,
                  color: AppColors.primary,
                  size: 24.sp,
                ),
                filled: true,
                fillColor: Colors.white.withOpacity(0.1),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16.r),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16.r),
                  borderSide: BorderSide(
                    color: Colors.white.withOpacity(0.1),
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16.r),
                  borderSide: const BorderSide(
                    color: AppColors.primary,
                    width: 2,
                  ),
                ),
              ),
            ),
            
            SizedBox(height: 20.h),
            
            // Password input
            Text(
              'Пароль *',
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.white,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 8.h),
            TextField(
              controller: _passwordController,
              obscureText: !_showPassword,
              style: TextStyle(
                color: Colors.white,
                fontSize: 16.sp,
              ),
              decoration: InputDecoration(
                hintText: 'Минимум 6 символов',
                hintStyle: TextStyle(
                  color: Colors.white.withOpacity(0.3),
                ),
                prefixIcon: Icon(
                  Icons.lock_outline,
                  color: AppColors.primary,
                  size: 24.sp,
                ),
                suffixIcon: IconButton(
                  icon: Icon(
                    _showPassword ? Icons.visibility_off : Icons.visibility,
                    color: Colors.white.withOpacity(0.5),
                    size: 24.sp,
                  ),
                  onPressed: () {
                    setState(() {
                      _showPassword = !_showPassword;
                    });
                  },
                ),
                filled: true,
                fillColor: Colors.white.withOpacity(0.1),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16.r),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16.r),
                  borderSide: BorderSide(
                    color: Colors.white.withOpacity(0.1),
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16.r),
                  borderSide: const BorderSide(
                    color: AppColors.primary,
                    width: 2,
                  ),
                ),
              ),
            ),
            
            SizedBox(height: 20.h),
            
            // Confirm Password input
            Text(
              'Подтвердите пароль *',
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.white,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 8.h),
            TextField(
              controller: _confirmPasswordController,
              obscureText: !_showConfirmPassword,
              style: TextStyle(
                color: Colors.white,
                fontSize: 16.sp,
              ),
              decoration: InputDecoration(
                hintText: 'Повторите пароль',
                hintStyle: TextStyle(
                  color: Colors.white.withOpacity(0.3),
                ),
                prefixIcon: Icon(
                  Icons.lock_outline,
                  color: AppColors.primary,
                  size: 24.sp,
                ),
                suffixIcon: IconButton(
                  icon: Icon(
                    _showConfirmPassword ? Icons.visibility_off : Icons.visibility,
                    color: Colors.white.withOpacity(0.5),
                    size: 24.sp,
                  ),
                  onPressed: () {
                    setState(() {
                      _showConfirmPassword = !_showConfirmPassword;
                    });
                  },
                ),
                filled: true,
                fillColor: Colors.white.withOpacity(0.1),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16.r),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16.r),
                  borderSide: BorderSide(
                    color: Colors.white.withOpacity(0.1),
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16.r),
                  borderSide: const BorderSide(
                    color: AppColors.primary,
                    width: 2,
                  ),
                ),
              ),
            ),
            
            SizedBox(height: 40.h),
            
            // Continue button
            _buildContinueButton(
              text: 'Продолжить',
              onPressed: _sendSmsCode,
            ),
            
            SizedBox(height: 24.h),
          ],
        ),
      ),
    );
  }

  Widget _buildSmsCodeStep() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 24.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Код подтверждения',
            style: TextStyle(
              fontSize: 28.sp,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          SizedBox(height: 12.h),
          Text(
            'Введите 6-значный код, отправленный на ${_phoneController.text}',
            style: TextStyle(
              fontSize: 14.sp,
              color: Colors.white.withOpacity(0.6),
            ),
          ),
          SizedBox(height: 40.h),
          
          // SMS Code input
          TextField(
            controller: _smsCodeController,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            maxLength: 6,
            style: TextStyle(
              color: Colors.white,
              fontSize: 32.sp,
              fontWeight: FontWeight.bold,
              letterSpacing: 16.w,
            ),
            decoration: InputDecoration(
              counterText: '',
              hintText: '- - - - - -',
              hintStyle: TextStyle(
                color: Colors.white.withOpacity(0.3),
                letterSpacing: 16.w,
              ),
              filled: true,
              fillColor: Colors.white.withOpacity(0.1),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16.r),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16.r),
                borderSide: BorderSide(
                  color: Colors.white.withOpacity(0.1),
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16.r),
                borderSide: const BorderSide(
                  color: AppColors.primary,
                  width: 2,
                ),
              ),
            ),
          ),
          
          SizedBox(height: 24.h),
          
          // Resend button
          Center(
            child: TextButton(
              onPressed: _sendSmsCode,
              child: Text(
                'Отправить код повторно',
                style: TextStyle(
                  color: AppColors.primary,
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
          
          const Spacer(),
          
          // Continue button
          _buildContinueButton(
            text: 'Подтвердить',
            onPressed: _verifySmsCode,
          ),
          
          SizedBox(height: 24.h),
        ],
      ),
    );
  }

  Widget _buildCompanyNameStep() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 24.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Название компании',
            style: TextStyle(
              fontSize: 28.sp,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          SizedBox(height: 12.h),
          Text(
            'Как будет называться ваша мебельная компания?',
            style: TextStyle(
              fontSize: 14.sp,
              color: Colors.white.withOpacity(0.6),
            ),
          ),
          SizedBox(height: 40.h),
          
          // Company Name input
          TextField(
            controller: _companyNameController,
            style: TextStyle(
              color: Colors.white,
              fontSize: 16.sp,
            ),
            decoration: InputDecoration(
              hintText: 'Название компании',
              hintStyle: TextStyle(
                color: Colors.white.withOpacity(0.3),
              ),
              prefixIcon: Icon(
                Icons.business_outlined,
                color: AppColors.primary,
                size: 24.sp,
              ),
              filled: true,
              fillColor: Colors.white.withOpacity(0.1),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16.r),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16.r),
                borderSide: BorderSide(
                  color: Colors.white.withOpacity(0.1),
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16.r),
                borderSide: const BorderSide(
                  color: AppColors.primary,
                  width: 2,
                ),
              ),
            ),
          ),
          
          const Spacer(),
          
          // Complete button
          _buildContinueButton(
            text: 'Завершить регистрацию',
            onPressed: _completeRegistration,
          ),
          
          SizedBox(height: 24.h),
        ],
      ),
    );
  }

  Widget _buildContinueButton({
    required String text,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 56.h,
      child: ElevatedButton(
        onPressed: _isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16.r),
          ),
        ),
        child: Ink(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primary, AppColors.secondary],
            ),
            borderRadius: BorderRadius.circular(16.r),
          ),
          child: Container(
            alignment: Alignment.center,
            child: _isLoading
                ? SizedBox(
                    width: 24.w,
                    height: 24.w,
                    child: const CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                : Text(
                    text,
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
          ),
        ),
      ),
    );
  }

  void _goToPreviousStep() {
    if (_currentStep > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _goToNextStep() {
    if (_currentStep < 2) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _sendSmsCode() async {
    // Валидация всех полей
    if (_phoneController.text.isEmpty) {
      _showError('Введите номер телефона');
      return;
    }
    
    if (_usernameController.text.isEmpty) {
      _showError('Введите имя пользователя');
      return;
    }
    
    if (_passwordController.text.isEmpty) {
      _showError('Введите пароль');
      return;
    }
    
    if (_passwordController.text.length < 6) {
      _showError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    if (_passwordController.text != _confirmPasswordController.text) {
      _showError('Пароли не совпадают');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.sendSmsCode(_phoneController.text.trim());
      
      if (mounted) {
        if (response.success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message ?? 'SMS код отправлен'),
              backgroundColor: Colors.green,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
            ),
          );
          
          _goToNextStep();
        } else {
          _showError(response.message ?? 'Ошибка отправки SMS');
        }
      }
    } catch (e) {
      _showError('Ошибка отправки SMS: ${e.toString()}');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _verifySmsCode() async {
    if (_smsCodeController.text.length < 6) {
      _showError('Введите код из SMS');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.verifySmsCode(
        _phoneController.text.trim(),
        _smsCodeController.text.trim(),
      );
      
      if (mounted) {
        if (response.success) {
          // Для клиента сразу регистрируем, для мастера идем на след. шаг
          if (widget.role == 'client') {
            await _completeRegistration();
          } else {
            _goToNextStep(); // Мастер идет на шаг "Название компании"
          }
        } else {
          _showError(response.message ?? 'Неверный код');
        }
      }
    } catch (e) {
      _showError('Ошибка проверки кода: ${e.toString()}');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _completeRegistration() async {
    // Для мастера проверяем название компании
    if (widget.role == 'master' && _companyNameController.text.isEmpty) {
      _showError('Введите название компании');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final apiService = ref.read(apiServiceProvider);
      
      final phone = _phoneController.text.trim();
      final username = _usernameController.text.trim();
      final password = _passwordController.text.trim();
      final role = widget.role == 'client' ? 'user' : 'master';
      final companyName = widget.role == 'master' ? _companyNameController.text.trim() : null;
      
      // Регистрация через API
      final response = await apiService.register(
        RegisterRequest(
          phone: phone,
          username: username,
          password: password,
          role: role,
          companyName: companyName,
        ),
      );
      
      if (mounted) {
        final token = response.data?.accessToken ?? response.data?.token;
        if (response.success && response.data != null && token != null) {
          // Сохраняем токен и пользователя
          await ref.read(authProvider.notifier).setAuthData(
            response.data!.user,
            token,
          );
          
          // Переход на главный экран
          Navigator.of(context).pushNamedAndRemoveUntil(
            '/home',
            (route) => false,
          );
        } else {
          _showError(response.message ?? 'Ошибка регистрации');
        }
      }
    } catch (e) {
      _showError('Ошибка регистрации: ${e.toString()}');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.r),
        ),
      ),
    );
  }
}

