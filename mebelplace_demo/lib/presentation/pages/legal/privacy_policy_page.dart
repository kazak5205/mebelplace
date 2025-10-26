import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_theme.dart';

class PrivacyPolicyPage extends ConsumerStatefulWidget {
  const PrivacyPolicyPage({super.key});

  @override
  ConsumerState<PrivacyPolicyPage> createState() => _PrivacyPolicyPageState();
}

class _PrivacyPolicyPageState extends ConsumerState<PrivacyPolicyPage> {
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
          'Политика конфиденциальности',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Заголовок
            _buildHeader(),
            
            SizedBox(height: 24.h),
            
            // Содержание
            _buildContent(),
            
            SizedBox(height: 40.h),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
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
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Icon(
            Icons.privacy_tip,
            size: 48.sp,
            color: AppColors.primary,
          ),
          SizedBox(height: 16.h),
          Text(
            'Политика конфиденциальности',
            style: TextStyle(
              color: Colors.white,
              fontSize: 24.sp,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 8.h),
          Text(
            'Последнее обновление: ${_getCurrentDate()}',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.7),
              fontSize: 14.sp,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildContent() {
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
          _buildSection(
            '1. Общие положения',
            'Настоящая Политика конфиденциальности определяет порядок обработки персональных данных пользователей мобильного приложения MebelPlace (далее - "Приложение").\n\nИспользуя наше Приложение, вы соглашаетесь с условиями настоящей Политики конфиденциальности.',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '2. Сбор персональных данных',
            'Мы собираем следующие типы персональных данных:\n\n• Имя и контактная информация (телефон, email)\n• Информация о профиле (фото, описание)\n• Данные о заказах и услугах\n• Информация о местоположении (при необходимости)\n• Данные об использовании Приложения',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '3. Использование персональных данных',
            'Ваши персональные данные используются для:\n\n• Предоставления услуг платформы\n• Связи между заказчиками и мастерами\n• Улучшения качества сервиса\n• Обработки платежей\n• Предотвращения мошенничества',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '4. Передача данных третьим лицам',
            'Мы не продаем и не передаем ваши персональные данные третьим лицам, за исключением случаев:\n\n• Получения вашего явного согласия\n• Требований законодательства\n• Необходимости для предоставления услуг\n• Защиты наших прав и интересов',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '5. Безопасность данных',
            'Мы принимаем все необходимые меры для защиты ваших персональных данных:\n\n• Шифрование данных при передаче\n• Ограниченный доступ к данным\n• Регулярное обновление систем безопасности\n• Мониторинг несанкционированного доступа',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '6. Ваши права',
            'Вы имеете право:\n\n• Получать информацию о ваших данных\n• Требовать исправления неточных данных\n• Запрашивать удаление ваших данных\n• Ограничивать обработку данных\n• Отзывать согласие на обработку',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '7. Cookies и аналогичные технологии',
            'Наше Приложение может использовать:\n\n• Локальное хранение данных\n• Аналитические инструменты\n• Технологии для улучшения пользовательского опыта\n\nВы можете управлять этими настройками в параметрах Приложения.',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '8. Изменения в Политике',
            'Мы можем обновлять настоящую Политику конфиденциальности. О существенных изменениях мы уведомим вас через Приложение или по электронной почте.\n\nПродолжение использования Приложения после внесения изменений означает ваше согласие с обновленной Политикой.',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '9. Контактная информация',
            'Если у вас есть вопросы по настоящей Политике конфиденциальности, обращайтесь к нам:\n\n• Email: privacy@mebelplace.com.kz\n• Телефон: +7 (777) 123-45-67\n• Адрес: г. Алматы, ул. Абая 150',
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms, delay: 200.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildSection(String title, String content) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            color: AppColors.primary,
            fontSize: 16.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 12.h),
        Text(
          content,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.9),
            fontSize: 14.sp,
            height: 1.5,
          ),
        ),
      ],
    );
  }

  String _getCurrentDate() {
    final now = DateTime.now();
    return '${now.day}.${now.month}.${now.year}';
  }
}
